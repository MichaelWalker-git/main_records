# Business Logic Model - Unit 2: Core Records API

## Record Creation Flow

```
Client POST /api/records
  │
  ├─ 1. Validate JWT (AuthMiddleware)
  ├─ 2. Check permission: records.create (AuthzMiddleware)
  ├─ 3. Load template by templateId
  ├─ 4. Validate request body against template field definitions
  │     └─ For each field: check required, type, pattern, options
  ├─ 5. Generate tracking number: RMS-{YYYYMMDD}-{next sequence}
  ├─ 6. Set agencyId from user context (unless admin overriding)
  ├─ 7. Calculate dispositionDate if retentionScheduleId provided
  ├─ 8. Insert record + metadata into PostgreSQL (transaction)
  ├─ 9. If recordType=DIGITAL: enqueue to classify-queue (SQS)
  ├─ 10. Index record in OpenSearch
  ├─ 11. Log audit event: record.create
  └─ 12. Return 201 with created record
```

## Batch Import Flow

```
Client POST /api/records/batch (multipart: CSV file + templateId)
  │
  ├─ 1. Auth + permission check
  ├─ 2. Parse CSV (papaparse)
  ├─ 3. Validate header row matches template fields
  ├─ 4. For each row (max 1000):
  │     ├─ Validate against template
  │     ├─ If valid: add to insertBatch[]
  │     └─ If invalid: add to errors[] with row number + message
  ├─ 5. Bulk insert valid records (single transaction)
  ├─ 6. For digital records: batch enqueue classification
  ├─ 7. Bulk index to OpenSearch
  ├─ 8. Log audit: records.batch_create (count)
  └─ 9. Return { created: [...], errors: [...], summary: { total, success, failed } }
```

## AI Classification Flow (Async)

```
SQS Message: { recordId, documentUrl }
  │
  Lambda: ai-classify
  ├─ 1. Fetch classification prompt from S3 (prompts/classify.txt)
  ├─ 2. Get document metadata from DB
  ├─ 3. Invoke Bedrock (Claude):
  │     Input: prompt + document URL (or first 5 pages)
  │     Output: { category, tags[], confidence }
  ├─ 4. Parse structured response
  ├─ 5. Update record:
  │     ├─ classificationConfidence = response.confidence
  │     ├─ classificationStatus = confidence >= 0.85 ? CLASSIFIED : PENDING
  │     └─ Insert record_tags (source=AI)
  ├─ 6. Re-index record in OpenSearch (with new tags)
  └─ 7. If confidence < 0.85: create notification for Archives Staff
```

## Retention Schedule Assignment

```
When retentionScheduleId set on record:
  │
  ├─ 1. Load schedule: { retentionPeriodDays, alertThresholds, dispositionAction }
  ├─ 2. Calculate: dispositionDate = record.createdAt + retentionPeriodDays
  ├─ 3. Update record.dispositionDate
  ├─ 4. Create schedule_alert entries for each threshold:
  │     ├─ alertDate = dispositionDate - 90 days → type: THRESHOLD_90
  │     ├─ alertDate = dispositionDate - 30 days → type: THRESHOLD_30
  │     └─ alertDate = dispositionDate - 7 days  → type: THRESHOLD_7
  └─ 5. Log audit: record.schedule_assigned
```

## Barcode Generation

```
GET /api/records/:id/barcode?format=CODE128|QR&output=svg|png
  │
  ├─ 1. Load record (verify exists + user has access)
  ├─ 2. Generate barcode using bwip-js:
  │     ├─ Content: record.trackingNumber
  │     ├─ Format: CODE128 (default) or QR
  │     └─ Include human-readable text below barcode
  ├─ 3. If output=svg: return SVG string (Content-Type: image/svg+xml)
  │    If output=png: return PNG buffer (Content-Type: image/png)
  └─ 4. Log audit: record.barcode_generated

GET /api/records/:id/barcode/label (print-ready PDF)
  │
  ├─ 1. Load record
  ├─ 2. Generate label with:
  │     ├─ Barcode (Code 128)
  │     ├─ Tracking number (text)
  │     ├─ Series title
  │     ├─ Location code
  │     ├─ Agency code
  │     └─ Box number
  └─ 3. Return PDF (standard label size: 4"x2")
```

## Barcode Scan Lookup

```
GET /api/records/scan/:code
  │
  ├─ 1. Search records WHERE trackingNumber = :code
  ├─ 2. If not found: search WHERE containerNumber = :code (legacy)
  ├─ 3. If not found: return 404 { message: "No record found", code: :code }
  ├─ 4. If found: return record with full details + current location + status
  └─ 5. Log audit: record.scan
```

## OpenSearch Index Schema

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "trackingNumber": { "type": "keyword" },
      "agencyId": { "type": "keyword" },
      "agencyName": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "containerNumber": { "type": "keyword" },
      "locationCode": { "type": "keyword" },
      "seriesTitle": { "type": "text", "analyzer": "standard" },
      "fileName": { "type": "text", "analyzer": "standard" },
      "recordType": { "type": "keyword" },
      "status": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "dispositionDate": { "type": "date" },
      "createdAt": { "type": "date" },
      "ocrText": { "type": "text", "analyzer": "standard" },
      "embedding": { "type": "knn_vector", "dimension": 1024 }
    }
  }
}
```

## Tracking Number Generation

```
Sequence: Daily counter stored in PostgreSQL
Format: RMS-{YYYYMMDD}-{0001..9999}

Example: RMS-20260722-0042

Algorithm:
  1. Get current date: YYYYMMDD
  2. SELECT nextval('tracking_seq_' || date) or INSERT with counter
  3. Pad to 4 digits
  4. Combine: "RMS-" + date + "-" + padded_counter
  5. If counter exceeds 9999 (impossible in practice), extend to 5 digits
```
