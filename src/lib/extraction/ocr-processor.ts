import Tesseract from 'tesseract.js';

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
 * Extract text from an image using OCR (Tesseract.js)
 */
export async function extractTextWithOCR(
  imageBuffer: Buffer,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: onProgress
        ? (m) => {
            if (m.status && typeof m.progress === 'number') {
              onProgress({
                status: m.status,
                progress: Math.round(m.progress * 100),
              });
            }
          }
        : undefined,
    });

    const processingTime = Date.now() - startTime;

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      success: true,
      processingTime,
    };
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      text: '',
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown OCR error',
      processingTime: Date.now() - startTime,
    };
  }
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
