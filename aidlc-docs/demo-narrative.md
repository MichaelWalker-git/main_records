# Demo Narrative — Maine RMS Pre-Sale

**Audience:** State of Maine, Department of Secretary of State, Maine State Archives — RFP# 202603058 evaluation panel.
**Goal of demo:** convince evaluators that AI-native records management is the only realistic path to closing their growing backlog without hiring more archivists.
**Tone:** confident, operational, evidence-led. We are not selling features — we are selling a way out of an unsustainable workload.

---

## The Headline Problem

> **Maine State Archives receives more records every week than it did in a month ten years ago. The archivist team has not grown. The gap will not close on its own.**

This is the single sentence we want evaluators to repeat back to their leadership.

---

## Why It Hurts — Three Levels of Pain

### 1. Operational — a backlog that does not shrink
- Thousands of physical boxes await classification, indexing, retention assignment.
- Every new digital record adds work (OCR, tagging, metadata) faster than it can be processed.
- Reference requests from agencies and citizens queue for days or weeks.

### 2. Compliance — every unprocessed record is risk
- Records outside an active retention schedule are either destroyed prematurely (violation) or kept forever (cost + violation).
- Legal hold cannot protect what is not indexed → litigation risk.
- Paper-based audit trails are incomplete by design → fail on discovery.

### 3. Citizen / Agency Experience — slow responses are publicly visible
- Agency self-service does not exist; archivists become a bottleneck for routine retrieval.
- FOIA / Right-to-Know responses take weeks.
- The State's reputation is shaped, in part, by how fast the Archives answer.

---

## Why The Obvious Alternatives Don't Work

| Alternative | Why it fails |
|-------------|--------------|
| Hire more archivists | Budget cap + scarce expertise; does not scale linearly with record volume |
| "Just digitize everything" | Adds work — both paper AND scans now need classification |
| Off-the-shelf RMS (database with forms) | Still requires humans to fill every field; the bottleneck stays |
| Outsource scanning | Solves intake, not classification, retention, search, or compliance |

The only intervention that scales is **AI doing the cognitive work** (classify, extract, link, surface) while humans do the **decisions** (approve disposition, resolve legal hold, answer the citizen).

---

## Our Wedge: AI-Native Where It Counts

| Bottleneck today | Our solution | Concrete effect |
|------------------|--------------|-----------------|
| Manual classification of every incoming record | Bedrock Claude Sonnet (`tool_use`) — auto-tag on upload, 0.85 confidence threshold, human review queue below threshold | ~10x throughput, archivists become reviewers not data-entry clerks |
| Paper / scanned-document OCR | Bedrock Claude Vision — native PDF up to ~100 pages + handwriting | One API call replaces Textract + post-processing pipeline |
| "Where is that 1987 record about X?" | Titan Embed v2 + pgvector HNSW (semantic) + tsvector + pg_trgm (full-text) | Seconds instead of hours of manual binder/box search |
| Retention tracking by hand | Auto-calculated disposition date + EventBridge cron 90/30/7-day alerts | Nothing is forgotten; alerts reach owners before action is required |
| Legal hold enforcement | Database + API gate that blocks modification and disposition for held records | Compliance by default, not by archivist memory |
| Agency requests through archivists | Agency self-service portal (accession, transmittal tracking, reference) | Archivist time freed for high-value review work |

---

## Quantifiable Promise (Slide Bullet)

> **"The same archivist team processes 5–10x more records, with a complete audit trail and zero compliance lapses — because AI does classification and search, and people make the decisions."**

This is the line that goes on the deck. Everything else in the demo is evidence for it.

---

## How Each Demo Section Maps to the Narrative

Use this table to keep every screen tied back to the headline problem. If a presenter cannot say which level of pain a screen addresses, cut it from the demo.

| Demo segment | Pain it addresses | What evaluator should walk away believing |
|--------------|-------------------|--------------------------------------------|
| **Upload + AI extraction (US-1.2)** | Operational backlog | "Classification stops being a person's job — at scale." |
| **Template-driven creation (US-1.1, after Task 5)** | Operational backlog | "Even manual creation is structured and consistent." |
| **Search — 4 modes (US-8)** | Citizen experience + Operational | "Anyone in the system finds anything in seconds." |
| **Retention + alerts (US-6)** | Compliance | "The system tells us before, not after, a deadline passes." |
| **Disposition + 3-level approval + Legal hold (US-4)** | Compliance | "Destruction is impossible without legal certainty." |
| **Transmittal flow (US-3, after Task 6)** | Operational + Agency experience | "Records moving between agencies are tracked end-to-end." |
| **Circulation + Barcode (US-5, after Task 7)** | Operational + Compliance | "We always know who has what and when it's due back." |
| **Agency self-service (US-7)** | Agency experience | "Agencies serve themselves; archivists do not become a help desk." |
| **Audit trail UI (US-11)** | Compliance | "Every action is on the record, forever." |
| **Dashboard + Reports (US-9)** | All three (visibility) | "Leadership sees the backlog shrink in real time." |
| **Integration dashboard (US-12)** | All three (extensibility) | "This system fits into the State's existing IT stack." |

