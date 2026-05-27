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

## UX / Demo Polish (P0–P1 mix)

The functional gaps above (Tasks 1–11) make the system **work**. The tasks below make it **feel professional** to an evaluator who has 60 seconds to form an opinion. The kat3ryna user flagged the UX as "not very convenient" — these are the specific spots she likely felt.

Same problem-statement format. Developer designs the solution; please do not invent fixes outside the listed concern.

### Task 12. Sidebar does not match the archivist mental model — P0

**Symptom:** `packages/frontend/src/layouts/Sidebar.tsx:26-40` lists 13 items in three groups (`main / operations / admin`). An archivist does not think in those groups — they think in a **lifecycle**: records arrive → get classified → are stored → get circulated → eventually disposed. Right now Records, Transmittals, Inventory, Circulation, Dispositions all sit at the same flat level, hiding the lifecycle story that is the basis of the demo narrative.

**Where to look:**
- `packages/frontend/src/layouts/Sidebar.tsx` — `navItems` array and grouping logic.
- `aidlc-docs/demo-narrative.md` "Demo Section → Pain Mapping" table — the order there is the lifecycle order we want the sidebar to mirror.

**What "done" looks like:**
- Sidebar groups reflect the lifecycle: e.g. **Intake → Manage → Storage → Lifecycle → Insights → Admin** (or whatever the developer judges clearest, as long as it tells a story top-to-bottom).
- Top-level item count is reduced — Templates and Notifications should not be peers of Records and Search.
- Active route highlighting still works; tests for sidebar still pass (update test snapshots).
- An evaluator scanning the sidebar can guess what the system does without being told.

---

### Task 13. Records List page is not actionable enough — P0

**Symptom:** `packages/frontend/src/features/records/RecordsListPage.tsx` shows a 3-column table (Title / Series / Status) with row actions. An archivist opens this page wanting to know **what needs my attention right now** — not to browse.

Specifically, three things are missing:
- No KPI summary at the top — "Pending Classification: 47", "On Legal Hold: 12", "Disposition Due (30d): 8", "Overdue Checkouts: 3" should be visible immediately and clickable as filters.
- No "Action Needed" column / cue on each row — nothing tells the user "this record needs you to do X".
- The AI confidence score (our differentiator) is not surfaced — `classification_confidence` exists on the record but is invisible in the list.

**What "done" looks like:**
- Top of page shows 3-4 KPI cards (counts + click-to-filter). Numbers come from existing endpoints; no new aggregation API needed unless missing.
- Each row communicates the next action a user should take, where applicable (review, classify, return, approve disposition).
- AI confidence is visible per row when relevant (e.g. badge on rows with `classification_status = PENDING`).
- Existing tests pass; update or add tests for KPI bar.

---

### Task 14. Status badges have no call-to-action — P1

**Symptom:** `packages/frontend/src/components/StatusBadge.tsx` shows just a color and a status word. In a professional RMS, a status is also a **next step** — "Pending → Classify", "On Hold → Review", "Disposition Due → Approve".

**What "done" looks like:**
- The badge (or an adjacent micro-element) communicates the suggested next action when there is one.
- Where the next action depends on role, the badge respects the current user's permissions (e.g. don't suggest "Approve" to someone who can't).
- Existing usage of `<StatusBadge>` across all pages still works (it is used in many places — verify nothing breaks).

---

### Task 15. CreateRecordPage uses system language, not user language — P1

**Symptom:** `CreateRecordPage.tsx` manual mode asks for Title / Description / Record Type / Series / Agency / Tags. An archivist mentally frames the task as "I'm receiving a box from DOT with 2019 financial audits", not as "I am filling field `series_id`".

This overlaps with Task 5 (templates) but is broader — even without templates, the manual form should speak the user's language.

**What "done" looks like:**
- Form copy is rewritten so each field has a one-line plain-English helper sentence ("Pick the GRS series — AI will refine if you upload a document.").
- The page offers at least one **quick intake preset** ("Box from agency", "Single document scan", "Bulk transmittal") — clicking it pre-fills sensible defaults so the user only fills the unique values.
- Required fields are visually distinct without relying solely on the red asterisk.
- Cooperates with Task 5 (template flow) — does not duplicate effort.

