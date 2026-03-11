// src/app/(dashboard)/dashboard/agency/profile/profile-client.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Loader2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseToken } from '@/lib/supabase/getToken';

interface AgencyProfile {
  id: string;
  user_id: string;
  agency_name: string;
  legal_name?: string | null;
  agency_website?: string | null;
  agency_description?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  agency_logo_url?: string | null;
  [key: string]: unknown;
}

interface AgencyProfileFormData {
  agency_name: string;
  legal_name?: string;
  agency_website?: string;
  agency_description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface AgencyProfileClientProps {
  profile: AgencyProfile | null;
}

export function AgencyProfileClient({ profile: initialProfile }: AgencyProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<AgencyProfile | null>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialProfile?.agency_logo_url || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgencyProfileFormData>({
    values: profile ? {
      agency_name: profile.agency_name || '',
      legal_name: profile.legal_name || '',
      agency_website: profile.agency_website || '',
      agency_description: profile.agency_description || '',
      street_address: profile.street_address || '',
      city: profile.city || '',
      state: profile.state || '',
      zip_code: profile.zip_code || '',
      country: profile.country || 'USA',
      contact_name: profile.contact_name || '',
      contact_email: profile.contact_email || '',
      contact_phone: profile.contact_phone || '',
    } : undefined,
  });

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, etc.)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo must be less than 5MB' });
      return;
    }
    setLogoFile(file);
    setMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(profile?.agency_logo_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !profile) return profile?.agency_logo_url || null;

    setUploadingLogo(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const accessToken = getSupabaseToken();

    if (!accessToken) {
      setUploadingLogo(false);
      return profile?.agency_logo_url || null;
    }

    try {
      const fileExt = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `agency-${profile.id}/logo-${Date.now()}.${fileExt}`;

      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/logos/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey,
            'Content-Type': logoFile.type,
            'x-upsert': 'true',
          },
          body: logoFile,
        }
      );

      if (res.ok) {
        return `${supabaseUrl}/storage/v1/object/public/logos/${fileName}`;
      } else {
        const errText = await res.text();
        console.error('Logo upload failed:', res.status, errText);
        setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
        return profile?.agency_logo_url || null;
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      return profile?.agency_logo_url || null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (data: AgencyProfileFormData) => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      // Upload logo first if a new file was selected
      let logoUrl = profile.agency_logo_url || null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const response = await fetch('/api/agency/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, ...data, agency_logo_url: logoUrl }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfile({ ...profile, ...data, agency_logo_url: logoUrl });
        setLogoFile(null);
        // Delay refresh so the success message stays visible
        setTimeout(() => router.refresh(), 1500);
        // Auto-dismiss after 4s
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save changes.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agency" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agency Profile</h1>
            <p className="text-gray-600">Manage your agency information</p>
          </div>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">No agency profile found</p>
            <p className="text-sm text-amber-700 mt-1">
              Please visit your <Link href="/dashboard/agency" className="underline font-medium">dashboard</Link> to set up your agency profile first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/agency"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agency Profile</h1>
          <p className="text-gray-600">Manage your agency information</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 shadow-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        {/* Agency Info */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agency Logo
              </label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Agency logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="agency-logo-upload"
                  />
                  <label
                    htmlFor="agency-logo-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {uploadingLogo
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Upload className="w-4 h-4" />}
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name *
                </label>
                <input
                  {...register('agency_name', { required: 'Agency name is required' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.agency_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.agency_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Name
                </label>
                <input
                  {...register('legal_name')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                {...register('agency_website')}
                type="url"
                placeholder="https://"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('agency_description')}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
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
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  {...register('contact_name')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('contact_email')}
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...register('contact_phone')}
                  type="tel"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
      </form>
    </div>
  );
}