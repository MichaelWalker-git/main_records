# Business Logic Model - Unit 3: Workflows & Inventory

## Transmittal Workflow State Machine

```
SUBMITTED → UNDER_REVIEW → APPROVED → IN_TRANSIT → RECEIVED → SHELVED
                 │
                 └→ REJECTED (terminal)

Transitions:
  SUBMITTED → UNDER_REVIEW: Auto (when staff opens for review)
  UNDER_REVIEW → APPROVED: Staff approves
  UNDER_REVIEW → REJECTED: Staff rejects (reason required)
  APPROVED → IN_TRANSIT: Physical boxes leave agency
  IN_TRANSIT → RECEIVED: Barcode scanned at warehouse
  RECEIVED → SHELVED: All items assigned locations
```

## Transmittal Submit Flow

```
POST /api/transmittals
  │
  ├─ 1. Auth + permission check (records.officer or higher)
  ├─ 2. Validate: at least 1 item, each item has seriesTitle + dateRange
  ├─ 3. Generate transmittalNumber: TR-{YYYYMMDD}-{seq}
  ├─ 4. Set status = SUBMITTED, submittedBy = req.user.id
  ├─ 5. Insert transmittal + items (transaction)
  ├─ 6. Enqueue notification: "New transmittal from {agency}" → Archives Staff
  ├─ 7. Log audit: transmittal.submit
  └─ 8. Return 201 { transmittal with items }
```

## Transmittal Receipt Flow

```
POST /api/transmittals/:id/receive
  Body: { scannedBarcode, itemLocations: [{ itemId, locationCode }] }
  │
  ├─ 1. Auth (archives_staff or admin)
  ├─ 2. Verify transmittal status = IN_TRANSIT or APPROVED
  ├─ 3. For each item in itemLocations:
  │     ├─ Validate locationCode is valid 8-digit code
  │     ├─ Verify location is vacant (locations.isOccupied = false)
  │     ├─ Update transmittal_item.assignedLocationCode
  │     ├─ Create record if not exists (from item metadata)
  │     ├─ Update record.locationCode
  │     ├─ Update location: isOccupied=true, occupiedBy=recordId
  │     └─ Update record.status = ACTIVE
  ├─ 4. Set transmittal: status=RECEIVED, receivedBy, receivedAt
  ├─ 5. If all items have locations: auto-transition to SHELVED
  ├─ 6. Notify Records Officer: "Transmittal {TR#} received"
  └─ 7. Log audit: transmittal.receive
```

## Disposition Workflow (Multi-Level Approval)

```
PENDING_L1 → PENDING_L2 → PENDING_L3 → APPROVED → EXECUTED
     │             │             │
     └→ REJECTED   └→ REJECTED   └→ REJECTED

Approval Levels:
  L1: Records Officer (agency that owns the records)
  L2: Archives Staff
  L3: System Admin

On APPROVED (all 3 levels):
  - If action=DESTROY: update records status=DISPOSED, generate certificate
  - If action=TRANSFER_TO_ARCHIVES: update records, create new location entries
  - If action=EXTEND: recalculate disposition dates
```

## Disposition Initiation Flow

```
POST /api/dispositions
  Body: { recordIds[], action, justification }
  │
  ├─ 1. Auth (archives_staff or admin)
  ├─ 2. Validate all recordIds exist
  ├─ 3. CHECK LEGAL HOLDS:
  │     ├─ Query legal_hold_records WHERE recordId IN (:recordIds) 
  │     │   AND legal_holds.status = 'ACTIVE'
  │     ├─ If any found: REJECT with list of held records
  │     └─ Return 409 { message: "Legal hold blocks disposition", holdIds: [...] }
  ├─ 4. Generate dispositionNumber: DSP-{YYYYMMDD}-{seq}
  ├─ 5. Insert disposition + items (transaction)
  ├─ 6. Set status = PENDING_L1, currentApprovalLevel = 1
  ├─ 7. Find L1 approver (Records Officer for records' agency)
  ├─ 8. Notify L1 approver
  └─ 9. Log audit: disposition.initiate
```

