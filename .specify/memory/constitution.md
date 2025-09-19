# Blocks Constitution

> Living principles powering the Blocks MVP (see `blocks_mvp_spec.md`). This file is the canonical lightweight memory for decision alignment.

## Core Principles

### I. Outcome Over Features
Ship only what advances the 20% net savings proof, trust, or adoption; every backlog item must cite the KPI or an enabling principle.

### II. Trace Every Number
All surfaced costs, projections, and savings link back to reproducible data sources (CUR partition or Athena query) — zero opaque math.

### III. Explainability First (AI)
Major Tom must reference underlying datasets or explicitly state uncertainty; no fabricated or unqualified figures.

### IV. Tenant Isolation by Design
Every API/data access path asserts tenant context and rejects ambiguous scope; isolation failures are Sev-1.

### V. Automate Recurrence, Not Judgment
Ingestion, enrichment, and projections are scheduled; financial commitment actions (SP purchases) retain human approval until reliability thresholds met.

### VI. Performance Budgeted
Maintain P95 page TTI <3.5s and API <600ms for cached aggregates; performance regressions block deploys unless exception documented.

### VII. Frugality with Leverage
Prefer serverless/North Star services (Athena, DynamoDB, EventBridge) before custom infra; add complexity only after measured need.

### VIII. Fail Loud, Not Silent
Missing data or ingestion lag must surface user-facing banners + internal alerts instead of silently skewing projections.

### IX. Bias to Learning
Favor iterative weekly increments (stub → functional → instrumented) over large hidden branches; experiments > debates when uncertain.

### X. Deterministic & Idempotent Data Flows
Re-running ETL produces stable outputs; all derived aggregates versioned by schema/content hash.

## Engineering & Operational Standards

### Security & Privacy
- Least privilege role separation: read vs. analyze vs. purchase.
- Minimum PII: only auth essentials; cost data devoid of personal identifiers.
- Encryption in transit + at rest default; secrets managed via parameter/secrets stores, never hard-coded.

### Data & Recommendations
- CUR is canonical hourly source; Cost Explorer supplements gaps/coverage metrics.
- Each recommendation stores rationale + expected savings + link to underlying metric slice.
- Projection engine initially applies flat contractual discount; future SP optimization layered transparently.

### AI Assistant (Major Tom)
- Responses carry structured reference IDs (aggregates, rec IDs, query handles).
- Rate limiting per tenant to prevent abuse/resource starvation.
- No autonomous infrastructure or purchase actions in MVP scope.

### Observability
- Structured logs with correlation IDs (tenant, request, job ID).
- Metrics: ingestion lag, recommendation freshness age, projection latency, chat first-token latency.
- Alarms on: ingestion >1 partition interval delay, cross-tenant access attempt, chat error spike, SP analyzer failure.

### Performance & Cost
- Cache stable aggregates (hour/day) in DynamoDB; bypass cache for volatile near-real-time windows with clear TTL.
- Track CloudFront/Lambda@Edge costs vs. usage; add optimization only after threshold triggers (document threshold).

### Delivery Workflow
- Contract-first: define Zod schema + interface notes before UI binding.
- PRs require: principle reference, test coverage for new logic branches, and observability notes if adding a pipeline.
- Weekly demo cadence; skipped demo requires written exception.

## Workflow & Quality Gates

### Development Flow
1. Define problem → cite principle(s).
2. Add/adjust schema & contract tests (where applicable).
3. Implement minimal solution instrumented for measurement.
4. Demo & collect metrics.
5. Iterate or retire experiment.

### Testing Requirements
- Unit: Core transformation & projection logic (happy + edge cases).
- Idempotence Tests: Re-run sample ingest to assert no drift.
- Contract Tests: API shape vs. Zod definitions.
- AI Response Tests: Lint for presence of reference IDs in fixture prompts.

### Release Gates
- All high-priority alarms green or documented exception.
- Performance budgets met (automated check pipeline).
- Security scan (dependencies & IaC) passes or approved risk note.

## Governance
Constitution supersedes ad-hoc preferences. Amendments use PR with label `constitution` including: rationale, impacted principle(s), migration/communication plan, success metric adjustment if relevant.

### Amendment Rules
- Minor wording/clarity: single lead approval (Product or Engineering).
- New / Removed Principle: dual approval (Product + Engineering) + version bump minor.
- Structural Reframe (grouping overhaul or >25% content change): version bump major with change log.

### Compliance Mechanisms
- PR template includes required "Principle Referenced" field.
- Quarterly audit: sample 5 recent features for traceability to principles.
- Violations trigger remediation issue tagged `principle-drift`.

**Version**: 0.1.0 | **Ratified**: 2025-09-19 | **Last Amended**: 2025-09-19

<!-- End of Blocks Constitution v0.1.0 -->