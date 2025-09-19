# Principle Metrics Mapping (v0.1)

| Principle | Primary Metric | Collection Method | Target / Threshold | Review Cadence |
|-----------|----------------|-------------------|--------------------|----------------|
| Outcome Over Features | % delivered items w/ KPI linkage | Sprint review tagging | >90% | Bi-weekly |
| Trace Every Number | Aggregates w/ "View Query" link | UI audit script / spot check | 100% | Weekly |
| Explainability First | AI responses w/ reference IDs | Response schema logging | >95% | Weekly |
| Tenant Isolation by Design | Cross-tenant access incidents | Security alert log | 0 | Continuous |
| Automate Recurrence, Not Judgment | Automated vs. manual action ratio (expected domains) | Job registry | 100% automation for ingest/projection | Monthly |
| Performance Budgeted | P95 TTI / API latency | Synthetic + RUM dashboards | <3.5s / <600ms | Continuous |
| Frugality with Leverage | Infra cost / active tenant | Cost allocation tagging | Trending flat or ↓ per tenant | Monthly |
| Fail Loud, Not Silent | Mean detection time ingestion lag | CloudWatch alarm events | <10m | Weekly |
| Bias to Learning | Weeks with demo delivered | Demo calendar | 100% (no skip w/o exception) | Weekly |
| Deterministic & Idempotent Data Flows | Drift events after re-run | Hash comparison logs | 0 | Monthly |

## Additional Supporting Metrics
- Recommendation Freshness Age (max hours since last recompute)
- Chat First Token Latency (p95)
- SP Analyzer Accuracy (projected vs actual utilization ± tolerance)

## Ownership
Each metric must have an owner recorded in internal ops tooling by v0.2.

## Escalation Triggers
- Two consecutive breaches → create remediation issue labeled `principle-drift`.
- Three or more simultaneous breaches → architecture review session scheduled within 5 days.
