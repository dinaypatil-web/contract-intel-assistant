import React, { useState } from 'react';
import { Table, Copy, Check } from 'lucide-react';

interface FormattedContractContentProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
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
  style
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!text) {
    return <div className={className} style={style}>No content available.</div>;
  }

  const segments = segmentTextAndTables(text);

  const handleCopyCsv = (table: ParsedTable, index: number) => {
    const csvContent = [
      table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...table.rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    navigator.clipboard.writeText(csvContent);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
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
    </div>
  );
};
