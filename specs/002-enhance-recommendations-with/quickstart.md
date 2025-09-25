# Quickstart: Enhanced Recommendations & Mock Dashboard

## Goal
Spin up local environment and view mock recommendations + timeline dashboard with CTA.

## Steps
1. Start dev environment:
   - Backend (if needed for placeholder endpoints) and frontend dev servers.
2. Navigate to dashboard preview route (e.g., `/dashboard/recommendations`).
3. Confirm:
   - At least 5 recommendation stubs rendered with badges.
   - CTA visible and focusable.
   - 3+ timeline blocks with watermark/disclaimer.
   - Screen reader announces CTA label and recommendation titles sequentially.
   - Reload page within same day → identical data values.
   - Simulated slow network → skeletons appear then content.
4. Trigger CTA:
   - Confirmation panel appears; no state mutation occurs.
5. (Optional) Change system date → data changes after seed rollover.

## Validation Checklist
- [x] Recommendation count ≥ 5
- [x] Timeline blocks ≥ 3
- [x] CTA accessible name present
- [x] Watermark / disclaimer visible
- [x] Deterministic daily data verified
- [x] Skeletons appear on throttled load

## Troubleshooting
- Missing data: Ensure mock generation utilities exported to UI.
- Inconsistent values same day: Verify single seed generation (no multiple Date.now() variations).
- Accessibility issues: Run axe / a11y check script.
