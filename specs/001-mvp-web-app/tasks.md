# Tasks: Blocks MVP Web Application (Regenerated per tasks.prompt.md)

**Feature Directory**: `specs/001-mvp-web-app`  
**Design Inputs Detected**: `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Generation Principles**: TDD (tests before code), incremental demonstrable value, minimal complexity, parallel where file-isolated.

## Incremental Delivery Slices (Mapped to Tasks)
1. Foundations (tooling, repo, design tokens) → visible empty shell + onboarding route.
2. Contract Safety Net (failing contract & integration tests) → guards drift early.
3. Mocked Backend + UI Surfaces (dashboard placeholders, assistant stub, connection form) → end-to-end demo with mocks.
4. Interaction & State Enhancements (filters, freshness, reference validation, accessibility).
5. Hardening & Observability (perf markers, a11y, roles, audit, export mock, dark mode).

## Legend
`[P]` = may execute in parallel (different files / no dependency).  
Sequential groups intentionally omit `[P]` to preserve order.

---
## Phase 3.1 Foundations & Repo Scaffolding
- [x] T001 Initialize monorepo root: `package.json` (workspaces: `frontend`, `backend`, `shared`), `README.md` scaffold, root `tsconfig.base.json`.
- [x] T002 Create `shared/` workspace with `shared/package.json`, `tsconfig.json`, and initial `src/index.ts` export barrel.
- [x] T003 Add root ESLint + Prettier + TypeScript strict config; npm scripts (`lint`, `typecheck`, `test`, `build`).
- [x] T004 GitHub Actions CI: `.github/workflows/ci.yml` (install → lint → typecheck → test → build).
- [x] T005 Commit lint + PR template referencing constitution principles.
- [x] T006 Frontend bootstrap: `frontend` Next.js (App Router, `src/app`), enable strict mode & SWC minify.
- [x] T007 Backend bootstrap: `backend` Node project with `tsconfig.json`, test setup (Vitest), and start script.
- [x] T008 Design tokens file `frontend/src/design-system/tokens.ts` (spacing 8px scale, colors, typography, dark mode tokens) + export types. [P]
- [x] T009 Tailwind config + `globals.css` with CSS variables from tokens. Depends on T008.
- [x] T010 Basic logging utility `backend/src/lib/log.ts` (function `log(level, msg, meta?)`).

## Phase 3.2 Contract & Integration Tests (Failing First)
- [x] T011 Zod schemas for all contracts in `backend/src/schemas/` (spend, projection, recommendations, assistantQuery, connectionTest, tenantSetup, errorShape).
- [x] T012 [P] Contract test GET /spend `backend/tests/contract/spend.test.ts` (valid + invalid enum timeRange case).
- [x] T013 [P] Contract test GET /projection `backend/tests/contract/projection.test.ts`.
- [x] T014 [P] Contract test GET /recommendations `backend/tests/contract/recommendations.test.ts` (status/category filters, invalid status rejection).
- [x] T015 [P] Contract test POST /assistant/query `backend/tests/contract/assistant.test.ts` (missing prompt negative case).
- [x] T016 [P] Contract test POST /connection/test `backend/tests/contract/connection.test.ts` (invalid ARN pattern case).
- [x] T017 [P] Contract test POST /tenant/setup `backend/tests/contract/tenant-setup.test.ts` (duplicate name placeholder skip). 
- [x] T018 Integration test onboarding flow `frontend/tests/integration/onboarding.test.tsx` (create workspace stub → dashboard redirect placeholders present).
- [x] T019 Integration test assistant stub `frontend/tests/integration/assistant-ref.test.tsx` (response contains `[REF:` token).
- [x] T020 Integration test mobile layout `frontend/tests/integration/mobile-layout.test.tsx` (cards stack ≤420px width).
- [x] T021 Unit test design tokens `frontend/tests/unit/tokens.test.ts` enforcing contrast & presence (ensures tokens before UI). Depends on T008.

## Phase 3.3 Mock Backend & Core UI (Make Tests Pass Incrementally)
- [x] T022 Server bootstrap `backend/src/server.ts` (fastify or express minimal) with env `USE_MOCKS` + generic error handler (placeholder) exporting app for tests.
- [x] T023 Fixtures directory & JSON: `backend/src/fixtures/{spend.json,projection.json,recommendations.json,assistant.json,connectionSuccess.json,tenantSetup.json}`. [P]
- [x] T024 Handler: tenant setup `backend/src/api/tenantSetup.ts` (returns fixture, validates body with schema). Depends on T011.
- [x] T025 Handler: connection test `backend/src/api/connectionTest.ts`.
- [x] T026 Handler: spend `backend/src/api/spend.ts` with optional simulated latency (150ms) & param validation.
- [x] T027 Handler: projection `backend/src/api/projection.ts`.
- [x] T028 Handler: recommendations `backend/src/api/recommendations.ts`.
- [x] T029 Handler: assistant mock (non-stream & simulated streaming utility) `backend/src/api/assistant.ts`.
- [x] T030 Wire routes in `server.ts` and export for contract tests; update tests to import app instance.
- [x] T031 Frontend tenant context provider `frontend/src/app/providers/TenantProvider.tsx` with stub tenant ID.
- [x] T032 Onboarding page `frontend/src/app/onboarding/page.tsx` (form → sets stub tenant → redirect `/app/dashboard`).
- [x] T033 Dashboard placeholder page `frontend/src/app/app/dashboard/page.tsx` (KPI skeletons & spend chart placeholder container).
- [x] T034 Connect AWS page `frontend/src/app/app/connect-aws/page.tsx` (role instructions + validate button). Depends on T024.
- [x] T035 Assistant widget `frontend/src/components/assistant/Widget.tsx` (floating trigger + panel) rendering mock response. Depends on T029.
- [x] T036 Design system primitives `frontend/src/components/ui/` (`Button.tsx`, `Card.tsx`, `KPIStat.tsx`) using design tokens. Depends on T008.
- [x] T037 Navigation shell + mobile drawer `frontend/src/components/layout/AppShell.tsx`. Depends on T036. [P]
- [x] T038 TanStack Query hooks `frontend/src/hooks/` (`useSpend.ts`, `useProjection.ts`, `useRecommendations.ts`, `useAssistant.ts`, `useConnectionTest.ts`). Depends on handlers.

## Phase 3.4 Interaction & State Enhancements
- [x] T039 URL filter state sync `frontend/src/app/app/dashboard/useDashboardFilters.ts` (query param <-> state).
- [x] T040 Data freshness banner `frontend/src/components/status/DataFreshnessBanner.tsx` using `lastIngestAt` from mock.
- [x] T041 Recommendation status mutation stub `frontend/src/hooks/useRecommendations.ts` (local optimistic update new→acknowledged).
- [x] T042 Logging middleware `backend/src/middleware/logging.ts` (requestId, tenantId injection) + tests.
- [x] T043 Error handling middleware `backend/src/middleware/errors.ts` normalizing error shape.
- [x] T044 Assistant reference token validator test `backend/tests/integration/assistant-ref-validator.test.ts` (ensures at least one `[REF:`). Depends on T029.
- [x] T045 Accessibility audit script `frontend/scripts/a11y-check.ts` (axe-core headless run over key routes).

## Phase 3.5 Hardening, Observability & Polish
- [ ] T046 Performance markers `frontend/src/lib/perf.ts` + collector mock endpoint `backend/src/api/perfCollect.ts` (schema test). 
- [ ] T047 Lighthouse CI workflow `.github/workflows/lighthouse.yml` (non-blocking informational). 
- [ ] T048 README update: slice progress table & run instructions referencing quickstart.
- [ ] T049 Quickstart verification script `scripts/verify.sh` (runs lint, typecheck, tests, build front/back sequentially) + exit non-zero on failure.
- [ ] T050 Dark mode styles for primitives & shell (respects prefers-color-scheme) updating tokens usage.
- [ ] T051 Role constants & usage guard `shared/src/roles.ts` (enum + type + basic unit test). Depends on T002/T007.
- [ ] T052 Export CSV mock endpoint `backend/src/api/exportMock.ts` producing inline CSV string (content-disposition set) + contract test.
- [ ] T053 Audit event mock service `backend/src/services/auditMock.ts` invoked on recommendation status mutation (augment handler from T028) + unit test.
- [ ] T054 Contrast & ARIA unit tests for primitives `frontend/tests/unit/primitives-a11y.test.ts`.
- [ ] T055 Final integration pass script `scripts/integration-smoke.sh` (starts mock server → runs key Playwright-like smoke via Testing Library + supertest) placeholder for future E2E.

## Dependencies & Ordering Notes
- T008 before T009, T036, T050.
- T011 before all handler tasks (T024–T029) and contract tests import schemas (tests created prior but failing until implementation).
- T022 server bootstrap precedes wiring (T030) and is required for contract tests to transition from failing to passing.
- Handlers (T024–T029) can be implemented sequentially after tests exist; fixtures (T023) may proceed in parallel.
- Hooks (T038) depend on handlers; UI pages (T032–T035) depend on tokens & primitives.
- Middleware (T042–T043) inserted after initial handlers proven; their addition should not break earlier tests (update tests if needed).

## Parallel Execution Batches (Illustrative)
Batch A (after T011 committed): T012–T017 all [P].
Batch B (UI tests): T018–T020 + T021 (tokens unit) [P] separate from backend contract tests.
Batch C (fixtures & some UI): T023 [P] with T036 (primitives) & T037 (nav) once T008 done.

## Task Agent Example Commands (Pseudo)
`/run T012` → generates spend contract test file skeleton failing.  
`/run T024` → implement spend handler until T012 passes.  
`/run T049` → run verification script before PR.

## Validation Checklist
- [ ] Every contract endpoint has: schema (T011) + contract test (T012–T017) + handler (T024–T029) + wiring (T030).
- [ ] Each entity from data-model represented via at least one touchpoint (e.g., Recommendation via recommendations handler & mutation stub).
- [ ] Assistant reference validation tested (T044) and widget integration covered (T019).
- [ ] Accessibility & performance tasks included (T045, T046, T054, T047).
- [ ] Incremental value: Foundations → failing tests → passing mocks → enhanced interactivity → polish.

---
End regenerated tasks.md
