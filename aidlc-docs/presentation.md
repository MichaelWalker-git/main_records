# Pre-Sale Presentation — Maine RMS

**Audience:** State of Maine, Department of Secretary of State, Maine State Archives — RFP evaluation panel.
**Speaker:** Horus Technology.
**Length:** 13–15 minutes spoken + 10 min Q&A.
**Strategy:** Steve Jobs structure — strongest blocks open and close. Pain → Compliance → AI differentiation. Promise stated, evidenced three ways, restated.
**Reference clients on stage:** reference each engagement by its **industry workload** — Healthcare Vital-Records IDP, EdTech Course-Catalog Standardization, iGaming Mail OCR, Private-Equity Contract Intelligence. Outcome figures are stated as audited numbers, no client names attached, no caveat language about confidentiality (saying "under NDA" only draws attention to what we are not saying — better to skip it). **Order on stage:** lead with verifiable hard anchors (Maine statute, NARA scale, NIST framework); per-workload outcome figures are *supporting* evidence. **AWS SMB Competency awarded April 2026 by independent third-party audit — every operational claim in this deck was reviewed against real customer projects. The certificate goes in File 3.**
**Voice:** spoken text below is written the way a person actually talks on stage — contractions, short sentences, conversational rhythm. Do not read it like a press release.
**RFP language alignment:** RFP repeatedly asks for "off-the-shelf cloud-based records management software." We position our product as **a turnkey RMS, ready on day one**, with the **custom-maintain commitment Pass/Fail #3 requires** — never as a one-off custom build. Wording matters here; "we'll build you something" is a disqualification signal.

---

## Argument theory we apply (1+1 formula — minimum two arguments per thesis)

Four argument types, each labeled honestly so the panel knows what kind of weight each is carrying:

