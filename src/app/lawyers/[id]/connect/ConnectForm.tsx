'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Send, CheckCircle } from 'lucide-react';

interface ConnectFormProps {
  lawyerId: string;
  lawyerName: string;
}

export default function ConnectForm({ lawyerId, lawyerName }: ConnectFormProps) {
  const router = useRouter();
  const supabase = createClient();

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

  // Load user data if logged in
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || '' });
        setEmail(authUser.email || '');

        // Get profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          setName(profile.full_name || '');
          setRequesterType(profile.role || 'talent');
        }

        // Get talent profile if exists
        const { data: talentProfile } = await supabase
          .from('talent_profiles')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (talentProfile) {
          setTalentProfileId(talentProfile.id);
        }
      }
    }
    loadUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Start submitting form");
    setSubmitting(true);
    setError(null);
  
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
      console.log("Supabase URL:", supabaseUrl);
      console.log("Anon Key exists:", !!anonKey);
  
      if (!anonKey || !supabaseUrl) {
        throw new Error('Missing Supabase configuration');
      }
  
      const requestData = {
        lawyer_id: lawyerId,
        requester_id: user?.id || null,
        requester_type: requesterType,
        requester_name: name.trim(),
        requester_email: email.trim(),
        requester_phone: phone.trim() || null,
        message: message.trim(),
        share_profile: shareProfile,
        talent_profile_id: shareProfile && talentProfileId ? talentProfileId : null,
        status: 'pending',
      };
      
      console.log("Request data:", requestData);
  
      const response = await fetch(
        `${supabaseUrl}/rest/v1/lawyer_connection_requests`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(requestData),
        }
      );
  
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
  
      const responseText = await response.text();
      console.log("Response body:", responseText);
  
      if (response.ok) {
        // Increment connection request count (ignore errors)
        fetch(
          `${supabaseUrl}/rest/v1/rpc/increment_lawyer_connections`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lawyer_id: lawyerId }),
          }
        ).catch(() => {});
  
        setSubmitted(true);
      } else {
        // Parse error message
        let errorMessage = 'Failed to submit request';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.details || responseText;
        } catch {
          errorMessage = responseText || `Error ${response.status}`;
        }
        console.error('Submit failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Share Profile - only show if user has a talent profile */}
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
              Allow the attorney to view your complete talent profile including skills, experience, and O-1 eligibility score.
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
        By submitting this form, you agree to share your information with the attorney for consultation purposes.
      </p>
    </form>
  );
}