# Application Design - Maine Records Management System

## Architecture Style
- **Pattern**: Modular monolith (ECS Fargate) with event-driven satellite functions (Lambda)
- **API Style**: REST (Express.js on ECS behind ALB)
- **Frontend**: React SPA served via ECS/nginx behind ALB
- **Data**: PostgreSQL (relational core + full-text search via tsvector/pg_trgm) + S3 (documents)
- **Async**: SQS queues for AI processing and notifications
- **AI/OCR**: Bedrock Claude (classification) + Bedrock Claude Vision (OCR) — no Textract, no OpenSearch
- **Auth**: Cognito with SAML 2.0/OIDC federation (mocked AD for demo)
- **IaC**: AWS CDK (TypeScript), monorepo with workspace packages

## System Context

```
+-------------------+         +-------------------+
| State Agency      |         | Archives Staff    |
| (Diana, James)    |         | (Michael)         |
+--------+----------+         +--------+----------+
         |                             |
         v                             v
+--------------------------------------------------+
|              Maine RMS (Cloud)                     |
|                                                    |
|  +------------+  +------------+  +-------------+  |
|  | Agency     |  | Archives   |  | Admin       |  |
|  | Portal     |  | Staff UI   |  | Dashboard   |  |
|  +------+-----+  +------+-----+  +------+------+  |
|         |               |               |          |
|         +-------+-------+-------+-------+          |
|                 |                                   |
|          +------v-------+                          |
|          | ALB (HTTPS)   |                          |
|          +------+--------+                          |
|                 |                                   |
|          +------v--------+     +----------------+  |
|          | ECS Backend   |---->| Lambda Workers |  |
|          | (Express.js)  |     | (AI, OCR,      |  |
|          +------+--------+     |  Notify, Cron) |  |
|                 |              +-------+--------+  |
|     +-----------+---+                  |           |
|     |               |          +-------v--------+  |
|  +--v--+        +---v-+       | Bedrock Claude |  |
|  | RDS |        | S3  |       | (Vision + Text)|  |
|  | PG  |        +-----+       +----------------+  |
|  +-----+                                          |
+--------------------------------------------------+
                    |
         +----------+----------+
         |                     |
+--------v-------+   +--------v--------+
| ArchivesSpace  |   | SOM Active Dir  |
| (mocked sync)  |   | (mocked SAML)   |
+-----------------+   +-----------------+
```

## Layer Summary

### Frontend Layer (React + TypeScript)
| Component | Role | Users |
|-----------|------|-------|
| AdminUI | System config, user mgmt, audit, integrations, notifications | System Admin |
| ArchivesStaffUI | Transmittals, inventory, circulation, dispositions, search, fulfillment | Archives Staff |
| AgencyPortalUI | Accession requests, transfer tracking, reference requests | Records Officer, Agency Staff |
| SharedComponents | Data tables, forms, barcode scanner, dashboards, modals | All |

### API Layer (Express.js Routes)
8 API modules: Records, Transmittals, Dispositions, Inventory, Search, Analytics, Users, Integrations

### Service Layer (Business Logic)
9 services: Records, Workflow, Inventory, Search, AI, Notification, Audit, Auth, Report

### Repository Layer (Data Access)
7 repositories abstracting PostgreSQL and S3

### Infrastructure Layer (AWS Services)
PostgreSQL (RDS with tsvector/pg_trgm), S3, Cognito, Bedrock (Claude + Claude Vision), SQS, SES, EventBridge, CloudWatch, KMS

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monolith vs Microservices | Modular monolith | Demo timeline, simpler deployment, single ECS service. Services are cleanly separated for future extraction. |
| ORM | Knex.js (query builder) | Lightweight, full PostgreSQL control, easy migrations. Pattern from vrc-idp. |
| Frontend routing | Role-based layouts with shared auth | Single React app with role-gated routes, not separate deployments |
| Search | PostgreSQL tsvector + pg_trgm | Full-text search without OpenSearch overhead. Sufficient for PoC volume. |
| OCR | Bedrock Claude Vision (Lambda) | Same approach as rudy-paystub-processor. No Textract dependency. |
| Classification | Bedrock Claude (Lambda + direct) | tool_use pattern with structured output. Direct call in dev, SQS->Lambda in prod. |
| Barcode | bwip-js (generation) + HID input (scanning) | No hardware drivers, works with any USB scanner |
| File processing | S3 upload -> SQS -> Lambda | Decoupled, scalable. Pattern from vrc-idp. |
| State machines | In-app (DB-backed status columns) | Simpler than Step Functions for approval chains. Status enum per workflow entity. |
| Audit | Append-only table + middleware | Every mutation logged automatically via Express middleware |

