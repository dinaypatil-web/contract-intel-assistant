import { LetterTone, QuestionnaireQuestion, ResponseMatrixRow } from '../types/contract';

export interface ScanResult {
  dangerousMatch: string;
  recommendation: string;
  reservation: string;
}

export interface DraftCorrectionFinding {
  id: string;
  matchedText: string;
  category: 'Admission of Delay' | 'Voluntary Cost Absorption' | 'Concession of Fault' | 'Waiver of Rights';
  issue: string;
  safeReplacement: string;
  severity: 'Critical' | 'Warning';
}

export interface MissingSafeguard {
  id: string;
  clause: string;
  title: string;
  description: string;
  suggestedText: string;
  importance: 'Mandatory' | 'Recommended';
  isPresent: boolean;
}

export interface DraftAuditResult {
  safetyScore: number; // 0 to 100
  toneSummary: string;
  assertiveness: 'Weak / Compromising' | 'Balanced' | 'Firm & Legally Guarded' | 'Dispute-Prepared';
  findings: DraftCorrectionFinding[];
  safeguards: MissingSafeguard[];
  autoCorrectedText: string;
}

export const DANGEROUS_PATTERNS: { 
  pattern: RegExp; 
  category: DraftCorrectionFinding['category'];
  issue: string; 
  safeReplacement: string;
  severity: 'Critical' | 'Warning';
}[] = [
  {
    pattern: /we accept (the )?delay|our delay|delay on our part|we apologize for the delay|we regret the delay/i,
    category: 'Admission of Delay',
    issue: 'Fatal concession of sole delay liability. Precludes claiming Extension of Time (EOT) or relief from Delay Damages.',
    safeReplacement: 'While we acknowledge the progress variance against the baseline schedule, such variance directly stems from events beyond Contractor control',
    severity: 'Critical'
  },
  {
    pattern: /we failed to (complete|mobilize|deliver|achieve)|failure on our part|our failure/i,
    category: 'Concession of Fault',
    issue: 'Self-admission of contractual default under Clause 15.2, risking unilateral termination or formal warnings.',
    safeReplacement: 'Progress was unavoidably impeded due to site access, design clarifications, and external physical constraints',
    severity: 'Critical'
  },
  {
    pattern: /(the )?contractor is responsible|our responsibility|we take responsibility/i,
    category: 'Concession of Fault',
    issue: 'Concession of legal liability transferring employer risks and third-party utility delays entirely to the Contractor.',
    safeReplacement: 'Contractual responsibility for the underlying critical path hindrance rests with the Employer / Authorities',
    severity: 'Critical'
  },
  {
    pattern: /we have no objection|we agree unconditionally|without any claim|waive our right/i,
    category: 'Waiver of Rights',
    issue: 'Unconditional consent waiving mandatory contractual rights to claim cost, variations, or time extensions.',
    safeReplacement: 'Subject to our contractual rights and strictly without prejudice to cost and time entitlements under the Contract',
    severity: 'Critical'
  },
  {
    pattern: /at (our|our own) (cost|expense|risk and cost)|at any cost|free of cost|without additional (payment|cost|charge)/i,
    category: 'Voluntary Cost Absorption',
    issue: 'Voluntary assumption of uncompensated acceleration and resource expenditure without Variation reimbursement.',
    safeReplacement: 'Subject to formal variation instruction and cost reimbursement under Sub-Clause 13.3 [Variation Procedure]',
    severity: 'Critical'
  },
  {
    pattern: /due to our negligence|due to our fault|our mistake|our oversight|attributable solely to the contractor/i,
    category: 'Concession of Fault',
    issue: 'Concession of negligence voiding indemnity, insurance protections, and liability limitation caps.',
    safeReplacement: 'Arising from unforeseen physical conditions and delayed approvals beyond the Contractor\'s reasonable control',
    severity: 'Critical'
  },
  {
    pattern: /we agree to (liquidated|delay) damages|delay damages may be deducted|we accept delay damages|penalty may be levied/i,
    category: 'Waiver of Rights',
    issue: 'Premature concession of Delay Damages / Liquidated Damages liability before formal Engineer determination.',
    safeReplacement: 'The Contractor formally refutes any entitlement of the Employer to levy Delay Damages while legitimate EOT claims remain pending',
    severity: 'Critical'
  }
];

export function scanForDangerousPhrases(text: string): ScanResult[] {
  const results: ScanResult[] = [];
  for (const item of DANGEROUS_PATTERNS) {
    if (item.pattern.test(text)) {
      results.push({
        dangerousMatch: item.pattern.source,
        recommendation: item.issue,
        reservation: item.safeReplacement
      });
    }
  }
  return results;
}

