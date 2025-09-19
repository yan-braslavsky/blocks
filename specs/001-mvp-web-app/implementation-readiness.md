# Implementation Readiness Checklist (Infra & Pipelines)

Purpose: Ensure foundational infrastructure, CI/CD, security, and observability scaffolding are in place (or explicitly deferred) before deeper feature implementation begins beyond Slice 1.

## 1. Repository & Structure
- [x] Monorepo structure defined (`frontend/`, `backend/`, `shared/`, `infrastructure/`).
- [ ] Infrastructure IaC framework chosen (CDK vs Terraform) and baseline stack file created.
- [ ] Environment configuration convention documented (`.env.example` / parameter store mapping).

## 2. Dependency & Build Management
- [ ] Node version pinned (engines field) & tool versions (package manager lockfile committed).
- [ ] Frontend build script produces deterministic artifact (hash verification in CI).
- [ ] Backend build packaging strategy defined (esbuild/tsc) with tree shaking considered.

## 3. CI/CD Pipelines (GitHub Actions)
- [x] Workflow skeleton created (install, lint, typecheck, test, build).
- [ ] Caching (npm/yarn + build cache) implemented for performance.
- [ ] Failing test detection with summary annotation.
- [ ] Code coverage report generated & threshold (initial: warn only) documented.
- [ ] Security scan job stub (npm audit / dependency review) present.
- [ ] PR template enforcing principle reference.

## 4. Security & Compliance Foundations
- [ ] Secret management pattern documented (placeholder referencing AWS Secrets Manager / SSM Parameter Store) without hardcoded secrets.
- [ ] Lint rule / script preventing accidental secret commit (regex scan) integrated.
- [ ] Role-based access design doc stub (roles enumerated; mapping to claims) committed.

## 5. Observability & Logging
- [ ] Logging interface abstraction defined (fields: timestamp, level, requestId, tenantId, component).
- [ ] Placeholder log exporter (console) implemented; extension plan for structured JSON.
- [ ] Error boundary + minimal global error handler in backend.
- [ ] Metrics plan doc (target metrics & collection approach) drafted.

## 6. Data Layer Preparation
- [ ] DynamoDB table design drafted (partition/sort keys) & documented in `data-model.md`.
- [ ] CUR ingestion high-level flow diagram or description committed.
- [ ] Athena query template examples (spend aggregate, projection) stubbed.

## 7. Performance Budgets & Testing
- [ ] Document performance budgets (dashboard p95 ≤3.5s, assistant first token p95 ≤1.5s, API cached ≤600ms) in `performance-budgets.md`.
- [ ] Add placeholder performance test script (e.g., Node script simulating instrumentation collection) referenced in CI (non-blocking initially).

## 8. Accessibility & UX Foundations
- [ ] Design tokens file (spacing, colors, typography scale) checked in.
- [ ] Color contrast lint or manual checklist documented.
- [ ] Mobile responsive baseline verified (dashboard KPI stacking test).

## 9. Assistant Grounding Mechanics
- [ ] Reference token format documented (`[REF:type:id]`).
- [ ] Stub validator test ensuring assistant response includes at least one `[REF:` token.

## 10. Release & Branching Strategy
- [ ] Branch naming convention aligned with numbering (e.g., `001-mvp-web-app`, subsequent features increment numeric prefix).
- [ ] Feature flag approach documented (env-driven or in-app config) for gating incomplete slices.

## 11. Risk Register (Live)
| Risk | Status | Mitigation Owner |
|------|--------|------------------|
| IaC decision delay | Open | Timebox research; default CDK if no blocker | 
| Over-scoped slice tasks | Open | Weekly scope review vs constitution | 
| Performance budget drift | Pending | Add early synthetic check | 

## 12. Go / No-Go Gate (Before Slice 2 Work)
All MUST be complete:
- [ ] IaC baseline scaffold merged.
- [ ] CI pipeline stable (no intermittent failures over 3 successive runs).
- [ ] Logging abstraction + reference token test passing.
- [ ] Data model draft + ingestion flow outline approved.
- [ ] Performance budgets documented.

If any remain incomplete → escalate for explicit defer decision with rationale.

---
Revision History:
- v0.1 (2025-09-19): Initial checklist authored.
