import React from 'react';
import { 
  Project, 
  NoticeAlert, 
  IncomingLetterReview, 
  ClaimRecord 
} from '../../types/contract';
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowRight, 
  Calendar, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  Layers, 
  Briefcase, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { ActiveView } from '../Sidebar';

interface DashboardViewProps {
  project: Project;
  alerts: NoticeAlert[];
  letters: IncomingLetterReview[];
  claims: ClaimRecord[];
  onNavigate: (view: ActiveView) => void;
  onSelectLetter: (letter: IncomingLetterReview) => void;
  onSetChatPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  alerts,
  letters,
  claims,
  onNavigate,
  onSelectLetter,
  onSetChatPrompt
}) => {
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Executive Command Header */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.95), rgba(22, 33, 58, 0.85))',
        borderColor: 'var(--border-medium)',
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow ring */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-notice" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                {project.code}
              </span>
              <span className="badge badge-neutral">
                {project.contractType.split('(')[0]}
              </span>
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={13} />
                Contract Memory Isolated
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.85rem',
              fontWeight: 800,
              marginTop: '10px',
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)'
            }}>
              {project.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span>Employer: <strong style={{ color: 'var(--text-primary)' }}>{project.client}</strong></span>
              <span>&bull;</span>
              <span>The Engineer: <strong style={{ color: 'var(--accent-blue)' }}>{project.pmc}</strong></span>
              <span>&bull;</span>
              <span>Contractor: <strong style={{ color: 'var(--text-primary)' }}>{project.contractor}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary"
              onClick={() => {
                if (letters.length > 0) onSelectLetter(letters[0]);
                onNavigate('letter-review');
              }}
            >
              <Zap size={16} />
              <span>Launch Letter Review Studio</span>
            </button>
            <button 
              className="btn-secondary"
              onClick={() => onNavigate('hierarchy')}
            >
              <Layers size={16} />
              <span>Precedence Hierarchy ({project.documents.length} Vols)</span>
            </button>
          </div>
        </div>

        {/* Live Contract Status Pills Ticker */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Contractual Guardrails:
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            Time-Bar: <strong>28-Day Strict Forfeiture (Cl. 20.2)</strong>
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            Liquidated Damages: <strong>0.1%/day capped at 10% (PC 8.7)</strong>
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            Directed Acceleration: <strong>Compensable under Cl. 13.3</strong>
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            Dispute Board: <strong>DAAB 42-Day Referral Window (PC 21.4)</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Accepted Contract Price</span>
            <TrendingUp size={16} color="var(--accent-blue)" />
          </div>
          <div className="kpi-value">{project.value}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="kpi-sub">Certified Progress: <strong>{project.stats.completionPercentage}%</strong></span>
            <div style={{ width: '80px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${project.stats.completionPercentage}%`, height: '100%', background: 'var(--accent-blue)' }} />
            </div>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">
            <span>Pending Commercial Claims</span>
            <Clock size={16} color="var(--status-warning)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-warning)' }}>
            {project.stats.pendingClaimsValue}
          </div>
          <div className="kpi-sub">
            EOT Claimed: <strong>{project.stats.eotClaimedDays} Days</strong> (+{project.currentEOTDays}d formally granted)
          </div>
        </div>

        <div className="kpi-card critical">
          <div className="kpi-label">
            <span>Early Warning Time-Bars</span>
            <AlertTriangle size={16} color="var(--status-critical)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-critical)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{criticalAlerts.length} Critical</span>
            <span className="badge badge-critical badge-critical-pulse" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              Active Radar
            </span>
          </div>
          <div className="kpi-sub">
            Total Open Notices: <strong>{project.stats.openNoticesCount}</strong> (Strict forfeiture bars)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Target Completion Date</span>
            <Calendar size={16} color="var(--status-success)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-success)' }}>
            {project.revisedCompletionDate}
          </div>
          <div className="kpi-sub">
            Original Tender: {project.originalCompletionDate}
          </div>
        </div>
      </div>

      {/* Main Split: Early Warning Radar & 5-Tier Reasoning Framework (Symmetrical 2-Column Grid) */}
      <div className="symmetric-grid-2col">
        {/* Early Warning Watchdog Radar */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="panel-header">
            <div className="panel-title">
              <AlertTriangle size={20} color="var(--status-critical)" />
              <span>Notice Early Warning & Time-Bar Watchdog</span>
            </div>
            <button 
              className="nav-action-btn"
              onClick={() => onNavigate('early-warning')}
            >
              <span>View All ({alerts.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {alerts.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
                color: 'var(--text-muted)'
              }}>
                <CheckCircle2 size={36} color="var(--status-success)" style={{ margin: '0 auto 12px', opacity: 0.9 }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  No Critical Time-Bars or Pending Notices
                </div>
                <div style={{ fontSize: '0.8rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                  All contractual notice windows under Sub-Clause 20.2 are compliant and clear.
                </div>
              </div>
            ) : (
              alerts.slice(0, 3).map(alert => {
                const isUrgent = alert.daysRemaining <= 4;
                return (
                  <div 
                    key={alert.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: `1px solid ${alert.severity === 'Critical' ? 'var(--status-critical-border)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: 'var(--shadow-inner)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${alert.severity === 'Critical' ? 'badge-critical' : 'badge-warning'} ${isUrgent ? 'badge-critical-pulse' : ''}`}>
                          {alert.severity}
                        </span>
                        <span className="citation-pill">{alert.clauseRef}</span>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: isUrgent ? 'var(--status-critical)' : 'var(--status-warning)'
                      }}>
                        {alert.daysRemaining === 0 ? 'DUE TODAY' : `${alert.daysRemaining} Days Left`}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {alert.title}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {alert.recommendedAction}
                    </div>

                    {/* Progress bar for time-bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.max(10, Math.min(100, ((alert.timeBarDays - alert.daysRemaining) / alert.timeBarDays) * 100))}%`,
                          height: '100%',
                          background: isUrgent ? 'var(--status-critical)' : 'var(--status-warning)'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Deadline: {alert.deadlineDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Notice Compliance Status: <strong style={{ color: 'var(--status-success)' }}>100% Active & Protected</strong>
            </span>
            <button className="nav-action-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => onNavigate('early-warning')}>
              <span>View Notice Tracker ({alerts.length}) &rarr;</span>
            </button>
          </div>
        </div>

        {/* 5-Tier Hierarchy Reasoning Engine */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="panel-header">
            <div className="panel-title">
              <Scale size={20} color="var(--accent-blue)" />
              <span>5-Tier Contract Hierarchy Priority Engine</span>
            </div>
            <span className="badge badge-success">Zero Hallucination Grounding</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.08)',
              borderLeft: '4px solid var(--accent-blue)',
              boxShadow: 'var(--shadow-inner)'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-blue)', fontSize: '1rem' }}>P1</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Priority 1 — Actual Signed Contract</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Executed Articles of Agreement, Particular Conditions & General Conditions.</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.08)',
              borderLeft: '4px solid var(--accent-indigo)',
              boxShadow: 'var(--shadow-inner)'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-indigo)', fontSize: '1rem' }}>P2</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Priority 2 — Order of Precedence Engine</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Agreement &gt; Addenda &gt; Particular Conditions &gt; General Conditions &gt; Specs &gt; Drawings &gt; BOQ.</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              borderLeft: '4px solid var(--status-success)',
              boxShadow: 'var(--shadow-inner)'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--status-success)', fontSize: '1rem' }}>P3</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Priority 3 — Project Contemporaneous Records</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Signed DPRs, Joint Survey Protocols, Baseline P6 Schedules, and Notice under Cl. 20.2.</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.08)',
              borderLeft: '4px solid var(--status-warning)',
              boxShadow: 'var(--shadow-inner)'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--status-warning)', fontSize: '1rem' }}>P4</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Priority 4 — Governing Statutory Law & Regulations</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Country contract laws, statutory electrical grid clearance acts, safety regulations.</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              borderLeft: '4px solid var(--text-muted)',
              boxShadow: 'var(--shadow-inner)'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-muted)', fontSize: '1rem' }}>P5</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Priority 5 — Construction Industry Practice</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Clearly distinguished as recommended commercial strategy, never as a legal mandate.</div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Governing Rule: <strong style={{ color: 'var(--accent-blue)' }}>Sub-Clause 1.5 [Priority of Documents]</strong>
            </span>
            <button className="nav-action-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => onNavigate('hierarchy')}>
              <span>Explore Precedence Graph &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fast Action Launchpad (Symmetrical 3-Card Grid) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={20} color="var(--accent-blue)" />
            <span>High-Priority Contract Intelligence Actions</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
          <div 
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="glass-panel"
            onClick={() => {
              if (letters.length > 0) onSelectLetter(letters[0]);
              onNavigate('letter-review');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.92rem' }}>
                <FileText size={18} />
                <span>Review & Rebut Incoming Letter</span>
              </div>
              <ArrowUpRight size={16} color="var(--accent-blue)" />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Analyze incoming instructions, examine underlying delay notices, enforce DO NOT SAY legal guardrails, and generate contractual replies.
            </p>
          </div>

          <div 
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="glass-panel"
            onClick={() => {
              onSetChatPrompt("What are our contractual rights and notice obligations regarding unforeseen physical conditions and engineer instructions?");
              onNavigate('chat');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-warning)', fontWeight: 700, fontSize: '0.92rem' }}>
                <Zap size={18} />
                <span>Multi-Clause Contract AI Query</span>
              </div>
              <ArrowUpRight size={16} color="var(--status-warning)" />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Query rights, obligations, and notice time-bars under Contractor Defence, PMC perspective, or dispute arbitration preparation modes.
            </p>
          </div>

          <div 
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="glass-panel"
            onClick={() => onNavigate('conflicts')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-indigo)', fontWeight: 700, fontSize: '0.92rem' }}>
                <Scale size={18} />
                <span>Contractual Precedence Detector</span>
              </div>
              <ArrowUpRight size={16} color="var(--accent-indigo)" />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Automatically detect ambiguities or conflicts across contract tiers (Agreement, Particular Conditions, General Conditions, Specs, BOQ).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
