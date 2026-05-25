# Component Dependencies - Maine Records Management System

## Dependency Matrix

| Component | Depends On | Depended By |
|-----------|-----------|-------------|
| **RecordsService** | RecordsRepo, AIService, SearchService, AuditService | WorkflowService, InventoryService, SearchService, ReportService |
| **WorkflowService** | TransmittalsRepo, DispositionsRepo, RecordsService, InventoryService, NotificationService, AuditService | API Layer (TransmittalAPI, DispositionAPI) |
| **InventoryService** | LocationsRepo, RecordsRepo, NotificationService, AuditService | WorkflowService, ReportService |
| **SearchService** | SearchRepo (OpenSearch), AIService, RecordsRepo | RecordsService (re-index), API Layer |
| **AIService** | S3, Bedrock, Textract | RecordsService, SearchService |
| **NotificationService** | SES, UsersRepo | WorkflowService, InventoryService, Scheduled Jobs |
| **AuditService** | AuditRepo | All services (cross-cutting) |
| **AuthService** | Cognito, UsersRepo | All API endpoints (middleware) |
| **ReportService** | RecordsRepo, LocationsRepo, TransmittalsRepo, S3 | API Layer (AnalyticsAPI) |

## Data Flow Diagrams

### Flow 1: Record Creation (with AI Classification)

```
Agency Portal              API Gateway         ECS MainApp              SQS              Lambda
     |                         |                    |                    |                  |
     |-- POST /records ------->|                    |                    |                  |
     |                         |-- Auth Check ----->|                    |                  |
     |                         |                    |-- Validate ------->|                  |
     |                         |                    |-- Save to DB       |                  |
     |                         |                    |-- Log Audit        |                  |
     |                         |                    |-- Queue Classify -->|                  |
     |                         |<-- 201 Created ----|                    |                  |
     |<-- Record + "classifying" status             |                    |                  |
     |                         |                    |                    |-- ai-classify --->|
     |                         |                    |                    |                  |-- Bedrock
     |                         |                    |<-- Update tags ----|<-- Result -------|
     |                         |                    |-- Index OpenSearch  |                  |
     |                         |                    |-- Notify user       |                  |
```

### Flow 2: Transmittal Workflow

```
Records Officer      API Gateway      WorkflowService     Archives Staff     InventoryService
     |                    |                  |                    |                  |
     |-- Submit form ---->|                  |                    |                  |
     |                    |-- createTrans -->|                    |                  |
     |                    |                  |-- Save (PENDING)   |                  |
     |                    |                  |-- Notify --------->|                  |
     |<-- TR# + status --|                  |                    |                  |
     |                    |                  |                    |                  |
     |                    |                  |<-- Approve --------|                  |
     |                    |                  |-- Update (APPROVED)|                  |
     |                    |                  |-- Notify officer   |                  |
     |                    |                  |                    |                  |
     |                    |                  |<-- Receive (scan)--|                  |
     |                    |                  |-- assignLocation --|---------------->|
     |                    |                  |                    |                  |-- Update DB
     |                    |                  |-- Update (RECEIVED)|                  |
     |                    |                  |-- Notify officer   |                  |
```

### Flow 3: Semantic Search

```
User                 API Gateway      SearchService        AIService          OpenSearch
  |                      |                 |                   |                  |
  |-- "health dept 2020 licensing" ->|     |                   |                  |
  |                      |-- search ->|    |                   |                  |
  |                      |            |-- generateEmbedding -->|                  |
  |                      |            |                        |-- Bedrock        |
  |                      |            |<-- vector[] -----------|                  |
  |                      |            |-- vector search -------|---------------->|
  |                      |            |<-- scored results -----|<----------------|
  |                      |            |-- enrich with metadata |                  |
  |                      |<-- results with relevance explanation                 |
  |<-- Search results ---|            |                        |                  |
```

### Flow 4: Disposition with Legal Hold Check

