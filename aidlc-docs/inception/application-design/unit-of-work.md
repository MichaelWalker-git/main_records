# Units of Work - Maine Records Management System

## Decomposition Strategy
- **Approach**: Domain-based decomposition aligned with monorepo packages
- **Architecture**: Modular monolith — units map to logical modules within the ECS application + infrastructure packages
- **Build Order**: Sequential with parallel opportunities after foundation is laid

## Unit Definitions

### Unit 1: Infrastructure & Auth
**Package**: `packages/infrastructure/`

**Responsibility**: All AWS infrastructure provisioning and authentication setup

**Scope**:
- VPC with public/private subnets (us-east-1)
- RDS PostgreSQL (Aurora Serverless v2)
- S3 buckets (documents, exports, prompts) with cross-region replication to us-west-2
- OpenSearch domain (single-node for demo)
- Cognito User Pool with SAML/OIDC (mocked AD federation)
- ECS Fargate cluster + services (backend + frontend)
- Lambda function definitions
- SQS queues (classification, ocr, notifications)
- EventBridge rules (retention-alerts, overdue-checker)
- API Gateway
- CloudFront distribution
- KMS keys, WAF, CloudWatch dashboards
- ALB with HTTPS (ACM certificate)

**CDK Stacks**:
| Stack | Resources |
|-------|-----------|
| NetworkStack | VPC, subnets, security groups, NAT gateway |
| DatabaseStack | RDS Aurora PostgreSQL, RDS Proxy |
| StorageStack | S3 buckets, replication rules, lifecycle policies |
| AuthStack | Cognito User Pool, groups, app client, identity provider (mock SAML) |
| SearchStack | OpenSearch domain, access policies |
| ComputeStack | ECS cluster, task definitions, ALB, services |
| MessagingStack | SQS queues, DLQs, EventBridge rules |
| LambdaStack | Lambda functions, layers, event source mappings |
| MonitoringStack | CloudWatch dashboard, alarms, log groups |
| CdnStack | CloudFront, WAF, ACM cert |

**Deliverables**:
- All CDK stacks deployable with `cdk deploy --all`
- Cognito pre-configured with 4 demo users (one per role)
- Database migrations run on deploy via custom resource
- Environment configuration per stage (dev/prod)

---

### Unit 2: Core Records API
**Package**: `packages/backend/` (records, templates, classification, barcode modules)

**Responsibility**: Record CRUD, template management, AI classification orchestration, barcode generation/lookup, database schema

**Scope**:
- PostgreSQL schema (all tables, indexes, constraints)
- Database migrations (Knex.js)
- Records API endpoints (CRUD, batch, classify)
- Template management (create, list, apply)
- Retention schedule configuration
- Barcode generation (bwip-js: Code 128 + QR)
- Barcode/legacy code lookup
- Record tag management
- AI classification trigger (enqueue to SQS)
- OpenSearch indexing (on record create/update)
- Zod validation schemas
- Express middleware (auth, audit, error handling)
- Server entry point and app configuration

**API Endpoints**:
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/records | Create record from template |
| POST | /api/records/batch | Batch import from CSV |
| GET | /api/records | List with filters |
| GET | /api/records/:id | Get record detail |
| PUT | /api/records/:id | Update record |
| POST | /api/records/:id/classify | Trigger AI classification |
| GET | /api/records/:id/barcode | Generate barcode SVG/PNG |
| GET | /api/records/scan/:code | Lookup by barcode value |
| GET | /api/templates | List templates |
| POST | /api/templates | Create template |
| GET | /api/retention-schedules | List schedules |
| POST | /api/retention-schedules | Create schedule |
| PUT | /api/retention-schedules/:id | Update schedule |

**Database Tables** (created in this unit):
- records, record_metadata, record_tags, record_templates
- retention_schedules, schedule_alerts
- agencies, users, roles, user_roles, permissions
- audit_events
- warehouses, locations (schema only — populated by Unit 3)

---

### Unit 3: Workflows & Inventory
**Package**: `packages/backend/` (transmittals, dispositions, inventory, circulation modules)