## API Contract Summary

| Module | Base Path | Key Endpoints | Auth |
|--------|-----------|---------------|------|
| Records | /api/records | CRUD, batch, classify, barcode | All authenticated |
| Transmittals | /api/transmittals | Create, approve, reject, receive | Officer+Staff+Admin |
| Dispositions | /api/dispositions | Initiate, approve, legal-holds | Staff+Admin |
| Inventory | /api/inventory | Locations, checkout, checkin, scan, circulation | Staff+Admin |
| Search | /api/search | Metadata, fulltext (PostgreSQL tsvector) | All authenticated |
| Analytics | /api/analytics | Dashboard, reports, export | Admin+Staff |
| Users | /api/users | CRUD, roles, permissions | Admin only |
| Integrations | /api/integrations | Status, sync, config | Admin only |

## Data Model Overview (High-Level)

### Core Entities
- **Record** — central entity (physical or digital), linked to location, schedule, agency
- **Location** — hierarchical (warehouse > row > bay > shelf > position), 8-digit code
- **Transmittal** — transfer request with items, multi-status workflow
- **Disposition** — destruction/archive request with multi-level approval chain
- **LegalHold** — blocks disposition, applied to records/series
- **RetentionSchedule** — configures retention period per record series
- **User** — synced from Cognito, linked to roles and agency
- **AuditEvent** — append-only log of all system actions

### Entity Relationships
```
Agency --< User --< AuditEvent
Agency --< Record >-- RetentionSchedule
Record >-- Location (Warehouse > Row > Bay > Shelf > Position)
Record --< CirculationEvent (checkout/checkin history)
Record --< RecordTag
Record >--< LegalHold
Transmittal --< TransmittalItem >-- Record
Transmittal --< TransmittalApproval
Disposition --< DispositionItem >-- Record
Disposition --< DispositionApproval
```

## Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| Authentication | Cognito JWT validated in Express middleware |
| Authorization | RBAC checked per-route via AuthService |
| Audit logging | Express middleware logs every mutation to audit_events table |
| Error handling | Global error handler with structured error responses |
| Validation | Zod schemas at API boundary |
| Pagination | Cursor-based for large lists, offset-based for admin views |
| Caching | In-memory (node-cache) for dashboard metrics, 5min TTL |
| File uploads | Presigned S3 URLs (client uploads directly to S3) |
| CORS | Configured for ALB domain |
| Rate limiting | ALB connection limits |

## Reference Implementation Patterns Used

| Pattern | Source Repo | Application |
|---------|-------------|-------------|
| Repository facade | vrc-idp | Data access layer abstraction |
| SQS -> Lambda worker | vrc-idp | AI classification pipeline |
| Bedrock Claude Vision OCR | rudy-paystub-processor | Document text extraction via Vision API |
| Cognito RBAC with custom attributes | vrc-idp | Role-based access with agency scoping |
| CDK nested stacks | vrc-idp | Infrastructure decomposition |
| Multi-environment deployment | vrc-idp | dev/staging/prod configs |
| Prompt-as-data (S3) | idp-human-validation | AI classification prompts stored in S3 |
| Human review lifecycle | idp-human-validation | Transmittal/disposition approval flows |
| EventBridge scheduled jobs | idp-human-validation | Retention alerts, overdue checks |