# Feature Specification: Blocks MVP Web Application & Incremental Delivery Framework

**Feature Branch**: `001-mvp-web-app`  
**Created**: 2025-09-19  
**Status**: Draft  
**Input**: User description: "Build the Blocks MVP web app according to the consolidated MVP spec; ensure sleek, consistent, mobile‑adaptive design; plan incremental deliverables; ensure infrastructure & CI/CD foundations for AWS deployment (credentials later)" 

## Execution Flow (main)
```
1. Parse user description from Input
	→ If empty: ERROR "No feature description provided"
2. Extract key concepts from description
	→ Identify: actors (Finance Lead, DevOps/Platform, Founder/CTO, Internal Back Office), actions (onboard, connect AWS, view spend, view savings, receive recommendations, chat for explanations, internal SP analysis/purchase), data (spend aggregates, projections, recommendations, SP positions, tenant/connectivity state), constraints (20% savings promise, mobile friendly, incremental delivery, AWS deploy readiness)
3. For each unclear aspect:
	→ Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
	→ If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
	→ Each requirement must be testable
	→ Mark ambiguous requirements
6. Identify Key Entities (data involved)
7. Run Review Checklist
	→ If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
	→ If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no code, internal service names, or technology stacks beyond user‑visible promises)
- 👥 Written for business stakeholders (value, outcomes, scope)

### Section Requirements
- Mandatory sections below are fully populated.
- Ambiguities are explicitly flagged.

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
An organization representative signs up to Blocks, creates a workspace, connects their AWS environment through a guided flow, and within the first billing cycle can see verifiable current spend vs. an automatically projected 20% savings view. They explore categorized recommendations and use an integrated assistant to understand where savings originate and what next actions to take, while internal staff can review and execute Savings Plan purchase decisions that reflect in the customer’s dashboard status.

### Supporting User Journeys
1. New user onboarding to first value (sign up → connect AWS → initial data appears → savings projection visible).
2. Returning user monitors spend trend and validates ongoing savings vs. baseline.
3. User drills into recommendations list, changes status (e.g., acknowledges, marks implemented) to manage optimization pipeline.
4. User invokes chat assistant to clarify an unexpected cost spike or savings delta.
5. Internal back office reviews automated SP commitment recommendation, approves purchase, and user sees updated coverage state.
6. Finance persona exports summarized data for accounting review.

### Acceptance Scenarios
1. Given a newly created workspace with no AWS connection, when the user opens the main application area, then they see an actionable prompt guiding the AWS connection steps and sample placeholder data (clearly labeled) instead of empty charts.
2. Given a tenant with a validated AWS connection and at least 48 hours of ingested spend data, when the user visits the spend view, then Current Spend and Projected Spend values are displayed along with a delta percentage labeled as a 20% savings projection (tolerance ±1% rounding) and time range filters are usable.
3. Given at least one optimization signal qualifying for recommendation rules, when the user navigates to the recommendations area, then at least one categorized recommendation appears with rationale, estimated impact, and a status control.
4. Given the user opens the assistant interface and submits a natural language question about savings composition, then a response references at least one spend category or time period and includes suggested next actions.
5. Given internal approval of a savings commitment action, when the user returns to the savings overview, then a clearly labeled state transition (e.g., from Analyzing to Monitoring) is visible within a defined propagation window (SLA: within 6 hours; stretch target 2 hours).
6. Given a mobile viewport (narrow screen threshold), when the user accesses the dashboard, then primary KPI tiles stack vertically and charts remain legible without horizontal scrolling.
7. Given an invalid AWS connection attempt (e.g., insufficient permissions), when validation runs, then the user sees a human‑readable error category with remediation guidance.

### Edge Cases
- What happens when no spend data is available after connection for >24h? → System shows a persistent warning banner and triggers an internal alert; placeholders remain.
- How does system handle partial data (missing hours)? → Charts display a dashed segment gap and tooltip note when >5% of expected intervals are missing in the selected range.
- Multiple concurrent users updating recommendation statuses → Last write wins; UI applies optimistic update with server reconciliation rollback on conflict.
- Assistant asked about unsupported scope (e.g., non‑AWS cloud) → Provide a polite limitation message and indicate roadmap placeholders.
- User attempts export before any real data ingested → Provide disabled export control with tooltip explaining prerequisite.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow a new user to create an account and workspace (tenant) in a single onboarding flow.
- **FR-002**: System MUST present a guided AWS connection flow including: instruction steps, infrastructure role definition summary, and post‑connection validation result list.
- **FR-003**: System MUST ingest hourly cost & usage data sufficient to display spend metrics within 48 hours of connection completion, including an initial historical backfill target of 90 days (fallback 30 days if upstream limits) clearly labeled.
- **FR-004**: System MUST display Current Spend, Projected Spend (applying a flat 20% savings model), and Delta % for user‑selected time ranges (Daily, Weekly, Monthly, YTD).
- **FR-005**: System MUST provide interactive filters (time range, account/organizational scope, service category, tag, region) that update displayed aggregations consistently.
- **FR-006**: System MUST surface categorized recommendations (rightsizing, commitment posture, idle/low utilization) each containing rationale, estimated savings impact, and status lifecycle (Draft → New → Acknowledged → Actioned → Archived).
- **FR-007**: System MUST allow users to change recommendation status and persist that state for future sessions.
- **FR-008**: System MUST provide an integrated conversational assistant accessible across application screens (persistent launcher) returning contextual explanations citing spend categories or recommendation IDs.
- **FR-009**: System MUST respond to an assistant query with initial visible output (first token / first chunk) p95 ≤ 1.5s (fail threshold >2.0s triggers alert).
- **FR-010**: System MUST provide a visual state indicator for internal savings commitment (e.g., plan analysis, approval pending, purchased, monitoring) visible to end users.
- **FR-011**: System MUST allow exporting selected spend summary data to CSV (UTF-8, comma delimiter, RFC 4180) with header row and ISO 8601 timestamps.
- **FR-012**: System MUST display placeholder sample data clearly labeled until real ingestion is complete to avoid empty states.
- **FR-013**: System MUST provide human‑readable validation errors for failed AWS connection attempts including specific missing capability categories.
- **FR-014**: System MUST retain a per‑tenant audit trail of status changes for recommendations and savings commitment states for 400 days then purge or archive.
- **FR-015**: System MUST restrict user visibility and actions to their own tenant context (no cross‑tenant leakage).
- **FR-016**: System MUST adapt layout for mobile viewports (stacking KPIs, collapsing navigation, ensuring tap targets meet accessibility sizing).
- **FR-017**: System MUST allow internal staff (back office) to record approval decisions that transition user‑visible commitment states via the same application behind an InternalAdmin role.
- **FR-018**: System MUST provide a banner or notification when spend data freshness exceeds 3 hours (warning) and 6 hours (critical) since last ingest success.
- **FR-019**: System MUST ensure filters (time range, account scope, service category) are reflected in sharable URLs; tag and region optional MVP.
- **FR-020**: System MUST provide accessible color contrast and semantic labeling for key KPI and chart elements conforming to WCAG 2.1 AA.
- **FR-021**: System MUST allow users to request an explanation of a specific chart via contextual affordance (e.g., “Explain this view” interaction) invoking the assistant with prefilled context.
- **FR-022**: System MUST clearly differentiate projected vs. actual metrics using legend labels "Actual Spend" and "Projected (20% Savings)" plus distinct pattern (solid vs dashed).
- **FR-023**: System MUST support roles: TenantAdmin, Finance, Engineering, InternalAdmin, ReadOnly with defined privileges.
- **FR-024**: System MUST provide a consistent design system using 8px spacing scale, modular type scale (1.125), neutral gray palette, primary blue (#2563EB), secondary green (#059669), dark mode tokens.
- **FR-025**: System MUST present a clear path to incremental release slices enabling stakeholder validation at each milestone (outlined in Release Phasing below).

### Non‑Functional / Quality Requirements
- **NFR-001**: System SHOULD achieve p95 interactive dashboard load ≤ 3.5s after navigation.
- **NFR-002**: System SHOULD indicate partial or delayed data conditions to avoid misinterpretation of savings metrics.
- **NFR-003**: System SHOULD meet 99.9% monthly availability for user-facing surfaces.
- **NFR-004**: System SHOULD ensure per‑tenant logical isolation for all stored aggregates (no cross‑tenant mixing) with auditable verification points.
- **NFR-005**: System SHOULD provide resilience to delayed upstream cost data (graceful degradation with last known values + stale indicator).
- **NFR-006**: System SHOULD ensure assistant responses include structured references: [REF:rec:{id}], [REF:agg:{period}] for every quantitative claim.
- **NFR-007**: System SHOULD deliver a cohesive mobile experience (gesture friendly navigation, responsive charts) without requiring separate application.
- **NFR-008**: System SHOULD externalize user-facing strings; MVP limited to English.
- **NFR-009**: System SHOULD enable incremental deployment paths aligned with release slices (see Release Phasing) without blocking existing user flows.

### Key Entities
- **Tenant**: Represents a customer workspace; holds organization identity, connection status, savings commitment states, and configuration preferences.
- **Account Scope**: Captures linked environment subdivisions (accounts / organizational units) used for filtering and isolation.
- **Connection**: Represents the AWS linkage attempt and its validation artifact set (status flags, last checked timestamp, error categories).
- **Spend Aggregate**: Aggregated cost metrics at defined granularity supporting dashboard views (actual spend values used for current metrics and historical trend).
- **Savings Projection**: Baseline vs. projected cost representation applying defined savings logic for specified periods.
- **Recommendation**: Optimization advisory unit with category, rationale, estimated impact, and lifecycle status.
- **Savings Commitment State**: Reflects lifecycle of internally processed savings commitment action exposed to user (Analyzing → Pending Approval → Purchased → Monitoring).
- **Assistant Interaction**: Recorded prompt/response pairing including references to spend categories or recommendation identifiers for traceability and quality review.
- **Export Artifact**: User‑initiated data snapshot (summary metrics) produced for finance workflows.

### Assumptions & Dependencies
- Users are willing to supply required AWS access details early in onboarding.
- 20% savings projection is initially a simplified flat model (not dynamic) until future optimization logic is ready.
- Internal back office workflow tooling will use the same application (InternalAdmin role) at MVP.
- Branding guidelines may evolve; design tokens can adjust if provided later.

### Out of Scope (Confirm)
- Direct infrastructure modification (automatic resizing, termination) beyond representing savings projections.
- Multi‑cloud parity (non‑AWS) beyond placeholder indicators.
- Deep container runtime telemetry beyond high‑level allocation categorization.

## Release Phasing (Incremental Value Slices)
1. **Slice 1: Foundational Onboarding & Placeholder Experience**  
	- Minimal sign up + workspace creation.  
	- AWS connection guide (no ingestion yet) with sample dashboard placeholders labeled.  
	- Assistant launcher stub returning static explanatory content.  
	- Goal: Validate onboarding flow clarity.
2. **Slice 2: Data Ingestion & Baseline Spend Display**  
	- Hourly spend ingestion pipeline operational sufficiently to populate Current Spend & simple trend.  
	- Projection (flat 20%) shown.  
	- Basic filters (time range).  
	- Goal: Demonstrate tangible spend visibility.
3. **Slice 3: Expanded Filtering & Recommendations v1**  
	- Additional filters (account scope, service category).  
	- First recommendation categories appear with rationale & status updates.  
	- Goal: Introduce optimization narrative.
4. **Slice 4: Assistant Contextual Explanations**  
	- Assistant references real aggregates & recommendation identifiers.  
	- “Explain this view” contextual trigger.  
	- Goal: Reduce friction interpreting savings.
5. **Slice 5: Savings Commitment Lifecycle Visibility**  
	- Expose state machine for internal SP decisions (Analyzing → Monitoring).  
	- User‑visible timeline or status badge.  
	- Goal: Build trust in ongoing optimization loop.
6. **Slice 6: Exports & Mobile Polish**  
	- CSV (or defined format) export of summary metrics.  
	- Responsive refinement (chart readability, nav adaptation).  
	- Goal: Support finance workflows & mobile adoption.
7. **Slice 7: Quality & Reliability Enhancements**  
	- Stale data indicators, partial data annotations, accessibility contrast audit.  
	- Goal: Production readiness confidence.

## Review & Acceptance Checklist
*GATE: All clarification markers resolved via documented assumptions*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs) remain (Current draft references none beyond user perception).
- [ ] Focused on user value and business needs.
- [ ] Written for non‑technical stakeholders.
- [ ] All mandatory sections completed.

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain.
- [x] Requirements are testable and unambiguous.
- [ ] Success criteria are measurable (Projection tolerance, first response time, etc.).
- [ ] Scope is clearly bounded (Out of scope list present).
- [ ] Dependencies and assumptions identified.

### Outstanding Clarifications
All prior clarification items resolved and embedded; any change requires revision note referencing assumption origin.

## Execution Status
*Will be updated upon automation completion*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

