import { LetterTone, QuestionnaireQuestion, ResponseMatrixRow } from '../types/contract';

export interface ScanResult {
  dangerousMatch: string;
  recommendation: string;
  reservation: string;
}

export const DANGEROUS_PATTERNS: { pattern: RegExp; issue: string; safeReplacement: string }[] = [
  {
    pattern: /we accept (the )?delay/i,
    issue: 'Fatal admission of delay liability. Precludes claiming EOT or concurrent delay.',
    safeReplacement: 'While we acknowledge the schedule variance, such variance directly stems from events beyond Contractor control'
  },
  {
    pattern: /we failed to (complete|mobilize|deliver)/i,
    issue: 'Admission of contractual default under Clause 15.2.',
    safeReplacement: 'Progress was unavoidably impeded due to site access and external constraints'
  },
  {
    pattern: /(the )?contractor is responsible/i,
    issue: 'Self-incriminating statement conceding legal liability.',
    safeReplacement: 'Responsibility for the underlying critical path hindrance rests with the Employer / Authorities'
  },
  {
    pattern: /we have no objection/i,
    issue: 'Unconditional consent waiving contractual rights to claim variations or time.',
    safeReplacement: 'Subject to our contractual rights and without prejudice to cost and time entitlements'
  },
  {
    pattern: /at any cost/i,
    issue: 'Voluntary assumption of uncompensated acceleration expenditure.',
    safeReplacement: 'Subject to formal variation instruction and reimbursement under Clause 13.3'
  },
  {
    pattern: /due to our negligence|due to our fault/i,
    issue: 'Concession of negligence voiding indemnity and insurance protections.',
    safeReplacement: 'Arising from unforeseen physical impediments and delayed instructions'
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
      tonePreamble = `We write with specific reference to your communication referenced above. Having reviewed the assertions and directives contained therein against the Conditions of Contract and contemporaneous project records, the Contractor hereby places on formal record its categorical rejection of any allegation attributing sole delay to the Contractor. Furthermore, the directive issued under Sub-Clause 8.6 is legally misconceived in light of prevailing Employer delay events.`;
      toneStyleClosing = `We trust the Engineer will objectively discharge its contractual obligations pursuant to Sub-Clause 3.7 [Agreement or Determination] and proceed with the immediate fair determination of pending EOT Claim No. 03. All rights and remedies available to the Contractor under the Contract and applicable law remain strictly reserved.`;
      break;

    case 'Strong Contractual Defense':
      tonePreamble = `We refer to your letter regarding Pier Cap erections P102-P140. Please be unequivocally advised that your instruction to expedite progress under Sub-Clause 8.6 at the Contractor's sole risk and expense is ultra vires and fundamentally contradicted by the express terms of the Contract. The critical path delays experienced to date are directly attributable to Employer hindrances, notably the prolonged presence of energized 132kV high-tension powerlines and belated foundation design releases.`;
      toneStyleClosing = `Notice is hereby given that should the Employer or Engineer purport to enforce deductions of delay damages under Sub-Clause 8.7 or unilateral withholding, such action will be treated as an unlawful act and material breach of contract, entitling the Contractor to finance charges, suspension of works under Sub-Clause 16.1, and referral to the Dispute Avoidance/Adjudication Board (DAAB).`;
      break;

    case 'Diplomatic & Collaborative':
      tonePreamble = `We thank you for your communication regarding the progress of Pier Cap erections between P102 and P140. We fully share the Employer's and Engineer's objective of achieving Key Milestone No. 3 in the most expeditious and safe manner. In the spirit of mutual cooperation and partnering, we wish to clarify the factual background and outline a collaborative way forward that protects both project progress and contractual equity.`;
      toneStyleClosing = `We welcome an immediate senior-level technical alignment meeting to finalize the proposed dual-schedule recovery plan and agreed Variation Order for supplemental resources. We remain committed to project success while naturally maintaining our contractual protections.`;
      break;

    case 'Senior-Management Level':
      tonePreamble = `The Executive Leadership of ${contractorName} has taken note of your letter. While we acknowledge the importance of Key Milestone 3 to the Metro Line 4 commissioning schedule, we must place on record our serious concern regarding the mischaracterization of site progress and the unwarranted invocation of Sub-Clause 8.6 penalty provisions. The project records clearly demonstrate that our execution team has diligently mitigated significant third-party and utility constraints beyond our control.`;
      toneStyleClosing = `We propose that a Joint Executive Steering Committee meeting be convened between the Managing Director of the Employer, the PMC Project Director, and our Consortium Leadership within 5 business days to establish an equitable commercial and scheduling baseline.`;
      break;

    case 'Dispute-Prepared':
      tonePreamble = `FORMAL CONTRACTUAL REBUTTAL & STATEMENT OF POSITION PURSUANT TO SUB-CLAUSE 1.9, SUB-CLAUSE 2.1, SUB-CLAUSE 8.4, AND SUB-CLAUSE 20.2.
Take formal notice that the Contractor categorically refutes the entirety of the factual allegations and contractual assertions set forth in Engineer's Letter ${incomingRef}. This letter constitutes a formal contemporaneous rebuttal and notice of constructive acceleration.`;
      toneStyleClosing = `This communication is submitted without prejudice to any past, present, or future claims, entitlements, or rights under the Contract, in equity, or at law. The Contractor expressly reserves its right to produce this correspondence and supporting documentary exhibits before any Dispute Avoidance/Adjudication Board (DAAB) or Arbitral Tribunal constituted under Clause 21.`;
      break;

    case 'Professional & Objective':
    default:
      tonePreamble = `We acknowledge receipt of your letter regarding the execution progress of Pier Caps between Pier P102 and Pier P140. We provide herein a detailed, factually grounded and contractually structured response addressing each item raised in your letter.`;
      toneStyleClosing = `We trust this clarifies the contractual position. We remain available to discuss the revised programme submissions at your earliest convenience, with our contractual rights and entitlements expressly reserved.`;
      break;
  }

  // Questionnaire facts synthesis
  const delayCause = questionnaire.find(q => q.id === 'q-1')?.userAnswer || 'Employer risk events and site obstructions';
  const noticeStatus = questionnaire.find(q => q.id === 'q-2')?.userAnswer || 'Notice of Delay duly submitted within time-bar';
  const accessStatus = questionnaire.find(q => q.id === 'q-3')?.userAnswer || 'Overhead powerline clearance delayed';
  const costEstimate = questionnaire.find(q => q.id === 'q-5')?.userAnswer || '$1,840,000 in additional equipment and multi-shift overtime';

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

PROJECT: ${projectCode} - Metro Line 4 Viaduct Package C-02
SUBJECT: Formal Response to Engineer's Letter Ref: ${incomingRef} dated ${incomingDate} regarding Progress between Pier P102 - P140, Sub-Clause 8.6, and Preservation of Extension of Time Rights.

Dear Sir,

1. OPENING POSITION & PREAMBLE
${tonePreamble}

2. FACTUAL BACKGROUND & CONTEMPORARY RECORDS
The Contractor must correct the inaccurate narrative presented in your letter regarding the causes of the 48-day variance on Pier P102 to P140:
a) Root Cause of Critical Path Variance: As recorded in contemporary Daily Progress Reports and joint survey protocols, the critical delay was directly caused by: ${delayCause}.
b) Status of Site Access & Safety Restraints: ${accessStatus}. Under statutory high-voltage electricity safety rules, heavy crawler crane boom operations were strictly prohibited until utility de-energization.
c) Contractual Notice Compliance: ${noticeStatus}. The Contractor has strictly fulfilled all mandatory notice provisions under Sub-Clause 20.2, precluding any allegation of time-bar or failure to notify.

