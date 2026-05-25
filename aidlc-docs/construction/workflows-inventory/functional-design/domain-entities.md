# Domain Entities - Unit 3: Workflows & Inventory

## Transmittal Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| transmittalNumber | string | Unique, auto-generated (TR-YYYYMMDD-XXXX) |
| agencyId | UUID | FK → agencies |
| submittedBy | UUID | FK → users |
| status | enum | SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IN_TRANSIT, RECEIVED, SHELVED |
| notes | text | Optional submitter notes |
| reviewedBy | UUID | FK → users, nullable |
| reviewedAt | timestamp | Nullable |
| receivedBy | UUID | FK → users, nullable |
| receivedAt | timestamp | Nullable |
| createdAt | timestamp | Auto |
| updatedAt | timestamp | Auto |

## TransmittalItem Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| transmittalId | UUID | FK → transmittals |
| recordId | UUID | FK → records, nullable (new boxes may not have records yet) |
| seriesTitle | string | Required |
| dateRangeStart | date | Required |
| dateRangeEnd | date | Required |
| boxCount | integer | Default 1 |
| description | text | Optional |
| assignedLocationCode | string(8) | Set on receipt |

## TransmittalApproval Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| transmittalId | UUID | FK → transmittals |
| userId | UUID | FK → users |
| action | enum | APPROVED, REJECTED, CHANGES_REQUESTED |
| comments | text | Required for REJECTED |
| createdAt | timestamp | Auto |

## Disposition Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| dispositionNumber | string | Unique (DSP-YYYYMMDD-XXXX) |
| action | enum | DESTROY, TRANSFER_TO_ARCHIVES, EXTEND |
| justification | text | Required |
| status | enum | PENDING_L1, PENDING_L2, PENDING_L3, APPROVED, REJECTED, EXECUTED |
| initiatedBy | UUID | FK → users |
| currentApprovalLevel | integer | 1, 2, or 3 |
| certificateUrl | string | S3 path to generated certificate PDF |
| createdAt | timestamp | Auto |
| executedAt | timestamp | Nullable |

## DispositionItem Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| dispositionId | UUID | FK → dispositions |
| recordId | UUID | FK → records |

## DispositionApproval Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| dispositionId | UUID | FK → dispositions |
| level | integer | 1 (Records Officer), 2 (Archives Staff), 3 (Admin) |
| userId | UUID | FK → users |
| action | enum | APPROVED, REJECTED |
| comments | text | Required |
| createdAt | timestamp | Auto |

## LegalHold Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| reason | text | Required |
| authority | string | Legal reference/case number |
| appliedBy | UUID | FK → users (admin only) |
| removedBy | UUID | FK → users, nullable |
| removedAt | timestamp | Nullable |
| status | enum | ACTIVE, REMOVED |
| createdAt | timestamp | Auto |

## LegalHoldRecord Entity (junction)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| legalHoldId | UUID | FK → legal_holds |
| recordId | UUID | FK → records |

## Warehouse Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| name | string | Required (e.g., "State Records Center - Augusta") |
| code | string(2) | Unique, 2-char (e.g., "AU", "BG", "PL") |
| address | text | Physical address |
| totalCapacity | integer | Total positions |
| isActive | boolean | Default true |

## Location Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| warehouseId | UUID | FK → warehouses |
| code | string(8) | Unique, 8-digit (WWRRBBSP: warehouse+row+bay+shelf+position) |
| row | string(2) | Row identifier |
| bay | string(2) | Bay identifier |
| shelf | string(2) | Shelf identifier |
| position | string(2) | Position identifier |
| isOccupied | boolean | Default false |
| occupiedBy | UUID | FK → records, nullable |
| updatedAt | timestamp | Auto |

## CirculationEvent Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| recordId | UUID | FK → records |
| eventType | enum | CHECKOUT, CHECKIN |
| userId | UUID | FK → users (borrower) |
| purpose | text | Required for CHECKOUT |
| expectedReturnDate | date | Required for CHECKOUT |
| actualReturnDate | date | Set on CHECKIN |
| isOverdue | boolean | Computed |
| createdAt | timestamp | Auto |

## ReferenceRequest Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| requestNumber | string | Unique (REF-YYYYMMDD-XXXX) |
| recordId | UUID | FK → records |
| requestedBy | UUID | FK → users |
| agencyId | UUID | FK → agencies |
| deliveryMethod | enum | DIGITAL_SCAN, PHYSICAL_RETRIEVAL |
| purpose | text | Required |
| status | enum | SUBMITTED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED |
| assignedTo | UUID | FK → users (archives staff), nullable |
| estimatedCompletion | date | Set on assignment |
| completedAt | timestamp | Nullable |
| notes | text | Staff notes |
| createdAt | timestamp | Auto |

## Database Indexes (Unit 3)
```sql
-- Transmittals
CREATE INDEX idx_transmittals_agency ON transmittals(agency_id);
CREATE INDEX idx_transmittals_status ON transmittals(status);
CREATE INDEX idx_transmittals_submitted_by ON transmittals(submitted_by);

-- Dispositions
CREATE INDEX idx_dispositions_status ON dispositions(status);
CREATE INDEX idx_dispositions_level ON dispositions(current_approval_level);

-- Legal Holds
CREATE INDEX idx_legal_holds_status ON legal_holds(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_legal_hold_records ON legal_hold_records(record_id);

-- Locations
CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX idx_locations_occupied ON locations(is_occupied);
CREATE INDEX idx_locations_code ON locations(code);

-- Circulation
CREATE INDEX idx_circulation_record ON circulation_events(record_id, created_at DESC);
CREATE INDEX idx_circulation_user ON circulation_events(user_id);
CREATE INDEX idx_circulation_overdue ON circulation_events(expected_return_date) 
  WHERE event_type = 'CHECKOUT' AND actual_return_date IS NULL;

-- Reference Requests
CREATE INDEX idx_ref_requests_agency ON reference_requests(agency_id);
CREATE INDEX idx_ref_requests_status ON reference_requests(status);
CREATE INDEX idx_ref_requests_assigned ON reference_requests(assigned_to) WHERE status IN ('ASSIGNED', 'IN_PROGRESS');
```
