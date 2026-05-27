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
  }

  h1, h2, h3, h4 {
    font-family: 'Inter', sans-serif;
    color: var(--navy);
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0;
    font-weight: 800;
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
    gap: 80px;
    margin-top: 40px;
    align-items: center;
  }
  .pane-left h2 {
    font-size: 42px;
    color: var(--navy);
    margin-bottom: 24px;
    line-height: 1.05;
  }
  .pane-left p { font-size: 19px; color: var(--slate-600); line-height: 1.55; max-width: 460px; }
  .curve-svg { margin-top: 30px; }
  .pane-right {
    background: var(--navy);
    color: #ffffff;
    padding: 48px;
    border-radius: 8px;
  }
  .pane-right .label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 16px;
  }
  .pane-right .big-num {
    font-size: 140px;
    font-weight: 800;
    line-height: 0.9;
    color: #ffffff;
    letter-spacing: -0.04em;
  }
  .pane-right .caption { font-size: 20px; color: rgba(255,255,255,0.8); margin-top: 16px; line-height: 1.4; }
  .pane-right .hl { display: block; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 15px; color: rgba(255,255,255,0.6); }

  /* ===== COMPLIANCE columns ===== */
  .compliance {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
    margin-top: 30px;
    margin-bottom: 30px;
  }
  .compliance .col h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--pine);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--pine);
  }
  .compliance .col ul { padding: 0; margin: 0; list-style: none; }
  .compliance .col li {
    font-size: 19px;
    color: var(--navy);
    font-weight: 500;
    padding: 6px 0;
    letter-spacing: -0.01em;
  }
  .compliance .col li em {
    display: block;
    font-style: normal;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--slate-600);
    margin-top: 2px;
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
    margin-top: 14px;
    color: var(--slate-600);
    font-size: 15px;
    letter-spacing: 0.02em;
  }
  .micro strong { color: var(--navy); }

  /* ===== ARCHITECTURE 2x2 ===== */
  .frame-band {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 18px;
    margin-bottom: 14px;
  }
  .frame-cite {
    background: #ffffff;
    border: 1px solid var(--slate-200);
    border-left: 4px solid var(--gold);
    border-radius: 6px;
    padding: 12px 18px;
  }
  .frame-cite .src {
    font-family: 'Fraunces', serif;
    font-size: 12px;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .frame-cite p {
    font-size: 15px;
    color: var(--slate-900);
    margin: 4px 0 0;
    line-height: 1.45;
  }
  .frame-cite p strong { color: var(--navy); }
  .arch-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-top: 6px;
  }
  .arch-card {
    background: #ffffff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    padding: 28px;
    border-top: 4px solid var(--pine);
  }
  .arch-card .num {
    font-family: 'Fraunces', serif;
    font-size: 14px;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.15em;
  }
  .arch-card h3 {
    font-size: 28px;
    color: var(--navy);
    margin: 8px 0 12px;
    letter-spacing: -0.02em;
  }
  .arch-card .stack { font-size: 15px; color: var(--pine); font-weight: 600; margin-bottom: 8px; letter-spacing: 0.01em; }
  .arch-card p { font-size: 15px; color: var(--slate-600); margin: 0; line-height: 1.5; }
  .arch-foot {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .integrations {
    background: var(--navy);
    color: #ffffff;
    padding: 16px 24px;
    border-radius: 6px;
    font-size: 15px;
    letter-spacing: 0.02em;
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

Good morning. I'm Michael Walker with Horus Technology. We're an AWS Advanced Partner and an Anthropic Partner, based in San Diego. About twelve engineers, fully distributed, all AWS-certified. Twenty-six active certifications across the team.

What we do is narrow. We build document-processing software with AI on AWS, mostly for clients who can't afford to be wrong — healthcare, financial services, insurance, education. The numbers we see across our portfolio, on average: above 95% accuracy, 85% faster processing, payback inside fourteen months.

We run 24/7 distributed managed support for the users of the systems we build — that's the operational model we propose for Maine archivists, agency records officers, and citizen-facing portal users.

PRESENTER NOTE: Eye contact, not slide. Don't read certs aloud.
-->

---

<!-- _class: problem -->
<header>The Problem</header>

<div class="problem-headline">
You're getting more records every <em>week</em><br>today than you used to get in a <em>month,</em><br>ten years ago.
</div>

<div class="problem-stats">
  <div class="stat">
    <div class="num">10<span>×</span></div>
    <div class="lbl">growth in record intake over the last decade</div>
  </div>
  <div class="stat">
    <div class="num">0<span>%</span></div>
    <div class="lbl">growth in archivist headcount over the same decade</div>
  </div>
  <div class="stat">
    <div class="num">3<span>×</span></div>
    <div class="lbl">regulatory pressures hitting at once: retention, FOAA, legal hold</div>
  </div>
</div>

<!--
SLIDE 2 — PROBLEM  (~1:30)

Today is about your Records Management System. We're showing you our records-management product, running on AWS, configured against your RFP — live, in a few minutes.

Pass/Fail #3 in your eligibility section asks the bidder to commit to initial customizations and ongoing code maintenance to keep up with Maine records-management law. We commit to that.

One fact about Maine State Archives that frames everything else: you're getting more records every week today than you used to get in a month, ten years ago. And in those same ten years, the archivist team hasn't grown. You can't hire your way out of that.

Three regulatory pressures hit a state archive at the same time. Records disposition schedules. FOAA — Maine's Freedom of Access Act. Legal hold. Get any one of those wrong, and it shows up in public.

So that's what the next twelve minutes are about. Three pieces: the operational gap, the compliance exposure, and the AI that closes both.

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
    <div class="label">Healthcare Medical Records</div>
    <div class="big-num">85<span style="font-size:80px;">%</span></div>
    <div class="caption">Faster processing. Same team.</div>
    <div class="hl">Plus: human-in-loop review · change-management · AI pipeline. All three costed.</div>
  </div>
</div>

<div class="micro" style="margin-top:24px;"><strong>Federal precedent:</strong> NARA's <strong>Electronic Records Archives</strong> initiative — anchored in <strong>OMB M-19-21</strong> (Transition to Electronic Records), deadline updated by <strong>M-23-07</strong> to <strong>30 June 2024</strong>. Tooling that kept pace with the curve, not headcount that did.</div>

<!--
SLIDE 3 — BLOCK 1: OPERATIONAL  (~2:00)

Thesis: You can't keep up with exponential record volume by hiring linearly. AI does the cognitive work; humans make the decisions.

Healthcare Medical Records workload (NDA). Fact: patient-records intake rising every quarter, headcount frozen. Action: Bedrock pipeline in front of intake — every document classified, extracted, routed automatically; humans only saw what AI was unsure about. Result: 85% faster processing, same team. Three reference projects in our File 3 submission cover the same pattern across healthcare, financial services, and higher-education records — happy to walk through any in Q&A.

ARCHIVIST BRIDGE (do not skip): the records are different — patient charts aren't 19th-century court records, and a loan file isn't a gubernatorial paper. What's the same is the structural pattern: high-volume regulated intake with legal retention requirements, classification as the bottleneck, judgment as the part you don't automate. That pattern ports cleanly to a state archives.

Honesty point: not a magic pill. Three things ran in parallel — AI pipeline, human-in-the-loop review queue, change-management plan for the staff. All three matter. All three costed into the Maine proposal.

NARA in the 2010s — same curve. The federal answer was the Electronic Records Archives initiative. The published anchor is OMB Memorandum M-19-21, with the deadline updated by M-23-07 to 30 June 2024.

REFRAME (do not skip): Maine isn't bound by M-19-21 — it's a federal directive. But the curve M-19-21 was answering is the same curve facing your Archives — and the federal answer was tooling, not headcount. NARA didn't replace its workforce. It built tooling that kept pace. Same logic, configured for state heritage records.

>>> AFTER THIS SLIDE: DEMO MOMENT 1 — Records List → upload one record → AI auto-classifies. ~30 sec demo + 10 sec close. Backup screencast A queued.

DEMO CLOSE: One document. Classified, tagged, indexed, embedded, routed for review — under thirty seconds. Nobody on your team typed a field. Multiply that by the boxes in your three warehouse locations. The backlog doesn't shrink because you hire more people. It shrinks when classification stops being a person's job. That's the operational case.
-->

---

<header>Block 2 · Compliance</header>

# <em style="font-family:'Fraunces',serif;color:var(--pine);font-weight:500;font-style:normal;">Six</em> independent frameworks.<br>One architecture.

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

<div class="micro"><strong>NIST SP 800-88</strong> media-sanitization on termination &nbsp;·&nbsp; Maine <strong>OIT BackUp + BC</strong> policy conformance &nbsp;·&nbsp; <strong>WCAG 2.1 Level AA</strong> from day one</div>

<!--
SLIDE 4 — BLOCK 2: COMPLIANCE  (~2:30)

Thesis: A record that isn't classified, isn't on a retention schedule, and can't be found is a liability. The system has to enforce the rules — you can't lean on archivist memory.

The defense isn't trust us. It's six independent, third-party-audited frameworks aligned on the same architecture — every one named in your RFP or in published Maine OIT policy.

ONE — Encryption. TLS 1.3 in transit, AES-256 at rest, FIPS 140-validated KMS. TWO — Identity. SAML 2.0 or OpenID Connect against your Active Directory, role-based access, MFA, State-standard session timeouts. THREE — Audit. Every change appended to an immutable log, exportable to your SIEM.

FOUR, FIVE, SIX — third-party audit options. Your RFP accepts any one; we bring all three: FedRAMP, ISO/IEC 27001, SOC 2 Type II — through AWS shared-responsibility reports refreshed annually. On termination, State data is destroyed to NIST SP 800-88 media-sanitization standards. Backup and continuity conform to your Maine OIT BackUpRecoveryProcedures and BusinessContinuityDisasterRecoveryPolicy.

And one more bar specifically for the State of Maine — accessibility. WCAG 2.1 Level AA, Maine's DigitalAccessibilityPolicy, designed in from day one. Because for a public-records system, a citizen who can't use the interface is a citizen the State has failed.

SMB Loan Processing workload. Heading into a regulator audit, legal-hold list lived on a spreadsheet. Action: legal hold and audit logging into the API and the database itself. Once a record is on hold, the data layer refuses modification. Result: zero findings on document handling, audit-response time from weeks to hours. Same enforcement pattern in the system you'll see — including the agency self-service portal where a records officer can accession boxes, submit reference requests, and place a legal hold from their own desk — and circulation tracking with overdue notices for records that move between your three warehouse locations.

One more architectural commitment your security team will want named explicitly: State data is not used for AI model training, ever. That's a contractual guarantee from AWS Bedrock, not a promise from us — Maine's records stay Maine's records.

PRESENTER NOTE: Three breath-pauses (encryption/identity/audit → audit reports → accessibility). Do NOT read the slide aloud.

>>> AFTER THIS SLIDE: DEMO MOMENT 2 — Records detail → toggle Legal Hold → attempt disposition → blocked → audit log shows the blocked attempt.

DEMO CLOSE: The system refused. The refusal is logged. The user is logged. Five years from now, that line of audit history is the defense. Compliance is the default — not the discipline. Every unprocessed record is risk. This system turns risk into routine. That's the compliance case.
-->

---

<header>Block 3 · Differentiation</header>

# AI is the architecture — <em style="font-family:'Fraunces',serif;color:var(--pine);font-weight:500;">mapped to NIST AI&nbsp;RMF&nbsp;1.0.</em>

<div class="frame-band">
  <div class="frame-cite">
    <div class="src">IDC Global DataSphere</div>
    <p>Enterprise unstructured data growing at <strong>double-digit CAGR through the late 2020s</strong> — the curve hitting every public-records office. <strong>You can't hire your way out of it.</strong></p>
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
  <div class="integrations"><span>Integrations</span>Microsoft 365 · SharePoint · Dropbox · CRM · ArchivesSpace · <strong style="color:#fff;">Libsafe (preservation, retained)</strong></div>
  <div class="substitutions"><strong>Production-hardening upgrades available Day 1:</strong> CloudFront/WAF · OpenSearch · QuickSight · Textract — your OIT's choice.</div>
</div>

<!--
SLIDE 5 — BLOCK 3: DIFFERENTIATION  (~3:00)

Thesis: AI isn't a feature of this system. It is the system. Take it out and you've got a database with forms.

Two pieces of independent research frame this.

ONE — IDC's Global DataSphere tracks enterprise unstructured data growing at double-digit CAGR through the late 2020s. That curve is hitting every public-records office in the country. You can't hire your way out of a curve like that — AI is non-optional. That part is settled.

TWO — what's not settled is how to put AI into a regulated workflow safely. The authoritative reference is NIST's AI Risk Management Framework — AI RMF 1.0, January 2023. Four trustworthiness controls: bounded outputs, uncertainty quantification with human escalation, traceability, accountability. Each component in our stack maps to one of those NIST controls.

- Bounded outputs — Bedrock Claude Sonnet with the tool_use pattern. JSON matches our schema. Hallucination bounded by design.
- Uncertainty + human escalation — 0.85 confidence threshold. Above auto, below routes to human review queue.
- Traceability — Bedrock Claude Vision for OCR. Titan Embeddings v2 + pgvector + tsvector + pg_trgm. Sub-second across four search modes. Every result traces back to source page.
- Accountability — EventBridge cron with 90/30/7-day windows. Append-only audit log the database itself refuses to update or delete.

The claim isn't trust us, we built it well. The claim is: every AI control here maps to a federally-published framework, AND to your RFP's encryption, identity, and audit requirements. Integrates where your RFP requires — Microsoft 365, SharePoint, Dropbox, your CRM, ArchivesSpace — through documented APIs. Libsafe stays your digital-preservation layer.

ARG 2 — PRACTICAL (ROI-first, single anchor stat):

ONE NUMBER for the cost-evaluation side of the panel, the one to write down: 180% average ROI inside fourteen months across our SMB and mid-market work.

Fact: every one of those clients faced the same trade-off — accuracy vs. speed vs. cost. Action: we deployed exactly the stack you'll see today — Bedrock, Lambda, Step Functions, CDK. Result: the trade-off dissolved. 30–50% lower cost through serverless economics. 40% faster time-to-value through reusable CDK accelerators.

Fixed-price commitment across the initial period and both renewal options: serverless scales with usage, not with seat count or per-record license fees. Infrastructure cost grows on a known curve, and we absorb that risk inside our fixed price.

PASS/FAIL #1 — verbatim, one breath, slow:
Two U.S. storage regions, more than 500 miles apart, assignable by AIP, live Day 1.
That is not production hardening. That is exactly how we satisfy your Pass/Fail #1 eligibility requirement.

CLOSING SUMMARY (one sentence — do NOT re-list each item):
Everything else the RFP names — phased migration with the 90-day parallel run, physical re-tagging across the initial period of performance, dedicated Project Manager, Help Topics, user community forum, three reference projects, CloudFront/WAF and OpenSearch promotion path — all detailed in File 3 and File 4, all priced into the proposal.

>>> AFTER THIS SLIDE: DEMO MOMENT 3 — CLIMAX = 4-stop system tour (no upload — re-use the document from Demo 1):
[1] /dashboard — total records, pending dispositions, open transfers, overdue checkouts, records-by-type chart, recent activity.
[2] /analytics — backlog trend, throughput, confidence distribution, retention pipeline.
[3] /records — list view of the corpus. Show the record from Demo 1 already classified, indexed, retention-scheduled, audit-logged. PROVENANCE LINE (do not skip): every record carries its accession source, its series assignment, its custody history through every state change. AI does the cognitive work; the archivist makes the appraisal and retention judgments.
[4] /search — semantic-query a phrase that ONLY exists in the OCR'd text from Demo 1 → sub-second, found.

DEMO CLOSE: AI isn't the icing here. It's the cake. With it — paired with human-in-loop review, a real migration plan, and trained archivists — you've got the only architecture that can close the gap. That's the differentiation case.

HARD RULE: do NOT promise auto-population of location_code / series_title / disposition_date / TR number. Those are archivist-on-review fields.
-->

---

<!-- _class: conclusion -->
<header>Conclusion</header>

<div class="conclusion-title">
Same team. New tools.<br><em>The backlog shrinks.</em>
</div>

<div class="conclusion-three">
  <div class="conc-card">
    <div class="num">01 / OPERATIONAL</div>
    <h3>The backlog can't be hired away.</h3>
    <p>AI takes out the linear bottleneck — classification stops being a person's job.</p>
  </div>
  <div class="conc-card">
    <div class="num">02 / COMPLIANCE</div>
    <h3>Rules live in the code.</h3>
    <p>Legal hold, retention, FOAA response, accessibility, audit trail — enforced by the system, not archivist memory.</p>
  </div>
  <div class="conc-card">
    <div class="num">03 / DIFFERENTIATION</div>
    <h3>AI is the architecture.</h3>
    <p>Paired with human-in-loop review, a real migration plan, and trained archivists.</p>
  </div>
</div>

<div class="conclusion-promise">
<strong>3–5×</strong> the throughput. Architectural headroom up to <strong>10×</strong>.<br>Full audit trail. Zero compliance lapses.
</div>

<!--
SLIDE 6 — CONCLUSION  (~1:30)

Three things we showed you today.
One. The backlog can't be hired away. AI takes out the linear bottleneck.
Two. Compliance lives in the code, not in someone's memory.
Three. AI is the architecture, not a feature.

Same archivist team. No new hires. Three to five times the throughput. Architectural headroom up to ten. Full audit trail. Zero compliance lapses. Above 95% accuracy. 85% faster processing. Payback inside fourteen months.

Picture an archivist on your team six months from now. She walks in, opens her dashboard, and what she sees isn't a backlog — it's a review queue. A handful of records the AI flagged because confidence was below 85%. By lunch, she's cleared them.

Picture a citizen FOAA request that used to take three weeks, answered in three hours.

Picture, at the end of next legislative session, the Archives team telling leadership: the backlog shrank this year. For the first time in a decade.

That's what the system you just saw, deployed, does. The only question is how fast you want it to start.

Thank you for the rigor of this RFP. It would be a privilege to deliver this for the State of Maine.

PRESENTER NOTE: Memorize the three "Picture …" beats — do not read them.
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