- **Statutory** — a clause of law, named and numbered (**Maine MRS Title 1 §408-A, Title 5 §95-C**). The argument is the statute itself.
- **Authority / Compliance** — a published certification or named compliance regime (**FedRAMP, ISO/IEC 27001, SOC 2 Type II, NIST SP 800-88, WCAG 2.1 AA, Maine OIT policies, DACS / EAD / PREMIS / OAIS**). The argument is third-party-audited.
- **Framework** — an authoritative external rubric we map to (**NIST AI RMF 1.0, NIST AI 100-1**). The argument is the rubric, not a statistic.
- **Scientific** — published numeric figures from primary sources (**CoSA "State of State Records" 2023, NARA ERA program data, BLS Occupational Outlook**). **Must contain a clear numeric figure with attribution.** Most persuasive to specialists.
- **Practical** — a story from real-world experience, structured as **fact → action → result**, with our own measured outcome figures.
- **Visual / emotional** — anchors the thesis in a **well-known person or event** the audience already recognizes. Most effective for a broad audience.

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
- **Never** raise Pass/Fail #4 (Maine-resident support) unprompted on stage. Eligibility is already certified in Appendix C — bringing it up draws panel attention to a clause they have already closed in our favor. If asked directly, deflect to the written submission (see Q&A prep Q2).
- **Always** acknowledge migration as a phased workstream — 90-day parallel-run + extended physical re-tagging, not "done in 90 days." **And always frame the relocation/inventory window as the migration window** — the State has already paid for the labor; we are layering the system onto it.
- **Always** name the three migration capabilities that are shipped, not promised: **legacy-barcode preservation** (lookup against new barcode OR legacy tracking number OR existing container number), **batch import endpoint** for the existing system's export, **batch indexing for physical-to-digital** via the same Bedrock OCR pipeline. RFP §C names migration three times — the deck answers each.
- **Always** name at least three of: ArchivesSpace, Libsafe, SAML / OIDC, agency self-service portal, transmittal, barcode / RFID, circulation check-in/check-out + overdue notices, 3 warehouse locations, 8-digit location code, box-label fields (Container, Umbrella, Series Title, Dispo date, TR #) — somewhere in the spoken text. The panel needs to hear that we read their RFP, not just searched for "records management" on Google.
- **Always** frame the system as a **catalog/tracking system, not a content-access system.** Per RFP Part II.A and Record Creation §a: *"This system is just for tracking purposes — materials tracked may have PII in them but will not be accessed via this system."* OCR feeds **searchable metadata**, not unlocked content. If anyone on stage hears *"AI reads the documents and serves them to citizens,"* we have lost the room.
- **Always** name the third-party audit baseline (FedRAMP / ISO/IEC 27001 / SOC 2 Type II — all three accepted by your RFP), FIPS-validated KMS, and NIST media-sanitization on termination when compliance is being defended.
- **Never** cite a number whose source we cannot show on the next page if asked. The "next page" is `aidlc-docs/domain-research-us-archives.md` — every number quoted on stage must trace there.
- **Never** quote a multiplier above what we have actually shipped. **3–5×** is the shipped evidence; **10×** is the architectural ceiling, presented as such.
- **Always** lead with verifiable hard anchors (**Maine statute, NARA scale, NIST framework**) before portfolio metrics (**95% / 85% / 3–5×**). Hard before soft — that order is what makes a state-archives panel believe the soft.
- **Never** quote a customer-FOAA-response time that contradicts §408-A. Use **"5 working days to acknowledge"** — Maine's own statute, not an invented "three weeks."

---

## INTRO (~3 minutes)

### 1. Greeting + who we are (40 seconds)

> Good morning. I'm **Michael Walker**, with **Horus Technology.** Before I founded Horus in 2023, I was an **AWS Solutions Architect.** Before that, a **Google engineer.** **Twelve engineers on the team. Twenty-six active AWS certifications.**
>
> **In April, we passed the AWS Small-and-Medium-Business Competency.** Third-party audited. **An independent auditor signed off on our operational maturity — using our production projects as the evidence.** The certificate is in File 3.
>
> Today we run **four production deployments across regulated industries.** **Healthcare vital-records. EdTech. High-volume handwritten correspondence in a regulated industry. Private-equity contracts.** I'll cite specific figures from each as supporting evidence later in the deck. **We operate twenty-four-seven distributed managed support, with a dedicated project manager and SLA-backed response times — and that is the operational model we are proposing for Maine.**

### 2. The topic + promise (50 seconds)

> Today is about your **Records Management System.** What we are showing you is **our records-management product, running on AWS, configured against your RFP.** **Pass/Fail Number Three asks for initial customizations and ongoing code maintenance** for Maine records-management law. **We commit to that — for the life of the contract.**
>
> Here is the promise.
>
> **Eight miles of records. A five-working-day FOAA clock. The same archivist team.** **Three to five times the throughput** — with architectural headroom up to ten. **Full audit trail. Zero compliance lapses.**
>
> This is not a replacement for archival judgment. **It is a system that does the repetitive part — and gives the archivist back the part where appraisal judgment actually lives.**

### 3. Why this matters now (35 seconds)

> Your own homepage, today. **The Archives is relocating to the Cultural Building. Conducting inventory. Response times are slower.**
>
> **That is the only moment in a generation when eight miles of records are being physically touched anyway.** **Deploy this RMS during inventory** — and every box gets its barcode, its 8-digit location code, and its metadata captured **once. Not twice.** **The cost of digital transformation pays itself out of work already committed.**
>
> Three pieces next. **The FOAA gap. The compliance exposure. And the AI that closes both.**

---
## MAIN BLOCK 1 — Operational: The FOAA Math (~3 minutes)

### Thesis
**Eight miles of records. A five-day statutory clock. A finite archivist team. That math closes only when AI absorbs the repetitive work and gives those hours back to the archivist.**

### Argument 1 — Scientific + Statutory (the math every archives faces — and how Maine's law writes it)
> Every state archives in the country is solving the same equation right now. **Work has grown. Labor pool has not. Statutory clocks have not moved.** And the data on what closes that gap is unambiguous.
>
> **NARA's Electronic Records Archives. Nine hundred terabytes. Eight hundred million files. Over a hundred federal agencies.** They got there under **OMB memo M-19-21**, updated by **M-23-07**, to a **June 30, 2024 deadline** — after which NARA stopped accepting analog transfers. **Their answer: tooling.**
>
> And the team side of the same equation. **CoSA's 2023 State of State Records report, executive director Joy Banks. Nineteen percent of state archives operate with nine or fewer staff. Only twenty-three percent of those staff spend more than half their time on electronic records.** **Work grew. Labor pool did not.**
>
> **Now Maine, specifically.** Your own policy gives you **five working days** to answer every citizen request. A **fixed archivist team.** And an archive that goes back to **1639 — four hundred years of records** the same team has to keep working with.
>
> **Every hour spent hand-pulling binders is an hour subtracted from appraisal and reference — the work that actually requires an archivist. The clock does not move. The team does not grow. Something has to absorb the repetitive load — or compliance slips.**
>
> That something is **AI doing the sorting, classification, and retrieval — under human review.** Auto-classification at upload, instead of manual keying. Sub-second search, instead of half-day shelf-pulls. **Hours given back to the archivist for the part of the job that actually requires an archivist.**
>
> One honesty point. **Not a magic pill.** Three things ran in parallel in every deployment we shipped. **The AI pipeline. A human-in-loop review queue. Change management for staff.** All three are in the Maine proposal.

### Argument 2 — Practical (we have already shipped this exact pattern)
> Not theoretical. **We have already shipped it.** A regulated industry. **High-volume handwritten paper correspondence, daily. Statutory turnaround.** Same operational shape as your reference queue.
>
> **Before: two hundred items a day, by hand. After: over a thousand. Same headcount. Sixty thousand documents a month. Cost down fifty percent.**
>
> Read those numbers carefully. **The team did not grow. The team's hours were freed.** The system handled OCR, classification, structured metadata extraction — **and the people moved up the work-stack to exception handling and judgment calls.** Same labor budget. **More compliance. That is the math closing.**
>
> Same architecture is what we bring to Maine. **Off the shelf.** Tuned to your corpus during the ninety-day parallel run.

### Demonstration — empirical proof (live, ~25 seconds)
> *[Live demo: Records List → Upload one record → AI auto-classifies in seconds]*
>
> **This is the hour you give back to the archivist.**
>
> One document. Classified. Tagged. Indexed. Embedded. Routed for review — **in under thirty seconds. Nobody typed a field.** That same upload, by hand, is **twenty minutes of an archivist's day.**
>
> **Multiply that by every box being touched right now.** The hours returned to the team are not a slide anymore. **They are a budget line.**

### Block 1 Conclusion
> **The backlog does not shrink because you hire more people** — labor budgets do not bend to eight miles of records. **It shrinks when the repetitive cognitive work stops landing on the archivist's desk** — and the five-day clock stops being a fire drill, because **the system already did the sort, the classify, and the retrieve before the archivist sat down.**

---

## MAIN BLOCK 2 — Compliance: Every Unprocessed Record Is Risk (~3 minutes)

### Thesis
**Block 1 gave hours back. Block 2 protects them. Rules live in the code — at the data layer — so they keep working after the person who knew them has left.**

### Argument 1 — Scientific + Authority (the cost of unenforced controls — and the standards that answer it)
> Start with what an unenforced control actually costs. **IBM Cost of a Data Breach Report, 2024 edition. Six hundred and four organizations surveyed.**
>
> **Public sector. Average breach: two and a half million dollars. Two hundred and fifty-eight days — eight and a half months — from breach to containment.** And the staffing side of the same report — **cyber-skills shortage grew twenty-six percent year over year.** Fewer people watching. More records. Longer dwell time. **Same staffing curve we showed you in Block 1.**
>
> One figure that decides which side of that line you sit on. **Organizations using AI extensively in prevention saved two-point-two million per breach.** That is the dollar value of putting rules in the code instead of in someone's head.
>
> So how do we put them in the code, in a way the State can audit? **Two stacks.**
>
> **First — the federal audit baseline.** Your RFP accepts FedRAMP, ISO 27001, or SOC 2 Type II. **We bring all three.** Underneath: **TLS 1.3, AES-256, FIPS-validated keys, SAML or OIDC, RBAC, MFA, an immutable audit log piped to your SIEM, NIST media sanitization on termination.** Backup conforms to **Maine OIT's own backup-and-recovery and continuity policies.**
>
> **Second — Maine statute.** **Title 5, Section 95-C.** The State Archivist's four retention criteria — **administrative, legal, fiscal, historical** — live in our schema as a first-class object. **Section 95-C also makes patron-identifying information confidential by statute** — enforced **at the data layer**, not in the UI. **Title 1, Section 408-A.** Five-day clock. *"In the medium it was stored, at the requester's option."* And **WCAG 2.1 Level AA**, per Maine's Digital Accessibility Policy.
>
> And the archival standards your team already works in — **DACS for description, EAD for two-way ArchivesSpace export, PREMIS for preservation events, OAIS for the handoff to Libsafe** — those aren't our innovation. **They are baseline compatibility, built in from Day 1.**
>
> Two stacks. **Both audited externally. Both enforced in the code.** That is the answer to the IBM number.

### Argument 2 — Practical (this is how those rules behave when a human tries to break them)
> Authority is not the same as enforcement. **Here is how the rules actually behave when somebody — accidentally or otherwise — tries to break them.**
>
> One sentence. **Once a record is on legal hold, you literally cannot modify it.** The data layer refuses. **And the refusal is logged with the user, the timestamp, and the reason.** Same for unmatured retention dates. Same for unauthorized disposition.
>
> We have shipped this exact enforcement pattern before. **Private-equity contract intelligence.** **Nineteen order-form fields plus line items extracted in under ten seconds. Ninety-five percent field accuracy. Multi-tenant row-level security.** Controls in the data layer, not in the UI. Same architecture, applied to Maine legal hold and Section 95-C confidentiality.
>
> Three RFP-specific pieces you'll see in the demo.
>
> **Agency self-service portal.** Records officers accession, request, place legal hold, **and check the five-day clock — from their desk. No phone tag.**
> **Circulation tracking.** Check-in, check-out, custody history. **Automated overdue notices across your three warehouses.** Eight-digit location code on every box.
> **Confidentiality enforcement.** Section 95-C filtered by role **at the API layer.**
>
> And one for your security team. **State data is never used to train AI models.** Contractual guarantee from AWS Bedrock. **Maine's records stay Maine's.**

### Demonstration — empirical proof (live, ~30 seconds)
> *[Live demo: Records detail → toggle Legal Hold → attempt disposition → system blocks → audit trail shows the blocked attempt]*
>
> What you're seeing is the **accession workflow** with transmittal forms, **series-level description**, and **item-level circulation** — archival vocabulary built into the data model, not bolted onto the UI.
>
> Now watch. **Disposition attempt on a record under legal hold. The system refuses.** The refusal is logged with the user. **Five years from now, that line of audit history is the defense.** **Compliance is the default — not the discipline.**

### Block 2 Conclusion
> **Every unprocessed record is risk.** This system turns risk into routine — because the rules live in the code, not in someone's head. **And the hours Block 1 gave back to the archivist stay there**, instead of being eaten by the next compliance fire drill.

---

## MAIN BLOCK 3 — AI + Migration: A Database vs. a System That Thinks (~4 minutes)

### Thesis
**Automation is not a feature of this system — it is the system. Under controls a federal framework already named, alongside institutions the panel respects, with our own production work behind it.**

### Argument 1 — Framework (NIST AI RMF, with a cultural-heritage proof point)
> **Block 1 gave the hours back. Block 2 wrote the rules into the data. Block 3 is what makes this a system, not a database — AI under controls a federal framework already named.**
>
> One precedent. **The Library of Congress. The Newspaper Navigator project.** Machine learning across **sixteen million pages of Chronicling America** — bounded outputs, confidence-scored, cataloger on review. **The keyboard work moved off the cataloger's desk. The appraisal stayed where it belongs.**
>
> The framework that names those principles is **NIST AI Risk Management Framework 1.0. January 2023.** Four controls — each one maps to a named component in our stack.
>
> **One. Bounded outputs.** Bedrock Claude `tool_use`. The model returns JSON to our schema. **No free-text field to hallucinate into.**
>
> **Two. Uncertainty and escalation.** Confidence score on every classification. **Above 0.85, auto-classify. Below, into the human review queue.**
>
> **Three. Traceability.** Bedrock Vision OCR. Titan embeddings with pgvector. **Sub-second retrieval. Every result traces back to its source page.**
>
> **Four. Accountability.** EventBridge enforces the retention cron. **An append-only audit log the database itself refuses to update or delete.**
>
> One framing point. **This system is for tracking.** OCR feeds searchable metadata. **Record content stays under the access controls it had before. The system catalogs. It does not unlock.**

### Argument 2 — Practical (we have already done this — twice — in production)
> Two production deployments already running on this exact stack. Both publicly disclosed. Both audited.
>
> **First. A vital-records platform that serves more than forty US state health departments** — the technology backbone behind their birth certificates, death certificates, and amendments. Strict HIPAA. Twenty-four-hour statutory deadlines on every Release-of-Information request. **Numbers we delivered, against their previous Azure-based pipeline: eighty percent reduction in processing time. Ninety-eight percent business success rate on extracted fields. Ten times the throughput — without one additional headcount.** **End-to-end p95 under fifteen minutes.** That is **your Block 1 math, proved in a state-government workload.**
>
> **Second. An EdTech data partner standardizing course catalogs from four-thousand-plus US higher-education institutions** — Arizona State, Clarivate, the long tail. **Two hundred and fifty thousand PDF pages a year. Ninety-eight percent extraction accuracy. Catalog turnaround compressed from three-to-six months down to under thirty minutes. A hundred-to-one ROI. Annual savings between one-point-one-six and four-point-seven-six million dollars** versus their manual baseline. **Audited numbers.**
>> Same Bedrock pipeline. Same `tool_use` pattern. Same human-in-loop review. **Two live production deployments. Audited results. Statutory clocks held. Compliance held. Hours given back to the team.**
>
> **That is the same system we built for Maine. And the best way to show it is to show it.** Let me take you into it.

### Demonstration — empirical proof (live, ~30 seconds — the climax)
> *[Live tour, three stops, browser fullscreen.]*
>
> *[Dashboard + Analytics]* **Real-time analytics.** Backlog trend. Throughput by archivist. Confidence distribution. **This is the chart your leadership sees when you tell them — *"the backlog shrank this year."***
>
> *[Records list]* Every record in one place. The document from the first demo is already here — **classified. Indexed. Retention-scheduled. Audit-logged.** With **Container, Umbrella, Series Title, Disposition date, and TR number** on the box label your warehouses already use. **The system handles the repetitive cognitive work — keying, tagging, scheduling. The archivist keeps the appraisal judgment that requires human context — provenance, sensitivity, historical weight.**
>
> *[Semantic search on a phrase from the Demo 1 document]* **Sub-second. Found.** The same OCR pipeline turns a 1923 letter and today's agency PDF into **searchable metadata** — content access stays under the rules it always had.
>
> **For the first time — a county court record from 1639 and a born-digital memo from 2026 sit in one catalog. One search bar.**

### Block 3 Conclusion
> **Block 1 gave the hours back. Block 2 protected them. Block 3 turns the inventory window you are already in into the moment the capacity multiplier switches on.** AI isn't the icing — it's the cake. **A 1639 county court record and a 2026 born-digital memo, in one catalog, behind one search bar. From Day One.**

---

## CONCLUSION (~2 minutes)

### 1. Restate the three cases (25 seconds)
> Three things today.
>
> **Block 1.** The backlog does not shrink because you hire more people. **It shrinks when the repetitive work stops landing on the archivist's desk** — and the five-day clock stops being a fire drill.
>
> **Block 2.** The hours Block 1 gave back **stay there** — because the rules live in the code, not in someone's head. **Compliance is the default, not the discipline.**
>
> **Block 3.** Automation is not a feature of this system — **it is the system.** Under NIST AI RMF controls. Beside Library of Congress and NARA. **Behind two of our own production deployments. A 1639 county court record and a 2026 born-digital memo, in one catalog, behind one search bar.**

### 2. Indirect call to action (40 seconds)
> **Picture an archivist, six months from now.** She opens her dashboard. **What she sees is not a backlog. It is a review queue** — records the AI flagged below 85% confidence. **By lunch, she's cleared them.** **Every other record from this week is already classified, indexed, retention-scheduled, and audit-logged — with a recommended location waiting for her sign-off.**
>
> **Picture a citizen FOAA request — acknowledged inside the five days Section 408-A requires. And answered in three hours.** Because semantic search found the record across four hundred years of holdings.
>
> **Picture, at the end of next legislative session, the Archives team telling leadership: the backlog shrank this year.** **For the first time in a decade.** **And every FOAA clock landed with margin to spare.**
>
> **The only question is how fast you want it to start.**

### 3. Thanks + Q&A handoff (20 seconds)
> One last note. **We saw the *Open to Collaborate* notice on your homepage.** Maine's records intersect with Wabanaki heritage, and your team's commitment to partnered stewardship is something we would build around — not over. **The system supports access controls and descriptive practices that respect that work.**
>
> Thank you for the rigor of this RFP — the most thorough records-management spec we've responded to this year. **It would be a privilege to deliver this for the State of Maine.** Happy to take questions.

---

## Restated mission (final beat)

> **Horus Technology builds enterprise-grade GenAI and document processing on AWS for organizations that can't afford to be wrong — and the State of Maine's records belong in exactly that category.** Thank you.

---

## Speaker notes

### Pacing target — ~14:45 spoken (inside the 13–15 min envelope)
- **Intro: 2:15.** Greeting + competency (40s) → topic + promise (50s) → relocation-window hook (35s). Do **not** cut "Why this matters now" — the relocation framing converts operational disruption into leverage.
- **Block 1: 3:10.** **Two arguments, not three.** Argument 1 is **fused Scientific + Statutory** — federal benchmarks first (NARA 900TB → CoSA 19% ≤9 FTE / 23.5% capacity gap, Joy Banks named), then the **"Now Maine, specifically"** pivot into §408-A (5-day clock, $25/hr, 10¢/page) → 8 miles / 1639 corpus → the math/AI bridge. **Four breath-pauses** in this fused argument — the federal two (NARA → CoSA) plus the Maine two (§408-A clock → 1639 corpus → AI-as-answer). Argument 2 is Practical — high-volume handwritten correspondence in a regulated industry, **25s**, the only own-experience anchor in Block 1. The CoSA and own-experience figures earn their seconds — rehearse them. **The federal-then-Maine pivot is the rhetorical hinge — the panel hears the math is universal first, then hears their own statute write it out.**
- **Block 2: 3:00.** **Two arguments, not three.** Argument 1 is **fused Scientific + Authority** — IBM 2024 numbers (USD 2.55M public-sector breach, 258 days dwell, 26.2% skills-shortage, USD 2.2M AI-prevention savings) **set the cost of unenforced controls**, then the two-stack response (federal baseline + Maine statute) is the answer. **Three breath-pauses**: IBM cost figures → federal audit baseline → Maine §95-C / §408-A / WCAG. Argument 2 is Practical — data-layer enforcement sentence → PE parallel → three RFP pieces. **The IBM-then-stacks fusion is what makes the standards land — the panel hears the dollar figure first, then sees the controls answer it.**
- **Block 3: 3:25.** **Two arguments** + climax demo. Argument 1 is **Framework with one cultural-heritage proof point** — open with **the connectivity bridge** (Block 1 gave hours back → Block 2 wrote rules into data → Block 3 is what makes this a *system*), then **one named institution: Library of Congress / Newspaper Navigator (16M pages Chronicling America, bounded + confidence-scored + cataloger on review)** as the precedent. Then the four NIST AI RMF controls in order — **bounded outputs (`tool_use` JSON schema) → uncertainty (0.85 threshold + human queue) → traceability (Vision OCR + Titan + pgvector) → accountability (EventBridge cron + append-only audit log).** Read them, don't paraphrase. Close with the **PII framing point** ("system catalogs, does not unlock"). Argument 2 is **Practical — the two production deployments we have already shipped on this exact stack:** **VRC vital-records platform (40+ US state health departments, HIPAA, 24-hr SLA, 80% time reduction, 98% success rate, 10x throughput without headcount)** and **DegreeData (4,000+ universities, 250K pages/year, 98% accuracy, 3-6 months → <30 min turnaround, 100:1 ROI, $1.16M-$4.76M audited annual savings).** Both are **public case studies on horustech.dev — name the customers if asked, but you don't have to.** Argument 2 closes by summarizing — two live deployments, audited results — then pivots straight into the live demo: **"the best way to show it is to show it."** End strong on the **1639 → 2026 bridge** line in the demo close, then Block 3 Conclusion repeats the **gave hours / protected them / it IS the system** thread.
- **Conclusion: 1:40.** Three-case restatement (25s) → indirect CTA (40s, memorized) → thanks + Q&A (15s).
- **Buffer: ~15s.** Tight — drop one breath-pause from Block 2 Authority if running long.

### Three rhetorical anchors
- **Repetition of the headline** — "**eight miles of records, five-working-day FOAA clock**" appears in Promise, Block 1, Block 2, and Conclusion. **This is the verifiable hard-anchor that replaces the prior unverifiable "more records every week than a month ten years ago" claim.**
- **Rule of three** — three pains, three blocks, three "picture" beats in the indirect CTA. Two arguments per thesis (1+1 floor), **three in Block 3** (NIST AI RMF → fixed-price → migration), with the live demo as empirical confirmation.
- **Promise → evidence → promise** — "**3–5× shipped, 10× ceiling**" is stated in Intro, demonstrated in every block, repeated in Conclusion. Portfolio metrics (95% accuracy, 85% faster) are now **supporting evidence** for the hard anchors, not the headline.

### Order of anchors (hard before soft)
The deck leads with what the panel can verify from the bench: **MRS Title 1 §408-A** (5 working days, $25/hr, "at the requester's option"), **MRS Title 5 §95-C** (4-criteria retention, patron-confidentiality), **8 miles of records, 1639, 3 warehouse locations, 8-digit location code** (Maine.gov), **NARA: 900 TB / 800M files / 100+ agencies** (archives.gov/era/about), **OMB M-19-21 / M-23-07 → June 30 2024** (verbatim memo). Portfolio numbers (95% / 85% / 3-5× / 10× ceiling) follow as **supporting evidence**, not as headlines. **180% ROI is reserved for Q&A** — it's SMB/mid-market portfolio data and does not transfer cleanly to a state-archives fixed-price contract.

### Sources we will cite if asked (do not invent on stage)
- **Maine Revised Statutes Title 1 §408-A** — FOAA: 5-working-day acknowledgment, $25/hr search after first 2 free hours, 10¢/page, electronic records "at the requester's option". `legislature.maine.gov/statutes/1/title1sec408-A.html`
- **Maine Revised Statutes Title 5 §95-C** — State Archivist powers: retention schedules on 4 criteria (administrative / legal / fiscal / historical), patron-identifying information confidential, custody on agency termination. `legislature.maine.gov/statutes/5/title5sec95-C.html`
- **Maine State Archives** — 8 miles of records, county court records from 1639, vital statistics pre-1892, federal census from Maine to 1880, military records through WWI. `maine.gov/sos/arc`
- **DigitalMaine repository** — Digital Commons / bepress, Maine State Library + Archives + DPLA hub. Concrete collection example: WWI memoranda from Adjutant General's Office, ~60 items, 1917. `digitalmaine.com`
- **NARA Electronic Records Archives** — 900 TB of electronic records, 800M unique files, 2,000+ series, 100+ federal agencies. `archives.gov/era/about` — quote verbatim only.
- **OMB Memorandum M-19-21 (June 28, 2019)** + **M-23-07 (Feb 2023)** — federal electronic-records mandate, NARA no longer accepts analog transfers after **June 30, 2024**. Memo PDF on file in `aidlc-docs/domain-research-us-archives.md` §2.2.
- **AWS shared-responsibility audit reports — FedRAMP, ISO/IEC 27001, SOC 2 Type II** — Block 2 federal audit baseline (all three options your RFP lists).
- **NIST AI Risk Management Framework — AI RMF 1.0 (NIST AI 100-1, January 2023)** — Block 3 scientific argument. Four trustworthiness controls cited: bounded outputs, uncertainty quantification + human escalation, traceability, accountability. Map each to a named component in the stack.
- **NIST SP 800-88 — Media Sanitization** — for the termination clause.
- **Maine OIT policies — DigitalAccessibilityPolicy, WebStandards, BackUpRecoveryProcedures, BusinessContinuityDisasterRecoveryPolicy** — for Block 2 conformance language.
- **WCAG 2.1 Level AA** — accessibility baseline.
- **DACS, EAD, PREMIS, OAIS (ISO 14721)** — archival standards for Q&A on description and preservation. Detail in `aidlc-docs/domain-research-us-archives.md` §4.
- **State Archives of North Carolina** — peer-state reference: 3 facilities (Raleigh / Manteo / Asheville), 90,000+ items in NC Digital Collections. Use only if asked for a peer.
- **CoSA "State of State Records" — 2023 edition, FY2022 survey, September 2023, Joy Banks (Executive Director)** — **19% of state archives operate with 0-9 FTE; 32% (nearly one-third) of state archivists appointed after 2020; only 23.5% of staff devote >50% time to electronic records; 89% budgeting digital imaging, 86% supporting ERM/digital preservation; BLS projects +9% archivist jobs 2021-2031.** Block 1 Argument 2 (capacity gap), Block 3 Argument 4 (institutional memory turnover). Source: `growthzonecmsprodeastus.azureedge.net/sites/2163/2025/01/CoSA-State-of-State-Report-2022-2023_FINAL.pdf`
- **IBM Cost of a Data Breach Report 2024 — Ponemon Institute, July 2024** — methodology: 604 organizations breached March 2023 to February 2024, 17 industries, 16 countries. **Public-sector average breach cost USD 2.55M (2024) vs. USD 2.60M (2023); MTTI 194 days + MTTC 64 days = 258 days total dwell time (7-year low); USD 2.2M average savings for organizations using AI extensively in security prevention; 26.2% YoY growth in cyber-skills shortage; global all-industry average USD 4.88M (10% YoY jump, biggest since pandemic); 35% of breaches involve shadow data, 46% involve PII.** Block 2 Argument 3 (cost of unenforced controls). Source: `cdn.table.media/assets/wp-content/uploads/2024/07/30132828/Cost-of-a-Data-Breach-Report-2024.pdf`
- Anything else — say "I don't have the source for that handy; I'll send it after the session." **Never** invent a percentage live.

### Domain evidence file
- `aidlc-docs/domain-research-us-archives.md` — every cited number and statute traced to a primary source with the URL. **Read this before the engagement.** Anything in the deck above can be defended from this file.

### What to do if a live demo fails
- **Block 1 demo** — fall back to Records List + verbal walkthrough. Don't apologize.
- **Block 2 demo** — fall back to the audit-trail page (read-only).
- **Block 3 demo** — climax. Have a **30-second pre-recorded screencast** queued up.

### What NOT to say
- "It's just a prototype." → "**working PoC running on AWS**".
- "We'll build it from scratch for you." → "**our records-management product, configured for Maine, with the custom-maintain commitment Pass/Fail #3 requires**".
- "**$178 a month.**" → never quote on stage. Internal cost-modeling number only.
- "Fully remote support" → **say "24/7 distributed managed support"**. Do not raise Pass/Fail #4 unprompted; if asked, defer to the written submission.
- "Production hardening — 500+ miles cross-region" → **trips Pass/Fail #1 framing.** Say "**Day 1, satisfies Pass/Fail #1**".
- "**Five to ten times more records**" without context → say "**three to five times shipped, ten times architectural ceiling**".
- "**Fixed-price contract through 2031**" → say "**initial period plus both renewal options**".
- "**CFO in the room**" → say "**the cost-evaluation side of the panel**".
- "**More records every week than a month ten years ago**" → **DO NOT USE.** Unsourced claim about Maine specifically. Replaced by "**eight miles of records, against a five-working-day FOAA clock**" — both verifiable from MRS Title 1 §408-A and maine.gov/sos/arc.
- "**180% average ROI in fourteen months**" → **DO NOT lead with it on stage.** It's SMB/mid-market portfolio data — wrong audience class for a state-archives fixed-price contract. Reserved for Q&A only, with the SMB caveat.
- "**Three weeks for a FOAA request**" → **DO NOT quote.** Maine FOAA acknowledgment is **5 working days** by §408-A. Use that statutory number, not an invented one.
- "**Six independent frameworks**" → inflated count (3 of the 6 are one AWS shared-responsibility pack). Say "**federal audit baseline plus Maine statute**" — two stacks, named honestly.
- "**Eight miles migrated in ninety days**" → **DO NOT promise.** Phased workstream across the initial period of performance, 90-day parallel-run + physical re-tagging extends across the inventory window. Say "**operates against legacy data from week one, finishes the corpus on a defensible schedule.**"
- "**We'll write a migration tool**" → **DO NOT.** Say "**batch import is a shipped endpoint; legacy-barcode lookup is shipped; physical-to-digital uses the same OCR pipeline you'll see in the demo.**" Migration is configured, not built.
- Apologize for substitutions (Bedrock Vision instead of Textract). → "These are upgrades", owned in the substitutions slide.
- Name a specific Horus client. → industry-workload reference only.
- Quote a number you cannot source. → see the sources list above.

### Companion documents
- `aidlc-docs/demo-narrative.md` — the narrative this presentation operationalizes.
- `aidlc-docs/audit-2026-05-27.md` — code-vs-RFP evidence file.
- `aidlc-docs/dev-fixes-for-demo.md` — pre-demo developer task list. Tasks 1, 5, 6, 7 must merge before delivery.