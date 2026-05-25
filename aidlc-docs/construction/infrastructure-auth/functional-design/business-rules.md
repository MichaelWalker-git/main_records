# Business Rules - Unit 1: Infrastructure & Auth

## Authentication Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AUTH-01 | All users must authenticate via Cognito before accessing any resource | API Gateway authorizer + middleware |
| AUTH-02 | MFA is mandatory for all accounts | Cognito pool setting: MFA_REQUIRED |
| AUTH-03 | Sessions expire after 1 hour of inactivity | Access token TTL |
| AUTH-04 | Failed login attempts (5+) lock account for 15 minutes | Cognito advanced security |
| AUTH-05 | Password must be 12+ chars with complexity | Cognito password policy |
| AUTH-06 | SAML/OIDC federation tokens map to Cognito groups | Identity provider attribute mapping |

## Authorization Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AUTHZ-01 | Users can only access resources permitted by their role | Middleware checks role permissions |
| AUTHZ-02 | Records Officers and Agency Staff can only see their own agency's records | WHERE agency_id = user.agencyId |
| AUTHZ-03 | Only SYSTEM_ADMIN can manage users and roles | Permission check: users.* |
| AUTHZ-04 | Only SYSTEM_ADMIN and ARCHIVES_STAFF can approve dispositions | Permission check: dispositions.approve |
| AUTHZ-05 | Only SYSTEM_ADMIN can apply/remove legal holds | Permission check: dispositions.legal_hold |
| AUTHZ-06 | Role assignment requires SYSTEM_ADMIN role | Permission check: users.assign_role |
| AUTHZ-07 | Agency-scoped users cannot elevate their own permissions | Self-modification blocked for role changes |

## Data Security Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SEC-01 | All data at rest encrypted with AES-256 (KMS CMK) | RDS encryption, S3 SSE-KMS |
| SEC-02 | All data in transit encrypted with TLS 1.2+ | ALB + CloudFront TLS policy |
| SEC-03 | Database accessible only from private subnets | Security groups, no public IP |
| SEC-04 | S3 buckets block all public access | Bucket policies, Block Public Access |
| SEC-05 | Encryption keys rotate annually | KMS automatic rotation |
| SEC-06 | State data never used for AI model training | Bedrock data privacy settings |

## Infrastructure Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| INFRA-01 | Primary region: us-east-1, DR region: us-west-2 | CDK environment config |
| INFRA-02 | S3 cross-region replication for disaster recovery | Replication rule on documents bucket |
| INFRA-03 | RDS automated backups retained 7 days | RDS backup configuration |
| INFRA-04 | Application runs in private subnets only | VPC + NAT gateway for outbound |
| INFRA-05 | WAF protects against OWASP Top 10 | AWS WAF managed rules |
| INFRA-06 | All API calls rate-limited (1000/sec burst) | API Gateway throttling |
| INFRA-07 | CloudTrail enabled for all API activity | Organization trail |
