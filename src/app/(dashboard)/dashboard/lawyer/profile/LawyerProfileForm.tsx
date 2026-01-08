'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Save,
  Loader2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface LawyerProfile {
  id: string;
  user_id: string;
  attorney_name: string;
  attorney_title: string | null;
  firm_name: string;
  firm_logo_url: string | null;
  bio: string | null;
  specializations: string[] | null;
  visa_types: string[] | null;
  firm_size: string | null;
  office_location: string | null;
  website_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  tier: string | null;
  is_active: boolean;
}

interface UserProfile {
  full_name: string | null;
  email: string | null;
}

interface LawyerProfileFormProps {
  lawyerProfile: LawyerProfile | null;
  userProfile: UserProfile | null;
  userId: string;
  userEmail: string;
}

export default function LawyerProfileForm({
  lawyerProfile,
  userProfile,
  userId,
  userEmail,
}: LawyerProfileFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state - matching actual table columns
  const [attorneyName, setAttorneyName] = useState(lawyerProfile?.attorney_name || userProfile?.full_name || '');
  const [attorneyTitle, setAttorneyTitle] = useState(lawyerProfile?.attorney_title || '');
  const [contactEmail, setContactEmail] = useState(lawyerProfile?.contact_email || userEmail || '');
  const [contactPhone, setContactPhone] = useState(lawyerProfile?.contact_phone || '');
  const [firmName, setFirmName] = useState(lawyerProfile?.firm_name || '');
  const [firmSize, setFirmSize] = useState(lawyerProfile?.firm_size || '');
  const [websiteUrl, setWebsiteUrl] = useState(lawyerProfile?.website_url || '');
  const [officeLocation, setOfficeLocation] = useState(lawyerProfile?.office_location || '');
  const [bio, setBio] = useState(lawyerProfile?.bio || '');
  const [specializationsInput, setSpecializationsInput] = useState('');
  const [specializations, setSpecializations] = useState<string[]>(lawyerProfile?.specializations || []);
  const [visaTypesInput, setVisaTypesInput] = useState('');
  const [visaTypes, setVisaTypes] = useState<string[]>(lawyerProfile?.visa_types || []);
  const [isActive, setIsActive] = useState(lawyerProfile?.is_active ?? true);

  // Add specialization
  const addSpecialization = () => {
    const trimmed = specializationsInput.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations([...specializations, trimmed]);
      setSpecializationsInput('');
    }
  };

  const removeSpecialization = (item: string) => {
    setSpecializations(specializations.filter(s => s !== item));
  };

  // Add visa type
  const addVisaType = () => {
    const trimmed = visaTypesInput.trim();
    if (trimmed && !visaTypes.includes(trimmed)) {
      setVisaTypes([...visaTypes, trimmed]);
      setVisaTypesInput('');
    }
  };

  const removeVisaType = (item: string) => {
    setVisaTypes(visaTypes.filter(v => v !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent, addFn: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFn();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Start saving lawyer profile");
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!anonKey || !supabaseUrl) {
        throw new Error('Missing Supabase configuration');
      }

      const profileData = {
        user_id: userId,
        attorney_name: attorneyName.trim(),
        attorney_title: attorneyTitle.trim() || null,
        firm_name: firmName.trim(),
        firm_size: firmSize || null,
        website_url: websiteUrl.trim() || null,
        office_location: officeLocation.trim() || null,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || null,
        bio: bio.trim() || null,
        specializations: specializations,
        visa_types: visaTypes,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      console.log("Profile data:", profileData);

      let response: Response;

      if (lawyerProfile) {
        // Update existing profile
        console.log("Updating existing profile:", lawyerProfile.id);
        response = await fetch(
          `${supabaseUrl}/rest/v1/lawyer_profiles?id=eq.${lawyerProfile.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(profileData),
          }
        );
      } else {
        // Insert new profile
        console.log("Creating new profile");
        response = await fetch(
          `${supabaseUrl}/rest/v1/lawyer_profiles`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(profileData),
          }
        );
      }

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (response.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        let errorMessage = 'Failed to save profile';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.details || responseText;
        } catch {
          errorMessage = responseText || `Error ${response.status}`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/lawyer"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lawyerProfile ? 'Edit Profile' : 'Create Profile'}
          </h1>
          <p className="text-gray-600">Manage your public attorney profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attorney Name *
                </label>
                <input
                  type="text"
                  value={attorneyName}
                  onChange={(e) => setAttorneyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={attorneyTitle}
                  onChange={(e) => setAttorneyTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Partner, Managing Attorney"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firm Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Firm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firm Name *
                </label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Law Firm Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firm Size
                </label>
                <select
                  value={firmSize}
                  onChange={(e) => setFirmSize(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="solo">Solo Practice</option>
                  <option value="small">Small (2-10)</option>
                  <option value="medium">Medium (11-50)</option>
                  <option value="large">Large (51-200)</option>
                  <option value="enterprise">Enterprise (200+)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., New York, NY"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specializations
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specializationsInput}
                  onChange={(e) => setSpecializationsInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, addSpecialization)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Immigration Law"
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {specializations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {specializations.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeSpecialization(item)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visa Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Types Handled
              </label>
              <div className="flex gap-2">
                <select
                  value={visaTypesInput}
                  onChange={(e) => setVisaTypesInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select visa type</option>
                  <option value="O-1A">O-1A</option>
                  <option value="O-1B">O-1B</option>
                  <option value="EB-1A">EB-1A</option>
                  <option value="EB-1B">EB-1B</option>
                  <option value="EB-2 NIW">EB-2 NIW</option>
                  <option value="H-1B">H-1B</option>
                  <option value="L-1">L-1</option>
                  <option value="E-2">E-2</option>
                  <option value="EB-5">EB-5</option>
                </select>
                <button
                  type="button"
                  onClick={addVisaType}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {visaTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {visaTypes.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeVisaType(item)}
                        className="hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tell potential clients about your experience and expertise..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isActive ? (
                  <Eye className="w-5 h-5 text-green-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {isActive ? 'Profile is Active' : 'Profile is Inactive'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isActive
                      ? 'Your profile is visible in the lawyer directory'
                      : 'Your profile is hidden from the public directory'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
            Profile saved successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/lawyer"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}