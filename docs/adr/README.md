# Architectural Decision Records (ADRs)

ADRs capture significant architectural or cross-cutting decisions. They reference the Blocks Constitution principles and provide rationale, alternatives, and impact.

## When to Create an ADR
Create an ADR if a decision:
- Introduces or replaces a core component/service
- Changes a data contract or storage model
- Materially affects security, privacy, cost, or performance posture
- Alters recommendation/AI generation mechanisms
- Introduces external infrastructure/services beyond AWS-native bias

Minor refactors or internal implementation details generally do not require an ADR unless they change a published contract.

## Lifecycle
1. Draft (PR) — may include open questions
2. Proposed — ready for broader review
3. Accepted — merged; implementation proceeds
4. Superseded — replaced by newer ADR (must reference successor)
5. Deprecated — intentionally retired, no longer applicable

## Naming & Numbering
Use incremental numbering: `ADR-001-title-slug.md`.

## Template
See `template.md` in this directory.
