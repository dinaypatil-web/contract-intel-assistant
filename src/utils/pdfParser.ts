// Polyfill Uint8Array toHex / fromHex for browsers/environments that do not support TC39 Uint8Array methods yet (needed by pdfjs-dist)
if (typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function () {
    return Array.from(this)
      .map(b => (b as number).toString(16).padStart(2, '0'))
      .join('');
  };
}
if (typeof (Uint8Array as any).fromHex !== 'function') {
  (Uint8Array as any).fromHex = function (hexString: string) {
    const clean = (hexString || '').replace(/[^0-9a-fA-F]/g, '');
    const bytes = new Uint8Array(Math.floor(clean.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return bytes;
  };
}

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ContractClause, DocumentPage } from '../types/contract';

// Set worker source for Vite bundler
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedPdfData {
  text: string;
  numPages: number;
  pages: DocumentPage[];
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  refNumber?: string;
  date?: string;
  subject?: string;
  sender?: string;
  recipient?: string;
  detectedClauses: string[];
  suggestedClassification: string;
  isScannedOrEmpty: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Intelligent regex and heuristic extractor for construction & contract letters
 */
export function extractContractLetterMetadata(rawText: string, fileName: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const textSample = lines.slice(0, 30).join('\n'); // Search first 30 lines for letterhead metadata

  // 1. Reference Number Detection
  let refNumber = '';
  const refMatches = textSample.match(/(?:Ref(?:erence)?(?:\s+No\.?|\s*:)?|Letter\s+No\.?|Our\s+Ref\.?|Ref\s*:)\s*[:\s]*([A-Za-z0-9_.\-\/\(\)]+)/i);
  if (refMatches && refMatches[1] && refMatches[1].length > 3) {
    refNumber = refMatches[1].trim();
  } else {
    // Look for common construction reference formats like PMC/xxx/2026/... or PRJ/...
    const codeMatch = rawText.match(/\b([A-Z]{2,6}\/[A-Z0-9_\-]+\/(?:202[4-9]|20[0-9]{2})\/[A-Z0-9_\-]+)\b/);
    if (codeMatch && codeMatch[1]) {
      refNumber = codeMatch[1];
    }
  }

  // 2. Date Detection
  let date = '';
  const datePrefixMatch = textSample.match(/(?:Date|Dated)\s*[:\s]+([0-9]{1,2}(?:st|nd|rd|th)?[\s\/\-\.](?:[A-Za-z]+|[0-9]{1,2})[\s\/\-\.][0-9]{2,4}|[0-9]{4}[\-\/.][0-9]{1,2}[\-\/.][0-9]{1,2})/i);
  if (datePrefixMatch && datePrefixMatch[1]) {
    try {
      const parsed = new Date(datePrefixMatch[1].replace(/(?:st|nd|rd|th)/, ''));
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
  }
  if (!date) {
    const genDateMatch = textSample.match(/\b([0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+202[0-9])\b/i);
    if (genDateMatch && genDateMatch[1]) {
      const parsed = new Date(genDateMatch[1]);
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0];
      }
    }
  }

  // 3. Subject Detection
  let subject = '';
  const subjMatch = rawText.match(/(?:Subject|Sub|Re|Regarding)\s*[:\s]+([^\n\r]+(?:\n[ \t]+[^\n\r]+)*)/i);
  if (subjMatch && subjMatch[1]) {
    subject = subjMatch[1].replace(/\s+/g, ' ').trim();
    if (subject.length > 180) {
      subject = subject.slice(0, 180) + '...';
    }
  }

  // 4. Sender Detection
  let sender = '';
  if (/Egis|Systra|Arup|Mott|Jacobs|PMC|The Engineer|Engineer|Consultant|Supervising/i.test(rawText)) {
    const engineerMatch = rawText.match(/([A-Za-z\s\-]+(?:\(The Engineer\)|Consortium|Consultants|PMC|Engineers?))/i);
    if (engineerMatch && engineerMatch[1] && engineerMatch[1].length < 60) {
      sender = engineerMatch[1].trim();
    } else {
      sender = 'The Engineer / PMC Consortium';
    }
  } else if (/Employer|Authority|Ministry|Corporation|Rail Corporation/i.test(rawText)) {
    sender = 'The Employer / Project Authority';
  }

  // 5. Recipient Detection
  let recipient = '';
  const toMatch = rawText.match(/(?:To\s*[:\s]+|Attention\s*[:\s]+)([^\n\r,]+)/i);
  if (toMatch && toMatch[1] && toMatch[1].length < 80) {
    recipient = toMatch[1].trim();
  }

  // 6. Detected Clauses
  const detectedClauses: string[] = [];
  const clauseMatches = rawText.matchAll(/(?:Sub-Clause|Clause|Cl\.)\s*([0-9]{1,2}(?:\.[0-9]{1,2})*)/gi);
  for (const m of clauseMatches) {
    const clauseStr = `Sub-Clause ${m[1]}`;
    if (!detectedClauses.includes(clauseStr)) {
      detectedClauses.push(clauseStr);
    }
  }

  // 7. Suggested Contract Classification
  let suggestedClassification = 'General Communication';
  const lower = (rawText + ' ' + fileName).toLowerCase();
  if (lower.includes('accelerat') || lower.includes('8.6') || lower.includes('rate of progress')) {
    suggestedClassification = 'Rate of Progress / Acceleration Directive';
  } else if (lower.includes('time-bar') || lower.includes('20.2') || lower.includes('28 days') || lower.includes('discharged')) {
    suggestedClassification = 'Time-Bar Disallowance Notice';
  } else if (lower.includes('variation') || lower.includes('13.3') || lower.includes('rejection') || lower.includes('4.12')) {
    suggestedClassification = 'Claim / Variation Determination';
  } else if (lower.includes('delay damage') || lower.includes('liquidated') || lower.includes('8.7')) {
    suggestedClassification = 'Notice of Delay Damages';
  } else if (lower.includes('particular condition') || lower.includes('general condition') || lower.includes('agreement')) {
    suggestedClassification = 'Contract Document / Condition';
  }

  return {
    refNumber,
    date: date || new Date().toISOString().split('T')[0],
    subject,
    sender,
    recipient,
    detectedClauses,
    suggestedClassification
  };
}

/**
 * Parses raw text extracted from a contract PDF into structured ContractClause objects,
 * mapping accurately across all pages.
 */
export function parseClausesFromContractText(
  rawText: string,
  documentId: string,
  volumeNumber: string,
  priorityRank: number = 5,
  pageList?: DocumentPage[]
): ContractClause[] {
  if (!rawText || !rawText.trim()) return [];

  const clauses: ContractClause[] = [];
  const clauseHeaderRegex = /(?:^|\n)\s*(?:(?:Sub-Clause|Clause|PC|GC|Section|Article)\s+([0-9]{1,2}(?:\.[0-9]{1,2})*|[0-9]{1,2})|([0-9]{1,2}\.[0-9]{1,2}(?:\.[0-9]{1,2})?))\s*[:\-\—\[]?\s*([^\n\r]+)/gi;

  // Helper to determine which page a character index falls on
  const getPageForIndex = (index: number): number => {
    if (!pageList || pageList.length === 0) {
      return 1;
    }
    // Calculate cumulative character boundaries for each page
    let cumulative = 0;
    for (const p of pageList) {
      cumulative += p.text.length + 30; // 30 is approximate page break header length
      if (index <= cumulative) {
        return p.pageNumber;
      }
    }
    return pageList[pageList.length - 1].pageNumber;
  };

  // Helper to classify clause category
  const categorizeClause = (title: string, content: string): ContractClause['category'] => {
    const lower = (title + ' ' + content).toLowerCase();
    if (/delay|extension of time|eot|milestone|programme|program|time for completion|8\.[1-7]|rate of progress|acceleration/.test(lower)) {
      return 'Time & EOT';
    } else if (/claim|payment|interim payment|ipc|cost|14\.[0-9]|20\.2|financing|interest|price/.test(lower)) {
      return 'Payment & Claims';
    } else if (/variation|instruct|13\.[1-8]|change|adjustment|daywork/.test(lower)) {
      return 'Variations';
    } else if (/risk|insurance|indemnity|force majeure|exceptional event|17\.[0-9]|18\.[0-9]|19\.[0-9]/.test(lower)) {
      return 'Risk & Insurance';
    } else if (/termination|default|dispute|daab|arbitration|15\.[0-9]|16\.[0-9]|21\.[0-9]/.test(lower)) {
      return 'Termination & Dispute';
    } else if (/test|inspection|defect|quality|workmanship|7\.[0-9]|11\.[0-9]/.test(lower)) {
      return 'Quality & Testing';
    }
    return 'Obligations';
  };

  const matches: { index: number; clauseNumber: string; title: string; matchText: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = clauseHeaderRegex.exec(rawText)) !== null) {
    const clauseNum = m[1] || m[2];
    const rawTitle = m[3]?.trim().replace(/[\]\[\:\-\—]+$/, '').trim() || 'General Provision';
    if (clauseNum && rawTitle && rawTitle.length < 120) {
      matches.push({
        index: m.index,
        clauseNumber: m[0].trim().startsWith('Sub-Clause') || m[0].trim().startsWith('Clause')
          ? `Sub-Clause ${clauseNum}`
          : `Clause ${clauseNum}`,
        title: rawTitle,
        matchText: m[0]
      });
    }
  }

  const coveredPages = new Set<number>();

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i + 1 < matches.length ? matches[i + 1].index : rawText.length;
      const content = rawText.slice(current.index, nextIndex).trim();
      const actualPage = getPageForIndex(current.index);
      coveredPages.add(actualPage);

      const category = categorizeClause(current.title, content);

      // Time bar detection
      let timeBarDays: number | undefined = undefined;
      let noticePeriodDays: number | undefined = undefined;
      const barMatch = content.match(/within\s+([0-9]{1,2})\s+days/i);
      if (barMatch && barMatch[1]) {
        const days = parseInt(barMatch[1], 10);
        noticePeriodDays = days;
        if (/time-bar|discharged|extinguish|barr|fails to give/i.test(content)) {
          timeBarDays = days;
        }
      }
      if (!timeBarDays && /20\.2|20\.1/i.test(current.clauseNumber)) {
        timeBarDays = 28;
        noticePeriodDays = 28;
      }

      // Interconnected clauses
      const interconnectedClauseIds: string[] = [];
      const refMatches = content.matchAll(/(?:Sub-Clause|Clause)\s*([0-9]{1,2}(?:\.[0-9]{1,2})*)/gi);
      for (const r of refMatches) {
        const found = `Sub-Clause ${r[1]}`;
        if (found !== current.clauseNumber && !interconnectedClauseIds.includes(found)) {
          interconnectedClauseIds.push(found);
        }
      }

      clauses.push({
        id: `cls-${documentId}-${i + 1}`,
        documentId,
        volumeNumber,
        pageNumber: actualPage,
        clauseNumber: current.clauseNumber,
        title: current.title,
        content: content.slice(0, 3500),
        category,
        interconnectedClauseIds,
        noticePeriodDays,
        timeBarDays,
        priorityRank
      });
    }

    // Ensure all remaining pages in pageList that had no explicit clause headers are also indexed
    if (pageList && pageList.length > 0) {
      pageList.forEach(page => {
        if (!coveredPages.has(page.pageNumber) && page.text.trim().length > 10) {
          const lines = page.text.trim().split('\n').map(l => l.trim()).filter(Boolean);
          const firstLine = lines[0] && lines[0].length < 90 ? lines[0] : `Page ${page.pageNumber} Contract Provisions`;
          clauses.push({
            id: `cls-${documentId}-pg-${page.pageNumber}`,
            documentId,
            volumeNumber,
            pageNumber: page.pageNumber,
            clauseNumber: `Page ${page.pageNumber}`,
            title: firstLine,
            content: page.text.trim().slice(0, 3500),
            category: categorizeClause(firstLine, page.text),
            interconnectedClauseIds: [],
            priorityRank
          });
        }
      });
    }
  } else if (pageList && pageList.length > 0) {
    // No regex matches found, but we have discrete pages: generate a structured clause per page
    pageList.forEach(page => {
      const lines = page.text.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const heading = lines[0] && lines[0].length < 100 ? lines[0] : `Page ${page.pageNumber} Specifications`;
      clauses.push({
        id: `cls-${documentId}-pg-${page.pageNumber}`,
        documentId,
        volumeNumber,
        pageNumber: page.pageNumber,
        clauseNumber: `Page ${page.pageNumber}`,
        title: heading,
        content: page.text.trim() || `[Page ${page.pageNumber} Content]`,
        category: categorizeClause(heading, page.text),
        interconnectedClauseIds: [],
        priorityRank
      });
    });
  } else {
    // Fallback: Segment raw text into sections by page break or double-line breaks
    const sections = rawText.split(/\n\s*---\s*Page Break(?:\s*\[Page\s*[0-9]+\])?\s*---\s*\n|\n\n\n+/).filter(s => s.trim().length > 10);
    if (sections.length > 0) {
      sections.forEach((sec, idx) => {
        const lines = sec.trim().split('\n').map(l => l.trim()).filter(Boolean);
        const heading = lines[0] && lines[0].length < 100 ? lines[0] : `Section ${idx + 1}`;
        clauses.push({
          id: `cls-${documentId}-${idx + 1}`,
          documentId,
          volumeNumber,
          pageNumber: idx + 1,
          clauseNumber: `Sec ${idx + 1}`,
          title: heading,
          content: sec.trim(),
          category: categorizeClause(heading, sec),
          interconnectedClauseIds: [],
          priorityRank
        });
      });
    } else if (rawText.trim()) {
      clauses.push({
        id: `cls-${documentId}-1`,
        documentId,
        volumeNumber,
        pageNumber: 1,
        clauseNumber: 'Sec 1.0',
        title: 'Document Provisions',
        content: rawText.trim(),
        category: 'Obligations',
        interconnectedClauseIds: [],
        priorityRank
      });
    }
  }

  // Sort clauses strictly by pageNumber ascending, then clauseNumber
  clauses.sort((a, b) => a.pageNumber - b.pageNumber);
  return clauses;
}

