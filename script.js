/* Senior HR Coordinator Command Center — application logic
 * Vanilla ES6+, zero dependencies. Pure logic is exported for tests/app.test.js.
 */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------ *
   * DATA
   * ------------------------------------------------------------------ */
  const t = (id, cadence, priority, title, detail, owner, sla) => ({ id, cadence, priority, title, detail, owner: owner || "HR Coord", sla: sla || "" });

  const OPERATIONS = [
    { group: "Daily High-Priority Operations", items: [
      t("ops-d1", "Daily", "High", "Audit the HRIS inbox and ticketing queue", "Review Workday / BambooHR / Rippling cases and shared inbox. Triage Tier-2 escalations (payroll-impacting, legal-adjacent, executive requests) and assign an owner within the 4-hour SLA. Close or update every ticket older than 2 business days.", "HR Coord", "4 hrs"),
      t("ops-d2", "Daily", "High", "Verify background check statuses and clear contingencies", "Review Checkr / Sterling dashboards for pending, consider and flagged results. Follow the FCRA pre-adverse / adverse action sequence for any adverse finding (copy of report + summary of rights, waiting period, final notice). Confirm no one starts with an open contingency unless HRBP approves in writing.", "HR Coord", "Same day"),
      t("ops-d3", "Daily", "High", "Monitor new-hire I-9 deadlines", "Section 1 must be completed no later than the employee's first day of work; Section 2 (document examination) within 3 business days of the start date. Run the I-9 aging report each morning, escalate any item due within 24 hours, and confirm E-Verify case creation (by the 3rd business day) if enrolled.", "HR Coord", "3 bus. days"),
      t("ops-d4", "Daily", "High", "Process urgent employment verifications (VOE)", "Confirm a signed authorization before releasing salary data. Release only the fields permitted by policy (title, dates of employment; pay only with employee consent). Log requester, date, data released and method in the VOE register.", "HR Coord", "1 bus. day"),
      t("ops-d5", "Daily", "High", "Work the leave-of-absence intake log (LOA / FMLA / ADA)", "Log new leave notices, issue the FMLA eligibility notice within 5 business days of learning of the need for leave, send certification requests (15 calendar days to return), and route ADA accommodation requests into the interactive process. Update the leave tracker with start date, expected return and hours bank.", "HR Coord", "5 bus. days"),
      t("ops-d6", "Daily", "High", "Approve and resolve timecard exceptions", "Clear missing punches, meal-break premiums, unapproved overtime and rounding anomalies before payroll cutoff. Overtime is paid even when unauthorized — document discipline separately. Confirm manager approvals are captured in the system.", "HR Coord", "Before cutoff"),
      t("ops-d7", "Daily", "High", "Respond to unemployment (UI) claim notices", "Check the mail / state portal for claim notices. Respond within the state deadline (commonly 7–10 days) with separation reason, dates and documentation. Late responses can waive the employer's right to contest.", "HR Coord", "State deadline"),
      t("ops-d8", "Daily", "Medium", "Check start-date readiness for the next 5 business days", "For each upcoming hire confirm: signed offer, cleared background check, HRIS record, payroll setup, IT ticket, badge request and manager Day-1 plan. Flag gaps in the onboarding channel before noon.", "HR Coord", "Daily"),
      t("ops-d9", "Daily", "Low", "Log recurring questions to the HR knowledge base", "Record any question received three or more times, draft or update the FAQ answer, and tag it for the weekly process-improvement review.", "HR Coord", "")
    ]},
    { group: "Weekly Operational Rhythms", items: [
      t("ops-w1", "Weekly", "High", "Lead the Cross-Functional Onboarding Sync", "30-minute standing meeting with IT, Facilities and Hiring Managers. Review every start in the next two weeks: laptop and accounts provisioned, badge access, desk or remote kit, and 30-60-90 plan readiness. Publish owner-and-date action items the same day.", "HR Coord", "Weekly"),
      t("ops-w2", "Weekly", "High", "Audit ATS-to-HRIS data sync", "Compare Greenhouse / Lever hired candidates to HRIS records: legal name, start date, job code, FLSA status, salary, pay frequency, work location, manager and cost center. Fix field-mapping discrepancies before payroll cutoff and log root causes.", "HR Coord", "Before cutoff"),
      t("ops-w3", "Weekly", "High", "Offer Letter & Compensation Band QA", "Check each outgoing offer: salary within approved band and equity grants matching the approved grant table; sign-on bonus clawback clause (repayment period, pro-rata, state-law compliant); FLSA exempt/non-exempt classification; pay transparency language; contingencies and at-will wording.", "HR Coord", "24 hrs"),
      t("ops-w4", "Weekly", "Medium", "Compile the People Operations SLA & funnel digest", "Send HRBPs a one-page digest: ticket volume and SLA attainment, offers out/accepted, time-to-start, I-9 and background check aging, leave cases opened/closed, and top three risks with owners.", "HR Coord", "Friday"),
      t("ops-w5", "Weekly", "High", "Review the separation pipeline", "List upcoming voluntary and involuntary separations for the next 14 days: last day, final pay deadline by state, benefits end date, IT revocation time, property return and release agreement status.", "HR Coord", "Weekly"),
      t("ops-w6", "Weekly", "Medium", "Reconcile approved headcount vs. open requisitions", "Match approved headcount in the HRIS and finance plan to open reqs in the ATS. Flag unapproved reqs, duplicated reqs and backfills without a termination record.", "HR Coord", "Weekly"),
      t("ops-w7", "Weekly", "Medium", "Coach junior coordinators and sample their work", "Hold 1:1s and QA-sample 10% of closed tickets and new-hire files. Give written feedback with the specific field or step missed, and note recurring errors for training.", "HR Coord", "Weekly"),
      t("ops-w8", "Weekly", "Low", "Pick one process to automate or simplify", "Choose the highest-volume manual task from the backlog (e.g., reminder emails, form routing, report exports), write the requirements and either build it in the HRIS workflow tool or submit the IT request.", "HR Coord", "")
    ]},
    { group: "Monthly Cycles", items: [
      t("ops-m1", "Monthly", "High", "Execute the Pre-Payroll Audit", "Before each payroll lock, verify: new hires (rate, tax forms, direct deposit), terminations (final pay, PTO payout), prorated stipends, retro-pay adjustments, benefits deductions vs. carrier invoice, garnishments, and variance of more than 5% in total gross vs. prior period.", "Payroll", "Each cycle"),
      t("ops-m2", "Monthly", "High", "Reconcile benefits eligibility with carriers", "Compare HRIS enrollments to carrier eligibility files and the monthly invoice. Fix terminated employees still covered, new hires missing, dependent errors and incorrect tiers. Document credits requested.", "HR Coord", "Monthly"),
      t("ops-m3", "Monthly", "High", "Reconcile the leave tracker", "Confirm each active leave: certification on file, hours used vs. 12-week (or state) entitlement, recertification dates, return-to-work dates and benefit-contribution arrangements. Flag exhausted leave to the HRBP.", "HR Coord", "Monthly"),
      t("ops-m4", "Monthly", "High", "Run the work-authorization expiry report", "Pull employees with I-9 work authorization expiring in the next 90 days. Send reverification notices at 90, 60 and 30 days and complete Section 3 on or before the expiration date.", "HR Coord", "90/60/30 days"),
      t("ops-m5", "Monthly", "Medium", "Audit a sample of new-hire and termination files", "Review 10 files for completeness: signed offer, handbook acknowledgment, tax forms, I-9 (kept separately), benefits elections, termination documentation and final pay proof. Record the error rate by type.", "HR Coord", "Monthly"),
      t("ops-m6", "Monthly", "Medium", "Publish headcount, turnover and tenure report", "Report starting and ending headcount, hires, voluntary/involuntary turnover (monthly and rolling 12 months), regretted attrition, and tenure bands by department.", "HR Coord", "Monthly")
    ]},
    { group: "Quarterly, Bi-Annual & Annual Cycles", items: [
      t("ops-q1", "Quarterly", "High", "HRIS Data Integrity & EEO-1 / OFCCP Compliance Audit", "Validate race/ethnicity and gender self-ID completeness, job category (EEO-1) mapping, establishment assignment, veteran and disability self-ID, and AAP data. Resolve duplicates, invalid SSNs, missing addresses and inactive managers.", "HR Coord", "Quarterly"),
      t("ops-q2", "Quarterly", "High", "Review HRIS role-based access", "Export users and permission groups. Remove access for terminated users and role changes, confirm least-privilege on compensation, SSN and medical fields, and retain the signed review.", "HR Coord", "Quarterly"),
      t("ops-q3", "Quarterly", "Medium", "Check required training completion", "Compare assigned vs. completed harassment prevention, safety and code-of-conduct training. Escalate overdue managers to the HRBP.", "HR Coord", "Quarterly"),
      t("ops-q4", "Quarterly", "Medium", "Review handbook and policy for legal changes", "Scan new state/local laws (paid sick leave, pay transparency, minimum wage, lactation, scheduling) and propose handbook revisions with effective dates.", "HR Coord", "Quarterly"),
      t("ops-q5", "Quarterly", "Low", "Review vendor performance and SLAs", "Score background check, benefits broker, ATS and payroll vendors on turnaround time, error rate and support responsiveness; document service credits and renewal notes.", "HR Coord", "Quarterly"),
      t("ops-b1", "Bi-annual", "High", "Coordinate Performance Review & Calibration logistics", "Twice a year: confirm review-cycle dates, system permissions and reviewer assignments, run manager training, send reminders at T-14, T-7 and T-2 days, track completion daily and prepare calibration packets.", "HR Coord", "2x / year"),
      t("ops-a1", "Annual", "High", "Run Open Enrollment communications", "Plan the timeline: plan changes, rates, FAQs, decision guides, webinars, reminder cadence and deadline confirmation. Test the enrollment site before launch and reconcile elections after close.", "HR Coord", "Annual"),
      t("ops-a2", "Annual", "High", "Prepare ACA 1095-C reporting", "Validate hours, offer-of-coverage codes (Line 14/16), affordability safe harbor and dependent data throughout the year. Furnish forms to employees and file with the IRS by the current-year deadlines.", "HR Coord", "Annual"),
      t("ops-a3", "Annual", "Medium", "Update Labor Law Posters (on-site and remote)", "Replace federal, state and local posters each January and when laws change; provide electronic access for remote employees and keep a dated posting log.", "HR Coord", "Annual"),
      t("ops-a4", "Annual", "Medium", "Load the annual compensation / merit cycle", "Validate approved merit and bonus files, check for FLSA threshold impacts, load effective-dated changes, and send individual statements after payroll confirms.", "HR Coord", "Annual"),
      t("ops-a5", "Annual", "Medium", "Run the records-retention purge review", "Identify records past retention under the schedule, check for legal holds, obtain HRBP/Legal sign-off, destroy securely and log the destruction.", "HR Coord", "Annual")
    ]}
  ];

  const LIFECYCLE = [
    { id: "pre", title: "Pre-Boarding (Offer Accepted → Day -1)", summary: "From signed offer to the day before start", steps: [
      t("life-pre1", "Per hire", "High", "Confirm signed offer and verify against approved compensation band", "Match offer letter to the approval record, confirm start date, FLSA status, work location and contingencies.", "HR Coord", "24 hrs"),
      t("life-pre2", "Per hire", "High", "Initiate the background check", "Send FCRA stand-alone disclosure and authorization; order the correct package (county, SSN trace, education, motor vehicle if role requires). Follow state ban-the-box and fair-chance rules.", "HR Coord", "Same day"),
      t("life-pre3", "Per hire", "Medium", "Send tax and direct-deposit forms", "Issue federal W-4, state withholding forms, direct-deposit authorization and emergency contact form through the secure portal.", "Payroll", "Day -7"),
      t("life-pre4", "Per hire", "High", "Submit IT provisioning request", "Specify role, manager, location, software and security group. Request laptop, accounts and MFA enrollment.", "IT", "7 bus. days"),
      t("life-pre5", "Per hire", "Medium", "Confirm equipment shipping", "Obtain tracking number, delivery date and signature confirmation. Arrange a backup device for remote hires.", "IT", "Day -3"),
      t("life-pre6", "Per hire", "Medium", "Confirm hiring manager Day-1 readiness", "Manager has the 30-60-90 plan, a buddy assigned, Day-1 schedule and team introductions booked.", "Hiring Mgr", "Day -5"),
      t("life-pre7", "Per hire", "High", "Dispatch the Day-1 welcome packet", "Send start time, location or video link, parking/badge instructions, documents to bring for I-9 (List A or List B + C), and benefits overview.", "HR Coord", "Day -3")
    ]},
    { id: "onb", title: "Day 1 to Day 30 Onboarding", summary: "Compliance deadlines, benefits window and early check-ins", steps: [
      t("life-on1", "Per hire", "High", "Complete I-9 Section 1", "Employee completes Section 1 no later than the first day of work. Confirm the attestation and signature.", "HR Coord", "Day 1"),
      t("life-on2", "Per hire", "High", "Complete I-9 Section 2 document inspection", "Examine original documents in person (or via the DHS-approved alternative procedure if eligible) and sign within 3 business days of the start date. Do not specify which documents the employee must present.", "HR Coord", "3 bus. days"),
      t("life-on3", "Per hire", "High", "Validate the HRIS record and payroll setup", "Check legal name, SSN, address, manager, cost center, pay rate, pay group and tax jurisdictions against source documents.", "HR Coord", "Day 1"),
      t("life-on4", "Per hire", "High", "Track the 30-day benefits enrollment window", "Send reminders on Day 7, 14, 21 and 28. Confirm elections and dependent verification documents before the hard 30-day deadline; escalate non-responders to the manager on Day 25.", "HR Coord", "30 days"),
      t("life-on5", "Per hire", "Medium", "Collect policy acknowledgments and assign required training", "Handbook, confidentiality, code of conduct, and harassment-prevention training, with completion dates stored in the HRIS.", "HR Coord", "Week 1"),
      t("life-on6", "Per hire", "Medium", "Run the 14-day HR check-in pulse survey", "Ask about role clarity, manager support, tools, and belonging. Respond to any score of 3 or below within 2 business days.", "HR Coord", "Day 14"),
      t("life-on7", "Per hire", "Medium", "Audit the first paycheck", "Confirm the first payroll is correct: rate, hours, deductions and taxes. Fix errors via off-cycle payment where required by state law.", "Payroll", "First pay date"),
      t("life-on8", "Per hire", "Medium", "Complete the 30-day probation milestone audit", "Confirm manager check-in held, goals documented, training complete, and all onboarding file items present. Record outcome in the HRIS.", "Hiring Mgr", "Day 30")
    ]},
    { id: "mob", title: "Internal Mobility, Promotions & Transfers", summary: "Changes after hire", steps: [
      t("life-mob1", "Per event", "High", "Obtain and file approvals", "Hiring manager, receiving manager, HRBP and compensation approvals for title, level and pay change, with effective date.", "HR Coord", "2 bus. days"),
      t("life-mob2", "Per event", "High", "Issue the title / compensation change letter", "Include new title, pay rate, effective date, FLSA classification (re-test duties and salary), bonus or equity changes. Employee acknowledgment filed.", "HR Coord", "Before effective date"),
      t("life-mob3", "Per event", "High", "Update state tax nexus for remote relocations", "For a move to a new state or locality: register or confirm payroll tax accounts, update withholding and SUI, apply the correct minimum wage, paid leave and pay transparency rules, and review benefits eligibility by location.", "Payroll", "Before first pay date"),
      t("life-mob4", "Per event", "Medium", "Update manager hierarchy and job data in the HRIS", "Change manager, cost center, department, job code, approval chains and org-chart visibility; verify direct reports re-routed.", "HR Coord", "Effective date"),
      t("life-mob5", "Per event", "Low", "Adjust access and schedule a 90-day check-in", "Request new system access, remove access no longer required, and schedule a 90-day HR check-in.", "IT", "1 week")
    ]},
    { id: "off", title: "Voluntary & Involuntary Offboarding", summary: "Separations, final pay, benefits and access", steps: [
      t("life-off1", "Per event", "High", "Intake the separation and confirm the last day", "Voluntary: obtain written resignation. Involuntary: confirm HRBP/Legal review, documentation of reasons and consistency with comparable cases before notification.", "HR Coord", "Same day"),
      t("life-off2", "Per event", "High", "Complete the termination checklist and notify stakeholders", "Notify IT, Payroll, Benefits, Facilities and the manager with the last day, time of access removal and property to be returned.", "HR Coord", "Same day"),
      t("life-off3", "Per event", "High", "Hand off the final paycheck calculation", "Provide Payroll with the last day, unused PTO, commissions, expenses and deductions. Confirm state deadline: for example California requires final pay immediately on discharge, and some other states require same day or next regular payday. Verify the state before every separation.", "Payroll", "Same day / state law"),
      t("life-off4", "Per event", "High", "Trigger COBRA notification", "Notify the plan administrator of the qualifying event within 30 days; election notice must follow within the regulatory window. Update benefits end date.", "HR Coord", "30 days"),
      t("life-off5", "Per event", "High", "Timestamp IT access revocation", "Record the time email, VPN, SSO, HRIS and physical access were disabled, and the device return tracking number.", "IT", "At notification"),
      t("life-off6", "Per event", "Low", "Schedule the exit interview", "Offer the interview 3–5 days before the last day; use a standard question set and route themes to the HRBP monthly.", "HR Coord", "Before last day"),
      t("life-off7", "Per event", "Medium", "Track severance and release agreements", "Record offer date, deadline, signature date and payment date. For employees aged 40+, ensure the 21-day consideration (45 days for group programs) and 7-day revocation periods are honored.", "HR Coord", "21 / 45 + 7 days"),
      t("life-off8", "Per event", "Medium", "Close the record", "Code termination reason and rehire eligibility, respond to the UI claim, tag retention dates, and move files to the terminated-employee archive.", "HR Coord", "5 bus. days")
    ]}
  ];

  const COMPLIANCE_CHECKS = [
    { group: "Federal & Multi-State Audit Checklist", items: [
      t("cmp-1", "Quarterly", "High", "FLSA exempt-status classification test", "Verify salary basis, salary level (federal minimum plus higher state thresholds in places such as CA, NY, WA and CO) and primary-duties test for each exempt role. Re-test after any job change.", "HR Coord", ""),
      t("cmp-2", "Per payroll", "High", "Overtime and regular-rate calculation review", "Confirm non-discretionary bonuses, shift differentials and commissions are included in the regular rate; check daily overtime states and meal/rest premiums.", "Payroll", ""),
      t("cmp-3", "Ongoing", "High", "FMLA / CFRA eligibility tracking", "Employee has 12 months of service and 1,250 hours in the last 12 months, and the employer has 50 employees within 75 miles (FMLA); CFRA applies at 5 or more employees. Record eligibility determination for every request.", "HR Coord", "5 bus. days"),
      t("cmp-4", "Ongoing", "High", "ADA interactive-process documentation", "Document the request date, medical information needed, options considered, decisions and follow-ups. Never record diagnoses in the personnel file.", "HR Coord", ""),
      t("cmp-5", "Annual", "High", "OSHA 300 / 300A log posting", "Certify and post the 300A summary February 1 – April 30 each year; verify electronic submission requirements for your establishment size and industry; keep logs 5 years.", "HR Coord", "Feb 1 – Apr 30"),
      t("cmp-6", "Ongoing", "High", "Multi-state pay transparency review", "Check every job posting for required pay ranges, benefits and application deadlines in the states where the role could be performed (e.g., CO, CA, WA, NY, IL, MN, NJ). Retain posting versions.", "HR Coord", ""),
      t("cmp-7", "Annual", "High", "EEO-1 and OFCCP AAP readiness", "Confirm EEO-1 filing obligations and the annual AAP (federal contractors), job-group analysis and applicant-flow data.", "HR Coord", "Annual"),
      t("cmp-8", "Quarterly", "Medium", "Minimum wage and paid sick leave rate updates", "Check federal, state, county and city changes effective January 1 and July 1; update pay rates, accrual rules and notices.", "HR Coord", "Quarterly")
    ]},
    { group: "Document Retention & PII Security Checks", items: [
      t("cmp-9", "Monthly", "High", "I-9 storage segregation", "Keep I-9s apart from personnel files in a locked binder or access-controlled digital vault; calculate retention as 3 years after hire or 1 year after termination, whichever is later.", "HR Coord", ""),
      t("cmp-10", "Monthly", "High", "Confidential medical / ADA file separation", "Keep medical, leave certification and accommodation records in a separate confidential file with limited access and a documented access log.", "HR Coord", ""),
      t("cmp-11", "Quarterly", "Medium", "Personnel file contents review", "Confirm files contain only job-related items: application, offer, job description, performance and disciplinary records, acknowledgments. Remove medical, I-9, investigation and benefits-enrollment content.", "HR Coord", ""),
      t("cmp-12", "Quarterly", "High", "PII access and security review", "Confirm encryption, SSN masking, MFA for HRIS administrators, secure delivery of sensitive documents (no email attachments with SSNs) and incident response contacts.", "HR Coord", "")
    ]},
    { group: "Employee Relations Readiness", items: [
      t("cmp-13", "Weekly", "High", "ER intake log completeness", "Every concern has a case number, intake date, parties, category, investigator, status and next-step date. Cases open longer than 30 days receive HRBP review.", "HR Coord", "1 bus. day"),
      t("cmp-14", "Ongoing", "High", "Anti-retaliation reminders issued", "Written no-retaliation reminders sent to complainants, witnesses and respondents at intake, and checked again at closure.", "HR Coord", "")
    ]}
  ];

  const COMPLIANCE_REFS = [
    { id: "ref-flsa", title: "FLSA Overtime Classification", body: ["<strong>Three tests for white-collar exemptions:</strong> paid on a salary basis, at or above the required salary level, and performing exempt duties.", "<strong>Duties categories:</strong> executive, administrative, professional, computer, outside sales; highly compensated employee test.", "<strong>Risk flags:</strong> titles that do not match duties, partial-day deductions from salary, and exempt employees below a state threshold."] },
    { id: "ref-fmla", title: "FMLA / CFRA Eligibility", body: ["<strong>Federal FMLA:</strong> 12 months of service, 1,250 hours worked in the previous 12 months, worksite with 50+ employees within 75 miles; up to 12 weeks of job-protected leave (26 weeks military caregiver).", "<strong>CFRA (California):</strong> 5+ employees; same 12 months / 1,250 hours test.", "<strong>Notices:</strong> eligibility notice and rights/responsibilities within 5 business days; designation notice within 5 business days after enough information is received."] },
    { id: "ref-ada", title: "ADA Interactive Accommodation Process", body: ["Start when an employee or manager signals a limitation tied to a medical condition; no magic words are required.", "Request only the medical information needed, consider effective options, document the dialogue and decision, and review the accommodation periodically.", "Undue hardship decisions must go to Legal."] },
    { id: "ref-osha", title: "OSHA 300 / 300A", body: ["Record work-related injuries and illnesses on the 300 log and 301 incident reports within 7 calendar days.", "Summarize on the 300A; post from February 1 to April 30; retain for 5 years.", "Severe injuries: report in-patient hospitalization, amputation or eye loss within 24 hours and fatalities within 8 hours."] },
    { id: "ref-pay", title: "Multi-State Pay Transparency", body: ["Several states and cities require good-faith pay ranges in postings, and some also require benefit descriptions, promotion notices or deadlines.", "Remote roles can trigger the law of any covered state where the employee could work — confirm your policy for remote postings.", "Pay history bans also apply in many jurisdictions: do not ask applicants for salary history."] },
    { id: "ref-i9", title: "Form I-9 and E-Verify Rules", body: ["Section 1: by the first day of work. Section 2: within 3 business days of the start date. Section 3: reverification on or before the expiration date.", "Never request specific documents; employees choose from List A, or List B plus List C.", "Corrections are made by a dated, initialed line-through and entry — never by obscuring the original."] }
  ];

  const RETENTION = [
    ["I-9 forms", "3 years after hire or 1 year after termination, whichever is later", "Separate I-9 file / vault"],
    ["Payroll records (FLSA)", "3 years (time cards and wage-rate tables: 2 years)", "Payroll system"],
    ["Hiring, promotion, termination and personnel records (EEOC)", "1 year from the record or action (1 year after termination)", "Personnel file"],
    ["ADEA payroll and benefit records", "3 years", "Payroll / benefits"],
    ["FMLA records", "3 years", "Confidential leave file"],
    ["OSHA 300 / 300A / 301", "5 years following the year covered", "Safety file"],
    ["Medical / ADA accommodation records", "Per the longest applicable rule; commonly 3–7 years; keep separate from personnel files", "Confidential medical file"],
    ["ERISA benefit plan records", "6 years from filing date", "Benefits file"],
    ["Best-practice window for risk and claims", "7 years for personnel and investigation records (not a universal legal minimum; confirm state rules and holds)", "Archive"]
  ];

  const ER_STEPS = [
    "Acknowledge the concern within 1 business day and explain next steps and the no-retaliation policy.",
    "Capture the facts objectively: who, what, when, where, witnesses, documents and desired resolution. Use the person's words and avoid labels such as \"harassment\" unless quoted.",
    "Explain confidentiality limits: information is shared only with people who need to know; never promise absolute confidentiality.",
    "Assess interim measures (schedule changes, no-contact, paid leave) with the HRBP.",
    "Log the case and assign an investigator who has no conflict of interest.",
    "Set follow-up checkpoints at 3, 10 and 30 days and document closure with outcome and retaliation check."
  ];
  const ER_ESCALATIONS = [
    "Allegations of harassment, discrimination or retaliation against a manager or executive",
    "Threats of violence, weapons, stalking or domestic violence spilling into the workplace",
    "Self-harm statements — contact emergency services and the EAP; notify the HRBP",
    "Wage-and-hour complaints, whistleblower or regulatory reports",
    "Attorney letters, agency charges (EEOC, DOL, state agency), subpoenas or law-enforcement contact",
    "Requests involving pregnancy, disability or religious accommodation denials",
    "Media inquiries or social-media posts that may become public",
    "Concerted activity or union-organizing discussions (NLRA)"
  ];

  const TEMPLATES = [
    { id: "tpl-offer", title: "Executive Offer Letter & Pre-Boarding Welcome Email", use: "Send after the offer is approved and again after the candidate signs.", body:
"Subject: Your offer from [COMPANY NAME] — welcome, [FIRST NAME]!\n\nDear [FIRST NAME],\n\nOn behalf of [COMPANY NAME], I am delighted to offer you the position of [JOB TITLE], reporting to [MANAGER NAME], starting on [START DATE].\n\nCompensation and terms\n- Base salary: [AMOUNT] per [year/hour], paid [pay frequency]. This position is classified as [Exempt/Non-Exempt].\n- Sign-on bonus: [AMOUNT], payable within [30] days of your start date. If you voluntarily leave or are terminated for cause within [12] months, you agree to repay the bonus on a pro-rata basis, to the extent permitted by law.\n- Equity: subject to Board approval, a grant of [NUMBER] [RSUs/options] vesting over [4] years with a [1]-year cliff.\n- Benefits: you are eligible for medical, dental, vision, retirement and paid leave on [ELIGIBILITY DATE]. You must enroll within 30 days of your start date.\n\nContingencies\nThis offer is contingent upon satisfactory completion of a background check, verification of your authorization to work in the United States (Form I-9, within 3 business days of your start date) and your signing of the confidentiality agreement. Employment is at-will and may be terminated by either party at any time.\n\nYour next steps\n1. Sign this letter by [DATE].\n2. Complete the background check authorization sent separately.\n3. Submit tax and direct-deposit forms through [PORTAL].\n4. Your laptop ships on [DATE] (tracking will follow).\n5. Bring original identity and work-authorization documents on Day 1 (or follow the remote verification instructions).\n\nI will send your Day 1 welcome packet on [DATE]. Please contact me at [PHONE/EMAIL] with any questions.\n\nWarm regards,\n[YOUR NAME]\nSenior HR Coordinator, [COMPANY NAME]" },
    { id: "tpl-i9", title: "I-9 Section 2 Urgent Compliance Reminder", use: "Send when Section 2 is due within 24 hours or overdue.", body:
"Subject: ACTION REQUIRED by [DATE/TIME]: Form I-9 Section 2 for [EMPLOYEE NAME]\n\nHi [MANAGER NAME / EMPLOYEE FIRST NAME],\n\nFederal law requires that Section 2 of Form I-9 be completed within 3 business days of [EMPLOYEE NAME]'s first day of work ([START DATE]). Our records show the deadline is [DEADLINE DATE], and the form is still open.\n\nWhat we need\n- [EMPLOYEE NAME] must present original, unexpired documents: one List A document, or one List B plus one List C document. The employee chooses which documents to present.\n- Meet with [HR COORDINATOR NAME] in person or at the approved remote-verification session on [DATE/TIME]. Slots are available at [BOOKING LINK].\n\nWhy this matters\nMissed deadlines create paperwork violations that can lead to civil penalties for each form. We must not allow work to continue past the legal deadline without a completed form.\n\nPlease confirm by [TIME] today. If you need help, reply or call me at [PHONE].\n\nThank you,\n[YOUR NAME]\nSenior HR Coordinator" },
    { id: "tpl-offboard", title: "Offboarding & Final Pay / Benefits Summary Notice", use: "Give to the employee at or before separation; confirm state-specific final pay language with Payroll and Legal.", body:
"Subject: Separation summary — final pay, benefits and next steps\n\nDear [EMPLOYEE NAME],\n\nThis letter summarizes the information related to your separation from [COMPANY NAME], effective [LAST DAY OF EMPLOYMENT].\n\nFinal pay\n- Your final paycheck, including wages through [DATE], [accrued unused PTO of X hours, where applicable] and [other amounts], will be [delivered/available] on [DATE], in accordance with [STATE] law, via [direct deposit/check].\n- Your final pay stub will be available in [PAYROLL PORTAL].\n\nBenefits\n- Medical, dental and vision coverage ends on [DATE].\n- You will receive a COBRA election notice from [COBRA ADMINISTRATOR] at your home address. You will have at least 60 days to elect coverage.\n- 401(k): contact [PROVIDER] at [PHONE/URL] about your balance and rollover options.\n- Life and disability conversion rights: [DETAILS AND DEADLINE].\n\nCompany property and access\nPlease return [LIST OF ITEMS] using the prepaid shipping materials by [DATE]. Your system access ends at [TIME] on [DATE].\n\nTax forms\nYour Form W-2 will be sent to [ADDRESS/PORTAL]. Please keep your address current through [PORTAL].\n\n[IF A SEVERANCE OFFER APPLIES: The separate agreement outlines your review period of [21/45] days and your right to revoke within 7 days after signing.]\n\nIf you have questions, please contact me at [EMAIL/PHONE].\n\nSincerely,\n[YOUR NAME]\nSenior HR Coordinator" },
    { id: "tpl-payroll", title: "HRIS Data Discrepancy Escalation to Payroll", use: "Use when a data mismatch could change pay, taxes or benefits before the next cutoff.", body:
"Subject: [PRIORITY] HRIS data discrepancy — [EMPLOYEE ID] — payroll cutoff [DATE/TIME]\n\nHi [PAYROLL CONTACT],\n\nI found a discrepancy that may affect the [PAY PERIOD] payroll.\n\nSummary\n- Employee: [NAME] (ID [EMPLOYEE ID])\n- Field(s) affected: [e.g., base pay, FLSA status, work state, benefits deduction]\n- HRIS value: [VALUE]    Source of truth: [Signed offer / Change letter / ATS / Carrier file]    Source value: [VALUE]\n- Effective date: [DATE]\n- Estimated financial impact: [AMOUNT / UNKNOWN]\n\nRoot cause (if known): [ATS mapping / late change entry / manual error]\n\nRequested action\n1. Hold or review this record before the payroll lock on [DATE/TIME].\n2. Confirm whether a correction or off-cycle adjustment is required.\n3. Reply with your decision by [TIME].\n\nI have attached the supporting documents and will correct the HRIS record on your confirmation. I will also add this item to the weekly data-quality log.\n\nThank you,\n[YOUR NAME]\nSenior HR Coordinator" }
  ];

  const KPIS = [
    { id: "kpi-offer", label: "Offer Letter Turnaround", value: "< 24 hrs", formula: "Hours from approved offer request to offer sent (median)" },
    { id: "kpi-i9", label: "I-9 Compliance Rate", value: "100%", formula: "I-9s complete and timely ÷ I-9s due in period × 100" },
    { id: "kpi-data", label: "HRIS Data Accuracy", value: "≥ 99.5%", formula: "(Audited fields − fields in error) ÷ audited fields × 100" },
    { id: "kpi-csat", label: "Onboarding CSAT", value: "≥ 4.7 / 5.0", formula: "Average Day-14 and Day-30 pulse survey score" },
    { id: "kpi-sla", label: "Tier-2 First Response", value: "< 4 hrs", formula: "Tickets answered within 4 business hours ÷ total tickets × 100 (target ≥ 95%)" },
    { id: "kpi-pay", label: "Pre-Payroll Error Rate", value: "< 0.5%", formula: "HR-caused payroll corrections ÷ pay records processed × 100" },
    { id: "kpi-onb", label: "30-Day Onboarding Completion", value: "≥ 95%", formula: "New hires with all checklist items complete by Day 30 ÷ new hires × 100" },
    { id: "kpi-final", label: "On-Time Final Pay", value: "100%", formula: "Final paychecks issued by the state deadline ÷ separations × 100" }
  ];

  const MATRIX = [
    ["Core focus", "Processes assigned forms and tickets accurately", "Owns the end-to-end outcome and its risks, and redesigns the process"],
    ["Data work", "Enters and corrects HRIS data", "Designs audits, validation rules and ATS/HRIS integrations; fixes the root cause"],
    ["Escalations", "Escalates unclear questions to a senior or HRBP", "Owns Tier-2 escalations, decides when to involve Legal, and closes the loop"],
    ["Compliance", "Follows the checklist", "Leads audits (I-9, EEO-1, leave), interprets state-by-state rules and documents decisions"],
    ["Automation", "Uses existing templates and reports", "Builds workflows, scripted reminders and dashboards; removes manual hand-offs"],
    ["Stakeholders", "Responds to requests", "Runs cross-functional syncs with IT, Payroll, Facilities and HRBPs; sets expectations"],
    ["Metrics", "Reports volumes", "Defines KPIs, explains variances, and recommends improvements with business cases"],
    ["People development", "Learns from a senior mentor", "Mentors junior coordinators, QA-samples their work and builds training materials"]
  ];

  /* ------------------------------------------------------------------ *
   * PURE LOGIC
   * ------------------------------------------------------------------ */
  const PRIORITIES = ["High", "Medium", "Low"];

  function flatten(groups) { return groups.reduce((a, g) => a.concat(g.items), []); }

  function allTasks() {
    return {
      operations: flatten(OPERATIONS),
      lifecycle: LIFECYCLE.reduce((a, s) => a.concat(s.steps), []),
      compliance: flatten(COMPLIANCE_CHECKS)
    };
  }
  function allTaskList() {
    const g = allTasks();
    return [].concat(g.operations, g.lifecycle, g.compliance);
  }
  function cadences() {
    const seen = [];
    allTaskList().forEach(x => { if (seen.indexOf(x.cadence) === -1) seen.push(x.cadence); });
    return seen;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function progress(list, done) {
    const total = list.length;
    const n = list.filter(x => done[x.id]).length;
    return { done: n, total, pct: total ? Math.round((n / total) * 100) : 0 };
  }
  function matches(item, filters, done) {
    const q = (filters.q || "").trim().toLowerCase();
    if (q) {
      const hay = (item.title + " " + item.detail + " " + item.owner + " " + item.cadence + " " + item.priority + " " + item.sla).toLowerCase();
      if (q.split(/\s+/).some(w => hay.indexOf(w) === -1)) return false;
    }
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.cadence && item.cadence !== filters.cadence) return false;
    if (filters.hideDone && done[item.id]) return false;
    return true;
  }
  function csvCell(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
  function toCSV(done) {
    const g = allTasks();
    const rows = [["Tab", "ID", "Cadence", "Priority", "Owner", "SLA", "Task", "Completed"]];
    Object.keys(g).forEach(tab => g[tab].forEach(x => rows.push([tab, x.id, x.cadence, x.priority, x.owner, x.sla, x.title, done[x.id] ? "Yes" : "No"])));
    return rows.map(r => r.map(csvCell).join(",")).join("\n");
  }
  function toJSON(done, theme) {
    const g = allTasks();
    const out = { exportedAt: new Date().toISOString(), app: "Senior HR Coordinator Command Center", theme: theme || null, progress: {}, tasks: [] };
    Object.keys(g).forEach(tab => {
      out.progress[tab] = progress(g[tab], done);
      g[tab].forEach(x => out.tasks.push({ tab, id: x.id, title: x.title, cadence: x.cadence, priority: x.priority, owner: x.owner, sla: x.sla, completed: !!done[x.id] }));
    });
    return JSON.stringify(out, null, 2);
  }

  const Logic = { OPERATIONS, LIFECYCLE, COMPLIANCE_CHECKS, COMPLIANCE_REFS, RETENTION, ER_STEPS, ER_ESCALATIONS, TEMPLATES, KPIS, MATRIX, PRIORITIES, allTasks, allTaskList, cadences, esc, progress, matches, toCSV, toJSON };

  /* ------------------------------------------------------------------ *
   * STORAGE
   * ------------------------------------------------------------------ */
  const KEY_DONE = "hrcc.done.v1";
  const KEY_THEME = "hrcc.theme";
  const KEY_INSTALL = "hrcc.installDismissed";
  function lsGet(k, fb) { try { const v = root.localStorage.getItem(k); return v === null ? fb : v; } catch (e) { return fb; } }
  function lsSet(k, v) { try { root.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { root.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  Logic.storage = { lsGet, lsSet, lsDel, KEY_DONE };

  /* ------------------------------------------------------------------ *
   * UI (browser only)
   * ------------------------------------------------------------------ */
  function initUI() {
    const doc = root.document;
    const $ = (s, c) => (c || doc).querySelector(s);
    const $$ = (s, c) => Array.from((c || doc).querySelectorAll(s));

    let done = {};
    try { done = JSON.parse(lsGet(KEY_DONE, "{}")) || {}; } catch (e) { done = {}; }
    const filters = { q: "", priority: "", cadence: "", hideDone: false };
    let activeTab = "operations";
    const TABS = ["operations", "lifecycle", "compliance", "toolkit"];

    /* ---------- render helpers ---------- */
    function taskHTML(x) {
      const isDone = !!done[x.id];
      const pIcon = x.priority === "High" ? "▲" : x.priority === "Medium" ? "■" : "▼";
      return '<label class="task' + (isDone ? " done" : "") + '" data-item data-id="' + x.id + '" data-priority="' + x.priority + '" data-cadence="' + esc(x.cadence) + '">' +
        '<span class="check-hit"><input type="checkbox" data-check="' + x.id + '"' + (isDone ? " checked" : "") + ' aria-label="Mark complete: ' + esc(x.title) + '"></span>' +
        '<span class="task-body"><span class="task-title">' + esc(x.title) + '</span>' +
        '<span class="task-detail">' + esc(x.detail) + '</span>' +
        '<span class="badges">' +
        '<span class="badge ' + x.priority.toLowerCase() + '"><span aria-hidden="true">' + pIcon + '</span> ' + x.priority + ' priority</span>' +
        '<span class="badge cadence"><span aria-hidden="true">🗓</span> ' + esc(x.cadence) + '</span>' +
        '<span class="badge owner"><span aria-hidden="true">👤</span> ' + esc(x.owner) + '</span>' +
        (x.sla ? '<span class="badge sla"><span aria-hidden="true">⏱</span> SLA: ' + esc(x.sla) + '</span>' : "") +
        '</span></span></label>';
    }
    function groupHead(title, list) {
      const p = progress(list, done);
      return '<div class="section-head"><h2>' + esc(title) + '</h2><span class="count" data-count-for="' + esc(title) + '">' + p.done + ' / ' + p.total + ' done</span></div>';
    }

    function renderOperations() {
      $("#panel-operations").innerHTML = OPERATIONS.map(g =>
        '<div class="group" data-group>' + groupHead(g.group, g.items) +
        '<div class="grid cols-2">' + g.items.map(taskHTML).join("") + '</div></div>').join("");
    }
    function renderLifecycle() {
      $("#panel-lifecycle").innerHTML =
        '<div class="callout"><strong>How to use:</strong> Open a stage, work the steps in order, and tick each step as complete. Owner and SLA tags show who acts and by when. Templates are in the Toolkit tab.</div>' +
        '<div class="workflow">' + LIFECYCLE.map((s, i) => {
          const p = progress(s.steps, done);
          return '<details class="wf group" data-group' + (i === 0 ? " open" : "") + '><summary><span>' + esc(s.title) + '<span class="wf-meta"><br>' + esc(s.summary) + ' · <span data-count-for="' + s.id + '">' + p.done + ' / ' + p.total + ' done</span></span></span></summary>' +
            '<div class="wf-body">' + s.steps.map(taskHTML).join("") + '</div></details>';
        }).join("") + '</div>';
    }
    function renderCompliance() {
      const refs = '<div class="group" data-group><div class="section-head"><h2>Compliance reference cards</h2></div><div class="grid cols-3">' +
        COMPLIANCE_REFS.map(r => '<article class="card" data-item data-text="' + esc((r.title + " " + r.body.join(" ")).replace(/<[^>]+>/g, "")) + '"><h3>' + esc(r.title) + '</h3><ul class="ref-list">' + r.body.map(b => "<li>" + b + "</li>").join("") + '</ul></article>').join("") + '</div></div>';
      const checks = COMPLIANCE_CHECKS.map(g => '<div class="group" data-group>' + groupHead(g.group, g.items) + '<div class="grid cols-2">' + g.items.map(taskHTML).join("") + '</div></div>').join("");
      const ret = '<div class="group" data-group><div class="section-head"><h2>Document retention timelines</h2></div>' +
        '<div class="callout warn" data-item data-text="retention note"><strong>Check before purging:</strong> state laws, contracts, audits or litigation holds can require longer retention than these federal baselines.</div>' +
        '<div class="table-wrap" data-item data-text="' + esc("retention " + RETENTION.map(r => r.join(" ")).join(" ")) + '"><table><caption class="sr-only">Retention schedule</caption><thead><tr><th scope="col">Record</th><th scope="col">Minimum retention</th><th scope="col">Where to keep it</th></tr></thead><tbody>' +
        RETENTION.map(r => "<tr><th scope=\"row\">" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>").join("") + '</tbody></table></div></div>';
      const er = '<div class="group" data-group><div class="section-head"><h2>Employee Relations intake &amp; triage protocol</h2></div><div class="grid cols-2">' +
        '<article class="card" data-item data-text="' + esc("employee relations intake steps " + ER_STEPS.join(" ")) + '"><h3>Intake steps</h3><ol class="ref-list">' + ER_STEPS.map(s => "<li>" + esc(s) + "</li>").join("") + '</ol></article>' +
        '<article class="card" data-item data-text="' + esc("immediate escalation triggers HRBP legal counsel " + ER_ESCALATIONS.join(" ")) + '"><h3><span aria-hidden="true">🚨</span> Escalate immediately to the HRBP / Legal Counsel</h3><ul class="ref-list">' + ER_ESCALATIONS.map(s => "<li>" + esc(s) + "</li>").join("") + '</ul></article></div></div>';
      $("#panel-compliance").innerHTML = refs + checks + ret + er;
    }
    function renderToolkit() {
      const tpls = '<div class="group" data-group><div class="section-head"><h2>One-tap HR templates</h2></div><div class="grid cols-2">' +
        TEMPLATES.map(x => '<article class="card" data-item data-text="' + esc(x.title + " " + x.use + " " + x.body) + '"><h3>' + esc(x.title) + '</h3><p class="muted">' + esc(x.use) + '</p><pre class="template-text" tabindex="0">' + esc(x.body) + '</pre><button class="btn primary" type="button" data-copy="' + x.id + '"><span aria-hidden="true">📋</span> Copy template</button></article>').join("") + '</div></div>';
      const kpis = '<div class="group" data-group><div class="section-head"><h2>KPI dashboard &amp; benchmarks</h2></div><div class="kpi-grid">' +
        KPIS.map(k => '<div class="kpi" data-item data-text="' + esc("kpi " + k.label + " " + k.formula) + '"><span class="value">' + esc(k.value) + '</span><span class="label">' + esc(k.label) + '</span><span class="formula">' + esc(k.formula) + '</span></div>').join("") + '</div></div>';
      const matrix = '<div class="group" data-group><div class="section-head"><h2>Senior vs. Junior HR Coordinator</h2></div>' +
        '<div class="table-wrap" data-item data-text="' + esc("senior junior differentiation matrix " + MATRIX.map(r => r.join(" ")).join(" ")) + '"><table><caption class="sr-only">Senior vs junior differentiation</caption><thead><tr><th scope="col">Dimension</th><th scope="col">Junior HR Coordinator</th><th scope="col">Senior HR Coordinator</th></tr></thead><tbody>' +
        MATRIX.map(r => '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>').join("") + '</tbody></table></div></div>';
      $("#panel-toolkit").innerHTML = tpls + kpis + matrix;
    }

    /* ---------- filters UI ---------- */
    function renderPills() {
      $("#priorityFilters").innerHTML = PRIORITIES.map(p => '<button type="button" class="pill" data-pf="' + p + '" aria-pressed="false">' + p + '</button>').join("");
      $("#cadenceFilters").innerHTML = cadences().map(c => '<button type="button" class="pill" data-cf="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>').join("");
    }

    function applyFilters() {
      const lookup = {};
      allTaskList().forEach(x => { lookup[x.id] = x; });
      const q = filters.q.trim().toLowerCase();
      const panel = $("#panel-" + activeTab);
      $$("[data-item]").forEach(el => {
        let ok = true;
        if (el.dataset.id) ok = matches(lookup[el.dataset.id], filters, done);
        else {
          const hay = (el.dataset.text || "").toLowerCase();
          if (q && q.split(/\s+/).some(w => hay.indexOf(w) === -1)) ok = false;
          // Reference cards, tables and templates carry no priority/cadence, so those filters hide them.
          if (filters.priority || filters.cadence) ok = false;
        }
        el.hidden = !ok;
      });
      $$("[data-group]").forEach(g => {
        const vis = $$("[data-item]", g).some(e => !e.hidden);
        g.hidden = !vis;
        if (vis && g.tagName === "DETAILS" && (q || filters.priority || filters.cadence)) g.open = true;
      });
      const visible = $$("[data-item]", panel).some(e => !e.hidden);
      $("#emptyState").hidden = visible;
    }

    /* ---------- progress ---------- */
    function updateProgress() {
      const all = allTaskList();
      const p = progress(all, done);
      const circ = 326.73;
      $("#ringFg").style.strokeDashoffset = String(circ - (circ * p.pct) / 100);
      $("#ringText").textContent = p.pct + "%";
      $("#overallRing").setAttribute("aria-label", "Overall completion " + p.pct + " percent");
      const bar = $("#overallBar");
      bar.setAttribute("aria-valuenow", String(p.pct));
      $("#overallBarFill").style.width = p.pct + "%";
      const g = allTasks();
      $("#overviewSummary").textContent = p.done + " of " + p.total + " items complete · Operations " + progress(g.operations, done).pct + "% · Lifecycle " + progress(g.lifecycle, done).pct + "% · Compliance " + progress(g.compliance, done).pct + "%";
      OPERATIONS.forEach(gr => { const el = $('[data-count-for="' + gr.group.replace(/"/g, '\\"') + '"]'); if (el) { const q = progress(gr.items, done); el.textContent = q.done + " / " + q.total + " done"; } });
      COMPLIANCE_CHECKS.forEach(gr => { const el = $('[data-count-for="' + gr.group.replace(/"/g, '\\"') + '"]'); if (el) { const q = progress(gr.items, done); el.textContent = q.done + " / " + q.total + " done"; } });
      LIFECYCLE.forEach(s => { const el = $('[data-count-for="' + s.id + '"]'); if (el) { const q = progress(s.steps, done); el.textContent = q.done + " / " + q.total + " done"; } });
    }

    /* ---------- toast ---------- */
    let toastTimer;
    function toast(msg) {
      const el = $("#toast");
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
    }

    /* ---------- tabs ---------- */
    function showTab(name, opts) {
      if (TABS.indexOf(name) === -1) name = "operations";
      activeTab = name;
      TABS.forEach(n => { const p = $("#panel-" + n); p.hidden = n !== name; });
      $$('[role="tab"]').forEach(b => {
        const on = b.dataset.tab === name;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });
      if (opts && opts.focus) {
        const sel = opts.focusMobile ? '[data-tablist-mobile] [data-tab="' + name + '"]' : '[data-tablist] [data-tab="' + name + '"]';
        const b = $(sel); if (b) b.focus();
      }
      if (!opts || opts.hash !== false) { try { root.history.replaceState(null, "", "#" + name); } catch (e) { /* ignore */ } }
      applyFilters();
      root.scrollTo({ top: 0, behavior: "auto" });
    }
    function bindTabs() {
      $$('[role="tablist"]').forEach(list => {
        list.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) showTab(b.dataset.tab); });
        list.addEventListener("keydown", e => {
          const tabs = $$('[role="tab"]', list);
          const i = tabs.indexOf(doc.activeElement);
          if (i === -1) return;
          let n = null;
          if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
          else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === "Home") n = 0;
          else if (e.key === "End") n = tabs.length - 1;
          if (n !== null) { e.preventDefault(); const mobile = list.hasAttribute("data-tablist-mobile"); showTab(tabs[n].dataset.tab, { focus: true, focusMobile: mobile }); }
        });
      });
      root.addEventListener("hashchange", () => showTab(root.location.hash.replace("#", ""), { hash: false }));
    }

    /* ---------- events ---------- */
    function bindMain() {
      doc.addEventListener("change", e => {
        const id = e.target && e.target.dataset && e.target.dataset.check;
        if (!id) return;
        if (e.target.checked) done[id] = true; else delete done[id];
        lsSet(KEY_DONE, JSON.stringify(done));
        const row = e.target.closest(".task"); if (row) row.classList.toggle("done", !!done[id]);
        updateProgress();
        if (filters.hideDone) applyFilters();
      });
      doc.addEventListener("click", e => {
        const copy = e.target.closest("[data-copy]");
        if (copy) {
          const tpl = TEMPLATES.filter(x => x.id === copy.dataset.copy)[0];
          copyText(tpl.body).then(ok => toast(ok ? "Copied!" : "Copy failed — select the text manually"));
          return;
        }
        const pf = e.target.closest("[data-pf]");
        if (pf) { filters.priority = filters.priority === pf.dataset.pf ? "" : pf.dataset.pf; syncPills(); applyFilters(); return; }
        const cf = e.target.closest("[data-cf]");
        if (cf) { filters.cadence = filters.cadence === cf.dataset.cf ? "" : cf.dataset.cf; syncPills(); applyFilters(); }
      });
      $("#searchInput").addEventListener("input", e => { filters.q = e.target.value; applyFilters(); });
      $("#hideDone").addEventListener("change", e => { filters.hideDone = e.target.checked; applyFilters(); });
      $("#clearFilters").addEventListener("click", () => {
        filters.q = ""; filters.priority = ""; filters.cadence = ""; filters.hideDone = false;
        $("#searchInput").value = ""; $("#hideDone").checked = false; syncPills(); applyFilters(); toast("Filters cleared");
      });
    }
    function syncPills() {
      $$("[data-pf]").forEach(b => b.setAttribute("aria-pressed", String(filters.priority === b.dataset.pf)));
      $$("[data-cf]").forEach(b => b.setAttribute("aria-pressed", String(filters.cadence === b.dataset.cf)));
    }
    function copyText(text) {
      if (root.navigator.clipboard && root.isSecureContext) {
        return root.navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
      }
      return Promise.resolve(fallbackCopy(text));
    }
    function fallbackCopy(text) {
      try {
        const ta = doc.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.fontSize = "16px";
        doc.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
        const ok = doc.execCommand("copy"); doc.body.removeChild(ta); return ok;
      } catch (e) { return false; }
    }

    /* ---------- theme ---------- */
    function effectiveTheme() {
      const saved = lsGet(KEY_THEME, "");
      if (saved === "light" || saved === "dark") return saved;
      return root.matchMedia && root.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    function applyTheme() {
      const saved = lsGet(KEY_THEME, "");
      if (saved) doc.documentElement.setAttribute("data-theme", saved); else doc.documentElement.removeAttribute("data-theme");
      $("#themeIcon").textContent = effectiveTheme() === "dark" ? "☀️" : "🌙";
    }
    function bindTheme() {
      $("#themeToggle").addEventListener("click", () => {
        lsSet(KEY_THEME, effectiveTheme() === "dark" ? "light" : "dark");
        applyTheme(); toast("Theme: " + effectiveTheme());
      });
      if (root.matchMedia) root.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
    }

    /* ---------- export / reset ---------- */
    function download(name, mime, content) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = doc.createElement("a");
      a.href = url; a.download = name; doc.body.appendChild(a); a.click();
      setTimeout(() => { doc.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
    }
    function bindMenu() {
      const dlg = $("#menuDialog");
      $("#menuBtn").addEventListener("click", () => { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
      $("#exportJson").addEventListener("click", () => { download("hr-progress.json", "application/json", toJSON(done, lsGet(KEY_THEME, ""))); toast("JSON exported"); });
      $("#exportCsv").addEventListener("click", () => { download("hr-progress.csv", "text/csv", toCSV(done)); toast("CSV exported"); });
      $("#resetAll").addEventListener("click", () => {
        if (!root.confirm("Reset all checklist progress on this device? This cannot be undone.")) return;
        done = {}; lsDel(KEY_DONE);
        $$("[data-check]").forEach(c => { c.checked = false; const r = c.closest(".task"); if (r) r.classList.remove("done"); });
        updateProgress(); applyFilters(); toast("Progress reset");
      });
    }

    /* ---------- offline + install ---------- */
    function bindNetwork() {
      const pill = $("#offlinePill");
      const sync = () => { pill.hidden = root.navigator.onLine; };
      root.addEventListener("online", () => { sync(); toast("Back online"); });
      root.addEventListener("offline", sync);
      sync();
    }
    function bindInstall() {
      const banner = $("#installBanner");
      const standalone = (root.matchMedia && root.matchMedia("(display-mode: standalone)").matches) || root.navigator.standalone === true;
      if (standalone || lsGet(KEY_INSTALL, "") === "1") return;
      let deferred = null;
      const ua = root.navigator.userAgent || "";
      const isIOS = /iphone|ipad|ipod/i.test(ua) || (root.navigator.platform === "MacIntel" && root.navigator.maxTouchPoints > 1);
      root.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("#installBtn").hidden = false; banner.hidden = false; });
      if (isIOS) {
        $("#installMsg").textContent = "In Safari tap the Share button, then “Add to Home Screen” for full-screen offline use.";
        setTimeout(() => { banner.hidden = false; }, 2500);
      }
      $("#installBtn").addEventListener("click", () => {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.finally(() => { deferred = null; banner.hidden = true; });
      });
      $("#installDismiss").addEventListener("click", () => { banner.hidden = true; lsSet(KEY_INSTALL, "1"); });
      root.addEventListener("appinstalled", () => { banner.hidden = true; toast("App installed"); });
    }
    function registerSW() {
      if (!("serviceWorker" in root.navigator)) return;
      root.addEventListener("load", () => { root.navigator.serviceWorker.register("./service-worker.js").catch(() => { /* offline support unavailable (e.g., file://) */ }); });
    }

    /* ---------- boot ---------- */
    renderOperations(); renderLifecycle(); renderCompliance(); renderToolkit(); renderPills();
    applyTheme(); bindTheme(); bindTabs(); bindMain(); bindMenu(); bindNetwork(); bindInstall(); registerSW();
    updateProgress();
    showTab(root.location.hash.replace("#", "") || "operations", { hash: false });
  }

  Logic.initUI = initUI;
  root.HRApp = Logic;
  if (typeof module !== "undefined" && module.exports) module.exports = Logic;
  if (root.document && root.document.getElementById && root.document.getElementById("main")) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", initUI);
    else initUI();
  }
})(typeof window !== "undefined" ? window : globalThis);
