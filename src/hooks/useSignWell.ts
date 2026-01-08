'use client';

import { useState, useCallback } from 'react';

export interface SignatureStatus {
  letter_id: string;
  signwell_document_id: string | null;
  signwell_status: string | null;
  signed_pdf_url: string | null;
  signature_requested_at: string | null;
  signature_completed_at: string | null;
  signers: { email: string; name: string; id: string }[] | null;
  can_request_signature: boolean;
  can_download_signed: boolean;
}

export function useSignWell() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSignature = useCallback(
    async (letterId: string): Promise<{ success: boolean; document_id?: string; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/signwell/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ letter_id: letterId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to request signature');
        }

        return { success: true, document_id: data.data.document_id };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to request signature';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getStatus = useCallback(
    async (letterId: string): Promise<SignatureStatus | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/signwell/status/${letterId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get status');
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get status';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    requestSignature,
    getStatus,
  };
}

// Helper to get status label and color
export function getSignatureStatusInfo(status: string | null): {
  label: string;
  color: 'gray' | 'yellow' | 'blue' | 'green' | 'red';
} {
  switch (status) {
    case 'pending':
      return { label: 'Signature Requested', color: 'yellow' };
    case 'sent':
      return { label: 'Awaiting Signatures', color: 'yellow' };
    case 'viewed':
      return { label: 'Document Viewed', color: 'blue' };
    case 'signed':
    case 'completed':
      return { label: 'Signed', color: 'green' };
    case 'declined':
      return { label: 'Declined', color: 'red' };
    case 'expired':
      return { label: 'Expired', color: 'gray' };
    default:
      return { label: 'Not Requested', color: 'gray' };
  }
}
