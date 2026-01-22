'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminSignatureActionsProps {
  letterId: string;
}

export default function AdminSignatureActions({ letterId }: AdminSignatureActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [forwarding, setForwarding] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForwardToEmployer = async () => {
    if (!confirm('Are you sure you want to forward this signed letter to the employer?')) {
      return;
    }

    setForwarding(true);
    setError(null);

    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      const updateData = {
        signature_status: 'forwarded_to_employer',
        signature_reviewed_at: new Date().toISOString(),
        signature_reviewed_by: user?.id,
        forwarded_to_employer_at: new Date().toISOString(),
        admin_notes: adminNotes.trim() || null,
      };

      const response = await fetch(
        `${supabaseUrl}/rest/v1/interest_letters?id=eq.${letterId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token || anonKey}`,
            'apikey': anonKey!,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
          router.push('/dashboard/admin/signed-letters');
        }, 1500);
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (err) {
      console.error('Error forwarding letter:', err);
      setError(err instanceof Error ? err.message : 'Failed to forward letter');
    } finally {
      setForwarding(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-800">Letter forwarded successfully!</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Admin Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Review Checklist:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>✓ Verify the signature is legible and appropriate</li>
            <li>✓ Confirm talent&apos;s identity matches the letter recipient</li>
            <li>✓ Ensure all letter details are correct</li>
          </ul>
        </div>

        {/* Admin Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Notes (Optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add any internal notes about this review..."
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleForwardToEmployer}
            disabled={forwarding}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {forwarding ? (
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
        </div>

        <p className="text-xs text-gray-500 text-center">
          Once forwarded, the employer will be able to see the talent&apos;s signature on the letter.
        </p>
      </CardContent>
    </Card>
  );
}