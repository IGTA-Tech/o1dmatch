'use client';

// src/app/(dashboard)/dashboard/employer/jobs/[id]/applications/ApplicationActions.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: string;
  jobTitle: string;
}

export function ApplicationActions({
  applicationId,
  currentStatus,
  jobTitle,
}: ApplicationActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [action, setAction] = useState<'shortlist' | 'reject' | null>(null);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: 'shortlisted' | 'rejected') => {
    setIsUpdating(true);
    setError(null);
    setAction(newStatus === 'shortlisted' ? 'shortlist' : 'reject');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      const authData = getSupabaseAuthData();

      if (!authData) {
        setError('Session expired. Please log out and log in again.');
        return;
      }

      // ── 1. Update status via rest/v1 ──────────────────────────────────────
      const response = await fetch(
        `${supabaseUrl}/rest/v1/job_applications?id=eq.${applicationId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${authData.access_token}`,
            apikey: anonKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            status: newStatus,
            reviewed_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Failed to update status:', errText);
        setError('Failed to update status. Please try again.');
        return;
      }

      // ── 2. Send emails on shortlist (non-blocking) ────────────────────────
      if (newStatus === 'shortlisted') {
        try {
          await fetch('/api/send-shortlist-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, jobTitle }),
          });
        } catch (emailErr) {
          console.warn('[shortlist] Email notification failed (non-critical):', emailErr);
        }
      }

      // ── 3. Update UI immediately ──────────────────────────────────────────
      setLocalStatus(newStatus);
      router.refresh();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
      setAction(null);
    }
  };

  // Hide buttons once already processed
  if (
    localStatus !== 'pending' &&
    localStatus !== 'submitted' &&
    localStatus !== 'under_review'
  ) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleStatusUpdate('shortlisted')}
          disabled={isUpdating}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isUpdating && action === 'shortlist' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Shortlist
        </button>

        <button
          onClick={() => handleStatusUpdate('rejected')}
          disabled={isUpdating}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isUpdating && action === 'reject' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Reject
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}