**Responsibility**: All workflow state machines, warehouse location management, and circulation tracking

**Scope**:
- Transmittal API (create, approve, reject, receive)
- Disposition API (initiate, approve, reject, legal holds)
- Inventory API (locations, assign, relocate, utilization)
- Circulation API (checkout, checkin, overdue, custody history)
- Reference request API (submit, assign, fulfill)
- Workflow state machine logic (status transitions with validation)
- Multi-level approval routing
- Legal hold enforcement (blocks disposition)
- Overdue detection logic
- Notification triggers (enqueue to SQS on status changes)

**API Endpoints**:
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/transmittals | Submit transmittal |
| GET | /api/transmittals | List (filterable by agency/status) |
| GET | /api/transmittals/:id | Detail with items |
| POST | /api/transmittals/:id/approve | Approve |
| POST | /api/transmittals/:id/reject | Reject |
| POST | /api/transmittals/:id/receive | Confirm receipt (barcode scan) |
| POST | /api/dispositions | Initiate disposition |
| GET | /api/dispositions | List pending |
| POST | /api/dispositions/:id/approve | Approve at level |
| POST | /api/dispositions/:id/reject | Reject |
| POST | /api/legal-holds | Apply legal hold |
| DELETE | /api/legal-holds/:id | Remove hold (admin) |
| GET | /api/inventory/locations | Location tree |
| POST | /api/inventory/locations/:code/assign | Assign record |
| GET | /api/inventory/utilization | Capacity report |
| POST | /api/circulation/checkout | Check out record |
| POST | /api/circulation/checkin | Check in record |
| GET | /api/circulation/:recordId/history | Custody history |
| GET | /api/circulation/overdue | Overdue items |
| POST | /api/reference-requests | Submit request |
| GET | /api/reference-requests | List (by agency/status) |
| POST | /api/reference-requests/:id/fulfill | Mark fulfilled |

**Database Tables** (additional):
- transmittals, transmittal_items, transmittal_approvals
- dispositions, disposition_items, disposition_approvals
- legal_holds, legal_hold_records
- circulation_events
- reference_requests

---

### Unit 4: Search & AI
**Package**: `packages/backend/` (search module) + `packages/lambdas/`

**Responsibility**: Search orchestration, AI classification, OCR processing, semantic search, notifications, scheduled jobs

**Scope**:
- Search API (metadata, fulltext, semantic, OCR, facets)
- OpenSearch index configuration and mapping
- Bedrock integration (classification prompts, embeddings)
- Textract integration (OCR pipeline)
- Lambda: ai-classify (SQS-triggered)
- Lambda: ai-ocr (SQS-triggered)
- Lambda: notification-send (SQS-triggered, SES email)
- Lambda: retention-alerts (EventBridge cron - daily)
- Lambda: overdue-checker (EventBridge cron - daily)
- Lambda: report-export (API Gateway triggered)
- AI prompt templates (stored in S3)
- Analytics API (dashboard metrics, reports, export)

**API Endpoints**:
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/search | Metadata search with facets |
| POST | /api/search/fulltext | Full-text content search |
| POST | /api/search/semantic | AI semantic search |
| POST | /api/search/ocr | OCR text search |
| GET | /api/search/facets/:field | Get facet values |
| GET | /api/analytics/dashboard | Dashboard metrics |
| POST | /api/analytics/reports | Generate report |
| GET | /api/analytics/reports/:id/export | Export PDF/Excel/CSV |
| GET | /api/analytics/utilization | Warehouse utilization trends |
| GET | /api/notifications | User notifications |
| PUT | /api/notifications/:id/read | Mark read |

**Lambda Functions**:
| Function | Trigger | Purpose |
|----------|---------|---------|
| ai-classify | SQS (classify-queue) | Invoke Bedrock, update record tags |
| ai-ocr | SQS (ocr-queue) | Invoke Textract, index extracted text |
| notification-send | SQS (notification-queue) | Send email via SES, store in-app |
| retention-alerts | EventBridge (daily 6am) | Scan schedules, queue alerts |
| overdue-checker | EventBridge (daily 8am) | Find overdue items, queue notices |
| report-export | API Gateway | Generate PDF/Excel, upload to S3 |

