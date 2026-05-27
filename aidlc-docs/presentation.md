# Pre-Sale Presentation — Maine RMS

**Audience:** State of Maine, Department of Secretary of State, Maine State Archives — RFP evaluation panel.
**Speaker:** Horus Technology Solutions.
**Length:** 13–15 minutes spoken + 10 min Q&A.
**Strategy:** Steve Jobs structure — strongest blocks open and close. Pain → Compliance → AI differentiation. Promise stated, evidenced three ways, restated.
**Confidentiality:** all client deployments are under NDA. Reference clients by **industry workload** (Healthcare Medical Records, SMB Loan Processing, Rental Application Automation, Course Catalog Standardization, Insurance Claims Intake, Manufacturing PO Matching). Use **public-safe portfolio metrics only** (95%+ accuracy, 85% faster, 180% ROI in 14 months, 30–50% lower cost, 40% faster time-to-value).
**Voice:** spoken text below is written the way a person actually talks on stage — contractions, short sentences, conversational rhythm. Do not read it like a press release.
**RFP language alignment:** RFP repeatedly asks for "off-the-shelf cloud-based records management software." We position our product as **a turnkey RMS, ready on day one**, with the **custom-maintain commitment Pass/Fail #3 requires** — never as a one-off custom build. Wording matters here; "we'll build you something" is a disqualification signal.

---

## Argument theory we apply (1+1 formula — minimum two arguments per thesis)

Three argument types, ordered from least to most persuasive for a broad audience (the "three concentric circles" — scientific is the core, practical wraps it, visual reaches the broadest audience):

- **Scientific / professional** — independent research, statistics, citations to authoritative standards (NARA, AIIM, IDC, NIST, HIPAA / SOC 2, AWS Well-Architected). **Must contain a clear numeric figure.** Most persuasive to specialists.
- **Practical** — a story from real-world experience, structured as **fact → action → result**.
- **Visual / emotional** — anchors the thesis in a **well-known person or event** the audience already recognizes. Most effective for a broad audience. A good visual argument always has a scientific finding underneath it.

**Quality checklist (apply to every argument):**

1. **Verifiable** — backed by a source we can actually cite, not a plausible-sounding number.
2. **Past tense, concrete result** — about something that has already happened.
3. **Unique or new** — common knowledge does not persuade. Steve Jobs / Enron / 2008 crash are over-used; reach for less obvious anchors when possible.
4. **1+1 formula** — at least two arguments per thesis.
5. **Audience-fit** — for this panel: backlog, compliance, audit, FOAA, accessibility, migration risk, fixed-price discipline.
6. **No magic-bullet framing** — disclose what else made the result possible (human-in-loop, change management, migration plan).
7. **Independent source** — the speaker can't be the only source about themselves.

**Live demonstration is not a visual argument.** Live demos sit *after* the rhetorical arguments in each block as confirmation, not as a third argument.

---

## Hard rules for this specific RFP (do not violate on stage)