/**
 * Extracts plain text, metadata, and per-page structures from a PDF File or ArrayBuffer
 */
export async function extractTextFromPdf(file: File | ArrayBuffer, fileName: string = 'document.pdf'): Promise<ExtractedPdfData> {
  const bytes = file instanceof File ? file.size : file.byteLength;
  // Clone or acquire arrayBuffer safely without risking detached buffer issues
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file.slice(0);

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages || 1;
    const pageRecords: DocumentPage[] = [];

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageString = textContent.items
          .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        pageRecords.push({
          pageNumber: i,
          text: pageString || `[Page ${i} - Scanned or Visual Graphics]`
        });
      } catch (pageErr) {
        console.warn(`Warning: failed to extract text from page ${i}:`, pageErr);
        pageRecords.push({
          pageNumber: i,
          text: `[Page ${i} - Text extraction unavailable]`
        });
      }
    }

    const fullText = pageRecords
      .map(p => `--- Page Break [Page ${p.pageNumber}] ---\n\n${p.text}`)
      .join('\n\n')
      .trim();

    const totalExtractedLength = pageRecords.reduce((sum, p) => sum + (p.text.includes('[Page') ? 0 : p.text.length), 0);
    const isScannedOrEmpty = totalExtractedLength < 30;

    const extracted = extractContractLetterMetadata(fullText, fileName);

    return {
      text: fullText,
      numPages,
      pages: pageRecords,
      fileName,
      fileSizeBytes: bytes,
      fileSizeFormatted: formatFileSize(bytes),
      refNumber: extracted.refNumber,
      date: extracted.date,
      subject: extracted.subject,
      sender: extracted.sender,
      recipient: extracted.recipient,
      detectedClauses: extracted.detectedClauses,
      suggestedClassification: extracted.suggestedClassification,
      isScannedOrEmpty
    };
  } catch (err: any) {
    console.error('Error parsing PDF with pdfjsLib:', err);

    // Fallback: try raw stream string extraction for unencrypted basic PDFs
    try {
      const decoder = new TextDecoder('latin1');
      const rawStr = decoder.decode(new Uint8Array(arrayBuffer));
      
      // Determine page count via /Type /Page occurrences in PDF dictionary
      const pageTypeMatches = rawStr.match(/\/Type\s*\/Page\b/g);
      const estimatedPages = Math.max(1, pageTypeMatches ? pageTypeMatches.length : 1);

      // Look for text streams in PDF between BT and ET
      const textSnippets: string[] = [];
      const btMatches = rawStr.matchAll(/BT[\s\S]*?ET/g);
      for (const match of btMatches) {
        const tjMatches = match[0].matchAll(/\((.*?)\)\s*Tj/g);
        for (const tj of tjMatches) {
          if (tj[1] && tj[1].trim()) {
            textSnippets.push(tj[1].replace(/\\([()\\])/g, '$1'));
          }
        }
      }

      const fallbackText = textSnippets.join(' ').trim();
      const extracted = extractContractLetterMetadata(fallbackText, fileName);

      // Split fallback text across estimated pages
      const fallbackPages: DocumentPage[] = [];
      if (estimatedPages > 1 && fallbackText) {
        const chunkSize = Math.max(100, Math.ceil(fallbackText.length / estimatedPages));
        for (let p = 1; p <= estimatedPages; p++) {
          const start = (p - 1) * chunkSize;
          const chunk = fallbackText.slice(start, start + chunkSize).trim();
          fallbackPages.push({
            pageNumber: p,
            text: chunk || `[Page ${p}]`
          });
        }
      } else {
        fallbackPages.push({
          pageNumber: 1,
          text: fallbackText || `[Document: ${fileName}]`
        });
      }

      const formattedFullText = fallbackPages
        .map(p => `--- Page Break [Page ${p.pageNumber}] ---\n\n${p.text}`)
        .join('\n\n');

      return {
        text: formattedFullText,
        numPages: estimatedPages,
        pages: fallbackPages,
        fileName,
        fileSizeBytes: bytes,
        fileSizeFormatted: formatFileSize(bytes),
        refNumber: extracted.refNumber,
        date: extracted.date,
        subject: extracted.subject,
        sender: extracted.sender,
        recipient: extracted.recipient,
        detectedClauses: extracted.detectedClauses,
        suggestedClassification: extracted.suggestedClassification,
        isScannedOrEmpty: fallbackText.length < 30
      };
    } catch (fallbackErr) {
      console.error('Fallback PDF decoding failed:', fallbackErr);
      return {
        text: `[Document: ${fileName}]\n\n(PDF format could not be decoded. Please enter text manually or attach unencrypted PDF.)`,
        numPages: 1,
        pages: [{ pageNumber: 1, text: `[Document: ${fileName}]` }],
        fileName,
        fileSizeBytes: bytes,
        fileSizeFormatted: formatFileSize(bytes),
        detectedClauses: [],
        suggestedClassification: 'Contract Document',
        isScannedOrEmpty: true
      };
    }
  }
}
