# Infrastructure Design - Maine Records Management System

## AWS Account & Region Configuration
| Setting | Value |
|---------|-------|
| AWS Account | 039885961427 (DeveloperPowerUserAccess) |
| Primary Region | us-east-1 (N. Virginia) |
| CDK Stage | dev (demo environment) |
| Stack Prefix | maine-rms-dev |
| Existing VPC | vpc-021f5b9639d42e2bb |

## CDK Application Structure

```typescript
// bin/app.ts
const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };

const network = new NetworkStack(app, `${prefix}-network`, { env });
const database = new DatabaseStack(app, `${prefix}-database`, { env, vpc: network.vpc });
const storage = new StorageStack(app, `${prefix}-storage`, { env });
const auth = new AuthStack(app, `${prefix}-auth`, { env });
const messaging = new MessagingStack(app, `${prefix}-messaging`, { env });
const compute = new ComputeStack(app, `${prefix}-compute`, { env, vpc: network.vpc, ...deps });
const lambda = new LambdaStack(app, `${prefix}-lambda`, { env, vpc: network.vpc, ...deps });

// CDK Nag
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));
```

### Stacks NOT deployed (PoC cost optimization):
- **SearchStack** — replaced with PostgreSQL full-text search (tsvector + pg_trgm)
- **CdnStack** — ALB direct access for demo (no CloudFront/WAF)
- **MonitoringStack** — CloudWatch defaults sufficient for demo

## Stack Specifications

### NetworkStack
```
Resources:
  VPC: Existing VPC lookup (vpc-021f5b9639d42e2bb)
    - Uses Vpc.fromLookup() when EXISTING_VPC_ID is set
    - Falls back to creating new VPC if not set

  SecurityGroups:
    sg-alb: ingress 443 from 0.0.0.0/0
    sg-ecs: ingress 3000 from sg-alb
    sg-rds: ingress 5433 from sg-ecs, sg-lambda
    sg-lambda: egress all (in private subnet with NAT)
```

### DatabaseStack
```
Resources:
  Aurora Serverless v2:
    Engine: PostgreSQL 15.4
    MinACU: 0.5
    MaxACU: 4
    Port: 5433 (non-default per CDK Nag)
    MultiAZ: true
    BackupRetention: 7 days
    DeletionProtection: true
    StorageEncrypted: true (KMS CMK)
    EnableCloudwatchLogsExports: [postgresql, upgrade]
    AutoMinorVersionUpgrade: true
    Extensions: pgvector (semantic search), pg_trgm (fuzzy match), tsvector (full-text)
    Semantic search: embedding vector(1024) column + HNSW index (Titan Embed v2)

  RDS Proxy:
    EngineFamily: POSTGRESQL
    MaxConnectionsPercent: 80
    IdleClientTimeout: 1800
    RequireTLS: true
    SecretArn: (from Secrets Manager)

  Secrets Manager:
    DatabaseCredentials: auto-generated, rotation every 30 days
```

### StorageStack
```
Resources:
  S3 Buckets:
    documents-bucket:
      Versioning: Enabled
      Encryption: SSE-KMS (CMK)
      BlockPublicAccess: BlockAll
      LifecycleRules:
        - TransitionToIA: 90 days
        - TransitionToGlacier: 365 days
      ReplicationConfiguration:
        Destination: us-west-2 (same bucket name with -replica suffix)
      ServerAccessLogging: Enabled -> access-logs bucket
      CORS: Allow frontend origin for presigned uploads

    exports-bucket:
      Versioning: Disabled
      Encryption: SSE-KMS
      BlockPublicAccess: BlockAll
      LifecycleRules:
        - ExpireObjects: 7 days (temp exports)

    prompts-bucket:
      Versioning: Enabled (prompt version control)
      Encryption: SSE-KMS
      BlockPublicAccess: BlockAll

    access-logs-bucket:
      Encryption: SSE-S3
      BlockPublicAccess: BlockAll
      LifecycleRules:
        - ExpireObjects: 90 days

  KMS:
    maine-rms-master-key:
      EnableKeyRotation: true
      Alias: alias/maine-rms-dev
      Policy: Allow ECS task role, Lambda roles, RDS
```

