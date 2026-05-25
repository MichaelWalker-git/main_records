# Build Instructions - Maine Records Management System

## Prerequisites
- Node.js 22.x (LTS)
- npm 10.x
- Docker Desktop (for containerized builds)
- AWS CLI v2 (configured with michael-primary profile)
- AWS CDK CLI (`npm install -g aws-cdk`)

## Local Development Setup

### 1. Install Dependencies
```bash
cd /Users/miketran/WebstormProjects/MaineRecordsManagementSystem
npm install
```

### 2. Build All Packages
```bash
npm run build
```

Individual package builds:
```bash
cd packages/shared && npm run build
cd packages/infrastructure && npm run build
cd packages/backend && npm run build
cd packages/frontend && npm run build
```

### 3. Lambda Builds
```bash
cd packages/lambdas/ai-classify && npm install && npm run build
cd packages/lambdas/ai-ocr && npm install && npm run build
cd packages/lambdas/notification-send && npm install && npm run build
cd packages/lambdas/retention-alerts && npm install && npm run build
cd packages/lambdas/overdue-checker && npm install && npm run build
cd packages/lambdas/report-export && npm install && npm run build
```

### 4. Start Local Development
```bash
# Backend (requires PostgreSQL running locally or DATABASE_URL set)
cd packages/backend
npm run dev

# Frontend (proxies /api to localhost:3000)
cd packages/frontend
npm run dev
```

### 5. Database Migrations
```bash
cd packages/backend
npm run migrate
```

## Docker Builds

### Backend
```bash
cd packages/backend
docker build -t maine-rms-backend .
docker run -p 3000:3000 --env-file .env maine-rms-backend
```

### Frontend
```bash
cd packages/frontend
docker build -t maine-rms-frontend .
docker run -p 80:80 maine-rms-frontend
```

## CDK Deployment

### Bootstrap (first time only)
```bash
cd packages/infrastructure
npx cdk bootstrap aws://ACCOUNT_ID/us-east-1 --context stage=dev
```

### Deploy All Stacks
```bash
cd packages/infrastructure
npx cdk deploy --all --context stage=dev --require-approval never
```

### Deploy Specific Stack
```bash
npx cdk deploy dev-compute --context stage=dev
```

## Full Deployment Pipeline
```bash
chmod +x scripts/deploy.sh scripts/seed-db.sh
./scripts/deploy.sh
```

## Environment Variables (Backend)
| Variable | Description | Local Default |
|----------|-------------|---------------|
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL connection | postgresql://localhost:5432/maine_rms |
| OPENSEARCH_ENDPOINT | OpenSearch URL | http://localhost:9200 |
| COGNITO_USER_POOL_ID | Cognito pool | (from CDK output) |
| COGNITO_CLIENT_ID | App client | (from CDK output) |
| DOCUMENTS_BUCKET | S3 documents | (from CDK output) |
| EXPORTS_BUCKET | S3 exports | (from CDK output) |
| CLASSIFY_QUEUE_URL | SQS classify | (from CDK output) |
| OCR_QUEUE_URL | SQS OCR | (from CDK output) |
| NOTIFICATION_QUEUE_URL | SQS notifications | (from CDK output) |
| KMS_KEY_ARN | KMS encryption key | (from CDK output) |
| STAGE | Environment stage | development |
