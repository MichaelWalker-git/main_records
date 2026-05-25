# Business Rules - Unit 2: Core Records API

## Record Creation Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| REC-01 | Records must be created from a valid template | templateId required, must exist and be active |
| REC-02 | All required template fields must be provided | Validate against template.fields[].required |
| REC-03 | Location code must be 8 digits | Regex: /^\d{8}$/ |
| REC-04 | Agency is derived from authenticated user (unless admin) | Auto-set from req.user.agencyId |
| REC-05 | Tracking number auto-generated on create | Format: RMS-{YYYYMMDD}-{4-digit sequence} |
| REC-06 | New records default to status ACTIVE | Cannot create in other statuses |
| REC-07 | Digital records require a file upload (S3 URL) | digitalFileUrl required when recordType=DIGITAL |
| REC-08 | Creation triggers AI classification if digital | Enqueue to classify-queue on create |

## Record Update Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| REC-09 | Records on LEGAL_HOLD cannot be modified (except by admin) | Check legal_holds table |
| REC-10 | DISPOSED records are read-only | Block all updates |
| REC-11 | Location code changes must reference valid vacant location | Query locations table |
| REC-12 | Status transitions must follow valid state machine | See state diagram below |
| REC-13 | All mutations logged to audit trail | Middleware captures before/after |

## Record Status State Machine

```
                    ┌──────────────┐
                    │              │
          ┌────────▶   ACTIVE     ◀────────┐
          │         │              │        │
          │         └──────┬───────┘        │
          │                │                │
          │         ┌──────▼───────┐        │
          │         │              │        │
  (checkin)│        │ CHECKED_OUT  │        │(return after transit)
          │         │              │        │
          │         └──────────────┘        │
          │                                 │
          │         ┌──────────────┐        │
          │         │              │        │
          └─────────│  IN_TRANSIT  ├────────┘
                    │              │
                    └──────────────┘
                    
          ┌──────────────┐     ┌──────────────┐
          │              │     │              │
          │   ON_HOLD    │     │   DISPOSED   │
          │  (legal)     │     │  (terminal)  │
          └──────────────┘     └──────────────┘
          
Valid transitions:
  ACTIVE → CHECKED_OUT (checkout)
  ACTIVE → IN_TRANSIT (transmittal accepted)
  ACTIVE → ON_HOLD (legal hold applied)
  ACTIVE → DISPOSED (disposition approved)
  CHECKED_OUT → ACTIVE (checkin)
  IN_TRANSIT → ACTIVE (received at destination)
  ON_HOLD → ACTIVE (legal hold removed)
```

## Batch Import Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| BATCH-01 | CSV must have header row matching template fields | Validate column names |
| BATCH-02 | Maximum 1000 rows per batch | Reject files > 1000 rows |
| BATCH-03 | Each row validated independently | Errors don't block valid rows |
| BATCH-04 | Duplicate tracking numbers within batch rejected | Check uniqueness |
| BATCH-05 | Batch result includes per-row success/error detail | Return { created: [], errors: [] } |
| BATCH-06 | All created records get classification queued | Batch enqueue to SQS |

## Classification Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| CLASS-01 | Only DIGITAL records with file uploads are classified | Skip PHYSICAL records |
| CLASS-02 | Classification runs asynchronously (SQS → Lambda) | Non-blocking to user |
| CLASS-03 | Results include confidence score (0.0-1.0) | Store on record |
| CLASS-04 | Auto-accepted if confidence ≥ 0.85 | classificationStatus = CLASSIFIED |
| CLASS-05 | Manual review required if confidence < 0.85 | classificationStatus = PENDING |
| CLASS-06 | Staff can override any classification | classificationStatus = MANUAL |
| CLASS-07 | Classification generates 1-5 tags per record | Stored in record_tags |
| CLASS-08 | Re-classification allowed (overwrites previous) | Delete old AI tags, create new |

## Retention Schedule Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| RET-01 | Schedule assignment calculates disposition date | dispositionDate = record.createdAt + schedule.retentionPeriodDays |
| RET-02 | Changing schedule recalculates disposition date | Update immediately |
| RET-03 | Alert thresholds checked daily by scheduled job | EventBridge → Lambda |
| RET-04 | Alerts sent to Records Officer for the record's agency | Lookup agency → officer |
| RET-05 | Each threshold fires only once per record | Track in schedule_alerts.sentAt |
| RET-06 | Records past disposition date marked OVERDUE in alerts | alertType = OVERDUE |
| RET-07 | Schedule deletion blocked if records assigned | Check records count > 0 |

## Barcode Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| BAR-01 | Barcode encodes the record's tracking number | Content = trackingNumber |
| BAR-02 | Supported formats: Code 128 (linear), QR Code | Selectable by user |
| BAR-03 | Generated as SVG (screen) and PNG (print) | Both formats available |
| BAR-04 | Print layout includes: barcode + tracking # + series title + location | Label template |
| BAR-05 | Legacy barcode lookup queries records.containerNumber and records.trackingNumber | Fallback chain |
| BAR-06 | Unrecognized barcode returns 404 with helpful message | "No record found for code: {value}" |

## Template Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| TPL-01 | Template names must be unique per agency | Unique constraint |
| TPL-02 | Shared templates (agencyId=null) visible to all | Filter in query |
| TPL-03 | Agency templates visible only to that agency + admins | Agency scoping |
| TPL-04 | Template deletion blocked if records reference it | Check records count > 0 |
| TPL-05 | Field validation patterns enforced on record creation | Regex check per field |

## Search Indexing Rules

| Rule ID | Rule | Validation |
|---------|------|-----------|
| IDX-01 | Records indexed to OpenSearch on create and update | Async after DB write |
| IDX-02 | Index document includes: all fields + tags + metadata | Comprehensive search |
| IDX-03 | OCR text indexed separately (large field) | ocrText field in index |
| IDX-04 | Deleted records removed from index | On status=DISPOSED |
| IDX-05 | Bulk re-index available for admin | Full table scan → bulk API |
