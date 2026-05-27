# Maine RMS — Speaker Cards

**Speaker:** Michael, CEO of Horus Technology.
**Audience:** State of Maine, Department of Secretary of State, Maine State Archives.
**Length:** ~12–13 min spoken + 10 min Q&A.
**Slide count:** 7 designed slides + 3 live-demo moments (browser, no slide).

Each card below = **one slide** = what's on screen, what you say, how long, what to remember.

---

## CARD 1 — Intro

**On screen** Title slide. "Records Management System — A working demo for Maine State Archives." Horus Technology identity. AWS Advanced Partner · Anthropic Partner. **26 active AWS certifications · 100% staff certified.**

**Time** ~50 sec.

**Speech**
> Good morning. I'm **Michael, CEO of Horus Technology**. We're an **AWS Advanced Partner** and an **Anthropic Partner**, based in San Diego. About twelve engineers, fully distributed, all AWS-certified. Twenty-six active certifications across the team.
>
> What we do is narrow. We build **document-processing software with AI on AWS**, mostly for clients who can't afford to be wrong — healthcare, financial services, insurance, education. The numbers we see across our portfolio, on average: **above 95% accuracy, 85% faster processing, payback inside fourteen months.**
>
> We run **24/7 distributed managed support for the users of the systems we build** — that's the operational model we propose for Maine archivists, agency records officers, and citizen-facing portal users.

**Remember** Eye contact, not slide. Don't read certs aloud. **Do not bring up Pass/Fail #4 unprompted** — eligibility is already certified in Appendix C. If asked directly, see Q&A prep Q2.

---

## CARD 2 — The Problem

**On screen** Headline: *"You're getting more records every week today than you used to get in a month, ten years ago."* Three stats: **10× growth in record intake** · **0% growth in headcount** · **3 regulatory pressures at once** (retention, FOAA, legal hold).

**Time** ~1:30.

**Speech**
> Today is about your **Records Management System**. We're showing you our **records-management product, running on AWS, configured against your RFP** — live, in a few minutes.
>
> **Pass/Fail #3** in your eligibility section asks the bidder to commit to **initial customizations and ongoing code maintenance** to keep up with Maine records-management law. **We commit to that.** It's the delivery model we already use with our regulated-industry clients.
>
> One fact about Maine State Archives that frames everything else:
>
> > **You're getting more records every week today than you used to get in a month, ten years ago.** And in those same ten years, **the archivist team hasn't grown.**
>
> You can't hire your way out of that. And on top of it, **three regulatory pressures hit a state archive at the same time** — records disposition schedules, FOAA, and legal hold. Get any one of those wrong, and it shows up in public.
>
> So that's what the next twelve minutes are about. **Three pieces: the operational gap, the compliance exposure, and the AI that closes both.**

**Remember** This is the slide they'll photograph. Slow down. Pause after "the archivist team hasn't grown."

---

## CARD 3 — Block 1: Operational

**On screen** Header: *"The math doesn't work."* Left: a diverging-curves chart (records intake rising, archivist headcount flat). Right: a dark navy stat card — **Healthcare Medical Records workload — 85% faster processing, same team.**

**Time** ~2:00.

**Speech**
> *(Thesis — say it to the room, not to the slide)*
> **You can't keep up with exponential record volume by hiring linearly. The only thing that scales is AI doing the cognitive work, while humans make the decisions.**
>
> Concrete example. One of our healthcare clients — call it the **Healthcare Medical Records workload**, since they're under NDA. **Fact:** patient-records intake rising every quarter, headcount frozen. **Action:** we put a Bedrock pipeline in front of intake — every document classified, extracted, routed automatically; humans only saw what AI was unsure about. **Result: 85% faster processing, with the same team.** Three reference projects in our File 3 submission cover the same pattern across **healthcare, financial services, and higher-education records** — happy to walk through any in Q&A.
>
> Now — I know the records are different. **Patient charts aren't 19th-century court records, and a loan file isn't a gubernatorial paper.** What's the same is **the structural pattern: high-volume regulated intake with legal retention requirements, where classification is the bottleneck and judgment is the part you don't automate.** That pattern ports cleanly to a state archives.
>
> Honesty point: this is not a magic pill. Three things ran in parallel — the AI pipeline, **a human-in-the-loop review queue**, and **a change-management plan for the staff whose work was changing.** All three matter. We've costed all three into the Maine proposal.
>
> Think about **NARA — the National Archives — in the 2010s.** Same curve: federal records growing faster than archivist capacity. The federal answer was the **Electronic Records Archives initiative**. The published anchor is **OMB Memorandum M-19-21**, with the deadline updated by **M-23-07** to **30 June 2024**. **Now — Maine isn't bound by M-19-21.** It's a federal directive. But **the curve M-19-21 was answering is the same curve facing your Archives** — and the federal answer was tooling, not headcount. **That's the same logic, configured for state heritage records.**

