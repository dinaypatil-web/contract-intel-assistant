import React, { useState, useRef } from 'react';
import { Project, ContractDocument, DocumentType, ContractClause, DocumentPage } from '../../types/contract';
import { 
  FileText, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  Calendar,
  FolderPlus
} from 'lucide-react';
import { extractTextFromPdf, formatFileSize, parseClausesFromContractText, isImageFile } from '../../utils/pdfParser';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onAddDocument: (document: ContractDocument) => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  project,
  onAddDocument
}) => {
  const nextVolIndex = (project?.documents?.length || 0) + 1;

  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('Particular Conditions');
  const [volumeNumber, setVolumeNumber] = useState<string>(`Volume ${nextVolIndex}`);
  const [revision, setRevision] = useState<string>('Rev. 00 Local');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<string>('');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsingStatus, setParsingStatus] = useState<string>('');
  const [ocrExtractedCount, setOcrExtractedCount] = useState<number>(0);
  const [docImages, setDocImages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState<number>(1);
  const [rawText, setRawText] = useState<string>('');
  const [pageDetails, setPageDetails] = useState<DocumentPage[]>([]);
  const [parsedClauses, setParsedClauses] = useState<ContractClause[]>([]);
  const [fileSizeFormatted, setFileSizeFormatted] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsProcessing(true);
    setParsingStatus(`Reading "${file.name}"...`);
    setOcrExtractedCount(0);

    const sizeStr = formatFileSize(file.size);
    setFileSizeFormatted(sizeStr);

    // Auto-populate Title if blank
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    if (!documentTitle) {
      setDocumentTitle(cleanName);
    }

    // Auto-detect DocumentType based on filename heuristics
    const lower = file.name.toLowerCase();
    if (lower.includes('particular') || lower.includes('pc')) setDocumentType('Particular Conditions');
    else if (lower.includes('general') || lower.includes('gc') || lower.includes('fidic')) setDocumentType('General Conditions');
    else if (lower.includes('spec') || lower.includes('requirement')) setDocumentType('Technical Specifications');
    else if (lower.includes('boq') || lower.includes('bill') || lower.includes('quantity')) setDocumentType('BOQ');
    else if (lower.includes('draw') || lower.includes('gad') || lower.includes('structural')) setDocumentType('Drawings');
    else if (lower.includes('addend') || lower.includes('corrig')) setDocumentType('Addenda / Corrigenda');
    else if (lower.includes('agreement') || lower.includes('contract')) setDocumentType('Contract Agreement');
    else if (lower.includes('acceptance') || lower.includes('award')) setDocumentType('Letter of Acceptance');

    try {
      setDocImages([]);
      const isPdf = lower.endsWith('.pdf') || file.type === 'application/pdf';
      const isImg = isImageFile(file);
      let extracted = '';
      let pages = 1;
      let pagesList: DocumentPage[] = [];

      if (isPdf || isImg) {
        const result = await extractTextFromPdf(file, file.name, (prog) => {
          setParsingStatus(prog.message);
        }, { mode: 'balanced' });
        pages = result.numPages || 1;
        extracted = result.text || '';
        pagesList = result.pages || [{ pageNumber: 1, text: extracted }];
        if (result.ocrPagesCount) {
          setOcrExtractedCount(result.ocrPagesCount);
        }
        if (result.images && result.images.length > 0) {
          setDocImages(result.images);
        }
        if (isImg && result.suggestedClassification) {
          setDocumentType(result.suggestedClassification as any);
        }
      } else {
        extracted = await file.text();
        const textSections = extracted.split(/\n\s*---\s*Page Break(?:\s*\[Page\s*[0-9]+\])?\s*---\s*\n|\f/).filter(Boolean);
        if (textSections.length > 1) {
          pages = textSections.length;
          pagesList = textSections.map((sec, i) => ({ pageNumber: i + 1, text: sec.trim() }));
        } else {
          pages = Math.max(1, Math.ceil(extracted.length / 2500));
          pagesList = Array.from({ length: pages }, (_, i) => ({
            pageNumber: i + 1,
            text: extracted.slice(i * 2500, (i + 1) * 2500).trim()
          }));
        }
      }

      const tempDocId = `doc-${Date.now()}`;
      const clauses = parseClausesFromContractText(
        extracted,
        tempDocId,
        volumeNumber,
        nextVolIndex,
        pagesList
      );

      setPageCount(pages);
      setRawText(extracted);
      setPageDetails(pagesList);
      setParsedClauses(clauses);
      if (!summary) {
        setSummary(`Contract volume containing ${pages} pages and ${clauses.length} parsed clauses.`);
      }
    } catch (err: any) {
      console.error('Failed to parse document:', err);
      setErrorMessage(`Failed to read "${file.name}". Please ensure it is unencrypted.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSampleSpecs = () => {
    const pagesList: DocumentPage[] = [
      {
        pageNumber: 1,
        text: 'Section 1.0 Scope of Engineering Works & Technical Specifications\n1.1 Scope of Works: The Contractor shall construct the main viaduct structure, deep bored pile foundations, and auxiliary civil works in strict accordance with AASHTO and FIDIC standards.\n1.2 Site Handover: The Employer shall grant exclusive site access within 30 days.'
      },
      {
        pageNumber: 2,
        text: 'Section 2.0 Material Specifications & Testing Protocols\n2.1 Structural Concrete: Grade C50/60 with silica fume admixture.\n\n| Item Code | Material / Component | Testing Standard | Minimum Frequency | Compliance Criteria |\n| --- | --- | --- | --- | --- |\n| CONC-01 | Grade C50/60 Structural Concrete | BS EN 12390-3 | 1 test set per 50 m³ | 28-day Compressive ≥ 50 MPa |\n| ST-02 | High Yield Rebar Grade 500B | BS 4449:2005 | 1 tensile test per 25 tons | Yield Strength ≥ 500 N/mm² |\n| AGG-03 | Coarse & Fine Aggregate | ASTM C33 | 1 gradation test per 200 tons | Passing 75µm Sieve < 1.0% |\n| BT-04 | Structural Bolts Grade 8.8 | ISO 898-1 | 1 proof load per batch | Proof Load ≥ 580 MPa |\n\n2.2 Reinforcing Steel: High-yield deformed steel rebars complying with BS 4449 Grade 500B.'
      },
      {
        pageNumber: 3,
        text: 'Section 3.0 Quality Assurance & Environmental Protection\n3.1 Noise & Dust Mitigation: Sound attenuation barriers shall be maintained along urban residential zones.\n3.2 Health & Safety: Mandatory daily toolbox talks and OSHA compliant site safety audits.'
      }
    ];

    const text = pagesList.map(p => `--- Page Break [Page ${p.pageNumber}] ---\n\n${p.text}`).join('\n\n');
    setDocumentTitle('Employer Requirements & Technical Specifications');
    setDocumentType('Technical Specifications');
    setVolumeNumber(`Volume ${nextVolIndex}`);
    setPageCount(3);
    setRawText(text);
    setPageDetails(pagesList);
    setFileSizeFormatted('42.5 KB');
    setParsedClauses(parseClausesFromContractText(text, `doc-${Date.now()}`, `Volume ${nextVolIndex}`, nextVolIndex, pagesList));
    setSummary('Technical Specifications defining concrete grades, rebar standards, and quality protocols (3 Pages).');
  };

  const handleSave = () => {
    const docId = `doc-${Date.now()}`;
    const finalTitle = documentTitle.trim() || `Contract Volume ${nextVolIndex}`;
    const finalVolume = volumeNumber.trim() || `Volume ${nextVolIndex}`;

    const newDoc: ContractDocument = {
      id: docId,
      projectId: project.id,
      volumeNumber: finalVolume,
      title: finalTitle,
      documentType,
      revision: revision.trim() || 'Rev. 00 Local',
      date: date || new Date().toISOString().split('T')[0],
      pageCount: pageCount || 1,
      clauses: parsedClauses.map(c => ({
        ...c,
        documentId: docId,
        volumeNumber: finalVolume
      })),
      summary: summary.trim() || `Contract volume (${finalVolume}) with ${pageCount} pages, ${docImages.length > 0 ? docImages.length + ' recognized images/drawings, ' : ''}and ${parsedClauses.length} parsed clauses.`,
      rawText: rawText || `[Document: ${finalTitle}]`,
      pages: pageDetails.length > 0 ? pageDetails : [{ pageNumber: 1, text: rawText || finalTitle, images: docImages }],
      fileName: selectedFile?.name || `${finalTitle.replace(/\s+/g, '_')}.pdf`,
      fileSize: fileSizeFormatted || '15.0 KB',
      images: docImages.length > 0 ? docImages : undefined
    };

    onAddDocument(newDoc);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.88)',
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
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
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
                Add Contract Document to Repository
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target Project: <strong style={{ color: 'var(--accent-blue)' }}>{project.code} - {project.name}</strong>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Sample Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Need test data? Load a synthesized multi-page volume:
          </span>
          <button
            type="button"
            className="nav-action-btn"
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
            onClick={handleLoadSampleSpecs}
          >
            <Sparkles size={13} color="var(--accent-blue)" />
            <span>+ Load Sample Specifications (3 Pages)</span>
          </button>
        </div>

        {/* Drag & Drop File Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              processFile(e.dataTransfer.files[0]);
            }
          }}
          style={{
            padding: '20px',
            background: isDragOver ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
            border: isDragOver 
              ? '2px dashed var(--accent-blue)' 
              : selectedFile 
              ? '1px solid var(--status-success-border)' 
              : '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <input 
            ref={fileInputRef}
            type="file"
            id="contract-doc-file-picker"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.bmp,.tiff,image/*,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: isProcessing 
              ? 'rgba(56, 189, 248, 0.15)' 
              : selectedFile 
              ? 'rgba(16, 185, 129, 0.15)' 
              : 'rgba(56, 189, 248, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isProcessing ? (
              <Loader2 size={22} className="spinning" color="var(--accent-blue)" />
            ) : selectedFile ? (
              <FileCheck size={22} color="var(--status-success)" />
            ) : (
              <Upload size={22} color="var(--accent-blue)" />
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isProcessing 
                ? (parsingStatus || 'Reading all pages & extracting clause hierarchy...')
                : selectedFile 
                ? selectedFile.name 
                : 'Select Contract PDF, Document, or Drawing Image'
              }
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {selectedFile ? (
                <span style={{ color: 'var(--status-success)' }}>
                  {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} recognized &bull; {parsedClauses.length} Clauses indexed {ocrExtractedCount > 0 ? `• OCR Digitized (${ocrExtractedCount} pages) ` : ''}{docImages.length > 0 ? `• 🖼️ ${docImages.length} Images Recognized ` : ''}&bull; {fileSizeFormatted}
                </span>
              ) : (
                'Drop PDF (.pdf), Word (.doc, .docx), Text (.txt), or Drawing / Contract Images (.png, .jpg, .webp). Full neural OCR extraction included.'
              )}
            </div>
          </div>

          {docImages.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
              padding: '6px 12px',
              background: 'rgba(56, 189, 248, 0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                🖼️ {docImages.length} {docImages.length === 1 ? 'Image / Drawing' : 'Images / Drawings'} Extracted:
              </span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '320px' }}>
                {docImages.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Recognized contract figure ${idx + 1}`}
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <label
            htmlFor="contract-doc-file-picker"
            className="btn-primary"
            style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '6px 16px', marginTop: '4px' }}
          >
            <span>{selectedFile ? 'Change File' : 'Browse Local Disk'}</span>
          </label>
        </div>

        {errorMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--status-critical-bg)', border: '1px solid var(--status-critical-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.78rem', color: 'var(--status-critical)' }}>
            <AlertTriangle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Metadata Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input 
              type="text"
              className="form-input"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="e.g. Particular Conditions of Contract"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Document Classification</label>
            <select
              className="form-select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            >
              <option value="Contract Agreement">Contract Agreement</option>
              <option value="Letter of Acceptance">Letter of Acceptance</option>
              <option value="Addenda / Corrigenda">Addenda / Corrigenda</option>
              <option value="Particular Conditions">Particular Conditions</option>
              <option value="General Conditions">General Conditions</option>
              <option value="Employer Requirements">Employer Requirements</option>
              <option value="Technical Specifications">Technical Specifications</option>
              <option value="BOQ">BOQ (Bill of Quantities)</option>
              <option value="Drawings">Drawings</option>
              <option value="Schedules / Appendices">Schedules / Appendices</option>
              <option value="Correspondence">Correspondence / Site Minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Volume Reference</label>
            <input 
              type="text"
              className="form-input"
              value={volumeNumber}
              onChange={(e) => setVolumeNumber(e.target.value)}
              placeholder="e.g. Volume 2 or Section B"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Revision Number</label>
            <input 
              type="text"
              className="form-input"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              placeholder="e.g. Rev. 00 Local"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Effective Date</label>
            <input 
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Page Count</label>
            <input 
              type="number"
              min={1}
              className="form-input"
              value={pageCount}
              onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Summary / Notes</label>
          <input 
            type="text"
            className="form-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief scope, priority notes, or governing clauses..."
          />
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-primary"
            style={{ padding: '9px 24px', fontSize: '0.88rem' }}
            disabled={isProcessing || (!selectedFile && !rawText)}
            onClick={handleSave}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="spinning" />
                <span>Processing Pages...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Add Document to Repository</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
