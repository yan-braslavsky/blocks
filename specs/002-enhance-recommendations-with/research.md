# Research: Enhanced Recommendations & Mock Dashboard

## 1. Deterministic Mock Data Strategy
- Decision: Use date-based seed (YYYY-MM-DD) hashed to produce stable daily pseudo-random values.
- Rationale: Ensures consistency for evaluators within a day while showing change across days (progression feel) without storage.
- Alternatives:
  - Static JSON (Too static; no sense of temporal variance)
  - localStorage persistence (Adds state complexity + potential multi-device inconsistency)
  - Backend mock endpoint (Unnecessary network + infra cost for pure UI preview)

## 2. Accessibility for Timeline Blocks
- Decision: Use semantic region wrappers with `aria-labelledby` referencing visible headings; keep charts as simplified list/inline SVG with `<title>` for assistive tech.
- Rationale: Avoid complex ARIA chart roles prematurely; low fidelity mock.
- Alternatives: ARIA grid / roving tabindex (Overkill for non-interactive preview)

## 3. CTA Hierarchy & Visual Emphasis
- Decision: Primary button style with neutral supporting text; single prominent CTA.
- Rationale: Encourages enablement action without deceptive design.
- Alternatives: Multiple CTAs (Dilutes focus), sticky floating CTA (Visual noise risk)

## 4. De-duplication Strategy for Recommendation Stubs
- Decision: Build set keyed by slug; first occurrence wins, log duplicate count (dev console only in mock context).
- Alternatives: Merge content (Ambiguous merge logic); raise user-facing warning (Unnecessary for mock stage)

## 5. Watermark / Disclaimer Pattern
- Decision: Add small caption below timelines: "Illustrative mock data" + light watermark overlay optional.
- Alternatives: Omit (Risk of misinterpretation); Large banner (Visual clutter)

## 6. Persistence Clarification (Open)
- Status: Still open; assumed client deterministic seed is acceptable until real backend state needed.
- Mitigation: Explicit TODO in design; no code path dependent on persistence.

## 7. Activation State Source (Future)
- Status: Deferred; placeholder enumeration in data model but no consumption logic now.
- Mitigation: Keep interface light to allow injection of real flag later.

## Summary of Resolved vs Open
- Resolved: Deterministic mock data, accessibility approach, CTA design, de-duplication, disclaimer.
- Open: Daily persistence scope confirmation (acceptable assumption), activation source-of-truth (future scope).

## Impact on Design
- No backend schema change required now.
- Contracts kept minimal to allow future real data endpoints.
- Testing will rely on fixture generation using seeded function.
