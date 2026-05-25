# Test Instructions - Maine Records Management System

## Test Strategy
Given the demo timeline, testing focuses on:
1. TypeScript compilation (type safety)
2. CDK synthesis with CDK Nag (security compliance)
3. Manual demo walkthrough (functional verification)
4. Integration smoke tests (API endpoints)

## 1. TypeScript Compilation

### All Packages
```bash
cd /Users/miketran/WebstormProjects/MaineRecordsManagementSystem
npm run build
```

Expected: All packages compile without errors.

### Per Package
```bash
cd packages/shared && npx tsc --noEmit
cd packages/backend && npx tsc --noEmit
cd packages/infrastructure && npx tsc --noEmit
cd packages/frontend && npx tsc --noEmit
```

## 2. CDK Nag Security Audit

```bash
cd packages/infrastructure
npx cdk synth --context stage=dev 2>&1 | grep -E "(Error|Warning|AwsSolutions|HIPAA)"
```

Expected: All CDK Nag rules pass (AwsSolutions + HIPAA checks configured in bin/app.ts).

## 3. CDK Diff (Pre-Deploy Verification)
```bash
cd packages/infrastructure
npx cdk diff --context stage=dev
```

## 4. API Smoke Tests

After deployment, verify each endpoint responds:

```bash
BASE_URL="https://<alb-dns>/api"
TOKEN="<valid-cognito-token>"

# Health check (no auth required)
curl -s $BASE_URL/health | jq .

# Records list
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/records | jq .

# Search
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/search?q=education&mode=metadata" | jq .

# Transmittals
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/transmittals | jq .

# Analytics dashboard
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/analytics/dashboard | jq .

# Users (admin only)
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/users | jq .
```

## 5. Demo Walkthrough Checklist

### Login & Auth
- [ ] Login as System Admin (sarah.chen@maine.gov)
- [ ] Login as Archives Staff (michael.torres@maine.gov)
- [ ] Login as Records Officer (diana.patel@maine.gov)
- [ ] Login as Agency Staff (james.wright@maine.gov)
- [ ] MFA prompt appears on login
- [ ] SSO link visible on login page
- [ ] Role-based sidebar navigation differs per user

### Records Management
- [ ] View records list with filters (status, agency, type)
- [ ] Create new record from template
- [ ] View record detail with metadata, barcode, location
- [ ] Batch import via CSV upload
- [ ] AI classification triggers on new record
- [ ] Barcode generation (Code 128 + QR)
- [ ] Barcode scanner lookup (USB HID input simulation)

### Transmittals
- [ ] Agency user submits new transmittal with box items
- [ ] Archives staff sees pending approval queue
- [ ] Approve transmittal → status changes to approved
- [ ] Reject transmittal → requires reason
- [ ] Receive transmittal → assigns locations

### Dispositions
- [ ] Initiate disposition (multi-record selection)
- [ ] Two-level approval chain visible
- [ ] Legal hold blocks disposition (indicator visible)
- [ ] Complete disposition → records marked destroyed/transferred
- [ ] Legal holds page (admin): create/release holds

### Inventory
- [ ] Location tree browser (expandable hierarchy)
- [ ] Barcode scan page (checkout/checkin workflow)
- [ ] Utilization charts (bar chart + donut)
- [ ] Overdue items display

### Search
- [ ] Metadata search (field-based)
- [ ] Full-text search (keyword)
- [ ] Semantic search tab (AI-powered)
- [ ] OCR search tab (document content)
- [ ] Faceted filters sidebar

### Analytics & Reporting
- [ ] Dashboard widgets (active records, pending dispositions, transfers, overdue)
- [ ] Charts render (bar, line, donut)
- [ ] Report generation and export (PDF/Excel/CSV)

### Administration
- [ ] User management (create, edit roles, deactivate)
- [ ] Retention schedules CRUD
- [ ] Audit log (searchable, filterable)
- [ ] Integration status cards (ArchivesSpace, CRM, M365, AD)

### Agency Portal
- [ ] Agency-specific dashboard
- [ ] Submit accession request
- [ ] Submit reference request + track status

### Non-Functional
- [ ] WCAG 2.1 AA basics (headings, focus indicators, contrast)
- [ ] Responsive layout (desktop + tablet)
- [ ] All data-testid attributes present for automation
- [ ] Notification bell shows unread count

## 6. Security Verification

- [ ] Unauthenticated requests return 401
- [ ] Agency-scoped users cannot see other agency data
- [ ] Admin-only routes return 403 for non-admins
- [ ] WAF blocks SQL injection attempts
- [ ] Rate limiting enforced (2000 req/5min)
- [ ] All S3 buckets have BlockPublicAccess
- [ ] RDS encrypted at rest and in transit
- [ ] CloudTrail logging active