### AuthStack
```
Resources:
  Cognito User Pool:
    UserPoolName: maine-rms-dev-users
    SignInAliases: { email: true }
    SelfSignUpEnabled: false
    MFA: REQUIRED
    MfaConfiguration: TOTP
    PasswordPolicy:
      MinLength: 12
      RequireLowercase: true
      RequireUppercase: true
      RequireNumbers: true
      RequireSymbols: true
    AdvancedSecurityMode: ENFORCED
    AccountRecovery: EMAIL_ONLY
    CustomAttributes:
      - agencyId (string, mutable)
      - agencyCode (string, mutable)

  Cognito Groups:
    - SystemAdmin
    - ArchivesStaff
    - RecordsOfficer
    - AgencyStaff

  App Client:
    AuthFlows: USER_PASSWORD_AUTH, USER_SRP_AUTH
    TokenValidity:
      AccessToken: 1 hour
      IdToken: 1 hour
      RefreshToken: 30 days
    PreventUserExistenceErrors: ENABLED

  Custom Resource (post-deploy):
    - Create 4 demo users
    - Assign to groups
    - Set temporary passwords
```

### MessagingStack
```
Resources:
  SQS Queues:
    classify-queue:
      VisibilityTimeout: 300 (5 min for Bedrock call)
      MessageRetentionPeriod: 86400 (1 day)
      KmsMasterKeyId: CMK
      DeadLetterQueue:
        MaxReceiveCount: 3
        Queue: classify-dlq

    ocr-queue:
      VisibilityTimeout: 600 (10 min for Bedrock Vision call)
      MessageRetentionPeriod: 86400
      KmsMasterKeyId: CMK
      DeadLetterQueue:
        MaxReceiveCount: 3
        Queue: ocr-dlq

    notification-queue:
      VisibilityTimeout: 120
      MessageRetentionPeriod: 86400
      KmsMasterKeyId: CMK
      DeadLetterQueue:
        MaxReceiveCount: 3
        Queue: notification-dlq

  EventBridge Rules:
    retention-alerts-rule:
      Schedule: cron(0 6 * * ? *) # 6 AM UTC daily
      Target: Lambda retention-alerts

    overdue-checker-rule:
      Schedule: cron(0 8 * * ? *) # 8 AM UTC daily
      Target: Lambda overdue-checker
```

### ComputeStack
```
Resources:
  ECS Cluster:
    ContainerInsights: ENABLED

  Backend Service:
    TaskDefinition:
      CPU: 512
      Memory: 1024
      Container:
        Image: ECR (built from packages/backend/)
        Port: 3000
        Environment:
          DB_PROXY_ENDPOINT: (from DatabaseStack)
          DB_SECRET: (from Secrets Manager - JSON)
          DB_PORT: 5433
          COGNITO_USER_POOL_ID: (from AuthStack)
          COGNITO_CLIENT_ID: (from AuthStack)
          DOCUMENTS_BUCKET: (from StorageStack)
          EXPORTS_BUCKET: (from StorageStack)
          CLASSIFY_QUEUE_URL: (from MessagingStack)
          OCR_QUEUE_URL: (from MessagingStack)
          NOTIFICATION_QUEUE_URL: (from MessagingStack)
          KMS_KEY_ARN: (from StorageStack)
          STAGE: dev
          AWS_REGION: us-east-1
        Logging: awslogs (CloudWatch)
        HealthCheck: /api/health
    DesiredCount: 2
    AutoScaling:
      Min: 2, Max: 4
      TargetCPU: 70%

  Frontend Service:
    TaskDefinition:
      CPU: 256
      Memory: 512
      Container:
        Image: ECR (built from packages/frontend/ - nginx serving static)
        Port: 80
        nginx config: SPA fallback, API proxy to backend:3000
    DesiredCount: 2

  Application Load Balancer:
    Scheme: internet-facing
    Listeners:
      - HTTPS:443 -> Backend target group (path: /api/*)
      - HTTPS:443 -> Frontend target group (default)
    HealthCheck: /api/health (backend), / (frontend)
    AccessLogging: S3 (access-logs bucket)
    SecurityPolicy: TLS_1_2

  ECR Repositories:
    - maine-rms-backend
    - maine-rms-frontend
```

