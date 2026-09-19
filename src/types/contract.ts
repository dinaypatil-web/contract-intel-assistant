export type DocumentType = 
  | 'Contract Agreement'
  | 'Letter of Acceptance'
  | 'Addenda / Corrigenda'
  | 'Particular Conditions'
  | 'General Conditions'
  | 'Employer Requirements'
  | 'Technical Specifications'
  | 'BOQ'
  | 'Drawings'
  | 'Schedules / Appendices'
  | 'Correspondence';

export interface PrecedenceRule {
  rank: number;
  documentType: DocumentType;
  description: string;
}

export interface ContractClause {
  id: string;
  documentId: string;
  volumeNumber: string;
  pageNumber: number;
  clauseNumber: string;
  title: string;
  content: string;
  category: 'Time & EOT' | 'Payment & Claims' | 'Variations' | 'Obligations' | 'Risk & Insurance' | 'Termination & Dispute' | 'Quality & Testing';
  interconnectedClauseIds: string[];
  noticePeriodDays?: number;
  timeBarDays?: number;
  priorityRank: number; // 1 being highest priority
}

export interface ContractDocument {
  id: string;
  projectId: string;
  volumeNumber: string;
  title: string;
  documentType: DocumentType;
  revision: string;
  date: string;
  pageCount: number;
  clauses: ContractClause[];
  summary: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  contractType: string; // e.g. FIDIC Red Book 2017 with Particular Conditions
  client: string;
  pmc: string;
  contractor: string;
  value: string;
  currency: string;
  commencementDate: string;
  originalCompletionDate: string;
  revisedCompletionDate: string;
  currentEOTDays: number;
  orderOfPrecedence: PrecedenceRule[];
  documents: ContractDocument[];
  stats: {
    completionPercentage: number;
    pendingClaimsValue: string;
    eotClaimedDays: number;
    openNoticesCount: number;
    criticalDeadlinesCount: number;
    totalVariationsCount: number;
  };
}

export type CrossCheckStatus = 
  | 'Contractually Supported'
  | 'Partially Supported'
  | 'Not Supported'
  | 'Potentially Contradictory'
  | 'Contract Silent';

export interface CrossCheckItem {
  id: string;
  statement: string;
  status: CrossCheckStatus;
  clausesCited: {
    clauseNumber: string;
    title: string;
    volumeNumber: string;
    pageNumber: number;
    excerpt: string;
  }[];
  analysis: string;
}

export interface ImplicationAnalysis {
  cost: { level: 'Low' | 'Moderate' | 'High' | 'Critical'; details: string };
  time: { level: 'Low' | 'Moderate' | 'High' | 'Critical'; details: string };
  liability: { level: 'Low' | 'Moderate' | 'High' | 'Critical'; details: string };
  claims: { level: 'Low' | 'Moderate' | 'High' | 'Critical'; details: string };
  commercialPosition: { level: 'Low' | 'Moderate' | 'High' | 'Critical'; details: string };
  precedentRisk: { level: 'Low' | 'Moderate' | 'High' | 'Critical'; details: string };
}

export interface DoNotSayItem {
  id: string;
  dangerousPhrase: string;
  riskExplanation: string;
  safeAlternative: string;
  contractualReservation: string;
}

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  type: 'select' | 'boolean' | 'text' | 'checkbox';
  options?: string[];
  userAnswer?: string | boolean | string[];
  impactOnStrategy: string;
}

export interface ResponseMatrixRow {
  statementId: string;
  clientStatement: string;
  contractReference: string;
  ourPosition: string;
  evidenceRequired: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  proposedResponse: string;
}

export type LetterTone = 
  | 'Professional & Objective'
  | 'Firm Contractual'
  | 'Strong Contractual Defense'
  | 'Diplomatic & Collaborative'
  | 'Senior-Management Level'
  | 'Dispute-Prepared';

export interface GeneratedReplyLetter {
  reference: string;
  date: string;
  recipient: string;
  subject: string;
  referenceToIncoming: string;
  openingPosition: string;
  factualBackground: string;
  contractualPosition: string;
  clauseByClauseRebuttal: string;
  requiredAction: string;
  reservationOfRights: string;
  closing: string;
  tone: LetterTone;
  fullDraftText: string;
}

export interface IncomingLetterReview {
  id: string;
  projectId: string;
  sender: string;
  recipient: string;
  date: string;
  refNumber: string;
  subject: string;
  originalText: string;
  riskScore: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskScoreExplanation: string;
  extractedData: {
    instructions: string[];
    allegations: string[];
    deadlines: string[];
    clausesCited: string[];
    financialImplications: string;
    timeImplications: string;
    potentialContractualConsequences: string[];
  };
  crossCheck: CrossCheckItem[];
  implications: ImplicationAnalysis;
  doNotSayItems: DoNotSayItem[];
  questionnaire: QuestionnaireQuestion[];
  responseMatrix: ResponseMatrixRow[];
  generatedReply?: GeneratedReplyLetter;
}

export interface NoticeAlert {
  id: string;
  projectId: string;
  title: string;
  eventType: 'Delay Event' | 'Variation Instruction' | 'Access Restriction' | 'Late Drawings' | 'Material Rejection' | 'Acceleration Request' | 'Suspension / Interference';
  clauseRef: string;
  volume: string;
  page: number;
  timeBarDays: number;
  eventDate: string;
  deadlineDate: string;
  daysRemaining: number;
  severity: 'Critical' | 'Warning' | 'Notice Required' | 'Info';
  status: 'Open Notice' | 'Drafting Notice' | 'Notice Served' | 'Closed';
  responsibleParty: string;
  recommendedAction: string;
  evidenceRequired: string[];
}

export interface ClaimRecord {
  id: string;
  projectId: string;
  claimNumber: string;
  title: string;
  type: 'EOT & Prolongation' | 'Disruption' | 'Variation Claim' | 'Acceleration Costs' | 'Suspension / Termination';
  clauseBasis: string[];
  claimedAmount: string;
  eotDaysClaimed: number;
  eotDaysApproved: number;
  status: 'Initial Notice' | 'Detailed Claim Submitted' | 'Engineer Determination Pending' | 'Approved' | 'Referred to DAB / Dispute';
  noticeServedDate: string;
  substantiationDeadline: string;
  contemporaryRecords: string[];
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  date: string;
  title: string;
  eventType: 'RFI' | 'Site Instruction' | 'Delay Event' | 'Notice Issued' | 'Programme Revision' | 'Letter Received' | 'Inspection';
  documentRef: string;
  clauseRef: string;
  impact: string;
  actionTaken: string;
  evidenceStatus: 'Verified' | 'Pending Records' | 'Critical Gap';
}

export interface PrecedenceConflict {
  id: string;
  projectId: string;
  title: string;
  clauseA: {
    document: string;
    clause: string;
    text: string;
    rank: number;
  };
  clauseB: {
    document: string;
    clause: string;
    text: string;
    rank: number;
  };
  winningClause: string;
  governingPrecedenceRule: string;
  practicalImpact: string;
  recommendedContractualPosition: string;
}

export type ChatReasoningMode = 
  | 'quick' 
  | 'detailed' 
  | 'contractor-defence' 
  | 'pmc-perspective' 
  | 'claim-prep' 
  | 'dispute-prep';

export interface ChatCitation {
  document: string;
  volume: string;
  clause: string;
  page: number;
  excerpt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  mode?: ChatReasoningMode;
  confidence?: 'High' | 'Medium' | 'Low';
  citations?: ChatCitation[];
  industryPracticeNotes?: string[];
  actionChecklist?: string[];
}
