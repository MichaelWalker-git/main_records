# Infrastructure Design - Maine Records Management System

## AWS Account & Region Configuration
| Setting | Value |
|---------|-------|
| AWS Account | michael-primary |
| Primary Region | us-east-1 (N. Virginia) |
| DR Region | us-west-2 (Oregon) |
| CDK Stage | dev (demo environment) |
| Stack Prefix | maine-rms-dev |

## CDK Application Structure

```typescript
// bin/app.ts
const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };

const network = new NetworkStack(app, `${stage}-network`, { env });
const storage = new StorageStack(app, `${stage}-storage`, { env });
const auth = new AuthStack(app, `${stage}-auth`, { env });
const database = new DatabaseStack(app, `${stage}-database`, { env, vpc: network.vpc });
const search = new SearchStack(app, `${stage}-search`, { env, vpc: network.vpc });
const messaging = new MessagingStack(app, `${stage}-messaging`, { env });
const compute = new ComputeStack(app, `${stage}-compute`, { env, vpc: network.vpc, ...dependencies });
const lambdas = new LambdaStack(app, `${stage}-lambdas`, { env, vpc: network.vpc, ...dependencies });
const cdn = new CdnStack(app, `${stage}-cdn`, { env, alb: compute.alb });
const monitoring = new MonitoringStack(app, `${stage}-monitoring`, { env, ...allResources });

// CDK Nag
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
Aspects.of(app).add(new HIPAASecurityChecks({ verbose: true }));
```

## Stack Specifications

### NetworkStack
```
Resources:
  VPC:
    CIDR: 10.0.0.0/16
    MaxAZs: 2
    SubnetConfiguration:
      - Public (10.0.0.0/24, 10.0.1.0/24) - ALB, NAT
      - Private (10.0.2.0/24, 10.0.3.0/24) - ECS, Lambda, OpenSearch
      - Isolated (10.0.4.0/24, 10.0.5.0/24) - RDS
    NatGateways: 1 (demo cost savings, 2 for prod)
    FlowLogs: CloudWatch (VPC level)
    
  SecurityGroups:
    sg-alb: ingress 443 from 0.0.0.0/0
    sg-ecs: ingress 3000 from sg-alb
    sg-rds: ingress 5433 from sg-ecs, sg-lambda
    sg-opensearch: ingress 443 from sg-ecs
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
      ServerAccessLogging: Enabled → access-logs bucket
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

### SearchStack
```
Resources:
  OpenSearch Domain:
    EngineVersion: OpenSearch_2.11
    ClusterConfig:
      InstanceType: t3.medium.search
      InstanceCount: 1 (demo - 3 for prod)
      DedicatedMasterEnabled: false
    EBSOptions:
      VolumeType: gp3
      VolumeSize: 50 GB
    VPCOptions:
      SubnetIds: [private-subnet-1]
      SecurityGroupIds: [sg-opensearch]
    EncryptionAtRestOptions: { Enabled: true, KmsKeyId: CMK }
    NodeToNodeEncryptionOptions: { Enabled: true }
    DomainEndpointOptions:
      EnforceHTTPS: true
      TLSSecurityPolicy: TLS_1_2
    AccessPolicies: IAM-based (ECS task role + Lambda roles)
    LogPublishingOptions:
      INDEX_SLOW_LOGS: CloudWatch
      SEARCH_SLOW_LOGS: CloudWatch
      ES_APPLICATION_LOGS: CloudWatch