### LambdaStack
```
Resources:
  Functions:
    ai-classify:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 512MB
      Timeout: 300s
      VPC: private subnet (for RDS access)
      Environment: DB_PROXY_ENDPOINT, DB_PORT, DOCUMENTS_BUCKET, PROMPTS_BUCKET
      EventSource: SQS classify-queue (batchSize: 5)
      Permissions: bedrock:InvokeModel, s3:GetObject, secretsmanager:GetSecretValue

    ai-ocr (Bedrock Claude Vision):
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 1024MB
      Timeout: 600s
      VPC: private subnet
      Environment: DB_PROXY_ENDPOINT, DOCUMENTS_BUCKET, CLASSIFY_QUEUE_URL
      EventSource: SQS ocr-queue (batchSize: 2)
      Permissions: bedrock:InvokeModel, s3:GetObject, sqs:SendMessage
      Note: Uses Claude Vision for document text extraction (same approach as rudy-paystub-processor)

    notification-send:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 256MB
      Timeout: 30s
      Environment: DB_PROXY_ENDPOINT
      EventSource: SQS notification-queue (batchSize: 10)
      Permissions: ses:SendEmail, secretsmanager:GetSecretValue

    retention-alerts:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 512MB
      Timeout: 300s
      VPC: private subnet
      Environment: DB_PROXY_ENDPOINT, NOTIFICATION_QUEUE_URL
      EventSource: EventBridge (cron daily 6 AM UTC)
      Permissions: sqs:SendMessage, secretsmanager:GetSecretValue

    overdue-checker:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 512MB
      Timeout: 300s
      VPC: private subnet
      Environment: DB_PROXY_ENDPOINT, NOTIFICATION_QUEUE_URL
      EventSource: EventBridge (cron daily 8 AM UTC)
      Permissions: sqs:SendMessage, secretsmanager:GetSecretValue

    report-export:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 512MB
      Timeout: 300s
      VPC: private subnet
      Environment: DB_PROXY_ENDPOINT, EXPORTS_BUCKET
      Permissions: s3:PutObject, secretsmanager:GetSecretValue
```

## Deployment Commands

```bash
# First-time setup
cd packages/infrastructure
npm install
npx cdk bootstrap aws://039885961427/us-east-1

# Deploy all stacks
npx cdk deploy --all --context stage=dev --require-approval never

# Deploy specific stack
npx cdk deploy maine-rms-dev-compute --context stage=dev

# Diff before deploy
npx cdk diff --context stage=dev

# Destroy (demo cleanup)
npx cdk destroy --all --context stage=dev
```

## Cost Estimate (Demo - monthly)

| Service | Config | Est. Cost |
|---------|--------|-----------|
| ECS Fargate | 4 tasks (0.25-0.5 vCPU) | ~$60 |
| Aurora Serverless v2 | 0.5-4 ACU | ~$45 |
| S3 | <10 GB | ~$2 |
| Lambda | Low invocations | ~$5 |
| NAT Gateway | 1 gateway (existing VPC) | ~$35 |
| Cognito | <50 users | Free tier |
| Bedrock (classify + OCR) | Demo usage | ~$30 |
| SQS/EventBridge | Low volume | ~$1 |
| **Total** | | **~$178/month** |