## Legal Hold Logic

```
Apply Hold:
  POST /api/legal-holds
  Body: { recordIds[] OR searchQuery, reason, authority }
  │
  ├─ 1. Auth (admin only - AUTHZ-05)
  ├─ 2. If searchQuery: resolve to recordIds via search
  ├─ 3. Insert legal_hold + legal_hold_records (junction)
  ├─ 4. Update all affected records: status = ON_HOLD
  ├─ 5. Check if any pending dispositions include held records:
  │     └─ If yes: block those dispositions (status=REJECTED, reason="Legal hold applied")
  ├─ 6. Log audit: legal_hold.apply
  └─ 7. Notify: "Legal hold applied to {n} records"

Remove Hold:
  DELETE /api/legal-holds/:id
  │
  ├─ 1. Auth (admin only)
  ├─ 2. Set hold: status=REMOVED, removedBy, removedAt
  ├─ 3. For each record in hold:
  │     ├─ Check if record has OTHER active holds
  │     └─ If no other holds: revert record status to ACTIVE
  ├─ 4. Log audit: legal_hold.remove
  └─ 5. Notify relevant Records Officers
```

## Warehouse Location Logic

```
Location Code Format: WWRRBBSP (8 digits)
  WW = Warehouse (01=Augusta, 02=Bangor, 03=Portland)
  RR = Row (01-99)
  BB = Bay (01-99)
  SP = Shelf+Position (01-99, first digit=shelf, second=position)

Example: 01032405 = Augusta, Row 03, Bay 24, Shelf 0, Position 5

Utilization Calculation:
  utilization% = (occupied locations / total locations) × 100
  Per warehouse, per row, per bay
```

## Circulation (Check-In/Out) Flow

```
Checkout:
  POST /api/circulation/checkout
  Body: { recordId, purpose, expectedReturnDate }
  │
  ├─ 1. Verify record.status = ACTIVE (not already checked out or on hold)
  ├─ 2. Create circulation_event: type=CHECKOUT
  ├─ 3. Update record.status = CHECKED_OUT
  ├─ 4. Log audit: record.checkout
  └─ 5. Return event with expected return date

Checkin:
  POST /api/circulation/checkin
  Body: { recordId }
  │
  ├─ 1. Find open checkout event (type=CHECKOUT, actualReturnDate IS NULL)
  ├─ 2. Set actualReturnDate = now
  ├─ 3. Calculate isOverdue = actualReturnDate > expectedReturnDate
  ├─ 4. Update record.status = ACTIVE
  ├─ 5. Log audit: record.checkin
  └─ 6. Return event
```

## Overdue Detection (Scheduled)

```
EventBridge (daily 8am) → Lambda: overdue-checker
  │
  ├─ 1. Query circulation_events WHERE:
  │     type = CHECKOUT
  │     AND actual_return_date IS NULL
  │     AND expected_return_date < TODAY
  ├─ 2. For each overdue item:
  │     ├─ If first notice (expected_return + 1 day): send borrower notice
  │     ├─ If escalation (expected_return + 7 days): send supervisor notice
  │     └─ Update isOverdue = true
  └─ 3. Log: "{n} overdue items processed"
```

## Reference Request Flow

```
Submit:
  POST /api/reference-requests
  │
  ├─ Validate: recordId exists, user has access to record's agency
  ├─ Generate requestNumber: REF-{YYYYMMDD}-{seq}
  ├─ Status = SUBMITTED
  ├─ Notify Archives Staff: "New reference request"
  └─ Return request with estimated time (3 business days default)

Assign:
  PUT /api/reference-requests/:id/assign (staff picks up)
  │
  ├─ Status = ASSIGNED → IN_PROGRESS
  └─ Set estimatedCompletion

Fulfill:
  POST /api/reference-requests/:id/fulfill
  │
  ├─ Status = COMPLETED
  ├─ Set completedAt
  ├─ Notify requester: "Your request is ready"
  └─ If deliveryMethod=DIGITAL_SCAN: attach S3 URL to response
```
