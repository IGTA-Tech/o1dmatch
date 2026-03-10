'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { createClient } from '@/lib/supabase/client';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';
import { Loader2, Send, CheckCircle, LogIn, Lock } from 'lucide-react';

interface ConnectFormProps {
  lawyerId: string;
  lawyerName: string;
}

export default function ConnectForm({ lawyerId, lawyerName }: ConnectFormProps) {
  const router = useRouter();
  // const supabase = createClient();
  // console.log(supabase);

  // Auth state
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [talentProfileId, setTalentProfileId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [shareProfile, setShareProfile] = useState(false);
  const [requesterType, setRequesterType] = useState('talent');

  // Check auth using the same cookie-based method as Navbar
  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const authData = getSupabaseAuthData();

        if (!authData?.user) {
          setIsLoggedIn(false);
          setAuthLoading(false);
          return;
        }

        // User is logged in — pre-fill form data
        setIsLoggedIn(true);
        setUser({ id: authData.user.id, email: authData.user.email || '' });
        setEmail(authData.user.email || '');

        // Fetch profile for name + role
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${authData.user.id}&select=full_name,role`,
          {
            headers: {
              'Authorization': `Bearer ${authData.access_token}`,
              'apikey': anonKey,
            },
          }
        );
        if (profileRes.ok) {
          const profiles = await profileRes.json();
          if (profiles?.[0]) {
            setName(profiles[0].full_name || '');
            setRequesterType(profiles[0].role || 'talent');
          }
        }

        // Fetch talent profile if exists (for share profile checkbox)
        const talentRes = await fetch(
          `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${authData.user.id}&select=id`,
          {
            headers: {
              'Authorization': `Bearer ${authData.access_token}`,
              'apikey': anonKey,
            },
          }
        );
        if (talentRes.ok) {
          const talentProfiles = await talentRes.json();
          if (talentProfiles?.[0]) {
            setTalentProfileId(talentProfiles[0].id);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuthAndLoad();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/lawyer-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawyer_id: lawyerId,
          requester_id: user?.id || null,
          requester_type: requesterType,
          requester_name: name.trim(),
          requester_email: email.trim(),
          requester_phone: phone.trim() || null,
          message: message.trim(),
          share_profile: shareProfile,
          talent_profile_id: shareProfile && talentProfileId ? talentProfileId : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit your request. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading auth ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Not logged in — login gate ────────────────────────────────────────────
  if (!isLoggedIn) {
    const currentPath = `/lawyers/${lawyerId}/connect`;
    const loginUrl = `/login?redirectTo=${encodeURIComponent(currentPath)}`;

    return (
      <div className="text-center py-10 space-y-5">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in to Request a Consultation
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            You need to be logged in to send a connection request to{' '}
            <span className="font-medium text-gray-700">{lawyerName}</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push(loginUrl)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </button>
          <button
            onClick={() => router.push(`/signup?redirectTo=${encodeURIComponent(currentPath)}`)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create an Account
          </button>
        </div>
        <p className="text-xs text-gray-400">
          You&apos;ll be redirected back here after signing in.
        </p>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Request Sent Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Your consultation request has been sent to {lawyerName}.
          They will review your information and contact you soon.
        </p>
        <button
          onClick={() => router.push(`/lawyers/${lawyerId}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Requester Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          I am a *
        </label>
        <select
          value={requesterType}
          onChange={(e) => setRequesterType(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="talent">Job Seeker / Talent</option>
          <option value="employer">Employer</option>
          <option value="agency">Agency</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your full name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="(555) 555-5555"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Briefly describe your background, achievements, and what you're looking for help with..."
        />
      </div>

      {/* Share Profile — only if user has a talent profile */}
      {talentProfileId && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <input
            type="checkbox"
            id="share_profile"
            checked={shareProfile}
            onChange={(e) => setShareProfile(e.target.checked)}
            className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="share_profile" className="text-sm text-gray-700">
            <span className="font-medium">Share my O-1 profile</span>
            <br />
            <span className="text-gray-500">
              Allow the attorney to view your complete talent profile including skills,
              experience, and O-1 eligibility score.
            </span>
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Request
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to share your information with the attorney
        for consultation purposes.
      </p>
    </form>
  );
}