import React, { useState } from 'react';
import { Project } from '../../types/contract';
import { 
  GitCompare, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';

interface DocumentComparisonViewProps {
  project: Project;
}

export const DocumentComparisonView: React.FC<DocumentComparisonViewProps> = ({
  project
}) => {
  const [selectedComparison, setSelectedComparison] = useState<number>(0);

  const comparisons = [
    {
      title: 'Tender General Conditions Clause 20.1 vs Particular Conditions Clause 20.2 (Notice Time-Bar Amendment)',
      docA: 'FIDIC Red 2017 GC 20.1 (Tender)',
      docB: 'Particular Conditions PC 20.2 (Executed Amendment)',
      clauseRef: 'Clause 20.1 / 20.2',
      addedText: 'IF THE CONTRACTOR FAILS TO GIVE A NOTICE OF CLAIM WITHIN SUCH PERIOD OF 28 DAYS, THE TIME FOR COMPLETION SHALL NOT BE EXTENDED, THE CONTRACTOR SHALL NOT BE ENTITLED TO ADDITIONAL PAYMENT, AND THE EMPLOYER SHALL BE DISCHARGED FROM ALL LIABILITY IN CONNECTION WITH THE CLAIM.',
      deletedText: 'The Engineer may take into account whether the Employer has suffered prejudice by late notice when determining extension of time.',
      contractualSignificance: 'CRITICAL COMMERCIAL RISK: The Particular Condition deletes the Engineer\'s equitable discretion to forgive late notices where the Employer suffered no prejudice. Missing the 28-day deadline operates as an absolute forfeiture of all time and cost entitlement.'
    },
    {
      title: 'Baseline Programme Rev. 03 vs Impacted Programme Rev. 04 (Inclusion of 132kV Powerline Delay)',
      docA: 'Approved Baseline Rev. 03 (March 2025)',
      docB: 'Impacted Working Programme Rev. 04 (August 2026)',
      clauseRef: 'Sub-Clause 8.3 & 8.4',
      addedText: 'Activity ID VL-P112-E: "132kV Transmission Line De-energization Window (83 Calendar Days Duration)" inserted as critical predecessor to Pier Cap Staging.',
      deletedText: 'Direct finish-to-start relationship between Pier Shaft P112 and Superstructure Erection without utility handover predecessor.',
      contractualSignificance: 'Substantiates that the 48-day variance between Pier P102 and P140 was solely driven by the insertion of the utility delay activity on the longest path, proving absence of contractor culpability.'
    },
    {
      title: 'PMC Site Instruction SI-28 vs PMC Letter LTR-1482 (Acceleration Cost Contradiction)',
      docA: 'PMC Site Instruction SI-28 (15 July 2026)',
      docB: 'PMC Letter LTR-1482 (12 August 2026)',
      clauseRef: 'Clause 8.6 vs Clause 13.3',
      addedText: 'PMC Letter 1482: "All expediting measures shall be executed entirely at Contractor\'s own risk and cost as mandated by Clause 8.6."',
      deletedText: 'PMC SI-28: "Contractor is requested to submit cost quotation for 2 supplementary cranes to facilitate joint acceleration review."',
      contractualSignificance: 'PMC has reversed its stance from requesting an acceleration proposal under Variation Clause 13.3 to arbitrarily ordering uncompensated acceleration under Clause 8.6. This reversal creates a prime contemporaneous estoppel defense for the Contractor.'
    }
  ];

  const activeComp = comparisons[selectedComparison];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-notice">Redline Diff & Audit</span>
              <span className="badge badge-neutral">Contractual Modification Analysis</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
              Document & Clause Revision Comparison
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Side-by-side textual diff highlighting additions, deletions, and their contractual & commercial significance.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Selector */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {comparisons.map((c, i) => (
          <button
            key={i}
            className={`nav-action-btn ${selectedComparison === i ? 'active' : ''}`}
            style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'left', flex: 1, minWidth: '240px' }}
            onClick={() => setSelectedComparison(i)}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{c.clauseRef}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.title}
            </div>
          </button>
        ))}
      </div>

      {/* Diff Box */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
          {activeComp.title}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Base Document */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Original Baseline: {activeComp.docA}
            </div>
            <div style={{
              marginTop: '10px',
              padding: '12px',
              background: 'rgba(244, 63, 94, 0.08)',
              borderLeft: '4px solid var(--status-critical)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--status-critical)',
              lineHeight: 1.6
            }}>
              <strong>DELETED / SUPERSEDED:</strong><br />
              - {activeComp.deletedText}
            </div>
          </div>

          {/* Revised Document */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Revised Amendment: {activeComp.docB}
            </div>
            <div style={{
              marginTop: '10px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.08)',
              borderLeft: '4px solid var(--status-success)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--status-success)',
              lineHeight: 1.6
            }}>
              <strong>ADDED / AMENDED:</strong><br />
              + {activeComp.addedText}
            </div>
          </div>
        </div>

        {/* Contractual Significance Box */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertTriangle size={22} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              Contractual & Legal Significance
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.6 }}>
              {activeComp.contractualSignificance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
