import React, { useState } from 'react';
import { Project, IncomingLetterReview, NoticeAlert, ClaimRecord } from '../../types/contract';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle, 
  Building2, 
  Scale, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

interface ReportsViewProps {
  project: Project;
  letters: IncomingLetterReview[];
  alerts: NoticeAlert[];
  claims: ClaimRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  project,
  letters,
  alerts,
  claims
}) => {
  const [selectedReportType, setSelectedReportType] = useState<string>('letter-review');

  const reportTypes = [
    { id: 'letter-review', title: 'Incoming Letter & Response Brief (LTR-1482)' },
    { id: 'risk-register', title: 'Contractual Risk & Time-Bar Register' },
    { id: 'claims-status', title: 'EOT & Variations Commercial Position Brief' },
    { id: 'hierarchy-report', title: 'Contract Order of Precedence & Volume Audit' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-notice">Executive Briefs</span>
              <span className="badge badge-neutral">Senior Management & Board Reports</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
              Contract Intelligence & Claims Reports
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Exportable executive briefs grounded in signed contract clauses, contemporary records, and commercial defense strategies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => window.print()}>
              <Printer size={16} />
              <span>Print / PDF</span>
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                alert('Exporting executive package in DOCX/Excel format.');
              }}
            >
              <Download size={16} />
              <span>Export Word / Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Selector */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {reportTypes.map(r => (
          <button
            key={r.id}
            className={`nav-action-btn ${selectedReportType === r.id ? 'active' : ''}`}
            onClick={() => setSelectedReportType(r.id)}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* Printable Report Document Sheet */}
      <div className="letter-document-view" style={{ background: '#ffffff', color: '#0f172a', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
        {/* Document Letterhead */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              CONTRACT INTELLIGENCE & COMMERCIAL EXECUTIVE BRIEF
            </div>
            <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px' }}>
              PROJECT: {project.code} &bull; {project.name}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div>Ref: CIB/{project.code}/2026-Q3</div>
            <div style={{ fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>CONFIDENTIAL &bull; FOR INTERNAL USE ONLY</div>
          </div>
        </div>

        {/* Selected Report Content */}
        {selectedReportType === 'letter-review' && letters[0] && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              1. EXECUTIVE SUMMARY: PMC ACCELERATION DIRECTIVE (LETTER LTR-1482)
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', marginBottom: '16px' }}>
              On 12 August 2026, the PMC (Egis-Systra-Ayesa Consortium) issued Letter Ref. <strong>{letters[0].refNumber}</strong> alleging a 48-calendar-day delay in Pier Cap erections between Pier P102 and P140. The PMC has directed continuous 24/7 working hours and mobilization of 2 additional 150 MT cranes at the Contractor&apos;s sole expense under Sub-Clause 8.6, threatening delay damages from 15 November 2026.
            </p>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '20px', marginBottom: '10px' }}>
              2. CONTRACTUAL CROSS-CHECK & EVALUATION
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>PMC Statement</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Governing Clause</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Legal Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Strategic Stance</th>
                </tr>
              </thead>
              <tbody>
                {letters[0].crossCheck.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{c.statement}</td>
                    <td style={{ padding: '10px', color: '#0284c7' }}>{c.clausesCited.map(cc => cc.clauseNumber).join(', ')}</td>
                    <td style={{ padding: '10px', color: c.status === 'Contractually Supported' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                      {c.status}
                    </td>
                    <td style={{ padding: '10px', color: '#475569' }}>{c.analysis.slice(0, 110)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '20px', marginBottom: '8px' }}>
              3. RECOMMENDED COMMERCIAL DEFENSE STRATEGY
            </h4>
            <ol style={{ paddingLeft: '24px', fontSize: '0.88rem', lineHeight: 1.7, color: '#334155' }}>
              <li><strong>Reject Clause 8.6 Applicability:</strong> Formally rebut the PMC&apos;s unilateral invocation of Clause 8.6, highlighting the express proviso that Clause 8.6 excludes delays arising from Clause 8.4 causes.</li>
              <li><strong>Establish Constructive Acceleration:</strong> Directing accelerated progress while refusing to determine pending Extension of Time Claim No. 03 constitutes compensable constructive acceleration under Sub-Clause 13.3.</li>
              <li><strong>Submit Dual Schedule:</strong> Provide (A) Impacted Critical Path EOT Schedule (+54 days), and (B) Acceleration Feasibility Schedule conditional on Variation Order of $1,840,000.</li>
              <li><strong>Delay Damages Defense:</strong> Delay damages cannot be lawfully levied while the Engineer remains in default of its duty to determine legitimate EOT claims under Sub-Clause 3.7.</li>
            </ol>
          </div>
        )}

        {selectedReportType === 'risk-register' && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              CONTRACTUAL RISK & TIME-BAR WATCHDOG REGISTER
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Event / Notice Title</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Clause Ref</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Time-Bar</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Deadline</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Days Left</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{a.title}</td>
                    <td style={{ padding: '10px', color: '#0284c7' }}>{a.clauseRef}</td>
                    <td style={{ padding: '10px' }}>{a.timeBarDays} Days</td>
                    <td style={{ padding: '10px' }}>{a.deadlineDate}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: a.daysRemaining <= 4 ? '#dc2626' : '#d97706' }}>
                      {a.daysRemaining}d
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: a.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                        color: a.severity === 'Critical' ? '#dc2626' : '#d97706'
                      }}>
                        {a.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === 'claims-status' && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              EXTENSION OF TIME (EOT) & QUANTUM CLAIMS DOSSIER
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Claim Ref & Title</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Clause Basis</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>EOT Claimed</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Claimed Amount</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 700 }}>{c.claimNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.title}</div>
                    </td>
                    <td style={{ padding: '10px', color: '#0284c7' }}>{c.clauseBasis.join(', ')}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>+{c.eotDaysClaimed} Days</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#d97706' }}>{c.claimedAmount}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: c.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                        color: c.status === 'Approved' ? '#16a34a' : '#d97706'
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === 'hierarchy-report' && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              GOVERNING CONTRACT ORDER OF PRECEDENCE (SUB-CLAUSE 1.5)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Precedence Rank</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Document Component</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Contractual Purpose</th>
                </tr>
              </thead>
              <tbody>
                {project.orderOfPrecedence.map(r => (
                  <tr key={r.rank} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>RANK #{r.rank}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{r.documentType}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures Footer */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
          <div>
            <div>Prepared By: Lead Contracts & Commercial Engineer</div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #94a3b8', width: '200px' }}>Signature & Date</div>
          </div>
          <div>
            <div>Reviewed By: Project Director & Commercial Head</div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #94a3b8', width: '200px' }}>Signature & Date</div>
          </div>
        </div>
      </div>
    </div>
  );
};
