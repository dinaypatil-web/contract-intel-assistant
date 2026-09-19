import { NoticeAlert, ClaimRecord } from '../types/contract';

export const mockAlerts: NoticeAlert[] = [
  {
    id: 'not-01',
    projectId: 'proj-metro-c02',
    title: 'CRITICAL TIME-BAR: 28-Day Notice of Claim for Ground Heave & Utility Clash at Pier P142-P148',
    eventType: 'Delay Event',
    clauseRef: 'PC 20.2 / PC 8.4(d)',
    volume: 'Volume 1',
    page: 174,
    timeBarDays: 28,
    eventDate: '2026-08-26',
    deadlineDate: '2026-09-23',
    daysRemaining: 4,
    severity: 'Critical',
    status: 'Drafting Notice',
    responsibleParty: 'Contracts Manager (D. Sharma)',
    recommendedAction: 'Issue formal Notice of Claim under Sub-Clause 20.2 immediately. Missing the 28-day deadline bars all future time and cost recovery.',
    evidenceRequired: [
      'Site geotechnical boring logs at Pier 144 showing uncharted telecom duct bank',
      'Daily Progress Report of 26 August 2026 recording work stoppage by municipal inspectors',
      'Photographs with time and GPS stamp of ruptured water feeder pipeline'
    ]
  },
  {
    id: 'not-02',
    projectId: 'proj-metro-c02',
    title: 'RESPONSE DEADLINE: Reply to PMC Acceleration Instruction Letter LTR-1482',
    eventType: 'Acceleration Request',
    clauseRef: 'PC 8.3 / PC 8.6',
    volume: 'Volume 1',
    page: 93,
    timeBarDays: 7,
    eventDate: '2026-08-12',
    deadlineDate: '2026-08-19',
    daysRemaining: 0,
    severity: 'Critical',
    status: 'Open Notice',
    responsibleParty: 'Project Director & Commercial Lead',
    recommendedAction: 'Issue formal contractual rebuttal and dual-programme submission reserving all rights under PC 13.3 and PC 8.4.',
    evidenceRequired: [
      'Dual P6 Schedule (Impacted vs Accelerated)',
      'Cost quotation for supplementary 150 MT crawler cranes',
      'Reservation of Rights memorandum'
    ]
  },
  {
    id: 'not-03',
    projectId: 'proj-metro-c02',
    title: 'VARIATION PRICING TIME-BAR: Detailed Rate Breakdown for Station Box Foundation Modification (VO-14)',
    eventType: 'Variation Instruction',
    clauseRef: 'PC 13.3',
    volume: 'Volume 1',
    page: 132,
    timeBarDays: 28,
    eventDate: '2026-08-04',
    deadlineDate: '2026-09-01',
    daysRemaining: 12,
    severity: 'Warning',
    status: 'Drafting Notice',
    responsibleParty: 'Lead QS / Cost Engineer',
    recommendedAction: 'Submit complete rate breakdown with invoice quotes for additional 1200mm dia diaphragm wall anchors prior to day 28.',
    evidenceRequired: [
      'Engineer\'s Written Instruction Site Order No. 44',
      'Subcontractor specialist drilling quotation',
      'Primavera milestone impact window'
    ]
  },
  {
    id: 'not-04',
    projectId: 'proj-metro-c02',
    title: 'NOTICE OF DELAYED DRAWINGS: GAD Rev 04 for Cast-in-situ Cross Girders Pier P108',
    eventType: 'Late Drawings',
    clauseRef: 'PC 1.9',
    volume: 'Volume 1',
    page: 24,
    timeBarDays: 14,
    eventDate: '2026-08-15',
    deadlineDate: '2026-08-29',
    daysRemaining: 10,
    severity: 'Notice Required',
    status: 'Open Notice',
    responsibleParty: 'Technical Office Manager',
    recommendedAction: 'Issue notice notifying Engineer that absence of structural steel bar-bending schedules halts fabrication starting 22 August.',
    evidenceRequired: [
      'RFI-312 dated 20 July 2026 unanswered beyond 21 days',
      'Casting yard reinforcement fabrication schedule'
    ]
  },
  {
    id: 'not-05',
    projectId: 'proj-metro-c02',
    title: 'DEFECT NOTIFICATION PERIOD: Precast Segment Surface Honeycombing Curing Inspection',
    eventType: 'Material Rejection',
    clauseRef: 'PC 7.5 / PC 7.6',
    volume: 'Volume 1',
    page: 78,
    timeBarDays: 14,
    eventDate: '2026-08-10',
    deadlineDate: '2026-08-24',
    daysRemaining: 5,
    severity: 'Info',
    status: 'Notice Served',
    responsibleParty: 'QA/QC Manager',
    recommendedAction: 'Joint core test report submitted. Awaiting Engineer written acceptance of micro-concrete epoxy grout repair procedure.',
    evidenceRequired: [
      'Third-party NDT compressive strength test results (NABL accredited)',
      'Manufacturer datasheet for Sika Grout 214'
    ]
  }
];