**Remember** Stay on the slide for both arguments. Don't rush to the demo.

### → DEMO MOMENT 1 (browser, no slide, ~30 sec demo + 10 sec close)

**Route** Records List → drag-upload one record → AI auto-classifies in seconds.

**Speech**
> *[Live demo: Records List → Upload one record → AI auto-classifies]*
>
> One document. Classified, tagged, indexed, embedded, routed for review — under thirty seconds. Nobody on your team typed a field. **Multiply that by the boxes in your three warehouse locations.**
>
> *(Close, while flipping back to deck)*
> The backlog doesn't shrink because you hire more people. It shrinks when classification stops being a person's job. **That's the operational case.**

**Remember** If upload takes 4 sec — narrate it. Don't go silent. Backup screencast A queued.

---

## CARD 4 — Block 2: Compliance

**On screen** Header: *"Every control your RFP names — met at the architecture."* Three columns: **Encryption** (TLS 1.3 · AES-256 · FIPS-validated KMS) · **Identity** (SAML 2.0/OIDC · RBAC · MFA) · **Audit** (immutable log · SIEM-exportable). Lower band: **FedRAMP · ISO/IEC 27001 · SOC 2 Type II** badges. Bottom strip: **NIST SP 800-88** · **OIT BackUp + BC** · **WCAG 2.1 AA**.

**Time** ~2:30.

**Speech**
> *(Thesis)*
> **A record that isn't classified, isn't on a retention schedule, and can't be found is a liability. The system has to enforce the rules — you can't lean on archivist memory.**
>
> Three regulatory pressures at the same time. **Records disposition schedules.** **FOAA — Maine's Freedom of Access Act.** **Legal hold** — modification has to stop instantly when litigation lands. Get any one of those wrong, and it shows up in public.
>
> The defense isn't *trust us.* It's **six independent, third-party-audited frameworks aligned on the same architecture** — every one named in your RFP or in published Maine OIT policy.
>
> *[breath pause — let eye scan column 1]*
> **One — Encryption.** TLS 1.3, AES-256, **FIPS 140-validated** KMS. **Two — Identity.** SAML 2.0 / OpenID Connect against your Active Directory, RBAC, MFA. **Three — Audit.** Immutable, append-only, SIEM-exportable.
>
> *[breath pause — let eye drop to badges]*
> **Four, five, six** — third-party audit options. Your RFP accepts any one; **we bring all three: FedRAMP, ISO/IEC 27001, SOC 2 Type II** — through AWS shared-responsibility reports, refreshed annually. On termination, State data is destroyed to **NIST SP 800-88 media-sanitization standards.** Backup and continuity conform to your **OIT BackUpRecoveryProcedures and BusinessContinuityDisasterRecoveryPolicy**.
>
> *[breath pause — let eye drop to WCAG strip]*
> And one more bar specifically for the State of Maine — **accessibility**. **WCAG 2.1 Level AA**, Maine's **DigitalAccessibilityPolicy**, designed in from day one. Because for a public-records system, **a citizen who can't use the interface is a citizen the State has failed.**
>
> ---
>
> Concrete example. **SMB Loan Processing workload** — heading into a regulator audit, legal-hold list lived on a spreadsheet. **Action:** we put legal hold and audit logging into the API and the database itself. Once a record is on hold, the data layer refuses modification. **Result: zero findings on document handling**, audit-response time from weeks to hours. Same enforcement pattern in the system you'll see — **including the agency self-service portal where a records officer can accession boxes, submit reference requests, and place a legal hold from their own desk** — and **circulation tracking with overdue notices** for records moving between your three warehouse locations.
>
> One more architectural commitment your security team will want named explicitly: **State data is not used for AI model training, ever.** That's a contractual guarantee from AWS Bedrock, not a promise from us — Maine's records stay Maine's records.

