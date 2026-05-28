# Q&A Prep — Maine RMS Presentation

**Speaker:** Michael Walker, CEO of Horus Technology.
**Audience:** Maine State Archives evaluation panel — Susan Verrier (RFP Coordinator), OIT representatives, State Archivists, Procurement.
**Use:** read aloud during rehearsal; Michael should be able to deliver each answer in 30–60 seconds without notes.

**Hard rules carried over from `presentation.md`:**
- Never quote `$178/month` — internal cost-modeling number, not a price.
- Never name a Horus client — refer by **industry workload** only.
- Never promise auto-population of `location_code`, `series_title`, `disposition_date`, or `TR number` — those stay archivist-on-review.
- Public-safe portfolio metrics only: **95%+ accuracy, 85% faster processing, 180% ROI in 14 months, 30–50% lower cost, 40% faster time-to-value**.
- If you don't know the answer or the source, say so: *"I don't have the source for that handy; I'll send it after the session."* Never invent a number live.

---

## SECTION 1 — Pass/Fail Eligibility

### Q1. "Pass/Fail #1 says storage locations must be **assignable by AIP**. What does that look like in your architecture?"

**A.** AIP — Archival Information Package — means each archival object is explicitly assigned to a specific storage location, not just replicated automatically by the cloud. In our architecture, every record carries its storage location as a first-class metadata field. Day 1 of the contract, two AWS regions — one in Virginia, one in Oregon, more than **2,400 miles apart** — are live and AIP-addressable separately. When an AIP is moved from one region to the other, the system records which AIP lives where, who moved it, and when. That satisfies Pass/Fail #1 with explicit AIP-assignment, not implicit replication.

---

### Q2. "Pass/Fail #4 — support within the State of Maine. Do you have a Maine office today?"

**A.** *(Deflect to the written record. Do NOT volunteer a Maine-resident hiring commitment on stage — eligibility is already certified in Appendix C, and how we deliver in-state support is fully described in our File 4 submission.)*

> "Our compliance with Pass/Fail #4 is certified in Appendix C and the delivery model is described in detail in File 4. Rather than paraphrase a contractual commitment live, I'd rather point you to the exact language we submitted — it's in Section 4 of our Proposed Services Form. If anything in there is unclear, we're happy to take that as a written follow-up after this session."

**Why we deflect:** the residency clause was the subject of our pre-submission clarification with Susan Verrier (April 16). Whatever interpretation came back is now baked into our written response. Re-stating it on stage in different words risks creating a verbal commitment that diverges from our submission. **Direct the panel to the document.**

---

### Q3. "Pass/Fail #3 — initial customizations and ongoing code maintenance. How do you scope the 'over time' part?"

**A.** It means: when Maine records-management law changes — a retention schedule revision, a FOAA timeline shift, a new agency onto the system — we update the code and redeploy **as part of the contract**, not as a change-order. That's the delivery model we already use for our regulated-industry clients, and it's costed into the fixed price for the initial period and both renewal options. There is no additional invoice when Maine law changes. That's the commitment.

---

## SECTION 2 — AI, Hallucination, Trust

### Q4. "How do you prevent the AI from misclassifying records?"

**A.** Three layers. **One** — the classification prompt uses Claude's `tool_use` pattern. The model returns structured JSON matching our schema, not free-form text. The categories and tags are constrained — there is nothing to hallucinate into. **Two** — every classification carries a confidence score. Above **0.85**, we auto-classify. Below 0.85, the record goes to a human review queue. We never auto-accept low-confidence classifications. **Three** — retention dates, the 8-digit location, the TR number — those never come from AI. Those are **archivist-on-review fields**, because retention is a legal judgment, not a probabilistic one. AI does the cognitive work; the archivist makes the decisions.

---

### Q5. "What if a record is misclassified anyway?"

**A.** Two safeguards. **One** — every classification is logged in the audit trail with the model's confidence score and the prompt version. So if a record is misclassified, you can trace exactly why and reclassify it system-wide. **Two** — reclassification is a normal workflow. Any archivist or records officer can reclassify a record, and the change is itself logged. Misclassification is **recoverable**; what we prevent is silent misclassification.

