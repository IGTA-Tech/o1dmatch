// src/components/employer/SendLetterButton.tsx
//
// Use this component in the employer's letter creation/detail page
// to send the letter for admin review

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle } from 'lucide-react';

interface SendLetterButtonProps {
  letterId: string;
  currentStatus?: string;
}

export function SendLetterButton({ letterId, currentStatus }: SendLetterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show button if already sent for review
  if (currentStatus === 'pending_review' || currentStatus === 'sent' || currentStatus === 'approved') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
        <CheckCircle className="w-5 h-5" />
        <span>
          {currentStatus === 'pending_review' && 'Sent for Review'}
          {currentStatus === 'sent' && 'Letter Sent'}
          {currentStatus === 'approved' && 'Approved'}
        </span>
      </div>
    );
  }

  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/letters/send-for-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send letter');
        return;
      }

      setSuccess(true);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Error sending letter:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
        <CheckCircle className="w-5 h-5" />
        <span>Letter sent for review!</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send for Review
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      <p className="mt-2 text-xs text-gray-500">
        Your letter will be reviewed by an admin before being sent to the talent.
      </p>
    </div>
  );
}
