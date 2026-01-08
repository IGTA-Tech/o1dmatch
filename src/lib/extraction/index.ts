export * from './pdf-extractor';
export * from './ocr-processor';

import {
  extractTextFromPDF,
  isProbablyScanned,
  cleanExtractedText,
} from './pdf-extractor';
import {
  extractTextWithOCR,
  requiresOCR,
  OCRProgress,
} from './ocr-processor';

export interface ExtractionResult {
  text: string;
  method: 'pdf' | 'ocr' | 'pdf+ocr';
  confidence: number;
  pageCount?: number;
  success: boolean;
  error?: string;
  metadata?: {
    title?: string;
    author?: string;
    processingTime?: number;
  };
}

/**
 * Extract text from a document using the appropriate method
 * - PDF files: Try pdf-parse first, fall back to OCR if scanned
 * - Images: Use OCR directly
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  onProgress?: (progress: OCRProgress) => void
): Promise<ExtractionResult> {
  const startTime = Date.now();

  // Handle image files with OCR
  if (requiresOCR(mimeType)) {
    const ocrResult = await extractTextWithOCR(buffer, onProgress);
    return {
      text: cleanExtractedText(ocrResult.text),
      method: 'ocr',
      confidence: ocrResult.confidence,
      success: ocrResult.success,
      error: ocrResult.error,
      metadata: {
        processingTime: ocrResult.processingTime,
      },
    };
  }

  // Handle PDF files
  if (mimeType === 'application/pdf') {
    const pdfResult = await extractTextFromPDF(buffer);

    // If PDF extraction worked and has enough text, use it
    if (pdfResult.success && !isProbablyScanned(pdfResult)) {
      return {
        text: cleanExtractedText(pdfResult.text),
        method: 'pdf',
        confidence: 95, // Native PDF extraction is highly reliable
        pageCount: pdfResult.pageCount,
        success: true,
        metadata: {
          title: pdfResult.info.title,
          author: pdfResult.info.author,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // PDF appears to be scanned, try OCR
    // Note: For production, you'd need to convert PDF pages to images first
    // This is a simplified version that works with single-page scanned PDFs
    if (onProgress) {
      onProgress({ status: 'PDF appears scanned, attempting OCR...', progress: 10 });
    }

    const ocrResult = await extractTextWithOCR(buffer, onProgress);

    if (ocrResult.success && ocrResult.text.length > 0) {
      return {
        text: cleanExtractedText(ocrResult.text),
        method: 'pdf+ocr',
        confidence: ocrResult.confidence,
        pageCount: pdfResult.pageCount,
        success: true,
        metadata: {
          title: pdfResult.info.title,
          author: pdfResult.info.author,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // If OCR also failed, return whatever PDF extraction got
    return {
      text: cleanExtractedText(pdfResult.text),
      method: 'pdf',
      confidence: 50, // Low confidence since extraction was poor
      pageCount: pdfResult.pageCount,
      success: pdfResult.text.length > 0,
      error: pdfResult.text.length === 0 ? 'Could not extract text from document' : undefined,
      metadata: {
        title: pdfResult.info.title,
        author: pdfResult.info.author,
        processingTime: Date.now() - startTime,
      },
    };
  }

  // Unsupported file type
  return {
    text: '',
    method: 'pdf',
    confidence: 0,
    success: false,
    error: `Unsupported file type: ${mimeType}`,
  };
}

/**
 * Determine auto-verification status based on extraction and classification confidence
 */
export function determineAutoVerificationStatus(
  extractionConfidence: number,
  classificationConfidence: number,
  scoreImpact: number
): 'verified' | 'needs_review' | 'pending' {
  const overallConfidence = (extractionConfidence + classificationConfidence) / 2;

  // High confidence (>85%) and high score impact -> auto-verify
  if (overallConfidence >= 85 && scoreImpact >= 8) {
    return 'verified';
  }

  // High confidence but lower score impact -> needs review
  if (overallConfidence >= 85) {
    return 'needs_review';
  }

  // Medium confidence (60-85%) -> needs review
  if (overallConfidence >= 60) {
    return 'needs_review';
  }

  // Low confidence -> pending for manual review
  return 'pending';
}
