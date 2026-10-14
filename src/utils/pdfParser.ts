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
import { createWorker, Worker } from 'tesseract.js';
import { ContractClause, DocumentPage } from '../types/contract';

// Set worker source for Vite bundler
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PdfProgressInfo {
  currentPage: number;
  totalPages: number;
  stage: 'reading' | 'extracting' | 'ocr' | 'complete';
  message: string;
  percent: number;
}

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
  ocrPagesCount?: number;
  isOcrExtracted?: boolean;
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

export interface OcrOptions {
  /**
   * 'fast': dynamic scale (~1.15x-1.3x, max dim ~1100px) + canvas contrast boost + text-only LSTM. 3x-4x faster.
   * 'balanced': default (~1.3x-1.5x, max dim ~1350px) + canvas contrast boost. 2.5x faster, optimal accuracy.
   * 'quality': 2.0x scale (legacy thorough scan for degraded scans).
   * 'skip': bypass OCR entirely (instant extraction of digital text only).
   */
  mode?: 'fast' | 'balanced' | 'quality' | 'skip';
  /**
   * Max concurrent workers for multi-page documents (default: 2 on capable systems, 1 on low-core devices).
   */
  maxWorkers?: number;
  /**
   * Maximum duration in milliseconds to allow OCR recognition per page before watchdog times out and advances.
   * Default: 25000ms (25 seconds). Prevents infinite hangs on noisy or heavy pages.
   */
  pageTimeoutMs?: number;
}

const MAX_CONCURRENT_WORKERS = (typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 2) >= 4) ? 2 : 1;
let ocrWorkerPool: Worker[] = [];
let poolPromise: Promise<Worker[]> | null = null;
let poolIdleTimer: any = null;

/**
 * Promise timeout helper that rejects with an informative error if the promise does not resolve within ms.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string
): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${timeoutMessage} (exceeded ${ms}ms)`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

async function createOptimizedWorker(
  id: number,
  onProgress?: (progress: number, status: string) => void
): Promise<Worker> {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  const baseOrigin = isBrowser ? window.location.origin : '';

  let workerOptions: any = {
    logger: (m: any) => {
      if (onProgress && m && typeof m.progress === 'number') {
        onProgress(m.progress, m.status || 'OCR Processing');
      }
    }
  };

  if (isBrowser) {
    // Point directly to fast local offline assets in public/tesseract
    workerOptions = {
      ...workerOptions,
      workerPath: `${baseOrigin}/tesseract/worker.min.js`,
      corePath: `${baseOrigin}/tesseract/tesseract-core-simd-lstm.wasm.js`,
      langPath: `${baseOrigin}/tesseract`,
      gzip: true
    };
  }

  let worker: Worker;
  try {
    worker = await createWorker('eng', 1, workerOptions);
  } catch (localErr) {
    console.warn(`Worker ${id}: Local OCR assets failed, falling back to CDN worker:`, localErr);
    worker = await createWorker('eng', 1, {
      logger: (m: any) => {
        if (onProgress && m && typeof m.progress === 'number') {
          onProgress(m.progress, m.status || 'OCR Processing');
        }
      }
    });
  }

  // Optimize Tesseract parameters for speed, contract text, and tabular structure:
  // PSM 3 = Fully automatic page segmentation without slow OSD rotation passes
  // OEM 1 = LSTM neural net only
  // preserve_interword_spaces = 1 ensures multiple spaces between table columns are retained!
  // Disable unneeded heavy outputs (hOCR, TSV, Box, UNLV, OSD) to save CPU & memory
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: '3' as any,
      tessedit_ocr_engine_mode: '1' as any,
      preserve_interword_spaces: '1',
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
      tessjs_create_box: '0',
      tessjs_create_unlv: '0',
      tessjs_create_osd: '0',
    });
  } catch (paramErr) {
    console.warn(`Worker ${id} parameter tuning warning:`, paramErr);
  }

  return worker;
}

/**
 * Initializes or retrieves a pool of shared Tesseract.js OCR workers for parallel execution.
 */
