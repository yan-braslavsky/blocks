# Tasks: Enhanced Recommendations & Mock Dashboard (Evaluation Mode)

**Input**: Design documents from `/specs/002-enhance-recommendations-with/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md, extract structure (frontend + backend web app)
2. Load data-model (entities: RecommendationStub, TimelineBlock, ActivationState placeholder)
3. Load contracts (recommendations.mock.contract.md, timelines.mock.contract.md)
4. Load research (decisions: deterministic seed, accessibility, CTA hierarchy, disclaimer)
5. Load quickstart (scenarios for integration tests)
6. Generate tasks (setup → tests → models → mock generation utils → UI components → endpoints (optional) → polish)
7. Mark [P] for tasks in independent files
8. Validate ordering + dependencies
9. Output tasks.md
```

## Format: `[ID] [P?] Description`

---
## Phase 3.1: Setup
- [ ] T001 Ensure frontend mock feature directory structure (`frontend/src/app/dashboard/recommendations/`) exists
- [ ] T002 Add mock data seed utility `frontend/src/lib/mock/seed.ts` (hash of YYYY-MM-DD) and export function
- [ ] T003 [P] Add mock recommendation fixtures file `frontend/src/lib/mock/recommendations.ts`
- [ ] T004 [P] Add mock timeline generator `frontend/src/lib/mock/timelines.ts`
- [ ] T005 Configure a11y test script inclusion for new route (update `frontend/tests/setup.ts` if needed)
- [ ] T006 Add disclaimer watermark style token (Tailwind plugin or utility class) `frontend/src/design-system/tokens/mock-disclaimer.css` (or Tailwind layer)

## Phase 3.2: Tests First (TDD) — Contract & Integration
Contract Tests (Backend optional — may stay frontend-only; still define contract tests for forward compatibility):
- [ ] T007 [P] Contract test for GET /api/mock/recommendations (`backend/tests/contract/recommendations.mock.test.ts`) using schema expectations
- [ ] T008 [P] Contract test for GET /api/mock/timelines (`backend/tests/contract/timelines.mock.test.ts`)

Model / Utility Unit Tests:
- [ ] T009 [P] Unit test for seed utility (`frontend/tests/unit/seed.util.test.ts`)
- [ ] T010 [P] Unit test for timeline generator deterministic output (`frontend/tests/unit/timelines.generator.test.ts`)
- [ ] T011 [P] Unit test for recommendation de-duplication logic (`frontend/tests/unit/recommendations.dedupe.test.ts`)

Integration / UI Tests (Playwright):
- [ ] T012 [P] Integration test: recommendations list renders ≥5 stubs (`tests/e2e/recommendations-list.spec.ts`)
- [ ] T013 [P] Integration test: timelines render ≥3 blocks with disclaimer (`tests/e2e/recommendations-timelines.spec.ts`)
- [ ] T014 [P] Integration test: CTA visible, focusable, and opens confirmation panel (`tests/e2e/recommendations-cta.spec.ts`)
- [ ] T015 [P] Integration test: deterministic data (reload within same day matches) (`tests/e2e/recommendations-deterministic.spec.ts`)
- [ ] T016 [P] Integration test: skeletons display on throttled network (`tests/e2e/recommendations-loading.spec.ts`)
- [ ] T017 [P] Accessibility test: meaningful labels (axe scan) (`tests/e2e/recommendations-a11y.spec.ts`)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
Models / Types / Utilities:
- [ ] T018 [P] Define shared types for RecommendationStub & TimelineBlock in `shared/src/types/recommendations.ts`
- [ ] T019 [P] Implement seed utility logic in `frontend/src/lib/mock/seed.ts`
- [ ] T020 [P] Implement recommendation fixture export + de-dup in `frontend/src/lib/mock/recommendations.ts`
- [ ] T021 [P] Implement timeline generation (3+ metric types) in `frontend/src/lib/mock/timelines.ts`

Frontend Components:
- [ ] T022 Create RecommendationCard component `frontend/src/components/recommendations/RecommendationCard.tsx`
- [ ] T023 Create RecommendationsList component `frontend/src/components/recommendations/RecommendationsList.tsx`
- [ ] T024 Create TimelineChart stub component (SVG or simple bar/line) `frontend/src/components/recommendations/TimelineChart.tsx`
- [ ] T025 Create TimelinesPanel component combining blocks `frontend/src/components/recommendations/TimelinesPanel.tsx`
- [ ] T026 Create CTA panel/modal component `frontend/src/components/recommendations/ActivationCta.tsx`
- [ ] T027 Add disclaimers/watermark component `frontend/src/components/recommendations/MockDisclaimer.tsx`
- [ ] T028 Assemble Dashboard page route `frontend/src/app/dashboard/recommendations/page.tsx`

