'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, Mail, User, Linkedin, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface WaitlistFormProps {
  defaultRole: 'talent' | 'employer';
}

export default function WaitlistForm({ defaultRole }: WaitlistFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'talent' | 'employer'>(defaultRole);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Configuration error');
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/waitlist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            user_type: userType,
            linkedin_url: linkedinUrl.trim() || null,
          }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.text();
        
        // Check for duplicate email
        if (errorData.includes('duplicate') || errorData.includes('unique')) {
          setError('This email is already on our waitlist!');
        } else {
          console.error('Error response:', errorData);
          throw new Error('Failed to join waitlist');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re on the list!
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Thanks for joining our waitlist, {fullName.split(' ')[0]}! We&apos;ll notify you at{' '}
          <span className="font-medium text-gray-900">{email}</span> when we launch.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
          <p className="text-sm text-gray-500">
            Follow us on{' '}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              LinkedIn
            </a>
            {' '}for updates
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          I am a... <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as 'talent' | 'employer')}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="talent">Talent / Job Seeker</option>
            <option value="employer">Employer / Company</option>
          </select>
        </div>
      </div>

      {/* LinkedIn URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          LinkedIn URL <span className="text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            <Mail className="w-5 h-5" />
            Notify Me When We Launch
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By joining, you agree to receive updates about our launch. We&apos;ll never spam you.
      </p>
    </form>
  );
}