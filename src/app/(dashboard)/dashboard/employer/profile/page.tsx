'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Upload,
  X,
  Image as ImageIcon,
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

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile on mount using REST API
  useEffect(() => {
    async function loadProfile() {
      console.log('Loading employer profile...');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const accessToken = getSupabaseToken();

      if (!accessToken) {
        console.log('No access token, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        // Get current user
        console.log('Fetching current user...');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey,
          },
        });

        if (!userResponse.ok) {
          console.log('User fetch failed, redirecting to login');
          router.push('/login');
          return;
        }

        const user = await userResponse.json();
        console.log('User loaded:', user.id);

        // Get employer profile
        console.log('Fetching employer profile...');
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/employer_profiles?user_id=eq.${user.id}&select=*`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': anonKey,
            },
          }
        );

        if (profileResponse.ok) {
          const profiles = await profileResponse.json();
          console.log('Profile loaded:', profiles);
          if (profiles && profiles.length > 0) {
            setProfile(profiles[0]);
            // Set existing logo as preview
            if (profiles[0].company_logo_url) {
              setLogoPreview(profiles[0].company_logo_url);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

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

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, GIF, etc.)' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Logo file must be less than 5MB' });
        return;
      }
      
      setLogoFile(file);
      setMessage(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(profile?.company_logo_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload logo to Supabase storage
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !profile) return profile?.company_logo_url || null;

    setUploadingLogo(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const accessToken = getSupabaseToken();

    if (!accessToken) {
      console.error('No access token for upload');
      setUploadingLogo(false);
      return profile?.company_logo_url || null;
    }

    try {
      const fileExt = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `employer-${profile.id}/logo-${Date.now()}.${fileExt}`;

      const response = await fetch(
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

      if (response.ok) {
        const logoUrl = `${supabaseUrl}/storage/v1/object/public/logos/${fileName}`;
        console.log('Logo uploaded:', logoUrl);
        return logoUrl;
      } else {
        const errorText = await response.text();
        console.error('Logo upload failed:', response.status, errorText);
        setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
        return profile?.company_logo_url || null;
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      return profile?.company_logo_url || null;
    } finally {
      setUploadingLogo(false);
    }
  };

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

      // Upload logo if new file selected
      let logoUrl = profile.company_logo_url;
      if (logoFile) {
        logoUrl = await uploadLogo();
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
      cleanedData.company_logo_url = logoUrl; // Add logo URL to update
  
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
          // Also update avatar_url in profiles table if logo was uploaded
          if (logoUrl) {
            await fetch(
              `${supabaseUrl}/rest/v1/profiles?id=eq.${profile.user_id}`,
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'apikey': anonKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  avatar_url: logoUrl,
                  updated_at: new Date().toISOString()
                }),
              }
            );
          }
          
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
          setProfile(result[0] as EmployerProfile);
          setLogoFile(null); // Clear file after successful upload
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

  const isProfileComplete =
    watch('company_name') &&
    watch('signatory_name') &&
    watch('signatory_email') &&
    watch('is_authorized_signatory') &&
    watch('understands_o1_usage') &&
    watch('agrees_to_terms');

  // Map field names to their respective tabs
  const fieldToTab: Record<string, TabKey> = {
    company_name: 'company',
    legal_name: 'company',
    dba_name: 'company',
    company_website: 'company',
    industry: 'company',
    company_size: 'company',
    year_founded: 'company',
    company_description: 'company',
    street_address: 'address',
    city: 'address',
    state: 'address',
    zip_code: 'address',
    country: 'address',
    signatory_name: 'signatory',
    signatory_title: 'signatory',
    signatory_email: 'signatory',
    signatory_phone: 'signatory',
    is_authorized_signatory: 'signatory',
    understands_o1_usage: 'signatory',
    agrees_to_terms: 'signatory',
  };

  // Handle validation errors - switch to the tab with errors and show message
  const onInvalid = (fieldErrors: FieldErrors<EmployerProfileFormData>) => {
    const errorFields = Object.keys(fieldErrors);
    
    if (errorFields.length > 0) {
      // Find the first tab with errors
      const firstErrorField = errorFields[0];
      const targetTab = fieldToTab[firstErrorField];
      
      if (targetTab && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
      
      // Build error message
      const errorMessages: string[] = [];
      errorFields.forEach((field) => {
        const error = fieldErrors[field as keyof EmployerProfileFormData];
        if (error?.message) {
          errorMessages.push(error.message);
        }
      });
      
      const tabName = targetTab ? TABS.find(t => t.key === targetTab)?.label : 'form';
      setMessage({ 
        type: 'error', 
        text: `Please fix the errors in the ${tabName} tab: ${errorMessages.join(', ')}` 
      });
    }
  };

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
            <p className="text-gray-600">Complete your profile to send interest letters</p>
          </div>
        </div>

        {/* Profile Status */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isProfileComplete
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {isProfileComplete ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Profile Complete
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              Profile Incomplete
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {TABS.map((tab) => {
            // Check if this tab has any errors
            const tabHasErrors = Object.keys(errors).some(
              (field) => fieldToTab[field] === tab.key
            );
            
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : tabHasErrors
                    ? 'border-transparent text-red-500 hover:text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tabHasErrors && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" title="Has errors" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleSave, onInvalid)}>
        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-start gap-6">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, or GIF. Max 5MB. Recommended: 200x200px or larger.
                    </p>
                    {uploadingLogo && (
                      <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading logo...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Name
                  </label>
                  <input
                    {...register('legal_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="If different from company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DBA Name
                  </label>
                  <input
                    {...register('dba_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Doing Business As"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    {...register('company_website')}
                    type="url"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    {...register('industry')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Technology, Finance"
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
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1001+">1001+ employees</option>
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
                    max={new Date().getFullYear()}
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
                  placeholder="Describe your company and what makes it unique..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving || uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {uploadingLogo ? 'Uploading...' : 'Save Changes'}
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