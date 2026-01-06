// lib/extraction/ocr-processor.ts

export interface OCRResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
  processingTime: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Extract text from an image using OCR
 * Note: Tesseract.js has worker issues on Windows/Next.js
 * This returns a graceful failure - images will need manual review
 */
export async function extractTextWithOCR(
  // imageBuffer: Buffer,
  // onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const startTime = Date.now();

  // For now, skip OCR and mark for manual review
  // TODO: Integrate cloud OCR (Google Vision, AWS Textract, or Claude Vision)
  console.log('OCR skipped - tesseract.js has compatibility issues with Next.js on Windows');
  
  return {
    text: '',
    confidence: 0,
    success: false,
    error: 'OCR temporarily unavailable. Image documents require manual review.',
    processingTime: Date.now() - startTime,
  };
}

/**
 * Check if the file type requires OCR processing
 */
export function requiresOCR(mimeType: string): boolean {
  const ocrMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp',
  ];
  return ocrMimeTypes.includes(mimeType.toLowerCase());
}

/**
 * Get quality rating based on OCR confidence
 */
export function getOCRQualityRating(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 85) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}