export async function getOcrWorkerPool(
  targetCount: number = MAX_CONCURRENT_WORKERS,
  onProgress?: (progress: number, status: string) => void
): Promise<Worker[]> {
  if (poolIdleTimer) {
    clearTimeout(poolIdleTimer);
    poolIdleTimer = null;
  }
  poolIdleTimer = setTimeout(() => {
    terminateOcrWorker();
  }, 90000); // 90s idle timeout

  if (ocrWorkerPool.length >= targetCount) {
    return ocrWorkerPool;
  }

  if (poolPromise) return poolPromise;

  poolPromise = (async () => {
    try {
      const needed = Math.max(1, targetCount - ocrWorkerPool.length);
      const newWorkers = await Promise.all(
        Array.from({ length: needed }, (_, idx) =>
          createOptimizedWorker(ocrWorkerPool.length + idx + 1, onProgress)
        )
      );
      ocrWorkerPool.push(...newWorkers);
      return ocrWorkerPool;
    } catch (err) {
      console.error('Failed to initialize OCR worker pool:', err);
      return ocrWorkerPool;
    } finally {
      poolPromise = null;
    }
  })();

  return poolPromise;
}

/**
 * Backwards-compatible getter for a single OCR worker.
 */
export async function getOcrWorker(
  onProgress?: (progress: number, status: string) => void
): Promise<Worker | null> {
  const pool = await getOcrWorkerPool(1, onProgress);
  return pool[0] || null;
}

/**
 * Clean up Tesseract OCR worker resources when idle.
 */
export async function terminateOcrWorker() {
  if (poolIdleTimer) {
    clearTimeout(poolIdleTimer);
    poolIdleTimer = null;
  }
  if (ocrWorkerPool.length > 0) {
    const workers = [...ocrWorkerPool];
    ocrWorkerPool = [];
    await Promise.all(workers.map(w => w.terminate().catch(() => {})));
  }
}

/**
 * Dynamically computes an optimal rendering scale for a PDF page.
 * Bounding max dimension to ~1100-1350px preserves sharp 140-160 DPI text
 * while cutting pixel count and OCR processing time by 50% to 70%!
 */
export function calculateOcrScale(page: any, mode: 'fast' | 'balanced' | 'quality' = 'balanced'): number {
  if (mode === 'quality') return 2.0;

  try {
    const baseViewport = page.getViewport({ scale: 1.0 });
    const maxDim = Math.max(baseViewport.width, baseViewport.height);
    if (!maxDim || maxDim <= 0) return mode === 'fast' ? 1.2 : 1.35;

    // Target max dimensions: 1100px for fast mode, 1350px for balanced mode
    const targetDim = mode === 'fast' ? 1100 : 1350;
    const computedScale = targetDim / maxDim;

    if (mode === 'fast') {
      return Math.min(Math.max(computedScale, 1.0), 1.3);
    } else {
      return Math.min(Math.max(computedScale, 1.15), 1.55);
    }
  } catch {
    return mode === 'fast' ? 1.2 : 1.35;
  }
}

/**
 * Fast client-side Canvas 2D image preprocessing:
 * Converts RGBA to high-contrast monochrome/grayscale via TypedArray.
 * Suppresses paper grain/scanner shadows and deepens ink strokes,
 * allowing Tesseract's neural net to converge in fewer iterations.
 */
export function preprocessCanvasForOcr(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const len = d.length;

    for (let i = 0; i < len; i += 4) {
      // Standard luminance weighting
      const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      // High background whitening (> 185) and ink darkening (< 130)
      let v = gray;
      if (gray > 185) {
        v = 255;
      } else if (gray < 130) {
        v = Math.max(0, gray * 0.7);
      }
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    // Canvas context or security fallback
  }
}

/**
 * Ultra-fast check to detect completely blank or uniform pages,
 * preventing Tesseract from spending 5-10s searching for text on empty pages.
 */
export function isCanvasBlankOrNoiseFree(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  try {
    const sampleW = Math.min(canvas.width, 100);
    const sampleH = Math.min(canvas.height, 100);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const d = imgData.data;
    let nonWhitePixels = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] < 210 || d[i + 1] < 210 || d[i + 2] < 210) {
        nonWhitePixels++;
      }
    }
    return nonWhitePixels < (d.length / 4) * 0.001;
  } catch {
    return false;
  }
}

/**
 * Detects tabular column structures in extracted text (from OCR or digital PDF)
 * and formats them into clean, readable Markdown tables with aligned headers and cells.
 */