export const mockClaims: ClaimRecord[] = [
  {
    id: 'clm-03',
    projectId: 'proj-metro-c02',
    claimNumber: 'CLM/MRC-L4/EOT-03',
    title: 'Extension of Time & Prolongation Cost for 132kV Overhead Transmission Line Relocation Delay',
    type: 'EOT & Prolongation',
    clauseBasis: ['PC 8.4(d)', 'PC 8.5', 'PC 2.1', 'PC 20.2'],
    claimedAmount: '$4,280,000',
    eotDaysClaimed: 54,
    eotDaysApproved: 0,
    status: 'Detailed Claim Submitted',
    noticeServedDate: '2026-05-18',
    substantiationDeadline: '2026-07-28',
    contemporaryRecords: [
      'Notice of Delay Ref: APX/MRC/NOT-42 served within 12 days',
      'Correspondence with State Transmission Utility (TSTRANSCO)',
      'Time-Impact Analysis (TIA) Model run on P6 Baseline 04',
      'Monthly site overhead audit by KPMG proving $18,400/day fixed preliminary burn'
    ]
  },
  {
    id: 'clm-04',
    projectId: 'proj-metro-c02',
    claimNumber: 'CLM/MRC-L4/VAR-07',
    title: 'Compensation for Constructive Acceleration & Weekend Work Instruction in Viaduct P102-P140',
    type: 'Acceleration Costs',
    clauseBasis: ['PC 13.3', 'PC 8.6 proviso', 'PC 20.2'],
    claimedAmount: '$1,840,000',
    eotDaysClaimed: 0,
    eotDaysApproved: 0,
    status: 'Initial Notice',
    noticeServedDate: '2026-08-16',
    substantiationDeadline: '2026-09-27',
    contemporaryRecords: [
      'Engineer Acceleration Instruction Letter LTR-1482',
      'Contractor Formal Rebuttal & Reservation of Rights APX/PMC/LTR-891',
      'Crane deployment manifests and double-shift wage registers',
      'Diesel consumption logs for auxiliary night lighting towers'
    ]
  },
  {
    id: 'clm-02',
    projectId: 'proj-metro-c02',
    claimNumber: 'CLM/MRC-L4/GEO-01',
    title: 'Differing Subsurface Geotechnical Conditions at Station Box Piles (Uncharted Basalt Hard Rock)',
    type: 'Variation Claim',
    clauseBasis: ['PC 4.12 [Unforeseeable Physical Conditions]', 'PC 20.2'],
    claimedAmount: '$8,160,000',
    eotDaysClaimed: 52,
    eotDaysApproved: 52,
    status: 'Approved',
    noticeServedDate: '2025-09-14',
    substantiationDeadline: '2025-11-20',
    contemporaryRecords: [
      'Rotary core drilling penetration rate logs',
      'Independent Geotechnical Consultant Report (IIT Madras)',
      'Tender Geotechnical Baseline Report (GBR) comparison',
      'Agreed Engineer Variation Order VO-08'
    ]
  }
];
