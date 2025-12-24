'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Building, User, Mail, Briefcase, Globe, AlertCircle } from 'lucide-react';
import WaitlistSuccess from './WaitlistSuccess';

interface FormData {
  agency_name: string;
  full_name: string;
  job_title: string;
  email: string;
  agency_size: string;
  annual_placements: string;
  international_experience: boolean | null;
  primary_industries: string[];
  client_demand: string;
}

const AGENCY_SIZES = [
  '1-5 recruiters',
  '6-15 recruiters',
  '16-50 recruiters',
  '50+ recruiters',
];

const PLACEMENT_VOLUMES = [
  { value: '1-10', label: '1-10 placements per year' },
  { value: '11-50', label: '11-50 placements per year' },
  { value: '51-100', label: '51-100 placements per year' },
  { value: '100+', label: '100+ placements per year' },
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Engineering',
  'Sciences',
  'Creative/Design',
  'Executive Search',
  'Other',
];

const CLIENT_DEMANDS = [
  { value: 'high', label: 'High - Clients frequently ask about O-1 candidates' },
  { value: 'moderate', label: 'Moderate - Occasional O-1 inquiries' },
  { value: 'growing', label: 'Growing - Seeing more interest recently' },
  { value: 'exploring', label: 'Exploring - Want to offer this to clients' },
];

export default function AgencyWaitlistForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ queuePosition: number; offer: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    agency_name: '',
    full_name: '',
    job_title: '',
    email: '',
    agency_size: '',
    annual_placements: '',
    international_experience: null,
    primary_industries: [],
    client_demand: '',
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[] | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleIndustry = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      primary_industries: prev.primary_industries.includes(industry)
        ? prev.primary_industries.filter((i) => i !== industry)
        : [...prev.primary_industries, industry],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.agency_name.trim()) {
        setError('Please enter your agency name');
        return false;
      }
      if (!formData.full_name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.job_title.trim()) {
        setError('Please enter your title');
        return false;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else if (step === 2) {
      if (!formData.agency_size) {
        setError('Please select your agency size');
        return false;
      }
      if (!formData.annual_placements) {
        setError('Please select your annual placements');
        return false;
      }
      if (formData.international_experience === null) {
        setError('Please indicate your international experience');
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
    if (formData.primary_industries.length === 0) {
      setError('Please select at least one industry');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'agency',
          ...formData,
          signup_source: 'waitlist_agency_page',
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
        category="agency"
        offer={success.offer}
        accentColor="#f59e0b"
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
              s === step ? 'w-8 bg-amber-500' : s < step ? 'w-8 bg-amber-400' : 'w-8 bg-gray-700'
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
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Agency Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.agency_name}
                onChange={(e) => updateField('agency_name', e.target.value)}
                placeholder="Elite Talent Partners"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="Alex Johnson"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => updateField('job_title', e.target.value)}
                placeholder="Managing Director"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="alex@elitetalent.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Agency Info */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Agency Size</label>
            <div className="space-y-2">
              {AGENCY_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateField('agency_size', size)}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    formData.agency_size === size
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Annual Placements</label>
            <div className="space-y-2">
              {PLACEMENT_VOLUMES.map((vol) => (
                <button
                  key={vol.value}
                  type="button"
                  onClick={() => updateField('annual_placements', vol.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                    formData.annual_placements === vol.value
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {vol.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              International Placement Experience?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('international_experience', true)}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  formData.international_experience === true
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => updateField('international_experience', false)}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  formData.international_experience === false
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Industries & Demand */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Primary Industries (select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => toggleIndustry(industry)}
                  className={`p-3 text-sm rounded-lg border transition-all ${
                    formData.primary_industries.includes(industry)
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Client Demand for O-1 Talent</label>
            <div className="space-y-2">
              {CLIENT_DEMANDS.map((demand) => (
                <button
                  key={demand.value}
                  type="button"
                  onClick={() => updateField('client_demand', demand.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                    formData.client_demand === demand.value
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {demand.label}
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
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
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
