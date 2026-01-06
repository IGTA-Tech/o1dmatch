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
  X,
  AlertCircle,
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

// Error message component
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </p>
  );
}

// Form error summary component
// Form error summary component - shows which fields have errors
function FormErrorSummary({ errors }: { errors: Record<string, { message?: string }> }) {
  const errorEntries = Object.entries(errors);
  if (errorEntries.length === 0) return null;
  
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
      <p className="text-sm text-red-700 flex items-center gap-2 font-medium">
        <AlertCircle className="w-4 h-4" />
        Please fix {errorEntries.length} error{errorEntries.length > 1 ? 's' : ''} before saving:
      </p>
      <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
        {errorEntries.map(([field, error]) => (
          <li key={field}>
            <span className="font-medium">{field}</span>: {error?.message || 'Invalid value'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TalentProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Skills input state
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Bio state
  const [bio, setBio] = useState('');

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
        setSkills(data.skills || []);
        setBio(data.bio || '');
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  const basicForm = useForm<TalentBasicInfoFormData>({
    resolver: zodResolver(talentBasicInfoSchema),
    mode: 'onSubmit',
    values: profile ? {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      professional_headline: profile.professional_headline || '',
    } : undefined,
  });

  const locationForm = useForm<TalentLocationFormData>({
    resolver: zodResolver(talentLocationSchema),
    mode: 'onSubmit',
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
    mode: 'onSubmit',
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
    mode: 'onSubmit',
    values: profile ? {
      education: profile.education as TalentEducationFormData['education'],
      university: profile.university || '',
      field_of_study: profile.field_of_study || '',
      graduation_year: profile.graduation_year || undefined,
    } : undefined,
  });

  const onlineForm = useForm<TalentOnlineProfilesFormData>({
    resolver: zodResolver(talentOnlineProfilesSchema),
    mode: 'onSubmit',
    values: profile ? {
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      google_scholar_url: profile.google_scholar_url || '',
      personal_website: profile.personal_website || '',
    } : undefined,
  });

  const handleSave = async (data: Record<string, unknown>) => {
    console.log("Save/update data");
    if (!profile) return;
    console.log(data);
    console.log("profile.id ==> ", profile.id);
    setSaving(true);
    setMessage(null);

    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${supabaseUrl}/rest/v1/talent_profiles?id=eq.${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token || anonKey}`,
            'apikey': anonKey!,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfile({ ...profile, ...data } as TalentProfile);
      } else {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    }

    setSaving(false);
  };

  // Handle basic info save with bio
  const handleBasicSave = async (data: TalentBasicInfoFormData) => {
    await handleSave({ ...data, bio });
  };

  // Handle professional save with skills
  const handleProfessionalSave = async (data: TalentProfessionalFormData) => {
    await handleSave({ ...data, skills });
  };

  // Skills management
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
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
            <FormErrorSummary errors={basicForm.formState.errors} />
            <form onSubmit={basicForm.handleSubmit(handleBasicSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...basicForm.register('first_name')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      basicForm.formState.errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={basicForm.formState.errors.first_name?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...basicForm.register('last_name')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      basicForm.formState.errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={basicForm.formState.errors.last_name?.message} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...basicForm.register('phone')}
                  type="tel"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    basicForm.formState.errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={basicForm.formState.errors.phone?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Headline
                </label>
                <input
                  {...basicForm.register('professional_headline')}
                  placeholder="e.g., Senior AI Researcher with 10+ years of experience"
                  maxLength={140}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    basicForm.formState.errors.professional_headline ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={basicForm.formState.errors.professional_headline?.message} />
                <p className="mt-1 text-xs text-gray-500">
                  A brief summary visible to employers (max 140 characters)
                </p>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell employers about yourself, your experience, achievements, and what you're looking for..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {bio.length}/2000 characters - Describe your background, expertise, and career goals
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
            <FormErrorSummary errors={locationForm.formState.errors} />
            <form onSubmit={locationForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    {...locationForm.register('city')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.city?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    {...locationForm.register('state')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.state?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    {...locationForm.register('country')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.country?.message} />
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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    locationForm.formState.errors.work_arrangement ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select preference</option>
                  <option value="on_site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="flexible">Flexible</option>
                </select>
                <FieldError message={locationForm.formState.errors.work_arrangement?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engagement Type
                </label>
                <select
                  {...locationForm.register('engagement_type')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    locationForm.formState.errors.engagement_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract_w2">Contract (W-2)</option>
                  <option value="consulting_1099">Consulting (1099)</option>
                  <option value="project_based">Project-based</option>
                </select>
                <FieldError message={locationForm.formState.errors.engagement_type?.message} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Salary ($)
                  </label>
                  <input
                    {...locationForm.register('salary_min', { valueAsNumber: true })}
                    type="number"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.salary_min ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.salary_min?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Salary ($)
                  </label>
                  <input
                    {...locationForm.register('salary_preferred', { valueAsNumber: true })}
                    type="number"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.salary_preferred ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.salary_preferred?.message} />
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
            <FormErrorSummary errors={professionalForm.formState.errors} />
            <form onSubmit={professionalForm.handleSubmit(handleProfessionalSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Job Title
                  </label>
                  <input
                    {...professionalForm.register('current_job_title')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.current_job_title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={professionalForm.formState.errors.current_job_title?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Employer
                  </label>
                  <input
                    {...professionalForm.register('current_employer')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.current_employer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={professionalForm.formState.errors.current_employer?.message} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    {...professionalForm.register('industry')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.industry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={professionalForm.formState.errors.industry?.message} />
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.years_experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={professionalForm.formState.errors.years_experience?.message} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                <select
                  {...professionalForm.register('seniority')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    professionalForm.formState.errors.seniority ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="principal">Principal</option>
                  <option value="executive">Executive</option>
                </select>
                <FieldError message={professionalForm.formState.errors.seniority?.message} />
              </div>

              {/* Skills Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Add skills relevant to your expertise (e.g., Python, Machine Learning, Data Analysis)
                </p>
                
                {/* Skills Tags */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-blue-900 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
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
            <FormErrorSummary errors={educationForm.formState.errors} />
            <form onSubmit={educationForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Education Level
                </label>
                <select
                  {...educationForm.register('education')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    educationForm.formState.errors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select level</option>
                  <option value="high_school">High School</option>
                  <option value="bachelors">Bachelor&apos;s Degree</option>
                  <option value="masters">Master&apos;s Degree</option>
                  <option value="phd">Ph.D.</option>
                  <option value="other">Other</option>
                </select>
                <FieldError message={educationForm.formState.errors.education?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  {...educationForm.register('university')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    educationForm.formState.errors.university ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={educationForm.formState.errors.university?.message} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    {...educationForm.register('field_of_study')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      educationForm.formState.errors.field_of_study ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={educationForm.formState.errors.field_of_study?.message} />
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      educationForm.formState.errors.graduation_year ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={educationForm.formState.errors.graduation_year?.message} />
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
            <FormErrorSummary errors={onlineForm.formState.errors} />
            <form onSubmit={onlineForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  {...onlineForm.register('linkedin_url')}
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    onlineForm.formState.errors.linkedin_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={onlineForm.formState.errors.linkedin_url?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  {...onlineForm.register('github_url')}
                  type="url"
                  placeholder="https://github.com/username"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    onlineForm.formState.errors.github_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={onlineForm.formState.errors.github_url?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Scholar URL
                </label>
                <input
                  {...onlineForm.register('google_scholar_url')}
                  type="url"
                  placeholder="https://scholar.google.com/citations?user=..."
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    onlineForm.formState.errors.google_scholar_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={onlineForm.formState.errors.google_scholar_url?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                <input
                  {...onlineForm.register('personal_website')}
                  type="url"
                  placeholder="https://example.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    onlineForm.formState.errors.personal_website ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={onlineForm.formState.errors.personal_website?.message} />
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