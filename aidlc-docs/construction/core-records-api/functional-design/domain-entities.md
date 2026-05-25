# Domain Entities - Unit 2: Core Records API

## Record Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| trackingNumber | string | Unique, auto-generated (RMS-YYYYMMDD-XXXX) |
| templateId | UUID | FK → record_templates |
| agencyId | UUID | FK → agencies, required |
| containerNumber | string | Required |
| locationCode | string(8) | 8-digit warehouse location code |
| umbrella | string | Organizational umbrella |
| unit | string | Organizational unit |
| subunit | string | Organizational subunit |
| seriesTitle | string | Required, record series name |
| fileName | string | Required |
| dispositionDate | date | Nullable, calculated from retention schedule |
| boxNumber | string | Physical box identifier |
| transmittalNumber | string | TR # reference |
| vacantLocation | boolean | Default false |
| recordType | enum | PHYSICAL, DIGITAL |
| status | enum | ACTIVE, CHECKED_OUT, IN_TRANSIT, DISPOSED, ON_HOLD |
| classificationStatus | enum | PENDING, CLASSIFIED, MANUAL |
| classificationConfidence | decimal | 0.0-1.0, nullable |
| retentionScheduleId | UUID | FK → retention_schedules, nullable |
| digitalFileUrl | string | S3 path for digital records |
| ocrText | text | Extracted text from Textract |
| createdBy | UUID | FK → users |
| createdAt | timestamp | Auto |
| updatedAt | timestamp | Auto |

## RecordMetadata Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| recordId | UUID | FK → records |
| key | string | Metadata field name |
| value | string | Metadata field value |
| createdAt | timestamp | Auto |

## RecordTag Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| recordId | UUID | FK → records |
| name | string | Tag name |
| source | enum | AI, MANUAL, RULE |
| confidence | decimal | 0.0-1.0 (for AI tags) |
| createdAt | timestamp | Auto |

## RecordTemplate Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| name | string | Required, unique |
| agencyId | UUID | FK → agencies, nullable (null = shared template) |
| fields | jsonb | Field definitions with defaults and validation |
| isActive | boolean | Default true |
| createdBy | UUID | FK → users |
| createdAt | timestamp | Auto |

### Template Fields Schema
```json
{
  "fields": [
    {
      "name": "containerNumber",
      "label": "Container Number",
      "type": "text",
      "required": true,
      "defaultValue": null
    },
    {
      "name": "locationCode",
      "label": "8-Digit Location",
      "type": "text",
      "required": true,
      "pattern": "^\\d{8}$",
      "defaultValue": null
    },
    {
      "name": "umbrella",
      "label": "Umbrella",
      "type": "select",
      "required": true,
      "options": ["Executive", "Legislative", "Judicial"],
      "defaultValue": "Executive"
    }
  ]
}
```

## RetentionSchedule Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| name | string | Required (e.g., "General Administrative Records") |
| seriesCode | string | State schedule reference code |
| retentionPeriodDays | integer | Days to retain |
| dispositionAction | enum | DESTROY, TRANSFER_TO_ARCHIVES, PERMANENT |
| legalAuthority | string | Legal citation |
| description | text | Schedule description |
| alertThresholds | jsonb | Array of day thresholds [90, 30, 7] |
| isActive | boolean | Default true |
| createdBy | UUID | FK → users |
| createdAt | timestamp | Auto |

## ScheduleAlert Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| recordId | UUID | FK → records |
| scheduleId | UUID | FK → retention_schedules |
| alertType | enum | THRESHOLD_90, THRESHOLD_30, THRESHOLD_7, OVERDUE |
| alertDate | date | When alert was/will be triggered |
| sentAt | timestamp | Nullable (null = pending) |
| recipientId | UUID | FK → users (records officer for agency) |

## AuditEvent Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| userId | UUID | FK → users |
| action | string | Action performed (e.g., "record.create", "record.view") |
| resourceType | string | Entity type (e.g., "record", "transmittal") |
| resourceId | UUID | Entity ID |
| details | jsonb | Additional context (before/after values, etc.) |
| ipAddress | inet | Client IP |
| userAgent | string | Browser/client identifier |
| timestamp | timestamp | Event time (indexed) |

**Note**: audit_events is append-only. No UPDATE or DELETE operations allowed.

## Database Indexes
```sql
-- Records
CREATE INDEX idx_records_agency ON records(agency_id);
CREATE INDEX idx_records_status ON records(status);
CREATE INDEX idx_records_location ON records(location_code);
CREATE INDEX idx_records_series ON records(series_title);
CREATE INDEX idx_records_disposition_date ON records(disposition_date);
CREATE INDEX idx_records_tracking ON records(tracking_number);
CREATE INDEX idx_records_container ON records(container_number);
CREATE INDEX idx_records_created ON records(created_at DESC);

-- Tags
CREATE INDEX idx_tags_record ON record_tags(record_id);
CREATE INDEX idx_tags_name ON record_tags(name);

-- Retention
CREATE INDEX idx_schedule_alerts_date ON schedule_alerts(alert_date) WHERE sent_at IS NULL;
CREATE INDEX idx_schedule_alerts_record ON schedule_alerts(record_id);

-- Audit
CREATE INDEX idx_audit_user ON audit_events(user_id, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_events(resource_type, resource_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_events(action, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON audit_events(timestamp DESC);
```
