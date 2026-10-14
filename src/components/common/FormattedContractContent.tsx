import React, { useState, useEffect } from 'react';
import { Table, Copy, Check, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Download, X, Eye } from 'lucide-react';

interface FormattedContractContentProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  images?: string[];
}

interface ParsedTable {
  headers: string[];
  rows: string[][];
  rawMarkdown: string;
}

/**
 * Checks if a string segment contains a valid Markdown table:
 * Must have a header row with pipes, a divider row (| --- |), and at least one data row.
 */
function parseMarkdownTable(block: string): ParsedTable | null {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  // Header line
  if (!lines[0].startsWith('|') || !lines[0].endsWith('|')) return null;

  // Divider line (| --- | --- |)
  const dividerLine = lines[1];
  if (!dividerLine.startsWith('|') || !dividerLine.endsWith('|')) return null;
  const dividerCols = dividerLine.slice(1, -1).split('|').map(c => c.trim());
  const isDividerValid = dividerCols.every(c => /^:?-+:?$/.test(c));
  if (!isDividerValid) return null;

  const headers = lines[0].slice(1, -1).split('|').map(c => c.trim());
  const rows: string[][] = [];

  for (let i = 2; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('|') && l.endsWith('|')) {
      const cells = l.slice(1, -1).split('|').map(c => c.trim());
      // Pad or trim to match header length
      while (cells.length < headers.length) cells.push('-');
      rows.push(cells.slice(0, headers.length));
    }
  }

  if (rows.length === 0) return null;

  return {
    headers,
    rows,
    rawMarkdown: block
  };
}

/**
 * Helper to determine if a cell represents a number, currency, or percentage for right alignment.
 */
function isNumeric(str: string): boolean {
  if (!str || str === '-') return false;
  const clean = str.replace(/[$,€£₹%]/g, '').trim();
  return !isNaN(Number(clean)) && clean.length > 0;
}

/**
 * Splits arbitrary text into alternating segments of standard text and structured tables.
 */
function segmentTextAndTables(rawText: string): Array<{ type: 'text' | 'table'; content: string; tableData?: ParsedTable }> {
  if (!rawText) return [];

  const segments: Array<{ type: 'text' | 'table'; content: string; tableData?: ParsedTable }> = [];
  const lines = rawText.split('\n');

  let currentTextBuffer: string[] = [];
  let currentTableBuffer: string[] = [];

  const flushTextBuffer = () => {
    if (currentTextBuffer.length > 0) {
      segments.push({
        type: 'text',
        content: currentTextBuffer.join('\n')
      });
      currentTextBuffer = [];
    }
  };

  const flushTableBuffer = () => {
    if (currentTableBuffer.length > 0) {
      const block = currentTableBuffer.join('\n');
      const parsed = parseMarkdownTable(block);
      if (parsed) {
        segments.push({
          type: 'table',
          content: block,
          tableData: parsed
        });
      } else {
        // Fallback: was not a valid markdown table after all
        segments.push({
          type: 'text',
          content: block
        });
      }
      currentTableBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 3) {
      // Possible table row
      flushTextBuffer();
      currentTableBuffer.push(line);
    } else {
      if (currentTableBuffer.length > 0) {
        flushTableBuffer();
      }
      currentTextBuffer.push(line);
    }
  }

  flushTableBuffer();
  flushTextBuffer();

  return segments;
}

