# Demo Runbook

Pre-flight checklist for the live Maine RMS demo. Follow top-to-bottom.

## 1. Pre-demo warmup (T-2 minutes)

Run from a terminal with internet access:

```bash
./scripts/demo-warmup.sh
```

Or with a custom URL:

```bash
./scripts/demo-warmup.sh http://your-alb-url
```

The script:
- Hits the frontend home, dashboard, and records routes (primes bundle cache)
- Hits `/api/health` (triggers DB pool + migration completion)
- Hits the main API endpoints (warms up auth + service caches)

Expected outcome: every line ends in `OK`. A `WARN` line means that endpoint returned an unexpected code — investigate before going live.

## 2. Browser warmup (T-1 minute)

In the demo browser:

1. Open the deployed URL.
2. Log in as **Sarah Chen** (`sarah.chen@maine.gov` / `Demo@2024!`).
3. Click through: Dashboard → Records → open the first record.
4. Hit Back. The next live click should respond instantly.

## 3. Demo accounts

| User | Email | Role | Use for |
|------|-------|------|---------|
| Sarah Chen | sarah.chen@maine.gov | admin | Full system tour |
| Michael Torres | michael.torres@maine.gov | staff | Approval flows |
| Diana Patel | diana.patel@maine.gov | records_officer | Day-to-day records ops |
| James Wright | james.wright@maine.gov | agency_user | Submitter perspective |

Password for all: `Demo@2024!`

## 4. Demo flow checkpoints

The narrative is in `aidlc-docs/demo-narrative.md`. Key visual anchors:

- **Dashboard** — Lifecycle Pipeline bar shows record counts at each stage. Click any segment to filter.
- **Records List** — KPI cards at the top (clickable filters), AI confidence column.
- **Record Detail** — Workflow lifecycle bar near the top. Document Viewer side-by-side with extracted text.
- **Transmittals** — Ownership badges ("Awaiting your action"), Timeline on detail.
- **Circulation** — 3 explanation cards (Check Out / Return / Scan), overdue table.
- **Search** — 4 modes (Metadata / Full-Text / Semantic / OCR).

## 5. Recovery if something goes wrong

| Symptom | Action |
|---------|--------|
| 500 on first click | Wait 5s, retry. If persists, check ECS logs. |
| Empty list on a known-populated table | Migrations may not have completed — re-run warmup. |
| Auth fails | Cognito User Pool may be cold — wait 30s, retry. |
| OCR/AI does not respond | Bedrock has a regional cold-start — fall back to "this happens async, here's the result on a record we processed earlier". |

## 6. Post-demo

- Capture evaluator questions in `tmp/demo-questions.md` (if file does not exist, create it).
- File any UX bugs as separate tickets — do not patch live during follow-up.