- **Never** say "we built this from scratch for you." Always say "**this is our records-management product, configured for Maine.**"
- **Never** quote `$178 / month` on stage. That's the AWS infrastructure burn rate of the PoC environment, not a price quote. Quoting it sets the wrong expectation against a fixed-price contract that spans the initial period plus two renewal options.
- **Never** describe **500+ miles cross-region storage** as "production hardening." It is **Pass/Fail #1**, mandatory Day 1.
- **Never** describe our support model with phrasing that implies "remote-only." **Pass/Fail #4 requires support within the State of Maine.** Until that clause is clarified with the RFP Coordinator (Susan Verrier, by 16 April), say "**24/7 distributed managed support, with a Maine-resident support presence as required by Pass/Fail #4.**"
- **Always** acknowledge migration as a phased workstream — 90-day parallel-run + extended physical re-tagging, not "done in 90 days."
- **Always** name at least three of: ArchivesSpace, Libsafe, SAML / OIDC, agency self-service portal, transmittal, barcode / RFID, circulation check-in/check-out + overdue notices, 3 warehouse locations, 8-digit location code, box-label fields (Container, Umbrella, Series Title, Dispo date, TR #) — somewhere in the spoken text. The panel needs to hear that we read their RFP, not just searched for "records management" on Google.
- **Always** name the third-party audit baseline (FedRAMP / ISO/IEC 27001 / SOC 2 Type II — all three accepted by your RFP), FIPS-validated KMS, and NIST media-sanitization on termination when compliance is being defended.
- **Never** cite a number whose source we cannot show on the next page if asked.
- **Never** quote a multiplier above what we have actually shipped. **3–5×** is the shipped evidence; **10×** is the architectural ceiling, presented as such.

---

## INTRO (~3 minutes)

### 1. Greeting + who we are (50 seconds)

> Good morning. I'm **[Presenter]** with **Horus Technology Solutions**. We're an **AWS Advanced Partner** and an **Anthropic Partner**, based in San Diego. About twelve engineers, fully distributed, all AWS-certified. Twenty-six active certifications across the team.
>
> What we do is narrow. We build **document-processing software with AI on AWS**, mostly for clients who can't afford to be wrong — healthcare, financial services, insurance, education. The numbers we see across our portfolio, on average: **above 95% accuracy, 85% faster processing, payback inside fourteen months.**
>
> One operational note for a State of Maine engagement: we run **24/7 distributed managed support for the users of the systems we build**. To meet **Pass/Fail #4**, **we will stand up a Maine-resident support presence** for in-state response — paired with that 24/7 coverage. That's the model we propose for Maine archivists, agency records officers, and citizen-facing portal users.

### 2. The topic (25 seconds)

> Today is about your **Records Management System**. We're showing you our **records-management product, running on AWS, configured against your RFP** — live, in a few minutes.
>
> Pass/Fail #3 in your eligibility section asks the bidder to commit to **initial customizations and ongoing code maintenance** to keep up with Maine records-management law. **We commit to that.** It's the delivery model we already use with our regulated-industry clients — the product ships turnkey, and we own the law-driven changes for the life of the contract.

### 3. The promise (45 seconds — the line you want them to remember)

> Here's what we're asking you to evaluate.
>
> **Same archivist team. No new hires. Three to five times the throughput, with architectural headroom up to ten. Full audit trail. Zero compliance lapses.**
>
> We're not replacing your archivists. We're taking the boring part of their job — typing in metadata, retention math, hunting through binders — and giving them back the part that actually needs a human brain.

### 4. Why this matters now (50 seconds — sets up Block 1)

> One fact about Maine State Archives that frames everything else:
>
> > **You're getting more records every week today than you used to get in a month, ten years ago.** And in those same ten years, **the archivist team hasn't grown.**
>
> You can't hire your way out of that. So that's what the next twelve minutes are about. Three pieces: **the operational gap, the compliance exposure, and the AI that closes both.**

---

## MAIN BLOCK 1 — Operational: The Math Doesn't Work (~3 minutes)

### Thesis
**You can't keep up with exponential record volume by hiring linearly. The only thing that scales is AI doing the cognitive work, while humans make the decisions.**

### Argument 1 — Practical (portfolio, fact → action → result)
> Concrete example. One of our healthcare clients — call it the **Healthcare Medical Records workload**, since they're under NDA. **Fact:** patient-records intake rising every quarter, headcount frozen. **Action:** we put a Bedrock pipeline in front of intake — every document classified, extracted, routed automatically; humans only saw what AI was unsure about. **Result: 80% reduction in processing time, with the same team.** We have similar shipped numbers in lending, rental processing, and education — happy to walk through any of them in Q&A.
>
> One honesty point: this is not a magic pill. In every one of those engagements, three things ran in parallel — the AI pipeline, **a human-in-the-loop review queue for low-confidence cases**, and **a change-management plan for the staff whose work was changing.** All three matter. We've costed all three into the Maine proposal.

### Argument 2 — Visual / emotional (familiar event, archives-relevant)
> Think about **NARA — the National Archives and Records Administration — in the 2010s.** They were facing the same curve: incoming federal records growing faster than archivist capacity, and a congressionally mandated **transition to fully electronic records by 2022**. Their answer was not to hire thousands of new archivists. It was the **Electronic Records Archives initiative** — automating intake, classification, and preservation. NARA didn't replace its workforce. **It built tooling that kept pace with the curve.** That's the same kind of move we're proposing for Maine.

### Demonstration — empirical proof (live, ~30 seconds)
> *[Live demo: Records List → Upload one record → AI auto-classifies in seconds]*
>
> One document. Classified, tagged, indexed, embedded, routed for review — under thirty seconds. Nobody on your team typed a field. **Multiply that by the boxes in your three warehouse locations.**

### Block 1 Conclusion
> The backlog doesn't shrink because you hire more people. It shrinks when classification stops being a person's job. **That's the operational case.**

---

## MAIN BLOCK 2 — Compliance: Every Unprocessed Record Is Risk (~3 minutes)

### Thesis
**A record that isn't classified, isn't on a retention schedule, and can't be found is a liability. The system has to enforce the rules — you can't lean on archivist memory.**

### Argument 1 — Scientific (numeric, frameworks, RFP-specific)
> Three regulatory pressures hit a state archive at the same time. **Records disposition schedules** — every record on a schedule. **FOAA — Maine's Freedom of Access Act** — statutory response windows. **Legal hold** — modification has to stop instantly when litigation lands. Get any one of those wrong, and it shows up in public.
>
> Your RFP names the controls. We meet them. **Encryption — TLS 1.3 in transit, AES-256 at rest, FIPS-validated KMS.** **Identity — SAML 2.0 or OpenID Connect against your Active Directory, role-based access, MFA, State-standard session timeouts.** **Audit — every change appended to an immutable log, exportable to your SIEM.**
>
> On the third-party audit side, your RFP accepts three options. **We bring all three** — FedRAMP, ISO 27001, and SOC 2 Type II — through AWS shared-responsibility reports. On contract termination, State data is returned and securely destroyed to **NIST media-sanitization standards**. Backup and continuity plans conform to your **OIT** policies.
>
> And one more bar specifically for the State of Maine — **accessibility**. **WCAG 2.1 Level AA**, designed in from day one. Keyboard navigation, screen-reader semantics, color contrast. Because for a public-records system, **a citizen who can't use the interface is a citizen the State has failed.**

### Argument 2 — Practical (portfolio, fact → action → result)
> Concrete example. One of our financial-services clients — **SMB Loan Processing workload** — was heading into a regulator audit, and their legal-hold list lived on a spreadsheet. **Action:** we put legal hold and audit logging into the API and the database itself. Once a record is on hold, you literally cannot modify it — the data layer refuses. **Result:** their next audit closed with **zero findings on document handling**, and audit-response time dropped from weeks to hours. That same enforcement pattern is in the system you'll see in a moment, **including the agency self-service portal where a records officer can accession boxes, submit reference requests, and place a legal hold from their own desk** — and **circulation tracking with check-in, check-out, custody history, and automated overdue notices** for records that move between your three warehouse locations.

### Demonstration — empirical proof (live, ~30 seconds)
> *[Live demo: Records detail → toggle Legal Hold → attempt disposition → system blocks → audit trail shows the blocked attempt]*
>
> The system refused. The refusal is logged. The user is logged. Five years from now, that line of audit history is the defense. **Compliance is the default — not the discipline.**

### Block 2 Conclusion
> Every unprocessed record is risk. This system turns risk into routine, because the rules live in the code, not in someone's head. **That's the compliance case.**

---

## MAIN BLOCK 3 — AI: A Database vs. a System That Thinks (~4 minutes)

### Thesis
**AI isn't a feature of this system. It is the system. Take it out and you've got a database with forms. Leave it in and you've got a workforce multiplier — provided the human-in-loop, the migration plan, and the change-management plan are also in place.**

### Argument 1 — Scientific (numeric, named components)
> Each AI piece is named, defended, and bounded:
>
> - **Classification — Bedrock Claude Sonnet with the `tool_use` pattern.** Returns JSON matching our schema. **Confidence threshold of 0.85** — above, auto-classify; below, the record goes to a human review queue. **Hallucination is bounded by design.**
> - **OCR — Bedrock Claude Vision.** Native PDF up to ~100 pages including handwriting. Replaces the Textract + cleanup pipeline.
> - **Search — Titan Embeddings v2 + pgvector for semantic, plus tsvector and pg_trgm for full-text.** Inside Postgres. Sub-second response, four search modes.
> - **Retention — EventBridge cron with 90 / 30 / 7-day alert windows.** Disposition dates calculated on classification.
>
> Every piece is replaceable, defensible, documented. **The architecture is not a black box.** And it integrates where your RFP requires — **Microsoft 365, SharePoint, Dropbox, your CRM, ArchivesSpace** — through documented APIs, not screen-scraping. **Libsafe stays your digital-preservation layer.** We hand long-term preservation to it, we don't replace it.

### Argument 2 — Practical (portfolio ROI + fixed-price discipline)
> One number for the procurement and finance side of your panel: **180% average ROI inside fourteen months** across our SMB and mid-market work — driven by **30 to 50% lower cost** through serverless economics, and **40% faster time-to-value** because of our reusable CDK accelerators.
>
> **Fact:** every one of those clients faced the same trade-off — accuracy vs. speed vs. cost. **Action:** we deployed exactly the stack you'll see today — Bedrock, Lambda, Step Functions, CDK. **Result:** the trade-off dissolved.
>
> One word on what this means for your **fixed-price commitment across the initial period and both renewal options.** The serverless architecture scales **with usage, not with seat count or per-record license fees.** As Maine's record volume grows, **infrastructure cost grows on a known curve, and we absorb that risk inside our fixed price.** And to be precise on Pass/Fail #1: **two U.S. storage regions, more than 500 miles apart, are configured Day 1 — that is not production hardening, that is how we satisfy your eligibility requirement.** Other production controls — CloudFront with WAF, the OpenSearch promotion path, QuickSight reporting — are configuration, not redesign, and are priced into the proposal.
>
> And one more honest piece: **migration from your current system is a phased workstream**, not an afterthought. We've done it six times for similar regulated migrations. The first **90 days are a parallel-run workstream** — we mirror your existing index and run both systems side-by-side at go-live; **physical re-tagging and verification across your three warehouses continues across the initial period of performance**, on a schedule we agree with your archivists. It is fully scoped in our cost proposal.

### Demonstration — empirical proof (live, ~45 seconds — the climax)
> *[Live demo: drag a real, messy, handwritten Maine archives sample document onto the upload area; watch Bedrock Vision extract → Sonnet classify → Titan embed → record appears with full box-label fields populated, retention calculated, audit logged, transmittal-ready, barcode-ready; flip to dashboard tile showing the new record landing in the real-time backlog metric]*
>
> One drag. Twenty seconds. The document is classified, tagged, semantically searchable, audit-logged. **Box-label fields populated automatically — 8-digit location, Series Title, Dispo date, TR number** — the rest of the label is on screen too. Transmittal-ready, barcode-ready, RFID-ready. **And on the dashboard, the real-time analytics tile already counts it.** Nobody typed a single field.

### Block 3 Conclusion
> AI isn't the icing here. It's the cake. Without it, you've got a digital filing cabinet with the same bottleneck. With it — paired with human-in-loop review, a real migration plan, and trained archivists — you've got the only architecture that can close the gap between record volume and archivist capacity. **That's the differentiation case.**

---

## CONCLUSION (~2 minutes)

### 1. Restate the three cases (30 seconds)
> Three things we showed you today.
>
> **One.** The backlog can't be hired away. AI takes out the linear bottleneck.
> **Two.** Compliance lives in the code, not in someone's memory. Legal hold, retention, FOAA response, accessibility, audit trail — enforced by the system.
> **Three.** AI is the architecture, not a feature — paired with human-in-loop review and a real migration plan.

### 2. Restate the promise (20 seconds — verbatim from intro)
> Same archivist team. No new hires. **Three to five times the throughput.** Architectural headroom up to ten. Full audit trail. Zero compliance lapses. **Above 95% accuracy. 85% faster processing. Payback inside fourteen months.** That's what our regulated-industry clients are seeing in production right now.

### 3. Indirect call to action (45 seconds)
> Picture an archivist on your team six months from now. She walks in, opens her dashboard, and what she sees isn't a backlog — it's a **review queue.** A handful of records the AI flagged because confidence was below 85%. By lunch, she's cleared them. **Every other record from this week is already classified, indexed, retention-scheduled, audit-logged, located in its warehouse bay — before she got to her desk.**
>
> Picture a citizen FOAA request that used to take three weeks, answered in **three hours** — because semantic search found the record across thirty years of holdings in under a second.
>
> Picture, at the end of next legislative session, the Archives team telling leadership: **the backlog shrank this year. For the first time in a decade.**
>
> That's what the system you just saw, deployed, does. **The only question is how fast you want it to start.**

### 4. Acknowledgment + thanks (15 seconds)
> Thank you for the rigor of this RFP. It is the most thorough records-management spec we have responded to this year. **It would be a privilege to deliver this for the State of Maine.**

### 5. Q&A handoff (10 seconds)
> I'll stop there. Happy to take questions — on the Pass/Fail support clause, WCAG, the build-and-maintain delivery model, fixed-price scaling, certifications, migration plan, hallucination handling, legal hold, FOAA, cross-region DR, Libsafe handoff, circulation overdue notices, anything you want to dig into.

---

## Restated mission (final beat)

> **Horus Technology Solutions builds enterprise-grade GenAI and document processing on AWS for organizations that can't afford to be wrong — and the State of Maine's records belong in exactly that category.** Thank you.

---

## Speaker notes

### Pacing target — 12–13 minutes spoken (well inside the 13–15 min envelope)
- **Intro: 2:30.** Cut "Why this matters now" first if running long — the headline returns in Block 1.
- **Block 1: 2:30.** Two arguments + demo. Foundation; don't rush.
- **Block 2: 3:00.** Argument 1 has **three breath-pauses** (encryption / identity / audit → audit reports → accessibility). Don't read it as one paragraph.
- **Block 3: 3:30.** Two arguments + climax demo. End strong; save energy for the live AI extraction.
- **Conclusion: 1:30.** Memorize the indirect CTA — don't read it.
- **Buffer: ~1 min.** Q&A starts after the final beat.

### Three rhetorical anchors
- **Repetition of the headline** — "more records every week than a month ten years ago, archivist team hasn't grown" appears in Intro, Block 1, and Conclusion.
- **Rule of three** — three pains, three blocks, three numbers in ROI, three "picture" beats in the indirect CTA. Two arguments per thesis (1+1 floor), with the live demo as empirical confirmation.
- **Promise → evidence → promise** — "**3–5× shipped, 10× ceiling**" is stated in Intro, demonstrated in every block, repeated in Conclusion.

### Sources we will cite if asked (do not invent on stage)
- **IDC Global DataSphere** — annual report. Quote in plural ("double-digit CAGR"); never quote a single number unless the report is open in front of you.
- **Council of State Archivists (COSHRC) annual reports** — staffing trend.
- **NARA Electronic Records Archives initiative** + **2022 fully-electronic-records mandate (M-19-21 / M-23-07)** — Block 1 visual argument.
- **AWS shared-responsibility audit reports — FedRAMP, ISO/IEC 27001, SOC 2 Type II** — Block 2 compliance baseline (all three options your RFP lists).
- **NIST SP 800-88 — Media Sanitization** — for the termination clause.
- **Maine OIT policies — DigitalAccessibilityPolicy, WebStandards, BackUpRecoveryProcedures, BusinessContinuityDisasterRecoveryPolicy** — for Block 2 conformance language.
- Anything else — say "I don't have the source for that handy; I'll send it after the session." **Never** invent a percentage live.

### What to do if a live demo fails
- **Block 1 demo** — fall back to Records List + verbal walkthrough. Don't apologize.
- **Block 2 demo** — fall back to the audit-trail page (read-only).
- **Block 3 demo** — climax. Have a **30-second pre-recorded screencast** queued up.

### What NOT to say
- "It's just a prototype." → "**working PoC running on AWS**".
- "We'll build it from scratch for you." → "**our records-management product, configured for Maine, with the custom-maintain commitment Pass/Fail #3 requires**".
- "**$178 a month.**" → never quote on stage. Internal cost-modeling number only.
- "Fully remote support" → **trips Pass/Fail #4.** Say "**24/7 distributed managed support with a Maine-resident support presence**".
- "Production hardening — 500+ miles cross-region" → **trips Pass/Fail #1 framing.** Say "**Day 1, satisfies Pass/Fail #1**".
- "**Five to ten times more records**" without context → say "**three to five times shipped, ten times architectural ceiling**".
- "**Fixed-price contract through 2031**" → say "**initial period plus both renewal options**".
- "**CFO in the room**" → say "**procurement and finance side of your panel**".
- Apologize for substitutions (Bedrock Vision instead of Textract). → "These are upgrades", owned in the substitutions slide.
- Name a specific Horus client. → industry-workload reference only.
- Quote a number you cannot source. → see the sources list above.

### Companion documents
- `aidlc-docs/demo-narrative.md` — the narrative this presentation operationalizes.
- `aidlc-docs/audit-2026-05-27.md` — code-vs-RFP evidence file.
- `aidlc-docs/dev-fixes-for-demo.md` — pre-demo developer task list. Tasks 1, 5, 6, 7 must merge before delivery.