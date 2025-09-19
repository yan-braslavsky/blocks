# Quickstart (Phase 1 Prototype w/ Mocks)

Goal: Run frontend (Next.js) + mock backend endpoints locally to visualize Slice 1 experience (onboarding, placeholder dashboard, assistant stub, connection test).

## Prerequisites
- Node.js 20.x
- npm (or pnpm/yarn – choose one and remain consistent)
- Git

## 1. Clone & Install
```
git clone <repo-url> blocks
cd blocks
npm install --workspaces
```

## 2. Environment Setup
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_APP_ENV=dev
MOCK_MODE=1
```
Create `backend/.env`:
```
PORT=3001
USE_MOCKS=1
LOG_LEVEL=debug
```

## 3. Start Mock Backend
Placeholder command (implementation to supply script):
```
cd backend
npm run dev
```
Expected log: `Mock API listening on :3001`.

## 4. Start Frontend
```
cd frontend
npm run dev
```
Navigate to: http://localhost:3000/app/dashboard

## 5. Flows to Validate
1. Workspace creation stub → routes to dashboard with 3 KPI sample cards labeled “Sample”.
2. Open Assistant widget (bottom-right) → static response contains `[REF:` token.
3. Navigate to Connect AWS → view role instruction + disabled validation or mock success.
4. Resize browser ≤ 420px width → KPI cards stack vertically, nav collapses.

## 6. Testing (Early)
```
npm run test       # root runs all workspaces (configure in package scripts)
```
- Unit: design system primitives render.
- Contract placeholder: `/connection/test` schema validation.

## 7. Lint & Type
```
npm run lint
npm run typecheck
```

## 8. Performance Preview
```
npm run perf:stub   # prints synthetic metrics JSON (later replaced)
```

## 9. Adding a Mocked Endpoint Example
In backend fixtures add `spend.mock.json`; handler returns JSON after 150ms simulated latency.

## 10. Mobile Emulation Tips
- Use Chrome DevTools device toolbar.
- Check tap target spacing (≥44px height) on buttons.

## 11. Feature Flags (Planned)
- `ENABLE_RECOMMENDATIONS=false` until Slice 3.
- `ENABLE_ASSISTANT_STREAM=false` use non-stream fallback.

## 12. Troubleshooting
| Issue | Likely Cause | Resolution |
|-------|--------------|------------|
| 404 on /app/dashboard | App router not configured | Verify layout + route directory structure |
| Assistant empty response | MOCK_MODE off | Set `USE_MOCKS=1` & restart backend |
| KPI not stacking | Styles not loaded | Ensure Tailwind config & global.css imported |

## 13. Next Steps After Slice 1
- Implement real connection validation logic.
- Introduce ingestion pipeline & cached spend endpoints.
- Replace assistant stub with real streaming adapter.

---
End quickstart.