---

### Q6. "State data must not be used for AI model training — is that your promise, or is it contractually backed?"

**A.** Contractually backed by **AWS**, not by us. AWS Bedrock's data policy is explicit — customer data is not used to train Bedrock's foundation models. That's an AWS contractual commitment that we inherit as a customer. We are not permitted to use State data for our own model training, and AWS is not permitted to use it for theirs. Maine's records stay Maine's records — architectural guarantee, not vendor promise.

---

## SECTION 3 — Architecture & Substitutions

### Q7. "You replace Textract with Bedrock Claude Vision. Why?"

**A.** Two reasons. **First** — Claude Vision handles native PDFs up to about 100 pages, including handwriting, in a single API call. With Textract we'd run OCR per page, then a cleanup pipeline to reconstruct paragraphs and tables, then a second pass for handwriting which Textract doesn't do well. Claude Vision is one call with structured output — fewer moving parts, fewer failure points. **Second** — the same Bedrock service that does OCR also does classification and embeddings. Architecture stays uniform. That said, your RFP doesn't lock you into either choice. If your OIT prefers Textract — for compliance, vendor familiarity — we can co-deploy. It's configuration, not redesign.

---

### Q8. "Why not OpenSearch? That's the AWS-standard search answer."

**A.** For the data scale we expect — tens of millions of records over the contract — PostgreSQL covers both search modalities sub-second: **`tsvector` and `pg_trgm`** for full-text, **`pgvector` with HNSW** for semantic embeddings. The advantage is one fewer service, one fewer auth surface, one fewer cost line. If volumes grow past where Postgres holds, OpenSearch is a one-stack promotion — no application changes, the search interface stays the same. This isn't "we couldn't afford OpenSearch." This is **OpenSearch is your OIT's choice when the time comes.**

---

### Q9. "Why isn't CloudFront with WAF in the demo architecture?"

**A.** For the demo environment, ALB direct access keeps blast radius small and cost low. For production, CloudFront and WAF go in front — five-line CDK addition, **priced into our cost proposal**. We've done this exact substitution four times. The demo is the live system, not the production hardening. We were transparent about that — the substitutions one-pager in your leave-behind names every component.

---

## SECTION 4 — Migration & Implementation

### Q10. "We have records going back a hundred years — some in your kind of system, some in spreadsheets, some on paper. How do you migrate?"

**A.** Three workstreams. **One** — digital records and metadata in your existing system: we mirror your index, run both systems in parallel for the first 90 days, validate row-by-row, then cut over. **Two** — spreadsheets and ad-hoc indices: importers per source format, reconciliation report, your sign-off before commit. **Three** — physical re-tagging across your three warehouses: that runs across the **initial period of performance**, on a schedule we agree with your archivists, not a single 90-day push. We've done this six times for similar regulated migrations. The detailed work plan is in File 4 with timeline.

---

### Q11. "Are we charged extra for the 90-day parallel run?"

**A.** No. It's inside the **fixed price** for the initial period of performance. If the parallel run extends — say your archivists want longer validation — that's a conversation, not a billable change. We've never had to do that, but it's not a hidden cost either way.

---

### Q12. "Dedicated Project Manager — full-time or fractional? Maine-based?"

**A.** Full-time, dedicated to Maine for the life of the contract. The PM is the **single throat to choke** for delivery, change-control, and escalation. PM bio and reporting structure are in our File 3 submission. *(If pressed on residency: deflect to written File 4 — see Q2 above.)*

---

### Q12a. "Eight miles of paper records sitting in three warehouses — what's the realistic story for getting that into the system?"

**A.** The inventory window is the leverage. Your team is already touching every box on the re-tagging cycle — that's the moment to capture once. Three pieces. **One** — legacy-barcode lookup endpoint: scan the existing label, the system pulls whatever metadata you already have for that container and pre-fills the new record. **Two** — batch-import endpoint: spreadsheet-to-record reconciliation for collections that have an index but not in our system. **Three** — Bedrock Vision OCR on the document itself when a box is opened for any reason — a FOAA pull, a transmittal, an accession review. Item-level metadata captured in the moment that box is already open. **You are not going to touch eight miles of paper twice.** The system is built to ride along with the work your archivists are already doing.

