export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  info: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    creationDate?: Date;
  };
  success: boolean;
  error?: string;
}

/**
 * Extract text content from a PDF buffer
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFExtractionResult> {
  try {
    // Dynamic import for pdf-parse to avoid ESM issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import('pdf-parse') as any;
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      info: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        creator: data.info?.Creator,
        creationDate: data.info?.CreationDate
          ? new Date(data.info.CreationDate)
          : undefined,
      },
      success: true,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      info: {},
      success: false,
      error: error instanceof Error ? error.message : 'Unknown PDF extraction error',
    };
  }
}

/**
 * Check if extracted text is likely from a scanned document (needs OCR)
 * Scanned PDFs typically have very little extractable text
 */
export function isProbablyScanned(result: PDFExtractionResult): boolean {
  if (!result.success || !result.text) return true;

  // If we have less than 100 characters per page on average, it's likely scanned
  const avgCharsPerPage = result.text.length / Math.max(result.pageCount, 1);
  return avgCharsPerPage < 100;
}

/**
 * Clean and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
}
