# Contract: GET /api/mock/timelines

Purpose: Provide mock timeline blocks with deterministic pseudo-random values.

## Request
- Method: GET
- Query Params: `range` optional (default LAST_30_DAYS) – only LAST_30_DAYS supported now.

## Response (200)
```json
{
  "blocks": [
    {
      "id": "spend-trend",
      "title": "Spend Trend",
      "metricType": "Spend",
      "timeRange": "LAST_30_DAYS",
      "dataPoints": [ { "timestamp": 1725667200000, "value": 123.45 } ],
      "disclaimerFlag": true
    }
  ]
}
```

## Error Cases
- 400: Unsupported range value.
- 500: Generation failure (should be extraordinarily rare); fallback to empty `blocks: []`.

## Notes
- Values deterministic per day seed.
- All values illustrative only; not tied to tenant.
