# Blocks — MVP Specification & Source of Truth (v0.1)

> Owner: Yan Braslavsky  
> Date: 2025‑09‑18  
> Context: Consolidated from project discussions, PRD notes, architecture threads, and our framework decision (Next.js).

---

## 0. One‑page Summary

**Problem**: Cloud costs are opaque, hard to optimize, and savings vehicles (e.g., SP/RI) are under‑utilized by SMEs.  
**Solution**: Blocks is a web app that guarantees **20% savings from day one** by (1) moving billing under our organization so we become the vendor of record; (2) automatically buying and right‑sizing Savings Plans (and later RIs/commitments) across multi‑account AWS setups; (3) surfacing insights and nudges via an AI assistant ("Major Tom").  
**Users**: Finance leads, founders, DevOps/SRE/Platform engineers.  
**MVP KPI**: Demonstrable **20% net savings** within the first billing cycle; active connections; weekly retained usage of dashboard & chat.  
**Tech Stack**: **Next.js (App Router, TS)** on AWS (CloudFront + S3 + Lambda@Edge via OpenNext), API on AWS (API GW + Lambda), data layer (S3/CUR + Athena/Glue + DynamoDB + EventBridge + SQS), auth via Cognito, observability via CloudWatch.

---

## 1. Goals & Non‑Goals

### 1.1 MVP Goals
- Deliver a **web app** that:
  - Onboards users and connects AWS (read‑only role for data; separate delegated billing/vendor-of-record path).
  - Ingests **hourly** cost & usage with max available granularity (CUR preferred; Cost Explorer/CloudWatch as supplements).
  - Shows **current spend** and **projected spend after 20% discount** with time filters (daily/weekly/monthly/YTD).
  - Provides a **Savings Dashboard** with "before vs. after" and category placeholders (containers/K8s/DB/Storage...).
  - Exposes **recommendations** (rightsizing, commitment posture, idle/underutilized signals) — rule‑based initial pass.
  - Offers **Major Tom** chat for explanations and next steps, with streaming answers and link‑outs to graphs.
- Back office capability to **analyze, purchase, and monitor** Savings Plans on behalf of the customer (automation pipeline).

### 1.2 Non‑Goals (MVP)
- Full multi‑cloud parity (Azure/GCP UI placeholders only).  
- Deep K8s/node/container telemetry (beyond cost allocation lenses).  
- Automated remediation that changes customer infrastructure (beyond SP purchase under Blocks org).

---

## 2. Personas & User Stories

**Finance Lead**: wants predictable lower bill, quick proof of savings, CSV export for accounting.  
**DevOps/Platform**: wants trustworthy data, account/OU scoping, anomaly alerts, and safe optimization actions.  
**Founder/CTO**: wants an at‑a‑glance trend, defensible savings story for investors.

**Top Stories**
1. As a user, I can **sign up** and **log in** securely.  
2. I can **connect my AWS** via a guided role creation (read‑only data) and opt into **vendor-of-record** flow.  
3. System ingests historical + ongoing **CUR** and **Cost Explorer** data.  
4. I can view **current spend** and **projected 20% discount** across time ranges.  
5. I can see a **Savings Dashboard** with before/after and category drilldowns.  
6. I can open **Major Tom** in the bottom‑right to ask: "Where does savings come from? What should I do next?"  
7. Back office can evaluate and **purchase Savings Plans**; users see status and effect.

Acceptance criteria attached to each feature below.

---

## 3. System Architecture (AWS‑native)

### 3.1 High‑Level Components
- **Client**: Next.js app (App Router, TS)
  - CSR for dashboards; ISR/SSR for marketing.
  - Major Tom chat widget (bottom‑right), streaming via edge Route Handler.
- **Backend/API**: API Gateway + Lambda (Node/TS) + Route53 domain.
- **Auth**: Cognito User Pool + Hosted UI (OIDC/OAuth), JWT to front-end, middleware gate in Next.js.
- **Data Ingestion**:
  - **CUR (Cost & Usage Report)** delivered to **S3** (customer or Blocks bucket via cross‑account policy).  
  - **AWS Glue** crawler creates tables; **Athena** queries for hourly granularity.  
  - **Cost Explorer** API for supplemental metrics and backfill; **CloudWatch** for alarms/trends.
- **Processing/Jobs**:
  - **EventBridge** schedules (hourly/daily); **Lambda** ETL/aggregation; **SQS** for batch fan‑out.  
  - **DynamoDB** stores tenants, connections, entitlements, computed aggregates and recs.
- **Savings Plan Automation**:
  - Analyzer (Lambda) builds purchase plan per tenant; human‑in‑the‑loop approval (MVP) → purchase via Organizations/Billing APIs under Blocks org; monitor coverage & utilization.
- **Observability**: CloudWatch Logs/Metrics/Alarms, X‑Ray traces; cost guardrails.
- **Deployment**: OpenNext → CloudFront + S3 + Lambda@Edge/Lambda; CI via GitHub Actions.

