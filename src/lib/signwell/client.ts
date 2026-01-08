import crypto from 'crypto';
import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetDocumentResponse,
  SignWellError,
} from './types';

const SIGNWELL_API_URL = 'https://www.signwell.com/api/v1';

// Lazy initialization to avoid build-time errors
let apiKey: string | null = null;

function getApiKey(): string {
  if (!apiKey) {
    apiKey = process.env.SIGNWELL_API_KEY || null;
    if (!apiKey) {
      throw new Error('SIGNWELL_API_KEY is not set');
    }
  }
  return apiKey;
}

function isTestMode(): boolean {
  return process.env.SIGNWELL_TEST_MODE === 'true';
}

async function signwellRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const key = getApiKey();

  const response = await fetch(`${SIGNWELL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-Api-Key': key,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: SignWellError = await response.json().catch(() => ({
      error: 'Unknown error',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || error.error);
  }

  return response.json();
}

/**
 * Create a new document for signing
 */
export async function createDocument(
  request: CreateDocumentRequest
): Promise<CreateDocumentResponse> {
  return signwellRequest<CreateDocumentResponse>('/documents', {
    method: 'POST',
    body: JSON.stringify({
      ...request,
      test_mode: request.test_mode ?? isTestMode(),
    }),
  });
}

/**
 * Get document details and status
 */
export async function getDocument(
  documentId: string
): Promise<GetDocumentResponse> {
  return signwellRequest<GetDocumentResponse>(`/documents/${documentId}`);
}

/**
 * Get the signed PDF for a completed document
 */
export async function getSignedPdf(
  documentId: string
): Promise<{ pdf_url: string }> {
  return signwellRequest<{ pdf_url: string }>(
    `/documents/${documentId}/completed_pdf`
  );
}

/**
 * Cancel a document
 */
export async function cancelDocument(documentId: string): Promise<void> {
  await signwellRequest(`/documents/${documentId}/cancel`, {
    method: 'POST',
  });
}

/**
 * Send reminder to signers
 */
export async function sendReminder(documentId: string): Promise<void> {
  await signwellRequest(`/documents/${documentId}/remind`, {
    method: 'POST',
  });
}

/**
 * Generate a PDF from interest letter content for signing
 */
export async function createInterestLetterDocument(params: {
  letterTitle: string;
  letterContent: string;
  talentName: string;
  talentEmail: string;
  employerName: string;
  employerEmail: string;
  letterId: string;
  redirectUrl?: string;
}): Promise<CreateDocumentResponse> {
  const {
    letterTitle,
    letterContent,
    talentName,
    talentEmail,
    employerName,
    employerEmail,
    letterId,
    redirectUrl,
  } = params;

  // Create a simple HTML document for the letter
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #2563eb; }
        .content { white-space: pre-wrap; line-height: 1.6; }
        .signature-block { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature-line { border-bottom: 1px solid #000; width: 200px; height: 30px; }
        .date { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Interest Letter</h1>
      <p><strong>From:</strong> ${employerName}</p>
      <p><strong>To:</strong> ${talentName}</p>
      <div class="content">${letterContent}</div>
      <div class="signature-block">
        <p><strong>Employer Signature:</strong></p>
        <div class="signature-line"></div>
        <p>${employerName}</p>
        <p class="date">Date: _______________</p>
      </div>
      <div class="signature-block">
        <p><strong>Talent Acknowledgment:</strong></p>
        <div class="signature-line"></div>
        <p>${talentName}</p>
        <p class="date">Date: _______________</p>
      </div>
    </body>
    </html>
  `;

  // Convert HTML to base64 (SignWell accepts HTML files)
  const base64Content = Buffer.from(htmlContent).toString('base64');

  return createDocument({
    name: letterTitle,
    test_mode: isTestMode(),
    expires_in: 30, // 30 days
    metadata: {
      letter_id: letterId,
      type: 'interest_letter',
    },
    custom_requester_name: 'O1DMatch',
    custom_requester_email: 'noreply@o1dmatch.vercel.app',
    redirect_url: redirectUrl,
    allow_decline: true,
    message: `Please review and sign this interest letter from ${employerName}.`,
    files: [
      {
        name: `${letterTitle.replace(/[^a-z0-9]/gi, '_')}.html`,
        file_base64: base64Content,
      },
    ],
    signers: [
      {
        email: employerEmail,
        name: employerName,
        send_email: true,
      },
      {
        email: talentEmail,
        name: talentName,
        send_email: true,
        send_email_delay: 0, // Send after employer signs
      },
    ],
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.SIGNWELL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('SIGNWELL_WEBHOOK_SECRET not set, skipping verification');
    return true;
  }

  // SignWell uses HMAC-SHA256 for webhook signatures
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
