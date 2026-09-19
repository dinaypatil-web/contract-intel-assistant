import React, { useState } from 'react';
import { Project, IncomingLetterReview } from '../../types/contract';
import { 
  FileText, 
  Send, 
  X, 
  Upload, 
  AlertOctagon, 
  Building2, 
  Calendar, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface IngestCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onIngestLetter: (letter: IncomingLetterReview) => void;
}

export const IngestCommunicationModal: React.FC<IngestCommunicationModalProps> = ({
  isOpen,
  onClose,
  project,
  onIngestLetter
}) => {
  const [sender, setSender] = useState<string>(project?.pmc || 'The Engineer / PMC');
  const [recipient, setRecipient] = useState<string>(project?.contractor || 'Contractor');
  const [refNumber, setRefNumber] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState<string>('');
  const [letterText, setLetterText] = useState<string>('');
  const [attachedFileName, setAttachedFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachedFileName(file.name);
      
      // Auto-extract or fill metadata from file name
      if (!refNumber) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setRefNumber(`PMC/${project?.code || 'PRJ'}/${cleanName.slice(0, 15).toUpperCase()}`);
      }
      if (!subject) {
        setSubject(`Instruction / Communication regarding ${file.name.replace(/\.[^/.]+$/, "")}`);
      }

      // Read file content if text or fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && typeof content === 'string' && content.trim().length > 20) {
          setLetterText(content);
        } else {
          setLetterText(`[Uploaded Document: ${file.name}]\n\nFormal correspondence received from ${sender} regarding ${subject || file.name}.\n\nThe Engineer hereby instructs the Contractor to comply with the directives and requirements stated in the attached communication.`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = (sampleType: 'acceleration' | 'variation-rejection' | 'time-bar') => {
    if (sampleType === 'acceleration') {
      setSender(`${project?.pmc || 'PMC / Engineer Consortium'} (The Engineer)`);
      setRefNumber(`PMC/${project?.code || 'PRJ'}/2026/LTR-1482`);
      setDate(new Date().toISOString().split('T')[0]);
      setSubject("CRITICAL NOTICE: Failure to Achieve Planned Progress; Instruction to Accelerate Works under Clause 8.6 at Contractor's Own Cost; Threat of Delay Damages");
      setLetterText(`Ref: PMC/${project?.code || 'PRJ'}/2026/LTR-1482
Date: ${new Date().toISOString().split('T')[0]}

To: The Project Director, ${project?.contractor || 'Contractor'}

SUBJECT: Failure to Achieve Planned Progress; Instruction to Accelerate Works under Sub-Clause 8.6; Preservation of Delay Damages Rights under Sub-Clause 8.7.

Dear Sir,

1. A joint progress inspection confirms that execution of the critical path works is currently lagging behind the approved schedule by 42 calendar days, directly threatening Key Milestone No. 3.

2. The Engineer records that this cumulative delay is solely attributable to the Contractor's failure to mobilize sufficient heavy equipment and qualified specialist crews.

3. Consequently, in accordance with Sub-Clause 8.6 [Rate of Progress], the Engineer formally INSTRUCTS the Contractor to:
   (a) Immediately mobilize additional double-shift gangs and working equipment;
   (b) Work 24/7 continuous operations, including Sundays and holidays;
   (c) Submit within seven (7) days a Revised Recovery Programme showing completion without any time extension;
   (d) All expediting measures shall be executed entirely at the Contractor's own risk and cost as mandated by Clause 8.6.

4. Take notice that should the Contractor fail to achieve the completion date, the Employer shall immediately levy Delay Damages under Sub-Clause 8.7.`);
    } else if (sampleType === 'variation-rejection') {
      setSender(`${project?.pmc || 'PMC / Engineer'} (The Engineer)`);
      setRefNumber(`PMC/${project?.code || 'PRJ'}/2026/DET-08`);
      setDate(new Date().toISOString().split('T')[0]);
      setSubject("Engineer's Determination: Rejection of Claimed Variation for Unforeseen Ground Obstructions under Sub-Clause 4.12");
      setLetterText(`Ref: PMC/${project?.code || 'PRJ'}/2026/DET-08
Date: ${new Date().toISOString().split('T')[0]}

To: Project Director, ${project?.contractor || 'Contractor'}

SUBJECT: Determination regarding Notice of Claim No. 04 - Encounter of Uncharted Underground Services.

Dear Sir,

1. We refer to your Notice of Claim dated 14 days ago claiming additional cost and extension of time for encountering underground utility banks.

2. The Engineer has determined under Sub-Clause 3.7 that an experienced contractor should have foreseen such physical obstructions through comprehensive tender site investigations. 

3. Accordingly, your claim for Variation under Clause 13.3 and extension of time under Clause 8.4 is hereby REJECTED in full. You are instructed to proceed with diversion works at your own expense.`);
    } else {
      setSender(`${project?.client || 'Employer / Client'}`);
      setRefNumber(`EMP/${project?.code || 'PRJ'}/2026/NOT-01`);
      setDate(new Date().toISOString().split('T')[0]);
      setSubject("Formal Notice: Employer's Disallowance of Claims for Failure to Give 28-Day Notice under Sub-Clause 20.2");
      setLetterText(`Ref: EMP/${project?.code || 'PRJ'}/2026/NOT-01
Date: ${new Date().toISOString().split('T')[0]}

To: ${project?.contractor || 'Contractor'}

SUBJECT: Discharge of Employer Liability under Sub-Clause 20.2 due to Time-Bar.

Dear Sir,

1. Records show that the impediment event referenced in your letter occurred more than 28 days prior to the date of your formal Notice of Claim.

2. Pursuant to the strict express terms of Sub-Clause 20.2 [Claims For Payment and/or EOT], failure to give notice within the mandatory 28-day period fully discharges the Employer from all liability.

3. Take notice that all associated time extension and financial compensation are unconditionally time-barred and extinguished.`);
    }
  };

  const handleIngest = () => {
    const finalRef = refNumber.trim() || `PMC/${project?.code || 'PRJ'}/LTR-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalSubject = subject.trim() || 'Formal Project Communication / Directive';
    const finalSender = sender.trim() || 'The Engineer / PMC';
    const finalRecipient = recipient.trim() || project?.contractor || 'Contractor';
    const finalDate = date || new Date().toISOString().split('T')[0];
    const finalText = letterText.trim() || `Ref: ${finalRef}\nDate: ${finalDate}\nFrom: ${finalSender}\nSubject: ${finalSubject}\n\n[Communication Content]`;

    // Determine risk and extraction
    const isAcceleration = /accelerat|expedite|8\.6|24\/7|at (its|contractor's) own cost/i.test(finalText);
    const isTimeBar = /time-bar|28 days|discharg|extinguish|barr/i.test(finalText);
    const isDelayDamages = /delay damages|liquidated damages|8\.7|deduct/i.test(finalText);

    const newLetter: IncomingLetterReview = {
      id: `ltr-${Date.now()}`,
      projectId: project.id,
      sender: finalSender,
      recipient: finalRecipient,
      date: finalDate,
      refNumber: finalRef,
      subject: finalSubject,
      riskScore: isAcceleration || isDelayDamages || isTimeBar ? 'Critical' : 'High',
      riskScoreExplanation: isAcceleration 
        ? 'Directs unilateral acceleration under Sub-Clause 8.6 at Contractor expense while ignoring Employer hindrances and pending EOT notices.'
        : isTimeBar
        ? 'Purports to time-bar contractor entitlements under Sub-Clause 20.2.'
        : 'Contractual communication containing performance, scope, or commercial directives requiring fortified rebuttal.',
      originalText: finalText,
      extractedData: {
        instructions: [finalSubject],
        allegations: [
          isAcceleration ? 'Contractor alleged to be in delay on critical path' : 'Performance requirements disputed'
        ],
        deadlines: [
          isAcceleration ? 'Submit Revised Recovery Programme within 7 days' : 'Response required within 14 days'
        ],
        clausesCited: [
          isAcceleration ? 'Sub-Clause 8.6 [Rate of Progress]' : 'Sub-Clause 20.2 [Claims]'
        ],
        financialImplications: isAcceleration 
          ? 'Risk of uncompensated overtime, equipment mobilization, and threat of delay damages.'
          : 'Potential commercial exposure if left undefended.',
        timeImplications: 'Critical path completion date and milestone compliance under threat.',
        potentialContractualConsequences: [
          'Delay Damages under Sub-Clause 8.7',
          'Notice of Default under Sub-Clause 15.2 if unrebutted'
        ]
      },
      crossCheck: [
        {
          id: 'cc-1',
          statement: isAcceleration 
            ? 'Contractor instructed to accelerate works at its own risk and cost under Sub-Clause 8.6'
            : 'Directive or assertion seeking to transfer responsibility to Contractor',
          clausesCited: [
            { 
              clauseNumber: 'PC 8.6', 
              title: 'Rate of Progress', 
              volumeNumber: 'Volume 1', 
              pageNumber: 84, 
              excerpt: 'Contractor shall expedite at own risk and cost only other than as a result of a cause listed in Sub-Clause 8.4.' 
            },
            {
              clauseNumber: 'PC 8.4',
              title: 'Extension of Time for Completion',
              volumeNumber: 'Volume 1',
              pageNumber: 82,
              excerpt: 'Contractor is entitled to an Extension of Time for Employer delays, site access hindrances, or exceptionally adverse conditions.'
            }
          ],
          status: 'Not Supported',
          analysis: 'Particular Conditions Sub-Clause 8.6 explicitly limits uncompensated acceleration to delays solely attributable to the Contractor. Employer hindrances, site access issues, and drawing releases entitle the Contractor to Extension of Time under Clause 8.4 and compensation under Clause 13.3.'
        }
      ],
      implications: {
        cost: { level: 'Critical', details: 'Directing uncompensated resource mobilization without formal Variation Order.' },
        time: { level: 'Critical', details: 'Milestone target at risk due to critical path obstruction.' },
        liability: { level: 'High', details: 'Exposure to Sub-Clause 8.7 liquidated delay damages if delay culpability is admitted.' },
        claims: { level: 'Critical', details: 'Must preserve right to EOT and constructive acceleration costs under Clause 20.2.' },
        commercialPosition: { level: 'High', details: 'Rejecting sole culpability is essential to avoid setting an uncompensated overtime precedent.' },
        precedentRisk: { level: 'High', details: 'Failure to rebut constitutes acquiescence in Engineer\'s delay allocation.' }
      },
      doNotSayItems: [
        {
          id: 'dns-1',
          dangerousPhrase: 'We accept the delay',
          riskExplanation: 'Fatal concession conceding sole responsibility; bars subsequent EOT claims.',
          safeAlternative: 'While we acknowledge the progress variance against the baseline schedule, such variance directly stems from events beyond Contractor control.',
          contractualReservation: 'Strictly without prejudice to our Extension of Time and cost entitlements under Sub-Clause 20.2.'
        },
        {
          id: 'dns-2',
          dangerousPhrase: 'At our own cost',
          riskExplanation: 'Voluntary abandonment of variation and additional payment rights.',
          safeAlternative: 'Subject to formal variation instruction and cost reimbursement under Sub-Clause 13.3.',
          contractualReservation: 'Subject to formal variation determination by the Engineer.'
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
        },
        {
          id: 'q-3',
          question: 'Was a formal notice served within 28 days of becoming aware of the hindrance?',
          type: 'boolean',
          userAnswer: true,
          impactOnStrategy: 'Confirms complete defense against any Employer time-bar allegations.'
        }
      ],
      responseMatrix: [
        {
          statementId: 'rm-1',
          clientStatement: finalSubject,
          contractReference: 'PC 8.4 / PC 8.6 / PC 20.2',
          ourPosition: 'Progress was impacted by hindrances for which timely notices were submitted.',
          evidenceRequired: 'Monthly Progress Reports, Daily Site Logs, Notice of Claim under Clause 20.2',
          riskLevel: 'Critical',
          proposedResponse: 'The Contractor categorically refutes sole culpability. Critical path variance was caused by events for which notices were duly served.'
        }
      ]
    };

    onIngestLetter(newLetter);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} color="var(--accent-blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Ingest Letter / Communication from Employer / PMC
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target Project: <strong style={{ color: 'var(--accent-blue)' }}>{project?.code} - {project?.name}</strong>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Load Common PMC Directives:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="nav-action-btn"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => handleLoadSample('acceleration')}
            >
              ⚠️ Clause 8.6 Acceleration Directive
            </button>
            <button 
              type="button" 
              className="nav-action-btn"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => handleLoadSample('variation-rejection')}
            >
              ❌ Claim Rejection Determination
            </button>
            <button 
              type="button" 
              className="nav-action-btn"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => handleLoadSample('time-bar')}
            >
              ⏳ 28-Day Time-Bar Notice
            </button>
          </div>
        </div>

        {/* Metadata Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">From (Employer / PMC / Engineer)</label>
            <input 
              type="text" 
              className="form-input" 
              value={sender} 
              onChange={(e) => setSender(e.target.value)} 
              placeholder="e.g. Egis-Systra Consortium (The Engineer)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Letter Reference Number</label>
            <input 
              type="text" 
              className="form-input" 
              value={refNumber} 
              onChange={(e) => setRefNumber(e.target.value)} 
              placeholder="e.g. PMC/MRCL/2026/LTR-1482"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Communication</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Subject / Title</label>
          <input 
            type="text" 
            className="form-input" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="e.g. Notice to Accelerate Works under Clause 8.6; Threat of Liquidated Damages"
          />
        </div>

        {/* File Upload Attachment Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Upload size={18} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {attachedFileName ? `Attached File: ${attachedFileName}` : 'Attach PDF / Word Letter from Local Disk'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Select local document or paste letter body text directly below
              </div>
            </div>
          </div>

          <input 
            type="file" 
            id="letter-file-picker" 
            accept=".pdf,.doc,.docx,.txt" 
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="letter-file-picker" 
            className="btn-secondary" 
            style={{ cursor: 'pointer', fontSize: '0.78rem', padding: '6px 14px' }}
          >
            {attachedFileName ? 'Change File' : 'Browse Local Letter'}
          </label>
        </div>

        {/* Letter Text Content */}
        <div className="form-group">
          <label className="form-label">Letter Body / Content</label>
          <textarea 
            className="form-input" 
            style={{ minHeight: '220px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.6 }}
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="Paste the full text of the letter, notice, or site instruction received from the Employer/PMC..."
          />
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          
          <button 
            className="btn-primary" 
            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            onClick={handleIngest}
          >
            <Sparkles size={16} />
            <span>Ingest & Run 7-Step Contractual Review &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
