# Business Logic Model - Unit 1: Infrastructure & Auth

## Authentication Flow

```
User Browser                    CloudFront/ALB            Cognito              ECS App
     |                              |                      |                    |
     |-- Access app --------------->|                      |                    |
     |<-- Redirect to login --------|                      |                    |
     |                              |                      |                    |
     |-- Login (email + password) --|--------------------->|                    |
     |<-- MFA challenge ------------|<---------------------|                    |
     |-- MFA code ------------------|--------------------->|                    |
     |<-- JWT tokens (access+refresh+id) ------------------|                    |
     |                              |                      |                    |
     |-- API call + Bearer token -->|                      |                    |
     |                              |-- Validate JWT ----->|                    |
     |                              |<-- Claims (sub, groups, agencyId) --------|
     |                              |-- Forward to app ----|------ req.user --->|
     |                              |                      |                    |
     |<-- Response -----------------|<-----------------------------------------|
```

## Authorization Logic (Middleware)

```typescript
// Pseudocode for authorization middleware
function authorize(requiredPermission: string) {
  return (req) => {
    const { roles, agencyId } = req.user;
    
    // 1. Check if any of user's roles grant the required permission
    const hasPermission = roles.some(role => 
      role.permissions[module].includes(action)
    );
    
    if (!hasPermission) throw Forbidden;
    
    // 2. Apply agency scoping for non-admin roles
    if (!roles.includes('SYSTEM_ADMIN') && !roles.includes('ARCHIVES_STAFF')) {
      req.agencyScope = agencyId; // All queries filtered by agency
    }
    
    // 3. Log access in audit trail
    auditService.logEvent({
      userId: req.user.id,
      action: requiredPermission,
      resourceType: module,
      ip: req.ip
    });
  };
}
```

## User Provisioning Flow

```
Admin creates user:
  1. Create Cognito user (email, temporary password)
  2. Add to Cognito group(s) based on role
  3. Set custom attributes (agencyId, agencyCode)
  4. Insert user record in PostgreSQL (synced)
  5. Send welcome email with temporary credentials
  6. User forced to change password + setup MFA on first login
```

## Session Management

| Scenario | Behavior |
|----------|----------|
| Token expired | Frontend auto-refreshes using refresh token |
| Refresh token expired | Redirect to login |
| User deactivated | Next API call returns 401, frontend redirects to login |
| Role changed | New permissions take effect on next token refresh (max 1hr delay) |
| Concurrent sessions | Allowed (no single-session enforcement for demo) |

## Infrastructure Topology

```
us-east-1 (Primary)                    us-west-2 (DR)
┌─────────────────────────────┐        ┌──────────────────┐
│ VPC: 10.0.0.0/16            │        │                  │
│                             │        │  S3 Replica      │
│ Public Subnets (2 AZ)      │        │  (documents)     │
│ ├── ALB                     │        │                  │
│ ├── NAT Gateway             │        └──────────────────┘
│ └── CloudFront Origin       │
│                             │
│ Private Subnets (2 AZ)     │
│ ├── ECS Fargate Tasks       │
│ │   ├── Backend (2 tasks)   │
│ │   └── Frontend (2 tasks)  │
│ ├── RDS Aurora PostgreSQL   │
│ │   ├── Writer (AZ-1)       │
│ │   └── Reader (AZ-2)       │
│ └── OpenSearch (1 node)     │
│                             │
│ Isolated Subnets (2 AZ)    │
│ └── RDS (no internet)       │
│                             │
│ Serverless                  │
│ ├── Lambda (6 functions)    │
│ ├── SQS (3 queues + DLQs)  │
│ ├── EventBridge (2 rules)   │
│ └── S3 (3 buckets)          │
└─────────────────────────────┘

External:
├── CloudFront (global CDN)
├── Cognito (us-east-1)
├── Bedrock (us-east-1)
├── Textract (us-east-1)
├── SES (us-east-1)
└── CloudTrail (all regions)
```

## CDK Stack Dependencies

```
NetworkStack (VPC, subnets, security groups)
     |
     +--→ DatabaseStack (RDS, depends on VPC private subnets)
     |
     +--→ StorageStack (S3, KMS - no VPC dependency)
     |
     +--→ AuthStack (Cognito - no VPC dependency)
     |
     +--→ SearchStack (OpenSearch, depends on VPC private subnets)
     |
     +--→ MessagingStack (SQS, EventBridge - no VPC dependency)
     |
     +--→ All above feed into:
              |
              +--→ ComputeStack (ECS, ALB - depends on VPC, references all resources)
              |
              +--→ LambdaStack (Lambda - depends on VPC for RDS access, SQS triggers)
              |
              +--→ CdnStack (CloudFront, WAF - depends on ALB)
              |
              +--→ MonitoringStack (CloudWatch - references all resources)
```
