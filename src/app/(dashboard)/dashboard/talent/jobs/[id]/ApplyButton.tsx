'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2 } from 'lucide-react';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

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

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      // Get auth data from cookie
      const authData = getSupabaseAuthData();

      if (!authData) {
        setError('Session expired. Please log out and log in again.');
        setIsApplying(false);
        return;
      }

      const accessToken = authData.access_token;

      // Prepare application data
      const applicationData = {
        job_id: jobId,
        talent_id: talentId,
        cover_message: coverMessage || null,
        score_at_application: talentScore,
        status: 'pending',
      };

      console.log("Submitting application:", applicationData);

      // Insert application
      const response = await fetch(
        `${supabaseUrl}/rest/v1/job_applications`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(applicationData),
        }
      );

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (!response.ok) {
        // Check for duplicate application error
        if (response.status === 409 || responseText.includes('23505')) {
          setError('You have already applied to this job.');
        } else {
          setError(`Failed to apply: ${responseText}`);
        }
        setIsApplying(false);
        return;
      }

      console.log("Application submitted successfully!");
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
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