**Remember** Most cognitive weight on this slide. Three breath-pauses. Do **not** read the slide aloud — speak around it.

### → DEMO MOMENT 2 (browser, no slide, ~30 sec demo + 10 sec close)

**Route** Records detail → toggle Legal Hold → attempt disposition → system blocks → audit trail shows the blocked attempt.

**Speech**
> *[Live demo]*
>
> The system refused. The refusal is logged. The user is logged. Five years from now, that line of audit history is the defense. **Compliance is the default — not the discipline.**
>
> *(Close)*
> Every unprocessed record is risk. This system turns risk into routine, because the rules live in the code, not in someone's head. **That's the compliance case.**

**Remember** Single click, single refusal, single audit line. Less is more.

---

## CARD 5 — Block 3: Differentiation

**On screen** Header: *"AI is the architecture — not a feature."* Top band — two source citations: **IDC Global DataSphere — unstructured data growth at double-digit CAGR through the late 2020s** · **NIST AI Risk Management Framework 1.0 — four trustworthiness controls**. Four cards 2×2 mapping our stack onto NIST AI RMF: **Bounded outputs** (Bedrock Claude Sonnet, tool_use schema) · **Uncertainty + escalation** (0.85 confidence threshold → human review queue) · **Traceability** (Claude Vision OCR · Titan v2 + pgvector + tsvector search) · **Accountability** (EventBridge cron 90/30/7-day · append-only audit log). Integrations strip: Microsoft 365 · SharePoint · Dropbox · CRM · ArchivesSpace · **Libsafe (preservation, retained)**. Footer: substitutions callout — *"Production-hardening upgrades available Day 1: CloudFront/WAF · OpenSearch · QuickSight · Textract — your OIT's choice."*

**Time** ~3:00.

