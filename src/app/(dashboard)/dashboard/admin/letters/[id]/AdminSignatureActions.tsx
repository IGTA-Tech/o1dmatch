// src/app/(dashboard)/dashboard/admin/letters/[id]/AdminSignatureActions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface AdminSignatureActionsProps {
  letterId: string;
}

export function AdminSignatureActions({ letterId }: AdminSignatureActionsProps) {
  const router = useRouter();
  const [isForwarding, setIsForwarding] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForwardToEmployer = async () => {
    if (!confirm('Are you sure you want to forward this signed letter to the employer?')) {
      return;
    }

    setIsForwarding(true);
    setError(null);

    try {
      const authData = getSupabaseAuthData();
      
      if (!authData) {
        setError('Session expired. Please log in again.');
        return;
      }

      const response = await fetch('/api/admin/letters/forward-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterId,
          adminNotes: adminNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to forward signature');
        return;
      }

      setSuccess(true);
      // Refresh the page to show updated status
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsForwarding(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-green-800">Signature forwarded successfully!</p>
          <p className="text-sm text-green-600 mt-2">The employer can now view the signed letter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center gap-2">
        <Send className="w-5 h-5" />
        Forward Signed Letter to Employer
      </h3>
      
      <div className="mt-4 p-4 bg-white border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800 font-medium mb-2">
          Review Checklist:
        </p>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>✓ Verify the signature is legible and appropriate</li>
          <li>✓ Confirm talent&apos;s identity matches the letter recipient</li>
          <li>✓ Ensure all letter details are correct</li>
        </ul>
      </div>

      {/* Admin Notes */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Admin Notes (Optional)
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Add any internal notes about this signature review..."
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleForwardToEmployer}
        disabled={isForwarding}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isForwarding ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Forwarding...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Forward to Employer
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Once forwarded, the employer will be able to see the talent&apos;s signature on the letter.
      </p>
    </div>
  );
}