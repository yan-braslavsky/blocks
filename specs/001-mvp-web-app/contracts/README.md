# API Contracts (Phase 1)

All responses JSON with `application/json; charset=utf-8` unless streaming (assistant).
Identifiers & tenant context derived from authenticated session (mocked in early slices).

## Common Error Shape
```
{
  "error": {
    "code": "string",      // machine readable
    "message": "string",   // user-facing
    "hint": "string?"      // optional remediation
  }
}
```

## Pagination (Not used MVP v1)
All list responses currently bounded; pagination extension reserved.

---

## GET /spend
Retrieve aggregated spend for selected filters/time range.

Query Params:
- `timeRange` enum(`day`,`week`,`month`,`ytd`)
- `accountScope?`
- `service?`
- `granularity` enum(`hour`,`day`)

Response 200:
```
{
  "tenantId": "uuid",
  "timeRange": "month",
  "currency": "USD",
  "granularity": "day",
  "series": [
    { "ts": "2025-09-15T00:00:00Z", "costMinor": 123450, "projectedCostMinor": 98760 },
    { "ts": "2025-09-16T00:00:00Z", "costMinor": 100000, "projectedCostMinor": 80000 }
  ],
  "totals": { "baselineMinor": 223450, "projectedMinor": 178760, "deltaPct": 0.20 },
  "meta": { "missingIntervalsPct": 0 }
}
```

---
## GET /projection
Summary baseline vs projected spend.

Query Params:
- `period` enum(`day`,`week`,`month`,`ytd`)

Response 200:
```
{
  "tenantId": "uuid",
  "period": "month",
  "baselineMinor": 5000000,
  "projectedMinor": 4000000,
  "deltaPct": 0.20,
  "generatedAt": "2025-09-19T10:20:00Z"
}
```

---
## GET /recommendations
List optimization recommendations.

Query Params:
- `status?` enum(`new`,`acknowledged`,`actioned`,`archived`)
- `category?` enum(`rightsizing`,`commitment`,`idle`)

Response 200:
```
{
  "tenantId": "uuid",
  "items": [
    {
      "id": "uuid-rec-1",
      "category": "rightsizing",
      "status": "new",
      "rationale": "Instance family m5.large under 15% utilization for 14 days",
      "expectedSavingsMinor": 120000,
      "metricRefs": ["agg:2025-09-18T10","agg:2025-09-18T11"],
      "createdAt": "2025-09-19T09:00:00Z",
      "updatedAt": "2025-09-19T09:00:00Z"
    }
  ]
}
```

---
## POST /assistant/query (stream)
Request body:
```
{ "prompt": "Where are we saving money this month?" }
```

Streaming Frames (text/event-stream or chunked):
```
{ "type": "start", "id": "interaction-id" }
{ "type": "token", "value": "Savings" }
{ "type": "token", "value": " concentrated" }
{ "type": "token", "value": " in EC2." }
{ "type": "final", "references": ["agg:2025-09-19T10","rec:uuid-rec-1"] }
```

Non-stream MOCK 200 (fallback for early local dev):
```
{
  "interactionId": "uuid-chat-1",
  "response": "Top savings from EC2 commitment coverage improvements. [REF:agg:2025-09-19T10] [REF:rec:uuid-rec-1]",
  "references": ["agg:2025-09-19T10","rec:uuid-rec-1"],
  "firstTokenLatencyMs": 120
}
```

---
## POST /connection/test
Request body:
```
{ "roleArn": "arn:aws:iam::123456789012:role/BlocksReadRole", "externalId": "abc-12345" }
```
Response 200 (validated):
```
{ "status": "validated", "checks": [ {"id": "assumeRole", "ok": true}, {"id": "s3Access", "ok": true} ] }
```
Response 200 (error example):
```
{ "status": "error", "checks": [ {"id": "assumeRole", "ok": false, "message": "AccessDenied"} ] }
```

---
## POST /tenant/setup
Request body:
```
{ "name": "Acme Corp" }
```
Response 201:
```
{ "tenantId": "uuid", "name": "Acme Corp", "connectionStatus": "unconfigured" }
```

---
## Status Codes Summary
| Endpoint | Success Codes | Error Codes |
|----------|---------------|-------------|
| GET /spend | 200 | 400 (bad filters) |
| GET /projection | 200 | 400 |
| GET /recommendations | 200 | 400 |
| POST /assistant/query | 200 | 400, 429 (future), 500 |
| POST /connection/test | 200 | 400 |
| POST /tenant/setup | 201 | 400, 409 (name conflict future) |

---
## Contract Test Focus
- Schema validation vs. Zod definitions (to be created in implementation phase).
- Negative cases: invalid enum, missing prompt, invalid ARN pattern, unsupported status filter.
