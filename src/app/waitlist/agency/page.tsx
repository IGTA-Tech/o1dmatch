'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WaitlistForm, FormInput, FormSelect, FormTextarea } from '@/components/waitlist/WaitlistForm';
import { Mail, User, Briefcase, Globe, ArrowLeft } from 'lucide-react';

const CLIENTS_COUNT_OPTIONS = [
  { value: '1-5', label: '1-5 clients' },
  { value: '6-10', label: '6-10 clients' },
  { value: '11-25', label: '11-25 clients' },
  { value: '26-50', label: '26-50 clients' },
  { value: '50+', label: '50+ clients' },
];

const INDUSTRY_FOCUS_OPTIONS = [
  { value: 'technology', label: 'Technology / Software' },
  { value: 'ai_ml', label: 'AI / Machine Learning' },
  { value: 'finance', label: 'Finance / Fintech' },
  { value: 'healthcare', label: 'Healthcare / Biotech' },
  { value: 'research', label: 'Research / Academia' },
  { value: 'creative', label: 'Creative / Entertainment' },
  { value: 'general', label: 'General / Multiple industries' },
  { value: 'other', label: 'Other' },
];

const REFERRAL_OPTIONS = [
  { value: 'google', label: 'Google search' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'client', label: 'Client referral' },
  { value: 'partner', label: 'Partner agency' },
  { value: 'conference', label: 'Conference / Event' },
  { value: 'other', label: 'Other' },
];

export default function AgencyWaitlistPage() {
  const [formData, setFormData] = useState<Record<string, unknown>>({
    full_name: '',
    email: '',
    phone: '',
    agency_name: '',
    agency_website: '',
    clients_count: '',
    industry: '',
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
            placeholder="John Smith"
            required
            value={formData.full_name as string}
            onChange={updateField('full_name')}
            icon={User}
          />
          <FormInput
            label="Work Email"
            name="email"
            type="email"
            placeholder="you@agency.com"
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
      title: 'Agency Info',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About your agency</h3>
          <FormInput
            label="Agency Name"
            name="agency_name"
            placeholder="Top Talent Staffing"
            required
            value={formData.agency_name as string}
            onChange={updateField('agency_name')}
            icon={Briefcase}
          />
          <FormInput
            label="Agency Website"
            name="agency_website"
            placeholder="https://agency.com"
            value={formData.agency_website as string}
            onChange={updateField('agency_website')}
            icon={Globe}
          />
          <FormSelect
            label="Number of Active Clients"
            name="clients_count"
            options={CLIENTS_COUNT_OPTIONS}
            value={formData.clients_count as string}
            onChange={updateField('clients_count')}
          />
          <FormSelect
            label="Primary Industry Focus"
            name="industry"
            options={INDUSTRY_FOCUS_OPTIONS}
            value={formData.industry as string}
            onChange={updateField('industry')}
          />
        </div>
      ),
    },
    {
      title: 'Partnership',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Partnership details</h3>
          <FormSelect
            label="How did you hear about O1DMatch?"
            name="referral_source"
            options={REFERRAL_OPTIONS}
            value={formData.referral_source as string}
            onChange={updateField('referral_source')}
          />
          <FormTextarea
            label="Tell us about your O-1 placement experience"
            name="notes"
            placeholder="Have you placed O-1 candidates before? What industries do you focus on? Any specific partnership interests?"
            value={formData.notes as string}
            onChange={updateField('notes')}
            rows={4}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Partner Waitlist</h1>
          <p className="text-gray-600">
            Partner with O1DMatch to place O-1 talent with your clients.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <WaitlistForm
            userType="agency"
            steps={steps}
            onSubmit={handleSubmit}
            formData={formData}
            
          />
        </div>
      </div>
    </div>
  );
}