---

### Q12b. "How will your team handle institutional knowledge transfer? CoSA's 2023 survey says a third of state archivists were appointed after 2020."

**A.** Two answers. **First** — the system is the institutional memory. Every classification, retention decision, location move, and archivist override is logged with the rationale and the prompt version. A new hire on Day 1 has a searchable record of *why* every record sits where it sits. That is not a substitute for mentorship, but it removes the "ask the person who's been here twenty years" bottleneck that turnover puts pressure on. **Second** — onboarding is in scope. Role-based training tracks for archivists, records officers, agency users, and admins. Recorded sessions, written runbooks, ticketed support during business hours, escalation path after. CoSA's number is exactly why we wrote training into the fixed price — because the next archivist hired in Maine should not have to learn this system the hard way.

---

## SECTION 5 — Compliance & Security

### Q13. "Legal hold — exactly how is it enforced?"

**A.** Three layers, all in the demo you saw. **One** — the database: held records carry a flag the data layer respects. **Two** — the API: any modification or disposition request on a held record returns a refusal, and the attempt is audit-logged with user, timestamp, IP. **Three** — the UI: the Records detail page shows the hold prominently with reason and placed-by. Even if someone bypasses the UI, the API and database refuse. **Enforcement at the architecture, not at the human layer.**

---

### Q14. "Audit trail — what's retained, for how long, and how do we know it hasn't been tampered with?"

**A.** Every authentication event, role change, administrative action, data access, and configuration change is logged. Audit events are **append-only by design** — the table refuses updates and deletes at the database level. Retention defaults to the life of the contract plus seven years, configurable per State retention policy. The log is exportable to your SIEM on demand. In your live demo, the legal-hold-blocked click left a row — that row is still there in five, ten years, however long the policy says.

---

### Q15. "FOAA response time — what's the realistic improvement?"

**A.** Today a FOAA request that requires going through unindexed binders or back-tape can take weeks. With semantic search and full-text indexing across all ingested records, a query that used to take an archivist days returns **sub-second**. The bottleneck moves from "find the record" to "have a human review the redactions and approve release" — which is where it should be. We're not promising every FOAA closes in three hours. We're promising the **search part is under a second**, freeing your team for the legal review where their judgment actually matters.

---

### Q16. "WCAG 2.1 AA — designed in, or retrofit?"

**A.** Designed in from Day 1. Every UI component is built on a primitive set that's screen-reader-tested, keyboard-navigable, and color-contrast-compliant. We test with `axe-core` in CI on every commit, and with NVDA and VoiceOver manually on every release. **Maine's DigitalAccessibilityPolicy and WebStandards** are line-items in our compliance matrix in File 4.

---

### Q17. "Third-party audit — your RFP accepts FedRAMP, ISO 27001, or SOC 2 Type II. Which do you bring?"

**A.** All three, through the AWS shared-responsibility model. AWS holds FedRAMP authorization at Moderate and High, ISO/IEC 27001 certification, and SOC 2 Type II audit reports — refreshed annually. Our deployment is on AWS, so those reports are inherited for the infrastructure layer. For the application layer, we publish our own SOC 2 Type II report to clients on request. **All three boxes — that's a deliberate over-coverage, not a guess about which one your audit team will accept.**

---

## SECTION 6 — Cost & Risk

### Q18. "Fixed price — what happens if our record volumes triple unexpectedly?"

**A.** Two answers. **First** — the architecture is serverless. Aurora Serverless v2 scales storage and compute with usage, not with seat count or per-record licenses. We don't hit a per-seat or per-record license cliff. **Second** — the fixed price absorbs reasonable growth. That risk is on us, by design — that's the discipline a fixed price imposes. **Triple, double, even six times** — we've costed the buffer. If volumes grow by, say, ten times what was modeled, that's an unforeseeable scope change that we'd talk through with your contract administrator.

---

### Q18a. "Walk us through the economics — why does fixed price actually work here, when most state IT contracts blow up on volume?"