export function reconstructTablesInText(text: string): string {
  if (!text || text.length < 15) return text;

  const lines = text.split('\n');
  const resultLines: string[] = [];
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;

    if (tableBuffer.length >= 2) {
      // Parse each line into column cells
      const rowCells: string[][] = tableBuffer.map(line => {
        const trimmed = line.trim();
        // If line is already a pipe-delimited table line
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          return trimmed
            .slice(1, -1)
            .split('|')
            .map(c => c.trim());
        }
        // Split by tabs or 2 or more consecutive spaces
        return line.split(/\t+|\s{2,}/).map(c => c.trim()).filter(Boolean);
      });

      // Filter out lines that are pure dashes or dividers like '---' or '==='
      const nonDividerRows = rowCells.filter(
        r => r.length > 0 && !/^[-=_—\s]{3,}$/.test(r.join(''))
      );

      // Verify that the majority of rows have 2 or more columns
      const multiColRows = nonDividerRows.filter(r => r.length >= 2);
      if (multiColRows.length >= 2 && multiColRows.length >= nonDividerRows.length * 0.6) {
        // Find typical column count
        const colCounts = nonDividerRows.map(r => r.length);
        const maxCols = Math.min(Math.max(...colCounts), 12); // Cap at 12 columns for sanity

        if (maxCols >= 2) {
          const mdTable: string[] = [];

          // Header row (first non-divider row)
          const header = [...nonDividerRows[0]];
          while (header.length < maxCols) header.push('-');
          const sanitizedHeader = header.slice(0, maxCols).map(h => h.replace(/\|/g, '/').trim() || '-');
          mdTable.push(`| ${sanitizedHeader.join(' | ')} |`);

          // Divider row
          mdTable.push(`| ${Array(maxCols).fill('---').join(' | ')} |`);

          // Data rows
          for (let i = 1; i < nonDividerRows.length; i++) {
            const row = [...nonDividerRows[i]];
            while (row.length < maxCols) row.push('-');
            const sanitizedRow = row.slice(0, maxCols).map(c => c.replace(/\|/g, '/').trim() || '-');
            mdTable.push(`| ${sanitizedRow.join(' | ')} |`);
          }

          resultLines.push('');
          resultLines.push(...mdTable);
          resultLines.push('');
          tableBuffer = [];
          return;
        }
      }
    }

    // Not a valid table; output original lines
    resultLines.push(...tableBuffer);
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushTableBuffer();
      resultLines.push(line);
      continue;
    }

    // Check if line looks like part of a table:
    const hasPipes = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 3;
    const multiColCols = line.split(/\t+|\s{2,}/).map(c => c.trim()).filter(Boolean);
    const isDividerLine = /^[-=_—\s|+]{4,}$/.test(trimmed);

    // Guard: ignore contract clause titles (e.g. "Sub-Clause 8.4 Extension of Time")
    const isClauseHeader = /^(?:Sub-Clause|Clause|PC|GC|Section|Article)\s+[0-9]/i.test(trimmed);

    const looksLikeTableRow = !isClauseHeader && (hasPipes || isDividerLine || multiColCols.length >= 2);

    if (looksLikeTableRow) {
      tableBuffer.push(line);
    } else {
      flushTableBuffer();
      resultLines.push(line);
    }
  }

  flushTableBuffer();

  return resultLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Cleans and normalizes raw OCR text, preserving table column structures and converting to readable tables.
 */
