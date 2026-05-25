# Maine Records Management System

Cloud-based Records Management System for the State of Maine, Department of Secretary of State, Maine State Archives.

**RFP# 202603058** | Horus Technology Proposal Demo Build

## Architecture Overview

- **Frontend**: React + TypeScript SPA served via CloudFront (WCAG 2.1 AA compliant)
- **Backend**: Node.js API on AWS ECS Fargate with Lambda for async processing
- **Database**: AWS RDS PostgreSQL with read replicas
- **Search**: Amazon OpenSearch with Textract OCR and Bedrock AI classification
- **Auth**: AWS Cognito with SAML 2.0/OIDC integration to State of Maine Active Directory
- **Storage**: Amazon S3 with cross-region replication (us-east-1 / us-west-2)
- **Infrastructure**: AWS CDK (TypeScript) for all cloud resources

## Prerequisites

- Node.js 22+
- AWS CLI v2 (configured with appropriate credentials)
- AWS CDK CLI (`npm install -g aws-cdk`)
- Docker Desktop
- PostgreSQL 15+ (for local development)

## Quick Start

```bash
# Install dependencies
npm install

# Start local database
docker compose up -d postgres

# Run migrations and seed
./scripts/seed-db.sh

# Start development servers
npm run dev --workspace=packages/backend
npm run dev --workspace=packages/frontend
```

## Deployment

```bash
# Full deployment (build, push, deploy, migrate, seed)
./scripts/deploy.sh

# Database only
./scripts/seed-db.sh
```

## Demo Users

| User | Role | Email | Password |
|------|------|-------|----------|
| Sarah Chen | System Admin | sarah.chen@maine.gov | Demo@2024! |
| Michael Torres | Archives Staff | michael.torres@maine.gov | Demo@2024! |
| Diana Patel | Records Officer (DHHS) | diana.patel@maine.gov | Demo@2024! |
| James Wright | Agency Staff (DHHS) | james.wright@maine.gov | Demo@2024! |

## Key URLs (after deployment)

| Resource | URL |
|----------|-----|
| Frontend | https://dev.rms.maine.gov |
| API | https://api.dev.rms.maine.gov |
| API Docs | https://api.dev.rms.maine.gov/docs |
| Cognito Login | https://auth.dev.rms.maine.gov |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, Knex.js |
| Database | PostgreSQL 15 (RDS) |
| Search | Amazon OpenSearch |
| AI/ML | Amazon Textract, Amazon Bedrock |
| Auth | AWS Cognito |
| Storage | Amazon S3 |
| Compute | AWS ECS Fargate, AWS Lambda |
| IaC | AWS CDK (TypeScript) |
| Analytics | Amazon QuickSight, CloudWatch |
| CI/CD | AWS CodePipeline |

## Project Structure

```
packages/
  backend/       # Express API, migrations, seeds
  frontend/      # React SPA
  infra/         # AWS CDK stacks
  shared/        # Shared types and utilities
scripts/         # Deployment and utility scripts
seed-data/       # JSON seed data files
```
