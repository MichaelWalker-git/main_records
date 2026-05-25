export const config = {
  stage: process.env.STAGE || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/maine_rms',
  opensearchEndpoint: process.env.OPENSEARCH_ENDPOINT || 'http://localhost:9200',
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
  kmsKeyArn: process.env.KMS_KEY_ARN || '',
};
