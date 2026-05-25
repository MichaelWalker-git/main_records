# Component Methods - Maine Records Management System

## RecordsService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| createRecord | CreateRecordDto (templateId, fields, agencyId) | Record | Create record from template with validation |
| createBatchRecords | File (CSV), templateId | BatchResult (created[], errors[]) | Bulk import from spreadsheet |
| getRecord | recordId | Record (with metadata, tags, location) | Fetch single record with full details |
| listRecords | ListFilter (agency, type, status, page) | PaginatedResult<Record> | List records with filters |
| updateRecord | recordId, UpdateRecordDto | Record | Update record fields |
| classifyRecord | recordId, documentUrl? | ClassificationResult (tags[], category, confidence) | Trigger AI classification |
| assignRetentionSchedule | recordId, scheduleId | Record | Link record to retention schedule |
| getRecordsBySchedule | scheduleId, status? | Record[] | Records under a retention schedule |
| generateBarcode | recordId, format (CODE128/QR) | BarcodeResult (svg, printUrl) | Generate barcode for record |
| lookupByBarcode | barcodeValue | Record | Resolve barcode/legacy code to record |

## WorkflowService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| createTransmittal | CreateTransmittalDto (agencyId, items[]) | Transmittal (with TR#) | Submit new transmittal |
| approveTransmittal | transmittalId, userId, comments | Transmittal | Approve transmittal request |
| rejectTransmittal | transmittalId, userId, reason | Transmittal | Reject with reason |
| receiveTransmittal | transmittalId, scannedBarcode, locationCodes[] | Transmittal | Confirm physical receipt |
| initiateDisposition | DispositionDto (recordIds[], action, justification) | Disposition | Start disposition workflow |
| approveDisposition | dispositionId, userId, level, comments | Disposition | Approve at current level |
| rejectDisposition | dispositionId, userId, reason | Disposition | Reject disposition |
| applyLegalHold | LegalHoldDto (recordIds/query, reason, authority) | LegalHold | Place legal hold |
| removeLegalHold | holdId, userId, justification | void | Remove hold (admin only) |
| createReferenceRequest | RefRequestDto (recordId, method, purpose) | ReferenceRequest | Agency submits retrieval request |
| fulfillReferenceRequest | requestId, userId, notes | ReferenceRequest | Mark request fulfilled |
| getWorkflowQueue | userId, type?, status? | WorkflowItem[] | Get pending items for user |

## InventoryService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| getWarehouses | void | Warehouse[] | List all warehouse locations |
| getLocationTree | warehouseId | LocationNode (hierarchical) | Get bay/shelf/position tree |
| assignLocation | recordId, locationCode (8-digit) | Location | Assign box to location |
| relocateRecord | recordId, newLocationCode | Location | Move box to new location |
| checkOut | recordId, userId, purpose, returnDate | CirculationEvent | Check out record |
| checkIn | recordId, userId | CirculationEvent | Check in record |
| getCustodyHistory | recordId | CirculationEvent[] | Full custody change history |
| getOverdueItems | thresholdDays? | OverdueItem[] | Items past return date |
| getUtilization | warehouseId? | UtilizationReport | Capacity stats |
| getVacantLocations | warehouseId | Location[] | Available positions |
| scanBarcode | barcodeValue | ScanResult (record, location, status) | Process scan event |

## SearchService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| searchMetadata | MetadataQuery (filters, facets, page, sort) | SearchResult | Structured metadata search |
| searchFullText | query, filters? | SearchResult | Full-text content search |
| searchSemantic | naturalLanguageQuery | SearchResult (with relevanceExplanation) | AI-powered semantic search |
| searchOCR | query, documentTypes? | SearchResult | Search across OCR-extracted text |
| getFacets | field | FacetResult (values[], counts[]) | Get facet values for filtering |
| indexRecord | record | void | Index/re-index a record in OpenSearch |
| bulkIndex | records[] | BulkIndexResult | Batch indexing |

## AIService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| classifyDocument | documentUrl, metadata? | Classification (category, tags[], confidence) | Bedrock classification |
| extractText | documentUrl | OCRResult (text, pages[], confidence) | Textract OCR |
| generateEmbedding | text | number[] | Bedrock embedding for semantic search |
| autoTag | recordMetadata, content? | Tag[] (name, confidence) | ML-based tagging |
| suggestCategory | recordMetadata | CategorySuggestion[] | Suggest classification |

## NotificationService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| sendRetentionAlert | recordId, daysUntilDisposition, recipientId | void | Retention deadline alert |
| sendOverdueNotice | circulationEventId, borrowerId | void | Overdue return notice |
| sendWorkflowUpdate | workflowItemId, status, recipientId | void | Status change notification |
| sendEmail | to, subject, templateId, data | void | Send email via SES |
| getNotifications | userId, read? | Notification[] | In-app notification list |
| markRead | notificationId | void | Mark notification as read |
| processScheduledAlerts | void | AlertSummary | Cron job: check all retention thresholds |

## AuditService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| logEvent | AuditEvent (userId, action, resourceType, resourceId, details, ip) | void | Write audit entry |
| queryEvents | AuditFilter (userId?, action?, dateRange, resourceType?) | PaginatedResult<AuditEvent> | Query audit trail |
| exportEvents | AuditFilter, format (JSON/CSV) | ExportResult (url) | Export for SIEM |
| getRecordHistory | recordId | AuditEvent[] | All events for a record |
| getUserActivity | userId, dateRange | AuditEvent[] | User's activity log |

## AuthService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| authenticate | cognitoToken | AuthSession (user, roles, permissions) | Validate and resolve session |
| authorizeAction | userId, action, resourceType, resourceId? | boolean | Check permission |
| getUserRoles | userId | Role[] | Get user's assigned roles |
| assignRole | userId, roleId | void | Assign role to user |
| removeRole | userId, roleId | void | Remove role from user |
| listUsers | filter? | PaginatedResult<User> | List all users |
| createUser | CreateUserDto | User | Provision user in Cognito + DB |
| deactivateUser | userId | void | Disable user account |

## ReportService

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| getDashboardMetrics | filters (dateRange, agency?, warehouse?) | DashboardData | Aggregate metrics |
| generateReport | templateId, parameters | ReportResult (data, format) | Run report template |
| exportReport | reportId, format (PDF/Excel/CSV) | ExportResult (url) | Export generated report |
| listTemplates | void | ReportTemplate[] | Available report templates |
| createTemplate | CreateTemplateDto | ReportTemplate | Save custom template |
| getUtilizationTrend | warehouseId, months | TrendData[] | Historical utilization |
