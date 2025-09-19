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
- **Per-Task PRs**: Individual pull requests for each task (T012, T013, etc.) with focused scope and validation.
- PRs require: principle reference, test coverage for new logic branches, observability notes if adding a pipeline, **and browser validation screenshots**.
- **Quality Gates**: Playwright tests passing + console error-free + local browser validation before PR merge.
- Weekly demo cadence; skipped demo requires written exception.

## Workflow & Quality Gates

### Task-Level Development Workflow
1. **Pull Request Creation**: Create individual PR for each task implementation (granular scope).
2. **Test-First Implementation**: Write failing contract/unit tests, then implement to make them pass.
3. **Local Browser Validation**: Run feature in VS Code's built-in browser to verify functionality.
4. **Console Error Resolution**: Address all Next.js dev server warnings and browser console errors.
5. **Playwright E2E Testing**: Execute user journey tests to validate end-to-end functionality.
6. **Pre-Handover Verification**: Ensure all validation steps pass before marking task complete.
7. **Documentation**: Update task progress and include validation screenshots in PR.

### Development Flow
1. **Task-Level Pull Requests**: Create a separate pull request for each individual task implementation (T012, T013, etc.).
2. Define problem → cite principle(s).
3. Add/adjust schema & contract tests (where applicable).
4. Implement minimal solution instrumented for measurement.
5. **Local Browser Validation**: Run implementation in local VS Code browser to verify no console errors.
6. **End-to-End Testing**: Execute Playwright acceptance tests to validate user perspective functionality.
7. **Console Clean-up**: Address all warnings and errors from Next.js dev server console before completion.
8. Demo & collect metrics.
9. Iterate or retire experiment.

### Testing Requirements
- **Test-Driven Development**: Write failing tests before implementation (contract tests, unit tests).
- **Behavior-Driven Development**: Acceptance criteria validated through Playwright user journey tests.
- Unit: Core transformation & projection logic (happy + edge cases).
- Idempotence Tests: Re-run sample ingest to assert no drift.
- Contract Tests: API shape vs. Zod definitions.
- **Playwright E2E Tests**: User workflow validation for each feature implementation.
- AI Response Tests: Lint for presence of reference IDs in fixture prompts.
- **Pre-Completion Verification**: All tests passing + browser validation + console clean before task handover.

### Release Gates
- **Task Completion Verification**: Each task must pass local browser testing + Playwright validation + console error resolution.
- All high-priority alarms green or documented exception.
- Performance budgets met (automated check pipeline).
- Security scan (dependencies & IaC) passes or approved risk note.
- **Quality Assurance**: No Next.js console warnings or errors before task handover.

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

**Version**: 0.2.0 | **Ratified**: 2025-09-19 | **Last Amended**: 2025-09-19

### Recent Amendments (v0.2.0)
- **Enhanced Development Workflow**: Added task-level pull requests, local browser validation, and Playwright testing requirements.
- **Quality Gates**: Mandated console error resolution and end-to-end testing before task completion.
- **Test-Driven Approach**: Formalized TDD/BDD practices with browser validation loops.

<!-- End of Blocks Constitution v0.2.0 -->