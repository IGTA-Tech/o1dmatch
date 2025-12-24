'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WaitlistForm, FormInput, FormSelect, FormTextarea } from '@/components/waitlist/WaitlistForm';
import { Mail, User, Scale, Globe, ArrowLeft, Award } from 'lucide-react';

const O1_CASES_OPTIONS = [
  { value: '0', label: 'New to O-1 cases' },
  { value: '1-5', label: '1-5 cases' },
  { value: '6-20', label: '6-20 cases' },
  { value: '21-50', label: '21-50 cases' },
  { value: '50+', label: '50+ cases' },
  { value: '100+', label: '100+ cases' },
];

const SPECIALIZATION_OPTIONS = [
  { value: 'tech_ai', label: 'Technology / AI' },
  { value: 'sciences', label: 'Sciences / Research' },
  { value: 'arts', label: 'Arts / Entertainment' },
  { value: 'sports', label: 'Sports / Athletics' },
  { value: 'business', label: 'Business / Executives' },
  { value: 'founders', label: 'Founders / Entrepreneurs' },
  { value: 'general', label: 'General Practice' },
];

const FIRM_SIZE_OPTIONS = [
  { value: 'solo', label: 'Solo practitioner' },
  { value: 'small', label: 'Small firm (2-10 attorneys)' },
  { value: 'medium', label: 'Medium firm (11-50 attorneys)' },
  { value: 'large', label: 'Large firm (50+ attorneys)' },
];

const REFERRAL_OPTIONS = [
  { value: 'google', label: 'Google search' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'aila', label: 'AILA / Bar association' },
  { value: 'colleague', label: 'Colleague referral' },
  { value: 'client', label: 'Client referral' },
  { value: 'conference', label: 'Conference / Event' },
  { value: 'other', label: 'Other' },
];

export default function LawyerWaitlistPage() {
  const [formData, setFormData] = useState<Record<string, unknown>>({
    full_name: '',
    email: '',
    phone: '',
    firm_name: '',
    firm_website: '',
    bar_number: '',
    o1_cases_handled: '',
    specialization: '',
    firm_size: '',
    referral_source: '',
    notes: '',
  });

  const updateField = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Map firm_website to the correct field for the API
    const submitData = {
      ...data,
      company_website: data.firm_website,
    };

    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
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
            placeholder="Sarah Johnson, Esq."
            required
            value={formData.full_name as string}
            onChange={updateField('full_name')}
            icon={User}
          />
          <FormInput
            label="Work Email"
            name="email"
            type="email"
            placeholder="you@lawfirm.com"
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
      title: 'Firm Info',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About your practice</h3>
          <FormInput
            label="Law Firm Name"
            name="firm_name"
            placeholder="Johnson Immigration Law"
            required
            value={formData.firm_name as string}
            onChange={updateField('firm_name')}
            icon={Scale}
          />
          <FormInput
            label="Firm Website"
            name="firm_website"
            placeholder="https://lawfirm.com"
            value={formData.firm_website as string}
            onChange={updateField('firm_website')}
            icon={Globe}
          />
          <FormInput
            label="Bar Number"
            name="bar_number"
            placeholder="123456"
            value={formData.bar_number as string}
            onChange={updateField('bar_number')}
            icon={Award}
          />
          <FormSelect
            label="Firm Size"
            name="firm_size"
            options={FIRM_SIZE_OPTIONS}
            value={formData.firm_size as string}
            onChange={updateField('firm_size')}
          />
        </div>
      ),
    },
    {
      title: 'Experience',
      fields: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your O-1 experience</h3>
          <FormSelect
            label="O-1 Cases Handled"
            name="o1_cases_handled"
            options={O1_CASES_OPTIONS}
            value={formData.o1_cases_handled as string}
            onChange={updateField('o1_cases_handled')}
          />
          <FormSelect
            label="Primary Specialization"
            name="specialization"
            options={SPECIALIZATION_OPTIONS}
            value={formData.specialization as string}
            onChange={updateField('specialization')}
          />
          <FormSelect
            label="How did you hear about O1DMatch?"
            name="referral_source"
            options={REFERRAL_OPTIONS}
            value={formData.referral_source as string}
            onChange={updateField('referral_source')}
          />
          <FormTextarea
            label="Tell us about your immigration practice"
            name="notes"
            placeholder="What types of O-1 cases do you handle? Any notable achievements or specialties?"
            value={formData.notes as string}
            onChange={updateField('notes')}
            rows={4}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
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
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Immigration Attorney Waitlist</h1>
          <p className="text-gray-600">
            Join our lawyer directory and connect with O-1 candidates.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <WaitlistForm
            userType="lawyer"
            steps={steps}
            onSubmit={handleSubmit}
            formData={formData}
            
          />
        </div>
      </div>
    </div>
  );
}
