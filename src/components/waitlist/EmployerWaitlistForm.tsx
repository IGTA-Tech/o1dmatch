'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Building2, User, Mail, Briefcase, Users, AlertCircle } from 'lucide-react';
import WaitlistSuccess from './WaitlistSuccess';

interface FormData {
  company_name: string;
  full_name: string;
  job_title: string;
  email: string;
  company_size: string;
  industry: string;
  hiring_volume: string;
  biggest_challenge: string;
}

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
];

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Research & Academia',
  'Other',
];

const HIRING_VOLUMES = [
  { value: '1-2', label: '1-2 O-1 candidates per year' },
  { value: '3-5', label: '3-5 O-1 candidates per year' },
  { value: '6-10', label: '6-10 O-1 candidates per year' },
  { value: '10+', label: '10+ O-1 candidates per year' },
  { value: 'not_sure', label: 'Not sure yet' },
];

const CHALLENGES = [
  'Finding qualified O-1 eligible candidates',
  'Understanding O-1 sponsorship requirements',
  'Managing the visa petition process',
  'Cost of immigration lawyers',
  'Time to hire international talent',
  'Other',
];

export default function EmployerWaitlistForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ queuePosition: number; offer: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    full_name: '',
    job_title: '',
    email: '',
    company_size: '',
    industry: '',
    hiring_volume: '',
    biggest_challenge: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.company_name.trim()) {
        setError('Please enter your company name');
        return false;
      }
      if (!formData.full_name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.job_title.trim()) {
        setError('Please enter your job title');
        return false;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else if (step === 2) {
      if (!formData.company_size) {
        setError('Please select your company size');
        return false;
      }
      if (!formData.industry) {
        setError('Please select your industry');
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
          category: 'employer',
          ...formData,
          signup_source: 'waitlist_employer_page',
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
        category="employer"
        offer={success.offer}
        accentColor="#16a34a"
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
              s === step ? 'w-8 bg-green-600' : s < step ? 'w-8 bg-green-500' : 'w-8 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
                placeholder="Acme Corporation"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="Jane Smith"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => updateField('job_title', e.target.value)}
                placeholder="VP of Engineering"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="jane@acme.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Company Info */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Company Size
            </label>
            <div className="space-y-2">
              {COMPANY_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateField('company_size', size)}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    formData.company_size === size
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">O-1 Hiring Volume</label>
            <div className="space-y-2">
              {HIRING_VOLUMES.map((vol) => (
                <button
                  key={vol.value}
                  type="button"
                  onClick={() => updateField('hiring_volume', vol.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                    formData.hiring_volume === vol.value
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {vol.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Challenges */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4 text-gray-800">What&apos;s your biggest hiring challenge?</h3>
          {CHALLENGES.map((challenge) => (
            <button
              key={challenge}
              type="button"
              onClick={() => updateField('biggest_challenge', challenge)}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                formData.biggest_challenge === challenge
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {challenge}
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
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
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
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