### 3.2 Multi‑Account Support
- Support **AWS Organizations**/OUs and standalone multi‑account customers.  
- Cross‑account **read‑only IAM role** created by customer; Blocks assumes role to read CUR bucket or CE.  
- **Tenant model** captures: orgId, master/payer account, linked accounts, CUR bucket location, Athena catalog, tags/Cost Categories.

### 3.3 Security & Compliance
- Least‑privilege IAM; separate roles for: data‑read, analysis, purchase (restricted).  
- PII minimal; region preference EU; encryption at rest (S3 SSE‑KMS, DynamoDB), in transit (TLS).  
- Audit logs for assumption of roles & purchases; SOC2‑ready controls roadmap.

---

## 4. Data Model (MVP)

**Tenant**: id, name, billing_mode (Blocks‑vendor | self), org_structure, cur_source, created_at.  
**Account**: id, tenant_id, aws_account_id, ou_path, active.  
**Connection**: tenant_id, role_arn, external_id, scopes (data_read, purchase), status.  
**SpendAggregate**: tenant_id, ts_hour, service, usage_type, cost, amortized_cost, tags_json.  
**SavingsProjection**: tenant_id, period, baseline_cost, projected_cost, delta_pct.  
**Recommendation**: id, tenant_id, type (rightsizing, SP posture, idle), rationale, expected_savings, status.  
**SPPosition**: tenant_id, commitment, coverage_pct, utilization_pct, term, recommendations.

---

## 5. Frontend Application (Next.js)

### 5.1 Rationale
- Hybrid rendering (SEO + dynamic app), serverless API surface, edge streaming for chat. Chosen over a plain React SPA to simplify server endpoints, auth, and SSR/ISR without extra BFF.

### 5.2 Pages & Routes
- `/` (Marketing) — ISR, public
- `/auth/*` — Cognito Hosted UI callback
- `/app` (Authed layout)  
  - `/app/dashboard` — Spend & Savings (CSR + server prefetch)
  - `/app/connect-aws` — Guided role setup, validation checks
  - `/app/recommendations` — List + details
  - `/app/chat` — Major Tom full view (widget also present globally)

### 5.3 UI/UX
- **Design**: Tailwind + shadcn/ui; Recharts for graphs.  
- **Filters**: Daily/Weekly/Monthly/YTD; account/OU; service; tag; region.  
- **Exports**: CSV; link to Athena query for parity.  
- **Chat**: Streaming tokens; inline charts; “explain this view” deep link.

### 5.4 State/Data
- TanStack Query for data fetching; Zod for schema validation; JWT decoding middleware for tenant context; optimistic UI for rec status changes.

---

## 6. Onboarding & AWS Connection

### 6.1 Flow
1. Sign up → verify email (Cognito).  
2. Create Workspace (tenant).  
3. **Connect AWS**: guided CloudFormation/IaC snippet creates a **read‑only cross‑account role** and optional **CUR** configuration to target an S3 bucket (customer or Blocks).  
4. Validate connection (STS assume‑role probe, list CUR bucket/object, check Athena table).  
5. (Optional) Accept **vendor‑of‑record** terms; initiate org/billing linkage (off‑app support for MVP).  
6. Initial backfill (last 12–24 months if CUR available; else CE backfill limits).  
7. Dashboard unlock + Major Tom onboarding tips.

### 6.2 IAM Minimum (Data)
- `sts:AssumeRole` trust to Blocks account; permissions to read CUR S3, Glue/Athena read, Cost Explorer read, CloudWatch read.  
- Separate role for purchase actions (tightly scoped, only when customer opts‑in and contracts permit).

---

## 7. Ingestion, Storage, and Processing

### 7.1 Sources
- **CUR** (preferred; hourly granularity): S3 → Glue Crawler → Athena.  
- **Cost Explorer**: API for coverage, savings plans metrics, and backfill where CUR missing.  
- **CloudWatch**: optional signals for anomalies.

### 7.2 Pipelines
- **Backfill**: For each tenant, enumerate partitions by month/day/hour in CUR; load to **SpendAggregate**.  
- **Incremental**: EventBridge hourly kicks Lambda to pull latest CUR partitions; dedupe on (tenant, hour, usage_type).  
- **Projection Engine**: Simulate 20% discount baseline vs. projected; later incorporate SP optimization curve.

### 7.3 Data Access
- API endpoints (signed) expose aggregates per filter; Athena passthrough queries for advanced users with guardrails; cache hot aggregates in DynamoDB.

---

## 8. Savings Plan Automation (MVP)

### 8.1 Analyzer
- Inputs: hourly spend by compute families (EC2/Fargate/Lambda), historical variability, growth trend, coverage & utilization metrics.  
- Output: recommended commitment (hourly rate), term (1/3‑year), payment option, expected coverage/utilization bands.

### 8.2 Workflow
- Generate plan → internal review (human-in-loop) → purchase via Blocks org where customer is linked → monitor coverage/utilization → adjust via additional purchases or pause (where allowed).  
- Customer UI shows state: *Analyzing → Pending Approval → Purchased → Monitoring*.