---

## Demo Opening (Drafts — pick one for rehearsal)

### Option A — Pain-first (recommended)
> "Maine State Archives takes in more records every week today than it did in a month ten years ago. The team has not grown. Today we will show you how AI closes that gap — without hiring, without compliance compromise, and without a single archivist being replaced. Their job changes, and improves, but it does not go away."

### Option B — Compliance-first
> "Three things are true at the same time at the State Archives: records are coming in faster than ever, retention rules are getting stricter, and the team that has to apply both is fixed. The system we will show you today removes the assumption that those three facts are incompatible."

### Option C — Outcome-first
> "The same archivist team, processing five-to-ten times more records, with a complete audit trail and zero compliance lapses. That is the outcome. The demo is how."

---

## Demo Closing (Drafts)

### Option A — Roadmap-anchored
> "What you saw today is a working PoC running on AWS. Production hardening — cross-region replication, CloudFront + WAF, OpenSearch promotion path, QuickSight reporting — is configuration, not redesign. We are not asking you to imagine how this would work; we are asking you to choose how fast we move it from PoC to production."

### Option B — Risk-anchored
> "Every week the backlog grows is a week the State takes on more compliance risk and more citizen-facing slowness. Our recommendation is that the technology decision is the easy part — what we just showed you works. The hard part is committing to start."

---

## Anticipated Questions + Talking Points

| Likely question | Talking point | Evidence in code/docs |
|-----------------|---------------|-----------------------|
| "Why not Textract for OCR?" | Bedrock Claude Vision handles native PDFs up to ~100 pages including handwriting in one API call — higher quality, fewer moving parts | `packages/lambdas/ai-ocr/index.ts:142-218` |
| "Why not Comprehend for classification?" | Claude Sonnet `tool_use` returns structured JSON exactly matching our schema — no regex post-processing, prompts versioned in S3 | `packages/lambdas/ai-classify/index.ts:37-81` |
| "Why not OpenSearch?" | PostgreSQL `tsvector + pg_trgm + pgvector HNSW` covers full-text and semantic at demo scale; promotes to OpenSearch with no application changes | `packages/backend/migrations/001_initial_schema.ts:134-156` |
| "Why not QuickSight?" | Recharts in-app gives equivalent visualizations at zero license cost; QuickSight re-enableable when reporting needs grow | `packages/frontend/src/features/dashboard/`, `analytics/AnalyticsPage.tsx` |
| "Why not CloudFront + WAF?" | Production hardening layer; intentionally disabled for PoC blast-radius and cost; one CDK stack to enable | `packages/infrastructure/bin/app.ts:13-16` |
| "How do you handle hallucination on classification?" | Confidence threshold of 0.85; below that, record goes to human review queue, not auto-classified | `packages/lambdas/ai-classify/index.ts:104-105` |
| "What about legal hold?" | Enforced at API + database level — held records cannot be modified or disposed | `packages/backend/src/api/records.ts:174-180`, `WorkflowService.ts:101-106` |
| "What about audit?" | Every mutation goes through `auditMiddleware` writing to `audit_events` — visible in UI | `packages/backend/src/server.ts:38-52`, `middleware/audit.ts` |
| "Cross-region DR?" | 5 lines of CDK to add S3 CRR + RDS cross-region replica — by design out of PoC scope | `packages/infrastructure/bin/app.ts:22-25` |
| "Cost at scale?" | Architecture substitutions are documented; estimated monthly cost ~$178 at PoC, scales linearly with usage | `CLAUDE.md` (project root) |

---

## What NOT to Say

- "It's just a prototype." → call it a **working PoC running on AWS**; emphasize what works, not what is missing.
- "We didn't build X yet." → frame as **scoped for production phase, ready when you commit**.
- Apologize for substitutions (Bedrock Vision instead of Textract, etc.) → these are **upgrades**, defended in the substitutions table.
- Demo the gaps from `aidlc-docs/audit-2026-05-27.md` — DSP-04 self-approval, search filters before Task 1 fix, etc. **Steer around them**, do not draw attention.

---

## Pre-Demo Rehearsal Checklist (narrative-side)

- [ ] Presenter can deliver the opening from memory (one of A/B/C above).
- [ ] Presenter can answer all 10 anticipated questions in under 30 seconds each.
- [ ] Presenter can name, for any screen shown, which of the three levels of pain it addresses.
- [ ] Presenter has rehearsed the closing.
- [ ] Substitutions slide is in the deck and presenter knows the talking points.
- [ ] Backup plan if a feature breaks live: which screen do we fall back to, and what do we say?

---

## Companion Documents

- `aidlc-docs/audit-2026-05-27.md` — full code-vs-RFP audit with file:line evidence; **source of truth for "is this real?"**.
- `aidlc-docs/dev-fixes-for-demo.md` — developer task list; the demo narrative depends on Tasks 1, 5, 6, 7 being merged before delivery.
- `aidlc-docs/construction/implementation-vs-proposal.md` — coverage matrix vs. submitted proposal.