```

### MessagingStack
```
Resources:
  SQS Queues:
    classify-queue:
      VisibilityTimeout: 300 (5 min for Bedrock call)
      MessageRetentionPeriod: 86400 (1 day)
      ReceiveMessageWaitTimeSeconds: 20 (long polling)
      SqsManagedSseEnabled: false
      KmsMasterKeyId: CMK
      DeadLetterQueue:
        MaxReceiveCount: 3
        Queue: classify-dlq
        
    ocr-queue:
      VisibilityTimeout: 600 (10 min for Textract)
      MessageRetentionPeriod: 86400
      KmsMasterKeyId: CMK
      DeadLetterQueue:
        MaxReceiveCount: 3
        Queue: ocr-dlq
        
    notification-queue:
      VisibilityTimeout: 30
      MessageRetentionPeriod: 86400
      KmsMasterKeyId: CMK
      DeadLetterQueue:
        MaxReceiveCount: 3
        Queue: notification-dlq
        
  EventBridge Rules:
    retention-alerts-rule:
      Schedule: cron(0 10 * * ? *) # 6 AM ET daily
      Target: Lambda retention-alerts
      
    overdue-checker-rule:
      Schedule: cron(0 12 * * ? *) # 8 AM ET daily
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
          DATABASE_URL: (from Secrets Manager)
          OPENSEARCH_ENDPOINT: (from SearchStack)
          COGNITO_USER_POOL_ID: (from AuthStack)
          COGNITO_CLIENT_ID: (from AuthStack)
          DOCUMENTS_BUCKET: (from StorageStack)
          EXPORTS_BUCKET: (from StorageStack)
          CLASSIFY_QUEUE_URL: (from MessagingStack)
          OCR_QUEUE_URL: (from MessagingStack)
          NOTIFICATION_QUEUE_URL: (from MessagingStack)
          KMS_KEY_ARN: (from StorageStack)
          STAGE: dev
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
    DesiredCount: 2
    
  Application Load Balancer:
    Scheme: internet-facing
    Listeners:
      - HTTPS:443 → Backend target group (path: /api/*)
      - HTTPS:443 → Frontend target group (default)
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
  Shared Layer:
    - shared utilities, AWS SDK, database client
    
  Functions:
    ai-classify:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 512MB
      Timeout: 300s
      VPC: private subnet (for RDS access)
      Environment: DB_URL, PROMPTS_BUCKET, OPENSEARCH_ENDPOINT
      EventSource: SQS classify-queue (batchSize: 1, concurrency: 5)
      Permissions: bedrock:InvokeModel, s3:GetObject, rds-data:*
      
    ai-ocr:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 256MB
      Timeout: 600s
      VPC: private subnet
      Environment: DB_URL, DOCUMENTS_BUCKET, CLASSIFY_QUEUE_URL
      EventSource: SQS ocr-queue (batchSize: 1, concurrency: 3)
      Permissions: textract:*, s3:GetObject, sqs:SendMessage
      
    notification-send:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 256MB
      Timeout: 30s
      Environment: DB_URL, SES_FROM_EMAIL
      EventSource: SQS notification-queue (batchSize: 10, concurrency: 5)
      Permissions: ses:SendEmail, rds-data:*
      
    retention-alerts:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 256MB
      Timeout: 300s
      VPC: private subnet
      Environment: DB_URL, NOTIFICATION_QUEUE_URL
      EventSource: EventBridge (cron daily)
      Permissions: sqs:SendMessage, rds-data:*
      
    overdue-checker:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 256MB
      Timeout: 300s
      VPC: private subnet
      Environment: DB_URL, NOTIFICATION_QUEUE_URL
      EventSource: EventBridge (cron daily)
      Permissions: sqs:SendMessage, rds-data:*
      
    report-export:
      Runtime: nodejs22.x
      Handler: index.handler
      Memory: 1024MB
      Timeout: 300s
      VPC: private subnet
      Environment: DB_URL, EXPORTS_BUCKET
      Permissions: s3:PutObject, rds-data:*
```

### CdnStack
```
Resources:
  CloudFront Distribution:
    Origins:
      - ALB (default, frontend + API)
    DefaultCacheBehavior:
      ViewerProtocolPolicy: redirect-to-https
      CachePolicy: CachingDisabled (dynamic content)
      OriginRequestPolicy: AllViewer
    CacheBehaviors:
      - /static/*: CachingOptimized (1 day)
      - /api/*: CachingDisabled
    ViewerCertificate: ACM (*.maine-rms.example.com)
    MinimumProtocolVersion: TLSv1.2_2021
    Logging: S3 (access-logs bucket)
    GeoRestriction: None
    
  WAF WebACL:
    Rules:
      - AWSManagedRulesCommonRuleSet (OWASP Top 10)
      - AWSManagedRulesKnownBadInputsRuleSet
      - AWSManagedRulesSQLiRuleSet
      - RateLimit: 2000 req/5min per IP
    Scope: CLOUDFRONT
```

### MonitoringStack
```
Resources:
  CloudWatch Dashboard:
    Widgets:
      - ECS CPU/Memory utilization
      - RDS connections/CPU/storage
      - ALB request count, 5xx rate, latency
      - Lambda invocations, errors, duration
      - SQS queue depth, DLQ messages
      - OpenSearch cluster health
      
  CloudWatch Alarms:
    - ALB5xxRate > 5 in 1 min → SNS
    - RDSCPUUtilization > 80% for 5 min → SNS
    - ECSCPUUtilization > 80% for 5 min → SNS
    - DLQMessageCount > 0 → SNS
    - UnauthorizedAPICalls > 3 in 1 min → SNS
    - FailedLoginAttempts > 10 in 5 min → SNS
    
  SNS Topic:
    maine-rms-alerts → email subscription (admin)
    
  CloudTrail:
    IsMultiRegionTrail: true
    EnableLogFileValidation: true
    S3BucketName: access-logs bucket
    CloudWatchLogsLogGroupArn: /aws/cloudtrail/maine-rms
    KMSKeyId: CMK
    DataEvents: S3 object-level on documents bucket
```

## Deployment Commands

```bash
# First-time setup
cd packages/infrastructure
npm install
npx cdk bootstrap aws://ACCOUNT/us-east-1

# Deploy all stacks
npx cdk deploy --all --context stage=dev --require-approval never

# Deploy specific stack
npx cdk deploy dev-compute --context stage=dev

# Diff before deploy
npx cdk diff --context stage=dev

# Run CDK Nag (happens automatically on synth)
npx cdk synth --context stage=dev 2>&1 | grep -E "(Error|Warning)"

# Destroy (demo cleanup)
npx cdk destroy --all --context stage=dev
```

## Cost Estimate (Demo - monthly)

| Service | Config | Est. Cost |
|---------|--------|-----------|
| ECS Fargate | 4 tasks (0.5-1 vCPU) | ~$60 |
| Aurora Serverless v2 | 0.5-4 ACU | ~$45 |
| OpenSearch | 1x t3.medium | ~$50 |
| S3 | <10 GB | ~$2 |
| Lambda | Low invocations | ~$5 |
| CloudFront | Low traffic | ~$5 |
| NAT Gateway | 1 gateway | ~$35 |
| Cognito | <50 users | Free tier |
| Bedrock | Demo usage | ~$20 |
| Textract | Demo usage | ~$10 |
| **Total** | | **~$230/month** |
