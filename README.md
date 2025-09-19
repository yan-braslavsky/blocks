# Blocks MVP Web Application

A production-quality cloud cost visibility and optimization platform, starting with AWS spend analysis and an AI assistant that provides actionable recommendations.

## Architecture

- **Frontend**: Next.js (App Router) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js serverless functions with mock data for rapid iteration
- **Data**: Initially mocked, designed for future DynamoDB + S3/Athena integration
- **Deployment**: Serverless-first (OpenNext → CloudFront + Lambda)

## Development Status

### Slice 1 (Current): Mock-First Foundation
- [x] Planning & design artifacts complete
- [ ] Repository scaffolding
- [ ] Contract tests (failing first)
- [ ] Mock backend + frontend shell
- [ ] Mobile-responsive dashboard placeholders
- [ ] AI assistant widget stub

### Future Slices
- Real AWS cost ingestion pipeline
- Streaming assistant responses
- Recommendation engine
- Commitment management
- Export capabilities

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm run test

# Lint and type check
npm run lint
npm run typecheck
```

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