3. CONTRACTUAL EVALUATION OF SUB-CLAUSE 8.6 & DIRECTED ACCELERATION
Your instruction directing the Contractor to mobilize 2 additional 150 MT crawler cranes and institute 24/7 continuous operations at the Contractor's sole cost under Sub-Clause 8.6 is contractually untenable:
a) The text of Sub-Clause 8.6 contains the express limiting condition: "other than as a result of a cause listed in Sub-Clause 8.4 [Extension of Time for Completion]".
b) Because the delay arises from qualifying Employer risk events under Sub-Clause 8.4(d) [impediments caused by Employer/Authorities] and Sub-Clause 1.9 [delayed drawings], the Engineer has no contractual authority to mandate uncompensated acceleration.
c) Compelling the Contractor to compress the construction schedule while concurrently withholding legitimate EOT determinations constitutes "Constructive Acceleration", compensable as a Variation under Sub-Clause 13.3.
d) The provisional cost impact of implementing your expedited working directive is estimated at ${costEstimate}.

4. CLAUSE-BY-CLAUSE REBUTTAL MATRIX
${matrixText}

5. PROPOSED ACTION & DUAL-PROGRAMME SUBMISSION
In compliance with our duty to mitigate and to demonstrate our commitment to milestone achievement, the Contractor shall submit within the 7-day period two distinct programme schedules:
a) Programme Schedule 'A' (Impacted EOT Schedule): Fully reflecting the 54 calendar day time extension under Claim No. 03 as mandated by standard critical path time-impact principles.
b) Programme Schedule 'B' (Conditional Acceleration Schedule): Demonstrating the operational feasibility of meeting the target milestone, contingent upon the Employer issuing a formal Variation Order VO under Sub-Clause 13.3 covering all incurred mobilization, overtime, and equipment costs.

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
1. Annexure A: Contemporaneous Joint Survey Record & HT Line Clearance Logs
2. Annexure B: Notice of Delay APX/MRC/NOT-42 Acknowledgement Copy
3. Annexure C: Resource & Cost Breakdown for Instructed Acceleration Measures`;
}
