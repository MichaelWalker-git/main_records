# Maine Records Management System

## Role
You are an AWS Expert, Delivery Manager, Account Manager, and Tech Lead with 15 years of experience. You approach this as a seasoned professional who knows how to deliver impressive PoCs on budget.

## Project Overview
This is a **PoC (Prototype)** for the State of Maine, Department of Secretary of State, Maine State Archives (RFP# 202603058). The goal is to demonstrate to the customer what we CAN deliver — not to build the full production system.

**Key principle**: Show capability, don't burn budget. We use Bedrock for real AI features (classification, OCR via Claude Vision, semantic search via embeddings).

## Project Structure (monorepo with npm workspaces)
```
packages/
  shared/       — shared types, constants, roles (@maine-rms/shared)
  backend/      — Express API, Knex migrations, services, repositories
  frontend/     — React SPA (Vite, TailwindCSS, React Query, Recharts)
  infrastructure/ — AWS CDK stacks (TypeScript)
  lambdas/      — 6 Lambda functions (ai-classify, ai-ocr, notification-send,
                  retention-alerts, overdue-checker, report-export)
seed-data/      — JSON fixtures (users, records, agencies, etc.)
scripts/        — deploy.sh, seed-db.sh
aidlc-docs/     — AI-DLC workflow documentation
```

## Cost-Conscious Architecture (PoC Only)

### What we USE:
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + React Query (ECS nginx container)
- **Backend**: Node.js Express + Knex + Zod (ECS Fargate, port 3000)
- **Database**: Aurora Serverless v2 PostgreSQL (with pgvector + tsvector + pg_trgm)
- **Auth**: AWS Cognito (MFA required, 4 groups: admin, staff, records_officer, agency_user)
- **Storage**: S3 (documents, exports, prompts)
- **IaC**: AWS CDK (TypeScript) + cdk-nag (AWS Solutions checks)
- **AI/Classification**: Amazon Bedrock Claude Sonnet (tool_use pattern)
- **OCR**: Bedrock Claude Vision (Lambda)
- **Semantic Search**: Bedrock Titan Embeddings v2 + pgvector (cosine distance)
- **Full-text Search**: PostgreSQL tsvector + pg_trgm
- **Queues**: SQS (classify, ocr, notification) + EventBridge cron

### What we DON'T deploy (cost optimization):
- ~~Amazon OpenSearch~~ → PostgreSQL full-text + pgvector semantic search
- ~~Amazon Textract~~ → Bedrock Claude Vision (own Lambda)
- ~~CloudFront + WAF~~ → ALB direct access for demo
- ~~MonitoringStack~~ → CloudWatch defaults
- ~~QuickSight~~ → Recharts in frontend
- ~~Multi-AZ, cross-region replication~~ → Single region for PoC

Note: SearchStack.ts, CdnStack.ts, MonitoringStack.ts exist in source but are NOT instantiated in bin/app.ts.

## Development Process
This project follows the AI-DLC (AI-Driven Development Life Cycle) workflow. Documentation is in `aidlc-docs/`.

## RFP & Proposal Documents
Located in `Records Management System/` folder:
- `IT-RFP# 202603058 - Records Management System_Final.docx` - The full RFP
- `executive_brief_maine_rms_v4 (1).docx` - Executive brief
- `Final Proposal/` - Submitted proposal files (File1-5)

## Key Commands
```bash
nvm use 22                                          # Node 22 required (.nvmrc)

# Backend
cd packages/backend && npm run dev                  # nodemon + ts-node (hot-reload)
cd packages/backend && npx ts-node src/server.ts    # one-shot start
cd packages/backend && npm test                     # Jest + coverage

# Frontend
cd packages/frontend && npm run dev                 # Vite dev server
cd packages/frontend && npm test                    # Vitest

# Type-checking
npx tsc --noEmit                                    # from any package dir

# Migrations (auto-run on backend start, or manually):
cd packages/backend && npm run migrate
cd packages/backend && npm run migrate:rollback

# Deploy (requires Docker Desktop running)
cd packages/infrastructure && npm run deploy
```

## Document Processing Pipeline
```
Upload PDF/image → presigned S3 URL → S3
  → POST /api/records/:id/upload/confirm
    → SQS ocr-queue → Lambda ai-ocr:
        1. Fetch from S3
        2. PDF → Bedrock native document support (up to ~100 pages)
           Image → Bedrock Claude Vision (base64)
        3. tool_use: extract_document_content → structured output
        4. Store text in records.description (indexed by tsvector)
        5. Forward to SQS classify-queue
    → Lambda ai-classify:
        1. Bedrock Claude Sonnet + tool_use: classify_record
        2. Store category, tags, confidence in PostgreSQL
    → EmbeddingService:
        1. Bedrock Titan Embed v2 → vector(1024)
        2. Store in records.embedding (pgvector, HNSW index)
        3. Enables semantic search via cosine distance
```

## CDK Stacks (7 deployed)
1. NetworkStack — existing VPC lookup (vpc-021f5b9639d42e2bb), security groups (ALB, ECS, Lambda, RDS)
2. DatabaseStack — Aurora Serverless v2 PostgreSQL 16.4 + RDS Proxy + KMS
3. StorageStack — S3 buckets (documents, exports, prompts) + KMS
4. AuthStack — Cognito User Pool + 4 groups + demo users
5. MessagingStack — SQS queues (classify, ocr, notification) + DLQs + EventBridge cron
6. ComputeStack — ECS Cluster + Backend/Frontend Fargate services + ALB + ECR
7. LambdaStack — 6 Lambdas (ai-classify, ai-ocr, notification-send, retention-alerts, overdue-checker, report-export)

## Backend API Routes
All under `/api/` prefix. Auth-protected routes use Cognito JWT + RBAC middleware.
- `/api/auth` — login, token refresh
- `/api/records` — CRUD, upload, search
- `/api/transmittals` — accession workflow
- `/api/dispositions` — retention/destruction workflow
- `/api/inventory` — physical location tracking
- `/api/search` — full-text + semantic search
- `/api/analytics` — dashboard stats
- `/api/users`, `/api/notifications`, `/api/templates`, `/api/integrations`
- `/api/admin/*` — admin-only endpoints
- `/api/agency` — agency portal

## Deployment
```bash
nvm use 22
cd packages/infrastructure
AWS_REGION=us-east-1 cdk deploy --all --profile 039885961427_DeveloperPowerUserAccess
```
Requires Docker Desktop running (CDK builds container images for ECS).

## Estimated Cost: ~$178/month