import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source for Vite bundler
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedPdfData {
  text: string;
  numPages: number;
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
  // Look for formats: "Date: 14 October 2026", "Dated: 14/08/2026", "Date: 2026-08-14"
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
    // Try generic date regex in header
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
    // Trim if too long
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
 * Extracts plain text and metadata from a PDF File or ArrayBuffer
 */
export async function extractTextFromPdf(file: File | ArrayBuffer, fileName: string = 'document.pdf'): Promise<ExtractedPdfData> {
  const bytes = file instanceof File ? file.size : file.byteLength;
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageString = textContent.items
        .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
        .join(' ');

      if (pageString.trim()) {
        pageTexts.push(pageString.trim());
      }
    }

    const fullText = pageTexts.join('\n\n--- Page Break ---\n\n').trim();
    const isScannedOrEmpty = fullText.length < 40;

    const extracted = extractContractLetterMetadata(fullText, fileName);

    return {
      text: fullText,
      numPages,
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

      return {
        text: fallbackText || `[Document: ${fileName}]\n\n(Could not automatically extract text from this PDF. Please verify whether it is a scanned image or protected document.)`,
        numPages: 1,
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
        isScannedOrEmpty: fallbackText.length < 40
      };
    } catch {
      return {
        text: `[Document: ${fileName}]\n\n(PDF format could not be decoded. Please enter letter text manually or attach unencrypted PDF.)`,
        numPages: 1,
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
