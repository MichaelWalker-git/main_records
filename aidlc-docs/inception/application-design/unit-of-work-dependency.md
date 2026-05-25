# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Depended By | Blocking? |
|------|-----------|-------------|-----------|
| **Unit 1**: Infrastructure & Auth | None | All others | YES - must deploy first |
| **Unit 2**: Core Records API | Unit 1 (DB, S3, Cognito) | Units 3, 4, 5 | YES - schema + base API |
| **Unit 3**: Workflows & Inventory | Units 1, 2 | Unit 5 (UI) | No - parallel with Unit 4 |
| **Unit 4**: Search & AI | Units 1, 2 | Unit 5 (UI) | No - parallel with Unit 3 |
| **Unit 5**: Frontend & Portal | Units 1, 2 (API contracts) | None | Partial - can start with mocked APIs |

## Build Sequence

```
Phase A (Foundation):
  Unit 1: Infrastructure & Auth
       |
       v
Phase B (Core):
  Unit 2: Core Records API + Schema
       |
       +------------------+------------------+
       |                  |                  |
       v                  v                  v
Phase C (Parallel):
  Unit 3: Workflows    Unit 4: Search    Unit 5: Frontend
  & Inventory          & AI              & Portal (start)
       |                  |                  |
       +------------------+------------------+
       |
       v
Phase D (Integration):
  Unit 5: Frontend (complete - wire to all APIs)
       |
       v
Phase E (Polish):
  Seed data, demo scripts, E2E testing
```

## Interface Contracts Between Units

### Unit 1 → Unit 2 (Infrastructure provides to Backend)
| Resource | Export Name | Type |
|----------|-----------|------|
| Database URL | DATABASE_URL | Connection string (via RDS Proxy) |
| S3 Documents Bucket | DOCUMENTS_BUCKET | Bucket name |
| S3 Exports Bucket | EXPORTS_BUCKET | Bucket name |
| Cognito User Pool ID | COGNITO_USER_POOL_ID | String |
| Cognito App Client ID | COGNITO_CLIENT_ID | String |
| OpenSearch Domain | OPENSEARCH_ENDPOINT | URL |
| SQS Classify Queue | CLASSIFY_QUEUE_URL | URL |
| SQS OCR Queue | OCR_QUEUE_URL | URL |
| SQS Notification Queue | NOTIFICATION_QUEUE_URL | URL |
| KMS Key ARN | KMS_KEY_ARN | ARN |

### Unit 2 → Unit 3 (Core Records provides to Workflows)
| Interface | Type | Purpose |
|-----------|------|---------|
| RecordsRepository | Import | Query/update records from workflow logic |
| Record types | Import | TypeScript interfaces |
| Auth middleware | Import | Shared Express middleware chain |
| Audit middleware | Import | Shared audit logging |
| Database connection | Import | Shared Knex instance |

### Unit 2 → Unit 4 (Core Records provides to Search & AI)
| Interface | Type | Purpose |
|-----------|------|---------|
| Record indexing hook | Event | Trigger re-index on record mutation |
| S3 document path | Convention | `s3://{bucket}/records/{recordId}/{filename}` |
| Record types | Import | TypeScript interfaces for search results |
| Classification update API | Internal | AI Lambda calls back to update tags |

### Units 2,3,4 → Unit 5 (Backend provides to Frontend)
| Interface | Type | Purpose |
|-----------|------|---------|
| REST API | HTTP | All endpoints documented in OpenAPI spec |
| Cognito auth flow | SDK | AWS Amplify Auth for frontend login |
| WebSocket (future) | N/A | Not in demo — polling for notifications |
| S3 presigned URLs | HTTP | Direct file upload from browser |

## Shared Resources (Cross-Unit)

| Resource | Owner Unit | Consumers |
|----------|-----------|-----------|
| PostgreSQL schema | Unit 2 (migrations) | Units 3, 4 (additional tables via migrations) |
| OpenSearch indices | Unit 4 (index config) | Unit 2 (indexing), Unit 5 (search UI) |
| Cognito users | Unit 1 (pool setup) | Units 2-5 (JWT validation) |
| S3 documents bucket | Unit 1 (creation) | Units 2, 4 (read/write) |
| SQS queues | Unit 1 (creation) | Unit 2 (produce), Unit 4 (consume) |
| Shared types package | All contribute | All consume |

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Unit 1 delay blocks everything | Deploy infrastructure first in isolation; other units can use local Docker (Postgres, OpenSearch, LocalStack) for development |
| Unit 2 schema changes break Units 3/4 | Schema defined upfront in Functional Design; additive-only changes after initial migration |
| Frontend blocked by incomplete APIs | Frontend starts with mocked API responses; swap to real APIs as backend units complete |
| AI services (Bedrock/Textract) unavailable | Pre-computed fallback responses for demo if service limits hit |
