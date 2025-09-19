# Slice 1 Breakdown: Foundational Onboarding & Placeholder Experience

Goal: Enable a user to sign up, create a tenant workspace, view placeholder dashboard with labeled sample metrics, access AWS connection guided flow (without active ingestion), and open assistant stub. All within performance & isolation principles.

## Success Criteria
- User can create account + workspace and land in `/app/dashboard` with placeholder KPIs (clearly labeled “Sample”).
- AWS connection page displays role creation instructions and validation button (returns mocked success/failure states).
- Assistant launcher visible on all authenticated pages and opens modal/panel returning static explanatory response containing at least one reference token pattern.
- CI pipeline runs lint, type check, unit skeleton tests, and contract placeholder tests on PR.
- Design system tokens present (spacing, colors, typography) and applied to at least two reusable components (Button, Card).
- Mobile viewport (≤ 420px) stacks KPI placeholders vertically without horizontal scroll.

## Out of Scope (Slice 1)
- Real CUR ingestion or spend aggregation queries.
- Real assistant model integration (uses static stub provider).
- Role assumption validation (mock only).

## Task List (Engineering)
### Repo & Tooling
1. Initialize monorepo structure: `frontend/`, `backend/`, `shared/`, `infrastructure/`.
2. Add root README with high-level slice roadmap + contribution guidelines referencing constitution principles.
3. Setup GitHub Actions workflow: jobs (install deps cache, lint, typecheck, frontend build, backend build, basic test). Fail on lint/type errors.
4. Add codeowners + PR template including “Principle Referenced” field.
5. Configure commit linting / conventional commits (optional fast-follow) to tag slices.

### Frontend Skeleton
6. Bootstrap Next.js app (App Router) in `frontend/` with TypeScript strict mode.
7. Integrate Tailwind + base config (design tokens file grouping custom palette + spacing scale 8px) and dark mode class strategy.
8. Add design-system primitives: `Button`, `Card`, `KPIStat` (placeholder), with tokens and accessible variants.
9. Global layout with responsive navigation shell; add meta baseline (viewport, theme color) and fonts.
10. Implement `/app/dashboard` route showing three KPI placeholder cards (Current Spend, Projected Spend, Delta %) flagged “Sample Data”.
11. Implement `/app/connect-aws` route with step list: (1) Overview, (2) Role Setup, (3) Validation (disabled) and show faux IAM policy JSON preview.
12. Add placeholder chat widget component (floating button bottom-right) opening panel with static lorem ref including `[REF:agg:sample]`.
13. Add basic mobile responsive test (manual + small jest DOM snapshot) verifying KPI stacking with Tailwind breakpoints.

### Backend Skeleton (Minimal)
14. Initialize backend project structure with placeholder handlers directory.
15. Add health endpoint contract & minimal test.
16. Add placeholder POST `/connection/test` returning simulated validation result from static decision matrix.
17. Shared types package `shared/types/` with base TenantId, Role enums (scaffold).

### Auth & Tenant Stub
18. Implement fake auth middleware (dev mode) injecting a static tenant id (real integration deferred) with easy toggle.
19. Add tenant creation placeholder API endpoint returning generated UUID and storing ephemeral in-memory map (to be replaced).
20. Frontend onboarding screen: simple form collects workspace name, triggers tenant creation endpoint, then routes to dashboard.

### Assistant Stub
21. Backend endpoint `/assistant/query` returns static streaming simulation (chunked setTimeout) with references.
22. Frontend hook to call assistant endpoint, stream into panel UI.

### CI/CD & Quality Gates
23. Add lint config (ESLint + TypeScript rules + import ordering + accessibility plugin).
24. Add prettier config and pre-commit hook (husky) for format + lint staged.
25. Add minimal unit tests: design-system/button renders variants, assistant stub returns reference token.
26. Add contract test placeholder verifying `/connection/test` schema.
27. Add performance budget placeholder script (currently asserts stub metrics JSON); wired but non-blocking.

### Observability Foundations
28. Define logging utility shape (requestId, tenantId) but stub implementation logs to console only.
29. Introduce error boundary component for frontend root.

### Documentation
30. Create `quickstart.md` (Slice 1 scope) steps: install, run dev servers (frontend/back), trigger sample assistant.
31. Update root README with Slice 1 Done criteria checklist.

## Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-engineering infra early | Delays value | Strict slice scope & deferral of real ingestion |
| Design inconsistency creep | Rework & style drift | Tokens + primitives required before additional components |
| Assistant expectations misaligned | User confusion | Clear “Preview / Stub” labeling in widget header |

## Exit Checklist (Must be TRUE to close Slice 1)
- [ ] All tasks complete & merged behind feature flag or default safe state.
- [ ] Dashboard reachable post-onboarding with sample data labels.
- [ ] Connection page shows structured guidance + validation stub.
- [ ] Assistant widget opens & displays reference token text.
- [ ] Mobile layout verified (manual + snapshot test).
- [ ] CI pipeline green across lint/type/test.
- [ ] README & quickstart updated.
