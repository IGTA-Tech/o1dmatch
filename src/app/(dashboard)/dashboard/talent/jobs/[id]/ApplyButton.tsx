'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2 } from 'lucide-react';

interface ApplyButtonProps {
  jobId: string;
  talentId: string;
  talentScore: number;
}

export function ApplyButton({ jobId, talentId, talentScore }: ApplyButtonProps) {
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          talent_id: talentId,
          cover_message: coverMessage || null,
          score_at_application: talentScore,
          status: 'pending',
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You have already applied to this job.');
        } else {
          setError(insertError.message);
        }
        return;
      }

      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsApplying(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Send className="w-5 h-5" />
        Apply Now
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Message (Optional)
        </label>
        <textarea
          value={coverMessage}
          onChange={(e) => setCoverMessage(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell the employer why you're a great fit for this role..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isApplying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}