// src/app/(dashboard)/dashboard/admin/letters/[id]/AdminReviewActions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface AdminReviewActionsProps {
  letterId: string;
}

export function AdminReviewActions({ letterId }: AdminReviewActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'reject') => {
    const isApprove = action === 'approve';
    
    if (isApprove) {
      setIsApproving(true);
    } else {
      setIsRejecting(true);
    }
    setError(null);

    try {
      const authData = getSupabaseAuthData();
      
      if (!authData) {
        setError('Session expired. Please log in again.');
        return;
      }

      const response = await fetch('/api/admin/letters/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterId,
          action,
          adminNotes: adminNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process action');
        return;
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Action Required
      </h3>
      <p className="text-yellow-700 mb-4">
        This letter is pending review. Please review the details and approve or reject.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!showRejectForm ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleAction('approve')}
            disabled={isApproving || isRejecting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isApproving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Approve & Notify Talent
          </button>
          
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isApproving || isRejecting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Explain why this letter is being rejected..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRejectForm(false);
                setAdminNotes('');
              }}
              disabled={isRejecting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={isRejecting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isRejecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
