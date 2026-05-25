# Components - Maine Records Management System

## Component Architecture Overview

```
+------------------------------------------------------------------+
|                        FRONTEND LAYER                              |
+------------------------------------------------------------------+
| AdminUI | ArchivesStaffUI | AgencyPortalUI | SharedComponents    |
+------------------------------------------------------------------+
                              |
                        API Gateway
                              |
+------------------------------------------------------------------+
|                        API LAYER                                   |
+------------------------------------------------------------------+
| RecordsAPI | TransmittalAPI | DispositionAPI | InventoryAPI      |
| SearchAPI  | AnalyticsAPI   | UserAPI        | IntegrationAPI    |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      SERVICE LAYER                                 |
+------------------------------------------------------------------+
| RecordsService | WorkflowService | InventoryService              |
| SearchService  | AIService       | NotificationService           |
| AuditService   | AuthService     | ReportService                 |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                    REPOSITORY LAYER                                |
+------------------------------------------------------------------+
| RecordsRepo | LocationsRepo | TransmittalsRepo | UsersRepo       |
| AuditRepo   | SchedulesRepo | DispositionsRepo  | SearchRepo     |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                   INFRASTRUCTURE LAYER                             |
+------------------------------------------------------------------+
| PostgreSQL (RDS) | S3 | OpenSearch | Cognito | Textract | Bedrock|
+------------------------------------------------------------------+
```

## Component Definitions

### 1. Frontend Components

#### 1.1 AdminUI
- **Purpose**: System administration interface
- **Responsibilities**: User management, RBAC configuration, retention schedule setup, system settings, audit log viewing, integration dashboard
- **Users**: Sarah (System Admin)

#### 1.2 ArchivesStaffUI
- **Purpose**: Daily operations interface for Archives personnel
- **Responsibilities**: Process transmittals, manage warehouse inventory, fulfill reference requests, barcode scanning, disposition workflows, record search
- **Users**: Michael (Archives Staff)

#### 1.3 AgencyPortalUI
- **Purpose**: Self-service portal for state agencies
- **Responsibilities**: Submit accession requests, track transfers, submit reference requests, view agency records, retention alerts
- **Users**: Diana (Records Officer), James (Agency Staff)

#### 1.4 SharedComponents
- **Purpose**: Reusable UI components across all portals
- **Responsibilities**: Navigation, search bar, record cards, data tables, form components, barcode scanner input, dashboard widgets, notification bell, audit trail viewer

### 2. API Layer Components

#### 2.1 RecordsAPI
- **Purpose**: CRUD operations for records and templates
- **Endpoints**: /records, /records/{id}, /records/batch, /templates, /classifications

#### 2.2 TransmittalAPI
- **Purpose**: Transmittal form submission and processing
- **Endpoints**: /transmittals, /transmittals/{id}, /transmittals/{id}/approve, /transmittals/{id}/receive

#### 2.3 DispositionAPI
- **Purpose**: Disposition workflow management
- **Endpoints**: /dispositions, /dispositions/{id}/approve, /legal-holds, /legal-holds/{id}

#### 2.4 InventoryAPI
- **Purpose**: Warehouse location and circulation management
- **Endpoints**: /locations, /locations/{code}, /inventory, /circulation/checkout, /circulation/checkin, /scan

#### 2.5 SearchAPI
- **Purpose**: Search operations across all record types
- **Endpoints**: /search, /search/semantic, /search/ocr, /search/facets

#### 2.6 AnalyticsAPI
- **Purpose**: Dashboard data and report generation
- **Endpoints**: /analytics/dashboard, /analytics/reports, /analytics/export, /analytics/utilization

#### 2.7 UserAPI
- **Purpose**: User and role management
- **Endpoints**: /users, /users/{id}, /roles, /permissions, /sessions

#### 2.8 IntegrationAPI
- **Purpose**: External system integration endpoints
- **Endpoints**: /integrations, /integrations/{name}/status, /integrations/{name}/sync

### 3. Service Layer Components

#### 3.1 RecordsService
- **Purpose**: Core records business logic
- **Responsibilities**: Record creation with template validation, classification orchestration, retention schedule assignment, record lifecycle state management

#### 3.2 WorkflowService
- **Purpose**: Multi-step workflow orchestration
- **Responsibilities**: Transmittal approval workflows, disposition approval workflows, reference request fulfillment, state machine transitions, notification triggers

#### 3.3 InventoryService
- **Purpose**: Physical location and circulation management
- **Responsibilities**: Location assignment, barcode generation/lookup, check-in/check-out, overdue detection, utilization calculations

#### 3.4 SearchService
- **Purpose**: Search orchestration across multiple backends
- **Responsibilities**: Route queries to OpenSearch (full-text) or Bedrock (semantic), aggregate results, manage facets, handle OCR text indexing

#### 3.5 AIService
- **Purpose**: AI/ML operations coordination
- **Responsibilities**: Document classification via Bedrock, OCR via Textract, semantic search embedding, auto-tagging, confidence scoring

#### 3.6 NotificationService
- **Purpose**: Alert and notification delivery
- **Responsibilities**: Retention alerts (90/30/7 day), overdue notices, workflow status updates, email delivery (SES), in-app notifications

#### 3.7 AuditService
- **Purpose**: Comprehensive audit trail management
- **Responsibilities**: Log all user actions, tamper-proof storage, query audit events, export for SIEM, retention compliance

#### 3.8 AuthService
- **Purpose**: Authentication and authorization
- **Responsibilities**: Cognito integration, SAML/OIDC flow, role resolution, permission checking, session management, MFA enforcement

#### 3.9 ReportService
- **Purpose**: Report generation and export
- **Responsibilities**: Dashboard metric aggregation, PDF/Excel/CSV export, custom report templates, scheduled report execution

### 4. Repository Layer Components

#### 4.1 RecordsRepo
- **Purpose**: Records table CRUD with PostgreSQL
- **Tables**: records, record_metadata, record_tags, record_templates

#### 4.2 LocationsRepo
- **Purpose**: Warehouse location management
- **Tables**: warehouses, locations, location_hierarchy

#### 4.3 TransmittalsRepo
- **Purpose**: Transmittal data access
- **Tables**: transmittals, transmittal_items, transmittal_approvals

#### 4.4 DispositionsRepo
- **Purpose**: Disposition workflow data
- **Tables**: dispositions, disposition_approvals, legal_holds

#### 4.5 UsersRepo
- **Purpose**: User and role data (synced from Cognito)
- **Tables**: users, roles, user_roles, permissions

#### 4.6 SchedulesRepo
- **Purpose**: Retention schedule configuration
- **Tables**: retention_schedules, schedule_alerts

#### 4.7 AuditRepo
- **Purpose**: Audit event storage
- **Tables**: audit_events (append-only)

#### 4.8 SearchRepo
- **Purpose**: OpenSearch index management
- **Interface**: OpenSearch client for indexing and querying
