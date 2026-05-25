# User Stories - Maine Records Management System

## Epic 1: Records Lifecycle Management

### US-1.1: Create Record from Template
**As** Diana (Records Officer), **I want to** create a new record entry using a pre-defined template, **so that** data is consistent and required fields are enforced.

**Acceptance Criteria:**
- [ ] Template pre-populates default fields (Agency code, Unit, Subunit)
- [ ] Required fields enforced: Container #, 8-digit location, Series Title, File name
- [ ] System generates unique tracking number
- [ ] Record saved with "Active" status
- [ ] Audit log captures creation event with user and timestamp

### US-1.2: Classify Record Automatically
**As** Michael (Archives Staff), **I want** uploaded records to be automatically classified using AI, **so that** I spend less time on manual categorization.

**Acceptance Criteria:**
- [ ] Upon upload, Bedrock analyzes document content and metadata
- [ ] System assigns category, tags, and record type automatically
- [ ] Auto-assigned tags are visible and editable by staff
- [ ] Classification confidence score displayed
- [ ] Staff can accept, modify, or reject classification

### US-1.3: Batch Index Physical Records
**As** Michael (Archives Staff), **I want to** batch-index multiple physical boxes during conversion, **so that** high-volume intake is efficient.

**Acceptance Criteria:**
- [ ] Upload CSV/spreadsheet with multiple record entries
- [ ] System validates all required fields per template
- [ ] Errors flagged per row with clear messages
- [ ] Successfully validated records created in bulk
- [ ] Summary report generated (created count, error count, details)

---

## Epic 2: Retention Schedule Management

### US-2.1: Configure Retention Schedule
**As** Sarah (Admin), **I want to** define retention schedules per record series, **so that** records are tracked against legal requirements.

**Acceptance Criteria:**
- [ ] Create schedule with: series name, retention period, disposition action, legal authority
- [ ] Schedule applies automatically to all records in that series
- [ ] Multiple schedules supported (different periods per record type)
- [ ] Schedule changes propagate to existing records

### US-2.2: Receive Retention Alerts
**As** Diana (Records Officer), **I want to** receive alerts before records reach disposition date, **so that** I can take timely action.

**Acceptance Criteria:**
- [ ] Dashboard shows upcoming dispositions (90, 30, 7 day thresholds)
- [ ] Email notifications sent at each threshold
- [ ] Alert includes record details, schedule info, required action
- [ ] Alerts configurable per agency/schedule
- [ ] Overdue items highlighted in red

---

## Epic 3: Transmittal & Transfer Processing

### US-3.1: Submit Transmittal Request
**As** Diana (Records Officer), **I want to** submit a digital transmittal form to transfer boxes to the State Records Center, **so that** I don't need paper forms.

