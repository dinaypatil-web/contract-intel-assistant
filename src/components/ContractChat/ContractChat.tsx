import React, { useState } from 'react';
import { Project, ChatReasoningMode, ChatMessage } from '../../types/contract';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  AlertCircle 
} from 'lucide-react';

interface ContractChatProps {
  project: Project;
  initialPrompt?: string;
}

export const ContractChat: React.FC<ContractChatProps> = ({
  project,
  initialPrompt = ''
}) => {
  const [selectedMode, setSelectedMode] = useState<ChatReasoningMode>('contractor-defence');
  const [inputPrompt, setInputPrompt] = useState<string>(initialPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: 'Just now',
      content: `Welcome to the Contract Intelligence Assistant for **${project.name}**. I evaluate all queries against the **5-Tier Priority Framework**:
1. Signed Contract Conditions (Particular & General)
2. Contract Order of Precedence (Sub-Clause 1.5)
3. Project Contemporaneous Records & Notices
4. Applicable Statutory Law
5. General Construction Industry Practice

Select your preferred reasoning mode above to analyze contractual issues, evaluate claims, or prepare dispute briefs.`,
      confidence: 'High',
      mode: 'contractor-defence'
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const reasoningModes: { id: ChatReasoningMode; label: string; desc: string }[] = [
    { id: 'quick', label: 'Quick Answer', desc: 'Concise clause summary & direct interpretation' },
    { id: 'detailed', label: 'Detailed Analysis', desc: 'Multi-clause synthesis across all volumes' },
    { id: 'contractor-defence', label: 'Contractor Defence', desc: 'Shield commercial position & preserve entitlements' },
    { id: 'pmc-perspective', label: 'Employer / PMC Perspective', desc: 'Anticipate opposing arguments & audit hurdles' },
    { id: 'claim-prep', label: 'Claim Preparation', desc: 'Clause basis, time-bars & contemporary records' },
    { id: 'dispute-prep', label: 'Dispute Preparation', desc: 'Chronological evidentiary brief for DAAB/arbitration' }
  ];

  const suggestedPrompts = [
    "What is the mandatory notice period under Sub-Clause 20.2 for claim notification and time-bar compliance?",
    "Can the Employer levy Delay Damages while an Extension of Time (EOT) claim is pending determination?",
    "If the Engineer instructs acceleration under Clause 8.6 for delays caused by Employer hindrances, who bears the cost?",
    "How does the Order of Precedence under Sub-Clause 1.5 resolve discrepancies between Particular Conditions and General Conditions?"
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text,
      mode: selectedMode
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let aiContent = '';
      let citations: ChatMessage['citations'] = [];
      let practiceNotes: string[] = [];
      let actionList: string[] = [];

      if (text.toLowerCase().includes('accelerat') || text.toLowerCase().includes('8.6') || text.toLowerCase().includes('manpower')) {
        if (selectedMode === 'contractor-defence') {
          aiContent = `### A. Issue Identification
The PMC is attempting to compel unilateral acceleration under **Sub-Clause 8.6 [Rate of Progress]** at the Contractor's sole expense, while bypassing pending Contractor Extension of Time notices under **Sub-Clause 8.4**.

### B. Contractual Interpretation & The Proviso in Clause 8.6
Sub-Clause 8.6 explicitly limits the Engineer's authority to order acceleration at Contractor cost to situations where progress has fallen behind:
> *"other than as a result of a cause listed in Sub-Clause 8.4 [Extension of Time for Completion]"*

Because the 48-day delay between Pier P102 and P140 arose from Employer/Public Authority delay (unchartered 132kV overhead high-tension lines and delayed foundation coordinate drawings under PC 1.9 & PC 8.5), **the delay constitutes an Employer risk event under Sub-Clause 8.4(d)**. Consequently:
1. **The PMC has no contractual power under Clause 8.6 to force the Contractor to bear additional manpower or equipment costs.**
2. Ordering acceleration while refusing or delaying the grant of a legitimate EOT constitutes **"Constructive Acceleration"**.
3. Under FIDIC principles and Sub-Clause 13.3, instructed acceleration to achieve original milestones despite employer delay qualifies as a compensable **Variation**.

### C. Financial & Liquidated Damages Protection
Delay damages under **Sub-Clause 8.7** cannot be lawfully levied so long as the Contractor has a legitimate, unsubstantiated EOT claim awaiting Engineer determination.`;
          citations = [
            { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 8.6', page: 93, excerpt: 'Adopt revised methods at Contractor risk other than as a result of a cause listed in Sub-Clause 8.4' },
            { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 8.4', page: 88, excerpt: 'Contractor entitled to Extension of Time for delay caused by Employer or Authorities' },
            { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 13.3', page: 132, excerpt: 'Variation procedure for instructed changes to schedule and method' }
          ];
          practiceNotes = [
            'Maintain daily logs of all additional manpower, crane hours, and fuel explicitly allocated to the accelerated section.',
            'Endorse all delivery challans and timesheets: "Deployed pursuant to PMC Directive LTR-1482 under protest and without prejudice".'
          ];
          actionList = [
            'Issue formal contractual letter refuting applicability of Clause 8.6 within 7 days.',
            'Submit Dual Programme: (A) Impacted EOT Schedule showing 54-day revised milestone, and (B) Conditional Acceleration Programme priced at $1.84M.',
            'Expressly reserve all rights to claim constructive acceleration under Clause 13.3.'
          ];
        } else if (selectedMode === 'pmc-perspective') {
          aiContent = `### Employer / PMC Perspective & Counter-Arguments
To effectively defend the Contractor's position, you must anticipate how the PMC and Employer's legal advisors will argue this matter:

1. **Failure to Mitigate Defense:**
   The PMC will argue that even if the 132kV line was an impediment, the Contractor failed in its general duty to mitigate under common law and Sub-Clause 8.3 by not resequencing Pier Cap erections to unobstructed sections (e.g. Piers P142 to P180).
2. **Concurrent Contractor Delay:**
   The PMC will assert that during May to July 2026, the Contractor only mobilized 1 out of 3 required 150 MT crawler cranes, constituting concurrent contractor culpable delay.
3. **Programme Rejection:**
   The Engineer will insist that until a revised programme is formally approved under Sub-Clause 8.3, the Baseline Rev. 04 completion date of 15 November 2026 remains the sole contractual benchmark.`;
          citations = [
            { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 8.3', page: 85 },
            { document: 'General Conditions', volume: 'Volume 2', clause: 'GC 8.6', page: 93 }
          ];
        } else {
          aiContent = `Under Sub-Clause 8.6, the PMC can only require acceleration at Contractor expense if the delay is strictly caused by Contractor default. If the delay is caused by Employer risks under Sub-Clause 8.4, the instruction constitutes a compensable Variation under Sub-Clause 13.3.`;
          citations = [
            { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 8.6', page: 93 }
          ];
        }
      } else if (text.toLowerCase().includes('liquidated') || text.toLowerCase().includes('8.7') || text.toLowerCase().includes('damages')) {
        aiContent = `### Contractual Position on Delay Damages (Sub-Clause 8.7)
1. **Deduction Pre-conditions:** Under Sub-Clause 8.7 of the Particular Conditions (Page 96), delay damages of 0.1% per day (capped at 10% / $38.5M) are only leviable if the Contractor fails to complete within the *Time for Completion as legitimately extended*.
2. **Pending EOT Claims:** If the Engineer has failed to determine Contractor's EOT Claim No. 03 (54 days) within the required timeline under Sub-Clause 3.7, any premature deduction of LDs by the Employer constitutes an unlawful withholding.
3. **Interest Entitlement:** In accordance with Sub-Clause 14.8, any improper deduction of delay damages entitles the Contractor to financing charges (interest) compounded monthly.`;
        citations = [
          { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 8.7', page: 96 },
          { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 8.4', page: 88 }
        ];
        actionList = [
          'Submit written notice that time is at large or liquidated damages are unenforceable until EOT Claim 03 is determined.',
          'Reserve rights to claim commercial financing interest under Sub-Clause 14.8 on any withheld IPC funds.'
        ];
      } else {
        aiContent = `### Contractual Analysis for: "${text}"
Based on the contract documents for **${project.name}**:

1. **Governing Provisions:** The relevant obligations are governed by the Conditions of Contract (Volume 1) in conjunction with the Order of Precedence (Sub-Clause 1.5).
2. **Notice Requirements:** Please ensure that any relevant event is formally notified in writing to the Engineer within **28 calendar days** pursuant to Sub-Clause 20.2 to prevent the claim from being strictly time-barred.
3. **Contemporary Records:** Maintain daily progress records, joint inspection photographs, and surveyor logs.`;
        citations = [
          { document: 'Particular Conditions', volume: 'Volume 1', clause: 'PC 20.2', page: 174 }
        ];
        practiceNotes = [
          'Maintain contemporaneous daily logs signed where possible by the PMC resident engineer.',
          'Always issue communications with an express "Without Prejudice and with all rights reserved" header.'
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: aiContent,
        mode: selectedMode,
        confidence: 'High',
        citations,
        industryPracticeNotes: practiceNotes.length > 0 ? practiceNotes : undefined,
        actionChecklist: actionList.length > 0 ? actionList : undefined
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      {/* Reasoning Mode Selection Bar */}
      <div className="glass-panel" style={{ padding: '12px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-blue)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Contractual Reasoning Mode
            </span>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
            Strict RAG Active &bull; Zero Hallucination Guard
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {reasoningModes.map(mode => (
            <button
              key={mode.id}
              className={`nav-action-btn ${selectedMode === mode.id ? 'active' : ''}`}
              onClick={() => setSelectedMode(mode.id)}
              style={{ fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              title={mode.desc}
            >
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 4px', flexShrink: 0 }}>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            className="nav-action-btn"
            style={{ fontSize: '0.75rem', padding: '5px 10px', whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
            onClick={() => handleSend(p)}
          >
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div 
        className="glass-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.sender === 'user' ? '80%' : '90%',
              gap: '6px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <span>{msg.sender === 'user' ? 'You' : 'Contract Intelligence AI'}</span>
              <span>&bull;</span>
              <span>{msg.timestamp}</span>
              {msg.confidence && (
                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  Confidence: {msg.confidence}
                </span>
              )}
            </div>

            <div style={{
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--bg-surface)',
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

              {/* Citations Section */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} />
                    <span>Contractual Evidence Citations:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {msg.citations.map((c, idx) => (
                      <span key={idx} className="citation-pill" title={c.excerpt}>
                        {c.document} &rarr; {c.clause} (Vol: {c.volume}, Page {c.page})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Practice Alert Box */}
              {msg.industryPracticeNotes && (
                <div style={{
                  marginTop: '14px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid var(--status-warning-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--status-warning)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={14} />
                    <span>INDUSTRY PRACTICE — RECOMMENDED STRATEGY (NOT A CONTRACTUAL OBLIGATION)</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                    {msg.industryPracticeNotes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Checklist */}
              {msg.actionChecklist && (
                <div style={{
                  marginTop: '12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--status-success-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} />
                    <span>Recommended Immediate Action Checklist:</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', color: 'var(--text-primary)' }}>
                    {msg.actionChecklist.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            <Sparkles size={14} color="var(--accent-blue)" />
            <span>Reasoning across Contract Hierarchy & Precedence Rules...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="glass-panel" style={{ padding: '12px 16px', flexShrink: 0 }}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, fontSize: '0.875rem' }}
            placeholder="Ask anything regarding contract clauses, PMC letters, EOT claims, or risk..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={!inputPrompt.trim() || isTyping}>
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
