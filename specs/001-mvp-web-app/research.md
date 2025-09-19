# Research & Decisions (Phase 0)

This document records Phase 0 research outputs resolving unknowns prior to design & contract finalization.

## Decision Log

### 1. Infrastructure as Code (IaC)
**Decision**: Use AWS CDK (TypeScript) for initial stacks (CloudFront/OpenNext distribution, API Gateway + Lambda functions, DynamoDB tables, EventBridge schedules).  
**Rationale**: Aligns with TypeScript codebase; rapid iteration; strong construct ecosystem; integrates with future higher-level patterns.  
**Alternatives**: Terraform (broader multi-cloud portability) – deferred due to slower iteration & overhead for early MVP; SAM – narrower focus and less ergonomic for multi-resource relationships.  
**Risks**: Potential CDK synthesis complexity; mitigate by modular stack boundaries (frontend infra vs data infra vs ingestion jobs).  

### 2. Deployment Strategy (Web/App)
**Decision**: OpenNext build pipeline → CloudFront + S3 static assets + Lambda@Edge for SSR/stream; API functions deployed separately via API Gateway (regional).  
**Rationale**: Leverages serverless economics and global edge caching; isolates chat streaming path; reduces need for container orchestration at MVP.  
**Alternatives**: Elastic Beanstalk / ECS – heavier operational load; Vercel – vendor coupling & cost vs direct infra control.  
**Risk**: Cold start latency; mitigated by keeping critical lambdas lightweight and using provisioned concurrency selectively only if metrics indicate need.

### 3. Data Model Key Design (DynamoDB)
| Entity | PK | SK / Additional | GSIs |
|--------|----|-----------------|------|
| Tenant | TENANT#{tenantId} | METADATA | GSI1: (status) optional |
| Recommendation | TENANT#{tenantId} | REC#{recId} | GSI2: (status, tenantId) for status filtering |
| SpendAggregate Cache | TENANT#{tenantId} | HOUR#{isoHour}#{service}#{usageType} | GSI3: (service, tenantId) optional |
| SavingsProjection | TENANT#{tenantId} | PROJ#{period} | None initial |
| CommitmentState | TENANT#{tenantId} | COMMIT#{ts} | GSI4: (state, tenantId) |
| AuditEvent | TENANT#{tenantId} | AUDIT#{timestamp}#{eventType} | Time-ordered retrieval intrinsic |
| AssistantInteraction | TENANT#{tenantId} | CHAT#{interactionId} | GSI5: (timestamp, tenantId) |

**Rationale**: Tenant-prefixed PK ensures isolation (Principle: Tenant Isolation); sort key patterns enable chronological & category grouping. Minimal GSIs to start; incremental addition only upon proven query need (Frugality principle).  
**Risk**: Hot partitions if a single tenant has extreme volume; mitigated by service/usageType slicing in aggregates and potential sharding suffix if required later.

### 4. Ingestion Approach (Backfill + Incremental)
**Decision**: Hourly EventBridge rule triggers incremental Lambda ingestion; backfill orchestrated by on-demand job enumerating month/day partitions. De-dupe via idempotent Put with conditional expression on composite key.  
**Alternatives**: Glue ETL transformation pipeline – heavier complexity early.  
**Risk**: Throughput spikes during large backfill; mitigate by throttling hours-per-invoke & SQS fan-out for large tenants.

### 5. Athena Query Guardrails
**Decision**: Provide prepared parameterized templates (time range + dimension filters) with max scanned bytes check (e.g., abort if > 2GB estimated).  
**Rationale**: Cost control & predictable latency.  
**Risk**: False aborts for legitimate large queries; escalate with user instruction to refine filters.

### 6. Projection Engine (Initial)
**Decision**: Flat 20% discount applied to baseline aggregated cost; store both raw baseline and derived projected value with explicit delta.  
**Rationale**: Simplicity ensures explainability; future complexity layered without rewriting interface.

### 7. Recommendation Rules (v1)
**Decision**: Simple heuristics using aggregate usage patterns versus thresholds (e.g., sustained low utilization hours) and coverage comparisons for compute categories.  
**Rationale**: Achieve early actionable signals with minimal false positives; rule transparency maps to Trace Every Number principle.  
**Risk**: Limited precision; future ML or statistical smoothing possible.

### 8. Assistant Reference Enforcement
**Decision**: Middleware injects validation step that rejects responses lacking at least one `[REF:` token in non-empty answer body during dev/test; production logs missing references as warning.  
**Rationale**: Encourage discipline without blocking user in rare fallback edge cases.  
**Risk**: Over-constrained early stub; fallback path suppressed only in dev.

### 9. Streaming Strategy (Assistant)
**Decision**: Regional Lambda for streaming endpoint (lower complexity vs Edge for early iteration) while keeping static assets + page rendering at edge for latency.  
**Rationale**: Streaming benefits mainly from connection stability; edge cold starts risk complexity.  
**Alternative**: Edge runtime – revisit if latency SLO misses.

### 10. Mocking Strategy (Slice 1-2)
**Decision**: Backend endpoints return deterministic static JSON shaped like final contract; dataset fixtures live in `backend/src/fixtures/` and can be toggled with env flag `USE_MOCKS=1`.  
**Rationale**: Enables rapid frontend iteration & design validation pre-ingestion completion.  
**Risk**: Divergence risk; mitigation: contract tests fail if fixture schema drifts.

### 11. Logging & Correlation
**Decision**: Standard log envelope: `{ts, level, requestId, tenantId, component, msg, meta}`; correlation id passed via header `x-request-id` or generated.  
**Rationale**: Future-proof for central aggregation; consistent with Observability principle.  
**Risk**: Overhead minimal; JSON formatting deferred until slice 7.

### 12. Performance Measurement Early Hooks
**Decision**: Inject simple performance markers in frontend (ttfb, interactive ready) posted to a dev collector endpoint (mock) for early analysis; converts to real metrics pipeline later.  
**Rationale**: Catch regressions before complexity grows.

### 13. Accessibility Baseline
**Decision**: Enforce contrast via design token palette validation script; component tests check ARIA labels on interactive elements.  
**Risk**: Additional test overhead slight; payoff in reduced retrofits.

### 14. Mobile Strategy
**Decision**: Mobile-first layout pass for dashboard (single-column below md breakpoint), navigation collapsible drawer, responsive charts with aspect ratio container.  
**Rationale**: Guarantee early viability on mobile persona usage (Founder/CTO on-the-go).

### 15. Continuous Integration Enhancements Roadmap
**Decision**: Phase introduction – Phase A (lint/type/test), Phase B (contract drift check), Phase C (optional performance smoke) executing sequentially; only Phase A blocking slice 1.

## Open Revisit Items (Post-Slice 2)
- Evaluate need for secondary GSI for cross-tenant internal reporting (InternalAdmin usage).  
- Consider introduction of caching layer TTL heuristics after observing query patterns.  
- Explore cost-based query planner wrapper if Athena cost spikes.  

## Summary
All significant unknowns converted to explicit, reversible decisions with rationale. No constitutional violations introduced. Ready for Phase 1 design artifacts.
