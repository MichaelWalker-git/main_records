# Maine Records Management System

## Project Overview
Cloud-based Records Management System for the State of Maine, Department of Secretary of State, Maine State Archives (RFP# 202603058). This is a demo build showcasing all promised features from the Horus Technology proposal.

## Development Process
This project follows the AI-DLC (AI-Driven Development Life Cycle) workflow. Rules are in `.claude/aws-aidlc-rules/` and `.claude/aws-aidlc-rule-details/`.

## Tech Stack (from proposal)
- **Frontend**: React + TypeScript (web-based, WCAG 2.1 AA)
- **Backend**: AWS ECS (Fargate), AWS Lambda
- **Database**: AWS RDS PostgreSQL
- **Search**: Amazon OpenSearch, Textract, Bedrock
- **Auth**: AWS Cognito (SAML 2.0/OIDC with SOM Active Directory)
- **Storage**: Amazon S3 (cross-region replication us-east-1 / us-west-2)
- **IaC**: AWS CDK (TypeScript)
- **Analytics**: Amazon QuickSight, CloudWatch

## Reference Repositories
- `/Users/miketran/WebstormProjects/vrc-idp` - Healthcare IDP (ECS workers, CDK patterns, Cognito RBAC)
- `/Users/miketran/WebstormProjects/idp-human-validation` - Education IDP (Step Functions, DynamoDB, human-in-loop)

## Key Commands
- TBD (project not yet initialized with code)
