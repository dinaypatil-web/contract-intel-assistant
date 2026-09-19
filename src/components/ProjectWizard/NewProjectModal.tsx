import React, { useState } from 'react';
import { Project, PrecedenceRule, DocumentType } from '../../types/contract';
import { 
  Building2, 
  FolderPlus, 
  HardDrive, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Upload, 
  X, 
  FileText, 
  Layers, 
  Zap, 
  Lock 
} from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [projectName, setProjectName] = useState<string>('Expressway Expansion & Cable-Stayed Bridge');
  const [projectCode, setProjectCode] = useState<string>('EXP-CSB-01');
  const [contractType, setContractType] = useState<string>('FIDIC Red Book 2017 with Particular Conditions');
  const [client, setClient] = useState<string>('National Highways Authority');
  const [pmc, setPmc] = useState<string>('Atkins-Systra Joint Venture');
  const [contractor, setContractor] = useState<string>('Apex Infrastructure JV');
  const [value, setValue] = useState<string>('$420,000,000');
  const [currency, setCurrency] = useState<string>('USD');
  const [commencementDate, setCommencementDate] = useState<string>('2026-10-01');
  const [completionDate, setCompletionDate] = useState<string>('2029-09-30');
  const [userRole, setUserRole] = useState<string>('Contract Manager');

  // Local storage simulation / files
  const [selectedFolder, setSelectedFolder] = useState<string>('D:\\Project_Contracts\\Expressway_CSB_Docs');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string }[]>([
    { name: 'Vol_01_Contract_Agreement_&_Particular_Conditions.pdf', size: '14.2 MB', type: 'Particular Conditions' },
    { name: 'Vol_02_FIDIC_Red_Book_General_Conditions_2017.pdf', size: '28.6 MB', type: 'General Conditions' },
    { name: 'Vol_03_Employer_Requirements_Scope_of_Works.pdf', size: '115.4 MB', type: 'Employer Requirements' },
    { name: 'Vol_04_Technical_Specifications_Bridges_&_Civil.pdf', size: '340.8 MB', type: 'Technical Specifications' },
    { name: 'Vol_05_Bill_of_Quantities_Priced_Schedule.pdf', size: '48.1 MB', type: 'BOQ' },
    { name: 'Vol_06_Tender_Drawings_GAD_&_Structural.pdf', size: '420.5 MB', type: 'Drawings' },
    { name: 'Vol_07_Tender_Addenda_01_to_04.pdf', size: '18.9 MB', type: 'Addenda / Corrigenda' }
  ]);

  // Ingestion benchmark calculation states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentProcessPhase, setCurrentProcessPhase] = useState<string>('');

  if (!isOpen) return null;

  const handleStartIngestion = () => {
    setIsProcessing(true);
    setProgress(5);
    setCurrentProcessPhase('Step 1/4: Scanning local directory and verifying SHA-256 hashes (Local Storage Only)...');

    setTimeout(() => {
      setProgress(28);
      setCurrentProcessPhase('Step 2/4: Extracting text & OCR for scanned addenda and stamps (Multi-core CPU)...');
    }, 1200);

    setTimeout(() => {
      setProgress(65);
      setCurrentProcessPhase('Step 3/4: Parsing Clause Hierarchy & constructing interconnected Knowledge Graph...');
    }, 2400);

    setTimeout(() => {
      setProgress(90);
      setCurrentProcessPhase('Step 4/4: Generating local vector embeddings in client SQLite/IndexedDB (Zero Cloud Leakage)...');
    }, 3600);

    setTimeout(() => {
      setProgress(100);
      setCurrentProcessPhase('Complete! Project knowledge base initialized.');
      setTimeout(() => {
        // Create project object
        const defaultPrecedence: PrecedenceRule[] = [
          { rank: 1, documentType: 'Contract Agreement', description: 'Executed Articles of Agreement' },
          { rank: 2, documentType: 'Letter of Acceptance', description: 'Formal Letter of Acceptance' },
          { rank: 3, documentType: 'Addenda / Corrigenda', description: 'Tender Addenda No. 01 to 04' },
          { rank: 4, documentType: 'Particular Conditions', description: 'Conditions of Particular Application (PC)' },
          { rank: 5, documentType: 'General Conditions', description: 'FIDIC Red Book 2017 General Conditions' },
          { rank: 6, documentType: 'Employer Requirements', description: 'Design specifications & Scope' },
          { rank: 7, documentType: 'Technical Specifications', description: 'Bridge & Roadway engineering standards' },
          { rank: 8, documentType: 'Drawings', description: 'Tender General Arrangement drawings' },
          { rank: 9, documentType: 'BOQ', description: 'Priced Bill of Quantities' },
          { rank: 10, documentType: 'Schedules / Appendices', description: 'Appendices and guarantees' }
        ];

        const newProj: Project = {
          id: `proj-${Date.now()}`,
          name: projectName,
          code: projectCode,
          contractType,
          client,
          pmc,
          contractor,
          value,
          currency,
          commencementDate,
          originalCompletionDate: completionDate,
          revisedCompletionDate: completionDate,
          currentEOTDays: 0,
          stats: {
            completionPercentage: 0,
            pendingClaimsValue: '$0',
            eotClaimedDays: 0,
            openNoticesCount: 0,
            criticalDeadlinesCount: 0,
            totalVariationsCount: 0
          },
          orderOfPrecedence: defaultPrecedence,
          documents: [
            {
              id: `doc-vol1-${Date.now()}`,
              projectId: `proj-${Date.now()}`,
              volumeNumber: 'Volume 1',
              title: 'Contract Agreement & Particular Conditions',
              documentType: 'Particular Conditions',
              revision: 'Rev. 01 Executed',
              date: commencementDate,
              pageCount: 168,
              summary: 'Executed contract agreement and particular conditions with 28-day notice bars.',
              clauses: [
                {
                  id: 'pc-20.2-new',
                  documentId: `doc-vol1-${Date.now()}`,
                  volumeNumber: 'Volume 1',
                  pageNumber: 154,
                  clauseNumber: 'PC 20.2',
                  title: 'Claims For Payment and/or EOT',
                  content: 'If the Contractor considers that he is entitled to any Extension of Time and/or any additional payment under any Clause of these Conditions or otherwise in connection with the Contract, the Contractor shall give a Notice to the Engineer, describing the event or circumstance giving rise to the claim not later than 28 days after the Contractor became aware of the event. FAILURE TO NOTIFY DISCHARGES THE EMPLOYER.',
                  category: 'Payment & Claims',
                  interconnectedClauseIds: ['pc-8.4-new'],
                  timeBarDays: 28,
                  priorityRank: 4
                },
                {
                  id: 'pc-8.4-new',
                  documentId: `doc-vol1-${Date.now()}`,
                  volumeNumber: 'Volume 1',
                  pageNumber: 82,
                  clauseNumber: 'PC 8.4',
                  title: 'Extension of Time for Completion',
                  content: 'The Contractor shall be entitled subject to Sub-Clause 20.2 to an Extension of Time for Completion if completion is delayed by a Variation, exceptionally adverse climatic conditions, or Employer impediments.',
                  category: 'Time & EOT',
                  interconnectedClauseIds: ['pc-20.2-new'],
                  timeBarDays: 28,
                  priorityRank: 4
                }
              ]
            },
            {
              id: `doc-vol2-${Date.now()}`,
              projectId: `proj-${Date.now()}`,
              volumeNumber: 'Volume 2',
              title: 'General Conditions of Contract (FIDIC Red 2017)',
              documentType: 'General Conditions',
              revision: 'First Edition 2017',
              date: '2017-12-01',
              pageCount: 298,
              summary: 'FIDIC Red Book standard General Conditions.',
              clauses: []
            },
            {
              id: `doc-vol4-${Date.now()}`,
              projectId: `proj-${Date.now()}`,
              volumeNumber: 'Volume 4',
              title: 'Technical Specifications (Bridge & Highway)',
              documentType: 'Technical Specifications',
              revision: 'Rev. 00 Final',
              date: '2026-05-10',
              pageCount: 610,
              summary: 'Piling, pre-stressing, structural steel, and bitumen pavement specs.',
              clauses: []
            }
          ]
        };

        onCreateProject(newProj);
        setIsProcessing(false);
        onClose();
      }, 800);
    }, 4500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FolderPlus size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Onboard New Project & Initialize Local Contract Repository
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                100% On-Premise &bull; Local Storage Only &bull; Zero Cloud Upload &bull; Strict Project Isolation
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard Steps Tab Bar */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <button 
            className={`nav-action-btn ${step === 1 ? 'active' : ''}`}
            onClick={() => setStep(1)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            1. Project & User Profile
          </button>
          <button 
            className={`nav-action-btn ${step === 2 ? 'active' : ''}`}
            onClick={() => setStep(2)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            2. Local Storage Document Picker (~1GB)
          </button>
          <button 
            className={`nav-action-btn ${step === 3 ? 'active' : ''}`}
            onClick={() => setStep(3)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            3. Processing Speed & Benchmark Specs
          </button>
        </div>

        {/* STEP 1: PROJECT METADATA */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={projectCode} 
                  onChange={(e) => setProjectCode(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contract Framework</label>
                <select 
                  className="form-select" 
                  value={contractType} 
                  onChange={(e) => setContractType(e.target.value)}
                >
                  <option>FIDIC Red Book 2017 with Particular Conditions</option>
                  <option>FIDIC Yellow Book 2017 (Plant & Design-Build)</option>
                  <option>FIDIC Silver Book 2017 (EPC / Turnkey)</option>
                  <option>NEC4 Engineering and Construction Contract (ECC)</option>
                  <option>JCT Major Project Construction Contract</option>
                  <option>Bespoke Construction Contract Agreement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contract Value</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employer / Client</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={client} 
                  onChange={(e) => setClient(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">The Engineer / PMC</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={pmc} 
                  onChange={(e) => setPmc(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contractor Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={contractor} 
                  onChange={(e) => setContractor(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your User Role (Access Control)</label>
                <select 
                  className="form-select"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option>Project Director</option>
                  <option>Contract Manager</option>
                  <option>Commercial Manager / Lead QS</option>
                  <option>Planning / Schedule Engineer</option>
                  <option>Site Contracts Engineer</option>
                  <option>Auditor / Read-Only Viewer</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn-primary" onClick={() => setStep(2)}>
                <span>Next: Select Local Contract Documents &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCAL STORAGE DOCUMENT PICKER */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid var(--status-success-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Lock size={20} color="var(--status-success)" />
              <div style={{ fontSize: '0.82rem' }}>
                <strong style={{ color: 'var(--status-success)' }}>100% LOCAL STORAGE GUARANTEE:</strong>
                All PDFs, BOQs, drawings, and correspondence remain on your local disk. Text parsing, vector embeddings, and search indexing are processed entirely on-device with zero telemetry or cloud leakage.
              </div>
            </div>

            {/* Folder selection bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <HardDrive size={18} color="var(--accent-blue)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Local Folder Path</div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedFolder}
                </div>
              </div>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  const newPath = prompt('Enter or browse local contract directory path:', selectedFolder);
                  if (newPath) setSelectedFolder(newPath);
                }}
              >
                Change Folder
              </button>
            </div>

            {/* Detected Contract Volumes in 1GB Directory */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Detected Contract Files in Directory (Total: ~978 MB)
                </span>
                <span className="badge badge-notice" style={{ fontSize: '0.7rem' }}>7 Volumes / 2,840 Pages</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {uploadedFiles.map((file, i) => (
                  <div 
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} color="var(--accent-blue)" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Classified: {file.type}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {file.size}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back to Profile
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                <span>Next: Inspect Processing Speed & Benchmarks &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BENCHMARK SPEED & INGESTION LAUNCH */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-title" style={{ fontSize: '1rem' }}>
              <Clock size={18} color="var(--status-warning)" />
              <span>How Long Does It Take to Read ~1GB of Contract Documents?</span>
            </div>

            {/* Performance Benchmark Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  A. Digital / Searchable PDFs
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '4px' }}>
                  ~1.5 to 3 Mins
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Text-native Specs, BOQ, Conditions of Contract (~150 pages/sec multi-thread).
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  B. Scanned Documents / OCR
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-warning)', marginTop: '4px' }}>
                  ~3 to 6 Mins
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Signed stamp sheets & scanned minutes using parallel multi-core OCR.
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  C. Embeddings & Graph
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '4px' }}>
                  ~45 Seconds
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Local fast embedding model (ONNX / WebAssembly) generating clause vectors.
                </div>
              </div>
            </div>

            {/* Progressive Indexing Explanation */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.8rem',
              lineHeight: 1.6
            }}>
              <strong>⚡ Progressive Ingestion Architecture:</strong> You do not need to wait for all 1GB to finish! 
              <strong> Volume 1 (Particular & General Conditions)</strong> is ready in the first <strong>15 seconds</strong>, allowing you to immediately query clauses, draft notice rebuttals, and check time-bars while large technical drawings index in the background.
            </div>

            {/* Ingestion Progress Bar if triggered */}
            {isProcessing && (
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>{currentProcessPhase}</span>
                  <span style={{ color: 'var(--accent-blue)' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button className="btn-secondary" onClick={() => setStep(2)} disabled={isProcessing}>
                Back to Documents
              </button>
              <button 
                className="btn-primary" 
                onClick={handleStartIngestion}
                disabled={isProcessing}
                style={{ padding: '10px 24px' }}
              >
                <Zap size={16} />
                <span>{isProcessing ? 'Reading & Indexing Locally...' : 'Start Local Ingestion (~978 MB)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
