import { TimelineEvent } from '../types/contract';

export const mockTimeline: TimelineEvent[] = [
  {
    id: 'evt-1',
    projectId: 'proj-metro-c02',
    date: '2024-03-15',
    title: 'Commencement of Works & Site Possession Phase 1',
    eventType: 'Site Instruction',
    documentRef: 'PMC Letter LTR-004',
    clauseRef: 'PC 8.1 / PC 2.1',
    impact: 'Contractual start date officially fixed; 36-month timeline commenced.',
    actionTaken: 'Mobilized baseline survey team and erected casting yard boundary.',
    evidenceStatus: 'Verified'
  },
  {
    id: 'evt-2',
    projectId: 'proj-metro-c02',
    date: '2025-09-10',
    title: 'Discovery of Uncharted Massive Basalt Rock Layer in Station Diaphragm Piling',
    eventType: 'Delay Event',
    clauseRef: 'PC 4.12 [Unforeseeable Physical Conditions]',
    documentRef: 'Daily Boring Log P-24 to P-38',
    impact: 'Hydraulic rig drilling speed reduced from 4m/day to 0.4m/day; critical path stopped.',
    actionTaken: 'Issued formal Notice of Claim under PC 20.2 within 4 days of encounter.',
    evidenceStatus: 'Verified'
  },
  {
    id: 'evt-3',
    projectId: 'proj-metro-c02',
    date: '2026-03-20',
    title: 'Engineer Determination: Approval of 52 Days EOT for Geotechnical Obstruction',
    eventType: 'Notice Issued',
    clauseRef: 'PC 3.7 / PC 8.4',
    documentRef: 'Engineer Determination DET-02',
    impact: 'Revised Completion Date formally adjusted by 52 days; prolongation costs approved.',
    actionTaken: 'Updated P6 baseline schedule to Rev. 04.',
    evidenceStatus: 'Verified'
  },
  {
    id: 'evt-4',
    projectId: 'proj-metro-c02',
    date: '2026-05-06',
    title: 'Identification of 132kV Overhead Transmission Line Clash across Pier P112 to P118',
    eventType: 'Delay Event',
    clauseRef: 'PC 2.1 / PC 8.5',
    documentRef: 'Joint Site Survey Report JSR-19',
    impact: 'State Grid safety regulations prohibit operating crane booms within 15 meters of live 132kV lines. Superstructure erection completely halted.',
    actionTaken: 'Submitted RFI-284 requesting utility diversion schedule from Employer.',
    evidenceStatus: 'Verified'
  },
  {
    id: 'evt-5',
    projectId: 'proj-metro-c02',
    date: '2026-05-18',
    title: 'Serving of Contractual Notice of Delay under Sub-Clause 20.2 & Sub-Clause 8.4',
    eventType: 'Notice Issued',
    clauseRef: 'PC 20.2 / PC 8.4(d)',
    documentRef: 'Contractor Notice APX/MRC/NOT-42',
    impact: 'Formally preserved Contractor right to claim 54 calendar days EOT and standby overhead costs.',
    actionTaken: 'Logged contemporaneously into Correspondence Tracker with postal and email acknowledgements.',
    evidenceStatus: 'Verified'
  },
  {
    id: 'evt-6',
    projectId: 'proj-metro-c02',
    date: '2026-07-28',
    title: 'De-energization and Shifting of 132kV Cables by State Power Utility',
    eventType: 'Inspection',
    clauseRef: 'PC 2.1 / PC 8.5',
    documentRef: 'Grid Clearance Certificate GCC-882',
    impact: 'Overhead obstruction removed after 83 days of total work impedance.',
    actionTaken: 'Joint inspection recorded with PMC; full crane mobilization cleared for resumption.',
    evidenceStatus: 'Verified'
  },
  {
    id: 'evt-7',
    projectId: 'proj-metro-c02',
    date: '2026-08-12',
    title: 'Receipt of PMC Letter LTR-1482 Alleging Contractor Failure and Ordering Acceleration',
    eventType: 'Letter Received',
    clauseRef: 'PC 8.6 / PC 8.7',
    documentRef: 'PMC Letter PMC/MRCL/LTR-1482',
    impact: 'High contractual risk: PMC instructs 24/7 working at Contractor cost and threatens LDs from 15 Nov.',
    actionTaken: 'Initiated Contract Assistant 7-Step Letter Review Studio; drafting rebuttal and dual-schedule response.',
    evidenceStatus: 'Pending Records'
  }
];
