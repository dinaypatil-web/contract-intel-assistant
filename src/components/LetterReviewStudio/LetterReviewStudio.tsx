import React, { useState, useEffect } from 'react';
import { 
  IncomingLetterReview, 
  LetterTone, 
  Project, 
  QuestionnaireQuestion, 
  ResponseMatrixRow 
} from '../../types/contract';
import { 
  FileText, 
  AlertOctagon, 
  CheckCircle, 
  Scale, 
  HelpCircle, 
  FileCode, 
  Send, 
  Copy, 
  Printer, 
  RotateCcw, 
  ShieldAlert, 
  Check, 
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';
import { generateFormalContractReply, scanForDangerousPhrases } from '../../utils/legalSafety';

interface LetterReviewStudioProps {
  project: Project;
  letter?: IncomingLetterReview | null;
  onUpdateLetter?: (updated: IncomingLetterReview) => void;
}

export const LetterReviewStudio: React.FC<LetterReviewStudioProps> = ({
  project,
  letter,
  onUpdateLetter
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTone, setSelectedTone] = useState<LetterTone>('Firm Contractual');
  const [questionnaireState, setQuestionnaireState] = useState<QuestionnaireQuestion[]>(letter ? letter.questionnaire : []);
  const [matrixState, setMatrixState] = useState<ResponseMatrixRow[]>(letter ? letter.responseMatrix : []);
  const [customDraft, setCustomDraft] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [scannerInput, setScannerInput] = useState<string>('');
  const [scanFindings, setScanFindings] = useState<ReturnType<typeof scanForDangerousPhrases>>([]);
  const [letterViewMode, setLetterViewMode] = useState<'letterhead' | 'editor'>('letterhead');

  // Intake states when no letter is selected
  const [intakeSender, setIntakeSender] = useState<string>(project?.pmc || 'The Engineer / PMC');
  const [intakeRef, setIntakeRef] = useState<string>('');
  const [intakeDate, setIntakeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [intakeSubject, setIntakeSubject] = useState<string>('');
  const [intakeText, setIntakeText] = useState<string>('');

  useEffect(() => {
    if (letter) {
      setQuestionnaireState(letter.questionnaire);
      setMatrixState(letter.responseMatrix);
      setCustomDraft('');
    }
  }, [letter]);

  const replyRef = `${project?.code || 'PRJ'}/RESP/LTR-${Math.floor(1000 + Math.random() * 9000)}`;

  // Generate draft if not yet generated or when tone/questions change
  const currentDraftText = customDraft || (letter ? generateFormalContractReply(
    selectedTone,
    replyRef,
    letter.refNumber,
    letter.date,
    letter.sender,
    project.contractor,
    project.code,
    questionnaireState,
    matrixState
  ) : '');

  const handleToneChange = (tone: LetterTone) => {
    setSelectedTone(tone);
    if (letter) {
      setCustomDraft(
        generateFormalContractReply(
          tone,
          replyRef,
          letter.refNumber,
          letter.date,
          letter.sender,
          project.contractor,
          project.code,
          questionnaireState,
          matrixState
        )
      );
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const updated = questionnaireState.map(q => {
      if (q.id === questionId) {
        return { ...q, userAnswer: value };
      }
      return q;
    });
    setQuestionnaireState(updated);
    if (letter) {
      setCustomDraft(
        generateFormalContractReply(
          selectedTone,
          replyRef,
          letter.refNumber,
          letter.date,
          letter.sender,
          project.contractor,
          project.code,
          updated,
          matrixState
        )
      );
    }
  };

  const handleCreateAndAnalyzeLetter = () => {
    const newLetter: IncomingLetterReview = {
      id: `ltr-${Date.now()}`,
      projectId: project.id,
      sender: intakeSender || 'The Engineer / PMC',
      recipient: project.contractor || 'Contractor',
      date: intakeDate || new Date().toISOString().split('T')[0],
      refNumber: intakeRef || `PMC/LTR-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: intakeSubject || 'Contractual Correspondence',
      riskScore: 'High',
      riskScoreExplanation: 'Evaluated against contract order of precedence, notice time-bars, and critical path delay liability.',
      originalText: intakeText || `Ref: ${intakeRef}\nDate: ${intakeDate}\nSubject: ${intakeSubject}\n\n[Full correspondence content attached]`,
      extractedData: {
        instructions: [intakeSubject || 'Progress and performance instruction'],
        allegations: ['Alleged progress variance against baseline program'],
        deadlines: ['Response required within contractual timeframe'],
        clausesCited: ['Sub-Clause 8.6 [Rate of Progress]'],
        financialImplications: 'Potential uncompensated acceleration costs or liquidated delay damages.',
        timeImplications: 'Risk of critical path delay allocation to Contractor.',
        potentialContractualConsequences: ['Threat of Sub-Clause 8.7 Delay Damages']
      },
      crossCheck: [
        {
          id: 'cc-1',
          statement: 'Directing progress recovery or alleging Contractor delay',
          clausesCited: [
            { 
              clauseNumber: 'PC 8.6', 
              title: 'Rate of Progress', 
              volumeNumber: 'Volume 1', 
              pageNumber: 84, 
              excerpt: 'Contractor shall expedite at own risk and cost only if cause is not attributable to Clause 8.4.' 
            }
          ],
          status: 'Not Supported',
          analysis: 'Particular Conditions require proof that delay is not caused by Employer hindrances or Clause 8.4 Extension of Time events before acceleration can be mandated at Contractor cost.'
        }
      ],
      implications: {
        cost: { level: 'High', details: 'Uncompensated acceleration costs if unilateral instruction is accepted.' },
        time: { level: 'Critical', details: 'Critical path completion date impacted.' },
        liability: { level: 'High', details: 'Exposure to Sub-Clause 8.7 Liquidated Damages.' },
        claims: { level: 'Critical', details: 'EOT claim rights must be preserved immediately under Clause 20.2.' },
        commercialPosition: { level: 'High', details: 'Risk of conceding delay culpability.' },
        precedentRisk: { level: 'Moderate', details: 'Setting site precedent for uncompensated overtime.' }
      },
      doNotSayItems: [
        {
          id: 'dns-1',
          dangerousPhrase: 'We accept the delay',
          riskExplanation: 'Fatal admission of sole delay responsibility; bars subsequent Extension of Time claims.',
          safeAlternative: 'While we acknowledge the progress variance, such variance stems directly from external hindrances beyond our control.',
          contractualReservation: 'Without prejudice to our rights to claim full extension of time and costs under Clause 20.2.'
        },
        {
          id: 'dns-2',
          dangerousPhrase: 'At our own cost',
          riskExplanation: 'Voluntary abandonment of variation and additional payment rights.',
          safeAlternative: 'Subject to formal variation instruction and cost reimbursement under Sub-Clause 13.3.',
          contractualReservation: 'Subject to formal variation and determination by the Engineer.'
        }
      ],
      questionnaire: [
        {
          id: 'q-1',
          question: 'Has the delay or hindrance mentioned been contributed to by Employer delay events (e.g. site access, drawing releases, utility clashes)?',
          type: 'boolean',
          userAnswer: true,
          impactOnStrategy: 'If YES, unilateral acceleration at Contractor cost is invalid; Clause 8.4 EOT applies.'
        },
        {
          id: 'q-2',
          question: 'Have contemporaneous records (DPRs, photos, inspection requests) been preserved for this event?',
          type: 'boolean',
          userAnswer: true,
          impactOnStrategy: 'Contemporary records are mandatory under Sub-Clause 20.2 to substantiate all claims.'
        }
      ],
      responseMatrix: [
        {
          statementId: 'rm-1',
          clientStatement: intakeSubject || 'Delay allegation and progress directive',
          contractReference: 'PC 8.4 / PC 8.6',
          ourPosition: 'Progress was impacted by hindrances for which timely notices were submitted.',
          evidenceRequired: 'Monthly Progress Reports, Notice of Claim under Clause 20.2',
          riskLevel: 'Critical',
          proposedResponse: 'The Contractor formally rejects sole culpability. The critical path delay was caused by events for which notices were duly served.'
        }
      ]
    };

    if (onUpdateLetter) {
      onUpdateLetter(newLetter);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { num: 1, title: 'Extract & Risks', icon: FileText },
    { num: 2, title: 'Contract Cross-Check', icon: Scale },
    { num: 3, title: 'Implications', icon: AlertOctagon },
    { num: 4, title: 'DO NOT SAY', icon: ShieldAlert },
    { num: 5, title: 'Site Questionnaire', icon: HelpCircle },
    { num: 6, title: 'Response Matrix', icon: FileCode },
    { num: 7, title: 'Draft Contractual Reply', icon: Send }
  ];

  if (!letter) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-notice">Correspondence Studio</span>
            <span className="badge badge-neutral">7-Step Rebuttal Architecture</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Analyze Incoming Letter or Site Instruction
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '680px', lineHeight: 1.5 }}>
            Enter or paste correspondence received from the Engineer, PMC, or Employer. ContractMind will cross-examine assertions against the 5-tier contract hierarchy, detect time-bars, and generate a legally fortified reply with DO NOT SAY guardrails.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">From (Sender)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Egis-Systra Consortium (Engineer / PMC)"
                value={intakeSender}
                onChange={(e) => setIntakeSender(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Incoming Letter Reference Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. PMC/MRCL/2026/LTR-104"
                value={intakeRef}
                onChange={(e) => setIntakeRef(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Incoming Letter</label>
              <input 
                type="date" 
                className="form-input" 
                value={intakeDate}
                onChange={(e) => setIntakeDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Letter Subject</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Directive to Expedite Works under Clause 8.6; Threat of Liquidated Damages"
              value={intakeSubject}
              onChange={(e) => setIntakeSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Letter Body / Content (Paste Text Here)</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: '220px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6 }}
              placeholder="Paste the original body text of the letter or instruction here..."
              value={intakeText}
              onChange={(e) => setIntakeText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setIntakeRef('PMC/2026/LTR-092');
                setIntakeSender('Engineer & Project Management Consultant');
                setIntakeSubject('Notice under Sub-Clause 8.6 [Rate of Progress] and Notice of Delay Damages');
                setIntakeText('Dear Sir,\n\nA joint progress inspection conducted this week confirms execution is currently behind the approved schedule. In accordance with Sub-Clause 8.6 [Rate of Progress], the Engineer formally instructs you to mobilize additional shifts at your own cost. Failure to recover delay will attract Delay Damages under Clause 8.7.');
              }}
            >
              Load Example Delay Directive
            </button>

            <button 
              type="button" 
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              onClick={handleCreateAndAnalyzeLetter}
            >
              <Send size={16} />
              <span>Launch 7-Step Contractual Review &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Studio Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-critical">Critical Risk Communication</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ref: <strong style={{ color: 'var(--text-primary)' }}>{letter.refNumber}</strong>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {letter.date}</span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '6px' }}>
              {letter.subject}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              From: <strong style={{ color: 'var(--accent-blue)' }}>{letter.sender}</strong> &rarr; To: {letter.recipient}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Risk Evaluation
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-critical)' }}>
                {letter.riskScore} Exposure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Step Wizard Progress Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px' }}>
        <div className="wizard-steps">
          {steps.map(s => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <div 
                key={s.num} 
                className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(s.num)}
              >
                <div className="step-bubble">
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div className="step-title">{s.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Panels */}
      {/* STEP 1: EXTRACT & INCOMING TEXT (Symmetrical 2-Column Grid) */}
      {currentStep === 1 && (
        <div className="symmetric-grid-2col">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">
              <div className="panel-title">
                <FileText size={18} color="var(--accent-blue)" />
                <span>Original Incoming Communication</span>
              </div>
              <span className="badge badge-neutral">{letter.refNumber}</span>
            </div>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              whiteSpace: 'pre-wrap',
              height: '540px',
              overflowY: 'auto',
              lineHeight: 1.65,
              color: 'var(--text-secondary)'
            }}>
              {letter.originalText}
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div className="panel-header">
              <div className="panel-title">
                <AlertOctagon size={18} color="var(--status-critical)" />
                <span>AI Automated Extraction & Risk Signals</span>
              </div>
              <span className="badge badge-critical">Critical Traps Detected</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '540px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-critical)', textTransform: 'uppercase' }}>
                  Allegations of Default
                </div>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {letter.extractedData.allegations.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase' }}>
                  Explicit Instructions
                </div>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {letter.extractedData.instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                  Clauses Cited by PMC
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {letter.extractedData.clausesCited.map((c, i) => (
                    <span key={i} className="citation-pill">{c}</span>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--status-critical-bg)',
                border: '1px solid var(--status-critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '0.82rem',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--status-critical)' }}>Potential Contractual Trap:</strong> {letter.extractedData.potentialContractualConsequences[0]}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button className="btn-primary" onClick={() => setCurrentStep(2)}>
                <span>Proceed to Step 2: Contract Cross-Check</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTRACT CROSS-CHECK */}
      {currentStep === 2 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Scale size={20} color="var(--accent-blue)" />
              <span>Contract Cross-Check Matrix (Statement-by-Statement Contractual Grounding)</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-success">Supported</span>
              <span className="badge badge-warning">Partially Supported</span>
              <span className="badge badge-critical">Not Supported / Contradictory</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Every critical assertion in the incoming letter is verified against the signed Contract Conditions, 
            Order of Precedence, and contemporaneous notices to determine legal validity.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {letter.crossCheck.map(item => {
              let badgeClass = 'badge-neutral';
              if (item.status === 'Contractually Supported') badgeClass = 'badge-success';
              else if (item.status === 'Partially Supported') badgeClass = 'badge-warning';
              else if (item.status === 'Not Supported' || item.status === 'Potentially Contradictory') badgeClass = 'badge-critical';

              return (
                <div 
                  key={item.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      &ldquo;{item.statement}&rdquo;
                    </div>
                    <span className={`badge ${badgeClass}`}>{item.status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.clausesCited.map((c, ci) => (
                      <span key={ci} className="citation-pill">
                        {c.volumeNumber} &rarr; {c.clauseNumber} (Page {c.pageNumber})
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Contractual Evaluation: </strong>
                    {item.analysis}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
              Back to Extract
            </button>
            <button className="btn-primary" onClick={() => setCurrentStep(3)}>
              <span>Proceed to Step 3: Implication Analysis</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: IMPLICATION ANALYSIS */}
      {currentStep === 3 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <AlertOctagon size={20} color="var(--status-critical)" />
              <span>Multi-Dimensional Implication & Exposure Analysis</span>
            </div>
            <span className="badge badge-critical">Severe Financial & Time Exposure</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            What are the practical consequences of accepting the PMC communication without qualification or timely rebuttal?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--status-critical-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Cost Exposure</strong>
                <span className="badge badge-critical">Critical</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {letter.implications.cost.details}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--status-critical-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Schedule & EOT Impact</strong>
                <span className="badge badge-critical">Critical</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {letter.implications.time.details}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--status-warning-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Liability & Default Risk</strong>
                <span className="badge badge-warning">High</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {letter.implications.liability.details}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--status-critical-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Precedent & Commercial Standing</strong>
                <span className="badge badge-critical">Critical</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {letter.implications.precedentRisk.details}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
              Back to Cross-Check
            </button>
            <button className="btn-primary" onClick={() => setCurrentStep(4)}>
              <span>Proceed to Step 4: &ldquo;DO NOT SAY&rdquo; Protection</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: "DO NOT SAY" PROTECTION */}
      {currentStep === 4 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <ShieldAlert size={20} color="var(--status-critical)" />
              <span>&ldquo;DO NOT SAY&rdquo; Contractual Guardrails (Preventing Casual Admissions)</span>
            </div>
            <span className="badge badge-critical">Rights Preservation Active</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Project teams often inadvertently forfeit millions in legitimate claims by sending polite or apologetic emails. 
            The system identifies dangerous expressions and provides contractually safe alternatives with express reservations of rights.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {letter.doNotSayItems.map(item => (
              <div 
                key={item.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px'
                }}
              >
                <div className="do-not-say-box">
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-critical)', textTransform: 'uppercase' }}>
                    &times; DO NOT SAY THIS (Casual / Self-Incriminating)
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {item.dangerousPhrase}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <strong>Risk:</strong> {item.riskExplanation}
                  </div>
                </div>

                <div className="do-say-box">
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase' }}>
                    &check; CONTRACTUALLY SAFE REPLACEMENT
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {item.safeAlternative}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <strong>Mandatory Reservation:</strong> {item.contractualReservation}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Live Phrase Scanner */}
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
              Interactive Admission Scanner: Test Your Draft Response
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Type a draft sentence here to test for dangerous legal admissions (e.g. 'we accept the delay')..."
                value={scannerInput}
                onChange={(e) => {
                  setScannerInput(e.target.value);
                  setScanFindings(scanForDangerousPhrases(e.target.value));
                }}
              />
            </div>
            {scanFindings.length > 0 && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'var(--status-critical-bg)', border: '1px solid var(--status-critical-border)', borderRadius: 'var(--radius-sm)' }}>
                {scanFindings.map((f, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--status-critical)' }}>
                    &bull; <strong>Flagged:</strong> {f.recommendation} &rarr; <em>Recommended wording: &ldquo;{f.reservation}&rdquo;</em>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setCurrentStep(3)}>
              Back to Implications
            </button>
            <button className="btn-primary" onClick={() => setCurrentStep(5)}>
              <span>Proceed to Step 5: Site Questionnaire</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REPLY PREPARATION QUESTIONNAIRE */}
      {currentStep === 5 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <HelpCircle size={20} color="var(--accent-blue)" />
              <span>Ground-Truth Site Questionnaire (Collecting Critical Factual Evidence)</span>
            </div>
            <span className="badge badge-notice">Dynamic Strategy Generator</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            The AI needs specific site facts from your engineering team to construct an airtight rebuttal. 
            Modifying answers below dynamically updates the contractual strategy and generated reply letter.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questionnaireState.map(q => (
              <div 
                key={q.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {q.question}
                </div>

                {q.type === 'select' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, oi) => (
                      <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name={`radio-${q.id}`} 
                          checked={q.userAnswer === opt} 
                          onChange={() => handleAnswerChange(q.id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'checkbox' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, oi) => {
                      const currentSelected = Array.isArray(q.userAnswer) ? q.userAnswer : [];
                      const isChecked = currentSelected.includes(opt);
                      return (
                        <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              let next: string[];
                              if (e.target.checked) next = [...currentSelected, opt];
                              else next = currentSelected.filter(item => item !== opt);
                              handleAnswerChange(q.id, next);
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === 'text' && (
                  <input 
                    type="text"
                    className="form-input"
                    value={typeof q.userAnswer === 'string' ? q.userAnswer : ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    style={{ width: '100%', marginTop: '6px' }}
                  />
                )}

                <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--accent-blue)', fontStyle: 'italic' }}>
                  <strong>Contractual Impact:</strong> {q.impactOnStrategy}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setCurrentStep(4)}>
              Back to DO NOT SAY
            </button>
            <button className="btn-primary" onClick={() => setCurrentStep(6)}>
              <span>Proceed to Step 6: Response Matrix</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CLAUSE-BY-CLAUSE RESPONSE MATRIX */}
      {currentStep === 6 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <FileCode size={20} color="var(--accent-blue)" />
              <span>Clause-by-Clause Response Matrix (Tabular Pre-Review)</span>
            </div>
            <span className="badge badge-success">Review Before Letter Dispatch</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Review our line-by-line rebuttal to every instruction and allegation prior to generating the formal letter.
          </p>

          <div className="table-container">
            <table className="contract-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>PMC / Client Statement</th>
                  <th style={{ width: '15%' }}>Governing Clause</th>
                  <th style={{ width: '22%' }}>Our Contractual Position</th>
                  <th style={{ width: '18%' }}>Contemporary Evidence</th>
                  <th style={{ width: '23%' }}>Proposed Letter Text</th>
                </tr>
              </thead>
              <tbody>
                {matrixState.map(row => (
                  <tr key={row.statementId}>
                    <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {row.clientStatement}
                    </td>
                    <td>
                      <span className="citation-pill">{row.contractReference}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {row.ourPosition}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                      {row.evidenceRequired}
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      {row.proposedResponse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setCurrentStep(5)}>
              Back to Questionnaire
            </button>
            <button className="btn-primary" onClick={() => setCurrentStep(7)}>
              <span>Generate Contractual Reply Letter</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: FORMAL LETTER GENERATOR */}
      {currentStep === 7 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tone Selector and Actions Bar */}
          <div className="glass-panel" style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Select Contractual Correspondence Tone
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {(['Firm Contractual', 'Strong Contractual Defense', 'Professional & Objective', 'Diplomatic & Collaborative', 'Senior-Management Level', 'Dispute-Prepared'] as LetterTone[]).map(t => (
                    <button
                      key={t}
                      className={`nav-action-btn ${selectedTone === t ? 'active' : ''}`}
                      onClick={() => handleToneChange(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={copyToClipboard}>
                  {copied ? <Check size={16} color="var(--status-success)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
                </button>
                <button className="btn-secondary" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Print / Export PDF</span>
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setCustomDraft('');
                    handleToneChange(selectedTone);
                  }}
                  title="Reset edits to AI generated template"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Letter Document Preview Box */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={18} color="var(--accent-blue)" />
                <strong style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>
                  Formal Contractual Reply ({selectedTone})
                </strong>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
                  <button 
                    className={`nav-action-btn ${letterViewMode === 'letterhead' ? 'active' : ''}`}
                    style={{ padding: '4px 12px', fontSize: '0.76rem', border: 'none', background: letterViewMode === 'letterhead' ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}
                    onClick={() => setLetterViewMode('letterhead')}
                  >
                    📄 Official Letterhead
                  </button>
                  <button 
                    className={`nav-action-btn ${letterViewMode === 'editor' ? 'active' : ''}`}
                    style={{ padding: '4px 12px', fontSize: '0.76rem', border: 'none', background: letterViewMode === 'editor' ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}
                    onClick={() => setLetterViewMode('editor')}
                  >
                    ✏️ Text Editor
                  </button>
                </div>
              </div>
            </div>

            {letterViewMode === 'letterhead' ? (
              <div 
                className="letter-document-view"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  padding: '50px 60px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  lineHeight: 1.7,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Official Letterhead Header */}
                <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', textTransform: 'uppercase' }}>
                      {project.contractor}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '3px' }}>
                      Package: {project.code} &bull; Site Office & Infrastructure Cast Yard Area
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
                    <div style={{ fontWeight: 700, color: '#dc2626', border: '1px solid #dc2626', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>
                      FORMAL CONTRACTUAL CORRESPONDENCE
                    </div>
                    <div>WITHOUT PREJUDICE</div>
                  </div>
                </div>

                <div style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', color: '#1e293b' }}>
                  {currentDraftText}
                </div>
              </div>
            ) : (
              <textarea
                className="form-textarea"
                style={{
                  width: '100%',
                  minHeight: '620px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  padding: '22px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)'
                }}
                value={currentDraftText}
                onChange={(e) => setCustomDraft(e.target.value)}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button className="btn-secondary" onClick={() => setCurrentStep(6)}>
              Back to Matrix
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary"
                onClick={() => {
                  const blob = new Blob([currentDraftText], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Contractual_Reply_${letter.refNumber.replace(/[\/\\:]/g, '_')}.txt`;
                  link.click();
                }}
              >
                <Download size={16} />
                <span>Export Formal Rebuttal (.txt / Word)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
