import React, { useState } from 'react';
import { TimelineEvent, Project } from '../../types/contract';
import { 
  GitCommit, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';

interface IssueTimelineViewProps {
  project: Project;
  timeline: TimelineEvent[];
}

export const IssueTimelineView: React.FC<IssueTimelineViewProps> = ({
  timeline
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = timeline.filter(evt => {
    const matchesType = filterType === 'all' || evt.eventType.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.documentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.clauseRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.impact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-notice">Dispute & Claim Chronology</span>
              <span className="badge badge-neutral">Cause-and-Effect Chain</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
              Contractual Issue Event Timeline
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Chronological factual chain of project events: Date &rarr; Event &rarr; Document Ref &rarr; Contract Clause &rarr; Critical Impact &rarr; Action Taken.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Event Type:</span>
          {['all', 'Delay Event', 'Notice Issued', 'Letter Received', 'Site Instruction', 'Inspection'].map(t => (
            <button
              key={t}
              className={`nav-action-btn ${filterType === t ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setFilterType(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Search timeline events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Timeline Flow */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          {/* Vertical line connector */}
          <div style={{
            position: 'absolute',
            left: '23px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            background: 'var(--border-medium)',
            zIndex: 1
          }} />

          {filtered.map(item => {
            let statusColor = 'var(--accent-blue)';
            if (item.eventType === 'Delay Event') statusColor = 'var(--status-critical)';
            else if (item.eventType === 'Notice Issued') statusColor = 'var(--status-warning)';
            else if (item.eventType === 'Letter Received') statusColor = 'var(--status-notice)';

            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {/* Node Icon */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: `2px solid ${statusColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statusColor,
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <GitCommit size={22} />
                </div>

                {/* Event Card */}
                <div style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
                className="glass-panel"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {item.date}
                      </span>
                      <span className="badge badge-neutral">{item.eventType}</span>
                      <span className="citation-pill">{item.clauseRef}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Evidence:</span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {item.evidenceStatus}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '4px' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Document Reference
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-blue)', marginTop: '2px' }}>
                        {item.documentRef}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Schedule & Cost Impact
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.impact}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>Action Taken: </strong>
                    {item.actionTaken}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
