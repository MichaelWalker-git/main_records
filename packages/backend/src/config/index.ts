import 'dotenv/config';

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // ECS: build from DB Proxy + Secrets Manager secret (injected as DB_SECRET env var)
  const endpoint = process.env.DB_HOST || process.env.DB_PROXY_ENDPOINT;
  const port = process.env.DB_PORT || '5433';
  if (endpoint && process.env.DB_SECRET) {
    try {
      const secret = JSON.parse(process.env.DB_SECRET);
      return `postgresql://${secret.username}:${secret.password}@${endpoint}:${port}/maine_rms?sslmode=require`;
    } catch {
      // fallback if secret isn't JSON
    }
  }
  if (endpoint) {
    return `postgresql://${endpoint}:${port}/maine_rms?sslmode=require`;
  }
  return 'postgresql://localhost:5432/maine_rms';
}

export const config = {
  stage: process.env.STAGE || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: buildDatabaseUrl(),
  // OpenSearch replaced with PostgreSQL full-text search (pg_tsvector + pg_trgm)
  // opensearchEndpoint: process.env.OPENSEARCH_ENDPOINT || 'http://localhost:9200',
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
    region: process.env.AWS_REGION || 'us-east-1',
  },
  s3: {
    documentsBucket: process.env.DOCUMENTS_BUCKET || '',
    exportsBucket: process.env.EXPORTS_BUCKET || '',
  },
  sqs: {
    classifyQueueUrl: process.env.CLASSIFY_QUEUE_URL || '',
    ocrQueueUrl: process.env.OCR_QUEUE_URL || '',
    notificationQueueUrl: process.env.NOTIFICATION_QUEUE_URL || '',
  },
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    embeddingModelId: process.env.BEDROCK_EMBEDDING_MODEL_ID || 'amazon.titan-embed-text-v2:0',
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  kmsKeyArn: process.env.KMS_KEY_ARN || '',
};
