# Maine Records Management System

Cloud-based Records Management System for the State of Maine, Department of Secretary of State, Maine State Archives.

**RFP# 202603058** | Horus Technology Proposal Demo Build

## Architecture Overview

- **Frontend**: React + TypeScript SPA served via ECS/nginx (WCAG 2.1 AA compliant)
- **Backend**: Node.js Express API on AWS ECS Fargate
- **Database**: Aurora Serverless v2 PostgreSQL (pgvector + tsvector + pg_trgm)
- **AI/OCR**: Bedrock Claude Vision (Lambda) — PDF + image text extraction
- **AI/Classification**: Bedrock Claude Sonnet (tool_use structured output)
- **Semantic Search**: Bedrock Titan Embeddings v2 + pgvector (cosine distance)
- **Auth**: AWS Cognito (MFA, 4 user groups, SAML-ready)
- **Storage**: Amazon S3 (documents, exports, prompts)
- **Async**: SQS queues + Lambda workers + EventBridge cron
- **Infrastructure**: AWS CDK (TypeScript), 7 stacks

## Prerequisites

- Node.js 22+ (`nvm use 22`)
- Docker Desktop (for CDK deploy — builds ECS container images)
- AWS CLI v2 with profile `039885961427_DeveloperPowerUserAccess`

## Local Development

Frontend only (no backend/DB needed for UI work):

```bash
nvm use 22
cd packages/frontend
npm install
npx vite
```

Frontend: http://localhost:5173

API calls will fail without backend — use this for UI/styling work only. Full stack testing requires AWS deployment.

## AWS Deployment

### Prerequisites
1. Docker Desktop running (CDK builds container images for ECS)
2. AWS profile configured: `039885961427_DeveloperPowerUserAccess`

### Deploy

```bash
nvm use 22
cd packages/infrastructure
npm install

# First time only — bootstrap CDK in the account
npx aws-cdk@latest bootstrap aws://039885961427/us-east-1 --profile 039885961427_DeveloperPowerUserAccess

# Deploy all stacks
npx aws-cdk@latest deploy --all --profile 039885961427_DeveloperPowerUserAccess
```

### Run migrations (after deploy)

```bash
cd packages/backend
DATABASE_URL=<rds-proxy-endpoint-from-cdk-output> npx knex migrate:latest
```

### Destroy (cleanup)

```bash
cd packages/infrastructure
npx aws-cdk@latest destroy --all --profile 039885961427_DeveloperPowerUserAccess
```

## Demo Users

| User | Role | Email |
|------|------|-------|
| Sarah Chen | System Admin | sarah.chen@maine.gov |
| Michael Torres | Archives Staff | michael.torres@maine.gov |
| Diana Patel | Records Officer (DHHS) | diana.patel@maine.gov |
| James Wright | Agency Staff (DHHS) | james.wright@maine.gov |

Password for all: `Demo@2024!`

## Project Structure

```
packages/
  backend/          # Express API, services, repositories, migrations
  frontend/         # React SPA (Vite + TailwindCSS)
  infrastructure/   # AWS CDK stacks (7 stacks)
  lambdas/          # Lambda functions
    ai-ocr/         # Bedrock Claude Vision document extraction
    ai-classify/    # Bedrock Claude record classification
    notification-send/
    retention-alerts/
    overdue-checker/
    report-export/
aidlc-docs/         # Architecture and design documentation
```

## Document Processing Pipeline

```
Upload → S3 presigned URL → SQS ocr-queue
  → Lambda (Claude Vision): PDF/image → extracted text
  → SQS classify-queue
  → Lambda (Claude Sonnet): text → category + tags + confidence
  → Titan Embeddings: text → vector(1024) → pgvector
  → Semantic search enabled
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Heroicons |
| Backend | Node.js, Express, Knex.js, Zod |
| Database | PostgreSQL 15 (Aurora Serverless v2) + pgvector |
| Search | PostgreSQL tsvector + pgvector semantic search |
| AI/OCR | Amazon Bedrock (Claude Vision) |
| AI/Classify | Amazon Bedrock (Claude Sonnet, tool_use) |
| Embeddings | Amazon Bedrock (Titan Embed v2) |
| Auth | AWS Cognito (MFA, RBAC) |
| Storage | Amazon S3 |
| Compute | AWS ECS Fargate, AWS Lambda |
| Queues | Amazon SQS, EventBridge |
| IaC | AWS CDK (TypeScript) |

## Estimated Monthly Cost (PoC)

~$178/month (ECS $60, Aurora $45, NAT $35, Bedrock $30, misc $8)