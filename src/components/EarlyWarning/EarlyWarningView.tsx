import React, { useState } from 'react';
import { NoticeAlert, Project } from '../../types/contract';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  ShieldAlert 
} from 'lucide-react';

interface EarlyWarningViewProps {
  project: Project;
  alerts: NoticeAlert[];
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = ({
  alerts
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<NoticeAlert | null>(alerts[0] || null);

  const filtered = alerts.filter(a => {
    const matchesSeverity = filterSeverity === 'all' || a.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.clauseRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-critical">Time-Bar Watchdog</span>
              <span className="badge badge-neutral">Clause 20.2 Strict Compliance</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
              Contract Early Warning Engine & Notice Tracker
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Continuous monitoring of project events, site instructions, and correspondence against mandatory contractual notice periods and time-bars.
            </p>
          </div>

          <button className="btn-primary" onClick={() => alert('Notice drafting wizard initialized.')}>
            <Plus size={16} />
            <span>Draft Contractual Notice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Severity:</span>
          {['all', 'Critical', 'Warning', 'Notice Required', 'Info'].map(s => (
            <button
              key={s}
              className={`nav-action-btn ${filterSeverity === s ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setFilterSeverity(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Search notice events or clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Split: Alerts Table & Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {/* Alerts List */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Upcoming Contractual Actions & Deadlines ({filtered.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '580px' }}>
            {filtered.map(alert => {
              const isSelected = selectedAlert?.id === alert.id;
              let badgeClass = 'badge-neutral';
              if (alert.severity === 'Critical') badgeClass = 'badge-critical';
              else if (alert.severity === 'Warning') badgeClass = 'badge-warning';
              else if (alert.severity === 'Notice Required') badgeClass = 'badge-notice';

              return (
                <div
                  key={alert.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${badgeClass}`}>{alert.severity}</span>
                      <span className="citation-pill">{alert.clauseRef}</span>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: alert.daysRemaining <= 4 ? 'var(--status-critical)' : 'var(--status-warning)'
                    }}>
                      {alert.daysRemaining === 0 ? 'DUE TODAY' : `${alert.daysRemaining} days remaining`}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {alert.title}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Trigger Date: {alert.eventDate}</span>
                    <span>Deadline: <strong>{alert.deadlineDate}</strong></span>
                    <span>Status: {alert.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Detail */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {selectedAlert ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-critical">{selectedAlert.severity} Severity</span>
                    <span className="badge badge-neutral">{selectedAlert.eventType}</span>
                  </div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px' }}>
                    {selectedAlert.title}
                  </h2>
                </div>
              </div>

              {/* Time-Bar Danger Box */}
              <div style={{
                background: 'var(--status-critical-bg)',
                border: '1px solid var(--status-critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <ShieldAlert size={28} color="var(--status-critical)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--status-critical)' }}>
                    MANDATORY TIME-BAR: {selectedAlert.timeBarDays} CALENDAR DAYS
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Clause {selectedAlert.clauseRef} specifies that missing this deadline completely forfeits the Contractor&apos;s right to claim additional cost or Extension of Time.
                  </div>
                </div>
              </div>

              {/* Action and Timing Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Responsible Lead</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{selectedAlert.responsibleParty}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Workflow Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px', color: 'var(--accent-blue)' }}>{selectedAlert.status}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Recommended Contractual Action
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  {selectedAlert.recommendedAction}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Required Contemporary Evidence
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedAlert.evidenceRequired.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} color="var(--status-success)" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => alert('Notice generation module opened.')}>
                  <FileText size={16} />
                  <span>Draft Formal Notice Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Select a notice alert from the list to view time-bars and contemporary evidence checklist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
