#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { NetworkStack } from '../lib/stacks/NetworkStack';
import { DatabaseStack } from '../lib/stacks/DatabaseStack';
import { StorageStack } from '../lib/stacks/StorageStack';
import { AuthStack } from '../lib/stacks/AuthStack';
import { MessagingStack } from '../lib/stacks/MessagingStack';
import { ComputeStack } from '../lib/stacks/ComputeStack';
import { LambdaStack } from '../lib/stacks/LambdaStack';

// Stacks removed for PoC (cost optimization):
// - SearchStack: Replaced with PostgreSQL full-text search (tsvector + pg_trgm)
// - CdnStack: ALB direct access for demo (no CloudFront/WAF needed)
// - MonitoringStack: CloudWatch defaults sufficient for demo

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const prefix = `maine-rms-${stage}`;

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT || app.node.tryGetContext('account'),
  region: process.env.CDK_DEFAULT_REGION || app.node.tryGetContext('region'),
};

// 1. NetworkStack — VPC (existing), security groups (ALB, ECS, Lambda, RDS)
//    Provides network isolation between tiers. Uses existing VPC to avoid NAT/VPC cost duplication.
const network = new NetworkStack(app, `${prefix}-network`, { env });

// 2. DatabaseStack — Aurora Serverless v2 PostgreSQL 16.4 + RDS Proxy + KMS encryption
//    Core data store for all records, transmittals, dispositions, audit events.
//    RDS Proxy provides connection pooling for ECS/Lambda. Serverless v2 scales 0.5→4 ACU.
const database = new DatabaseStack(app, `${prefix}-database`, {
  env,
  vpc: network.vpc,
  ecsSg: network.ecsSg,
  lambdaSg: network.lambdaSg,
});

// 3. StorageStack — S3 buckets (documents, exports, prompts)
//    Documents bucket: uploaded files (PDF, images) processed by OCR pipeline.
//    Exports bucket: generated reports (PDF/CSV). Prompts bucket: AI prompt templates.
const storage = new StorageStack(app, `${prefix}-storage`, { env });

// 4. AuthStack — Cognito User Pool + 4 user groups (admin, staff, records_officer, agency_user)
//    Handles authentication (MFA), authorization (RBAC), and SAML/OIDC federation readiness.
const auth = new AuthStack(app, `${prefix}-auth`, { env });

// 5. MessagingStack — SQS queues (OCR, classify, notification) + DLQs
//    Decouples document processing pipeline: upload → OCR → classify → notify.
//    Each queue has a dead-letter queue for failed message retry/investigation.
const messaging = new MessagingStack(app, `${prefix}-messaging`, { env });

// 6. ComputeStack — ECS Fargate cluster + ALB + backend/frontend services
//    Backend: Express API (port 3000), auto-scales 1→4 tasks, connects to RDS via Proxy.
//    Frontend: React SPA served via nginx (port 80). ALB routes /api/* → backend, /* → frontend.
new ComputeStack(app, `${prefix}-compute`, {
  env,
  vpc: network.vpc,
  albSg: network.albSg,
  ecsSg: network.ecsSg,
  dbSecret: database.dbSecret,
  dbProxy: database.dbProxy,
  userPool: auth.userPool,
  userPoolClient: auth.userPoolClient,
  documentsBucket: storage.documentsBucket,
  classifyQueue: messaging.classifyQueue,
});

// 7. LambdaStack — 6 Lambda functions for async processing
//    ai-ocr: Bedrock Claude Vision extracts text from PDF/images
//    ai-classify: Bedrock Claude Sonnet categorizes records with tool_use
//    notification-send: Delivers email/in-app notifications
//    retention-alerts: Daily cron checks retention schedules (90/30/7 day alerts)
//    overdue-checker: Daily cron flags overdue circulation items
//    report-export: Generates PDF/CSV export reports on demand
new LambdaStack(app, `${prefix}-lambda`, {
  env,
  vpc: network.vpc,
  lambdaSg: network.lambdaSg,
  dbSecret: database.dbSecret,
  dbProxy: database.dbProxy,
  documentsBucket: storage.documentsBucket,
  exportsBucket: storage.exportsBucket,
  classifyQueue: messaging.classifyQueue,
  ocrQueue: messaging.ocrQueue,
  notificationQueue: messaging.notificationQueue,
});

// cdk-nag: Validates all stacks against AWS Solutions security best practices
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));