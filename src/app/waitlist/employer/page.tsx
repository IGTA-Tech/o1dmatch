'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WaitlistForm, FormInput, FormSelect, FormTextarea } from '@/components/waitlist/WaitlistForm';
import { Mail, User, Building2, Globe, ArrowLeft } from 'lucide-react';

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '100-499', label: '100-499 employees' },
  { value: '500+', label: '500+ employees' },
  { value: '1000+', label: '1000+ employees' },
];

const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology / Software' },
  { value: 'ai_ml', label: 'AI / Machine Learning' },
  { value: 'finance', label: 'Finance / Fintech' },
  { value: 'healthcare', label: 'Healthcare / Biotech' },
  { value: 'research', label: 'Research / Academia' },
  { value: 'media', label: 'Media / Entertainment' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

const HIRING_TIMELINE_OPTIONS = [
  { value: 'immediately', label: 'Actively hiring now' },
  { value: 'within_30_days', label: 'Within 30 days' },
  { value: 'within_90_days', label: 'Within 3 months' },
  { value: 'within_6_months', label: 'Within 6 months' },
  { value: 'exploring', label: 'Just exploring' },
];

const ROLES_COUNT_OPTIONS = [
  { value: '1', label: '1 role' },
  { value: '2-5', label: '2-5 roles' },
  { value: '6-10', label: '6-10 roles' },
  { value: '10+', label: '10+ roles' },
];

const REFERRAL_OPTIONS = [
  { value: 'google', label: 'Google search' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'referral', label: 'Referral from another company' },
  { value: 'lawyer', label: 'Immigration lawyer' },
  { value: 'conference', label: 'Conference / Event' },
  { value: 'other', label: 'Other' },
];

export default function EmployerWaitlistPage() {
  const [formData, setFormData] = useState<Record<string, unknown>>({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    company_website: '',
    company_size: '',
    industry: '',
    hiring_timeline: '',
    roles_count: '',
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
      title: 'Contact Info',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your contact information</h3>
          <FormInput
            label="Full Name"
            name="full_name"
            placeholder="Jane Smith"
            required
            value={formData.full_name as string}
            onChange={updateField('full_name')}
            icon={User}
          />
          <FormInput
            label="Work Email"
            name="email"
            type="email"
            placeholder="you@company.com"
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
      title: 'Company',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About your company</h3>
          <FormInput
            label="Company Name"
            name="company_name"
            placeholder="Acme Inc."
            required
            value={formData.company_name as string}
            onChange={updateField('company_name')}
            icon={Building2}
          />
          <FormInput
            label="Company Website"
            name="company_website"
            placeholder="https://company.com"
            value={formData.company_website as string}
            onChange={updateField('company_website')}
            icon={Globe}
          />
          <FormSelect
            label="Company Size"
            name="company_size"
            options={COMPANY_SIZE_OPTIONS}
            value={formData.company_size as string}
            onChange={updateField('company_size')}
          />
          <FormSelect
            label="Industry"
            name="industry"
            options={INDUSTRY_OPTIONS}
            value={formData.industry as string}
            onChange={updateField('industry')}
          />
        </div>
      ),
    },
    {
      title: 'Hiring Plans',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your O-1 hiring plans</h3>
          <FormSelect
            label="When do you plan to hire O-1 talent?"
            name="hiring_timeline"
            options={HIRING_TIMELINE_OPTIONS}
            value={formData.hiring_timeline as string}
            onChange={updateField('hiring_timeline')}
          />
          <FormSelect
            label="How many O-1 roles are you looking to fill?"
            name="roles_count"
            options={ROLES_COUNT_OPTIONS}
            value={formData.roles_count as string}
            onChange={updateField('roles_count')}
          />
          <FormSelect
            label="How did you hear about O1DMatch?"
            name="referral_source"
            options={REFERRAL_OPTIONS}
            value={formData.referral_source as string}
            onChange={updateField('referral_source')}
          />
          <FormTextarea
            label="What type of roles are you looking to fill?"
            name="notes"
            placeholder="Tell us about the positions, required skills, or any specific requirements..."
            value={formData.notes as string}
            onChange={updateField('notes')}
            rows={4}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Waitlist</h1>
          <p className="text-gray-600">
            Get early access to our pool of pre-vetted O-1 ready talent.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <WaitlistForm
            userType="employer"
            steps={steps}
            onSubmit={handleSubmit}
            formData={formData}
            
          />
        </div>
      </div>
    </div>
  );
}
