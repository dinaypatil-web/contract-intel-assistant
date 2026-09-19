import React, { useState } from 'react';
import { Project, ContractClause, ContractDocument } from '../../types/contract';
import { 
  Layers, 
  BookOpen, 
  Share2, 
  Search, 
  ArrowUpRight, 
  Clock, 
  ShieldAlert, 
  FileText 
} from 'lucide-react';

interface HierarchyExplorerProps {
  project: Project;
  onSelectClauseForChat?: (clause: ContractClause) => void;
}

export const HierarchyExplorer: React.FC<HierarchyExplorerProps> = ({
  project,
  onSelectClauseForChat
}) => {
  const [selectedDoc, setSelectedDoc] = useState<ContractDocument>(project.documents[0] || null);
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(
    project.documents[0]?.clauses[0] || null
  );
  const [clauseSearch, setClauseSearch] = useState<string>('');

  const filteredClauses = selectedDoc?.clauses.filter(c => 
    c.clauseNumber.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.title.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.content.toLowerCase().includes(clauseSearch.toLowerCase())
  ) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner: Order of Precedence Hierarchy Engine */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div className="panel-header" style={{ marginBottom: '12px' }}>
          <div className="panel-title">
            <Layers size={20} color="var(--accent-blue)" />
            <span>Project Order of Precedence (Sub-Clause 1.5 Governing Hierarchy)</span>
          </div>
          <span className="badge badge-notice">Priority 2 Engine</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          In accordance with the executed Contract Agreement, in the event of any ambiguity, discrepancy or conflict, the documents forming the Contract shall take precedence in the following strict order:
        </p>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {project.orderOfPrecedence.map(rule => (
            <div 
              key={rule.rank}
              style={{
                minWidth: '150px',
                padding: '10px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  RANK #{rule.rank}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {rule.documentType}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {rule.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 3-Column Split: Volumes List -> Clauses List -> Clause Detail & Knowledge Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 320px 1fr', gap: '20px', minHeight: '620px' }}>
        {/* Column 1: Multi-Volume Documents */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 6px' }}>
            Contract Volumes ({project.documents.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {project.documents.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSelectedClause(doc.clauses[0] || null);
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {doc.volumeNumber}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {doc.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{doc.revision}</span>
                    <span>{doc.pageCount} pages</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Clauses in Selected Volume */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Clauses ({filteredClauses.length})
            </div>
            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
              {selectedDoc?.volumeNumber}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Filter clause # or title..."
              value={clauseSearch}
              onChange={(e) => setClauseSearch(e.target.value)}
              style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {filteredClauses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No clauses found in this volume or filter.
              </div>
            ) : (
              filteredClauses.map(clause => {
                const isSelected = selectedClause?.id === clause.id;
                return (
                  <div
                    key={clause.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => setSelectedClause(clause)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                        {clause.clauseNumber}
                      </span>
                      {clause.timeBarDays && (
                        <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {clause.timeBarDays}d Bar
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {clause.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Page {clause.pageNumber} &bull; {clause.category}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Clause Detail & Interconnected Knowledge Graph */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {selectedClause ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-notice">{selectedClause.volumeNumber}</span>
                    <span className="badge badge-neutral">Page {selectedClause.pageNumber}</span>
                    <span className="badge badge-success">{selectedClause.category}</span>
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '8px' }}>
                    {selectedClause.clauseNumber}: {selectedClause.title}
                  </h2>
                </div>

                {onSelectClauseForChat && (
                  <button 
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '7px 12px' }}
                    onClick={() => onSelectClauseForChat(selectedClause)}
                  >
                    <span>Analyze in AI Chat</span>
                    <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              {/* Clause Time Bar & Notice Guardrail */}
              {selectedClause.timeBarDays && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-critical-bg)',
                  border: '1px solid var(--status-critical-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <ShieldAlert size={22} color="var(--status-critical)" />
                  <div style={{ fontSize: '0.82rem' }}>
                    <strong style={{ color: 'var(--status-critical)' }}>MANDATORY TIME-BAR: </strong>
                    Under this clause, a formal notice must be submitted within <strong>{selectedClause.timeBarDays} days</strong>. Failure to give notice within {selectedClause.timeBarDays} days completely discharges the Employer from all liability and bars the claim.
                  </div>
                </div>
              )}

              {/* Full Clause Text */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                maxHeight: '320px',
                overflowY: 'auto'
              }}>
                {selectedClause.content}
              </div>

              {/* Interconnected Knowledge Graph */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Share2 size={16} color="var(--accent-blue)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    Contract Knowledge Graph: Interconnected Clauses
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  A construction claim or delay event never exists in isolation. The AI maps interconnected clauses that must be concurrently invoked:
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedClause.interconnectedClauseIds.map(icId => {
                    const linkedClause = selectedDoc.clauses.find(c => c.id === icId);
                    if (!linkedClause) return null;
                    return (
                      <div 
                        key={icId}
                        style={{
                          padding: '10px 14px',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onClick={() => setSelectedClause(linkedClause)}
                      >
                        <BookOpen size={14} color="var(--accent-blue)" />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {linkedClause.clauseNumber}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {linkedClause.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div>Select a clause from the list to view full contractual provisions and interconnected clause graph.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
