import { IncomingLetterReview } from '../types/contract';

export const mockLetters: IncomingLetterReview[] = [
  {
    id: 'let-pmc-accel-45',
    projectId: 'proj-metro-c02',
    sender: 'Egis-Systra-Ayesa Consortium (Engineer / PMC)',
    recipient: 'Apex Infrastructure - Larsen Civil JV (Contractor)',
    date: '2026-08-12',
    refNumber: 'PMC/MRCL/L4-C02/2026/LTR-1482',
    subject: 'CRITICAL NOTICE: Failure to Achieve Planned Progress in Viaduct Section Pier P102 to P140; Instruction to Expedite Works under Clause 8.6 at Contractor\'s Own Cost; Threat of Delay Damages under Clause 8.7',
    riskScore: 'Critical',
    riskScoreExplanation: 'The PMC is attempting to establish sole Contractor culpability for a 48-day critical path delay, directing unilateral acceleration at Contractor expense under Clause 8.6 while ignoring pending Contractor EOT notices under Clauses 1.9, 2.1, and 8.4 regarding municipal utility clash hindrances.',
    originalText: `Ref: PMC/MRCL/L4-C02/2026/LTR-1482                                 Date: 12 August 2026

To:
The Project Director,
Apex Infrastructure - Larsen Civil JV,
Site Office: Cast Yard Area, Metro Line 4 Package C-02

SUBJECT: Failure to Achieve Planned Progress on Pier Cap Erections (P102 - P140); Instruction to Accelerate Works under Clause 8.6; Preservation of Employer's Rights to Liquidated Damages under Clause 8.7.

Dear Sir,

1. We refer to the Approved Baseline Programme Rev. 04 and our monthly progress review meeting held on 5 August 2026.

2. A joint inspection conducted on 10 August 2026 confirms that execution of Pier Caps between Chainage Ch. 12+400 and Ch. 14+200 (Pier P102 to Pier P140) is currently lagging behind the approved schedule by 48 calendar days. This delay lies directly on the Project Critical Path and directly threatens Key Milestone No. 3 (Viaduct Superstructure Handover for Trackwork due 15 November 2026).

3. The Engineer hereby records that this cumulative delay is solely attributable to the Contractor's gross failure to mobilize sufficient heavy crawler cranes (150 MT capacity) and qualified post-tensioning specialist crews, as well as inefficient staging management in the casting yard.

4. Consequently, in accordance with Sub-Clause 8.6 [Rate of Progress] of the Conditions of Contract, the Engineer hereby formally INSTRUCTS the Contractor to:
   (a) Immediately mobilize two (2) additional 150 MT mobile cranes and triple-shift erection gangs;
   (b) Work 24/7 continuous operations, including Sundays and public holidays;
   (c) Submit within seven (7) days of this letter a detailed Revised Recovery Programme under Sub-Clause 8.3 showing completion of Milestone 3 without any time extension;
   (d) All additional resources and expediting measures shall be executed entirely at the Contractor's own risk and cost as mandated by Clause 8.6.

5. Take notice that the Employer does not accept any liability for additional costs resulting from this acceleration instruction. Furthermore, should the Contractor fail to achieve Key Milestone 3 by 15 November 2026, the Employer shall immediately levy Delay Damages under Sub-Clause 8.7 at the rate of USD 38,500 per day without further warning.

6. Continued failure to recover the delay will be treated as persistent failure under Sub-Clause 15.2 [Termination by Employer].

Yours faithfully,

Dr. Marcus Vance, P.E.
The Engineer\'s Representative & Project Director
Egis-Systra-Ayesa Consortium (PMC)
Copy to: Managing Director, Metro Rail Corporation Ltd.`,
    extractedData: {
      instructions: [
        'Mobilize two (2) additional 150 MT crawler cranes and triple-shift erection gangs immediately.',
        'Implement 24/7 continuous working hours including Sundays and public holidays.',
        'Submit a revised recovery schedule under Clause 8.3 within 7 days without altering Milestone 3 date.',
        'Absorb all acceleration, overtime, and equipment costs entirely at Contractor\'s expense.'
      ],
      allegations: [
        'Contractor is solely responsible for 48 calendar days delay between P102 and P140.',
        'Delay is due to Contractor failure to mobilize cranes and specialist post-tensioning crews.',
        'Inefficient staging and yard management caused the production backlog.',
        'Contractor is in potential default triggering Clause 15.2 termination risk.'
      ],
      deadlines: [
        '7 Calendar Days (19 August 2026): Submission of Revised Recovery Programme.',
        '15 November 2026: Key Milestone No. 3 target date for Delay Damages imposition.'
      ],
      clausesCited: [
        'Sub-Clause 8.3 [Programme]',
        'Sub-Clause 8.6 [Rate of Progress]',
        'Sub-Clause 8.7 [Delay Damages]',
        'Sub-Clause 15.2 [Termination by Employer]'
      ],
      financialImplications: 'Forced uncompensated acceleration estimated at $1,850,000 in additional plant and overtime. Threat of Delay Damages at $38,500/day capped at 10% ($38,500,000).',
      timeImplications: '48 days critical path delay. Denial of pending Contractor entitlement for 54 days EOT regarding 132kV overhead powerline diversion delays.',
      potentialContractualConsequences: [
        'Unqualified compliance with Clause 8.6 will waive Contractor\'s right to claim acceleration costs under Clause 13.3.',
        'Failure to rebut PMC\'s allegation of sole contractor fault creates a dangerous contemporaneous admission in project records.',
        'Acceptance of 15 November 2026 milestone without reserving EOT rights bars future prolongation claims.'
      ]
    },
    crossCheck: [
      {
        id: 'chk-1',
        statement: 'Contractor is solely responsible for 48 calendar days delay between Pier P102 and Pier P140.',
        status: 'Not Supported',
        clausesCited: [
          {
            clauseNumber: 'PC 1.9',
            title: 'Delayed Drawings or Instructions',
            volumeNumber: 'Volume 1',
            pageNumber: 24,
            excerpt: 'If Contractor suffers delay from failure of Engineer to issue drawings... Contractor entitled to EOT and Cost plus profit.'
          },
          {
            clauseNumber: 'PC 2.1',
            title: 'Right of Access to the Site',
            volumeNumber: 'Volume 1',
            pageNumber: 31,
            excerpt: 'Employer shall give access... failure gives entitlement to EOT and Cost.'
          },
          {
            clauseNumber: 'PC 8.5',
            title: 'Delays Caused by Authorities',
            volumeNumber: 'Volume 1',
            pageNumber: 91,
            excerpt: 'Unforeseeable delay by public authorities considered an Employer delay event under 8.4(d).'
          }
        ],
        analysis: 'The PMC assertion directly ignores contemporaneous Contractor Notices: (1) Notice of Delay Ref. APX/MRC/NOT-42 dated 18 May 2026 regarding unshifted 132kV overhead high-tension powerline between P112-P118; and (2) RFI-284 regarding revised pier foundation coordinates issued 34 days late by PMC. Under PC 8.5 and PC 2.1, this delay is an Employer risk event qualifying for EOT.'
      },
      {
        id: 'chk-2',
        statement: 'Contractor must accelerate at its own risk and cost as mandated by Clause 8.6.',
        status: 'Potentially Contradictory',
        clausesCited: [
          {
            clauseNumber: 'PC 8.6',
            title: 'Rate of Progress & Acceleration',
            volumeNumber: 'Volume 1',
            pageNumber: 93,
            excerpt: 'Adopt revised methods at Contractor risk and cost OTHER than as a result of a cause listed in Sub-Clause 8.4 [Extension of Time].'
          },
          {
            clauseNumber: 'PC 13.3',
            title: 'Variation Procedure (Constructive Acceleration)',
            volumeNumber: 'Volume 1',
            pageNumber: 132,
            excerpt: 'Instructed acceleration prior to determining valid EOT constitutes Variation compensable under 13.3.'
          }
        ],
        analysis: 'Clause 8.6 explicitly contains the limiting proviso: "other than as a result of a cause listed in Sub-Clause 8.4". Because Contractor submitted timely EOT Notice under Sub-Clause 8.4(d), PMC cannot instruct acceleration at Contractor cost. Compelling acceleration while refusing to grant legitimate EOT constitutes "Constructive Acceleration", entitling Contractor to compensation under Clause 13.3.'
      },
      {
        id: 'chk-3',
        statement: 'Submit within 7 days a detailed Revised Recovery Programme under Sub-Clause 8.3.',
        status: 'Contractually Supported',
        clausesCited: [
          {
            clauseNumber: 'PC 8.3',
            title: 'Programme',
            volumeNumber: 'Volume 1',
            pageNumber: 85,
            excerpt: 'Contractor shall submit revised programme within 21 days (amended to 7 days in Particular Conditions) whenever notified by the Engineer.'
          }
        ],
        analysis: 'The requirement to submit a revised schedule is valid. However, the Contractor should submit TWO programme runs: (1) An Impacted Programme showing 54 days EOT reflecting actual Employer delays, and (2) A conditional "Mitigation/Acceleration Schedule" demonstrating feasibility and quantifying additional resources required subject to formal Variation Order.'
      },
      {
        id: 'chk-4',
        statement: 'Employer will levy Delay Damages under Clause 8.7 from 15 November 2026.',
        status: 'Not Supported',
        clausesCited: [
          {
            clauseNumber: 'PC 8.4',
            title: 'Extension of Time for Completion',
            volumeNumber: 'Volume 1',
            pageNumber: 88,
            excerpt: 'Contractor entitled to EOT; Delay Damages cannot be levied where time for completion is legitimately extended.'
          },
          {
            clauseNumber: 'PC 8.7',
            title: 'Delay Damages',
            volumeNumber: 'Volume 1',
            pageNumber: 96,
            excerpt: 'Delay damages shall not be leviable if Contractor has established entitlement to an Extension of Time.'
          }
        ],
        analysis: 'Liquidated damages cannot be lawfully deducted while the Engineer has failed to make a fair determination on Contractor\'s pending EOT Claim No. 03 (submitted 22 June 2026). Under standard common law principles and FIDIC 2017 Sub-Clause 3.7 / 8.7, time is set at large or at least LDs are unleviable until legitimate EOT claims are determined.'
      }
    ],
    implications: {
      cost: {
        level: 'Critical',
        details: 'If accepted without protest, Contractor absorbs ~$1.85M in unrecoverable overtime, triple shifts, and crane rental fees. Must register formal constructive acceleration claim under Clause 13.3 / 20.2.'
      },
      time: {
        level: 'Critical',
        details: 'Accepting the 15 Nov 2026 milestone without qualifying for 54 days EOT locks Contractor into impossible target dates, exposing firm to maximum LDs.'
      },
      liability: {
        level: 'High',
        details: 'Failure to rebut PMC\'s allegations of poor crane mobilization creates an adverse contemporaneous record that can be cited in DAB or arbitration.'
      },
      claims: {
        level: 'High',
        details: 'Prejudices Claim No. 03 (Utility Delay) and waives entitlement to prolongation costs (site overheads ~$18,000/day).'
      },
      commercialPosition: {
        level: 'Critical',
        details: 'Weakens Contractor posture in monthly interim payment valuations and provides PMC leverage to withhold milestone retention.'
      },
      precedentRisk: {
        level: 'Critical',
        details: 'Sets precedent that PMC can order accelerated working hours across all future viaduct sections without issuing formal Variation Orders.'
      }
    },
    doNotSayItems: [
      {
        id: 'dns-1',
        dangerousPhrase: '"We apologize for the delay in Pier Cap erections and accept that our progress is slow."',
        riskExplanation: 'Concedes culpability. Converts a disputed concurrency into a unilateral admission of contractor default.',
        safeAlternative: '"While we acknowledge the variance between current site progress and Baseline Rev. 04, this variance has been directly caused by events beyond the Contractor\'s control..."',
        contractualReservation: 'Expressly state that site progress reflects the ongoing impact of Employer risk events notified under Sub-Clauses 1.9, 2.1, and 8.4.'
      },
      {
        id: 'dns-2',
        dangerousPhrase: '"We will deploy 2 additional cranes and work 24/7 at no extra cost to meet your date."',
        riskExplanation: 'Waives rights to claim additional expenditure under Clause 13.3 and converts directed acceleration into a voluntary contractor recovery.',
        safeAlternative: '"Without prejudice to our contractual rights, we are ready to implement accelerated resource measures subject to the Engineer issuing a formal Variation instruction under Sub-Clause 13.3 covering all incurred costs..."',
        contractualReservation: 'Any deployment of expedited resources prior to formal Variation is executed under protest and without prejudice.'
      },
      {
        id: 'dns-3',
        dangerousPhrase: '"We agree that Key Milestone 3 will be completed by 15 November 2026 at any cost."',
        riskExplanation: 'Eliminates current EOT claim entitlement and creates absolute contractual undertaking to complete by original milestone date.',
        safeAlternative: '"Completion of Milestone 3 is strictly subject to the timely determination and grant of the Contractor\'s 54 calendar days Extension of Time submitted under Claim No. 03..."',
        contractualReservation: 'Reserve all entitlements to revised completion milestones and relief from delay damages pursuant to Sub-Clauses 8.4 and 8.7.'
      },
      {
        id: 'dns-4',
        dangerousPhrase: '"We have no objection to your instruction under Clause 8.6."',
        riskExplanation: 'Establishes that Clause 8.6 applies (Contractor fault), precluding subsequent re-classification under Clause 13.3 (Variation).',
        safeAlternative: '"We respectfully disagree that the provisions of Sub-Clause 8.6 apply to this section, as the prevailing delay arises from causes stipulated under Sub-Clause 8.4..."',
        contractualReservation: 'Contest applicability of Sub-Clause 8.6 and invoke Sub-Clause 13.3.'
      }
    ],
    questionnaire: [
      {
        id: 'q-1',
        question: 'What is the primary root cause of the 48-day delay between Pier P102 and Pier P140?',
        type: 'select',
        options: [
          'Employer / PMC failure (132kV HT line not diverted + late foundation coordinates)',
          'Concurrent delay (both utility diversion delay and minor crane downtime)',
          'Contractor resource mobilization delay only',
          'Force Majeure / Unforeseen subterranean obstruction'
        ],
        userAnswer: 'Employer / PMC failure (132kV HT line not diverted + late foundation coordinates)',
        impactOnStrategy: 'Establishes clear entitlement under PC 8.4(d) and PC 1.9, invalidating PMC invocation of Clause 8.6.'
      },
      {
        id: 'q-2',
        question: 'Was a formal contractual Notice of Delay served for the utility hindrance within the 28-day time-bar?',
        type: 'select',
        options: [
          'Yes, Notice APX/MRC/NOT-42 was served on 18 May 2026 (within 12 days of hindrance)',
          'Yes, mentioned in MOM and weekly progress reports only',
          'No formal notice served yet'
        ],
        userAnswer: 'Yes, Notice APX/MRC/NOT-42 was served on 18 May 2026 (within 12 days of hindrance)',
        impactOnStrategy: 'Defeats any PMC time-bar argument under Clause 20.2; preserves full claim validity.'
      },
      {
        id: 'q-3',
        question: 'Has the Employer or State Electricity Board completely handed over clear, unencumbered access to P112-P118?',
        type: 'select',
        options: [
          'No, overhead powerline was energized until 28 July 2026 (partial clearance only)',
          'Yes, site was fully handed over on time',
          'Subcontractor utility diversion is still pending as of today'
        ],
        userAnswer: 'No, overhead powerline was energized until 28 July 2026 (partial clearance only)',
        impactOnStrategy: 'Proves high-voltage safety clearance prevented crane boom operations until late July, directly rebutting the crane mobilization allegation.'
      },
      {
        id: 'q-4',
        question: 'What contemporary records are available to prove crane presence and inability to work?',
        type: 'checkbox',
        options: [
          'Daily Progress Reports (DPR) signed by PMC inspector',
          'Site Photographs with GPS/timestamp showing HT line proximity',
          'Notice of Safety Violation from State Grid preventing crane boom swing',
          'Crane logbooks showing equipment standby hours',
          'Minutes of Weekly Progress Review Meetings'
        ],
        userAnswer: [
          'Daily Progress Reports (DPR) signed by PMC inspector',
          'Site Photographs with GPS/timestamp showing HT line proximity',
          'Notice of Safety Violation from State Grid preventing crane boom swing',
          'Crane logbooks showing equipment standby hours',
          'Minutes of Weekly Progress Review Meetings'
        ],
        impactOnStrategy: 'Provides ironclad contemporaneously verified factual substantiation for arbitration/DAB.'
      },
      {
        id: 'q-5',
        question: 'What is the estimated additional cost of mobilizing 2 extra 150 MT cranes on 24/7 shifts?',
        type: 'text',
        userAnswer: '$1,840,000 including crane remobilization, diesel, triple-gang labor rates, and night illumination',
        impactOnStrategy: 'Quantifies constructive acceleration proposal to be put to PMC as a conditional Variation.'
      }
    ],
    responseMatrix: [
      {
        statementId: 'stmt-1',
        clientStatement: 'Execution of Pier Caps P102-P140 is lagging by 48 days solely due to Contractor failure to mobilize cranes.',
        contractReference: 'PC 1.9, PC 2.1 & PC 8.4(d)',
        ourPosition: 'Categorically refuted. Delay caused by Employer failure to divert 132kV energized overhead line and late foundation coordinates.',
        evidenceRequired: 'DPRs May-July 2026, Notice APX/MRC/NOT-42 dated 18 May 2026, Safety Order from State Grid.',
        riskLevel: 'Critical',
        proposedResponse: 'Formally reject allegation of contractor fault with contemporaneous record exhibits.'
      },
      {
        statementId: 'stmt-2',
        clientStatement: 'Instructed to accelerate under Clause 8.6 at Contractor\'s own risk and cost.',
        contractReference: 'PC 8.6 limitation proviso & PC 13.3',
        ourPosition: 'Clause 8.6 does not apply where delay stems from Cl. 8.4 qualifying events. Direction to accelerate constitutes a Variation.',
        evidenceRequired: 'Clause 8.6 text highlighting "other than as a result of a cause listed in Sub-Clause 8.4".',
        riskLevel: 'Critical',
        proposedResponse: 'Inform PMC that acceleration measures will be mobilized immediately upon receipt of formal Variation instruction under Sub-Clause 13.3.'
      },
      {
        statementId: 'stmt-3',
        clientStatement: 'Submit revised recovery programme within 7 days without moving Milestone 3.',
        contractReference: 'PC 8.3 & PC 8.4',
        ourPosition: 'Will submit Dual Programme: (A) Impacted EOT Schedule showing revised milestone, and (B) Conditional Acceleration Programme with cost proposal.',
        evidenceRequired: 'Time-impact analysis (TIA) Rev 05 with Primavera P6 XER file.',
        riskLevel: 'Moderate',
        proposedResponse: 'Comply with 7-day submission deadline while preserving EOT position through dual-schedule methodology.'
      },
      {
        statementId: 'stmt-4',
        clientStatement: 'Employer will levy Delay Damages under Clause 8.7 from 15 November 2026.',
        contractReference: 'PC 8.7 & PC 20.2',
        ourPosition: 'Unlawful to threaten or deduct delay damages prior to determining pending EOT claims; time is at large if EOT is improperly withheld.',
        evidenceRequired: 'Claim No. 03 submission letter and Engineer confirmation of receipt.',
        riskLevel: 'High',
        proposedResponse: 'Put Employer on notice that any deduction of LDs will constitute a breach of contract attracting financing charges under Sub-Clause 14.8.'
      }
    ]
  }
];
