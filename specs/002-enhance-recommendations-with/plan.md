
# Implementation Plan: Enhanced Recommendations & Mock Dashboard (Evaluation Mode)

**Branch**: `002-enhance-recommendations-with` | **Date**: 2025-09-22 | **Spec**: `specs/002-enhance-recommendations-with/spec.md`
**Input**: Feature specification from `specs/002-enhance-recommendations-with/spec.md`

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
Introduce richer recommendation stubs (≥5) with structured metadata and an evaluation-only dashboard containing multiple timeline mock visualizations plus an activation/purchase CTA. All data is mock/deterministic; no real activation, billing, or backend mutation. Emphasis on accessibility, deterministic mock data, and a clean handoff path to future real enablement.

## Technical Context
**Language/Version**: TypeScript (frontend Next.js / backend Node)  
**Primary Dependencies**: Frontend: Next.js, React, Tailwind (design tokens); Backend: Express (observed pattern in repo).  
**Storage**: None new (mock-only; in-memory/static JSON).  
**Testing**: Playwright (E2E), Vitest (frontend unit/integration), existing backend test setup (Jest/Vitest style).  
**Target Platform**: Web (browser + Node backend).  
**Project Type**: Web application (frontend + backend).  
**Performance Goals**: Preserve Constitution P95 page TTI <3.5s; mock rendering aims for skeleton <1s.  
**Constraints**: No real tenant mutation; deterministic mock dataset stable within 24h window.  
**Scale/Scope**: Single evaluation dashboard view + recommendation module enhancements; limited to mock data path.

Unresolved Clarifications (carried from spec):
- Persistence mechanism for deterministic 24h dataset (localStorage vs. server ephemeral) → Will choose client-side seed for Phase 0 unless overridden.  
- Future activation state source (backend flag vs. license service) → Deferred; out-of-scope.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principle Alignment:
- Outcome Over Features: Adds evaluative value to drive enablement decision (supports adoption KPI).
- Trace Every Number: Mock visualizations will include watermark/disclaimer to avoid misrepresentation; no opaque financial claims.
- Explainability First: Recommendations include rationale placeholders for future expansion; mock state clearly disclosed.
- Tenant Isolation: No cross-tenant data introduced (mock scope only). Ensure any potential future activation call gated.
- Performance Budgeted: Lightweight mock data ensures negligible impact; monitor TTI.
- Bias to Learning: Incremental stub approach aligned; no premature integration complexity.
- Deterministic & Idempotent: Deterministic seed ensures consistent mock dataset within window.

No violations requiring Complexity Tracking. Open Clarifications documented (do not block research phase as they relate to future real enablement).

Initial Constitution Check: PASS (with noted clarifications deferred deliberately).

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

**Structure Decision**: Option 2 (Web application) – existing repo already split into `frontend/` and `backend/`. New work limited to frontend mock UI components + (optional) backend static mock endpoint wrapper only if needed (likely not required initially).

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

**Output**: research.md with all NEEDS CLARIFICATION resolved (or explicitly deferred w/ rationale).

Planned Research Focus:
1. Deterministic Mock Data Strategy: Evaluate simple seeded pseudo-random vs. static JSON.
2. Accessibility for complex mock timelines (ARIA roles, landmark usage minimalism).
3. CTA Hierarchy & Visual Emphasis best practices (avoid dark pattern while encouraging activation).
4. De-duplication strategy for recommendation stubs (slug map vs. set) – minimal.
5. Watermark/Disclaimer patterns to prevent misinterpretation of mock data.

Resolution Path:
- If persistence not required server-side, adopt seed derived from date (YYYY-MM-DD) hashed; resets daily.
- Activation state left as a future feature flag placeholder.

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

**Output** (this plan execution): data-model.md, /contracts/* (stubs), failing test placeholders (if added now per constitution—will stage minimal), quickstart.md. Agent context updating deferred unless needed.

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
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach documented (/plan command)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (no new violations)
- [x] All NEEDS CLARIFICATION resolved (client-side seed chosen, activation deferred)
- [x] Complexity deviations documented (none needed)

---
*Based on Constitution v0.2.2 - See `/memory/constitution.md`*
