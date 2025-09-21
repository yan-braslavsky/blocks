# Blocks MVP Web Application

A production-quality cloud cost visibility and optimization platform, starting with AWS spend analysis and an AI assistant that provides actionable recommendations.

## Architecture

- **Frontend**: Next.js (App Router) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js serverless functions with mock data for rapid iteration
- **Data**: Initially mocked, designed for future DynamoDB + S3/Athena integration
- **Deployment**: Serverless-first (OpenNext → CloudFront + Lambda)

## Development Status

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

## Quick Start

> **📋 Detailed Guide**: See [quickstart.md](./specs/001-mvp-web-app/quickstart.md) for comprehensive setup instructions

```bash
# Install all dependencies
npm install

# Start development servers (both frontend:3000 + backend:3001)
npm run dev

# Run all tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Lint and type check
npm run lint
npm run typecheck

# Build for production
npm run build

# Run verification script (lint + typecheck + test + build)
npm run verify
```

### Key URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Dashboard**: http://localhost:3000/app/dashboard
- **Onboarding**: http://localhost:3000/onboarding

### Environment Variables
```bash
# Backend (.env in backend/)
USE_MOCKS=1              # Enable mock data mode
SIMULATE_LATENCY=1       # Add realistic API delays
LATENCY_MS=150           # Latency simulation in ms
LOG_LEVEL=info           # Logging level

# Frontend (.env.local in frontend/)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCKS=1  # Frontend mock mode
```

### Development Server Behavior

The root `npm run dev` command now:

1. Kills any processes currently listening on ports `3000` (frontend) and `3001` (backend) using `lsof` + `kill -9` to avoid stale watchers.
2. Starts the backend (`Fastify` API) on port `3001` and the Next.js frontend on port `3000` in parallel.
3. Cleans up both processes when you press `Ctrl+C`.

If you need to run only one side:

```bash
cd backend && npm run dev   # backend only (port 3001)
cd frontend && npm run dev  # frontend only (port 3000)
```

If you prefer a softer process shutdown strategy in the future (e.g. `SIGTERM` then `SIGKILL`), we can adjust `scripts/dev.sh` accordingly.

## Project Structure

```
blocks/
├── frontend/          # Next.js application
├── backend/           # Node.js API with mock endpoints
├── shared/            # Common types and utilities
├── specs/             # Feature specifications and planning
└── scripts/           # Development and deployment scripts
```

## Technology Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui components
- TanStack Query (state management)
- Zod (runtime validation)

### Backend
- Node.js 20+
- TypeScript
- Fastify/Express (TBD)
- Vitest (testing)
- Mock-first development approach

### Infrastructure (Future)
- AWS CDK (Infrastructure as Code)
- OpenNext (deployment)
- DynamoDB (tenant-partitioned data)
- S3 + Athena (cost data analytics)
- EventBridge + Lambda (ingestion)

## Design Principles

- **Mobile-first**: Responsive design prioritizing mobile experience
- **Test-driven**: Contract tests before implementation
- **Mock-first**: Rapid iteration with deterministic data
- **Accessibility**: WCAG 2.1 AA compliance from day one
- **Performance**: Budgets enforced (3.5s p95 dashboard, 1.5s assistant)
- **Observability**: Structured logging and performance markers

## Documentation

- [Feature Specification](./specs/001-mvp-web-app/spec.md)
- [Implementation Plan](./specs/001-mvp-web-app/plan.md)
- [Tasks Breakdown](./specs/001-mvp-web-app/tasks.md)
- [API Contracts](./specs/001-mvp-web-app/contracts/)
- [Data Model](./specs/001-mvp-web-app/data-model.md)
- [Quick Start Guide](./specs/001-mvp-web-app/quickstart.md)

## Contributing

This is an MVP development phase. All changes should:
1. Reference the constitutional principles in `/memory/constitution.md`
2. Follow test-driven development practices
3. Maintain mobile-first responsive design
4. Include accessibility considerations
5. Update relevant documentation

## License

Proprietary - Internal development only.