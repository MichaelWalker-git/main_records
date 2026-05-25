# Services Architecture - Maine Records Management System

## Service Orchestration Patterns

### Pattern 1: Request-Response (Synchronous)
Used for: Record CRUD, user management, search queries, dashboard data
```
Client → API Gateway → ECS Handler → Service → Repository → PostgreSQL/OpenSearch
```

### Pattern 2: Event-Driven (Asynchronous)
Used for: AI classification, OCR processing, notification delivery, report generation
```
Client → API Gateway → ECS Handler → SQS Queue → Lambda Worker → AI Service/SES
                                                        ↓
                                              Update DB + Notify Client
```

### Pattern 3: Scheduled Jobs
Used for: Retention alerts, overdue notices, compliance checks
```
EventBridge Rule (cron) → Lambda → NotificationService/ComplianceService
```

## Service Definitions

### RecordsService
- **Type**: Core domain service
- **Deployment**: ECS Fargate (main application)
- **Dependencies**: RecordsRepo, AIService, AuditService, SearchService
- **Orchestration**:
  - Record creation: validate template → save record → trigger classification → index in OpenSearch → log audit
  - Batch import: parse CSV → validate rows → bulk insert → queue classification for each → bulk index

### WorkflowService
- **Type**: Orchestration service (state machine)
- **Deployment**: ECS Fargate (main application)
- **Dependencies**: TransmittalsRepo, DispositionsRepo, RecordsService, InventoryService, NotificationService, AuditService
- **Orchestration**:
  - Transmittal flow: create → notify approver → await approval → assign locations → confirm receipt → update inventory
  - Disposition flow: initiate → check legal holds → route to approvers (multi-level) → execute action → generate certificate
  - Reference request: submit → assign to staff → locate record → fulfill → notify requester

### InventoryService
- **Type**: Domain service
- **Deployment**: ECS Fargate (main application)
- **Dependencies**: LocationsRepo, RecordsRepo, NotificationService, AuditService
- **Orchestration**:
  - Check-out: verify availability → record custody change → set return date → log audit
  - Overdue detection (scheduled): query overdue items → send notices → escalate if needed

### SearchService
- **Type**: Aggregation service
- **Deployment**: ECS Fargate (main application)
- **Dependencies**: SearchRepo (OpenSearch), AIService (for semantic), RecordsRepo (fallback)
- **Orchestration**:
  - Metadata search: build OpenSearch query → execute → enrich results with DB metadata
  - Semantic search: generate embedding via Bedrock → vector search in OpenSearch → rank results
  - OCR search: query OCR text index → return with page/location context

### AIService
- **Type**: Integration service (external AWS AI)
- **Deployment**: Lambda (stateless, pay-per-use)
- **Dependencies**: S3 (document storage), Bedrock, Textract
- **Orchestration**:
  - Classification: fetch document from S3 → invoke Bedrock with classification prompt → parse response → return structured tags
  - OCR: invoke Textract on S3 object → collect results → store extracted text → trigger re-index
  - Embedding: invoke Bedrock embedding model → return vector

### NotificationService
- **Type**: Delivery service
- **Deployment**: Lambda (event-driven)
- **Dependencies**: SES (email), SNS (push), UsersRepo (recipient lookup)
- **Orchestration**:
  - Alert processing: load template → resolve recipient → send via SES → store in-app notification
  - Scheduled alerts: scan retention schedules → identify threshold matches → queue notifications

### AuditService
- **Type**: Cross-cutting service
- **Deployment**: ECS Fargate (embedded middleware) + Lambda (export)
- **Dependencies**: AuditRepo (append-only table)
- **Orchestration**:
  - Logging: receive event → enrich with context (IP, session) → append to audit table → replicate to CloudTrail
  - Export: query events → format as JSON/CSV → upload to S3 → return presigned URL

### AuthService
- **Type**: Security service
- **Deployment**: ECS Fargate (middleware)
- **Dependencies**: Cognito, UsersRepo
- **Orchestration**:
  - Authentication: validate JWT → resolve user → load roles/permissions → attach to request context
  - Authorization: extract action + resource → check role permissions → allow/deny

### ReportService
- **Type**: Analytics service
- **Deployment**: Lambda (compute-intensive, on-demand)
- **Dependencies**: RecordsRepo, LocationsRepo, TransmittalsRepo, S3 (report storage)
- **Orchestration**:
  - Dashboard: aggregate metrics from multiple repos → cache results (5min TTL) → return
  - Export: generate report → render to PDF/Excel → upload to S3 → return presigned URL

## Service Communication Matrix

| From → To | Method | When |
|-----------|--------|------|
| RecordsService → AIService | Async (SQS) | On record creation/upload |
| RecordsService → SearchService | Async (SQS) | After record create/update |
| RecordsService → AuditService | Sync (in-process) | Every operation |
| WorkflowService → NotificationService | Async (SQS) | On status changes |
| WorkflowService → InventoryService | Sync | On transmittal receipt |
| WorkflowService → RecordsService | Sync | On disposition execution |
| InventoryService → NotificationService | Async (SQS) | Overdue detection |
| SearchService → AIService | Sync (Bedrock) | Semantic search queries |
| AuthService → all services | Sync (middleware) | Every request |
| AuditService ← all services | Sync (in-process) | Every mutation |

## Deployment Topology

```
ECS Cluster (Fargate)
├── MainApp Service (2 tasks min)
│   ├── RecordsService
│   ├── WorkflowService
│   ├── InventoryService
│   ├── SearchService
│   ├── AuthService (middleware)
│   ├── AuditService (middleware)
│   └── ReportService (light queries)
│
└── Frontend Service (2 tasks min)
    └── React SPA (served via nginx)

Lambda Functions
├── ai-classify (triggered by SQS)
├── ai-ocr (triggered by SQS)
├── notification-send (triggered by SQS)
├── retention-alert-scheduler (EventBridge cron)
├── overdue-checker (EventBridge cron)
└── report-export (triggered by API Gateway)
```
