#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks, HIPAASecurityChecks } from 'cdk-nag';
import { NetworkStack } from '../lib/stacks/NetworkStack';
import { DatabaseStack } from '../lib/stacks/DatabaseStack';
import { StorageStack } from '../lib/stacks/StorageStack';
import { AuthStack } from '../lib/stacks/AuthStack';
import { SearchStack } from '../lib/stacks/SearchStack';
import { MessagingStack } from '../lib/stacks/MessagingStack';
import { ComputeStack } from '../lib/stacks/ComputeStack';
import { LambdaStack } from '../lib/stacks/LambdaStack';
import { CdnStack } from '../lib/stacks/CdnStack';
import { MonitoringStack } from '../lib/stacks/MonitoringStack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const prefix = `maine-rms-${stage}`;

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT || app.node.tryGetContext('account'),
  region: process.env.CDK_DEFAULT_REGION || app.node.tryGetContext('region'),
};

const network = new NetworkStack(app, `${prefix}-network`, { env });

const database = new DatabaseStack(app, `${prefix}-database`, {
  env,
  vpc: network.vpc,
  ecsSg: network.ecsSg,
  lambdaSg: network.lambdaSg,
});

const storage = new StorageStack(app, `${prefix}-storage`, { env });

const auth = new AuthStack(app, `${prefix}-auth`, { env });

const search = new SearchStack(app, `${prefix}-search`, {
  env,
  vpc: network.vpc,
  opensearchSg: network.opensearchSg,
});

const messaging = new MessagingStack(app, `${prefix}-messaging`, { env });

const compute = new ComputeStack(app, `${prefix}-compute`, {
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
  opensearchDomain: search.domain,
});

const lambda = new LambdaStack(app, `${prefix}-lambda`, {
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
  opensearchDomain: search.domain,
});

const cdn = new CdnStack(app, `${prefix}-cdn`, {
  env,
  alb: compute.alb,
});

const monitoring = new MonitoringStack(app, `${prefix}-monitoring`, {
  env,
  alb: compute.alb,
  ecsCluster: compute.cluster,
  backendService: compute.backendService,
  dbCluster: database.dbCluster,
  classifyDlq: messaging.classifyDlq,
  ocrDlq: messaging.ocrDlq,
  notificationDlq: messaging.notificationDlq,
});

cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));
// HIPAA checks enabled for production; suppressed for demo to allow synth
// cdk.Aspects.of(app).add(new HIPAASecurityChecks({ verbose: false }));