```
Archives Staff       WorkflowService      RecordsService       DispositionsRepo
     |                     |                    |                      |
     |-- Initiate -------->|                    |                      |
     |                     |-- Check holds ---->|                      |
     |                     |                    |-- Query legal_holds  |
     |                     |<-- Hold found! ----|                      |
     |<-- BLOCKED: Legal hold exists            |                      |
     |                     |                    |                      |
     |  (After hold removed)                    |                      |
     |-- Initiate -------->|                    |                      |
     |                     |-- Check holds ---->|                      |
     |                     |<-- No holds -------|                      |
     |                     |-- Create disposition --|----------------->|
     |                     |-- Route Level 1 approval                  |
     |                     |-- Notify approver  |                      |
```

## Technology Dependency Graph

```
                    CloudFront (CDN)
                         |
                    ALB (HTTPS)
                    /         \
           ECS Frontend    API Gateway
           (React SPA)         |
                          ECS MainApp
                         /    |    \
                        /     |     \
                  Cognito   RDS    OpenSearch
                    |     (PostgreSQL)  |
              SOM AD (mock)    |      S3
                               |    /    \
                          Migrations  Documents
                                         |
                                    Lambda Workers
                                    /          \
                              Textract      Bedrock
                                              |
                                        Classification
                                        + Embeddings
                                        + Semantic Search

Supporting:
- SQS: async message queues (classification, notifications)
- SES: email delivery
- EventBridge: scheduled jobs (retention alerts, overdue checks)
- CloudWatch: logging + metrics
- KMS: encryption key management
- WAF: web application firewall
- CloudTrail: AWS-level audit
```

## Package Structure (Monorepo)

```
maine-rms/
├── packages/
│   ├── infrastructure/          # CDK stacks (Unit 1)
│   │   ├── lib/
│   │   │   ├── stacks/
│   │   │   │   ├── NetworkStack.ts
│   │   │   │   ├── DatabaseStack.ts
│   │   │   │   ├── StorageStack.ts
│   │   │   │   ├── AuthStack.ts
│   │   │   │   ├── ComputeStack.ts
│   │   │   │   ├── SearchStack.ts
│   │   │   │   ├── MessagingStack.ts
│   │   │   │   └── MonitoringStack.ts
│   │   │   └── app.ts
│   │   └── package.json
│   │
│   ├── backend/                 # API + Services (Units 2, 3, 4)
│   │   ├── src/
│   │   │   ├── api/             # Express route handlers
│   │   │   │   ├── records.ts
│   │   │   │   ├── transmittals.ts
│   │   │   │   ├── dispositions.ts
│   │   │   │   ├── inventory.ts
│   │   │   │   ├── search.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── users.ts
│   │   │   │   └── integrations.ts
│   │   │   ├── services/        # Business logic
│   │   │   │   ├── RecordsService.ts
│   │   │   │   ├── WorkflowService.ts
│   │   │   │   ├── InventoryService.ts
│   │   │   │   ├── SearchService.ts
│   │   │   │   ├── AIService.ts
│   │   │   │   ├── NotificationService.ts
│   │   │   │   ├── AuditService.ts
│   │   │   │   ├── AuthService.ts
│   │   │   │   └── ReportService.ts
│   │   │   ├── repositories/    # Data access
│   │   │   ├── middleware/      # Auth, audit, error handling
│   │   │   ├── types/           # Shared TypeScript types
│   │   │   └── server.ts        # Express app entry
│   │   ├── migrations/          # PostgreSQL migrations
│   │   └── package.json
│   │
│   ├── lambdas/                 # Lambda functions (Unit 4)
│   │   ├── ai-classify/
│   │   ├── ai-ocr/
│   │   ├── notification-send/
│   │   ├── retention-alerts/
│   │   ├── overdue-checker/
│   │   └── report-export/
│   │
│   ├── frontend/                # React SPA (Unit 5)
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── records/
│   │   │   │   ├── transmittals/
│   │   │   │   ├── dispositions/
│   │   │   │   ├── inventory/
│   │   │   │   ├── search/
│   │   │   │   ├── analytics/
│   │   │   │   ├── admin/
│   │   │   │   └── agency-portal/
│   │   │   ├── components/      # Shared UI components
│   │   │   ├── hooks/
│   │   │   ├── services/        # API client
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── shared/                  # Shared types & utilities
│       ├── types/
│       ├── constants/
│       └── package.json
│
├── seed-data/                   # Synthetic demo data
├── scripts/                     # Deployment & utility scripts
├── package.json                 # Root (workspaces)
└── tsconfig.base.json
```
