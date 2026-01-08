'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LeadActionsProps {
  requestId: string;
  requesterName: string;
}

export default function LeadActions({ requestId, requesterName }: LeadActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = async (action: 'accepted' | 'declined') => {
    setLoading(action === 'accepted' ? 'accept' : 'decline');

    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/lawyer_connection_requests?id=eq.${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey!,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            status: action,
            lawyer_notes: notes.trim() || null,
            responded_at: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to update request');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-gray-900">Respond to this Request</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add private notes about this lead..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAction('accepted')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'accept' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Accept
          </button>

          <button
            onClick={() => handleAction('declined')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'decline' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            Decline
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          {requesterName} will be notified of your response.
        </p>
      </CardContent>
    </Card>
  );
}