**A.** The reason fixed price works on this stack and not on a per-seat or per-record license model is the architecture. Aurora Serverless v2 scales **with usage**, not with the seat count. Bedrock is **per-call**, not per-engineer. S3 is per-gigabyte. The cost lines move with the work, not with how many archivists you've got logged in. That means when the State legislature funds Maine for fifteen new agencies onto the system, our cost goes up proportionally with the records — but yours, under the fixed price, does not. The serverless cost model is what makes it underwriteable. That's not a discount. That's how the contract is engineered.

---

### Q19. "Twelve engineers across four practice areas — is that enough? What's your bus-factor protection?"

**A.** Two protections. **First** — no single engineer owns a system in production. Every component has at least two engineers who've shipped it. **Second** — the Infrastructure-as-Code is the system of record. CDK in TypeScript, every stack reproducible from git, every Lambda's prompt versioned in S3. If our entire team disappeared tomorrow, your IT team — or any AWS Advanced partner — could reproduce and operate the system from our repository. **We don't ask you to trust headcount. We ask you to trust IaC.**

---

### Q20. "If Horus stops operating, what happens to our data and our system?"

**A.** Your data and your infrastructure are deployed into **your AWS account, your AWS organization** — not ours. Code, infrastructure-as-code, data, S3 buckets, Aurora cluster — all in your tenancy. The IT-SC termination clause is explicit. On termination — voluntary or otherwise — we walk away. Your data stays where it is, you keep operating, and you can engage any AWS partner to take over maintenance. **NIST SP 800-88 sanitization** of any of our hosted artifacts is part of the close-out. **No vendor lock at the data layer.**

---

## SECTION 7 — Anticipated Curveballs

### Q21. "PoC vs. production — how much of what we just saw is real?"

**A.** Everything in the demo is real, running on AWS — the records, the AI pipelines, the audit trail, the legal-hold enforcement, the search modes, the analytics. Two specific items are intentionally not in the demo environment: **CloudFront with WAF** in front of the ALB, and **OpenSearch** as a search promotion path. Both are five-line CDK additions, priced into the proposal. Everything else — the architecture you saw, the data model, the AI pipeline — **is the production design**, deployed.

---

### Q22. "ArchivesSpace and Libsafe — how do you integrate with both?"

**A.** **ArchivesSpace** stays your descriptive cataloging system; we integrate via its documented REST API for two-way sync of accession-level metadata. **Libsafe** stays your digital-preservation layer; we hand long-term preservation to it on a defined trigger — typically when a record reaches its permanent-retention milestone. We don't replace either. **Our system is the operational records layer in the middle** — intake, classification, retention tracking, search, transmittal, circulation, disposition — and it talks to ArchivesSpace and Libsafe through stable APIs your team controls.

---

### Q23. "What's the worst thing that could go wrong, and what's your plan for it?"

**A.** Honest answer: a **migration data-quality problem we don't catch in the parallel run** — a category of records the old system encoded loosely, and our importer interprets too strictly. Plan: the **90-day parallel run** is exactly for catching this. Both systems are live; archivists work in both; reconciliation reports flag every divergence; nothing cuts over until your team signs off. If we find a problem, we fix the importer, re-run, and the parallel run extends — at our cost. The risk model assumes this happens at least once. That's why the parallel run isn't optional.

---

## Backup posture for any question we can't answer live

> *"I want to give you an accurate answer to that, not an off-the-cuff one. Let me follow up in writing within 24 hours."*

Use this when:
- The question references a specific RFP clause Michael isn't 100% sure about live.
- A number is asked for that isn't on our public-safe metrics list.
- A technical detail outside the demo route comes up (e.g. specific Bedrock model parameters, exact Aurora I/O settings).

**Never bluff. Never invent.** A "let me follow up" is stronger than a wrong number.

---

## Companion documents

- `aidlc-docs/presentation.md` — full spoken script, source of truth for wording.
- `aidlc-docs/presentation-slides.md` — speaker cards (one per slide).
- `aidlc-docs/presentation-marp.md` — Marp source for the deck.
- `aidlc-docs/demo-narrative.md` — strategic narrative behind the deck.