Loading & Accessibility Enhancements:
- [ ] T029 [P] Add skeleton loaders components `frontend/src/components/recommendations/Skeletons.tsx`
- [ ] T030 [P] Ensure keyboard navigation order & aria labels (pass a11y test) in list & CTA

Optional Backend Stubs (only if later wiring required):
- [ ] T031 Add mock recommendations endpoint `backend/src/api/mock/recommendations.ts` (static in-memory export) — FUTURE OPTIONAL
- [ ] T032 Add mock timelines endpoint `backend/src/api/mock/timelines.ts` — FUTURE OPTIONAL

## Phase 3.4: Integration & Refinement
- [ ] T033 Wire shared types import into frontend components (align with `shared/src/types/recommendations.ts`)
- [ ] T034 Add de-dup logging (dev mode only) `frontend/src/lib/mock/recommendations.ts`
- [ ] T035 Add daily seed rollover test hook (expose function to override seed for tests) `frontend/src/lib/mock/seed.ts`
- [ ] T036 Insert disclaimer text + watermark styling in timeline & list parent container
- [ ] T037 Verify performance (TTI not regressed) & add lightweight perf log marker
- [ ] T038 Update quickstart validation after implementation (mark checklist items)

## Phase 3.5: Polish & Documentation
- [ ] T039 [P] Add unit tests for RecommendationCard edge cases (long title truncation) `frontend/tests/unit/recommendation.card.test.tsx`
- [ ] T040 [P] Add unit tests for TimelineChart aria labeling `frontend/tests/unit/timeline.chart.a11y.test.tsx`
- [ ] T041 [P] Add README section update referencing evaluation dashboard (`README.md`)
- [ ] T042 Refactor for duplication removal (shared hooks for seed) `frontend/src/hooks/useDailySeed.ts`
- [ ] T043 Final accessibility audit & fix issues
- [ ] T044 Remove any remaining console warnings & ensure disclaimers visible
- [ ] T045 Update spec & plan removing resolved NEEDS CLARIFICATION markers (seed persistence) if accepted

## Dependencies
- T001 before any frontend component tasks
- T002 before T019 (seed logic tests depend on util stub path)
- Contract tests (T007,T008) precede any backend endpoints (T031,T032) if those are pursued
- Unit tests (T009–T011) before their respective implementations (T019–T021)
- Integration tests (T012–T017) before page assembly (T028)
- Types (T018) before component implementations referencing them (T022–T028)
- Components list: RecommendationCard (T022) before RecommendationsList (T023); TimelineChart (T024) before TimelinesPanel (T025); ActivationCta (T026) before page assembly (T028)

## Parallel Execution Examples
```
# Example 1: Independent unit + contract tests
Run in parallel:
- T007 Contract test recommendations
- T008 Contract test timelines
- T009 Seed util unit test
- T010 Timeline generator unit test
- T011 Recommendation de-dup unit test
- T012 Recommendations list integration test
- T013 Timelines integration test
- T014 CTA integration test
- T015 Deterministic integration test
- T016 Loading skeleton integration test
- T017 Accessibility integration test

# Example 2: After tests failing
Run in parallel:
- T018 Types file
- T019 Seed util implementation
- T020 Recommendation fixtures
- T021 Timeline generator

# Example 3: Component stage
Run in parallel:
- T022 RecommendationCard
- T024 TimelineChart
- T026 ActivationCta
- T027 MockDisclaimer
- T029 Skeletons
```

## Validation Checklist
- [ ] All contracts have corresponding test tasks (T007,T008)
- [ ] All entities have model/type tasks (T018 + fixtures/generators T020,T021)
- [ ] Tests precede implementations (T007–T017 before T018+ implementation set)
- [ ] Parallel tasks operate on distinct files
- [ ] Each task specifies exact file path
- [ ] No overlapping [P] tasks on the same file

---
Generated for feature branch `002-enhance-recommendations-with` on 2025-09-22.
