import React, { useState } from 'react';
import { ClaimRecord, Project } from '../../types/contract';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Search, 
  ArrowUpRight, 
  FileCheck 
} from 'lucide-react';

interface ClaimsAndVariationsViewProps {
  project: Project;
  claims: ClaimRecord[];
}

export const ClaimsAndVariationsView: React.FC<ClaimsAndVariationsViewProps> = ({
  project,
  claims
}) => {
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord>(claims[0] || null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = claims.filter(c => 
    c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-warning">Commercial & Delay Claims</span>
              <span className="badge badge-neutral">FIDIC Sub-Clause 20.2</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
              Extension of Time (EOT) & Variation Claims Register
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Substantiation management, cause-and-effect critical path delay modeling, and contemporary evidence compliance.
            </p>
          </div>

          <button className="btn-primary" onClick={() => alert('New Claim Dossier Builder initialized.')}>
            <Plus size={16} />
            <span>Assemble New Claim Dossier</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card warning">
          <div className="kpi-label">
            <span>Pending Claims Value</span>
            <DollarSign size={16} color="var(--status-warning)" />
          </div>
          <div className="kpi-value">{project.stats.pendingClaimsValue}</div>
          <div className="kpi-sub">Across 3 active formal claim packages</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>EOT Days Claimed</span>
            <Clock size={16} color="var(--accent-blue)" />
          </div>
          <div className="kpi-value">{project.stats.eotClaimedDays} Days</div>
          <div className="kpi-sub">
            Formally Approved: <strong style={{ color: 'var(--status-success)' }}>{project.currentEOTDays} Days</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total Variations Logged</span>
            <FileCheck size={16} color="var(--accent-indigo)" />
          </div>
          <div className="kpi-value">{project.stats.totalVariationsCount}</div>
          <div className="kpi-sub">Sub-Clause 13.3 Variation Orders</div>
        </div>
      </div>

      {/* Split: Claims Table and Selected Claim Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {/* Claims List */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Claims Dossiers ({filtered.length})
            </div>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search claim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', height: '32px', fontSize: '0.78rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(claim => {
              const isSelected = selectedClaim?.id === claim.id;
              let badgeClass = 'badge-neutral';
              if (claim.status === 'Approved') badgeClass = 'badge-success';
              else if (claim.status === 'Detailed Claim Submitted') badgeClass = 'badge-warning';
              else if (claim.status === 'Initial Notice') badgeClass = 'badge-notice';

              return (
                <div
                  key={claim.id}
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
                  onClick={() => setSelectedClaim(claim)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                        {claim.claimNumber}
                      </span>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {claim.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {claim.claimedAmount}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {claim.title}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>EOT: <strong>+{claim.eotDaysClaimed} Days</strong></span>
                    <span>Notice Date: {claim.noticeServedDate}</span>
                    <span>Type: {claim.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Claim Detail */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {selectedClaim ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-notice">{selectedClaim.type}</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px' }}>
                    {selectedClaim.title}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Ref: {selectedClaim.claimNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Claimed Quantum</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--status-warning)' }}>
                    {selectedClaim.claimedAmount}
                  </div>
                </div>
              </div>

              {/* Clause Basis */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Governing Contractual Clause Grounds
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedClaim.clauseBasis.map((cl, i) => (
                    <span key={i} className="citation-pill">{cl}</span>
                  ))}
                </div>
              </div>

              {/* Schedule and Determination Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>EOT Days Claimed</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '2px' }}>
                    +{selectedClaim.eotDaysClaimed} Calendar Days
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>EOT Days Approved by Engineer</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedClaim.eotDaysApproved > 0 ? 'var(--status-success)' : 'var(--text-muted)', marginTop: '2px' }}>
                    +{selectedClaim.eotDaysApproved} Days
                  </div>
                </div>
              </div>

              {/* Contemporary Records Checklist */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Contemporary Substantiating Records (FIDIC Sub-Clause 20.2 Mandatory Records)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedClaim.contemporaryRecords.map((rec, i) => (
                    <div 
                      key={i}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--status-success)" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => alert('Exporting full claim brief...')}>
                  <ArrowUpRight size={16} />
                  <span>Generate Full Claim Brief & Time Impact Model</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Select a claim dossier to view contractual grounds and contemporary records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
