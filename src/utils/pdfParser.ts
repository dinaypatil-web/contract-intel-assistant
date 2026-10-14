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
  images?: string[]; // Extracted contract images, drawings, site photos, stamps
}

export function isImageFile(fileOrName: File | string | null | undefined): boolean {
  if (!fileOrName) return false;
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name || '';
  const type = typeof fileOrName === 'object' && fileOrName.type ? fileOrName.type : '';
  return type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff|svg|gif)$/i.test(name);
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
 * Target resolution of ~180-220 DPI (height ~2000-2400px) ensures
 * character x-height is 25-35px, which is the optimal range for Tesseract LSTM neural nets.
 */
export function calculateOcrScale(page: any, mode: 'fast' | 'balanced' | 'quality' = 'balanced'): number {
  try {
    const baseViewport = page.getViewport({ scale: 1.0 });
    const maxDim = Math.max(baseViewport.width, baseViewport.height);
    if (!maxDim || maxDim <= 0) return 2.25;

    // Minimum 180-220 DPI for reliable Tesseract LSTM text recognition
    // A4 (842pt) scaled by 2.25x = ~1894px (~165-180 DPI)
    const targetDim = mode === 'quality' ? 2600 : mode === 'fast' ? 1750 : 2200;
    const computedScale = targetDim / maxDim;

    return Math.min(Math.max(computedScale, 1.8), 2.8);
  } catch {
    return 2.25;
  }
}

/**
 * Fast client-side Canvas 2D image preprocessing:
 * Converts RGBA to uniform grayscale while preserving anti-aliased font edges.
 * Avoids destructive hard-thresholding which breaks thin letters, serifs, and table lines.
 * Tesseract's internal Leptonica engine automatically applies local adaptive Otsu/Sauvola thresholding.
 */
export function preprocessCanvasForOcr(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const len = d.length;

    for (let i = 0; i < len; i += 4) {
      const gray = Math.round(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
      d[i] = gray;
      d[i + 1] = gray;
      d[i + 2] = gray;
    }
    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Canvas context fallback
  }
}

/**
 * Checks if a page is truly blank by sampling the interior content area (avoiding margins).
 */
