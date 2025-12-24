'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WaitlistForm, FormInput, FormSelect, FormTextarea } from '@/components/waitlist/WaitlistForm';
import { Mail, User, Briefcase, Linkedin, Building2, ArrowLeft } from 'lucide-react';

const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology / Software' },
  { value: 'ai_ml', label: 'AI / Machine Learning' },
  { value: 'finance', label: 'Finance / Fintech' },
  { value: 'healthcare', label: 'Healthcare / Biotech' },
  { value: 'research', label: 'Research / Academia' },
  { value: 'arts', label: 'Arts / Entertainment' },
  { value: 'sports', label: 'Sports / Athletics' },
  { value: 'media', label: 'Media / Journalism' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_OPTIONS = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '11-15', label: '11-15 years' },
  { value: '15+', label: '15+ years' },
];

const VISA_STATUS_OPTIONS = [
  { value: 'no_visa', label: 'No US visa currently' },
  { value: 'h1b', label: 'H-1B visa' },
  { value: 'f1_opt', label: 'F-1 OPT/STEM OPT' },
  { value: 'l1', label: 'L-1 visa' },
  { value: 'o1', label: 'Already have O-1' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'other', label: 'Other visa type' },
];

const TIMELINE_OPTIONS = [
  { value: 'immediately', label: 'As soon as possible' },
  { value: 'within_30_days', label: 'Within 30 days' },
  { value: 'within_90_days', label: 'Within 3 months' },
  { value: 'within_6_months', label: 'Within 6 months' },
  { value: 'exploring', label: 'Just exploring options' },
];

const REFERRAL_OPTIONS = [
  { value: 'google', label: 'Google search' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'friend', label: 'Friend or colleague' },
  { value: 'lawyer', label: 'Immigration lawyer' },
  { value: 'employer', label: 'Potential employer' },
  { value: 'other', label: 'Other' },
];

export default function TalentWaitlistPage() {
  const [formData, setFormData] = useState<Record<string, unknown>>({
    full_name: '',
    email: '',
    phone: '',
    current_job_title: '',
    current_employer: '',
    years_experience: '',
    industry: '',
    linkedin_url: '',
    visa_status: '',
    target_timeline: '',
    referral_source: '',
    notes: '',
  });

  const updateField = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to join waitlist');
    }

    return result;
  };

  const steps = [
    {
      title: 'Basic Info',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about yourself</h3>
          <FormInput
            label="Full Name"
            name="full_name"
            placeholder="John Doe"
            required
            value={formData.full_name as string}
            onChange={updateField('full_name')}
            icon={User}
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={formData.email as string}
            onChange={updateField('email')}
            icon={Mail}
          />
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone as string}
            onChange={updateField('phone')}
          />
        </div>
      ),
    },
    {
      title: 'Experience',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your professional background</h3>
          <FormInput
            label="Current Job Title"
            name="current_job_title"
            placeholder="Senior Software Engineer"
            value={formData.current_job_title as string}
            onChange={updateField('current_job_title')}
            icon={Briefcase}
          />
          <FormInput
            label="Current Employer"
            name="current_employer"
            placeholder="Company Name"
            value={formData.current_employer as string}
            onChange={updateField('current_employer')}
            icon={Building2}
          />
          <FormSelect
            label="Years of Experience"
            name="years_experience"
            options={EXPERIENCE_OPTIONS}
            value={formData.years_experience as string}
            onChange={updateField('years_experience')}
          />
          <FormSelect
            label="Industry"
            name="industry"
            options={INDUSTRY_OPTIONS}
            value={formData.industry as string}
            onChange={updateField('industry')}
          />
          <FormInput
            label="LinkedIn Profile"
            name="linkedin_url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin_url as string}
            onChange={updateField('linkedin_url')}
            icon={Linkedin}
          />
        </div>
      ),
    },
    {
      title: 'O-1 Plans',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your O-1 visa journey</h3>
          <FormSelect
            label="Current Visa Status"
            name="visa_status"
            options={VISA_STATUS_OPTIONS}
            value={formData.visa_status as string}
            onChange={updateField('visa_status')}
          />
          <FormSelect
            label="When do you plan to apply for O-1?"
            name="target_timeline"
            options={TIMELINE_OPTIONS}
            value={formData.target_timeline as string}
            onChange={updateField('target_timeline')}
          />
          <FormSelect
            label="How did you hear about O1DMatch?"
            name="referral_source"
            options={REFERRAL_OPTIONS}
            value={formData.referral_source as string}
            onChange={updateField('referral_source')}
          />
          <FormTextarea
            label="Anything else you'd like us to know?"
            name="notes"
            placeholder="Tell us about your achievements, goals, or any questions you have..."
            value={formData.notes as string}
            onChange={updateField('notes')}
            rows={4}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/waitlist"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to waitlist options
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">O-1 Talent Waitlist</h1>
          <p className="text-gray-600">
            Join as an O-1 visa candidate and get early access to connect with US employers.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <WaitlistForm
            userType="talent"
            steps={steps}
            onSubmit={handleSubmit}
            formData={formData}
            
          />
        </div>
      </div>
    </div>
  );
}
