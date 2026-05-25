#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ENVIRONMENT="${ENVIRONMENT:-dev}"

echo "=== Maine Records Management System - Deploy ==="
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${AWS_REGION}"
echo "Account: ${AWS_ACCOUNT_ID}"
echo ""

echo "--- Step 1: Install dependencies ---"
cd "$PROJECT_ROOT"
npm ci

echo "--- Step 2: Build all packages ---"
npm run build --workspaces --if-present

echo "--- Step 3: Build Docker images ---"
echo "Building backend image..."
docker build -t maine-rms-backend:latest "$PROJECT_ROOT/packages/backend"

echo "Building frontend image..."
docker build -t maine-rms-frontend:latest "$PROJECT_ROOT/packages/frontend"

echo "--- Step 4: Push to ECR ---"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

docker tag maine-rms-backend:latest "$ECR_REGISTRY/maine-rms-backend:latest"
docker tag maine-rms-backend:latest "$ECR_REGISTRY/maine-rms-backend:${ENVIRONMENT}"
docker push "$ECR_REGISTRY/maine-rms-backend:latest"
docker push "$ECR_REGISTRY/maine-rms-backend:${ENVIRONMENT}"

docker tag maine-rms-frontend:latest "$ECR_REGISTRY/maine-rms-frontend:latest"
docker tag maine-rms-frontend:latest "$ECR_REGISTRY/maine-rms-frontend:${ENVIRONMENT}"
docker push "$ECR_REGISTRY/maine-rms-frontend:latest"
docker push "$ECR_REGISTRY/maine-rms-frontend:${ENVIRONMENT}"

echo "--- Step 5: CDK Deploy ---"
cd "$PROJECT_ROOT/packages/infra"
npx cdk deploy --all --require-approval never -c environment="$ENVIRONMENT"

echo "--- Step 6: Run database migrations ---"
cd "$PROJECT_ROOT/packages/backend"
npx knex migrate:latest --knexfile knexfile.ts

echo "--- Step 7: Seed demo data ---"
npx knex seed:run --knexfile knexfile.ts

echo ""
echo "=== Deployment Complete ==="
echo "Frontend URL: https://${ENVIRONMENT}.rms.maine.gov"
echo "API URL: https://api.${ENVIRONMENT}.rms.maine.gov"
echo ""
