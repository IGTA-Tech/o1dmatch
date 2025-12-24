'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, User, Mail, Briefcase, Clock, AlertCircle } from 'lucide-react';
import WaitlistSuccess from './WaitlistSuccess';

interface FormData {
  full_name: string;
  email: string;
  primary_field: string;
  current_visa_status: string;
  biggest_challenge: string;
  timeline_urgency: string;
}

const PRIMARY_FIELDS = [
  'Technology & Engineering',
  'Sciences & Research',
  'Arts & Entertainment',
  'Business & Finance',
  'Sports & Athletics',
  'Other',
];

const VISA_STATUSES = [
  { value: 'not_started', label: "Haven't started the O-1 process" },
  { value: 'researching', label: 'Researching O-1 requirements' },
  { value: 'gathering_evidence', label: 'Gathering evidence/documents' },
  { value: 'working_with_lawyer', label: 'Working with an immigration lawyer' },
  { value: 'filed', label: 'Already filed O-1 petition' },
];

const CHALLENGES = [
  'Finding employers willing to sponsor',
  'Understanding O-1 requirements',
  'Gathering sufficient evidence',
  'Affording immigration lawyers',
  'Connecting with the right opportunities',
  'Other',
];

const TIMELINES = [
  { value: 'urgent', label: 'ASAP - I need to act quickly' },
  { value: '3_months', label: 'Within 3 months' },
  { value: '6_months', label: 'Within 6 months' },
  { value: 'exploring', label: 'Just exploring options' },
];

export default function TalentWaitlistForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ queuePosition: number; offer: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    primary_field: '',
    current_visa_status: '',
    biggest_challenge: '',
    timeline_urgency: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.full_name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.primary_field) {
        setError('Please select your primary field');
        return false;
      }
    } else if (step === 2) {
      if (!formData.current_visa_status) {
        setError('Please select your current visa status');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.biggest_challenge) {
      setError('Please select your biggest challenge');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'talent',
          ...formData,
          signup_source: 'waitlist_talent_page',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setSuccess({
        queuePosition: data.data.queue_position,
        offer: data.data.offer,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <WaitlistSuccess
        queuePosition={success.queuePosition}
        category="talent"
        offer={success.offer}
        accentColor="#6366f1"
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step ? 'w-8 bg-indigo-500' : s < step ? 'w-8 bg-indigo-400' : 'w-8 bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Primary Field</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={formData.primary_field}
                onChange={(e) => updateField('primary_field', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900">Select your field</option>
                {PRIMARY_FIELDS.map((field) => (
                  <option key={field} value={field} className="bg-gray-900">
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Visa Status */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4 text-gray-300">Where are you in the O-1 process?</h3>
          {VISA_STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => updateField('current_visa_status', status.value)}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                formData.current_visa_status === status.value
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Challenges & Timeline */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-300">What&apos;s your biggest challenge?</h3>
            <div className="space-y-3">
              {CHALLENGES.map((challenge) => (
                <button
                  key={challenge}
                  type="button"
                  onClick={() => updateField('biggest_challenge', challenge)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                    formData.biggest_challenge === challenge
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {challenge}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-300 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </h3>
            <div className="space-y-3">
              {TIMELINES.map((timeline) => (
                <button
                  key={timeline.value}
                  type="button"
                  onClick={() => updateField('timeline_urgency', timeline.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                    formData.timeline_urgency === timeline.value
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {timeline.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Waitlist'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