export function auditDraftLetter(text: string): DraftAuditResult {
  const findings: DraftCorrectionFinding[] = [];
  let corrected = text;

  // 1. Scan for dangerous phrases
  DANGEROUS_PATTERNS.forEach((rule, idx) => {
    const matches = text.match(new RegExp(rule.pattern, 'gi'));
    if (matches) {
      matches.forEach((matchedStr) => {
        findings.push({
          id: `find-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          matchedText: matchedStr,
          category: rule.category,
          issue: rule.issue,
          safeReplacement: rule.safeReplacement,
          severity: rule.severity
        });
      });
      // Replace in auto-corrected version
      corrected = corrected.replace(new RegExp(rule.pattern, 'gi'), rule.safeReplacement);
    }
  });

  // 2. Check for missing safeguards
  const hasWithoutPrejudice = /without prejudice/i.test(text);
  const hasEOTReservation = /extension of time|sub-clause 8\.4|sub-clause 20\.2|eot/i.test(text);
  const hasCostReservation = /variation|additional payment|sub-clause 13\.3|compensation/i.test(text);
  const hasRecordsCitation = /contemporaneous records|daily progress report|site log|joint survey/i.test(text);
  const hasPrecedenceRef = /order of precedence|sub-clause 1\.5|priority of documents/i.test(text);

  const safeguards: MissingSafeguard[] = [
    {
      id: 'sg-wp',
      clause: 'General Contract Law',
      title: 'Formal "Without Prejudice" Reservation Header',
      description: 'Protects the correspondence from being treated as a binding concession or estoppel in future adjudication or arbitration.',
      suggestedText: 'This communication is submitted strictly WITHOUT PREJUDICE to all rights, claims, remedies, and entitlements of the Contractor under the Contract and applicable law.',
      importance: 'Mandatory',
      isPresent: hasWithoutPrejudice
    },
    {
      id: 'sg-eot',
      clause: 'Sub-Clause 8.4 & 20.2',
      title: 'Extension of Time (EOT) Rights Reservation',
      description: 'Preserves the right to claim time extensions and protects against premature levy of delay damages.',
      suggestedText: 'The Contractor explicitly preserves its full entitlements to an Extension of Time for Completion under Sub-Clause 8.4 and Sub-Clause 20.2 for all critical path delay events.',
      importance: 'Mandatory',
      isPresent: hasEOTReservation
    },
    {
      id: 'sg-cost',
      clause: 'Sub-Clause 13.3 & 20.2',
      title: 'Variation & Additional Cost Entitlement Reservation',
      description: 'Rebuts uncompensated acceleration directives and establishes entitlement to variation payment.',
      suggestedText: 'Any directed alteration of the sequence, rate of progress, or working hours constitutes a Variation under Sub-Clause 13.3, for which full reimbursement of all direct, indirect, and prolongation costs is claimed.',
      importance: 'Mandatory',
      isPresent: hasCostReservation
    },
    {
      id: 'sg-records',
      clause: 'Sub-Clause 20.2(b)',
      title: 'Citation of Contemporaneous Records',
      description: 'Grounds contractor arguments in contemporaneous site logs, daily progress reports, and joint protocols.',
      suggestedText: 'The factual position set forth herein is fully substantiated by contemporary Daily Progress Reports, joint inspection records, and progress correspondence on record.',
      importance: 'Recommended',
      isPresent: hasRecordsCitation
    },
    {
      id: 'sg-precedence',
      clause: 'Sub-Clause 1.5',
      title: 'Contract Priority of Documents Invocation',
      description: 'Invokes the governing order of precedence to defeat conflicting specifications, notes, or lower-tier directions.',
      suggestedText: 'Pursuant to Sub-Clause 1.5 [Priority of Documents], the Particular Conditions of Contract strictly prevail over any conflicting general clauses, drawings, or engineer instructions.',
      importance: 'Recommended',
      isPresent: hasPrecedenceRef
    }
  ];

  // 3. Calculate safety score
  let score = 100;
  findings.forEach(f => {
    score -= f.severity === 'Critical' ? 18 : 8;
  });
  safeguards.forEach(s => {
    if (!s.isPresent) {
      score -= s.importance === 'Mandatory' ? 12 : 6;
    }
  });
  const safetyScore = Math.max(10, Math.min(100, score));

  // 4. Determine tone assessment
  let assertiveness: DraftAuditResult['assertiveness'] = 'Balanced';
  let toneSummary = 'The letter maintains a balanced contractual dialogue.';
  if (findings.length > 0 && safetyScore < 60) {
    assertiveness = 'Weak / Compromising';
    toneSummary = 'CRITICAL WARNING: The draft contains self-incriminating phrases and concessions that severely weaken your commercial and legal position.';
  } else if (safetyScore >= 85) {
    assertiveness = 'Firm & Legally Guarded';
    toneSummary = 'STRONG POSITION: The letter is well-guarded, includes required reservations of rights, and contains zero dangerous delay admissions.';
  } else if (/dispute|arbitrat|daab|breach/i.test(text)) {
    assertiveness = 'Dispute-Prepared';
    toneSummary = 'HIGH ASSERTIVENESS: The draft is structured as a formal dispute brief for escalation before DAAB or Arbitral Tribunal.';
  }

  // 5. Append missing mandatory reservation if absent
  if (!hasWithoutPrejudice) {
    corrected += `\n\nRESERVATION OF RIGHTS:\n${safeguards[0].suggestedText}`;
  }

  return {
    safetyScore,
    toneSummary,
    assertiveness,
    findings,
    safeguards,
    autoCorrectedText: corrected
  };
}

export function generateFormalContractReply(
  tone: LetterTone,
  refNumber: string,
  incomingRef: string,
  incomingDate: string,
  clientName: string,
  contractorName: string,
  projectCode: string,
  questionnaire: QuestionnaireQuestion[],
  responseMatrix: ResponseMatrixRow[]
): string {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  let tonePreamble = '';
  let toneStyleClosing = '';

  switch (tone) {
    case 'Firm Contractual':
      tonePreamble = `We write with specific reference to your communication referenced above. Having reviewed the assertions and directives contained therein against the Conditions of Contract and contemporaneous project records, the Contractor hereby places on formal record its categorical rejection of any allegation attributing delay culpability to the Contractor. Furthermore, the directive issued under Sub-Clause 8.6 is legally misconceived in light of prevailing Employer delay events and pending Extension of Time notices.`;
      toneStyleClosing = `We trust the Engineer will objectively discharge its contractual obligations pursuant to Sub-Clause 3.7 [Agreement or Determination] and proceed with the immediate fair determination of pending EOT submissions. All rights, remedies, and entitlements available to the Contractor under the Contract and applicable law remain strictly reserved.`;
      break;

    case 'Strong Contractual Defense':
      tonePreamble = `We refer to your letter referenced above. Please be unequivocally advised that your instruction to expedite progress under Sub-Clause 8.6 at the Contractor's sole risk and expense is ultra vires and fundamentally contradicted by the express terms of the Contract. The critical path hindrances experienced to date are directly attributable to Employer risk events, site handover constraints, and delayed instructions.`;
      toneStyleClosing = `Notice is hereby given that should the Employer or Engineer purport to enforce deductions of delay damages under Sub-Clause 8.7 or unilateral withholding without fair determination of legitimate EOT claims, such action will be treated as an unlawful act and material breach of contract, entitling the Contractor to finance charges, suspension of works under Sub-Clause 16.1, and referral to the Dispute Avoidance/Adjudication Board (DAAB).`;
      break;

    case 'Diplomatic & Collaborative':
      tonePreamble = `We thank you for your communication referenced above. We fully share the Employer's and Engineer's objective of achieving timely project milestone completion in the most expeditious and safe manner. In the spirit of mutual cooperation and partnering, we wish to clarify the factual background and outline a collaborative way forward that protects both project progress and contractual equity.`;
      toneStyleClosing = `We welcome an immediate senior-level technical alignment meeting to finalize an agreed recovery plan and necessary Variation Order for supplemental expediting resources. We remain committed to project success while naturally maintaining our contractual protections.`;
      break;

    case 'Senior-Management Level':
      tonePreamble = `The Executive Leadership of ${contractorName} has taken note of your communication. While we acknowledge the critical importance of milestone targets to the project commissioning schedule, we must place on record our serious concern regarding the mischaracterization of site progress and the unwarranted invocation of Sub-Clause 8.6 penalty provisions. The project records clearly demonstrate that our execution team has diligently mitigated constraints beyond our control.`;
      toneStyleClosing = `We propose that a Joint Executive Steering Committee meeting be convened between the Employer, the Engineer / PMC, and our Executive Leadership within 5 business days to establish an equitable commercial and scheduling baseline.`;
      break;

    case 'Dispute-Prepared':
      tonePreamble = `FORMAL CONTRACTUAL REBUTTAL & STATEMENT OF POSITION PURSUANT TO SUB-CLAUSE 1.9, SUB-CLAUSE 2.1, SUB-CLAUSE 8.4, AND SUB-CLAUSE 20.2.
Take formal notice that the Contractor categorically refutes the entirety of the factual allegations and contractual assertions set forth in Letter ${incomingRef}. This letter constitutes a formal contemporaneous rebuttal and notice of constructive acceleration.`;
      toneStyleClosing = `This communication is submitted without prejudice to any past, present, or future claims, entitlements, or rights under the Contract, in equity, or at law. The Contractor expressly reserves its right to produce this correspondence and supporting documentary exhibits before any Dispute Avoidance/Adjudication Board (DAAB) or Arbitral Tribunal constituted under Clause 21.`;
      break;

    case 'Professional & Objective':
    default:
      tonePreamble = `We acknowledge receipt of your letter regarding project progress and execution milestones. We provide herein a detailed, factually grounded and contractually structured response addressing each item raised in your communication.`;
      toneStyleClosing = `We trust this clarifies the contractual position. We remain available to discuss the revised programme submissions at your earliest convenience, with our contractual rights and entitlements expressly reserved.`;
      break;
  }

  // Questionnaire facts synthesis
  const delayCause = questionnaire.find(q => q.id === 'q-1')?.userAnswer || 'Employer risk events, site access hindrances, and external obstructions';
  const noticeStatus = questionnaire.find(q => q.id === 'q-2')?.userAnswer || 'Notice of Claim duly submitted within mandatory 28-day time-bar';

  // Build clause matrix text
  const matrixText = responseMatrix.map((row, idx) => `
${idx + 1}. Item: "${row.clientStatement}"
   - Governing Contract Clauses: ${row.contractReference}
   - Contractor Position: ${row.ourPosition}
   - Substantiating Contemporary Evidence: ${row.evidenceRequired}
   - Contractual Stance: ${row.proposedResponse}
`).join('');

  return `Ref: ${refNumber}
Date: ${currentDate}

To:
${clientName}
Attn: The Engineer's Representative / Project Director

PROJECT: ${projectCode}
SUBJECT: Formal Response to Letter Ref: ${incomingRef} dated ${incomingDate} regarding Site Progress, Rate of Progress under Sub-Clause 8.6, and Preservation of Extension of Time Rights.

Dear Sir,

1. OPENING POSITION & PREAMBLE
${tonePreamble}

2. FACTUAL BACKGROUND & CONTEMPORARY RECORDS
The Contractor must place on formal record the factual circumstances regarding the progress variance:
a) Root Cause of Critical Path Variance: As recorded in contemporary Daily Progress Reports and joint survey protocols, the delay was directly caused by: ${delayCause}.
b) Contractual Notice Compliance: ${noticeStatus}. The Contractor has strictly fulfilled all mandatory notice provisions under Sub-Clause 20.2, precluding any allegation of time-bar or failure to notify.
c) Duty to Mitigate: The Contractor has deployed reasonable re-sequencing and staging adjustments to minimize delay impacts.

3. CONTRACTUAL EVALUATION OF SUB-CLAUSE 8.6 & DIRECTED ACCELERATION
Your instruction directing the Contractor to expedite works and institute accelerated operations at the Contractor's sole cost under Sub-Clause 8.6 is contractually untenable:
a) The text of Sub-Clause 8.6 contains the express limiting condition: "other than as a result of a cause listed in Sub-Clause 8.4 [Extension of Time for Completion]".
b) Because the delay arises from qualifying Employer risk events under Sub-Clause 8.4, the Engineer has no contractual authority to mandate uncompensated acceleration.
c) Compelling the Contractor to compress the construction schedule while concurrently withholding legitimate EOT determinations constitutes "Constructive Acceleration", compensable as a Variation under Sub-Clause 13.3.

4. CLAUSE-BY-CLAUSE REBUTTAL MATRIX
${matrixText}

5. PROPOSED ACTION & PROGRAMME SUBMISSION
In compliance with our duty to mitigate and to demonstrate our commitment to project completion, the Contractor shall submit within the contractual period:
a) Impacted EOT Schedule: Reflecting the critical path delay impact in accordance with standard time-impact principles.
b) Conditional Acceleration Schedule: Demonstrating the operational feasibility of accelerated completion, contingent upon the Employer issuing a formal Variation Order under Sub-Clause 13.3 covering all incurred mobilization, overtime, and equipment costs.

6. RESERVATION OF CONTRACTUAL RIGHTS
This letter is written WITHOUT PREJUDICE to all rights, remedies, claims, and entitlements of the Contractor under the Contract, at law, and in equity. Nothing contained herein or in any accompanying submission shall be construed as an admission of liability, acceptance of delay culpability, or waiver of our Extension of Time and financial claims.

7. CLOSING
${toneStyleClosing}

Yours faithfully,

For and on behalf of
${contractorName}

_______________________________
Authorized Signatory / Project Director

Encl:
1. Annexure A: Contemporaneous Joint Survey Records & Daily Progress Reports
2. Annexure B: Formal Notice of Claim Submission Acknowledgement Copies
3. Annexure C: Resource & Rate Breakdown for Instructed Acceleration Measures`;
}
