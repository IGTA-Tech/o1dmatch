'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Building2, User, Mail, Scale, MapPin, AlertCircle } from 'lucide-react';
import WaitlistSuccess from './WaitlistSuccess';

interface FormData {
  full_name: string;
  law_firm: string;
  email: string;
  bar_state: string;
  years_experience: string;
  monthly_o1_cases: string;
  specializations: string[];
  acquisition_challenge: string;
  office_location: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

const EXPERIENCE_LEVELS = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' },
];

const MONTHLY_CASES = [
  { value: '1-2', label: '1-2 cases per month' },
  { value: '3-5', label: '3-5 cases per month' },
  { value: '6-10', label: '6-10 cases per month' },
  { value: '10+', label: '10+ cases per month' },
  { value: 'growing', label: 'Looking to grow O-1 practice' },
];

const SPECIALIZATIONS = [
  'O-1A (Sciences/Business)',
  'O-1B (Arts/Entertainment)',
  'EB-1A',
  'EB-1B',
  'H-1B',
  'L-1',
  'E-2',
  'Other Employment-Based',
];

const ACQUISITION_CHALLENGES = [
  { value: 'finding_clients', label: 'Finding qualified O-1 clients' },
  { value: 'competition', label: 'Competition from larger firms' },
  { value: 'marketing', label: 'Marketing/visibility' },
  { value: 'referrals', label: 'Getting quality referrals' },
  { value: 'no_challenge', label: 'No major challenges currently' },
];

export default function LawyerWaitlistForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ queuePosition: number; offer: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    law_firm: '',
    email: '',
    bar_state: '',
    years_experience: '',
    monthly_o1_cases: '',
    specializations: [],
    acquisition_challenge: '',
    office_location: '',
  });

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.full_name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.law_firm.trim()) {
        setError('Please enter your law firm name');
        return false;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.bar_state) {
        setError('Please select your bar state');
        return false;
      }
    } else if (step === 2) {
      if (!formData.years_experience) {
        setError('Please select your years of experience');
        return false;
      }
      if (!formData.monthly_o1_cases) {
        setError('Please select your monthly O-1 case volume');
        return false;
      }
      if (formData.specializations.length === 0) {
        setError('Please select at least one specialization');
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
    if (!formData.acquisition_challenge) {
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
          category: 'lawyer',
          ...formData,
          signup_source: 'waitlist_lawyer_page',
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
        category="lawyer"
        offer={success.offer}
        accentColor="#7c3aed"
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
              s === step ? 'w-8 bg-violet-600' : s < step ? 'w-8 bg-violet-500' : 'w-8 bg-gray-300'
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
            <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="Sarah Chen, Esq."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Law Firm</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.law_firm}
                onChange={(e) => updateField('law_firm', e.target.value)}
                placeholder="Chen Immigration Law"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="sarah@chenimmigration.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Bar State
            </label>
            <select
              value={formData.bar_state}
              onChange={(e) => updateField('bar_state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select your bar state</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Years of Immigration Law Experience</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map((exp) => (
                <button
                  key={exp.value}
                  type="button"
                  onClick={() => updateField('years_experience', exp.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.years_experience === exp.value
                      ? 'border-violet-500 bg-violet-50 text-violet-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Monthly O-1 Cases</label>
            <div className="space-y-2">
              {MONTHLY_CASES.map((cases) => (
                <button
                  key={cases.value}
                  type="button"
                  onClick={() => updateField('monthly_o1_cases', cases.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                    formData.monthly_o1_cases === cases.value
                      ? 'border-violet-500 bg-violet-50 text-violet-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cases.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Specializations (select all)</label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`p-2 text-xs rounded-lg border transition-all ${
                    formData.specializations.includes(spec)
                      ? 'border-violet-500 bg-violet-50 text-violet-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Challenges & Location */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Biggest Client Acquisition Challenge</label>
            <div className="space-y-2">
              {ACQUISITION_CHALLENGES.map((challenge) => (
                <button
                  key={challenge.value}
                  type="button"
                  onClick={() => updateField('acquisition_challenge', challenge.value)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    formData.acquisition_challenge === challenge.value
                      ? 'border-violet-500 bg-violet-50 text-violet-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {challenge.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Office Location (Optional)
            </label>
            <input
              type="text"
              value={formData.office_location}
              onChange={(e) => updateField('office_location', e.target.value)}
              placeholder="New York, NY"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
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
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
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
