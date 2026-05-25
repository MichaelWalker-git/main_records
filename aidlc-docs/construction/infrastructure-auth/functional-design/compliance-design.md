# Compliance Design - SOC 2 & CDK Nag

## SOC 2 Trust Service Criteria Mapping

### CC6: Logical and Physical Access Controls
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| CC6.1 - Logical access security | Cognito MFA, RBAC, session timeout | AuthStack |
| CC6.2 - User registration/authorization | Admin-provisioned accounts only, no self-registration | AuthStack |
| CC6.3 - Role-based access | Cognito groups → app RBAC middleware | AuthStack + Backend |
| CC6.6 - Access restriction | Private subnets, security groups, no public DB | NetworkStack |
| CC6.7 - Data transmission protection | TLS 1.2+, CloudFront HTTPS-only | CdnStack, ComputeStack |
| CC6.8 - Unauthorized/malicious software | WAF OWASP rules, ECR image scanning | CdnStack, ComputeStack |

### CC7: System Operations
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| CC7.1 - Detection of anomalies | CloudWatch alarms, CloudTrail, WAF logging | MonitoringStack |
| CC7.2 - Monitoring for anomalies | CloudWatch dashboards, SNS alerts | MonitoringStack |
| CC7.3 - Evaluate security events | CloudTrail → CloudWatch Logs → alarms | MonitoringStack |
| CC7.4 - Incident response | Documented runbook, SNS escalation | MonitoringStack |

### CC8: Change Management
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| CC8.1 - Changes authorized/approved | CDK diff → PR review → deploy | CI/CD (GitHub Actions) |

### CC9: Risk Mitigation
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| CC9.1 - Risk identification | CDK Nag automated scanning | All stacks |
| CC9.2 - Vendor management | AWS shared responsibility, managed services | N/A |

### A1: Availability
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| A1.1 - Capacity management | Fargate auto-scaling, Aurora Serverless | ComputeStack, DatabaseStack |
| A1.2 - Recovery operations | Multi-AZ, S3 cross-region, RDS backups | DatabaseStack, StorageStack |
| A1.3 - DR testing | Documented DR plan, backup restoration test | Operational |

### C1: Confidentiality
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| C1.1 - Confidential info protection | KMS encryption (AES-256), agency scoping | StorageStack, DatabaseStack |
| C1.2 - Disposal of confidential info | S3 lifecycle policies, secure deletion | StorageStack |

### PI1: Processing Integrity
| Criteria | Implementation | CDK Resource |
|----------|---------------|--------------|
| PI1.1 - Accurate and complete processing | Input validation (Zod), audit trail, idempotent operations | Backend |
| PI1.4 - Error detection | SQS DLQ, CloudWatch error alarms, Sentry | MessagingStack, MonitoringStack |

---

## CDK Nag Integration

### Setup
```typescript
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks, HIPAASecurityChecks } from 'cdk-nag';

// Apply to all stacks
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
Aspects.of(app).add(new HIPAASecurityChecks({ verbose: true }));
```

### Expected CDK Nag Rules & Mitigations