**Speech**
> *(Thesis)*
> **AI isn't a feature of this system. It is the system. Take it out and you've got a database with forms.**
>
> Two pieces of independent research frame this.
>
> **One — IDC's Global DataSphere tracks enterprise unstructured data growing at double-digit CAGR through the late 2020s.** That curve is hitting every public-records office in the country. **You can't hire your way out of it — AI is non-optional.** That part is settled.
>
> **Two — what's not settled is how to put AI into a regulated workflow safely.** The authoritative reference is **NIST's AI Risk Management Framework — AI RMF 1.0**, January 2023. Four trustworthiness controls: **bounded outputs, uncertainty quantification with human escalation, traceability, and accountability.** Each component in our stack maps to one of those controls.
>
> - **Bounded outputs.** **Bedrock Claude Sonnet with the `tool_use` pattern.** Returns JSON matching our schema. **Hallucination is bounded by design.**
> - **Uncertainty + human escalation.** **Confidence threshold 0.85** — above, auto-classify; below, the record routes to a human review queue.
> - **Traceability.** **Bedrock Claude Vision** for OCR — native PDFs up to ~100 pages with handwriting. **Titan Embeddings v2 + pgvector + tsvector + pg_trgm** — sub-second across four search modes, every result traces to source page.
> - **Accountability.** **EventBridge cron with 90 / 30 / 7-day alert windows**, plus an **append-only audit log the database itself refuses to update or delete.**
>
> The claim isn't *trust us, we built it well.* The claim is **every AI control here maps to a federally-published framework — and to your RFP's encryption, identity, and audit requirements.** It integrates where your RFP requires — **Microsoft 365, SharePoint, Dropbox, your CRM, ArchivesSpace** — through documented APIs. **Libsafe stays your digital-preservation layer.** We hand long-term preservation to it, we don't replace it.
>
> ---
>
> One number for the **cost-evaluation side of the panel**, the one to write down: **180% average ROI inside fourteen months** across our SMB and mid-market work.
>
> **Fact:** every one of those clients faced the same trade-off — accuracy vs. speed vs. cost. **Action:** we deployed exactly the stack you'll see today — Bedrock, Lambda, Step Functions, CDK. **Result:** the trade-off dissolved. **30 to 50% lower cost** through serverless economics. **40% faster time-to-value** through reusable CDK accelerators.
>
> What this means for your **fixed-price commitment across the initial period and both renewal options:** the serverless architecture scales **with usage, not with seat count or per-record license fees.** Infrastructure cost grows on a known curve, and **we absorb that risk inside our fixed price.**
>
> ---
>
> *(Slow down here — Pass/Fail #1, verbatim, in one breath:)*
>
> > **Two U.S. storage regions, more than 500 miles apart, assignable by AIP, live Day 1.**
>
> That is not production hardening. **That is exactly how we satisfy your Pass/Fail #1 eligibility requirement.**
>
> ---
>
> Everything else the RFP names — **migration as a phased workstream with the 90-day parallel run and physical re-tagging across the initial period of performance, the dedicated Project Manager, the online Help Topics database, the user community forum, three reference projects, production hardening upgrades like CloudFront/WAF and OpenSearch** — **all detailed in File 3 and File 4, all priced into the proposal.**

**Remember** Longest slide. Point at the boxes as you name them. Say the substitutions footer **out loud** — that's the "OIT's choice" signal.

### → DEMO MOMENT 3 — CLIMAX (browser, no slide, ~50 sec tour + 15 sec close)

**Route** 4-stop tour of the live system: `/dashboard` → `/analytics` → `/records` (list view) → `/search` (semantic-query a phrase that only exists in the OCR'd text from Demo 1).

**Speech**
> *[Stop 1 — Dashboard]* This is what your team sees first thing in the morning. **Total records. Pending dispositions. Open transfers. Overdue checkouts.** Real data, refreshed live. Records broken out by media type. Recent activity feed across the whole system. **One screen, one glance — the state of the Archives.**
>
> *[Stop 2 — Analytics]* Drill in. **Backlog trend over time. Throughput by archivist. Classification confidence distribution. Retention pipeline by year.** This is what leadership sees when you tell them *"the backlog shrank this year."* — the chart is right here.
>
> *[Stop 3 — Records list]* And here's the corpus itself. **Every record in the Archives, in one place** — searchable, filterable by series, by retention status, by media type, by location. The record we ingested a few minutes ago is already in here, **classified, indexed, retention-scheduled, audit-logged.** No archivist touched it. **And the provenance trail is intact** — every record carries its accession source, its series assignment, its custody history through every state change. **That's the line we hold: AI does the cognitive work, the archivist makes the appraisal and retention judgments.**
>
> *[Stop 4 — Search, semantic query]* And the proof it actually worked: I'll search for a phrase that only exists inside the document we uploaded earlier. **Sub-second. Found.** Across thirty years of holdings, **a 1923 handwritten letter is now as findable as today's email.**
>
> *(Close, flipping back to deck)*
> AI isn't the icing here. It's the cake. Without it, you've got a digital filing cabinet with the same bottleneck. With it — paired with human-in-loop review, a real migration plan, and trained archivists — you've got the only architecture that can close the gap. **That's the differentiation case.**

**Remember** Most important moment of the talk. **System tour, not single-feature demo.** If anything breaks → backup screencast B, narrate over it, **don't apologize**. **Hard rule: never promise auto-population of `location_code`, `series_title`, `disposition_date`, or TR number.** Those are archivist-on-review fields.

---

## CARD 6 — Conclusion

**On screen** Header: *"Same team. New tools. The backlog shrinks."* Three small cards in a row: **01 / Operational** — *The backlog can't be hired away.* · **02 / Compliance** — *Rules live in the code.* · **03 / Differentiation** — *AI is the architecture.* Bottom band: *"3–5× the throughput. Architectural headroom up to 10×. Full audit trail. Zero compliance lapses."*

**Time** ~1:30.

**Speech**
> Three things we showed you today.
>
> **One.** The backlog can't be hired away. AI takes out the linear bottleneck.
> **Two.** Compliance lives in the code, not in someone's memory. Legal hold, retention, FOAA response, accessibility, audit trail — enforced by the system.
> **Three.** AI is the architecture, not a feature — paired with human-in-loop review and a real migration plan.
>
> ---
>
> Same archivist team. No new hires. **Three to five times the throughput.** Architectural headroom up to ten. Full audit trail. Zero compliance lapses. **Above 95% accuracy. 85% faster processing. Payback inside fourteen months.** That's what our regulated-industry clients are seeing in production right now.
>
> ---
>
> Picture an archivist on your team six months from now. She walks in, opens her dashboard, and what she sees isn't a backlog — it's a **review queue.** A handful of records the AI flagged because confidence was below 85%. By lunch, she's cleared them. **Every other record from this week is already classified, indexed, retention-scheduled, and audit-logged — with a recommended location waiting for her sign-off — before she got to her desk.**
>
> Picture a citizen FOAA request that used to take three weeks, answered in **three hours** — because semantic search found the record across thirty years of holdings in under a second.
>
> Picture, at the end of next legislative session, the Archives team telling leadership: **the backlog shrank this year. For the first time in a decade.**
>
> That's what the system you just saw, deployed, does. **The only question is how fast you want it to start.**
>
> ---
>
> Thank you for the rigor of this RFP. **It would be a privilege to deliver this for the State of Maine.**

**Remember** Memorize the three "Picture …" beats — **don't read them**. Slow down on each. Let one sentence end before starting the next.

---

## CARD 7 — Questions?

**On screen** Full-bleed dark background. Single huge word: **Questions?** Subtitle: *"We're ready to go deep — on architecture, compliance, fixed-price scaling, migration, hallucination handling, anything you want."* Bottom: **HORUS TECHNOLOGY · Michael Walker · michael@horustech.dev**.

**Time** Slide remains up for the entire Q&A session.

**Speech**
> *(Final mission line, spoken slowly, then silence)*
> **Horus Technology builds enterprise-grade GenAI and document processing on AWS for organizations that can't afford to be wrong — and the State of Maine's records belong in exactly that category.** Thank you.
>
> ---
>
> *(After the pause)*
> I'll stop there. Happy to take questions — on WCAG, the build-and-maintain delivery model, fixed-price scaling, certifications, migration plan, hallucination handling, legal hold, FOAA, cross-region DR, Libsafe handoff, circulation overdue notices — anything you want to dig into.

**Remember** After the mission line: **pause, lift hand to invite, wait**. Whoever speaks first — usually Susan Verrier or OIT — sets the tone.

---

## Backup screencasts (only if a live demo fails)

- **Backup A** — 30-second screencast of Demo Moment 1. Triggered if Block 1 demo fails. Switch immediately, no announcement, narrate live. **Don't apologize.**
- **Backup B** — 60-second screencast of Demo Moment 3 (full 4-stop tour). Triggered if Block 3 climax fails. Same rule. **Test on the presenter laptop 24 hours before.**

---

## Pre-presentation checklist

- [ ] All 7 cards read aloud by Michael with timer — three full rehearsals.
- [ ] Card 4 (compliance) verified against final Appendix F submission — no drift.
- [ ] Card 5 (architecture) verified against the **deployed** system — every component in the demo route is reachable.
- [ ] Demo data on the live endpoint includes one real Maine public-domain record for Stop 3 of the climax tour (sourced from State Archives online catalog, pre-1950, FOAA-clean).
- [ ] Backup A and Backup B screencasts recorded **on the same laptop** that will present.
- [ ] Substitutions one-pager printed (leave-behind), in case the panel asks.

---

## Hard rules (do not break on stage)

- **Never** quote `$178/month`. That's an internal cost-modeling number, not a price.
- **Never** describe **500+ miles cross-region** as "production hardening" — it's **Pass/Fail #1**, Day 1.
- **Never** raise Pass/Fail #4 (Maine-resident support) unprompted — eligibility is already certified in Appendix C. If asked directly, deflect to written submission and Q&A prep Q2.
- **Never** say "we built this from scratch for you." Say "**our records-management product, configured for Maine, with the custom-maintain commitment Pass/Fail #3 requires**".
- **Never** promise auto-population of `location_code` / `series_title` / `disposition_date` / TR number. Those stay with the archivist on review.
- **Never** name a Horus client. Reference clients by **industry workload** only.
- **Never** quote a number you can't source on the next page if asked.

---

## Companion documents

- `aidlc-docs/presentation.md` — full spoken script, source of truth for wording.
- `aidlc-docs/presentation-marp.md` — Marp source for the slide deck (HTML/PDF/PPTX exports in `aidlc-docs/deck.*`).
- `aidlc-docs/demo-narrative.md` — strategic narrative behind this deck.