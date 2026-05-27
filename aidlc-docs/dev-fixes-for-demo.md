# Dev Tasks Before Client Demo — Maine RMS PoC

**Context:** Pre-sale demo for State of Maine (RFP# 202603058). Backend has full coverage of most flows, but several user-facing journeys are incomplete or visibly broken. Total estimated effort: **~6-8 hours**.

**Branching:** create one branch `fix/pre-demo-cleanup`, one PR, sequential commits per task.

**Verification rule:** every task must end with both `npm test` (in `packages/backend`) and `npm test` (in `packages/frontend`) passing.

**How to read this doc:** each task is a **problem statement** — what's wrong, where it is, what "done" looks like. The developer designs the solution; please do not copy-paste any prescriptive snippets I might have left in. If anything is ambiguous, ask before coding.

---

## P0 — MUST FIX before demo

### Task 1. SearchPage filters are silently dropped

**Symptom on demo:** the user picks an Agency or Status filter on the Search page → nothing changes in results. UI looks like it filters; it doesn't.

**Where to look:**
- Frontend: `packages/frontend/src/features/search/SearchPage.tsx:25-30` — sends `agency` (string code) and `status` in the request body.
- Backend: `packages/backend/src/api/search.ts:10-19` — Zod schema accepts neither key. Zod strips unknown keys silently, so the filters never reach the service.
- Service: `packages/backend/src/services/SearchService.ts` — currently only filters by `agency_id` (UUID).

**What "done" looks like:**
- Selecting Agency on the UI narrows the result set.
- Selecting Status on the UI narrows the result set.
- Combination of both filters works.
- Existing search tests still pass; add at least one test that exercises the new filter path.

The developer decides: extend the schema and translate `agency` code → `agency_id` in the service, or normalize on the frontend, or rename the keys end-to-end. Pick what is simplest and keeps existing callers working.

---

### Task 2. CIR-04 — circulation checkout accepts past `due_date`

**Symptom on demo:** if a presenter accidentally enters a past date in the checkout form, the API accepts it. Should be rejected with a 400.

**Where to look:**
- `packages/backend/src/api/inventory.ts:30` — Zod schema currently only validates ISO format, not "future".
- The audit doc lists this as Issue 3: `aidlc-docs/audit-2026-05-27.md`.

**What "done" looks like:**
- POST `/api/inventory/checkout` with a past date returns 400 with a clear error message.
- POST with a future date works as before.
- Inventory tests pass (update any test fixtures that hardcode past dates).

---

### Task 3. DSP-04 — separation of duties is disabled in code

**Symptom on demo:** in `packages/backend/src/services/WorkflowService.ts:139-142`, the check that "approver cannot be the initiator" is fully commented out. The doc `aidlc-docs/audit-2026-05-27.md` Issue 1 documents the exact lines.

For demo purposes the relaxed mode is convenient (one user can run the whole approval flow). For production we still need to enforce it.

**What "done" looks like:**
- The rule is enabled, but gated behind a config flag / env var so demo flow can keep using a single user.
- Default behavior (no flag set) = demo flow continues to work unchanged.
- With the flag on, attempting self-approval at any of the three levels returns 403.
- Add ONE test that exercises both states.

The developer chooses the flag mechanism (env var, config file, etc.) — keep it consistent with how other config is read in this codebase.

---

### Task 4. Cognito demo users (cloud demo only — skip if local)

**Symptom:** `packages/infrastructure/lib/stacks/AuthStack.ts` (lines 1-65) creates the User Pool and 4 groups, but **does not** create any users. The doc `implementation-vs-proposal.md:264` previously claimed "demo users" exist in CDK — that claim is wrong.

For a cloud demo we need at least 2 pre-created users:
- 1 user in `SystemAdmin` group
- 1 user in `ArchivesStaff` group (so we can demo the disposition flow if Task 3's flag gets turned on)

**What "done" looks like:**
- Either: CDK creates the users + group attachments, and a documented post-deploy step sets a permanent password.
- Or: a documented manual procedure (AWS console / CLI) the operator follows once after deploy.
- Either way, the `aidlc-docs/audit-2026-05-27.md` Drift #5 entry is updated to reflect the current truth.

> **Important — coordinate with kat3ryna:** she handles all deploys herself; do **not** run `cdk deploy` automatically.

---

### Task 5. Templates are not used in `CreateRecordPage`

**Symptom on demo:** the proposal (page 9) promises "Template-driven record creation". Backend supports it fully (`api/records.ts:58` accepts `template_id`, `RecordsService.ts:24-29` validates it, `templates.ts` is full CRUD, `TemplatesPage.tsx` lets admins author templates). But `CreateRecordPage.tsx` only offers two modes — Upload and Manual — neither of which references templates. The POST body at `CreateRecordPage.tsx:103-110` does not include `template_id`. Admin-created templates are dead-end metadata.

**Where to look:**
- `packages/frontend/src/features/records/CreateRecordPage.tsx` — all the UI logic.
- `packages/frontend/src/features/admin/TemplatesPage.tsx` — what an admin actually creates (`field_definitions` is the JSON of fields).
- `packages/backend/src/api/templates.ts` — GET `/templates` returns active templates.
- Audit doc Issue 2: `aidlc-docs/audit-2026-05-27.md`.

**What "done" looks like:**
- A user creating a record can choose a template (in addition to or instead of the existing manual/upload modes).
- After picking a template, the form renders dynamically from that template's `field_definitions`.
- Submit sends `template_id` and the field values to POST `/records` (the field values can go into the existing `metadata` object — schema already accepts it).
- Required fields from `field_definitions` are validated before submit.
- Existing Upload and Manual flows are not broken.
- 2-3 demo templates exist before the demo (e.g. Correspondence, Financial Audit, Legal Document) — the developer pre-seeds via the admin UI or via a seed migration.
- One frontend test covers the new flow.

The developer decides UX details (third tile in mode chooser? Tab? Dropdown inside the manual form?) — pick what is least disruptive to existing tests and what fits the design system in `.interface-design/system.md`.

---

### Task 6. Transmittal flow is not understandable end-to-end

**Symptom on demo:** when walking through the transmittal feature, it's not clear **who** is sending **what** **to whom** and **when** it arrives. The pages exist (`packages/frontend/src/features/transmittals/` — `SubmitTransmittalPage`, `TransmittalsListPage`, `TransmittalDetailPage`) but the journey breaks down for an evaluator who has never seen the system.

**Specific issues to resolve (developer should investigate and confirm each):**
- The submit page does not clearly show: source agency, destination (Maine State Archives or another agency?), the records being transmitted, contact person, expected handover date.
- The list view does not communicate state ownership — i.e. "this transmittal is waiting on YOU to act" vs. "waiting on the other side".
- The detail page lifecycle (submitted → received → accepted / rejected) is not visible as a timeline / status bar that a presenter can point at.
- It is not clear what action the receiving side takes, where, and what changes for the records once accepted.
- Email/in-app notifications fired by `notificationService.send('transmittal_received', …)` (`WorkflowService.ts:93-95`) — verify they actually surface somewhere visible in the UI for demo purposes.

**What "done" looks like:**
- A presenter who has never used the app can walk an evaluator through the full transmittal flow from submission to acceptance using only what is visible on screen — no verbal hand-waving needed.
- Each transmittal page clearly communicates: WHO (sender + recipient), WHAT (records + count), WHERE (source location → destination), WHEN (submitted date, expected/actual handover), STATUS (with a visible state indicator).
- The transition from "submitted" to "received" to "accepted" is observable in the UI without refreshing or guessing.
- Existing tests pass; add tests for any new UI states introduced.

The developer should first **map the current flow on paper** (or in a comment on the PR) before changing code, and call out which of the issues above turn out to be real vs. cosmetic.

---

### Task 7. Circulation flow does not communicate what happens

**Symptom on demo:** the Circulation page (`packages/frontend/src/features/inventory/CirculationPage.tsx` and `BarcodeScanPage.tsx`) shows checkout/checkin actions, but it is unclear during a walkthrough:
- What state is the record in right now? (active / checked out / overdue?)
- Who has it? When is it due back?
- What is the connection between scanning a barcode and the resulting action? (does scanning auto-checkout? Or does it just look up?)
- How does an evaluator see the history of circulation events for a single record?
- What is the difference between Circulation and Inventory in this app? (same evaluator question keeps coming up.)

**What "done" looks like:**
- Walking through Circulation as a demo, an evaluator can answer all the questions above by **looking at the screen**, without the presenter explaining.
- A record in the system shows its current circulation state on its detail page (who has it, due date, history).
- The barcode scan page makes it explicit which action the scan triggers, and what happens next.
- The relationship between Inventory (storage/utilization) and Circulation (movement) is reflected in the IA — e.g. a clear difference in nav labels, page headers, or sub-navigation.
- Backend tests pass; add tests for any new UI behavior.

Same approach as Task 6: **map the flow first**, then decide what to change.

---

## P1 — STRONGLY RECOMMENDED

### Task 8. Pre-demo system warmup

**Why:** Migrations run async after Express starts (`server.ts:57-93`). On a cold DB, first ~5s of requests will 500.

**What "done" looks like:**
- A documented pre-demo warmup procedure (1-2 minutes before demo): hit the home page and a `/records` page to trigger pool + migration completion + browser bundle cache.
- First demo click during the live presentation does not show a 500 or a loading spinner > 1s.

---

## P2 — NICE TO HAVE (skip if time-pressed)

### Task 9. Inventory Management CRUD (only if time allows)

**Symptom:** the Inventory area has a list/utilization view (`InventoryPage.tsx`, `UtilizationPage.tsx`) but **no CRUD** for locations themselves. An admin cannot add a new building / floor / room / shelf / box from the UI. Backend has the schema and `inventoryService.getLocationTree`, and `api/inventory.ts:18-25` defines a `createLocationSchema`, but the frontend does not expose Create / Update / Delete UI for locations.

This is borderline — the audit list does not mark it as a P0 gap, and an evaluator may or may not ask. Skip if any P0/P1 task above is at risk.

**What "done" looks like (only if implemented):**
- Admin can create, edit, deactivate locations (building / floor / room / shelf / box) from the UI.
- The hierarchy (parent_id) is respected — child locations cannot exist without a parent.
- Capacity is editable.
- Backend already exposes the endpoints — verify and reuse; do not introduce a parallel API.
- Tests added for the new UI.

---

### Task 10. Architecture substitutions slide content

**Why:** Evaluators will ask "why no Textract / OpenSearch / QuickSight?". One-page slide content is already in `aidlc-docs/audit-2026-05-27.md` under **Architecture Substitutions**. This is presentation work, not dev work — flagged here so it isn't forgotten.

**Owner:** whoever builds the deck.

---

### Task 11. End-to-end test of OCR pipeline with real PDF

**Why:** No proof yet that the full S3 → SQS → Bedrock OCR → DB path works in the deployed environment.

**What "done" looks like:**
- Login as admin in deployed UI, create a record, upload a real multi-page PDF.
- After ~30-60s, the record's `description` contains extracted text.
- `classification_status` advances from `PENDING` → `CLASSIFIED`.
- Audit log shows `OCR_PROCESSED` and `AI_CLASSIFICATION` events.

If anything fails, **escalate immediately** — this is the showcase feature.

---

## Summary table

| # | Task | Priority | Effort | Area |
|---|------|----------|--------|------|
| 1 | SearchPage filters | P0 | 30-45 min | search |
| 2 | CIR-04 future date | P0 | 5 min | inventory |
| 3 | DSP-04 env-gated | P0 | 15 min | dispositions |
| 4 | Cognito demo users | P0 (cloud only) | 20 min | infra |
| 5 | Templates in CreateRecordPage | P0 | 2-3 hrs | records UI |
| 6 | **Transmittal flow clarity** | **P0** | **2-3 hrs** | transmittals UI |
| 7 | **Circulation flow clarity** | **P0** | **2-3 hrs** | circulation UI |
| 8 | Pre-demo warmup | P1 | 5 min | ops |
| 9 | Inventory CRUD (if time) | P2 | 2-3 hrs | inventory UI |
| 10 | Substitutions slide | P2 | presentation | deck |
| 11 | OCR end-to-end test | P2 | 15 min | deployed env |

**Total dev work: ~8-12 hours of code + tests. ~1 hour of preparation. Tasks 6, 7, 9 are the biggest unknowns — encourage the developer to scope them first and report back if any will not fit before demo.**

---

## Final checklist before "demo ready"

- [ ] Task 1 merged, search filters working
- [ ] Task 2 merged, future-date validation working
- [ ] Task 3 merged, DSP-04 flag-gated, default off
- [ ] Task 4 done IF demo runs in cloud (skip for local)
- [ ] Task 5 merged: template-driven creation works end-to-end + 2-3 templates pre-seeded
- [ ] Task 6 merged: transmittal flow tells the full who/what/where/when/status story on screen
- [ ] Task 7 merged: circulation flow is self-explanatory; barcode scan behavior is explicit
- [ ] Task 8 warmup procedure documented and rehearsed
- [ ] All backend tests pass (currently 87)
- [ ] All frontend tests pass (currently 45)
- [ ] Login flow works in target environment
- [ ] Search demo works in target environment
- [ ] Disposition 3-level approval demo works in target environment
- [ ] Upload + OCR demo works in target environment
- [ ] Transmittal demo works end-to-end in target environment
- [ ] Circulation demo works end-to-end in target environment

If all above are checked → demo is ready.