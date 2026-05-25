# Business Rules - Unit 3: Workflows & Inventory

## Transmittal Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| TRN-01 | Only Records Officers and above can submit transmittals | Permission: transmittals.create |
| TRN-02 | Transmittal must have at least 1 item | Validation on create |
| TRN-03 | Each item requires series title and date range | Zod schema validation |
| TRN-04 | Status transitions must follow state machine | Service-level enforcement |
| TRN-05 | Rejection requires comments | Validate comments.length > 0 |
| TRN-06 | Only Archives Staff/Admin can approve/reject/receive | Permission check |
| TRN-07 | Receipt requires valid location codes for all items | Validate each against locations table |
| TRN-08 | Auto-transition to SHELVED when all items have locations | Check after each receive |
| TRN-09 | Transmittal number immutable after creation | Block updates to transmittalNumber |

## Disposition Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| DSP-01 | Legal hold blocks disposition initiation | Query legal_holds before creating |
| DSP-02 | All records in disposition must be from same agency | Validate agencyId consistency |
| DSP-03 | Three-level approval required (L1: Officer, L2: Staff, L3: Admin) | State machine enforcement |
| DSP-04 | Approver cannot be the initiator | Check userId != initiatedBy |
| DSP-05 | Each level can only approve once per disposition | Unique constraint on (dispositionId, level) |
| DSP-06 | Rejection at any level stops the workflow | Set status=REJECTED |
| DSP-07 | Approved dispositions generate certificate PDF | Trigger on final approval |
| DSP-08 | Executed dispositions update all record statuses | Batch update records.status=DISPOSED |
| DSP-09 | EXTEND action recalculates disposition dates | Add extension period to existing dates |
| DSP-10 | Cannot dispose records that are CHECKED_OUT | Block if any record status=CHECKED_OUT |

## Legal Hold Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| LH-01 | Only System Admin can apply legal holds | Permission: dispositions.legal_hold |
| LH-02 | Only System Admin can remove legal holds | Permission: dispositions.legal_hold |
| LH-03 | Held records cannot be disposed, deleted, or transferred | Check in disposition + update flows |
| LH-04 | Applying hold immediately blocks any pending dispositions | Check + reject on apply |
| LH-05 | Removing hold only reverts status if no OTHER holds exist | Count remaining holds |
| LH-06 | Hold reason and authority are required | Validation |
| LH-07 | Hold removal requires justification | Comments required on delete |

## Inventory Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| INV-01 | Location code must be valid 8-digit format | Regex + exists in locations table |
| INV-02 | Cannot assign record to occupied location | Check isOccupied=false |
| INV-03 | Relocating a record frees the old location | Update both old and new |
| INV-04 | Warehouse capacity = count of all positions | Pre-computed per warehouse |
| INV-05 | Three warehouses configured for Maine | Seeded: Augusta, Bangor, Portland |
| INV-06 | Location hierarchy immutable (warehouse structure fixed) | No API for location creation (seeded) |

## Circulation Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| CIR-01 | Only ACTIVE records can be checked out | Verify record.status=ACTIVE |
| CIR-02 | Record can only have one open checkout at a time | Check no open event exists |
| CIR-03 | Purpose is required for checkout | Validation |
| CIR-04 | Expected return date must be future | date > today |
| CIR-05 | Checkin resolves the open checkout event | Find and close |
| CIR-06 | Overdue calculated: today > expectedReturnDate AND not returned | Computed field |
| CIR-07 | Overdue notices sent at: +1 day (borrower), +7 days (supervisor) | Scheduled job |
| CIR-08 | Custody history is append-only (never modified) | No UPDATE on circulation_events |

## Reference Request Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| REF-01 | Requester must have access to the record's agency | Agency scoping check |
| REF-02 | Delivery method must be DIGITAL_SCAN or PHYSICAL_RETRIEVAL | Enum validation |
| REF-03 | Only Archives Staff can assign/fulfill requests | Permission check |
| REF-04 | Estimated completion defaults to 3 business days | Auto-set on creation |
| REF-05 | Fulfillment notifies the requester | Enqueue notification |
| REF-06 | Cancelled requests require reason | Comments required |