export function isCanvasBlankOrNoiseFree(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  try {
    const width = canvas.width;
    const height = canvas.height;
    if (width <= 0 || height <= 0) return true;

    // Sample across the entire page body (5% to 95% width and height to skip scan margins)
    const step = 16;
    let nonWhitePixels = 0;
    const minX = Math.floor(width * 0.05);
    const maxX = Math.floor(width * 0.95);
    const minY = Math.floor(height * 0.05);
    const maxY = Math.floor(height * 0.95);

    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    for (let y = minY; y < maxY; y += step) {
      const rowOffset = y * width * 4;
      for (let x = minX; x < maxX; x += step) {
        const idx = rowOffset + x * 4;
        // Check if pixel is darker than off-white page background (< 215 in any channel)
        if (d[idx] < 215 || d[idx + 1] < 215 || d[idx + 2] < 215) {
          nonWhitePixels++;
          // Early exit: as soon as we detect even 20 text pixels, the page is definitely NOT blank
          if (nonWhitePixels > 20) {
            return false;
          }
        }
      }
    }

    // Only blank if virtually no text/content pixels were found across the whole page body
    return nonWhitePixels <= 3;
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

  const isTableRow = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // 1. Explicit Markdown / pipe row: | col1 | col2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 3) {
      return true;
    }

    // 2. Divider line like |---|---| or -------
    if (/^[-=_—\s|+]{4,}$/.test(trimmed)) {
      return true;
    }

    // 3. Clause headers should NEVER be treated as table lines
    if (/^(?:Sub-Clause|Clause|PC|GC|Section|Article)\s+[0-9]/i.test(trimmed)) {
      return false;
    }

    // 4. Tab-separated lines
    if (trimmed.includes('\t')) {
      const tabCols = trimmed.split('\t').map(c => c.trim()).filter(Boolean);
      return tabCols.length >= 2;
    }

    // 5. Multi-column lines with 3+ distinct spaces separating cells
    const cols = trimmed.split(/\s{3,}/).map(c => c.trim()).filter(Boolean);
    if (cols.length >= 3) {
      return true;
    }

    // 6. 2 columns: only if cells are short tabular entries (< 45 chars) and NOT narrative sentences
    if (cols.length === 2) {
      const isShort = cols[0].length < 45 && cols[1].length < 45;
      const isNotSentence = !/[.!?]$/.test(cols[0]) && !/[a-z]{4,}\s+[a-z]{4,}\s+[a-z]{4,}\s+[a-z]{4,}/i.test(cols[0]);
      return isShort && isNotSentence;
    }

    return false;
  };

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;

    if (tableBuffer.length >= 2) {
      const rowCells: string[][] = tableBuffer.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          return trimmed
            .slice(1, -1)
            .split('|')
            .map(c => c.trim());
        }
        if (line.includes('\t')) {
          return line.split('\t').map(c => c.trim()).filter(Boolean);
        }
        return line.split(/\s{3,}/).map(c => c.trim()).filter(Boolean);
      });

      const nonDividerRows = rowCells.filter(
        r => r.length > 0 && !/^[-=_—\s]{3,}$/.test(r.join(''))
      );

      const multiColRows = nonDividerRows.filter(r => r.length >= 2);
      if (multiColRows.length >= 2 && multiColRows.length >= nonDividerRows.length * 0.6) {
        const colCounts = nonDividerRows.map(r => r.length);
        const maxCols = Math.min(Math.max(...colCounts), 12);

        if (maxCols >= 2) {
          const mdTable: string[] = [];

          // Header
          const header = [...nonDividerRows[0]];
          while (header.length < maxCols) header.push('-');
          const sanitizedHeader = header.slice(0, maxCols).map(h => h.replace(/\|/g, '/').trim() || '-');
          mdTable.push(`| ${sanitizedHeader.join(' | ')} |`);
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

    resultLines.push(...tableBuffer);
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isTableRow(line)) {
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
    // Rejoin words broken across line breaks with hyphens (only when continuation is lowercase)
    .replace(/([a-zA-Z]{2,})-\n\s*([a-z]{2,})/g, '$1$2')
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
  }

  const items: TextItemPos[] = [];
  for (const item of textContent.items) {
    if (!item || typeof item.str !== 'string') continue;
    const x = Array.isArray(item.transform) ? item.transform[4] : 0;
    const y = Array.isArray(item.transform) ? item.transform[5] : 0;
    const width = typeof item.width === 'number' ? item.width : item.str.length * 6;
    items.push({ str: item.str, x, y, width });
  }

  // Sort strictly by Y descending (PDF coordinates origin is bottom)
  items.sort((a, b) => b.y - a.y);

  // Group items into rows based on baseline Y
  const lines: TextItemPos[][] = [];
  for (const item of items) {
    let placed = false;
    for (const line of lines) {
      if (Math.abs(line[0].y - item.y) <= 4.0) {
        line.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lines.push([item]);
    }
  }

  // Sort rows from top to bottom
  lines.sort((a, b) => b[0].y - a[0].y);

  // Reconstruct lines left to right with column gap detection
  const reconstructedLines: string[] = [];
  for (const row of lines) {
    row.sort((a, b) => a.x - b.x);
    let rowText = '';
    let lastRight = -1;

    for (let i = 0; i < row.length; i++) {
      const it = row[i];
      if (lastRight >= 0) {
        const gap = it.x - lastRight;
        if (gap > 20) {
          rowText += '    '; // column separation
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
    
    // Safety clamp: Cap max dimensions to 2400px to allow high resolution while guarding memory
    const MAX_CANVAS_DIM = 2400;
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
 * Extracts embedded images and drawings from a PDF page using PDF.js operator list
 * and object cache, with size thresholding to ignore tiny spacer/bullet pixels.
 */
export async function extractImagesFromPdfPage(
  page: any,
  maxImages: number = 2
): Promise<string[]> {
  const images: string[] = [];
  if (typeof document === 'undefined' || !page) return images;

  try {
    const ops = await page.getOperatorList();
    if (!ops || !ops.fnArray || !ops.argsArray) return images;

    const { fnArray, argsArray } = ops;
    const imgObjIds: string[] = [];

    const OPS = (pdfjsLib as any).OPS || {};
    const paintImageOps = [
      OPS.paintImageXObject,
      OPS.paintInlineImageXObject,
      OPS.paintImageMaskXObject
    ].filter(Boolean);

    for (let i = 0; i < fnArray.length; i++) {
      if (paintImageOps.includes(fnArray[i])) {
        const arg = argsArray[i]?.[0];
        if (typeof arg === 'string' && !imgObjIds.includes(arg)) {
          imgObjIds.push(arg);
          if (imgObjIds.length >= maxImages) break;
        }
      }
    }

    for (const objId of imgObjIds) {
      try {
        const imgObj = await new Promise<any>((resolve) => {
          try {
            if (page.objs && typeof page.objs.has === 'function' && page.objs.has(objId)) {
              resolve(page.objs.get(objId));
            } else if (page.objs && typeof page.objs.get === 'function') {
              const timer = setTimeout(() => resolve(null), 1200);
              page.objs.get(objId, (resolvedObj: any) => {
                clearTimeout(timer);
                resolve(resolvedObj);
              });
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });

        if (!imgObj) continue;

        const width = imgObj.width;
        const height = imgObj.height;
        // Ignore tiny bullet points, lines, or spacer pixels (< 70px)
        if (!width || !height || width < 70 || height < 70) continue;

        const maxCanvasDim = 1200;
        const cScale = Math.min(1, maxCanvasDim / Math.max(width, height));
        const outW = Math.max(1, Math.floor(width * cScale));
        const outH = Math.max(1, Math.floor(height * cScale));

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        if (imgObj.bitmap && typeof ctx.drawImage === 'function') {
          ctx.drawImage(imgObj.bitmap, 0, 0, outW, outH);
          images.push(canvas.toDataURL('image/jpeg', 0.82));
        } else if (imgObj.data) {
          const rawData = imgObj.data;
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) continue;

          const imgData = tempCtx.createImageData(width, height);
          if (rawData.length === width * height * 4) {
            imgData.data.set(rawData);
          } else if (rawData.length === width * height * 3) {
            let s = 0;
            let d = 0;
            for (let p = 0; p < width * height; p++) {
              imgData.data[d] = rawData[s];
              imgData.data[d + 1] = rawData[s + 1];
              imgData.data[d + 2] = rawData[s + 2];
              imgData.data[d + 3] = 255;
              s += 3;
              d += 4;
            }
          } else if (rawData.length === width * height) {
            // Grayscale
            let d = 0;
            for (let p = 0; p < width * height; p++) {
              const val = rawData[p];
              imgData.data[d] = val;
              imgData.data[d + 1] = val;
              imgData.data[d + 2] = val;
              imgData.data[d + 3] = 255;
              d += 4;
            }
          }

          tempCtx.putImageData(imgData, 0, 0);
          ctx.drawImage(tempCanvas, 0, 0, outW, outH);
          images.push(canvas.toDataURL('image/jpeg', 0.82));
        }
      } catch (imgErr) {
        console.warn(`Could not extract image object ${objId}:`, imgErr);
      }
    }
  } catch (err) {
    console.warn('PDF image extraction notice:', err);
  }

  return images;
}

/**
 * Extracts and recognizes text, tables, and visual structure directly from an Image contract file
 * (.png, .jpg, .jpeg, .webp, .bmp, etc.) using client-side OCR and neural text recognition.
 */
export async function extractTextAndImagesFromImageFile(
  file: File | ArrayBuffer,
  fileName: string = 'image.png',
  onProgress?: (progress: PdfProgressInfo) => void,
  options?: OcrOptions
): Promise<ExtractedPdfData> {
  const bytes = file instanceof File ? file.size : file.byteLength;
  const mode = options?.mode || 'balanced';

  if (onProgress) {
    onProgress({
      currentPage: 1,
      totalPages: 1,
      stage: 'reading',
      message: `Reading contract image "${fileName}"...`,
      percent: 15
    });
  }

  // Convert File / ArrayBuffer to data URL
  let dataUrl = '';
  if (file instanceof File) {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } else {
    const blob = new Blob([file]);
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Decode into Image element
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to decode image file "${fileName}"`));
    img.src = dataUrl;
  });

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Scale image to optimal DPI dimensions (~2000-2400px) for Tesseract LSTM text recognition
  const maxDim = Math.max(origWidth, origHeight);
  const targetDim = mode === 'quality' ? 2600 : mode === 'fast' ? 1750 : 2200;
  const scale = maxDim > 0 && maxDim < targetDim ? targetDim / maxDim : 1.0;

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(origWidth * scale);
  canvas.height = Math.floor(origHeight * scale);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    preprocessCanvasForOcr(canvas);
  }

  if (onProgress) {
    onProgress({
      currentPage: 1,
      totalPages: 1,
      stage: 'ocr',
      message: `⚡ OCR recognizing contract text and tables from image...`,
      percent: 45
    });
  }

  let recognizedText = '';
  if (mode !== 'skip') {
    try {
      const workers = await getOcrWorkerPool(1);
      if (workers.length > 0) {
        const ocrPromise = workers[0].recognize(
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
        const ret = await withTimeout(
          ocrPromise,
          options?.pageTimeoutMs || 30000,
          `OCR recognition on image "${fileName}"`
        );
        recognizedText = cleanOcrText(ret?.data?.text || '');
      }
    } catch (ocrErr) {
      console.warn(`OCR error on image file "${fileName}":`, ocrErr);
    }
  }

  // Create compressed preview thumbnail dataUrl
  let previewDataUrl = dataUrl;
  if (dataUrl.length > 2500000 || canvas.width > 1600) {
    const previewCanvas = document.createElement('canvas');
    const pScale = Math.min(1.0, 1400 / Math.max(origWidth, origHeight));
    previewCanvas.width = Math.floor(origWidth * pScale);
    previewCanvas.height = Math.floor(origHeight * pScale);
    const pCtx = previewCanvas.getContext('2d');
    if (pCtx) {
      pCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
      previewDataUrl = previewCanvas.toDataURL('image/jpeg', 0.85);
    }
  }

  const lower = fileName.toLowerCase();
  const extracted = extractContractLetterMetadata(recognizedText, fileName);

  let suggestedClassification = extracted.suggestedClassification;
  if (
    lower.includes('draw') ||
    lower.includes('site') ||
    lower.includes('plan') ||
    lower.includes('gad') ||
    lower.includes('layout') ||
    lower.includes('schematic') ||
    lower.includes('photo')
  ) {
    suggestedClassification = 'Drawings';
  }

  const pageText = recognizedText || `[Image: ${fileName} - Visual Contract Document / Drawing (${origWidth}x${origHeight}px)]`;
  const pageRecord: DocumentPage = {
    pageNumber: 1,
    text: pageText,
    isOcr: true,
    images: [previewDataUrl]
  };

  if (onProgress) {
    onProgress({
      currentPage: 1,
      totalPages: 1,
      stage: 'complete',
      message: `Recognized image "${fileName}" (${origWidth}x${origHeight}px) & digitized ${recognizedText.length > 0 ? recognizedText.split(/\s+/).length + ' words' : 'visual content'}.`,
      percent: 100
    });
  }

  const fullText = `--- Page Break [Page 1] ---\n\n${pageText}`;

  return {
    text: fullText,
    numPages: 1,
    pages: [pageRecord],
    fileName,
    fileSizeBytes: bytes,
    fileSizeFormatted: formatFileSize(bytes),
    refNumber: extracted.refNumber,
    date: extracted.date,
    subject: extracted.subject,
    sender: extracted.sender,
    recipient: extracted.recipient,
    detectedClauses: extracted.detectedClauses,
    suggestedClassification,
    isScannedOrEmpty: !recognizedText || recognizedText.length < 20,
    ocrPagesCount: 1,
    isOcrExtracted: true,
    images: [previewDataUrl]
  };
}

/**
 * Extracts plain text, metadata, and per-page structures from a PDF File or ArrayBuffer.
 * Automatically runs multi-core client-side OCR on scanned pages or visual graphics
 * using adaptive scaling, preprocessed contrast enhancement, and worker pooling.
 * Also extracts embedded drawings, site photos, diagrams, and visual page snapshots.
 */
export async function extractTextFromPdf(
  file: File | ArrayBuffer,
  fileName: string = 'document.pdf',
  onProgress?: (progress: PdfProgressInfo) => void,
  options?: OcrOptions
): Promise<ExtractedPdfData> {
  // If the uploaded file is an image file, route to image extractor
  if ((file instanceof File && isImageFile(file)) || isImageFile(fileName)) {
    return extractTextAndImagesFromImageFile(file, fileName, onProgress, options);
  }

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

    // Step 1: Rapid pass across all pages to extract digital text and recognize embedded images
    const intermediatePages: {
      pageNumber: number;
      pageObj: any;
      digitalText: string;
      needsOcr: boolean;
      isOcr: boolean;
    }[] = [];
    const pageImagesMap = new Map<number, string[]>();

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

        // Check for embedded drawings, figures, stamps, and photos in the PDF page
        try {
          const embeddedImgs = await extractImagesFromPdfPage(page, 2);
          if (embeddedImgs.length > 0) {
            pageImagesMap.set(i, embeddedImgs);
          }
        } catch (imgExtractErr) {
          console.warn(`Image extraction notice for page ${i}:`, imgExtractErr);
        }

        const trimmedLen = pageString.trim().length;
        const wordCount = trimmedLen > 0 ? pageString.trim().split(/\s+/).filter(Boolean).length : 0;
        // Scanned pages or pages with only watermarks/headers (<120 chars or <20 words) need OCR
        const needsOcr = mode !== 'skip' && (trimmedLen < 120 || wordCount < 20);
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
                // Snapshot rendered canvas as visual contract drawing / page image
                try {
                  const existingImgs = pageImagesMap.get(pageNum) || [];
                  if (existingImgs.length === 0) {
                    const snapCanvas = document.createElement('canvas');
                    const snapScale = Math.min(1.0, 1200 / Math.max(canvas.width, canvas.height));
                    snapCanvas.width = Math.max(1, Math.floor(canvas.width * snapScale));
                    snapCanvas.height = Math.max(1, Math.floor(canvas.height * snapScale));
                    const sCtx = snapCanvas.getContext('2d');
                    if (sCtx) {
                      sCtx.drawImage(canvas, 0, 0, snapCanvas.width, snapCanvas.height);
                      existingImgs.push(snapCanvas.toDataURL('image/jpeg', 0.80));
                      pageImagesMap.set(pageNum, existingImgs);
                    }
                  }
                } catch (snapErr) {
                  console.warn('Page canvas snapshot warning:', snapErr);
                }

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
                  } else if (currentItem.digitalText && currentItem.digitalText.trim().length > 0) {
                    ocrResults.set(pageNum, currentItem.digitalText.trim());
                  } else {
                    ocrResults.set(pageNum, `[Page ${pageNum} - Scanned image / No text recognized]`);
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
          if (res && res.length > 0) {
            p.digitalText = res;
            if (!res.startsWith('[Page') || res.includes('OCR')) {
              p.isOcr = true;
              ocrPagesCount++;
            }
          }
        }
      }
    }

    // Step 3: Compile finalized page records with recognized contract images
    const pageRecords: DocumentPage[] = intermediatePages.map(p => {
      const pImages = pageImagesMap.get(p.pageNumber);
      return {
        pageNumber: p.pageNumber,
        text: p.digitalText || `[Page ${p.pageNumber} - Scanned or Visual Graphics / No Text Detected]`,
        isOcr: p.isOcr,
        images: pImages && pImages.length > 0 ? pImages : undefined
      };
    });

    // Collect all recognized images across pages (drawings, site photos, stamps)
    const allDocImages: string[] = [];
    for (const p of pageRecords) {
      if (p.images) {
        for (const img of p.images) {
          if (!allDocImages.includes(img) && allDocImages.length < 24) {
            allDocImages.push(img);
          }
        }
      }
    }

    if (onProgress) {
      onProgress({
        currentPage: numPages,
        totalPages: numPages,
        stage: 'complete',
        message: `Parsed ${numPages} pages (${ocrPagesCount} scanned pages digitized, ${allDocImages.length} images/drawings recognized).`,
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
      isOcrExtracted: ocrPagesCount > 0,
      images: allDocImages.length > 0 ? allDocImages : undefined
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
