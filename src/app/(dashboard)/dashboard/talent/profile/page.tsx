'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Resolver } from 'react-hook-form';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

// ── Curated skills list — all O-1 relevant domains ───────────────────────────
const SKILLS_LIST: string[] = [
  // Technology & Engineering
  'Python','JavaScript','TypeScript','React','Next.js','Node.js','Vue.js','Angular',
  'Rust','Go','Java','C++','C#','Swift','Kotlin','Ruby','PHP','Scala','R','MATLAB',
  'SQL','PostgreSQL','MySQL','MongoDB','Redis','GraphQL','REST APIs','gRPC',
  'Docker','Kubernetes','AWS','Google Cloud','Azure','Terraform','CI/CD',
  'Machine Learning','Deep Learning','Neural Networks','Computer Vision',
  'Natural Language Processing','Large Language Models','Generative AI',
  'Reinforcement Learning','Data Science','Data Engineering','MLOps',
  'PyTorch','TensorFlow','Keras','Scikit-learn','Hugging Face','LangChain',
  'Linux','Unix','Bash','Shell Scripting','DevOps','Site Reliability Engineering',
  'Cybersecurity','Penetration Testing','Cryptography','Blockchain','Web3','Solidity',
  'System Design','Distributed Systems','Microservices','Cloud Architecture',
  'Embedded Systems','FPGA','IoT','Robotics','Computer Vision','Signal Processing',
  'Algorithms','Data Structures','Compiler Design','Operating Systems',
  // Research & Science
  'Research','Academic Writing','Scientific Writing','Grant Writing','Peer Review',
  'Bioinformatics','Computational Biology','Genomics','Proteomics','CRISPR',
  'Molecular Biology','Cell Biology','Biochemistry','Neuroscience','Pharmacology',
  'Clinical Research','Clinical Trials','Epidemiology','Biostatistics',
  'Physics','Quantum Computing','Quantum Mechanics','Astrophysics','Materials Science',
  'Chemistry','Organic Chemistry','Chemical Engineering','Nanotechnology',
  'Environmental Science','Climate Modeling','GIS','Remote Sensing',
  'Statistics','Econometrics','Applied Mathematics','Linear Algebra','Calculus',
  // Business & Management
  'Product Management','Product Strategy','Roadmap Planning','Agile','Scrum','Kanban',
  'Project Management','Program Management','PMP','Six Sigma','Lean',
  'Business Strategy','Strategic Planning','Business Development','Partnerships',
  'Financial Modeling','Valuation','Investment Analysis','Venture Capital','Private Equity',
  'Marketing','Digital Marketing','SEO','SEM','Content Marketing','Brand Strategy',
  'Sales','Enterprise Sales','B2B Sales','CRM','Salesforce','HubSpot',
  'Operations','Supply Chain','Logistics','Process Improvement',
  'Human Resources','Talent Acquisition','Organizational Design',
  'Consulting','Management Consulting','Business Analysis',
  'Entrepreneurship','Startup Founding','Fundraising','Pitch Decks',
  // Arts & Creative
  'UI Design','UX Design','Product Design','Figma','Sketch','Adobe XD',
  'Graphic Design','Illustration','Typography','Brand Identity',
  'Motion Graphics','Video Editing','Animation','3D Modeling','Blender','Cinema 4D',
  'Photography','Cinematography','Film Production','Documentary',
  'Music Production','Audio Engineering','Sound Design','Mixing','Mastering',
  'Creative Writing','Screenwriting','Copywriting','Technical Writing',
  'Architecture','Interior Design','Industrial Design',
  // Law & Immigration
  'Immigration Law','O-1 Visa','EB-1','EB-2 NIW','H-1B','L-1',
  'Intellectual Property','Patent Law','Trademark','Copyright',
  'Corporate Law','Contract Law','Mergers & Acquisitions','Securities Law',
  'Litigation','Arbitration','Mediation','Compliance','Regulatory Affairs',
  // Medicine & Healthcare
  'Clinical Medicine','Surgery','Internal Medicine','Pediatrics','Oncology',
  'Radiology','Pathology','Cardiology','Neurology','Psychiatry',
  'Medical Research','Drug Discovery','Biomedical Engineering','Health Informatics',
  'Telemedicine','Public Health','Global Health','Health Policy',
  // Finance & Economics
  'Investment Banking','Asset Management','Portfolio Management','Risk Management',
  'Quantitative Finance','Algorithmic Trading','Derivatives','Fixed Income',
  'Accounting','Financial Reporting','GAAP','IFRS','Tax Planning','Audit',
  'Economics','Macroeconomics','Microeconomics','Behavioral Economics',
  'Cryptocurrency','DeFi','FinTech',
  // Communication & Leadership
  'Public Speaking','Keynote Speaking','Thought Leadership','Executive Communication',
  'Team Leadership','Cross-functional Collaboration','Stakeholder Management',
  'Coaching','Mentoring','Training & Development',
  'Languages: English','Languages: Spanish','Languages: Mandarin','Languages: French',
  'Languages: German','Languages: Arabic','Languages: Japanese','Languages: Hindi',
].sort();

// Regex: must look like a real skill — letters, spaces, dots, hyphens, plus, colon, &
const SKILL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9 .+\-&:/()#]{1,49}$/;

