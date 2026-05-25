# Requirements Document - Maine Records Management System

## Intent Analysis
**Request**: Build a fully functional demo of the Maine Records Management System for State of Maine RFP evaluators, showcasing all promised features from the Horus Technology proposal (RFP# 202603058).

**Demo Deadline**: Week of 2026-05-26 (next week)

## Demo Configuration Decisions
| Decision | Choice |
|----------|--------|
| Deployment | Fully deployed on AWS (michael-primary account) |
| Data | Realistic synthetic data mimicking Maine State Archives |
| Integrations | Simulated/mocked with realistic UI flows |
| AI/ML | Real AWS services (Textract + Bedrock, NO Comprehend) |
| User Roles | All roles demonstrable |

## Functional Requirements

### FR-01: Records Lifecycle Management
- Create, classify, retain, transfer, and dispose records
- End-to-end tracking from creation through disposition
- Support both physical (boxes) and digital records
- Template-driven record creation with required fields:
  - Container number, 8-digit location, Umbrella, Unit, Subunit
  - Series Title, File name, Disposition date, Agency code
  - Box #, TR #, Vacant location indicator

### FR-02: Records Classification & Ingestion
- Automated data classification upon upload using Bedrock
- ML-based dynamic tagging (type, agency, subject)
- Batch indexing for physical-to-digital conversions
- OCR via Textract for scanned documents
- Predefined category rules with staff-reviewable auto-tags

### FR-03: Retention Schedule Management
- Configure retention schedules per record series
- Automated tracking of retention periods
- Configurable alerts (90-day, 30-day, 7-day before disposition)
- Email and dashboard notifications for records officers
- Customizable retention policies per regulatory requirement

### FR-04: Transmittal & Transfer Processing
- Digital transmittal forms with unique tracking numbers
- Configurable approval workflows
- Track transfers between departments/locations
- Physical receipt via barcode scan
- Auto-update inventory and location records on transfer

### FR-05: Records Disposition
- Multi-level approval workflow
- Legal hold capability (flag records, prevent destruction)
- Electronic disposition authorization form
- Complete audit trail of all disposition actions
- Disposition certificate generation

### FR-06: Warehouse Inventory & Location Tracking
- Three State Records Center warehouse locations
- Bay/shelf/position location hierarchy
- Box-level and item-level inventory
- Barcode generation (new) + legacy barcode support
- Optional RFID integration (API-level)
- Visual location map for staff
- Storage utilization reporting

### FR-07: Record Circulation Tracking
- Check-in/check-out with timestamp and user attribution
- Complete custody change history per record
- Automated overdue notices (configurable intervals)
- Real-time status tracking

### FR-08: Agency Self-Service Portal
- Role-based agency access (separate from Archives staff UI)
- Accession request submission
- Transmittal tracking
- Reference request workflow (digital scan or physical retrieval)
- Status tracking dashboard for agencies

### FR-09: Advanced Search & Retrieval
- Metadata-based search (agency, type, date, location, custom fields)
- Full-text indexing across digital content
- Custom tagging and categorization
- OCR search (Textract) for scanned documents
- AI-enhanced semantic search (Bedrock)
- Faceted filters and date-range queries

### FR-10: Real-Time Analytics Dashboard
- Active records by agency and series
- Retention schedule status (upcoming dispositions)
- Transfer activity metrics
- Reference request volume and response times
- Warehouse utilization
- Exportable to PDF, Excel, CSV
- Custom report templates
- Integration-ready for QuickSight/Power BI

### FR-11: User & Role Management
- Role-Based Access Control (RBAC)
- Roles: System Admin, Archives Staff, Records Officer, Agency Staff
- User provisioning and role assignment
- Multi-factor authentication (MFA) enforced
- Session timeout per State standards

### FR-12: Security & Compliance
- SAML 2.0 / OIDC federation (mocked for demo - SOM Active Directory)
- AES-256 encryption at rest (AWS KMS, customer-managed keys)
- TLS 1.2+ in transit
- Complete audit trail (CloudTrail + application-level)
- FIPS 140-2 validated cryptographic modules
- Logs exportable to SIEM (JSON/CSV format)

### FR-13: Enterprise Integrations (Mocked)
- ArchivesSpace bidirectional sync (simulated REST API)
- CRM platform connector (simulated)
- Microsoft 365/SharePoint document ingestion (simulated)
- SOM Active Directory federation (simulated)
- Data visualization tool connectors (QuickSight configured)

### FR-14: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Responsive design (Chrome, Firefox, Edge, Safari)

## Non-Functional Requirements

### NFR-01: Performance
- Page load < 2 seconds
- Search results < 3 seconds
- Dashboard refresh < 5 seconds
- Support concurrent users (demo scale: 50+)

### NFR-02: Availability & DR
- Multi-region deployment (us-east-1 primary, us-west-2 DR)
- S3 cross-region replication
- RDS automated failover
- RTO: 4 hours, RPO: 1 hour

### NFR-03: Scalability
- Serverless components (Fargate, Lambda) for auto-scaling
- OpenSearch for large-volume search
- S3 for unlimited storage scaling

### NFR-04: Security
- Private VPC subnets for application and database tiers
- WAF and Shield protection
- CloudTrail audit logging
- No state data used for AI training

## Architecture Summary (from Proposal)

```
+------------------+     +------------------+     +------------------+
|   CloudFront     |---->|   API Gateway    |---->|   ECS Fargate    |
|   (CDN/HTTPS)   |     |   (REST API)     |     |   (App Workers)  |
+------------------+     +------------------+     +------------------+
                                                         |
                    +------------------------------------+----+
                    |                    |                     |
              +-----v------+     +------v-----+     +--------v-------+
              |    RDS      |     |   S3       |     |  OpenSearch    |
              | PostgreSQL  |     | (Storage)  |     | (Full-text)    |
              +-------------+     +------------+     +----------------+
                                        |
                    +-------------------+-------------------+
                    |                                       |
              +-----v------+                        +------v------+
              |  Textract   |                        |   Bedrock   |
              |  (OCR)      |                        |  (AI/ML)    |
              +-------------+                        +-------------+

Auth: Cognito (SAML/OIDC) | Monitoring: CloudWatch | IaC: CDK
```

## Acceptance Criteria for Demo
1. All 14 functional requirements are demonstrable with realistic flows
2. All 4 user roles can log in and see role-appropriate views
3. Real AWS AI services process documents live
4. Analytics dashboard shows meaningful metrics
5. Audit trail captures all actions
6. System is accessible (keyboard nav, screen reader basics)
7. Evaluators can walk through complete records lifecycle end-to-end
