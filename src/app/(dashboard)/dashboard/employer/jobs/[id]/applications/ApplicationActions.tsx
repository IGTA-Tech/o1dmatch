'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: string;
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [action, setAction] = useState<'shortlist' | 'reject' | null>(null);

  const supabase = createClient();

  const handleStatusUpdate = async (newStatus: 'shortlisted' | 'rejected') => {
    setIsUpdating(true);
    setAction(newStatus === 'shortlisted' ? 'shortlist' : 'reject');

    try {
      const { error } = await supabase
        .from('job_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status: ' + error.message);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
      setAction(null);
    }
  };

  // Don't show actions if already processed
  if (currentStatus !== 'pending' && currentStatus !== 'submitted' && currentStatus !== 'under_review') {
    return null;
  }

  return (
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
  );
}