# Maine Records Management System

## Role
You are an AWS Expert, Delivery Manager, Account Manager, and Tech Lead with 15 years of experience. You approach this as a seasoned professional who knows how to deliver impressive PoCs on budget.

## Project Overview
This is a **PoC (Prototype)** for the State of Maine, Department of Secretary of State, Maine State Archives (RFP# 202603058). The goal is to demonstrate to the customer what we CAN deliver — not to build the full production system.

**Key principle**: Show capability, don't burn budget. We use Bedrock for real AI features (classification, OCR via Claude Vision, semantic search via embeddings).

## Cost-Conscious Architecture (PoC Only)

### What we USE:
- **Frontend**: React + TypeScript + Vite + TailwindCSS (ECS nginx container)
- **Backend**: Node.js Express (ECS Fargate)
- **Database**: Aurora Serverless v2 PostgreSQL (with pgvector + tsvector + pg_trgm)
- **Auth**: AWS Cognito (MFA required, 4 user groups)
- **Storage**: S3 (documents, exports, prompts)
- **IaC**: AWS CDK (TypeScript)
- **AI/Classification**: Amazon Bedrock Claude Sonnet (tool_use pattern)
- **OCR**: Bedrock Claude Vision (Lambda, same approach as rudy-paystub-processor / vrc-idp)
- **Semantic Search**: Bedrock Titan Embeddings v2 + pgvector (cosine distance)
- **Full-text Search**: PostgreSQL tsvector + pg_trgm
- **Queues**: SQS (classify, ocr, notification) + EventBridge cron

### What we DON'T deploy (cost optimization):
- ~~Amazon OpenSearch~~ → PostgreSQL full-text + pgvector semantic search
- ~~Amazon Textract~~ → Bedrock Claude Vision (own Lambda, same as vrc-idp)
- ~~CloudFront + WAF~~ → ALB direct access for demo
- ~~MonitoringStack~~ → CloudWatch defaults
- ~~QuickSight~~ → Recharts in frontend
- ~~Multi-AZ, cross-region replication~~ → Single region for PoC

## Development Process
This project follows the AI-DLC (AI-Driven Development Life Cycle) workflow. Documentation is in `aidlc-docs/`.

## Reference Repositories
- `/Users/michael/work/RedwoodConsulting/vrc/vrc-idp/` - Healthcare IDP (ECS workers, CDK patterns, Cognito RBAC, Bedrock OCR)
- `/Users/michael/work/RedwoodConsulting/rudy-paystub-processor/` - Paystub IDP (Bedrock Claude Vision, tool_use extraction)
- `/Users/michael/work/RedwoodConsulting/idp/idp-human-validation/` - Education IDP (Step Functions, human-in-loop)

## RFP & Proposal Documents
Located in `Records Management System/` folder:
- `IT-RFP# 202603058 - Records Management System_Final.docx` - The full RFP
- `executive_brief_maine_rms_v4 (1).docx` - Executive brief
- `Final Proposal/` - Submitted proposal files (File1-5)

## Key Commands
- `nvm use 22` - Switch to required Node version (CDK requires 20+)
- `cd packages/backend && npx ts-node --transpile-only src/server.ts` - Start backend
- `cd packages/frontend && npx vite` - Start frontend
- `npx tsc --noEmit` - Type-check any package
- `cd packages/infrastructure && AWS_REGION=us-east-1 cdk deploy --all --profile 039885961427_DeveloperPowerUserAccess` - Deploy

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
1. NetworkStack — existing VPC lookup (vpc-021f5b9639d42e2bb)
2. DatabaseStack — Aurora Serverless v2 + RDS Proxy
3. StorageStack — S3 buckets + KMS
4. AuthStack — Cognito User Pool + groups + demo users
5. MessagingStack — SQS queues (classify, ocr, notification) + EventBridge cron
6. ComputeStack — ECS Cluster + Backend/Frontend services + ALB + ECR
7. LambdaStack — 6 Lambda functions (ai-classify, ai-ocr, notification, retention, overdue, report-export)

## Deployment
```bash
nvm use 22
cd packages/infrastructure
AWS_REGION=us-east-1 cdk deploy --all --profile 039885961427_DeveloperPowerUserAccess
```
Requires Docker Desktop running (CDK builds container images for ECS).

## Estimated Cost: ~$178/month