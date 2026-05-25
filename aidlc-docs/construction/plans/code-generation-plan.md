# Code Generation Plan - All Units

## Overview
This plan covers code generation for all 5 units in sequence. Given the demo deadline, all units are generated in a single pass following the dependency order.

## Build Order
1. Monorepo root setup (package.json, tsconfig, shared types)
2. Unit 1: Infrastructure (CDK stacks)
3. Unit 2: Core Records API (backend foundation + records module)
4. Unit 3: Workflows & Inventory (backend workflow modules)
5. Unit 4: Search & AI (backend search + Lambda functions)
6. Unit 5: Frontend & Portal (React SPA)
7. Seed data & deployment scripts

## Step-by-Step Plan

### Phase A: Project Scaffolding
- [x] Step 1: Root package.json (workspaces), tsconfig.base.json, .eslintrc, .prettierrc, .gitignore
- [x] Step 2: Shared types package (packages/shared/)
- [x] Step 3: Seed data structure (seed-data/)

### Phase B: Unit 1 - Infrastructure & Auth
- [x] Step 4: CDK package setup (packages/infrastructure/package.json, bin/app.ts, cdk.json)
- [x] Step 5: NetworkStack (VPC, subnets, security groups)
- [x] Step 6: DatabaseStack (Aurora Serverless, RDS Proxy, Secrets Manager)
- [x] Step 7: StorageStack (S3 buckets, KMS, replication)
- [x] Step 8: AuthStack (Cognito User Pool, groups, demo users)
- [x] Step 9: SearchStack (OpenSearch domain)
- [x] Step 10: MessagingStack (SQS queues, EventBridge rules)
- [x] Step 11: ComputeStack (ECS cluster, services, ALB, ECR)
- [x] Step 12: LambdaStack (Lambda functions, layers)
- [x] Step 13: CdnStack (CloudFront, WAF)
- [x] Step 14: MonitoringStack (CloudWatch, alarms, SNS)

### Phase C: Unit 2 - Core Records API
- [x] Step 15: Backend package setup (packages/backend/package.json, tsconfig, Dockerfile)
- [x] Step 16: Database migrations (Knex.js - all tables)
- [x] Step 17: Server entry point, middleware (auth, audit, error handler, validation)
- [x] Step 18: Repositories (Records, Templates, RetentionSchedules, Audit, Users)
- [x] Step 19: RecordsService + RecordsAPI routes
- [x] Step 20: Template + RetentionSchedule services and routes
- [x] Step 21: Barcode service (generation + lookup)
- [x] Step 22: AuditService + AuthService (middleware)

### Phase D: Unit 3 - Workflows & Inventory
- [x] Step 23: Workflow repositories (Transmittals, Dispositions, LegalHolds, Locations, Circulation, ReferenceRequests)
- [x] Step 24: WorkflowService + Transmittal API routes
- [x] Step 25: Disposition + Legal Hold API routes
- [x] Step 26: InventoryService + Location/Circulation API routes
- [x] Step 27: Reference Request API routes

### Phase E: Unit 4 - Search & AI
- [x] Step 28: SearchService + Search API routes (metadata, fulltext, semantic, OCR)
- [x] Step 29: Lambda: ai-classify (Bedrock integration)
- [x] Step 30: Lambda: ai-ocr (Textract integration)
- [x] Step 31: Lambda: notification-send (SES)
- [x] Step 32: Lambda: retention-alerts + overdue-checker
- [x] Step 33: Lambda: report-export
- [x] Step 34: Analytics API routes (dashboard, reports)

### Phase F: Unit 5 - Frontend & Portal
- [x] Step 35: Frontend package setup (Vite, React, TypeScript, Tailwind, Dockerfile)
- [x] Step 36: App shell (routing, layouts, auth context)
- [x] Step 37: Auth feature (login, MFA, session management)
- [x] Step 38: Shared components (DataTable, RecordCard, BarcodeScanner, WorkflowStatus, etc.)
- [x] Step 39: Records feature (list, detail, create, batch import)
- [x] Step 40: Transmittals feature (submit, queue, tracking)
- [x] Step 41: Dispositions feature (initiate, approve, legal holds)
- [x] Step 42: Inventory feature (location browser, barcode scan, utilization)
- [x] Step 43: Search feature (metadata, semantic, OCR results)
- [x] Step 44: Analytics feature (dashboard, reports, export)
- [x] Step 45: Admin feature (users, roles, schedules, integrations, audit)
- [x] Step 46: Agency Portal feature (accession, reference requests, status)

### Phase G: Integration & Polish
- [x] Step 47: Seed data (agencies, users, records, locations, transmittals)
- [x] Step 48: Deployment scripts (deploy.sh, seed-db.sh)
- [x] Step 49: README with demo setup instructions

## Story Coverage
All 26 stories covered across the steps above. See unit-of-work-story-map.md for mapping.
