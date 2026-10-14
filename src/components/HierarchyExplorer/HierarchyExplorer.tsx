import React, { useState, useEffect, useRef } from 'react';
import { Project, ContractClause, ContractDocument, DocumentPage } from '../../types/contract';
import { 
  Layers, 
  BookOpen, 
  Share2, 
  Search, 
  ArrowUpRight, 
  Clock, 
  ShieldAlert, 
  FileText,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Eye,
  ListFilter,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { AddDocumentModal } from './AddDocumentModal';
import { FormattedContractContent } from '../common/FormattedContractContent';

interface HierarchyExplorerProps {
  project: Project;
  onSelectClauseForChat?: (clause: ContractClause) => void;
  onAddDocument?: (document: ContractDocument) => void;
  onRemoveDocument?: (documentId: string) => void;
}

export const HierarchyExplorer: React.FC<HierarchyExplorerProps> = ({
  project,
  onSelectClauseForChat,
  onAddDocument,
  onRemoveDocument
}) => {
  const [selectedDoc, setSelectedDoc] = useState<ContractDocument | null>(project.documents[0] || null);
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(
    project.documents[0]?.clauses[0] || null
  );
  const [clauseSearch, setClauseSearch] = useState<string>('');
  const [activeTabCol2, setActiveTabCol2] = useState<'clauses' | 'pages'>('clauses');
  const [viewMode, setViewMode] = useState<'clause' | 'pageReader' | 'rawText' | 'specs'>('clause');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [docToDelete, setDocToDelete] = useState<ContractDocument | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const prevDocCountRef = useRef<number>(project.documents.length);

  // Sync when project or documents change
  useEffect(() => {
    if (project.documents.length > 0) {
      const isNewDocAdded = project.documents.length > prevDocCountRef.current;
      prevDocCountRef.current = project.documents.length;

      const doc = isNewDocAdded
        ? project.documents[project.documents.length - 1]
        : (project.documents.find(d => d.id === selectedDoc?.id) || project.documents[0]);

      setSelectedDoc(doc);
      setSelectedClause(doc?.clauses[0] || null);
      setCurrentPageIndex(1);
    } else {
      prevDocCountRef.current = 0;
      setSelectedDoc(null);
      setSelectedClause(null);
    }
  }, [project.id, project.documents]);

  // Derive pages from document
  const docPages: DocumentPage[] = selectedDoc?.pages && selectedDoc.pages.length > 0
    ? selectedDoc.pages
    : selectedDoc?.rawText
    ? selectedDoc.rawText
        .split(/\n\s*---\s*Page Break(?:\s*\[Page\s*[0-9]+\])?\s*---\s*\n|\f/)
        .filter(Boolean)
        .map((text, i) => ({ pageNumber: i + 1, text: text.trim() }))
    : [{ pageNumber: 1, text: selectedDoc?.summary || 'Document initialized.' }];

  const totalPages = Math.max(selectedDoc?.pageCount || 1, docPages.length);

  const filteredClauses = selectedDoc?.clauses.filter(c => 
    c.clauseNumber.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.title.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.content.toLowerCase().includes(clauseSearch.toLowerCase())
  ) || [];

  // Active page data
  const activePageData = docPages.find(p => p.pageNumber === currentPageIndex) || docPages[0] || {
    pageNumber: currentPageIndex,
    text: selectedDoc?.rawText || 'No text extracted for this page.'
  };

  const clausesOnCurrentPage = selectedDoc?.clauses.filter(c => c.pageNumber === currentPageIndex) || [];

  const handleSelectPage = (pageNum: number) => {
    setCurrentPageIndex(pageNum);
    setViewMode('pageReader');
    const clauseOnPg = selectedDoc?.clauses.find(c => c.pageNumber === pageNum);
    if (clauseOnPg) {
      setSelectedClause(clauseOnPg);
    }
  };

  const handleSelectClause = (clause: ContractClause) => {
    setSelectedClause(clause);
    setCurrentPageIndex(clause.pageNumber || 1);
    setViewMode('clause');
  };

  const handleConfirmDelete = () => {
    if (docToDelete && onRemoveDocument) {
      onRemoveDocument(docToDelete.id);
      setDocToDelete(null);
    }
  };

  const handleCopyText = () => {
    if (selectedDoc?.rawText) {
      navigator.clipboard.writeText(selectedDoc.rawText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadText = () => {
    if (selectedDoc) {
      const blob = new Blob([selectedDoc.rawText || selectedDoc.summary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedDoc.title.replace(/\s+/g, '_')}_raw_text.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner: Order of Precedence Hierarchy Engine */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div className="panel-header" style={{ marginBottom: '12px' }}>
          <div className="panel-title">
            <Layers size={20} color="var(--accent-blue)" />
            <span>Project Order of Precedence (Sub-Clause 1.5 Governing Hierarchy)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-notice">Priority 2 Engine</span>
            {onAddDocument && (
              <button
                type="button"
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={14} />
                <span>+ Add Contract Document</span>
              </button>
            )}
          </div>
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

      {/* Main 3-Column Split: Volumes List -> Clauses/Pages List -> Reader & Knowledge Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 330px 1fr', gap: '20px', minHeight: '660px' }}>
        {/* Column 1: Multi-Volume Documents with Add & Remove Controls */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Contract Volumes ({project.documents.length})
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setIsAddModalOpen(true)}
              title="Upload new Contract Document"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {project.documents.length === 0 ? (
              <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <FileText size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div>No contract documents in this project.</div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: '10px', fontSize: '0.76rem', padding: '5px 12px' }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Add Document
                </button>
              </div>
            ) : (
              project.documents.map(doc => {
                const isSelected = selectedDoc?.id === doc.id;
                const pagesTotal = doc.pageCount || (doc.pages ? doc.pages.length : 1);
                return (
                  <div
                    key={doc.id}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setSelectedClause(doc.clauses[0] || null);
                      setCurrentPageIndex(1);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {doc.volumeNumber}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {pagesTotal} {pagesTotal === 1 ? 'Page' : 'Pages'}
                        </span>
                        {onRemoveDocument && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocToDelete(doc);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={`Remove ${doc.title}`}
                          >
                            <Trash2 size={13} color="var(--text-muted)" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '3px', paddingRight: '4px' }}>
                      {doc.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{doc.clauses.length} Clauses</span>
                      <span>{doc.revision}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Navigation Switcher (Clauses vs All Pages) */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              type="button"
              className={`nav-action-btn ${activeTabCol2 === 'clauses' ? 'active' : ''}`}
              style={{ fontSize: '0.76rem', padding: '5px 12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => setActiveTabCol2('clauses')}
            >
              <ListFilter size={13} />
              <span>Clauses ({filteredClauses.length})</span>
            </button>
            <button
              type="button"
              className={`nav-action-btn ${activeTabCol2 === 'pages' ? 'active' : ''}`}
              style={{ fontSize: '0.76rem', padding: '5px 12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => setActiveTabCol2('pages')}
            >
              <FileText size={13} />
              <span>All Pages ({docPages.length})</span>
            </button>
          </div>

          {activeTabCol2 === 'clauses' ? (
            <>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '520px' }}>
                {filteredClauses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No clauses found matching filter.
                  </div>
                ) : (
                  filteredClauses.map(clause => {
                    const isSelected = selectedClause?.id === clause.id && viewMode === 'clause';
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
                        onClick={() => handleSelectClause(clause)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                            {clause.clauseNumber}
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            Pg {clause.pageNumber}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {clause.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{clause.category}</span>
                          {clause.timeBarDays && (
                            <span style={{ color: 'var(--status-critical)', fontWeight: 700 }}>
                              {clause.timeBarDays}d Time-Bar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Pages Tab: Browse every page of the document */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '560px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 4px' }}>
                Click any page to read its exact text layer:
              </div>
              {docPages.map(page => {
                const isSelected = currentPageIndex === page.pageNumber && viewMode === 'pageReader';
                const clausesOnPage = selectedDoc?.clauses.filter(c => c.pageNumber === page.pageNumber) || [];
                const snippet = page.text.replace(/--- Page Break.*?---/g, '').replace(/\[Page.*?\]/g, '').trim().slice(0, 85);

                return (
                  <div
                    key={page.pageNumber}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => handleSelectPage(page.pageNumber)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} />
                        <span>Page {page.pageNumber}</span>
                        {page.isOcr && (
                          <span className="badge badge-notice" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                            OCR
                          </span>
                        )}
                      </span>
                      {clausesOnPage.length > 0 && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {clausesOnPage.length} {clausesOnPage.length === 1 ? 'Clause' : 'Clauses'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4, fontFamily: 'var(--font-mono)' }}>
                      {snippet ? `${snippet}...` : '(Page visual content)'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 3: Detail View & Reader */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedDoc ? (
            <>
              {/* View Mode Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`nav-action-btn ${viewMode === 'clause' ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                    onClick={() => setViewMode('clause')}
                  >
                    <span>Clause Analysis</span>
                  </button>
                  <button
                    type="button"
                    className={`nav-action-btn ${viewMode === 'pageReader' ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                    onClick={() => setViewMode('pageReader')}
                  >
                    <span>Page Reader ({currentPageIndex}/{totalPages})</span>
                  </button>
                  <button
                    type="button"
                    className={`nav-action-btn ${viewMode === 'rawText' ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                    onClick={() => setViewMode('rawText')}
                  >
                    <span>Full Document Text</span>
                  </button>
                  <button
                    type="button"
                    className={`nav-action-btn ${viewMode === 'specs' ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                    onClick={() => setViewMode('specs')}
                  >
                    <Info size={13} />
                    <span>Document Specs</span>
                  </button>
                </div>

                {viewMode === 'pageReader' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      disabled={currentPageIndex <= 1}
                      onClick={() => setCurrentPageIndex(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={14} />
                      <span>Prev Page</span>
                    </button>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Page {currentPageIndex} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      disabled={currentPageIndex >= totalPages}
                      onClick={() => setCurrentPageIndex(prev => Math.min(totalPages, prev + 1))}
                    >
                      <span>Next Page</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW MODE 1: CLAUSE VIEW */}
              {viewMode === 'clause' && (
                selectedClause ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-notice">{selectedClause.volumeNumber}</span>
                          <button 
                            type="button" 
                            className="badge badge-neutral" 
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => handleSelectPage(selectedClause.pageNumber)}
                            title="Jump to Page Reader"
                          >
                            Page {selectedClause.pageNumber} &rarr;
                          </button>
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
                      maxHeight: '420px',
                      overflowY: 'auto'
                    }}>
                      <FormattedContractContent text={selectedClause.content} />
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
                          const linkedClause = selectedDoc?.clauses.find(c => c.id === icId);
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
                              onClick={() => handleSelectClause(linkedClause)}
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
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <div>No specific clause selected. Switch to <strong>Page Reader</strong> or select a clause from the list.</div>
                  </div>
                )
              )}

              {/* VIEW MODE 2: PAGE-BY-PAGE DOCUMENT READER */}
              {viewMode === 'pageReader' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-notice">{selectedDoc?.volumeNumber}</span>
                        <span className="badge badge-success">Page {currentPageIndex} of {totalPages}</span>
                        {activePageData?.isOcr && (
                          <span className="badge badge-notice" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                            OCR Digitized
                          </span>
                        )}
                        {selectedDoc?.fileName && (
                          <span className="badge badge-neutral">{selectedDoc.fileName}</span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px' }}>
                        {selectedDoc?.title} &bull; Page {currentPageIndex}
                      </h2>
                    </div>

                    {clausesOnCurrentPage.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Clauses on this page:</span>
                        {clausesOnCurrentPage.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            className="citation-pill"
                            style={{ cursor: 'pointer', fontSize: '0.72rem' }}
                            onClick={() => handleSelectClause(c)}
                          >
                            {c.clauseNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Page Content Display */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.84rem',
                    lineHeight: 1.8,
                    color: 'var(--text-primary)',
                    minHeight: '340px',
                    maxHeight: '520px',
                    overflowY: 'auto',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    <FormattedContractContent text={activePageData.text} />
                  </div>

                  {/* Page Navigator Bottom Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.76rem', padding: '5px 12px' }}
                      disabled={currentPageIndex <= 1}
                      onClick={() => setCurrentPageIndex(prev => Math.max(1, prev - 1))}
                    >
                      &larr; Previous Page
                    </button>

                    <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '380px', padding: '2px 6px' }}>
                      {docPages.map(p => (
                        <button
                          key={p.pageNumber}
                          type="button"
                          onClick={() => setCurrentPageIndex(p.pageNumber)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: p.pageNumber === currentPageIndex ? 800 : 500,
                            background: p.pageNumber === currentPageIndex ? 'var(--accent-blue)' : 'var(--bg-surface)',
                            color: p.pageNumber === currentPageIndex ? '#ffffff' : 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          {p.pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.76rem', padding: '5px 12px' }}
                      disabled={currentPageIndex >= totalPages}
                      onClick={() => setCurrentPageIndex(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next Page &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW MODE 3: FULL RAW TEXT LAYER */}
              {viewMode === 'rawText' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-notice">{selectedDoc?.volumeNumber}</span>
                        <span className="badge badge-success">Full Document Text Layer ({totalPages} Pages)</span>
                        {selectedDoc?.fileName && (
                          <span className="badge badge-neutral">{selectedDoc.fileName}</span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px' }}>
                        {selectedDoc?.title}
                      </h2>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={handleCopyText}
                      >
                        {isCopied ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                        <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={handleDownloadText}
                      >
                        <Download size={14} />
                        <span>Download TXT</span>
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    maxHeight: '540px',
                    overflowY: 'auto'
                  }}>
                    <FormattedContractContent text={selectedDoc?.rawText || 'No text extracted.'} />
                  </div>
                </div>
              )}

              {/* VIEW MODE 4: DOCUMENT SPECS & ACTIONS */}
              {viewMode === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className="badge badge-notice">{selectedDoc.volumeNumber}</span>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '6px' }}>
                        {selectedDoc.title}
                      </h2>
                    </div>
                    {onRemoveDocument && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ color: 'var(--status-critical)', borderColor: 'var(--status-critical-border)', fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setDocToDelete(selectedDoc)}
                      >
                        <Trash2 size={14} />
                        <span>Remove Volume</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Classification</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-blue)' }}>{selectedDoc.documentType}</div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Pages</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: 'var(--status-success)' }}>{totalPages} Pages Recognized</div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Parsed Clauses</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{selectedDoc.clauses.length} Clauses Indexed</div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>File & Size</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '4px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {selectedDoc.fileName || 'Embedded'} ({selectedDoc.fileSize || 'Standard'})
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Revision & Date</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '4px', color: 'var(--text-primary)' }}>
                        {selectedDoc.revision} &bull; {selectedDoc.date}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Summary Scope</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {selectedDoc.summary}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <FileText size={42} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Contract Document Selected</div>
              <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                Select a document from the left, or click <strong>+ Add Contract Document</strong> to upload.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD DOCUMENT MODAL */}
      {isAddModalOpen && onAddDocument && (
        <AddDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          project={project}
          onAddDocument={(newDoc) => {
            onAddDocument(newDoc);
            setSelectedDoc(newDoc);
            setSelectedClause(newDoc.clauses[0] || null);
            setCurrentPageIndex(1);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      {docToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trash2 size={20} color="var(--status-critical)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Remove Contract Volume?</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  This action removes the document from active contractual indexing.
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              <div><strong>Volume:</strong> {docToDelete.volumeNumber} - {docToDelete.title}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                Contains {docToDelete.pageCount || 1} pages and {docToDelete.clauses.length} parsed clauses.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDocToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'var(--status-critical)', borderColor: 'var(--status-critical)' }}
                onClick={handleConfirmDelete}
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