### 8.3 Guardrails
- Max commitment cap per tenant; anomaly detection before purchase; rollback playbook.  
- Audit logs + notifications.

---

## 9. Major Tom (AI Assistant)

### 9.1 Capabilities (MVP)
- Answer “where did savings come from,” explain charts, surface top 3 actions.  
- Retrieve aggregates and recommendations via internal API; generate concise, auditable responses with links to UI views.  
- Streamed responses for responsiveness; rate limit per tenant.

### 9.2 Future
- Natural‑language querying over Athena with guarded SQL generation; proactive insights and digests; human handoff.

---

## 10. APIs (Initial Contract)

**Auth**: Cognito Hosted UI; token exchange → JWT (tenant_id, roles).  
**GET /api/spend**: query by time range, granularity, filters; returns series + totals.  
**GET /api/projection**: baseline vs. discounted summary.  
**GET /api/recommendations**: list + details.  
**POST /api/chat** (stream): prompt → references + text chunks.  
**POST /api/ingest/test-connection**: validate role/CUR/Athena.  
**POST /api/tenant/setup**: kick off backfill.

> All endpoints require tenant‑scoped JWT; enforce RLS in handlers.

---

## 11. Product Requirements (Detailed)

### 11.1 Dashboard
- **Must** display: Current spend, Projected spend (20% discount), delta %, trend charts.  
- Filters: time (D/W/M/YTD), account/OU, service, tag, region.  
- Empty state with sample data until backfill completes.  
- **Acceptance**: With a connected tenant and at least 48h data, the delta% reflects expected 20% discount within ±1% rounding.

### 11.2 Recommendations
- Categories: rightsizing (instance family hints), commitment posture (SP coverage), idle/low‑utilization.  
- Each rec shows: rationale, expected savings, steps (manual), and status.  
- **Acceptance**: At least one actionable rec appears for >60% of tenants with >$1k monthly compute.

### 11.3 Connect AWS Flow
- Provides one‑click **CloudFormation** stack link with ExternalId, RoleName, Policy doc preview.  
- Validates permissions; shows green checks.  
- **Acceptance**: Median time to connect < 10 minutes; errors surfaced with remediation steps.

### 11.4 Major Tom
- Chat widget docked bottom‑right across app; opens over content without obscuring key controls.  
- Answers with referenced charts/links; supports copy/export.  
- **Acceptance**: p95 first token < 1.5s; hallucination complaints < 3% of sessions (qualitative tracking initially).

---

## 12. Non‑Functional Requirements

- **Performance**: P95 page load TTI < 3.5s on avg EU connection; API P95 < 600ms for cached aggregates.  
- **Availability**: 99.9% for frontend + API; graceful degradation when CUR delayed.  
- **Security**: SOC2‑aligned controls; per‑tenant data isolation; encryption everywhere.  
- **Privacy/Region**: EU data residency when possible; configurable.

---

## 13. Deployment & CI/CD

- Repo: `countxvat/jtl-api` (API) + `blocks-web` (frontend).  
- CI: GitHub Actions → lint/test/typecheck → OpenNext build → deploy to dev/stage/prod.  
- Feature flags for recommendations/AI.

---

## 14. Analytics & Observability

- Product analytics: events for connect‑flow, dashboard views, chat usage.  
- Ops: CloudWatch metrics/dashboards; alarms for ingest lag, API error rate, SP coverage dips.  
- Cost: internal dashboard for Blocks infra vs. revenue.

---

## 15. Legal & Contracts (MVP assumptions)

- Terms enabling **vendor-of-record** and SP purchasing on behalf of customer.  
- Data processing addendum (EU).  
- SLA disclosure and savings guarantee language.

---

## 16. Roadmap (Next 90 Days)

1. **Week 0‑2**: Skeleton app (Next.js), Cognito auth, tenant model, connect‑flow UI, role validation endpoint.  
2. **Week 2‑4**: CUR ingestion, Athena catalog, baseline dashboards; projection engine (flat 20%).  
3. **Week 4‑6**: Recommendations v1 (rules), Major Tom v1 (explain + top 3 actions).  
4. **Week 6‑8**: Back office SP analyzer + human‑approval purchase path; monitoring UI.  
5. **Week 8‑12**: Exports, alerts, anomaly spikes; polish, docs, sales demo environment.

---

## 17. Open Questions & Assumptions

- CUR location: prefer customer bucket vs. centralized Blocks bucket? Start with customer bucket + cross‑account access.  
- Historical depth: target 12–24 months where available; CE backfill limits when CUR missing.  
- Vendor-of-record: exact onboarding steps vary; document playbook and make UI status transparent.

---

## 18. Appendix

- **IAM Policy Templates** (data‑read, purchase‑scoped).  
- **CloudFormation Snippets** for role creation.  
- **Athena DDL** for CUR tables.  
- **Sample Queries** for aggregates.  
- **Error Catalog** for connect‑flow and ingestion.

\- End of v0.1 -