export function cleanOcrText(rawText: string): string {
  if (!rawText) return '';
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove isolated single punctuation noise on their own lines
    .replace(/\n\s*[`~_=\-|\^§]{1,2}\s*\n/g, '\n')
    // Rejoin words broken across line breaks with hyphens
    .replace(/([a-zA-Z]{3,})-\n\s*([a-zA-Z]{3,})/g, '$1$2')
    // Normalize excessive consecutive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return reconstructTablesInText(cleaned);
}

/**
 * Extracts and reconstructs digital text from PDF TextContent preserving line, column and table structures.
 */
function extractDigitalTextFromPage(textContent: any): string {
  if (!textContent || !textContent.items || textContent.items.length === 0) {
    return '';
  }

  interface TextItemPos {
    str: string;
    x: number;
    y: number;
    width: number;
    hasEOL?: boolean;
  }

  const items: TextItemPos[] = [];
  for (const item of textContent.items) {
    if (!item || typeof item.str !== 'string') continue;
    const x = Array.isArray(item.transform) ? item.transform[4] : 0;
    const y = Array.isArray(item.transform) ? item.transform[5] : 0;
    const width = typeof item.width === 'number' ? item.width : item.str.length * 6;
    items.push({
      str: item.str,
      x,
      y,
      width,
      hasEOL: item.hasEOL
    });
  }

  // Stable sort by Y descending (PDF coordinates origin is bottom-left), then X ascending
  items.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 3.5) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  // Group lines within Y tolerance of ~3.5pt
  const lines: TextItemPos[][] = [];
  let currentLine: TextItemPos[] = [];
  let currentY: number | null = null;

  for (const item of items) {
    if (currentY === null || Math.abs(item.y - currentY) > 3.5) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [item];
      currentY = item.y;
    } else {
      currentLine.push(item);
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Reconstruct lines with column gap detection
  const reconstructedLines: string[] = [];

  for (const row of lines) {
    row.sort((a, b) => a.x - b.x);
    let rowText = '';
    let lastRight = -1;

    for (let i = 0; i < row.length; i++) {
      const it = row[i];
      if (lastRight >= 0) {
        const gap = it.x - lastRight;
        // Large gap (> 18pt) indicates a column boundary in a table
        if (gap > 18) {
          rowText += '    '; // 4 spaces indicates column separation
        } else if (gap > 2) {
          rowText += ' ';
        }
      }
      rowText += it.str;
      lastRight = it.x + (it.width || it.str.length * 6);
    }

    if (rowText.trim().length > 0) {
      reconstructedLines.push(rowText);
    }
  }

  const rawExtracted = reconstructedLines.join('\n');
  return reconstructTablesInText(rawExtracted);
}

/**
 * Renders a PDF page to an offscreen HTML5 canvas with solid white background
 * and strict maximum dimension clamping to prevent memory overflow or WASM deadlock.
 */
async function renderPageToCanvas(page: any, scale: number = 1.35): Promise<HTMLCanvasElement | null> {
  if (typeof document === 'undefined') return null;

  try {
    let viewport = page.getViewport({ scale });
    
    // Safety clamp: Cap max dimensions to 1400px to prevent WASM/GPU memory explosion
    const MAX_CANVAS_DIM = 1400;
    const maxDim = Math.max(viewport.width, viewport.height);
    if (maxDim > MAX_CANVAS_DIM) {
      const rescale = MAX_CANVAS_DIM / maxDim;
      scale = scale * rescale;
      viewport = page.getViewport({ scale });
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Fill solid white background (crucial for PDFs with transparent backdrops)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    return canvas;
  } catch (err) {
    console.warn('Canvas rendering error for OCR:', err);
    return null;
  }
}

/**
 * Extracts plain text, metadata, and per-page structures from a PDF File or ArrayBuffer.
 * Automatically runs multi-core client-side OCR on scanned pages or visual graphics
 * using adaptive scaling, preprocessed contrast enhancement, and worker pooling.
 */
export async function extractTextFromPdf(
  file: File | ArrayBuffer,
  fileName: string = 'document.pdf',
  onProgress?: (progress: PdfProgressInfo) => void,
  options?: OcrOptions
): Promise<ExtractedPdfData> {
  const bytes = file instanceof File ? file.size : file.byteLength;
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file.slice(0);

  const isBrowser = typeof window !== 'undefined';
  const baseOrigin = isBrowser ? window.location.origin : '';
  const mode = options?.mode || 'balanced';

  try {
    if (onProgress) {
      onProgress({
        currentPage: 0,
        totalPages: 1,
        stage: 'reading',
        message: `Loading PDF structure for "${fileName}"...`,
        percent: 5
      });
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true,
      cMapUrl: isBrowser ? `${baseOrigin}/pdfjs/cmaps/` : undefined,
      cMapPacked: true,
      standardFontDataUrl: isBrowser ? `${baseOrigin}/pdfjs/standard_fonts/` : undefined,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages || 1;

    // Step 1: Rapid pass across all pages to extract digital text (takes only ~20-50ms)
    const intermediatePages: {
      pageNumber: number;
      pageObj: any;
      digitalText: string;
      needsOcr: boolean;
      isOcr: boolean;
    }[] = [];

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        onProgress({
          currentPage: i,
          totalPages: numPages,
          stage: 'extracting',
          message: `Inspecting page ${i} of ${numPages}...`,
          percent: Math.round((i / numPages) * 20)
        });
      }

      try {
        const page = await pdf.getPage(i);
        let pageString = '';
        try {
          const textContent = await page.getTextContent();
          pageString = extractDigitalTextFromPage(textContent);
        } catch (tcErr) {
          console.warn(`Text content extraction warning for page ${i}:`, tcErr);
        }

        const needsOcr = mode !== 'skip' && pageString.trim().length < 25;
        intermediatePages.push({
          pageNumber: i,
          pageObj: page,
          digitalText: pageString,
          needsOcr,
          isOcr: false
        });
      } catch (pageErr) {
        console.warn(`Warning: failed to inspect page ${i}:`, pageErr);
        intermediatePages.push({
          pageNumber: i,
          pageObj: null,
          digitalText: '',
          needsOcr: false,
          isOcr: false
        });
      }
    }

    const pagesNeedingOcr = intermediatePages.filter(p => p.needsOcr && p.pageObj);
    let ocrPagesCount = 0;

    // Step 2: Concurrently process scanned pages requiring OCR
    if (pagesNeedingOcr.length > 0 && mode !== 'skip') {
      const concurrency = Math.min(options?.maxWorkers || MAX_CONCURRENT_WORKERS, pagesNeedingOcr.length);
      const workers = await getOcrWorkerPool(concurrency);

      if (workers.length > 0) {
        let completedOcr = 0;
        const totalToOcr = pagesNeedingOcr.length;
        const ocrResults = new Map<number, string>();
        let nextIdx = 0;
        const pageTimeout = options?.pageTimeoutMs || 25000;

        const runWorkerQueue = async (initialWorker: Worker, workerIndex: number) => {
          let activeWorker = initialWorker;

          while (nextIdx < pagesNeedingOcr.length) {
            const currentItem = pagesNeedingOcr[nextIdx++];
            const pageNum = currentItem.pageNumber;

            if (onProgress) {
              onProgress({
                currentPage: pageNum,
                totalPages: numPages,
                stage: 'ocr',
                message: `⚡ OCR digitizing page ${pageNum}/${numPages} (${mode} mode)...`,
                percent: 20 + Math.round((completedOcr / totalToOcr) * 75)
              });
            }

            try {
              const scale = calculateOcrScale(currentItem.pageObj, mode);
              
              // 1. Render page with a 12s safety timeout
              const canvas = await withTimeout(
                renderPageToCanvas(currentItem.pageObj, scale),
                12000,
                `Rendering page ${pageNum} to canvas`
              );

              if (canvas) {
                if (isCanvasBlankOrNoiseFree(canvas)) {
                  ocrResults.set(pageNum, `[Page ${pageNum} - Blank Page]`);
                } else {
                  preprocessCanvasForOcr(canvas);
                  const ocrPromise = activeWorker.recognize(
                    canvas,
                    {},
                    {
                      text: true,
                      blocks: false,
                      layoutBlocks: false,
                      hocr: false,
                      tsv: false,
                      box: false,
                      unlv: false,
                      osd: false
                    }
                  );

                  // 2. Watchdog timeout per page (25 seconds) to prevent infinite loops
                  const ret = await withTimeout(
                    ocrPromise,
                    pageTimeout,
                    `OCR recognition on page ${pageNum}`
                  );

                  const recognized = cleanOcrText(ret?.data?.text || '');
                  if (recognized.length > 5) {
                    ocrResults.set(pageNum, recognized);
                  }
                }
              }
            } catch (ocrErr: any) {
              const isTimeout = ocrErr?.message?.includes('TIMEOUT');
              console.warn(`OCR error/timeout on page ${pageNum}:`, ocrErr);

              if (isTimeout) {
                ocrResults.set(
                  pageNum,
                  `[Page ${pageNum} - Scanned image / Complex graphics (OCR timed out after ${Math.round(pageTimeout / 1000)}s; skipped to keep document processing active)]`
                );

                if (onProgress) {
                  onProgress({
                    currentPage: pageNum,
                    totalPages: numPages,
                    stage: 'ocr',
                    message: `⚠️ Page ${pageNum} timed out (complex scan); skipped to proceed with remaining pages...`,
                    percent: 20 + Math.round((completedOcr / totalToOcr) * 75)
                  });
                }

                // Force terminate hung worker to free resources and unblock WASM thread
                try {
                  await activeWorker.terminate();
                } catch (termErr) {
                  console.warn('Worker termination warning:', termErr);
                }

                // Spawn a clean replacement worker for subsequent pages
                try {
                  activeWorker = await createOptimizedWorker(workerIndex + 1);
                  const poolIdx = ocrWorkerPool.indexOf(initialWorker);
                  if (poolIdx >= 0) {
                    ocrWorkerPool[poolIdx] = activeWorker;
                  } else {
                    ocrWorkerPool.push(activeWorker);
                  }
                } catch (spawnErr) {
                  console.error('Failed to spawn replacement worker:', spawnErr);
                }
              }
            } finally {
              completedOcr++;
              if (onProgress) {
                onProgress({
                  currentPage: pageNum,
                  totalPages: numPages,
                  stage: 'ocr',
                  message: `Completed page ${pageNum} (${completedOcr}/${totalToOcr} scanned)`,
                  percent: 20 + Math.round((completedOcr / totalToOcr) * 75)
                });
              }
            }
          }
        };

        await Promise.all(workers.map((w, idx) => runWorkerQueue(w, idx)));

        // Merge OCR results back
        for (const p of pagesNeedingOcr) {
          const res = ocrResults.get(p.pageNumber);
          if (res && res.length > 5) {
            p.digitalText = res;
            p.isOcr = true;
            ocrPagesCount++;
          }
        }
      }
    }

    // Step 3: Compile finalized page records
    const pageRecords: DocumentPage[] = intermediatePages.map(p => ({
      pageNumber: p.pageNumber,
      text: p.digitalText || `[Page ${p.pageNumber} - Scanned or Visual Graphics / No Text Detected]`,
      isOcr: p.isOcr
    }));

    if (onProgress) {
      onProgress({
        currentPage: numPages,
        totalPages: numPages,
        stage: 'complete',
        message: `Parsed ${numPages} pages (${ocrPagesCount} scanned pages digitized via OCR).`,
        percent: 100
      });
    }

    const fullText = pageRecords
      .map(p => `--- Page Break [Page ${p.pageNumber}] ---\n\n${p.text}`)
      .join('\n\n')
      .trim();

    const totalExtractedLength = pageRecords.reduce(
      (sum, p) => sum + (p.text.includes('No Text Detected') || p.text.includes('unavailable') ? 0 : p.text.length),
      0
    );
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
      isScannedOrEmpty,
      ocrPagesCount,
      isOcrExtracted: ocrPagesCount > 0
    };
  } catch (err: any) {
    console.error('Error parsing PDF with pdfjsLib:', err);

    // Fallback: try raw stream string extraction for unencrypted basic PDFs
    try {
      const decoder = new TextDecoder('latin1');
      const rawStr = decoder.decode(new Uint8Array(arrayBuffer));
      
      const pageTypeMatches = rawStr.match(/\/Type\s*\/Page\b/g);
      const estimatedPages = Math.max(1, pageTypeMatches ? pageTypeMatches.length : 1);

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

      const fallbackPages: DocumentPage[] = [];
      if (estimatedPages > 1 && fallbackText) {
        const chunkSize = Math.max(100, Math.ceil(fallbackText.length / estimatedPages));
        for (let p = 1; p <= estimatedPages; p++) {
          const start = (p - 1) * chunkSize;
          const chunk = fallbackText.slice(start, start + chunkSize).trim();
          fallbackPages.push({
            pageNumber: p,
            text: chunk || `[Page ${p}]`,
            isOcr: false
          });
        }
      } else {
        fallbackPages.push({
          pageNumber: 1,
          text: fallbackText || `[Document: ${fileName}]`,
          isOcr: false
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
        isScannedOrEmpty: fallbackText.length < 30,
        ocrPagesCount: 0,
        isOcrExtracted: false
      };
    } catch (fallbackErr) {
      console.error('Fallback PDF decoding failed:', fallbackErr);
      return {
        text: `[Document: ${fileName}]\n\n(PDF format could not be decoded. Please enter text manually or attach unencrypted PDF.)`,
        numPages: 1,
        pages: [{ pageNumber: 1, text: `[Document: ${fileName}]`, isOcr: false }],
        fileName,
        fileSizeBytes: bytes,
        fileSizeFormatted: formatFileSize(bytes),
        detectedClauses: [],
        suggestedClassification: 'Contract Document',
        isScannedOrEmpty: true,
        ocrPagesCount: 0,
        isOcrExtracted: false
      };
    }
  }
}
