# Blocks MVP Web Application

Cloud cost visibility and optimization platform (MVP) focused on AWS spend analysis and an AI assistant that returns actionable recommendations.

---

## 1. Local Development (Start Here)

### Prerequisites
- `Node.js >= 20` (check with `node -v`)
- `npm >= 9`
- macOS/Linux shell (scripts use `bash` + `lsof`)
- Recommended: `docker` (optional for container build validation)

### One‑Command Startup
```bash
git clone https://github.com/yan-braslavsky/blocks.git
cd blocks
npm install               # installs all workspaces (frontend, backend, shared)
npm run dev               # starts backend (3001) + frontend (3000)
```

Then visit:
- App shell / dashboard: http://localhost:3000/app/dashboard
- Assistant widget: open dashboard and interact
- Backend health: http://localhost:3001/health

Press `Ctrl+C` to stop both processes (the wrapper script cleans them up).

### Running Only One Side
```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

### Environment Variables
Create `backend/.env` and `frontend/.env.local` as needed (defaults work without them):
```bash
# backend/.env
USE_MOCKS=1              # Keep mock data mode on for local dev
SIMULATE_LATENCY=1       # Adds delay to simulate network
LATENCY_MS=150           # Delay in ms if simulation enabled
LOG_LEVEL=info

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCKS=1
```

### Available Root Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Parallel dev (kills stale 3000/3001, starts backend + frontend) |
| `npm run test` | Runs all workspace unit/contract tests |
| `npm run test:e2e` | Playwright end‑to‑end tests (`tests/e2e`) |
| `npm run lint` | ESLint across workspaces |
| `npm run typecheck` | TypeScript `--noEmit` across workspaces |
| `npm run build` | Builds all workspaces (tsc + Next) |
| `npm run verify` | Sequential: lint → typecheck → test → build |
| `npm run clean` | Cleans build artifacts + root `node_modules` |

### Workspace-Specific Scripts
Backend (`backend/`): `dev`, `build`, `start`, `test`, `test:watch`, `typecheck`  
Frontend (`frontend/`): `dev`, `build`, `start`, `test`, `test:watch`, `lint`, `typecheck`  
Shared (`shared/`): types/utilities only (no runtime server).

### Verification Pipeline Locally
```bash
npm run verify
```
If something fails, the script tells you next remediation steps (auto‑colored output).

### Docker (Local Production Approximation)
Build and run both services in containers (uses ports 8080 backend, 3000 frontend):
```bash
docker compose build
docker compose up
```
Endpoints:
- Backend (prod-style) API root: http://localhost:8080/
- Backend health: http://localhost:8080/health
- Frontend app: http://localhost:3000

Stop containers:
```bash
docker compose down
```

### Testing
```bash
# All unit + contract tests
npm test

# Watch mode (example: backend)
cd backend && npm run test:watch

# Playwright E2E
npm run test:e2e