export const FormattedContractContent: React.FC<FormattedContractContentProps> = ({
  text,
  className,
  style,
  images = []
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isImagesCollapsed, setIsImagesCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setZoomScale(1);
      } else if (e.key === 'ArrowRight' && lightboxIndex !== null && images.length > 1) {
        setLightboxIndex((lightboxIndex + 1) % images.length);
        setZoomScale(1);
      } else if (e.key === 'ArrowLeft' && lightboxIndex !== null && images.length > 1) {
        setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
        setZoomScale(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  if (!text && (!images || images.length === 0)) {
    return <div className={className} style={style}>No content available.</div>;
  }

  const segments = segmentTextAndTables(text || '');

  const handleCopyCsv = (table: ParsedTable, index: number) => {
    const csvContent = [
      table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...table.rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    navigator.clipboard.writeText(csvContent);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadImage = (dataUrl: string, idx: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `contract_figure_${idx + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '14px', ...style }}>
      {/* Recognized Contract Images & Figures Gallery Banner */}
      {images && images.length > 0 && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)'
              }}>
                <ImageIcon size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recognized Images & Visual Figures ({images.length})
              </span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsImagesCollapsed(prev => !prev)}
              style={{ fontSize: '0.72rem', padding: '3px 10px', height: 'auto' }}
            >
              {isImagesCollapsed ? 'Show Thumbnails' : 'Collapse'}
            </button>
          </div>

          {!isImagesCollapsed && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px',
              marginTop: '4px'
            }}>
              {images.map((imgUrl, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                    background: '#090d16',
                    cursor: 'pointer',
                    aspectRatio: '4 / 3'
                  }}
                  onClick={() => {
                    setLightboxIndex(i);
                    setZoomScale(1);
                  }}
                  title="Click to view full image & zoom"
                >
                  <img
                    src={imgUrl}
                    alt={`Recognized contract figure ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    insetInline: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    padding: '4px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#e2e8f0' }}>
                      Figure {i + 1}
                    </span>
                    <Eye size={12} color="var(--accent-blue)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Document Text & Markdown Tables */}
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return (
            <div
              key={idx}
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.7
              }}
            >
              {seg.content}
            </div>
          );
        }

        if (seg.type === 'table' && seg.tableData) {
          const t = seg.tableData;
          return (
            <div key={idx} className="table-responsive-container">
              <div className="table-meta-bar">
                <div className="table-meta-badge">
                  <Table size={14} />
                  <span>Extracted Table ({t.rows.length} rows &times; {t.headers.length} columns)</span>
                </div>
                <button
                  type="button"
                  className="table-copy-btn"
                  onClick={() => handleCopyCsv(t, idx)}
                  title="Copy table formatted as CSV"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={12} color="var(--accent-teal)" />
                      <span>Copied CSV</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Export CSV</span>
                    </>
                  )}
                </button>
              </div>

              <div className="table-scroll-wrapper">
                <table className="contract-data-table">
                  <thead>
                    <tr>
                      {t.headers.map((h, hi) => (
                        <th key={hi}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={isNumeric(cell) ? 'cell-numeric' : 'cell-text'}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Interactive Lightbox Modal for High-Resolution Visual Inspection */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.94)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => {
            setLightboxIndex(null);
            setZoomScale(1);
          }}
        >
          {/* Top Control Bar */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 100000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.84rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)'
              }}>
                Figure {lightboxIndex + 1} of {images.length}
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                      setZoomScale(1);
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    &larr; Prev
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setLightboxIndex((lightboxIndex + 1) % images.length);
                      setZoomScale(1);
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Zoom & Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3.5))}
                title="Zoom In (+)"
                style={{ padding: '6px 10px' }}
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                title="Zoom Out (-)"
                style={{ padding: '6px 10px' }}
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setZoomScale(1)}
                title="Reset Zoom (1:1)"
                style={{ padding: '6px 10px' }}
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleDownloadImage(images[lightboxIndex], lightboxIndex)}
                title="Download full resolution image"
                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} />
                <span style={{ fontSize: '0.78rem' }}>Save Image</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setLightboxIndex(null);
                  setZoomScale(1);
                }}
                title="Close Lightbox (Esc)"
                style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Zoomable Image Viewport */}
          <div
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`Recognized contract figure ${lightboxIndex + 1}`}
              style={{
                maxWidth: zoomScale === 1 ? '88vw' : 'none',
                maxHeight: zoomScale === 1 ? '78vh' : 'none',
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                cursor: zoomScale > 1 ? 'grab' : 'zoom-in'
              }}
              onClick={() => {
                if (zoomScale === 1) setZoomScale(1.75);
                else setZoomScale(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