---

### Unit 5: Frontend & Portal
**Package**: `packages/frontend/`

**Responsibility**: React SPA with role-based views, all UI components, API client

**Scope**:
- React + TypeScript + Vite
- Role-based routing (Admin, Archives Staff, Agency Portal)
- Cognito authentication flow (login, MFA, session)
- Feature modules:
  - Records (list, detail, create, edit, batch import)
  - Transmittals (submit form, workflow queue, status tracking)
  - Dispositions (initiate, approval queue, legal holds)
  - Inventory (location browser, barcode scanner, utilization map)
  - Search (metadata form, semantic input, results with facets)
  - Analytics (dashboard widgets, reports, export)
  - Admin (user management, roles, retention schedules, integrations, audit log)
  - Agency Portal (accession form, reference requests, status dashboard)
- Shared components:
  - DataTable (sortable, filterable, paginated)
  - RecordCard (summary view)
  - BarcodeScanner (HID input listener + camera option)
  - BarcodePrint (label generator)
  - WorkflowStatus (visual pipeline indicator)
  - NotificationBell (real-time alerts)
  - DashboardWidget (configurable metric card)
  - LocationTree (hierarchical warehouse browser)
  - AuditTrail (event timeline)
  - ExportButton (PDF/Excel/CSV)
- API client layer (axios with Cognito token injection)
- Responsive design (desktop + tablet)
- WCAG 2.1 AA (aria labels, keyboard nav, contrast)

**Pages by Role**:

| Role | Pages |
|------|-------|
| System Admin | Dashboard, Users, Roles, Retention Schedules, Audit Log, Integrations, Settings |
| Archives Staff | Workflow Queue, Inventory, Search, Transmittals, Dispositions, Reference Requests, Reports |
| Records Officer | My Agency Dashboard, Submit Transmittal, Track Transfers, Retention Alerts, Check Out/In, Reference Requests |
| Agency Staff | Search Records, Submit Reference Request, Track Requests |

---

## Code Organization (Monorepo)

```
maine-rms/
├── packages/
│   ├── infrastructure/       # Unit 1
│   │   ├── bin/app.ts
│   │   ├── lib/stacks/       # 10 CDK stacks
│   │   ├── config/           # Environment configs
│   │   └── package.json
│   │
│   ├── backend/              # Units 2, 3, 4 (API + Services)
│   │   ├── src/
│   │   │   ├── api/          # Route handlers per module
│   │   │   ├── services/     # Business logic
│   │   │   ├── repositories/ # Data access
│   │   │   ├── middleware/   # Auth, audit, validation
│   │   │   ├── types/        # TypeScript interfaces
│   │   │   ├── config/       # App configuration
│   │   │   └── server.ts     # Express entry point
│   │   ├── migrations/       # Knex.js migrations
│   │   ├── seeds/            # Demo seed data
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── lambdas/              # Unit 4 (serverless workers)
│   │   ├── ai-classify/
│   │   ├── ai-ocr/
│   │   ├── notification-send/
│   │   ├── retention-alerts/
│   │   ├── overdue-checker/
│   │   └── report-export/
│   │
│   ├── frontend/             # Unit 5
│   │   ├── src/
│   │   │   ├── features/     # Feature modules
│   │   │   ├── components/   # Shared components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── services/     # API client
│   │   │   ├── types/        # Frontend types
│   │   │   ├── layouts/      # Role-based layouts
│   │   │   └── App.tsx
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── shared/               # Cross-package types
│       ├── types/
│       ├── constants/
│       └── package.json
│
├── seed-data/                # Synthetic Maine Archives data
│   ├── agencies.json
│   ├── records.json
│   ├── locations.json
│   ├── users.json
│   └── transmittals.json
│
├── scripts/
│   ├── deploy.sh
│   ├── seed-db.sh
│   └── generate-barcodes.sh
│
├── package.json              # Workspaces root
├── tsconfig.base.json
├── .eslintrc.js
└── .prettierrc
```
