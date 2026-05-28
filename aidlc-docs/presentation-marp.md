---
marp: true
theme: default
paginate: false
size: 16:9
title: Records Management System — Maine State Archives
author: Horus Technology
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap');

  :root {
    --navy: #0a1f3d;
    --navy-deep: #050d1f;
    --pine: #2E5A3E;
    --gold: #c9a44c;
    --bone: #faf8f3;
    --slate-900: #0f172a;
    --slate-600: #475569;
    --slate-400: #94a3b8;
    --slate-200: #e2e8f0;
    --slate-100: #f1f5f9;
  }

  section {
    font-family: 'Inter', sans-serif;
    background: var(--bone);
    color: var(--slate-900);
    padding: 80px 100px;
    font-size: 24px;
    font-weight: 400;
    letter-spacing: -0.01em;
    justify-content: flex-start;
    word-break: keep-all;
    overflow-wrap: normal;
    hyphens: manual;
  }
  section * {
    word-break: keep-all;
    overflow-wrap: normal;
  }

  h1, h2, h3, h4 {
    font-family: 'Inter', sans-serif;
    color: var(--navy);
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0;
    font-weight: 800;
  }

  section > h1 {
    font-size: 48px;
    line-height: 1.05;
    margin-bottom: 18px;
    width: 100%;
    max-width: none;
    word-break: keep-all;
    overflow-wrap: normal;
    white-space: normal;
  }
  section > header {
    word-break: keep-all;
    overflow-wrap: normal;
    white-space: nowrap;
  }

  strong { color: var(--pine); font-weight: 700; }
  em { font-family: 'Fraunces', serif; font-style: italic; color: var(--slate-600); font-weight: 400; }

  section::after {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--slate-400);
    content: 'HORUS  ·  RECORDS MANAGEMENT';
    bottom: 28px;
    left: 100px;
    right: 100px;
    text-align: left;
  }

  section header {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--pine);
    top: 50px;
    left: 100px;
    right: 100px;
    border: none;
    padding: 0;
  }

  /* ===== SLIDE 1 — TITLE ===== */
  section.title {
    background:
      linear-gradient(135deg, rgba(5,13,31,0.92) 0%, rgba(10,31,61,0.78) 100%),
      url('https://images.unsplash.com/photo-1568667256549-094345857637?w=1920&q=80') center/cover;
    color: #ffffff;
    padding: 90px 100px 80px;
    justify-content: space-between;
  }
  section.title h1 {
    color: #ffffff;
    font-size: 96px;
    font-weight: 800;
    letter-spacing: -0.045em;
    line-height: 0.95;
  }
  section.title .sub {
    color: var(--slate-200);
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 36px;
    font-weight: 400;
    margin-top: 24px;
    letter-spacing: -0.01em;
  }
  section.title .id-strip {
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    color: rgba(255,255,255,0.7);
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  section.title .id-strip strong { color: #ffffff; }
  section.title::after { content: ''; }

  /* ===== SLIDE 2 — PROBLEM ===== */
  section.problem {
    background: linear-gradient(180deg, var(--bone) 0%, var(--slate-100) 100%);
    justify-content: center;
    padding: 80px 100px;
  }
  .problem-headline {
    font-size: 72px;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: -0.04em;
    line-height: 1.0;
    max-width: 1100px;
  }
  .problem-headline em {
    font-family: 'Fraunces', serif;
    font-style: italic;
    color: var(--pine);
    font-weight: 500;
  }
  .problem-stats {
    margin-top: 60px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
    padding-top: 30px;
    border-top: 1px solid var(--slate-200);
  }
  .problem-stats .stat .num {
    font-size: 64px;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .problem-stats .stat .num span { color: var(--pine); }
  .problem-stats .stat .lbl {
    margin-top: 10px;
    font-size: 16px;
    color: var(--slate-600);
    line-height: 1.4;
    max-width: 280px;
  }

  /* ===== TWO-PANE (Block 1) ===== */
  .two-pane {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 50px;
    margin-top: 18px;
    align-items: center;
  }
  .pane-left h2 {
    font-size: 32px;
    color: var(--navy);
    margin-bottom: 14px;
    line-height: 1.1;
  }
  .pane-left p { font-size: 16px; color: var(--slate-600); line-height: 1.5; max-width: 460px; }
  .curve-svg { margin-top: 18px; }
  .pane-right {
    background: var(--navy);
    color: #ffffff;
    padding: 30px 32px;
    border-radius: 8px;
  }
  .pane-right .label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 10px;
  }
  .pane-right .big-num {
    font-size: 96px;
    font-weight: 800;
    line-height: 0.9;
    color: #ffffff;
    letter-spacing: -0.04em;
  }
  .pane-right .caption { font-size: 16px; color: rgba(255,255,255,0.85); margin-top: 10px; line-height: 1.35; }
  .pane-right .hl { display: block; margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.4; }

  /* ===== COMPLIANCE columns ===== */
  .compliance {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 28px;
    margin-top: 18px;
    margin-bottom: 16px;
  }
  .compliance .col h3 {
    font-size: 12px;
    font-weight: 700;
    color: var(--pine);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--pine);
  }
  .compliance .col ul { padding: 0; margin: 0; list-style: none; }
  .compliance .col li {
    font-size: 15px;
    color: var(--navy);
    font-weight: 500;
    padding: 4px 0;
    letter-spacing: -0.01em;
    line-height: 1.25;
  }
  .compliance .col li em {
    display: block;
    font-style: normal;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: var(--slate-600);
    margin-top: 2px;
    line-height: 1.35;
  }
  .audit-band {
    background: var(--slate-100);
    padding: 24px 32px;
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-left: 4px solid var(--pine);
  }
  .audit-band .label { font-size: 14px; color: var(--slate-600); font-weight: 500; }
  .audit-band .badges { display: flex; gap: 12px; }
  .badge {
    background: var(--navy);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .micro {
    margin-top: 10px;
    color: var(--slate-600);
    font-size: 13px;
    letter-spacing: 0.02em;
    line-height: 1.5;
  }
  .micro strong { color: var(--navy); }

  /* ===== ARCHITECTURE 2x2 ===== */
  .frame-band {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .frame-cite {
    background: #ffffff;
    border: 1px solid var(--slate-200);
    border-left: 4px solid var(--gold);
    border-radius: 6px;
    padding: 10px 14px;
  }
  .frame-cite .src {
    font-family: 'Fraunces', serif;
    font-size: 11px;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .frame-cite p {
    font-size: 13px;
    color: var(--slate-900);
    margin: 3px 0 0;
    line-height: 1.4;
  }
  .frame-cite p strong { color: var(--navy); }
  .arch-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 4px;
  }
  .arch-card {
    background: #ffffff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    padding: 16px 20px;
    border-top: 4px solid var(--pine);
  }
  .arch-card .num {
    font-family: 'Fraunces', serif;
    font-size: 11px;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.15em;
  }
  .arch-card h3 {
    font-size: 20px;
    color: var(--navy);
    margin: 4px 0 6px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .arch-card .stack { font-size: 13px; color: var(--pine); font-weight: 600; margin-bottom: 4px; letter-spacing: 0.01em; }
  .arch-card p { font-size: 13px; color: var(--slate-600); margin: 0; line-height: 1.4; }
  .arch-foot {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .integrations {
    background: var(--navy);
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 12px;
    letter-spacing: 0.02em;
    line-height: 1.45;
  }
  .integrations span { color: var(--gold); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; margin-right: 12px; }
  .substitutions {
    color: var(--slate-600);
    font-size: 14px;
    letter-spacing: 0.02em;
    padding: 0 24px;
  }
  .substitutions strong { color: var(--navy); }

  /* ===== CONCLUSION ===== */
  section.conclusion {
    padding: 80px 100px;
    justify-content: center;
  }
  .conclusion-title {
    font-size: 56px;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: -0.035em;
    line-height: 1.0;
    margin-bottom: 50px;
  }
  .conclusion-title em {
    font-family: 'Fraunces', serif;
    font-style: italic;
    color: var(--pine);
    font-weight: 500;
  }
  .conclusion-three {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
  }
  .conc-card {
    border-top: 4px solid var(--pine);
    padding-top: 20px;
  }
  .conc-card .num {
    font-family: 'Fraunces', serif;
    font-size: 14px;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.18em;
    margin-bottom: 8px;
  }
  .conc-card h3 {
    font-size: 22px;
    color: var(--navy);
    margin-bottom: 10px;
    letter-spacing: -0.015em;
  }
  .conc-card p { font-size: 15px; color: var(--slate-600); line-height: 1.5; margin: 0; }
  .conclusion-promise {
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid var(--slate-200);
    text-align: center;
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 30px;
    color: var(--navy);
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .conclusion-promise strong { color: var(--pine); font-family: 'Inter', sans-serif; font-style: normal; font-weight: 700; }

  /* ===== Q&A ===== */
  section.qa {
    background:
      linear-gradient(180deg, rgba(5,13,31,0.85) 0%, rgba(10,31,61,0.95) 100%),
      url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80') center/cover;
    color: #ffffff;
    padding: 100px 100px 80px;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  section.qa h1 {
    color: #ffffff;
    font-size: 160px;
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 0.9;
  }
  section.qa h1 em {
    font-family: 'Fraunces', serif;
    font-style: italic;
    color: var(--gold);
    font-weight: 500;
  }
  section.qa .qa-sub {
    margin-top: 40px;
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 32px;
    color: rgba(255,255,255,0.85);
    font-weight: 400;
    max-width: 900px;
  }
  section.qa .qa-contact {
    margin-top: 60px;
    color: rgba(255,255,255,0.7);
    font-size: 18px;
    letter-spacing: 0.02em;
  }
  section.qa .qa-contact strong { color: #ffffff; font-weight: 700; }
  section.qa::after { content: ''; }
---

<!-- _class: title -->

# Records Management<br>System.

<div class="sub">A working demo for Maine State Archives.</div>

<div class="id-strip">
  <div>
    <strong>HORUS TECHNOLOGY</strong><br>
    AWS Advanced Partner  ·  Anthropic Partner
  </div>
  <div style="text-align: right;">
    <strong>26</strong> active AWS certifications<br>
    100% staff certified
  </div>
</div>

<!--
SLIDE 1 — INTRO  (~50 sec)

Good morning. I'm Michael Walker with Horus Technology. Before I founded Horus in 2023, I was an AWS Solutions Architect. Before that, a Google engineer. Twelve engineers on the team. Twenty-six active AWS certifications.

In April, we passed the AWS Small-and-Medium-Business Competency. Third-party audited. An independent auditor signed off on our operational maturity using our production projects as the evidence. The certificate is in File 3.

Today we run four production deployments across regulated industries. Healthcare vital-records. EdTech. High-volume handwritten correspondence in a regulated industry. Private-equity contracts. I'll cite specific figures from each as supporting evidence later in the deck. We operate 24/7 distributed managed support, with a dedicated project manager and SLA-backed response times — and that is the operational model we are proposing for Maine.

PRESENTER NOTE: Eye contact, not slide. Don't read certs aloud. Do not bring up Pass/Fail #4 unprompted — eligibility is already certified in Appendix C.
-->

---

<!-- _class: problem -->
<header>The Problem</header>

<div class="problem-headline">
Eight miles of records.<br>A <em>five-day</em> statutory clock.<br>A finite archivist team.
</div>

<div class="problem-stats">
  <div class="stat">
    <div class="num">8<span> mi</span></div>
    <div class="lbl">of permanently valuable State records — county court files back to 1639</div>
  </div>
  <div class="stat">
    <div class="num">5<span> days</span></div>
    <div class="lbl">FOAA statutory clock to acknowledge every citizen request — Maine Title 1 §408-A</div>
  </div>
  <div class="stat">
    <div class="num">3<span>×</span></div>
    <div class="lbl">regulatory pressures hitting at once: retention, FOAA, legal hold</div>
  </div>
</div>

<!--
SLIDE 2 — PROBLEM  (~1:30)

Today is about your Records Management System. What we are showing you is our records-management product, running on AWS, configured against your RFP. Pass/Fail #3 asks for initial customizations and ongoing code maintenance for Maine records-management law. We commit to that — for the life of the contract.

Here is the promise. Eight miles of records. A five-working-day FOAA clock. The same archivist team. Three to five times the throughput — with architectural headroom up to ten. Full audit trail. Zero compliance lapses.

This is not a replacement for archival judgment. It is a system that does the repetitive part — and gives the archivist back the part where appraisal judgment actually lives.

WHY THIS MATTERS NOW: Your own homepage today says the Archives is relocating to the Cultural Building, conducting inventory, response times slower. That is the only moment in a generation when eight miles of records are being physically touched anyway. Deploy this RMS during inventory — and every box gets its barcode, its 8-digit location code, and its metadata captured once. Not twice. The cost of digital transformation pays itself out of work already committed.

Three pieces next. The FOAA gap. The compliance exposure. And the AI that closes both.

PRESENTER NOTE: Slow down. This is the slide that anchors everything else.
-->

---

<header>Block 1 · Operational</header>

# The math<br>doesn't work.

<div class="two-pane">
  <div class="pane-left">
    <p>You can't keep up with exponential record volume by hiring linearly. The only thing that scales is AI doing the cognitive work, while humans make the decisions.</p>

  <svg class="curve-svg" width="500" height="200" viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#0a1f3d" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#0a1f3d" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <text x="0" y="14" font-family="Inter" font-size="11" font-weight="600" letter-spacing="2" fill="#94a3b8">RECORDS INTAKE</text>
    <text x="0" y="170" font-family="Inter" font-size="11" font-weight="600" letter-spacing="2" fill="#94a3b8">ARCHIVIST HEADCOUNT</text>
    <path d="M 0 130 Q 200 130, 280 100 T 500 30" fill="none" stroke="#0a1f3d" stroke-width="3"/>
    <path d="M 0 130 Q 200 130, 280 100 T 500 30 L 500 200 L 0 200 Z" fill="url(#g1)"/>
    <line x1="0" y1="155" x2="500" y2="155" stroke="#2E5A3E" stroke-width="2" stroke-dasharray="6,6"/>
  </svg>

  </div>
  <div class="pane-right">
    <div class="label">Own production workload — high-volume handwritten correspondence</div>
    <div class="big-num">5<span style="font-size:80px;">×</span></div>
    <div class="caption">200 → 1,000+ items / day. 60K docs / month. 50% cost reduction. Same headcount.</div>
    <div class="hl">Plus: human-in-loop review · change-management · AI pipeline. All three costed.</div>
  </div>
</div>

<div class="micro" style="margin-top:24px;"><strong>Federal precedent:</strong> NARA's <strong>Electronic Records Archives</strong> — <strong>900 TB · 800M files · 100+ federal agencies</strong>, under OMB M-19-21 / M-23-07 to a <strong>30 June 2024</strong> deadline. <strong>CoSA 2023, Joy Banks:</strong> 19% of state archives operate with ≤9 FTE; only 23.5% spend &gt;50% time on electronic records. Work grew. Labor pool did not.</div>

<!--
SLIDE 3 — BLOCK 1: OPERATIONAL  (~3:10)

Thesis: Eight miles of records. A five-day statutory clock. A finite archivist team. That math closes only when AI absorbs the repetitive work and gives those hours back to the archivist.

ARG 1 — SCIENTIFIC + STATUTORY (the math every archives faces — and how Maine's law writes it):

Every state archives in the country is solving the same equation right now. Work has grown. Labor pool has not. Statutory clocks have not moved. And the data on what closes that gap is unambiguous.

NARA's Electronic Records Archives. Nine hundred terabytes. Eight hundred million files. Over a hundred federal agencies. They got there under OMB memo M-19-21, updated by M-23-07, to a June 30, 2024 deadline — after which NARA stopped accepting analog transfers. Their answer: tooling.

And the team side of the same equation. CoSA's 2023 State of State Records report, executive director Joy Banks. Nineteen percent of state archives operate with nine or fewer staff. Only twenty-three percent of those staff spend more than half their time on electronic records. Work grew. Labor pool did not.

Now Maine, specifically. Your own policy gives you five working days to answer every citizen request. A fixed archivist team. And an archive that goes back to 1639 — four hundred years of records the same team has to keep working with.

Every hour spent hand-pulling binders is an hour subtracted from appraisal and reference — the work that actually requires an archivist. The clock does not move. The team does not grow. Something has to absorb the repetitive load — or compliance slips.

That something is AI doing the sorting, classification, and retrieval — under human review. Auto-classification at upload, instead of manual keying. Sub-second search, instead of half-day shelf-pulls. Hours given back to the archivist for the part of the job that actually requires an archivist.

Honesty point: not a magic pill. Three things ran in parallel in every deployment we shipped — AI pipeline, human-in-loop review queue, change management for staff. All three are in the Maine proposal.

ARG 2 — PRACTICAL (we have already shipped this exact pattern):

Not theoretical. We have already shipped it. A regulated industry. High-volume handwritten paper correspondence, daily. Statutory turnaround. Same operational shape as your reference queue. Before: 200 items a day, by hand. After: over 1,000. Same headcount. 60,000 documents a month. Cost down 50 percent. The team did not grow. The team's hours were freed. The system handled OCR, classification, structured metadata extraction — and the people moved up the work-stack to exception handling and judgment calls. Same architecture is what we bring to Maine, off the shelf, tuned to your corpus during the 90-day parallel run.

>>> AFTER THIS SLIDE: DEMO MOMENT 1 — Records List → upload one record → AI auto-classifies. ~25 sec demo + 10 sec close. Backup screencast A queued.

DEMO CLOSE: One document. Classified. Tagged. Indexed. Embedded. Routed for review — in under thirty seconds. Nobody typed a field. That same upload, by hand, is twenty minutes of an archivist's day. Multiply that by every box being touched right now. The hours returned to the team are not a slide anymore — they are a budget line. The backlog does not shrink because you hire more people; it shrinks when the repetitive cognitive work stops landing on the archivist's desk — and the five-day clock stops being a fire drill.
-->

---

<header>Block 2 · Compliance</header>

# Block 1 gave hours back.<br><em style="font-family:'Fraunces',serif;color:var(--pine);font-weight:500;font-style:normal;">Block 2 protects them.</em>

<div class="compliance">
  <div class="col">
    <h3>Encryption</h3>
    <ul>
      <li>TLS 1.3<em>In transit</em></li>
      <li>AES-256<em>At rest</em></li>
      <li>FIPS-validated KMS<em>Key management</em></li>
    </ul>
  </div>
  <div class="col">
    <h3>Identity</h3>
    <ul>
      <li>SAML 2.0 / OIDC<em>Active Directory federation</em></li>
      <li>RBAC + MFA<em>Role-based access</em></li>
      <li>State-standard timeouts<em>Session policy</em></li>
    </ul>
  </div>
  <div class="col">
    <h3>Audit</h3>
    <ul>
      <li>Immutable log<em>Append-only</em></li>
      <li>SIEM-exportable<em>Every change</em></li>
      <li>5-year retention<em>Forensic-grade</em></li>
    </ul>
  </div>
</div>

<div class="audit-band">
  <div class="label">All three audit options your RFP accepts — through AWS shared-responsibility reports:</div>
  <div class="badges">
    <span class="badge">FedRAMP</span>
    <span class="badge">ISO/IEC 27001</span>
    <span class="badge">SOC 2 Type II</span>
  </div>
</div>

<div class="micro"><strong>IBM Cost of a Data Breach 2024 (Ponemon, 604 orgs):</strong> public-sector breach <strong>USD 2.55M</strong> · <strong>258 days</strong> mean dwell time · <strong>USD 2.2M</strong> saved by orgs using AI extensively in prevention · <strong>26.2%</strong> YoY cyber-skills shortage. <strong>Maine statute:</strong> Title 5 §95-C four retention criteria · §95-C patron-confidentiality · Title 1 §408-A 5-day clock · NIST SP 800-88 · Maine OIT BackUp + BC · WCAG 2.1 AA.</div>

<!--
SLIDE 4 — BLOCK 2: COMPLIANCE  (~3:00)

Thesis: Block 1 gave hours back. Block 2 protects them. Rules live in the code — at the data layer — so they keep working after the person who knew them has left.

ARG 1 — SCIENTIFIC + AUTHORITY (the cost of unenforced controls — and the standards that answer it):

Start with what an unenforced control actually costs. IBM Cost of a Data Breach Report, 2024 edition. Six hundred and four organizations surveyed.

Public sector. Average breach: two and a half million dollars. Two hundred and fifty-eight days — eight and a half months — from breach to containment. And the staffing side of the same report — cyber-skills shortage grew 26 percent year over year. Fewer people watching. More records. Longer dwell time. Same staffing curve we showed you in Block 1.

One figure that decides which side of that line you sit on. Organizations using AI extensively in prevention saved 2.2 million per breach. That is the dollar value of putting rules in the code instead of in someone's head.

So how do we put them in the code, in a way the State can audit? Two stacks.

First — the federal audit baseline. Your RFP accepts FedRAMP, ISO 27001, or SOC 2 Type II. We bring all three. Underneath: TLS 1.3, AES-256, FIPS-validated keys, SAML or OIDC, RBAC, MFA, an immutable audit log piped to your SIEM, NIST media sanitization on termination. Backup conforms to Maine OIT's own backup-and-recovery and continuity policies.

Second — Maine statute. Title 5 §95-C. The State Archivist's four retention criteria — administrative, legal, fiscal, historical — live in our schema as a first-class object. §95-C also makes patron-identifying information confidential by statute — enforced at the data layer, not in the UI. Title 1 §408-A. Five-day clock. "In the medium it was stored, at the requester's option." And WCAG 2.1 Level AA, per Maine's Digital Accessibility Policy.

And the archival standards your team already works in — DACS for description, EAD for two-way ArchivesSpace export, PREMIS for preservation events, OAIS for the handoff to Libsafe — those aren't our innovation. They are baseline compatibility, built in from Day 1.

Two stacks. Both audited externally. Both enforced in the code. That is the answer to the IBM number.

ARG 2 — PRACTICAL (this is how those rules behave when a human tries to break them):

Authority is not the same as enforcement. Here is how the rules actually behave when somebody — accidentally or otherwise — tries to break them.

Once a record is on legal hold, you literally cannot modify it. The data layer refuses. And the refusal is logged with the user, the timestamp, and the reason. Same for unmatured retention dates. Same for unauthorized disposition.

We have shipped this exact enforcement pattern before. Private-equity contract intelligence. 19 order-form fields plus line items extracted in under 10 seconds. 95% field accuracy. Multi-tenant row-level security. Controls in the data layer, not in the UI. Same architecture, applied to Maine legal hold and §95-C confidentiality.

Three RFP-specific pieces you'll see in the demo. Agency self-service portal — records officers accession, request, place legal hold, and check the 5-day clock from their desk. No phone tag. Circulation tracking — check-in, check-out, custody history; automated overdue notices across your three warehouses; 8-digit location code on every box. Confidentiality enforcement — §95-C filtered by role at the API layer.

And one for your security team. State data is never used to train AI models. Contractual guarantee from AWS Bedrock. Maine's records stay Maine's.

PRESENTER NOTE: Three breath-pauses (IBM cost figures → federal audit baseline → Maine statute / WCAG). Do NOT read the slide aloud.

>>> AFTER THIS SLIDE: DEMO MOMENT 2 — Records detail → toggle Legal Hold → attempt disposition → blocked → audit log shows the blocked attempt.

DEMO CLOSE: What you're seeing is the accession workflow with transmittal forms, series-level description, and item-level circulation — archival vocabulary built into the data model, not bolted onto the UI. Disposition attempt on a record under legal hold. The system refuses. The refusal is logged with the user. Five years from now, that line of audit history is the defense. Compliance is the default — not the discipline. Every unprocessed record is risk. This system turns risk into routine — because the rules live in the code, not in someone's head. And the hours Block 1 gave back to the archivist stay there, instead of being eaten by the next compliance fire drill.
-->

---

<header>Block 3 · AI + Migration</header>

# Automation is not a feature.<br><em style="font-family:'Fraunces',serif;color:var(--pine);font-weight:500;">It is the system.</em>

<div class="frame-band">
  <div class="frame-cite">
    <div class="src">Library of Congress · Newspaper Navigator</div>
    <p>ML across <strong>16M pages of Chronicling America</strong>. Bounded outputs · confidence-scored · cataloger on review. <strong>Keyboard work moved off the cataloger's desk. Appraisal stayed where it belongs.</strong></p>
  </div>
  <div class="frame-cite">
    <div class="src">NIST AI RMF 1.0 · Jan 2023</div>
    <p>Four trustworthiness controls for AI in regulated workflows: <strong>bounded outputs · uncertainty + escalation · traceability · accountability.</strong></p>
  </div>
</div>

<div class="arch-grid">
  <div class="arch-card">
    <div class="num">01 / BOUNDED OUTPUTS</div>
    <h3>Bedrock Claude Sonnet</h3>
    <div class="stack">tool_use pattern · JSON schema</div>
    <p>Model returns structured JSON, not free-form text. <strong>Hallucination is bounded by design</strong> — there is nothing to hallucinate into.</p>
  </div>
  <div class="arch-card">
    <div class="num">02 / UNCERTAINTY + ESCALATION</div>
    <h3>0.85 confidence threshold</h3>
    <div class="stack">Auto above · human review queue below</div>
    <p>Every classification carries a confidence score. <strong>Low-confidence records route to a human</strong>, not auto-accepted.</p>
  </div>
  <div class="arch-card">
    <div class="num">03 / TRACEABILITY</div>
    <h3>Claude Vision · Titan v2 + pgvector</h3>
    <div class="stack">Native PDF · sub-second four-mode search</div>
    <p>OCR on PDFs to ~100 pages with handwriting. Search across keyword, phrase, semantic, hybrid. <strong>Every result traces back to source page.</strong></p>
  </div>
  <div class="arch-card">
    <div class="num">04 / ACCOUNTABILITY</div>
    <h3>EventBridge cron · append-only audit</h3>
    <div class="stack">90 / 30 / 7-day windows · DB-enforced</div>
    <p>Disposition dates set on classification. <strong>Audit log refuses updates and deletes</strong> at the database layer.</p>
  </div>
</div>

<div class="arch-foot">
  <div class="integrations"><span>Two production deployments — same stack</span>Vital records · 40+ US state health departments · HIPAA · 80% time reduction · 98% success · 10× throughput / no headcount &nbsp;·&nbsp; <strong style="color:#fff;">EdTech catalogs · 4,000+ universities · 250K pages/yr · 98% accuracy · 100:1 ROI · $1.16M–$4.76M audited annual savings</strong></div>
</div>

<!--
SLIDE 5 — BLOCK 3: AI + MIGRATION  (~3:25)

Thesis: Automation is not a feature of this system — it is the system. Under controls a federal framework already named, alongside institutions the panel respects, with our own production work behind it.

ARG 1 — FRAMEWORK (NIST AI RMF, with a cultural-heritage proof point):

Block 1 gave the hours back. Block 2 wrote the rules into the data. Block 3 is what makes this a system, not a database — AI under controls a federal framework already named.

One precedent. The Library of Congress. The Newspaper Navigator project. Machine learning across 16 million pages of Chronicling America — bounded outputs, confidence-scored, cataloger on review. The keyboard work moved off the cataloger's desk. The appraisal stayed where it belongs.

The framework that names those principles is NIST AI Risk Management Framework 1.0. January 2023. Four controls — each one maps to a named component in our stack.

- Bounded outputs. Bedrock Claude `tool_use`. The model returns JSON to our schema. No free-text field to hallucinate into.
- Uncertainty and escalation. Confidence score on every classification. Above 0.85, auto-classify. Below, into the human review queue.
- Traceability. Bedrock Vision OCR. Titan embeddings with pgvector. Sub-second retrieval. Every result traces back to its source page.
- Accountability. EventBridge enforces the retention cron. An append-only audit log the database itself refuses to update or delete.

One framing point. This system is for tracking. OCR feeds searchable metadata. Record content stays under the access controls it had before. The system catalogs. It does not unlock.

ARG 2 — PRACTICAL (we have already done this — twice — in production):

Two production deployments already running on this exact stack. Both publicly disclosed. Both audited.

First. A vital-records platform that serves more than 40 US state health departments — the technology backbone behind their birth certificates, death certificates, and amendments. Strict HIPAA. 24-hour statutory deadlines on every Release-of-Information request. Numbers we delivered, against their previous Azure-based pipeline: 80 percent reduction in processing time. 98 percent business success rate on extracted fields. 10× throughput without one additional headcount. End-to-end p95 under 15 minutes. That is your Block 1 math, proved in a state-government workload.

Second. An EdTech data partner standardizing course catalogs from 4,000+ US higher-education institutions — Arizona State, Clarivate, the long tail. 250,000 PDF pages a year. 98 percent extraction accuracy. Catalog turnaround compressed from 3-6 months down to under 30 minutes. 100:1 ROI. Annual savings between 1.16 and 4.76 million dollars versus their manual baseline. Audited numbers.

Same Bedrock pipeline. Same `tool_use` pattern. Same human-in-loop review. Two live production deployments. Audited results. Statutory clocks held. Compliance held. Hours given back to the team.

That is the same system we built for Maine. And the best way to show it is to show it. Let me take you into it.

>>> AFTER THIS SLIDE: DEMO MOMENT 3 — CLIMAX = 3-stop system tour (no upload — re-use the document from Demo 1):
[1] /dashboard + /analytics — backlog trend, throughput by archivist, confidence distribution. "The chart your leadership sees when you tell them — the backlog shrank this year."
[2] /records — list view of the corpus. Show the record from Demo 1 already classified, indexed, retention-scheduled, audit-logged. With Container, Umbrella, Series Title, Disposition date, and TR number on the box label. The system handles the repetitive cognitive work — keying, tagging, scheduling. The archivist keeps the appraisal judgment that requires human context — provenance, sensitivity, historical weight.
[3] /search — semantic-query a phrase from the Demo 1 document → sub-second, found. The same OCR pipeline turns a 1923 letter and today's agency PDF into searchable metadata — content access stays under the rules it always had.

DEMO CLOSE: For the first time — a county court record from 1639 and a born-digital memo from 2026 sit in one catalog. One search bar. Block 1 gave the hours back. Block 2 protected them. Block 3 turns the inventory window you are already in into the moment the capacity multiplier switches on. AI isn't the icing — it's the cake.

HARD RULE: do NOT promise auto-population of location_code / series_title / disposition_date / TR number. Those are archivist-on-review fields. Pass/Fail #1 (500+ miles cross-region), fixed-price economics, migration window, CoSA 32% turnover, legacy-barcode/batch-import — all in the Q&A bank if asked, not in the spoken deck.
-->

---

<!-- _class: conclusion -->
<header>Conclusion</header>

<div class="conclusion-title">
Same team. New tools.<br><em>The backlog shrinks.</em>
</div>

<div class="conclusion-three">
  <div class="conc-card">
    <div class="num">01 / BLOCK 1</div>
    <h3>Hours given back.</h3>
    <p>The backlog shrinks when the repetitive work stops landing on the archivist's desk — the 5-day clock stops being a fire drill.</p>
  </div>
  <div class="conc-card">
    <div class="num">02 / BLOCK 2</div>
    <h3>Hours protected.</h3>
    <p>Rules live in the code, not in someone's head. Compliance is the default — not the discipline.</p>
  </div>
  <div class="conc-card">
    <div class="num">03 / BLOCK 3</div>
    <h3>It IS the system.</h3>
    <p>NIST AI RMF. Library of Congress. Two of our own production deployments. 1639 → 2026, in one catalog, one search bar.</p>
  </div>
</div>

<div class="conclusion-promise">
<strong>3–5×</strong> the throughput. Architectural headroom up to <strong>10×</strong>.<br>Full audit trail. Zero compliance lapses.
</div>

<!--
SLIDE 6 — CONCLUSION  (~2:10)

Three things today.

Block 1. The backlog does not shrink because you hire more people. It shrinks when the repetitive work stops landing on the archivist's desk — and the five-day clock stops being a fire drill.

Block 2. The hours Block 1 gave back stay there — because the rules live in the code, not in someone's head. Compliance is the default, not the discipline.

Block 3. Automation is not a feature of this system — it is the system. Under NIST AI RMF controls. Beside Library of Congress and NARA. Behind two of our own production deployments. A 1639 county court record and a 2026 born-digital memo, in one catalog, behind one search bar.

INDIRECT CALL TO ACTION (40 sec, memorized — do not read):

Picture an archivist, six months from now. She opens her dashboard. What she sees is not a backlog. It is a review queue — records the AI flagged below 85% confidence. By lunch, she's cleared them. Every other record from this week is already classified, indexed, retention-scheduled, and audit-logged — with a recommended location waiting for her sign-off.

Picture a citizen FOAA request — acknowledged inside the five days §408-A requires. And answered in three hours. Because semantic search found the record across four hundred years of holdings.

Picture, at the end of next legislative session, the Archives team telling leadership: the backlog shrank this year. For the first time in a decade. And every FOAA clock landed with margin to spare.

The only question is how fast you want it to start.

WABANAKI + THANKS (20 sec):

One last note. We saw the Open to Collaborate notice on your homepage. Maine's records intersect with Wabanaki heritage, and your team's commitment to partnered stewardship is something we would build around — not over. The system supports access controls and descriptive practices that respect that work.

Thank you for the rigor of this RFP — the most thorough records-management spec we've responded to this year. It would be a privilege to deliver this for the State of Maine. Happy to take questions.

PRESENTER NOTE: Memorize the three "Picture …" beats — do not read them. Slow down on each. Let one sentence end before starting the next.
-->

---

<!-- _class: qa -->

# Questions<em>?</em>

<div class="qa-sub">
We're ready to go deep — on architecture, compliance, fixed-price scaling, migration, hallucination handling, anything you want.
</div>

<div class="qa-contact">
<strong>HORUS TECHNOLOGY</strong> &nbsp;·&nbsp; Michael Walker &nbsp;·&nbsp; michael@horustech.dev
</div>

<!--
SLIDE 7 — Q&A

I'll stop there. Happy to take questions — on the Pass/Fail support clause, WCAG, the build-and-maintain delivery model, fixed-price scaling, certifications, migration plan, hallucination handling, legal hold, FOAA, cross-region DR, Libsafe handoff, circulation overdue notices, anything you want to dig into.

Final mission line, spoken slowly, then silence:
Horus Technology builds enterprise-grade GenAI and document processing on AWS for organizations that can't afford to be wrong — and the State of Maine's records belong in exactly that category. Thank you.

PRESENTER NOTE: Slide remains up for entire Q&A. After the mission line: pause, lift hand to invite, wait. Whoever speaks first sets the tone.
-->