#### AwsSolutions Rules
| Rule | Description | Our Implementation |
|------|-------------|-------------------|
| AwsSolutions-RDS10 | RDS deletion protection | Enabled in DatabaseStack |
| AwsSolutions-RDS11 | RDS default port | Use non-default port 5433 |
| AwsSolutions-RDS14 | RDS Aurora backtrack | Enable for Aurora cluster |
| AwsSolutions-RDS16 | RDS CloudWatch log exports | Enable all log types |
| AwsSolutions-S1 | S3 access logging | Enable server access logging |
| AwsSolutions-S2 | S3 block public access | BlockAll enabled |
| AwsSolutions-S3 | S3 default encryption | SSE-KMS with CMK |
| AwsSolutions-S10 | S3 SSL-only access | Bucket policy: aws:SecureTransport |
| AwsSolutions-IAM4 | No AWS managed policies | Use custom inline policies |
| AwsSolutions-IAM5 | No wildcard actions | Scoped to specific resources |
| AwsSolutions-ECS4 | ECS container insights | Enable container insights |
| AwsSolutions-ECS7 | ECS task logging | awslogs driver with log group |
| AwsSolutions-VPC7 | VPC flow logs | Enable flow logs to CloudWatch |
| AwsSolutions-ELB2 | ELB access logging | Enable ALB access logs to S3 |
| AwsSolutions-CFR1 | CloudFront geo restriction | Not restricted (US-only optional) |
| AwsSolutions-CFR3 | CloudFront access logging | Enable standard logging |
| AwsSolutions-CFR4 | CloudFront TLS 1.2 | TLSv1.2_2021 minimum |
| AwsSolutions-COG1 | Cognito password policy | 12+ chars, all character types |
| AwsSolutions-COG2 | Cognito MFA | MFA_REQUIRED |
| AwsSolutions-COG3 | Cognito advanced security | ENFORCED mode |
| AwsSolutions-SQS3 | SQS DLQ | DLQ configured for all queues |
| AwsSolutions-SQS4 | SQS encryption | SSE-KMS |
| AwsSolutions-KMS5 | KMS key rotation | Enable auto-rotation |
| AwsSolutions-OS3 | OpenSearch node-to-node encryption | Enabled |
| AwsSolutions-OS4 | OpenSearch in VPC | Deploy in private subnet |
| AwsSolutions-OS5 | OpenSearch HTTPS | Enforce HTTPS |
| AwsSolutions-L1 | Lambda runtime | Node.js 22 (latest) |

#### HIPAA Rules (applicable subset for government data)
| Rule | Description | Our Implementation |
|------|-------------|-------------------|
| HIPAA-RDS6 | RDS encryption at rest | KMS CMK encryption |
| HIPAA-RDS8 | RDS multi-AZ | Multi-AZ deployment |
| HIPAA-S3-8 | S3 versioning | Enabled on documents bucket |
| HIPAA-Lambda3 | Lambda VPC | Functions accessing RDS in VPC |

### Suppressions (Documented Justifications)
```typescript
// Only suppress with documented business justification
NagSuppressions.addStackSuppressions(stack, [
  {
    id: 'AwsSolutions-CFR1',
    reason: 'No geo restriction required - US government users may access from any location'
  },
  {
    id: 'AwsSolutions-OS1', 
    reason: 'Single-node OpenSearch acceptable for demo environment - multi-node for production'
  }
]);
```

---

## Security Monitoring & Audit

### CloudWatch Alarms
| Alarm | Threshold | Action |
|-------|-----------|--------|
| Failed logins | >10 in 5 min | SNS → email |
| 5xx errors | >5 in 1 min | SNS → email |
| Unauthorized API calls | >3 in 1 min | SNS → email |
| DLQ messages | >0 | SNS → email |
| RDS CPU | >80% for 5 min | SNS → email |
| RDS connections | >80% max | SNS → email |

### CloudTrail Configuration
| Setting | Value |
|---------|-------|
| Multi-region | Yes |
| Log file validation | Enabled |
| S3 bucket | Dedicated audit bucket with lifecycle |
| CloudWatch Logs | Enabled (for alarms) |
| KMS encryption | CMK |
| Data events | S3 object-level for documents bucket |

### Audit Trail (Application-Level)
| Event | Captured Fields |
|-------|-----------------|
| Login success/failure | userId, email, ip, timestamp, userAgent |
| Record access | userId, recordId, action, timestamp, ip |
| Record mutation | userId, recordId, action, before/after, timestamp |
| Permission change | adminId, targetUserId, oldRole, newRole, timestamp |
| Export | userId, exportType, recordCount, timestamp |
| Disposition action | userId, dispositionId, action, level, timestamp |

---

## Encryption Architecture

```
KMS CMK (maine-rms-{stage}-master-key)
├── RDS encryption (storage + backups)
├── S3 encryption (documents, exports, audit)
├── SQS encryption (all queues)
├── OpenSearch encryption (at rest)
├── CloudWatch Logs encryption
├── Lambda environment variables
└── Secrets Manager (DB credentials, API keys)

TLS 1.2+ (in transit)
├── CloudFront → ALB (HTTPS only)
├── ALB → ECS (HTTPS within VPC)
├── ECS → RDS (SSL required)
├── ECS → OpenSearch (HTTPS)
├── Lambda → all services (HTTPS)
└── Client → CloudFront (HTTPS enforced, HSTS)
```