---

### Task 16. Workflow lifecycle bar is hidden — P0

**Symptom:** the Maine RMS design system (referenced in `CLAUDE.md` user-memory and `.interface-design/system.md`) calls out the **Workflow Lifecycle Bar (Created → Classified → Stored → Retention → Disposition)** as a **signature visual element**. The component exists at `packages/frontend/src/components/WorkflowStatus.tsx` but is not visibly placed where it sells the story — primarily on `RecordDetailPage` and the `DashboardPage`.

**What "done" looks like:**
- `RecordDetailPage` shows the lifecycle bar prominently near the top, with the current stage highlighted and historical stages timestamped (when available).
- `DashboardPage` (or main dashboard) shows an aggregate version — how many records sit at each stage, clickable to filter.
- The bar reflects real state from the record (status, classification_status, retention assignment, disposition state) — not a hardcoded mock.
- Tests added for the prominent placements.

This is the visual that anchors the entire demo narrative — without it, the lifecycle story is verbal only.

---

### Task 17. Search UX does not explain its 4 modes — P1

**Symptom:** `SearchPage.tsx` shows 4 tabs — Metadata / Full-Text / Semantic (AI) / OCR. A user who has never used the system has no way to know which tab to pick, and the most powerful capability (semantic) is buried behind a tab they may never click.

**What "done" looks like:**
- Default search experience is a **smart / unified** mode that runs across modes and shows results merged with their source (e.g. "matched via semantic similarity", "matched via full-text").
- The 4 explicit modes remain available as an **advanced toggle** for power users, with a tooltip explaining what each does and when to use it.
- Result count and breakdown (e.g. "23 results: 18 semantic, 5 full-text") is visible above the result list — this surfaces the AI effort that the demo narrative depends on.
- Existing search tests pass; add tests for the unified mode.

---

### Task 18. Empty states make the demo look broken — P0

**Symptom:** several pages show a generic empty state when filters return nothing or when the demo DB is fresh. During a live demo this looks like the system is broken.

**Where to look:**
- `packages/frontend/src/components/EmptyState.tsx` — generic component, used everywhere.
- Any page that displays a list (Records, Transmittals, Dispositions, Circulation, Search results, Audit Log).

**What "done" looks like:**
- Each empty state is **contextual** — it explains why the result set is empty (no data yet vs. filter excludes everything) and offers a clear next action ("Create your first record", "Clear filters", "Try semantic search").
- A demo data seed (see Task 19) ensures lists are never empty in the demo environment in the first place.
- Tests cover at least 2 distinct empty-state contexts.

---

### Task 19. Demo data is missing — P0

**Symptom:** without pre-seeded data, every screen looks empty on first open. Lists, dashboards, charts, audit log, notifications — all blank. This is the single biggest reason the UI feels "not convenient" on a fresh deploy.

**Where to look:**
- `packages/backend/migrations/` — current schema migrations only, no seed.
- Existing fixture files (if any) under `packages/backend/tests/`.

**What "done" looks like:**
- A seed migration (or seed script) populates the demo DB with realistic data:
  - 50–100 records across 5–6 agencies, varied statuses, varied retention dates, varied AI confidence scores.
  - 5–10 transmittals at different lifecycle stages (submitted, received, accepted).
  - 3–5 disposition requests at different approval levels (some pending first, some pending second, one approved with certificate).
  - 3–5 active legal holds.
  - 10–15 circulation events (some active checkouts, some returned, 1–2 overdue).
  - 5–10 inventory locations (warehouses + bays + shelves with capacity).
  - 5–7 unread notifications across realistic event types ("disposition awaits approval", "12 new records classified, 2 below threshold").
  - 2–3 templates (overlaps with Task 5).
- Seed runs idempotently — re-running does not duplicate data.
- Documented how to invoke the seed (script in `package.json` or a Knex command).
- Backend tests still pass (use a separate test fixture if needed; do not couple seed to test data).

This is a P0 because **without it Tasks 12–17 cannot be evaluated visually**, and the demo presenter cannot rehearse without realistic state.

---

### Task 20. Notifications bell is decoration without backstop — P1

