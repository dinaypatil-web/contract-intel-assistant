import { PrecedenceConflict } from '../types/contract';

export const mockConflicts: PrecedenceConflict[] = [
  {
    id: 'cnf-01',
    projectId: 'proj-metro-c02',
    title: 'Delay Damages (Liquidated Damages) Cap Conflict: Particular Conditions vs General Conditions',
    clauseA: {
      document: 'Particular Conditions (Part A)',
      clause: 'PC 8.7',
      text: 'Delay damages shall be 0.1% of the Contract Price per day of delay, up to a maximum aggregate limit of 10% of the accepted Contract Price.',
      rank: 4
    },
    clauseB: {
      document: 'General Conditions (FIDIC Red 2017)',
      clause: 'GC 8.8',
      text: 'The total amount of delay damages shall not exceed the maximum amount stated in the Contract Data (default 15% where unstated).',
      rank: 5
    },
    winningClause: 'Particular Conditions PC 8.7 (Rank 4 takes precedence over General Conditions Rank 5)',
    governingPrecedenceRule: 'Order of Precedence Rule #4: Particular Conditions prevail over General Conditions.',
    practicalImpact: 'The Contractor\'s maximum financial liability for project completion delay is strictly capped at 10% ($38.5M), not 15% ($57.75M). Any PMC attempt to levy damages beyond 10% is ultra vires.',
    recommendedContractualPosition: 'Rely on PC 8.7 in all commercial risk provisions; cite Order of Precedence Clause 1.5.'
  },
  {
    id: 'cnf-02',
    projectId: 'proj-metro-c02',
    title: 'Reinforcement Steel Grade Specification: Technical Specifications vs Tender Alignment Drawings',
    clauseA: {
      document: 'Technical Specifications (Section 0320 Reinforcement)',
      clause: 'Spec 0320.3.2',
      text: 'All main flexural reinforcement in pier caps and diaphragms shall be High Yield Deformed Bars conforming to Grade Fe 500D (Yield strength 500 MPa).',
      rank: 7
    },
    clauseB: {
      document: 'Tender Structural Drawings (Sheet STR-PC-012)',
      clause: 'General Notes Note 8',
      text: 'Provide Grade Fe 550D reinforcement for all pier cap longitudinal tension rebars.',
      rank: 8
    },
    winningClause: 'Technical Specifications Spec 0320.3.2 (Rank 7 prevails over Drawings Rank 8)',
    governingPrecedenceRule: 'Order of Precedence Rule #7: Technical Specifications take precedence over Drawings.',
    practicalImpact: 'Contractor is contractually entitled to procure and fabricate Fe 500D. If PMC insists on Fe 550D, it constitutes a Variation under Clause 13.3, entitling the Contractor to rate difference and fabrication lead-time EOT.',
    recommendedContractualPosition: 'Submit RFI citing precedence of Technical Specifications; request formal Variation Order VO if Fe 550D is instructed.'
  },
  {
    id: 'cnf-03',
    projectId: 'proj-metro-c02',
    title: 'Dispute Adjudication Notice Period: Particular Conditions vs General Conditions',
    clauseA: {
      document: 'Particular Conditions',
      clause: 'PC 21.4',
      text: 'Either party may refer a dispute to the Dispute Avoidance/Adjudication Board (DAAB) within 42 days of the Engineer\'s Determination under Sub-Clause 3.7.',
      rank: 4
    },
    clauseB: {
      document: 'General Conditions',
      clause: 'GC 21.4',
      text: 'Dispute may be referred to the DAAB within 28 days of the notice of dissatisfaction.',
      rank: 5
    },
    winningClause: 'Particular Conditions PC 21.4 (Rank 4 prevails)',
    governingPrecedenceRule: 'Order of Precedence Rule #4: Particular Conditions supersede standard FIDIC General Conditions.',
    practicalImpact: 'Provides the Contractor an extended 42-day window to assemble quantum and delay expert reports before triggering formal DAAB proceedings.',
    recommendedContractualPosition: 'Calendar DAAB referral window using 42 calendar days.'
  }
];
