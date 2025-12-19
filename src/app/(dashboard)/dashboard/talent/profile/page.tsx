'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import {
  talentBasicInfoSchema,
  talentLocationSchema,
  talentProfessionalSchema,
  talentEducationSchema,
  talentOnlineProfilesSchema,
  TalentBasicInfoFormData,
  TalentLocationFormData,
  TalentProfessionalFormData,
  TalentEducationFormData,
  TalentOnlineProfilesFormData,
} from '@/types/forms';
import { TalentProfile } from '@/types/models';

type TabKey = 'basic' | 'location' | 'professional' | 'education' | 'online';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
  { key: 'location', label: 'Location & Preferences', icon: <MapPin className="w-4 h-4" /> },
  { key: 'professional', label: 'Professional', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { key: 'online', label: 'Online Profiles', icon: <Globe className="w-4 h-4" /> },
];

export default function TalentProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [profile, setProfile] = useState<TalentProfile | null>(null);
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
        .from('talent_profiles')
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

  const basicForm = useForm<TalentBasicInfoFormData>({
    resolver: zodResolver(talentBasicInfoSchema),
    values: profile ? {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      professional_headline: profile.professional_headline || '',
    } : undefined,
  });

  const locationForm = useForm<TalentLocationFormData>({
    resolver: zodResolver(talentLocationSchema),
    values: profile ? {
      city: profile.city || '',
      state: profile.state || '',
      country: profile.country || 'USA',
      willing_to_relocate: profile.willing_to_relocate || false,
      preferred_locations: profile.preferred_locations || [],
      work_arrangement: profile.work_arrangement as TalentLocationFormData['work_arrangement'],
      engagement_type: profile.engagement_type as TalentLocationFormData['engagement_type'],
      salary_min: profile.salary_min || undefined,
      salary_preferred: profile.salary_preferred || undefined,
      available_start: profile.available_start as TalentLocationFormData['available_start'],
      available_start_date: profile.available_start_date || undefined,
    } : undefined,
  });

  const professionalForm = useForm<TalentProfessionalFormData>({
    resolver: zodResolver(talentProfessionalSchema),
    values: profile ? {
      current_job_title: profile.current_job_title || '',
      current_employer: profile.current_employer || '',
      industry: profile.industry || '',
      years_experience: profile.years_experience || undefined,
      seniority: profile.seniority as TalentProfessionalFormData['seniority'],
      skills: profile.skills || [],
    } : undefined,
  });

  const educationForm = useForm<TalentEducationFormData>({
    resolver: zodResolver(talentEducationSchema),
    values: profile ? {
      education: profile.education as TalentEducationFormData['education'],
      university: profile.university || '',
      field_of_study: profile.field_of_study || '',
      graduation_year: profile.graduation_year || undefined,
    } : undefined,
  });

  const onlineForm = useForm<TalentOnlineProfilesFormData>({
    resolver: zodResolver(talentOnlineProfilesSchema),
    values: profile ? {
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      google_scholar_url: profile.google_scholar_url || '',
      personal_website: profile.personal_website || '',
    } : undefined,
  });

  const handleSave = async (data: Record<string, unknown>) => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('talent_profiles')
      .update(data)
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile({ ...profile, ...data } as TalentProfile);
    }

    setSaving(false);
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
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/talent"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information</p>
        </div>
      </div>

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
      <div className="flex gap-2 flex-wrap border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={basicForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...basicForm.register('first_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {basicForm.formState.errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {basicForm.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...basicForm.register('last_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {basicForm.formState.errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {basicForm.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...basicForm.register('phone')}
                  type="tel"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Headline
                </label>
                <input
                  {...basicForm.register('professional_headline')}
                  placeholder="e.g., Senior AI Researcher with 10+ years of experience"
                  maxLength={140}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  A brief summary visible to employers (max 140 characters)
                </p>
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
            </form>
          </CardContent>
        </Card>
      )}

      {/* Location & Preferences */}
      {activeTab === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle>Location & Work Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={locationForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    {...locationForm.register('city')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    {...locationForm.register('state')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    {...locationForm.register('country')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...locationForm.register('willing_to_relocate')}
                  type="checkbox"
                  id="willing_to_relocate"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="willing_to_relocate" className="text-sm text-gray-700">
                  Willing to relocate
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Arrangement
                </label>
                <select
                  {...locationForm.register('work_arrangement')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select preference</option>
                  <option value="on_site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engagement Type
                </label>
                <select
                  {...locationForm.register('engagement_type')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract_w2">Contract (W-2)</option>
                  <option value="consulting_1099">Consulting (1099)</option>
                  <option value="project_based">Project-based</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Salary ($)
                  </label>
                  <input
                    {...locationForm.register('salary_min', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Salary ($)
                  </label>
                  <input
                    {...locationForm.register('salary_preferred', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </form>
          </CardContent>
        </Card>
      )}

      {/* Professional */}
      {activeTab === 'professional' && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={professionalForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Job Title
                  </label>
                  <input
                    {...professionalForm.register('current_job_title')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Employer
                  </label>
                  <input
                    {...professionalForm.register('current_employer')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    {...professionalForm.register('industry')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    {...professionalForm.register('years_experience', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="50"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                <select
                  {...professionalForm.register('seniority')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="principal">Principal</option>
                  <option value="executive">Executive</option>
                </select>
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
            </form>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {activeTab === 'education' && (
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={educationForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Education Level
                </label>
                <select
                  {...educationForm.register('education')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="high_school">High School</option>
                  <option value="bachelors">Bachelor&apos;s Degree</option>
                  <option value="masters">Master&apos;s Degree</option>
                  <option value="phd">Ph.D.</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  {...educationForm.register('university')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    {...educationForm.register('field_of_study')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    {...educationForm.register('graduation_year', { valueAsNumber: true })}
                    type="number"
                    min="1950"
                    max="2030"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </form>
          </CardContent>
        </Card>
      )}

      {/* Online Profiles */}
      {activeTab === 'online' && (
        <Card>
          <CardHeader>
            <CardTitle>Online Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onlineForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  {...onlineForm.register('linkedin_url')}
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  {...onlineForm.register('github_url')}
                  type="url"
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Scholar URL
                </label>
                <input
                  {...onlineForm.register('google_scholar_url')}
                  type="url"
                  placeholder="https://scholar.google.com/citations?user=..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                <input
                  {...onlineForm.register('personal_website')}
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
