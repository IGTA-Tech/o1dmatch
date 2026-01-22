'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Building2,
  MapPin,
  User,
  Loader2,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { employerProfileSchema, EmployerProfileFormData } from '@/types/forms';
import { EmployerProfile } from '@/types/models';
import { getSupabaseToken } from '@/lib/supabase/getToken';

type TabKey = 'company' | 'address' | 'signatory';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'company', label: 'Company Info', icon: <Building2 className="w-4 h-4" /> },
  { key: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
  { key: 'signatory', label: 'Signatory', icon: <User className="w-4 h-4" /> },
];

export default function EmployerProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('company');
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EmployerProfileFormData>({
    resolver: zodResolver(employerProfileSchema),
    values: profile ? {
      company_name: profile.company_name || '',
      legal_name: profile.legal_name || '',
      dba_name: profile.dba_name || '',
      company_website: profile.company_website || '',
      industry: profile.industry || '',
      company_size: profile.company_size as EmployerProfileFormData['company_size'],
      year_founded: profile.year_founded || undefined,
      company_description: profile.company_description || '',
      street_address: profile.street_address || '',
      city: profile.city || '',
      state: profile.state || '',
      zip_code: profile.zip_code || '',
      country: profile.country || 'USA',
      signatory_name: profile.signatory_name || '',
      signatory_title: profile.signatory_title || '',
      signatory_email: profile.signatory_email || '',
      signatory_phone: profile.signatory_phone || '',
      is_authorized_signatory: profile.is_authorized_signatory || false,
      understands_o1_usage: profile.understands_o1_usage || false,
      agrees_to_terms: profile.agrees_to_terms || false,
    } : undefined,
  });


  const handleSave = async (data: EmployerProfileFormData) => {
    if (!profile) return;
  
    setSaving(true);
    setMessage(null);
  
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
    try {
      const accessToken = getSupabaseToken();
  
      if (!accessToken) {
        setMessage({ type: 'error', text: 'Session expired. Please log out and log in again.' });
        setSaving(false);
        return;
      }
  
      // Clean data
      const cleanedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === '' && !['company_name', 'signatory_name', 'signatory_email'].includes(key)) {
          cleanedData[key] = null;
        } else {
          cleanedData[key] = value;
        }
      }
      cleanedData.updated_at = new Date().toISOString();
  
      const response = await fetch(
        `${supabaseUrl}/rest/v1/employer_profiles?id=eq.${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(cleanedData),
        }
      );
  
      const responseText = await response.text();
  
      if (response.ok && responseText && responseText !== '[]') {
        const result = JSON.parse(responseText);
        if (result?.[0]) {
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
          setProfile(result[0] as EmployerProfile);
        }
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log out and log in again.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };


  /* CODE issue
  const handleSave = async (data: EmployerProfileFormData) => {
    if (!profile) return;
    console.log(data);
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('employer_profiles')
      .update(data)
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile({ ...profile, ...data } as EmployerProfile);
    }

    setSaving(false);
  };*/

  const isProfileComplete =
    watch('company_name') &&
    watch('signatory_name') &&
    watch('signatory_email') &&
    watch('is_authorized_signatory') &&
    watch('understands_o1_usage') &&
    watch('agrees_to_terms');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/employer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600">Manage your company information</p>
          </div>
        </div>

        {isProfileComplete ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Profile Complete</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Profile Incomplete</span>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.key
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleSave)}>
        {/* Company Info */}
        {activeTab === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  {...register('company_name')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Name
                  </label>
                  <input
                    {...register('legal_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DBA Name
                  </label>
                  <input
                    {...register('dba_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Website
                </label>
                <input
                  {...register('company_website')}
                  type="url"
                  placeholder="https://"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    {...register('industry')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    {...register('company_size')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Founded
                  </label>
                  <input
                    {...register('year_founded', { valueAsNumber: true })}
                    type="number"
                    min="1800"
                    max="2030"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Description
                </label>
                <textarea
                  {...register('company_description')}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address */}
        {activeTab === 'address' && (
          <Card>
            <CardHeader>
              <CardTitle>Company Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  {...register('street_address')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    {...register('city')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    {...register('state')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    {...register('zip_code')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    {...register('country')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signatory */}
        {activeTab === 'signatory' && (
          <Card>
            <CardHeader>
              <CardTitle>Authorized Signatory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                  The signatory is the person authorized to sign interest letters on behalf of
                  your company. This information will appear on all letters sent to candidates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('signatory_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.signatory_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.signatory_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    {...register('signatory_title')}
                    placeholder="e.g., CEO, Director of HR"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...register('signatory_email')}
                    type="email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.signatory_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.signatory_email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    {...register('signatory_phone')}
                    type="tel"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3">
                  <input
                    {...register('is_authorized_signatory')}
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I certify that I am authorized to sign interest letters on behalf of this company *
                  </span>
                </label>
                {errors.is_authorized_signatory && (
                  <p className="text-sm text-red-600">{errors.is_authorized_signatory.message}</p>
                )}

                <label className="flex items-start gap-3">
                  <input
                    {...register('understands_o1_usage')}
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I understand that interest letters are official documents that may be submitted
                    as part of O-1 visa petitions to USCIS *
                  </span>
                </label>
                {errors.understands_o1_usage && (
                  <p className="text-sm text-red-600">{errors.understands_o1_usage.message}</p>
                )}

                <label className="flex items-start gap-3">
                  <input
                    {...register('agrees_to_terms')}
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    *
                  </span>
                </label>
                {errors.agrees_to_terms && (
                  <p className="text-sm text-red-600">{errors.agrees_to_terms.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
