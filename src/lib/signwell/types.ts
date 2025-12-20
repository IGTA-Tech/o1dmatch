// SignWell API Types

export interface SignWellSigner {
  id?: string;
  email: string;
  name: string;
  send_email?: boolean;
  send_email_delay?: number;
}

export interface SignWellDocument {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'completed' | 'expired' | 'cancelled';
  created_at: string;
  completed_at?: string;
  expires_at?: string;
  signers: SignWellSigner[];
  files: { name: string; size: number }[];
  metadata?: Record<string, string>;
}

export interface CreateDocumentRequest {
  name: string;
  test_mode?: boolean;
  signers: SignWellSigner[];
  files?: { name: string; file_base64: string }[];
  file_url?: string;
  expires_in?: number; // days
  metadata?: Record<string, string>;
  custom_requester_name?: string;
  custom_requester_email?: string;
  redirect_url?: string;
  allow_decline?: boolean;
  message?: string;
}

export interface CreateDocumentResponse {
  id: string;
  url?: string; // URL to view/sign document
  status: string;
  signers: {
    id: string;
    email: string;
    name: string;
    status: string;
    sign_url?: string;
  }[];
}

export interface GetDocumentResponse extends SignWellDocument {
  completed_pdf_url?: string;
  completed_pdf_base64?: string;
}

export interface WebhookEvent {
  event_type:
    | 'document.created'
    | 'document.sent'
    | 'document.viewed'
    | 'document.completed'
    | 'document.expired'
    | 'document.cancelled'
    | 'signer.signed'
    | 'signer.declined';
  document_id: string;
  document_name: string;
  signer_email?: string;
  signer_name?: string;
  timestamp: string;
  completed_pdf_url?: string;
}

export interface SignWellError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

// Database types for interest_letters
export interface InterestLetterSignature {
  signwell_document_id: string | null;
  signwell_status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired' | null;
  signed_pdf_url: string | null;
  signature_requested_at: string | null;
  signature_completed_at: string | null;
}
