import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  HelpCircle,
  ArrowRight,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import { auditDraftLetter, DraftCorrectionFinding, MissingSafeguard } from '../../utils/legalSafety';
import { Project } from '../../types/contract';

interface DraftCheckerTabProps {
  initialText: string;
  project: Project;
  onApplyDraft?: (fortifiedText: string) => void;
}

export const DraftCheckerTab: React.FC<DraftCheckerTabProps> = ({
  initialText,
  project,
  onApplyDraft
}) => {
  const [draftText, setDraftText] = useState<string>(initialText || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'dangerous' | 'safeguards'>('all');

  // Sync if initial text changes and user hasn't heavily modified
  React.useEffect(() => {
    if (initialText && (!draftText || draftText === initialText)) {
      setDraftText(initialText);
    }
  }, [initialText]);

  // Run audit in real-time
  const auditResult = useMemo(() => {
    return auditDraftLetter(draftText);
  }, [draftText]);

  const { safetyScore, findings, safeguards, assertiveness, toneSummary } = auditResult;

  // Score color and label
  const getScoreTheme = (score: number) => {
    if (score >= 85) return { color: 'var(--status-success)', label: 'Strong & Legally Fortified', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' };
    if (score >= 60) return { color: 'var(--status-warning)', label: 'Moderate Risk / Safeguards Needed', bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.3)' };
    return { color: 'var(--status-critical)', label: 'High Exposure / Dangerous Admissions', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
  };

  const theme = getScoreTheme(safetyScore);

  // Apply single finding fix
  const handleFixFinding = (finding: DraftCorrectionFinding) => {
    // Replace the matched phrase with safe replacement
    const regex = new RegExp(finding.matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const updated = draftText.replace(regex, finding.safeReplacement);
    setDraftText(updated);
    if (onApplyDraft) onApplyDraft(updated);
  };

  // Insert missing safeguard
  const handleInsertSafeguard = (safeguard: MissingSafeguard) => {
    let updated = draftText;
    if (safeguard.id === 'sg-wp') {
      // Prepend without prejudice header
      updated = `WITHOUT PREJUDICE\n\n${updated.trim()}`;
    } else {
      // Append paragraph reservation before signature or at end
      updated = `${updated.trim()}\n\n${safeguard.suggestedText}`;
    }
    setDraftText(updated);
    if (onApplyDraft) onApplyDraft(updated);
  };

  // Auto-fortify entire draft at once
  const handleAutoFortifyAll = () => {
    let fortified = auditResult.autoCorrectedText;
    
    // Add missing mandatory safeguards if not present
    const missingMandatory = safeguards.filter(s => !s.isPresent && s.importance === 'Mandatory');
    if (missingMandatory.some(s => s.id === 'sg-wp') && !/without prejudice/i.test(fortified)) {
      fortified = `WITHOUT PREJUDICE\n\n${fortified.trim()}`;
    }
    
    const extraParagraphs = missingMandatory
      .filter(s => s.id !== 'sg-wp')
      .map(s => s.suggestedText)
      .join('\n\n');

    if (extraParagraphs) {
      fortified = `${fortified.trim()}\n\n${extraParagraphs}`;
    }

    setDraftText(fortified);
    if (onApplyDraft) onApplyDraft(fortified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fortified_Draft_${project?.code || 'PRJ'}_${Date.now()}.txt`;
    link.click();
  };

  const missingSafeguards = safeguards.filter(s => !s.isPresent);
  const presentSafeguards = safeguards.filter(s => s.isPresent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Metric Summary */}
      <div 
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Score Ring */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              border: `4px solid ${theme.color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)',
              boxShadow: `0 0 16px ${theme.border}`
            }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.color, lineHeight: 1 }}>
                {safetyScore}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                / 100
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Draft Legal Safety & Safeguard Audit
                </h3>
                <span className={`badge ${safetyScore >= 85 ? 'badge-success' : safetyScore >= 60 ? 'badge-warning' : 'badge-critical'}`}>
                  {theme.label}
                </span>
                <span className="badge badge-notice" style={{ background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Assertiveness: {assertiveness}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '720px', lineHeight: 1.4 }}>
                {toneSummary}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '0.88rem'
              }}
              onClick={handleAutoFortifyAll}
              title="Replace all dangerous concessions with safe wording and insert missing mandatory reservations"
            >
              <Sparkles size={16} />
              <span>Auto-Fortify Entire Draft</span>
            </button>
            <button className="btn-secondary" onClick={handleCopy} title="Copy draft to clipboard">
              {copied ? <Check size={16} color="var(--status-success)" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button className="btn-secondary" onClick={handleExport} title="Download fortified draft">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Draft Editor & Input */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-blue)" />
              <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                Draft Reply Editor & Live Inspector
              </strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {draftText.split(/\s+/).filter(Boolean).length} words &bull; {draftText.length} characters
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              className="form-textarea"
              style={{
                width: '100%',
                minHeight: '520px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: 1.65,
                padding: '16px',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                resize: 'vertical',
                border: '1px solid var(--border-subtle)'
              }}
              value={draftText}
              onChange={(e) => {
                setDraftText(e.target.value);
                if (onApplyDraft) onApplyDraft(e.target.value);
              }}
              placeholder="Paste or write any draft contractual reply here. The AI will continuously inspect it for legal pitfalls, concessions, and missing FIDIC reservations..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Wand2 size={14} color="var(--accent-blue)" />
              <span>Edits are analyzed in real-time. Paste external drafts or tweak AI generated replies freely.</span>
            </div>
            <button 
              className="btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              onClick={() => {
                setDraftText(initialText || '');
                if (onApplyDraft) onApplyDraft(initialText || '');
              }}
              title="Reset to initial reply text"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right Column: Audit Findings & Suggestions Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tabs Filter */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button 
              className={`nav-action-btn ${activeTab === 'all' ? 'active' : ''}`}
              style={{ flex: 1, padding: '6px 8px', fontSize: '0.78rem', textAlign: 'center' }}
              onClick={() => setActiveTab('all')}
            >
              All Inspections ({findings.length + missingSafeguards.length})
            </button>
            <button 
              className={`nav-action-btn ${activeTab === 'dangerous' ? 'active' : ''}`}
              style={{ flex: 1, padding: '6px 8px', fontSize: '0.78rem', textAlign: 'center' }}
              onClick={() => setActiveTab('dangerous')}
            >
              Traps ({findings.length})
            </button>
            <button 
              className={`nav-action-btn ${activeTab === 'safeguards' ? 'active' : ''}`}
              style={{ flex: 1, padding: '6px 8px', fontSize: '0.78rem', textAlign: 'center' }}
              onClick={() => setActiveTab('safeguards')}
            >
              Safeguards ({missingSafeguards.length} missing)
            </button>
          </div>

          {/* Section 1: Dangerous Concessions Found */}
          {(activeTab === 'all' || activeTab === 'dangerous') && (
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="var(--status-critical)" />
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    Dangerous Phrases & Concessions ({findings.length})
                  </strong>
                </div>
                {findings.length === 0 && (
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Zero Traps Detected</span>
                )}
              </div>

              {findings.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <CheckCircle2 size={24} color="var(--status-success)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--status-success)' }}>
                    No Self-Incriminating Phrases Found
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Draft contains no unconditional delay admissions or voluntary cost absorption language.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {findings.map((item) => (
                    <div 
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(239, 68, 68, 0.07)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f87171', marginLeft: '6px' }}>
                            &ldquo;{item.matchedText}&rdquo;
                          </span>
                        </div>
                        <button
                          className="btn-secondary"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            background: 'rgba(34, 197, 94, 0.15)',
                            borderColor: 'rgba(34, 197, 94, 0.4)',
                            color: 'var(--status-success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleFixFinding(item)}
                          title="Replace phrase with safe contractual phrasing"
                        >
                          <Sparkles size={12} />
                          <span>Auto-Fix</span>
                        </button>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <span style={{ color: 'var(--status-critical)', fontWeight: 600 }}>Risk: </span>
                        {item.issue}
                      </div>

                      <div style={{ 
                        fontSize: '0.78rem', 
                        color: 'var(--status-success)', 
                        background: 'rgba(34, 197, 94, 0.08)',
                        padding: '6px 10px', 
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <ArrowRight size={12} />
                        <span><strong>Safe Replacement:</strong> &ldquo;{item.safeReplacement}&rdquo;</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Contractual Safeguards Checklist */}
          {(activeTab === 'all' || activeTab === 'safeguards') && (
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="var(--accent-blue)" />
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    Essential Contractual Safeguards
                  </strong>
                </div>
                <span className="badge badge-notice" style={{ fontSize: '0.72rem' }}>
                  {presentSafeguards.length} / {safeguards.length} Present
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {safeguards.map((sg) => (
                  <div 
                    key={sg.id}
                    style={{
                      padding: '12px 14px',
                      background: sg.isPresent ? 'rgba(34, 197, 94, 0.05)' : 'rgba(234, 179, 8, 0.07)',
                      border: `1px solid ${sg.isPresent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.25)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {sg.isPresent ? (
                          <CheckCircle2 size={16} color="var(--status-success)" />
                        ) : (
                          <AlertTriangle size={16} color="var(--status-warning)" />
                        )}
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sg.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ({sg.clause})
                        </span>
                      </div>

                      {!sg.isPresent ? (
                        <button
                          className="btn-secondary"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            background: 'rgba(56, 189, 248, 0.12)',
                            borderColor: 'rgba(56, 189, 248, 0.35)',
                            color: 'var(--accent-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleInsertSafeguard(sg)}
                          title="Insert this reservation clause into the draft"
                        >
                          <PlusCircle size={12} />
                          <span>Insert Clause</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>
                          Protected
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      {sg.description}
                    </div>

                    {!sg.isPresent && (
                      <div style={{ 
                        fontSize: '0.76rem', 
                        color: 'var(--text-muted)', 
                        background: 'var(--bg-surface)', 
                        padding: '6px 10px', 
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--status-warning)',
                        fontStyle: 'italic'
                      }}>
                        &ldquo;{sg.suggestedText}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Legal Tip Box */}
          <div 
            style={{
              padding: '14px 16px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}
          >
            <HelpCircle size={18} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--accent-blue)' }}>Contract Administration Best Practice: </strong>
              Never send replies conceding progress deficits without counter-citing site hindrances, delayed drawing approvals, or pending EOT claims under Sub-Clause 8.4. All letters must preserve full rights under Sub-Clause 20.2.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
