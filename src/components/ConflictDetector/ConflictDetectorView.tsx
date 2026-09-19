import React, { useState } from 'react';
import { PrecedenceConflict, Project } from '../../types/contract';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { resolvePrecedence } from '../../utils/precedenceEngine';

interface ConflictDetectorViewProps {
  project: Project;
  conflicts: PrecedenceConflict[];
}

export const ConflictDetectorView: React.FC<ConflictDetectorViewProps> = ({
  project,
  conflicts
}) => {
  const [selectedConflict, setSelectedConflict] = useState<PrecedenceConflict>(conflicts[0] || null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-notice">Priority 2 Engine</span>
              <span className="badge badge-neutral">Precedence Conflict Resolution</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
              Contractual Conflict & Ambiguity Detector
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Automatic conflict identification between Particular Conditions, General Conditions, Specifications, Drawings, and BOQ.
            </p>
          </div>
        </div>
      </div>

      {/* Split: Conflicts List & Detailed Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Conflicts List */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Detected Cross-Document Conflicts ({conflicts.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conflicts.map(conf => {
              const isSelected = selectedConflict?.id === conf.id;
              return (
                <div
                  key={conf.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setSelectedConflict(conf)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      Precedence Dispute
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      Clause 1.5 Governing
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {conf.title}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {conf.clauseA.document} vs {conf.clauseB.document}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Conflict Precedence Analysis */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {selectedConflict ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className="badge badge-critical">Active Discrepancy</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '6px' }}>
                  {selectedConflict.title}
                </h2>
              </div>

              {/* Side-by-Side Clause Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                      PROVISION A
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      Rank #{selectedConflict.clauseA.rank}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedConflict.clauseA.document} &bull; {selectedConflict.clauseA.clause}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    &ldquo;{selectedConflict.clauseA.text}&rdquo;
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-warning)' }}>
                      PROVISION B
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      Rank #{selectedConflict.clauseB.rank}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedConflict.clauseB.document} &bull; {selectedConflict.clauseB.clause}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    &ldquo;{selectedConflict.clauseB.text}&rdquo;
                  </div>
                </div>
              </div>

              {/* Winning Provision & Rule */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--status-success-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <ShieldCheck size={24} color="var(--status-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase' }}>
                    Contractual Winner under Order of Precedence
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedConflict.winningClause}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {selectedConflict.governingPrecedenceRule}
                  </div>
                </div>
              </div>

              {/* Practical Impact & Strategy */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Practical Contractual Impact
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  {selectedConflict.practicalImpact}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Recommended Contractual Position & Action
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue)' }}>
                  {selectedConflict.recommendedContractualPosition}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Select a conflict item to evaluate order of precedence priority.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
