# Unit of Work - Story Map

## Story-to-Unit Mapping

### Unit 1: Infrastructure & Auth
| Story | Title | Mapping Rationale |
|-------|-------|-------------------|
| US-10.1 | Manage Users | Cognito user pool setup, pre-provisioned demo users |
| US-10.2 | Configure RBAC | Cognito groups, IAM policies, permission structure |
| US-11.2 | Login via SSO (Simulated) | Cognito SAML/OIDC identity provider configuration |

### Unit 2: Core Records API
| Story | Title | Mapping Rationale |
|-------|-------|-------------------|
| US-1.1 | Create Record from Template | Record CRUD, template validation, field enforcement |
| US-1.2 | Classify Record Automatically | Classification trigger (SQS enqueue), tag management |
| US-1.3 | Batch Index Physical Records | CSV parsing, bulk insert, validation |
| US-2.1 | Configure Retention Schedule | Retention schedule CRUD, assignment to records |
| US-2.2 | Receive Retention Alerts | Schedule tracking, threshold calculation (alert delivery in Unit 4) |

### Unit 3: Workflows & Inventory
| Story | Title | Mapping Rationale |
|-------|-------|-------------------|
| US-3.1 | Submit Transmittal Request | Transmittal creation, form processing |
| US-3.2 | Process Incoming Transmittal | Approval workflow, location assignment, barcode receipt |
| US-3.3 | Track Transfer Status | Status pipeline, real-time updates |
| US-4.1 | Initiate Disposition | Disposition creation, legal hold check |
| US-4.2 | Apply Legal Hold | Legal hold CRUD, enforcement logic |
| US-4.3 | Approve Disposition | Multi-level approval chain, certificate generation |
| US-5.1 | Manage Warehouse Locations | Location hierarchy, visual map, vacancy tracking |
| US-5.2 | Scan Barcode for Check-In/Out | Barcode lookup, circulation events |
| US-5.3 | View Storage Utilization | Utilization calculations, trend data |
| US-6.1 | Check Out Record | Checkout flow, return date, custody |
| US-6.2 | Receive Overdue Notices | Overdue detection logic (notification delivery in Unit 4) |
| US-7.1 | Submit Accession Request | Accession form, routing to Archives Staff |
| US-7.2 | Submit Reference Request | Reference request flow, fulfillment tracking |

### Unit 4: Search & AI
| Story | Title | Mapping Rationale |
|-------|-------|-------------------|
| US-8.1 | Search by Metadata | OpenSearch metadata queries, faceted filters |
| US-8.2 | AI-Powered Semantic Search | Bedrock embeddings, vector search |
| US-8.3 | OCR Search for Scanned Documents | Textract pipeline, text indexing |
| US-9.1 | View Operational Dashboard | Metrics aggregation, dashboard data API |
| US-9.2 | Export Reports | Report generation Lambda, PDF/Excel export |
| US-9.3 | View Warehouse Utilization Report | Utilization trends, projections |
| US-11.1 | View Audit Trail | Audit query API, export for SIEM |

### Unit 5: Frontend & Portal
| Story | Title | Mapping Rationale |
|-------|-------|-------------------|
| ALL | All stories have frontend representation | Every story requires UI implementation |

**Unit 5 implements the UI for all 26 stories across these page groups:**

| Page Group | Stories Covered |
|------------|----------------|
| Records Management | US-1.1, US-1.2, US-1.3, US-2.1, US-2.2 |
| Transmittals | US-3.1, US-3.2, US-3.3 |
| Dispositions | US-4.1, US-4.2, US-4.3 |
| Inventory | US-5.1, US-5.2, US-5.3 |
| Circulation | US-6.1, US-6.2 |
| Agency Portal | US-7.1, US-7.2 |
| Search | US-8.1, US-8.2, US-8.3 |
| Analytics | US-9.1, US-9.2, US-9.3 |
| Admin | US-10.1, US-10.2, US-11.1, US-11.2, US-12.1, US-12.2 |

## Coverage Verification

| Epic | Stories | Unit Coverage | Gaps |
|------|---------|---------------|------|
| Epic 1: Records Lifecycle | 3 | Unit 2 + Unit 5 | None |
| Epic 2: Retention Schedules | 2 | Unit 2 + Unit 4 (alerts) + Unit 5 | None |
| Epic 3: Transmittals | 3 | Unit 3 + Unit 5 | None |
| Epic 4: Dispositions | 3 | Unit 3 + Unit 5 | None |
| Epic 5: Warehouse Inventory | 3 | Unit 3 + Unit 4 (utilization) + Unit 5 | None |
| Epic 6: Circulation | 2 | Unit 3 + Unit 4 (overdue alerts) + Unit 5 | None |
| Epic 7: Agency Portal | 2 | Unit 3 + Unit 5 | None |
| Epic 8: Search & Retrieval | 3 | Unit 4 + Unit 5 | None |
| Epic 9: Analytics | 3 | Unit 4 + Unit 5 | None |
| Epic 10: User Management | 2 | Unit 1 + Unit 5 | None |
| Epic 11: Security & Audit | 2 | Unit 1 + Unit 4 + Unit 5 | None |
| Epic 12: Integrations | 2 | Unit 3 (sync logic) + Unit 5 (UI) | None |

**Total**: 26 stories → All mapped to units → 0 gaps

## Priority Alignment

| Demo Priority | Stories | Primary Units |
|---------------|---------|---------------|
| P0 (Must demo first) | US-1.1, US-3.1, US-3.2, US-5.1, US-5.2, US-8.1, US-10.1 | Units 1, 2, 3, 5 |
| P1 (Core features) | US-1.2, US-2.1, US-2.2, US-4.1, US-4.2, US-4.3, US-7.1, US-7.2 | Units 2, 3, 4, 5 |
| P2 (Impressive) | US-8.2, US-8.3, US-9.1, US-9.2, US-1.3, US-6.1, US-6.2 | Units 2, 3, 4, 5 |
| P3 (Complete picture) | US-5.3, US-9.3, US-10.2, US-11.1, US-11.2, US-12.1, US-12.2 | Units 1, 3, 4, 5 |

## Construction Phase Sequence

Based on dependencies and priority:

```
1. Unit 1: Infrastructure & Auth
   → Functional Design → Infrastructure Design → Code Generation
   
2. Unit 2: Core Records API
   → Functional Design → Code Generation
   
3. Units 3 + 4 (parallel):
   Unit 3: Workflows & Inventory → Functional Design → Code Generation
   Unit 4: Search & AI → Functional Design → Code Generation
   
4. Unit 5: Frontend & Portal
   → Functional Design → Code Generation
   
5. Build and Test (all units)
   → Integration testing → Demo preparation
```