function isValidSkill(value: string): boolean {
  const trimmed = value.trim();
  // Must match the curated list OR pass the regex (allows custom but legitimate skills)
  return SKILLS_LIST.includes(trimmed) || SKILL_REGEX.test(trimmed);
}

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
  const [skillError, setSkillError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Bio state
  const [bio, setBio] = useState('');

  // Auth state
  const [authData, setAuthData] = useState<{ userId: string; accessToken: string } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  useEffect(() => {
    async function loadProfile() {
      // Get auth data directly from cookie instead of using hanging supabase.auth.getUser()
      const auth = getSupabaseAuthData();
      
      if (!auth?.user) {
        router.push('/login');
        return;
      }

      const userId = auth.user.id;
      const accessToken = auth.access_token;
      
      setAuthData({ userId, accessToken });

      try {
        // Fetch profile using direct REST API call
        const response = await fetch(
          `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${userId}&select=*`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const profiles = await response.json();
          if (profiles && profiles[0]) {
            setProfile(profiles[0]);
            setSkills(profiles[0].skills || []);
            setBio(profiles[0].bio || '');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, supabaseUrl, supabaseAnonKey]);

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
    resolver: zodResolver(talentLocationSchema) as Resolver<TalentLocationFormData>,
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
    if (!profile || !authData) {
      setMessage({ type: 'error', text: 'Profile not loaded. Please refresh.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    // For professional tab, include skills and bio
    if (activeTab === 'professional') {
      data.skills = skills;
      data.bio = bio;
    }

    try {
      // Update profile using direct REST API call
      const response = await fetch(
        `${supabaseUrl}/rest/v1/talent_profiles?id=eq.${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authData.accessToken}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update error:', errorData);
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfile({ ...profile, ...data } as TalentProfile);
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    }

    setSaving(false);
  };

  const handleSkillInput = (value: string) => {
    setSkillInput(value);
    setSkillError(null);
    if (value.trim().length >= 1) {
      const lower = value.toLowerCase();
      const matched = SKILLS_LIST
        .filter(s => s.toLowerCase().includes(lower) && !skills.includes(s))
        .slice(0, 8);
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addSkill = (override?: string) => {
    const skill = (override || skillInput).trim();
    if (!skill) return;

    if (skills.includes(skill)) {
      setSkillError('This skill is already added.');
      setSkillInput('');
      setShowSuggestions(false);
      return;
    }

    if (skills.length >= 20) {
      setSkillError('Maximum 20 skills allowed.');
      return;
    }

    if (!isValidSkill(skill)) {
      setSkillError('Please enter a valid skill name (letters, spaces, hyphens only — no sentences or special characters).');
      return;
    }

    setSkills([...skills, skill]);
    setSkillInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSkillError(null);
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your talent profile information</p>
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
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FormErrorSummary errors={basicForm.formState.errors} />
            <form onSubmit={basicForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...basicForm.register('first_name')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      basicForm.formState.errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={basicForm.formState.errors.last_name?.message} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  {...basicForm.register('phone')}
                  type="tel"
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  placeholder="e.g., Senior AI Researcher | Machine Learning Expert"
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    basicForm.formState.errors.professional_headline ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError message={basicForm.formState.errors.professional_headline?.message} />
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.city?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    {...locationForm.register('state')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.state?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    {...locationForm.register('country')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="willing_to_relocate" className="text-sm text-gray-700">
                  I&apos;m willing to relocate
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Arrangement
                  </label>
                  <select
                    {...locationForm.register('work_arrangement')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.work_arrangement ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select preference</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.engagement_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select type</option>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="consulting">Consulting</option>
                  </select>
                  <FieldError message={locationForm.formState.errors.engagement_type?.message} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Salary (USD)
                  </label>
                  <input
                    {...locationForm.register('salary_min', { valueAsNumber: true })}
                    type="number"
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      locationForm.formState.errors.salary_min ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={locationForm.formState.errors.salary_min?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Salary (USD)
                  </label>
                  <input
                    {...locationForm.register('salary_preferred', { valueAsNumber: true })}
                    type="number"
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FormErrorSummary errors={professionalForm.formState.errors} />
            <form onSubmit={professionalForm.handleSubmit((data) => handleSave(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Job Title
                  </label>
                  <input
                    {...professionalForm.register('current_job_title')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.current_employer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={professionalForm.formState.errors.current_employer?.message} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    {...professionalForm.register('industry')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.years_experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <FieldError message={professionalForm.formState.errors.years_experience?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>
                  <select
                    {...professionalForm.register('seniority')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      professionalForm.formState.errors.seniority ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                  <FieldError message={professionalForm.formState.errors.seniority?.message} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <span className="text-xs text-gray-400">{skills.length}/20</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Type to search from our curated list, or enter a custom skill name. Press Enter or click Add.
                </p>

                {/* Autocomplete input */}
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => handleSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                        if (e.key === 'Escape') { setShowSuggestions(false); }
                        if (e.key === 'ArrowDown' && suggestions.length > 0) {
                          e.preventDefault();
                          const first = document.getElementById('skill-suggestion-0');
                          first?.focus();
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onFocus={() => skillInput.length >= 1 && suggestions.length > 0 && setShowSuggestions(true)}
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 ${
                        skillError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g. Machine Learning, Python, UX Design…"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      disabled={skills.length >= 20}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>

                  {/* Dropdown suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-20 left-0 right-12 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <li key={s}>
                          <button
                            id={`skill-suggestion-${i}`}
                            type="button"
                            onMouseDown={() => addSkill(s)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addSkill(s);
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                document.getElementById(`skill-suggestion-${i + 1}`)?.focus();
                              }
                              if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                if (i === 0) {
                                  (document.querySelector('input[placeholder*="Machine Learning"]') as HTMLInputElement)?.focus();
                                } else {
                                  document.getElementById(`skill-suggestion-${i - 1}`)?.focus();
                                }
                              }
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none transition-colors"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Validation error */}
                {skillError && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {skillError}
                  </p>
                )}

                {/* Added skills */}
                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
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

                {skills.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400 italic">No skills added yet.</p>
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
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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