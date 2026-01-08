'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LetterResponseActionsProps {
  letterId: string;
  initialAction?: string;
}

export default function LetterResponseActions({ 
  letterId, 
  initialAction 
}: LetterResponseActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'decline' | null>(
    initialAction === 'accept' ? 'accept' : initialAction === 'decline' ? 'decline' : null
  );
  const [error, setError] = useState<string | null>(null);

  const handleRespond = async () => {
    if (!selectedAction) {
      setError('Please select Accept or Decline');
      return;
    }

    setResponding(true);
    setError(null);

    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();

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
          body: JSON.stringify({
            status: selectedAction === 'accept' ? 'accepted' : 'declined',
            talent_response_message: responseMessage.trim() || null,
            responded_at: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        router.refresh();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (err) {
      console.error('Error responding:', err);
      setError(err instanceof Error ? err.message : 'Failed to respond');
    } finally {
      setResponding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Response</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSelectedAction('accept')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedAction === 'accept'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => setSelectedAction('decline')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedAction === 'decline'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <XCircle className="w-5 h-5" />
            Decline
          </button>
        </div>

        {/* Response Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={
              selectedAction === 'accept'
                ? "Thank you for the opportunity. I'm excited to move forward..."
                : "Thank you for considering me, but..."
            }
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleRespond}
          disabled={responding || !selectedAction}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            selectedAction === 'accept'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : selectedAction === 'decline'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {responding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              {selectedAction === 'accept' ? 'Accept Letter' : selectedAction === 'decline' ? 'Decline Letter' : 'Select an option'}
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}