# Debug a single Playwright test
npx playwright test tests/e2e/dashboard.spec.ts --debug
```

### Linting & Type Safety
```bash
npm run lint -- --fix
npm run typecheck
```

---

## 2. Current Development Status

### Slice 1: Mock-First Foundation (85% Complete)

| Phase | Status | Key Deliverables |
|-------|--------|------------------|
| **3.1 Foundations & Repo Scaffolding** | ✅ Complete | Monorepo setup, CI/CD, design tokens |
| **3.2 Contract & Integration Tests** | ✅ Complete | Failing tests for all endpoints |
| **3.3 Mock Backend & Core UI** | ✅ Complete | API handlers, React components, routing |
| **3.4 Interaction & State Enhancements** | ✅ Complete | Filters, freshness, accessibility, middleware |
| **3.5 Hardening, Observability & Polish** | 🔄 In Progress | Performance monitoring, dark mode, validation |

#### Completed Features ✅
- [x] Complete monorepo setup with TypeScript, ESLint, Prettier
- [x] GitHub Actions CI/CD pipeline
- [x] Comprehensive contract test suite (9 API endpoints)
- [x] Mock backend with realistic fixtures and latency simulation
- [x] Responsive frontend shell with Next.js App Router
- [x] Dashboard with KPI cards and spend visualization placeholders
- [x] AI assistant widget with mock streaming responses
- [x] AWS connection setup flow
- [x] Mobile-first responsive design system
- [x] Data freshness indicators and status banners
- [x] Accessibility audit tooling and ARIA compliance
- [x] Structured logging and error handling middleware
- [x] Performance monitoring with custom metrics collection

#### In Progress 🔄
- [ ] Dark mode support with system preference detection
- [ ] Role-based access control constants
- [ ] CSV export functionality
- [ ] Audit event tracking
- [ ] Final integration smoke tests

#### Architecture Highlights
- **Contract-First**: All 9 API endpoints have comprehensive validation tests
- **Mock Streaming**: Simulated streaming responses for assistant interactions
- **Performance Budget**: FCP <3.5s, Assistant <1.5s with monitoring
- **Mobile Responsive**: Tested across viewport sizes with Playwright
- **Accessibility**: WCAG 2.1 AA compliance with automated testing

### Future Slices
- Real AWS cost ingestion pipeline
- Streaming assistant responses with citations
- Advanced recommendation engine
- Commitment management
- Export capabilities and reporting

## 3. Architecture Overview

- **Frontend**: Next.js (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query
- **Backend**: Fastify (TypeScript), mock-first endpoints
- **Shared**: Cross-cutting types (`@blocks/shared`)
- **Data**: Mock JSON fixtures → future DynamoDB + S3/Athena ingestion
- **Deployment Target (Planned)**: OpenNext → CloudFront + Lambda (serverless-first)

### Ports & Runtime Summary
| Mode | Frontend | Backend | Notes |
|------|----------|---------|-------|
| Local dev (`npm run dev`) | 3000 | 3001 | Mock mode enabled |
| Docker compose | 3000 | 8080 | Production build images |

## 4. Project Structure

```
blocks/
├── frontend/          # Next.js app (App Router)
├── backend/           # Fastify API (mock endpoints)
├── shared/            # Types & shared utilities
├── specs/             # Feature specs + plans
├── scripts/           # Dev + verification scripts
└── k8s/               # (Future) deployment manifests
```

## 5. Technology Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- TanStack Query
- Zod validation

### Backend
- Fastify (TypeScript)
- Zod schema validation
- Structured logging middleware
- Mock‑first strategy

### Future Infra Targets
- OpenNext + CloudFront + Lambda
- DynamoDB (entity + tenant partitioning)
- S3 + Athena (cost dataset)
- EventBridge + Lambda ingestion
- AWS CDK (IaC)

## 6. Design Principles

- **Mobile-first**: Responsive design prioritizing mobile experience
- **Test-driven**: Contract tests before implementation
- **Mock-first**: Rapid iteration with deterministic data
- **Accessibility**: WCAG 2.1 AA compliance from day one
- **Performance**: Budgets enforced (3.5s p95 dashboard, 1.5s assistant)
- **Observability**: Structured logging and performance markers

## 7. Documentation

- [Feature Specification](./specs/001-mvp-web-app/spec.md)
- [Implementation Plan](./specs/001-mvp-web-app/plan.md)
- [Tasks Breakdown](./specs/001-mvp-web-app/tasks.md)
- [API Contracts](./specs/001-mvp-web-app/contracts/)
- [Data Model](./specs/001-mvp-web-app/data-model.md)
- [Quick Start Guide](./specs/001-mvp-web-app/quickstart.md)

## 8. Contributing

This is an MVP development phase. All changes should:
1. Reference the constitutional principles in `/memory/constitution.md`
2. Follow test-driven development practices
3. Maintain mobile-first responsive design
4. Include accessibility considerations
5. Update relevant documentation

## 9. License

Proprietary - Internal development only.