**Acceptance Criteria:**
- [ ] Digital form with box inventory (multiple boxes per transmittal)
- [ ] Each box entry includes: Series Title, date range, box count, description
- [ ] System generates unique transmittal number (TR #)
- [ ] Form routed to Archives Staff for review
- [ ] Diana receives confirmation email with TR #

### US-3.2: Process Incoming Transmittal
**As** Michael (Archives Staff), **I want to** review and accept transmittals, assigning warehouse locations, **so that** records are properly shelved.

**Acceptance Criteria:**
- [ ] View pending transmittals in workflow queue
- [ ] Review box details and approve/reject/request changes
- [ ] Assign 8-digit warehouse location per box
- [ ] Scan barcode on physical receipt to confirm delivery
- [ ] System updates inventory and notifies Records Officer
- [ ] Transmittal receipt auto-generated

### US-3.3: Track Transfer Status
**As** Diana (Records Officer), **I want to** see real-time status of my transmittals, **so that** I know where my records are.

**Acceptance Criteria:**
- [ ] Status visible: Submitted → Under Review → Accepted → In Transit → Received → Shelved
- [ ] Timestamp at each status change
- [ ] Filter by date, status, TR #
- [ ] Email notification at each status change (configurable)

---

## Epic 4: Records Disposition

### US-4.1: Initiate Disposition
**As** Michael (Archives Staff), **I want to** initiate disposition for records that have met retention, **so that** expired records are properly handled.

**Acceptance Criteria:**
- [ ] View records eligible for disposition (retention period complete)
- [ ] Select records for disposition (individual or batch)
- [ ] Choose action: Destroy, Transfer to Archives, or Extend
- [ ] System checks for legal holds before proceeding
- [ ] Initiates multi-level approval workflow

### US-4.2: Apply Legal Hold
**As** Sarah (Admin), **I want to** place a legal hold on records, **so that** they are protected from destruction during litigation.

**Acceptance Criteria:**
- [ ] Apply hold to individual records, series, or by search criteria
- [ ] Held records clearly flagged in UI (visual indicator)
- [ ] Disposition workflow blocked for held records
- [ ] Hold includes: reason, authority, date applied, applied by
- [ ] Hold removal requires admin approval with audit trail

### US-4.3: Approve Disposition
**As** Sarah (Admin), **I want to** review and approve disposition requests, **so that** records are not destroyed without authorization.

**Acceptance Criteria:**
- [ ] Multi-level approval (Records Officer → Archives Staff → Admin)
- [ ] Each approver sees full record details and disposition action
- [ ] Approve or reject with required comments
- [ ] On final approval, system generates disposition certificate
- [ ] Complete audit trail of all approvals/rejections

---

## Epic 5: Warehouse Inventory & Location Tracking

### US-5.1: Manage Warehouse Locations
**As** Michael (Archives Staff), **I want to** view and manage box locations across all three warehouses, **so that** I can quickly find any record.

**Acceptance Criteria:**
- [ ] Three warehouse locations configured with distinct names
- [ ] Location hierarchy: Warehouse → Row → Bay → Shelf → Position
- [ ] Visual map showing occupied/vacant positions
- [ ] Search by location code (8-digit)
- [ ] Bulk location reassignment supported

### US-5.2: Scan Barcode for Check-In/Out
**As** Michael (Archives Staff), **I want to** scan a barcode to check records in or out, **so that** custody is tracked automatically.

**Acceptance Criteria:**
- [ ] Scan barcode via USB/Bluetooth scanner or camera
- [ ] System identifies record and shows current status
- [ ] One-click check-out (captures: user, purpose, expected return)
- [ ] One-click check-in (updates location, clears custody)
- [ ] Legacy barcodes from existing system recognized

### US-5.3: View Storage Utilization
**As** Sarah (Admin), **I want to** see storage utilization across all warehouses, **so that** I can plan capacity.

**Acceptance Criteria:**
- [ ] Dashboard showing % utilized per warehouse
- [ ] Drill down to row/bay level
- [ ] Approaching capacity alerts (configurable threshold)
- [ ] Trend chart showing utilization over time
- [ ] Export report to PDF/CSV

---

## Epic 6: Record Circulation Tracking

### US-6.1: Check Out Record
**As** Diana (Records Officer), **I want to** request a physical record for review, **so that** I can access it at my office.

**Acceptance Criteria:**
- [ ] Request checkout from search results or inventory view
- [ ] Specify purpose and expected return date
- [ ] Archives Staff notified of request
- [ ] Custody history updated
- [ ] Record status changes to "Checked Out"

### US-6.2: Receive Overdue Notices
**As** Michael (Archives Staff), **I want** the system to send automated overdue notices, **so that** records are returned promptly.

**Acceptance Criteria:**
- [ ] Configurable overdue threshold (e.g., 30 days)
- [ ] Automated email to borrower at threshold
- [ ] Escalation email to supervisor if not returned within 7 days of notice
- [ ] Overdue items highlighted in dashboard
- [ ] Complete custody history maintained regardless of overdue status

---

## Epic 7: Agency Self-Service Portal

### US-7.1: Submit Accession Request
**As** Diana (Records Officer), **I want to** submit an accession request through the portal, **so that** I can transfer records without calling Archives.

**Acceptance Criteria:**
- [ ] Form captures: agency, record series, date range, volume, description
- [ ] Attach supporting documents (retention schedule reference)
- [ ] Submit for Archives review
- [ ] Receive confirmation with request ID
- [ ] Track status through portal dashboard

### US-7.2: Submit Reference Request
**As** James (Agency Staff), **I want to** request retrieval of a specific record, **so that** I can access it for my work.

**Acceptance Criteria:**
- [ ] Search for records by metadata (limited to own agency)
- [ ] Specify delivery method: digital scan or physical retrieval
- [ ] Add purpose/justification
- [ ] Receive estimated fulfillment time
- [ ] Track request status (Submitted → Assigned → In Progress → Complete)
- [ ] Receive notification when fulfilled

---

## Epic 8: Advanced Search & Retrieval

### US-8.1: Search by Metadata
**As** Michael (Archives Staff), **I want to** search records using multiple metadata fields, **so that** I can quickly locate specific items.

**Acceptance Criteria:**
- [ ] Search by: agency, record type, date range, series, location, custom tags
- [ ] Faceted filters (refine results by clicking categories)
- [ ] Results show key metadata in summary cards
- [ ] Sort by relevance, date, agency, location
- [ ] Save frequent searches

### US-8.2: AI-Powered Semantic Search
**As** Michael (Archives Staff), **I want to** search using natural language, **so that** I can find records without knowing exact metadata.

**Acceptance Criteria:**
- [ ] Natural language query input (e.g., "health department records from 2020 about licensing")
- [ ] Bedrock processes query and returns semantically relevant results
- [ ] Results ranked by relevance with explanation
- [ ] Works across OCR-extracted text from scanned documents
- [ ] Fallback to metadata search if AI results insufficient

### US-8.3: OCR Search for Scanned Documents
**As** Michael (Archives Staff), **I want** scanned documents to be searchable by content, **so that** I can find records even without complete metadata.

**Acceptance Criteria:**
- [ ] Textract processes uploaded scans automatically
- [ ] Extracted text indexed in OpenSearch
- [ ] Full-text search returns results from scanned content
- [ ] Highlight matching text in results preview
- [ ] OCR confidence score displayed

---

## Epic 9: Real-Time Analytics Dashboard

### US-9.1: View Operational Dashboard
**As** Sarah (Admin), **I want to** see real-time operational metrics, **so that** I can monitor system health and activity.

**Acceptance Criteria:**
- [ ] Widgets: active records count, pending dispositions, open transfers, reference requests
- [ ] Filter by agency, date range, warehouse
- [ ] Auto-refresh (configurable interval)
- [ ] Drill-down from summary to detail
- [ ] Responsive layout (desktop and tablet)

### US-9.2: Export Reports
**As** Sarah (Admin), **I want to** export dashboard data to PDF/Excel/CSV, **so that** I can share with Department leadership.

**Acceptance Criteria:**
- [ ] Export current dashboard view to PDF
- [ ] Export underlying data to Excel/CSV
- [ ] Custom report templates (create, save, reuse)
- [ ] Schedule automated reports (daily/weekly/monthly)
- [ ] Reports include date range and filter context

### US-9.3: View Warehouse Utilization Report
**As** Michael (Archives Staff), **I want to** see warehouse capacity metrics, **so that** I can plan for incoming transfers.

**Acceptance Criteria:**
- [ ] Utilization % per warehouse, per row, per bay
- [ ] Trend over time (monthly)
- [ ] Projected full date at current rate
- [ ] Recently disposed (freed capacity)
- [ ] Items marked for litigation (cannot be moved)

---

## Epic 10: User & Role Management

### US-10.1: Manage Users
**As** Sarah (Admin), **I want to** provision and manage user accounts, **so that** access is controlled.

**Acceptance Criteria:**
- [ ] Create user with: name, email, agency, role
- [ ] Assign one or more roles (Admin, Archives Staff, Records Officer, Agency Staff)
- [ ] Activate/deactivate accounts
- [ ] View login history and last activity
- [ ] MFA enrollment status visible

### US-10.2: Configure RBAC
**As** Sarah (Admin), **I want to** define what each role can access, **so that** data is properly restricted.

**Acceptance Criteria:**
- [ ] Permissions configurable per module (Records, Transmittals, Disposition, Inventory, Reports)
- [ ] Agency-scoped access (Records Officers see only their agency)
- [ ] Warehouse-scoped access (if needed)
- [ ] Permission changes take effect immediately
- [ ] Audit log of all permission changes

---

## Epic 11: Security & Audit

### US-11.1: View Audit Trail
**As** Sarah (Admin), **I want to** view a complete audit trail of all system actions, **so that** I can ensure compliance.

**Acceptance Criteria:**
- [ ] Log all: logins, record views, edits, approvals, exports, searches
- [ ] Filter by: user, action type, date range, record
- [ ] Tamper-proof (write-once, cannot be edited/deleted)
- [ ] Export to JSON/CSV for SIEM integration
- [ ] Retain per State retention policy (minimum 7 years)

### US-11.2: Login via SSO (Simulated)
**As** any user, **I want to** log in with my State credentials, **so that** I don't need a separate password.

**Acceptance Criteria:**
- [ ] SAML 2.0 / OIDC login flow (simulated with Cognito)
- [ ] MFA enforced on login
- [ ] Session timeout per State standards (configurable)
- [ ] Role mapped from directory group membership
- [ ] Failed login attempts logged and alerted

---

## Epic 12: Enterprise Integrations (Mocked)

### US-12.1: Sync with ArchivesSpace
**As** Michael (Archives Staff), **I want** records to sync with ArchivesSpace, **so that** catalog references are always current.

**Acceptance Criteria:**
- [ ] Bidirectional sync UI shows connected status
- [ ] View linked ArchivesSpace records from RMS
- [ ] Sync triggered on record changes (simulated)
- [ ] Conflict resolution UI for mismatched records
- [ ] Sync history log visible

### US-12.2: View Integration Dashboard
**As** Sarah (Admin), **I want to** see the status of all integrations, **so that** I know they're functioning.

**Acceptance Criteria:**
- [ ] Integration cards: ArchivesSpace, CRM, M365, Active Directory
- [ ] Status indicator: Connected / Error / Disabled
- [ ] Last sync timestamp
- [ ] Record count synced
- [ ] Configuration link per integration

---

## Story Priority Matrix (Demo Order)

| Priority | Stories | Rationale |
|----------|---------|-----------|
| P0 (Must demo first) | US-1.1, US-3.1, US-3.2, US-5.1, US-5.2, US-8.1, US-10.1 | Core lifecycle visible end-to-end |
| P1 (Core features) | US-1.2, US-2.1, US-2.2, US-4.1, US-4.2, US-4.3, US-7.1, US-7.2 | Differentiators and compliance |
| P2 (Impressive) | US-8.2, US-8.3, US-9.1, US-9.2, US-1.3, US-6.1, US-6.2 | AI features and analytics |
| P3 (Complete picture) | US-5.3, US-9.3, US-10.2, US-11.1, US-11.2, US-12.1, US-12.2 | Admin and integrations |
