
# Implementation Plan: Blocks MVP Web App

**Branch**: `001-mvp-web-app` | **Date**: 2025-09-19 | **Spec**: `specs/001-mvp-web-app/spec.md`
**Input**: Feature specification from `specs/001-mvp-web-app/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Deliver an initial, production-quality (mock-data powered) cost visibility and optimization assistant for cloud spend: a responsive, mobile-first Next.js web application with a dashboard (spend summary, trend, savings projection) and an AI assistant chat surface that cites underlying recommendations and data. Technical approach: serverless architecture (AWS Lambda + API Gateway via OpenNext) with DynamoDB (tenant-partitioned) and S3/Athena for cost & projection data, using a mock-first strategy (deterministic JSON fixtures) for Slice 1 to unblock rapid UX iteration. Frontend uses Next.js (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, and Zod for runtime validation. Performance budgets and accessibility (WCAG 2.1 AA) are embedded from the outset; infra will later be codified with AWS CDK once moving beyond mocks.

## Technical Context
**Language/Version**: TypeScript (ES2022) / Node 20 (LTS)  
**Primary Dependencies**: Next.js (App Router), React 18, TailwindCSS, shadcn/ui, TanStack Query, Zod, OpenNext (deploy), AWS SDK v3 (future), date-fns  
**Storage**: (Slice 1) In-memory / JSON fixtures; (Later) DynamoDB (tenant PK pattern), S3 (CUR + artifacts), Athena (analytics queries)  
**Testing**: Vitest + Testing Library (React) + Playwright (later for E2E) + contract schema tests (Zod)  
**Target Platform**: Web (desktop + mobile browsers), Serverless runtime (AWS Lambda)  
**Project Type**: web (separate frontend + backend folders)  
**Performance Goals**: Dashboard first meaningful paint ≤ 3.5s p95; Assistant first token latency ≤ 1.5s p95 (warning >1.5, fail >2.0); API cached endpoints ≤ 600ms p95  
**Constraints**: Mobile-first layout, WCAG 2.1 AA contrast, no blocking layout shifts > 100ms, bundle initial JS < 200KB gzip for Slice 1  
**Scale/Scope**: Early tenants (<10) in MVP; design for future multi-tenant scale (partition key = tenantId) and chat history up to last 100 interactions per tenant.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Result: PASS (Initial + Post-Design)

Alignment Summary:
- Simplicity: Single repository, two top-level workspaces (`frontend`, `backend`) only because we have a true web app split (UI vs API). No premature microservices.
- Test-First: Contracts & data model defined before implementation; tasks enforce TDD ordering (contract tests precede handlers/components).
- Observability Early: Logging shape + performance markers defined in research.md (ts, level, requestId, tenantId, latency_ms, first_token_ms).
- Accessibility & Performance Budgets codified ahead of UI build.
- Mock-First Approach reduces external coupling while delivering demonstrable value (supports incremental slices).

No deviations requiring justification at this stage.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application: separate `frontend/` + `backend/`), justified by distinct build/deploy concerns and clearer test layering.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
No current complexity deviations beyond minimal two-folder split (frontend/backend) which is considered baseline for a web app with separate build toolchains.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| (none) | N/A | Single-folder monolith would entangle Next.js bundling with lambda mock/service code, increasing cognitive overhead later |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach documented)
- [ ] Phase 3: Tasks generated (/tasks command) ✔ (Already executed manually: tasks.md present)  
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