**Symptom:** `NotificationBell.tsx` is in the layout, but there is no mechanism to surface notifications during demo unless real events fire (which is unreliable in a 5-minute walkthrough).

**What "done" looks like:**
- Demo seed (Task 19) includes 5–7 unread notifications with realistic, click-through-able messages.
- Clicking the bell shows the list; clicking an item navigates to the relevant resource (record / disposition / transmittal).
- The unread count badge updates correctly on read.
- Tests cover the click-through behavior.

---

### Task 21. Admin pages should be consolidated under a single tab navigation — P1

**Symptom:** `Sidebar.tsx` exposes Templates, Notifications, Administration as separate top-level items. There are also Users, Retention Schedules, Audit Log, Integrations underneath. This creates a "wall of admin links" that pushes lifecycle items down and out of view.

**What "done" looks like:**
- All admin pages live under `/admin` with a **tab strip** at the top of the admin shell (Users / Templates / Retention / Integrations / Notifications / Audit Log).
- Sidebar exposes a single "Administration" entry (visible to admins only).
- Existing routes still resolve (or have redirects) so deep links don't break.
- Existing tests pass; navigation tests updated.

---

### Task 22. Mobile / tablet layout sanity check — P1

**Symptom:** the design uses a fixed `w-64` sidebar and `lg:grid-cols-4` filters in several places. If an evaluator opens the demo on an iPad or projects to a non-1920 screen, layouts may break.

**What "done" looks like:**
- Documented manual QA: open the app at iPad portrait (768px), iPad landscape (1024px), and a laptop projector resolution. Walk through every demo segment.
- Any blocking layout breakage (overlapping content, hidden actions, broken sidebar) is fixed.
- Sidebar collapses or becomes a drawer at < 1024px if not already.
- Document remaining limitations explicitly so the presenter does not get surprised live.

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
| 12 | Sidebar lifecycle reorganization | P0 | 1-2 hrs | layout |
| 13 | Records List KPI + Action column | P0 | 2-3 hrs | records UI |
| 14 | Status badge call-to-action | P1 | 1-2 hrs | components |
| 15 | CreateRecordPage user language | P1 | 1-2 hrs | records UI |
| 16 | Workflow lifecycle bar placement | P0 | 1-2 hrs | components + pages |
| 17 | Search unified default mode | P1 | 2-3 hrs | search UI |
| 18 | Contextual empty states | P0 | 1-2 hrs | components |
| 19 | **Demo data seed** | **P0** | **2-4 hrs** | backend seed |
| 20 | Notifications bell backstop | P1 | 1 hr | layout + seed |
| 21 | Admin pages consolidated under tabs | P1 | 2-3 hrs | admin UI |
| 22 | Mobile/tablet QA | P1 | 1-2 hrs | manual test + fixes |

**Total dev work: ~25-40 hours of code + tests. ~1-2 hours of preparation.**

**Critical path note:** Tasks 19 (demo data seed) and 12 (sidebar reorganization) are prerequisites for almost everything else looking right. Encourage the developer to land those first, then iterate on Tasks 13–22 in priority order. Tasks 6, 7, 9, 19, 22 are the biggest unknowns — the developer should scope them first and report back if any will not fit before demo.

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
- [ ] Task 12 merged: sidebar reorganized to lifecycle order
- [ ] Task 13 merged: Records List shows KPI bar + actionable rows
- [ ] Task 16 merged: Workflow lifecycle bar visible on Record Detail + Dashboard
- [ ] Task 18 merged: empty states are contextual (or never seen because Task 19 fills them)
- [ ] Task 19 merged: demo data seeded — every list, dashboard, chart shows realistic content
- [ ] Tasks 14, 15, 17, 20, 21, 22 merged or explicitly de-scoped before rehearsal
- [ ] All backend tests pass (currently 87)
- [ ] All frontend tests pass (currently 45)
- [ ] Login flow works in target environment
- [ ] Search demo works in target environment
- [ ] Disposition 3-level approval demo works in target environment
- [ ] Upload + OCR demo works in target environment
- [ ] Transmittal demo works end-to-end in target environment
- [ ] Circulation demo works end-to-end in target environment

If all above are checked → demo is ready.