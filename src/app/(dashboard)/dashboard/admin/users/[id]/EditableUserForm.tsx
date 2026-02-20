// src/app/(dashboard)/dashboard/admin/users/[id]/EditableUserForm.tsx

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  User,
  Building2,
  Scale,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Briefcase,
  Loader2,
  Save,
  Pencil,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

// ── Types ─────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  role: string;
  skills: string[] | null;
  is_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface EditableUserFormProps {
  profile: Profile;
  additionalData: Record<string, unknown> | null;
}

// ── Helpers ───────────────────────────────────────────────
const ROLES = [
  { value: 'talent', label: 'Talent' },
  { value: 'employer', label: 'Employer' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'agency', label: 'Agency' },
  { value: 'admin', label: 'Admin' },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleBadge(userRole: string) {
  const map: Record<string, 'info' | 'success' | 'warning' | 'error' | 'default'> = {
    talent: 'info',
    employer: 'success',
    lawyer: 'warning',
    admin: 'error',
    agency: 'default',
  };
  const label = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  return <Badge variant={map[userRole] || 'default'}>{label}</Badge>;
}

function getRoleIcon(userRole: string) {
  const cls = 'w-8 h-8';
  switch (userRole) {
    case 'talent':
      return <User className={`${cls} text-blue-500`} />;
    case 'employer':
      return <Building2 className={`${cls} text-green-500`} />;
    case 'lawyer':
      return <Scale className={`${cls} text-yellow-500`} />;
    case 'admin':
      return <Shield className={`${cls} text-red-500`} />;
    default:
      return <User className={`${cls} text-gray-500`} />;
  }
}

// ── Inline Editable Field ─────────────────────────────────
function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  multiline = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      )}
    </div>
  );
}

// ── Toggle Field ──────────────────────────────────────────
function ToggleField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// ── Tags/Skills Editor ────────────────────────────────────
function TagsEditor({
  label,
  tags,
  onChange,
  placeholder = 'Add item...',
  tagColor = 'bg-gray-100 text-gray-700',
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  tagColor?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${tagColor}`}>
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────
export function EditableUserForm({ profile: initialProfile, additionalData: initialAdditional }: EditableUserFormProps) {
  const router = useRouter();

  // ── Profile state ──
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [headline, setHeadline] = useState(initialProfile.headline || '');
  const [email] = useState(initialProfile.email || '');
  const [location, setLocation] = useState(initialProfile.location || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');
  const [role, setRole] = useState(initialProfile.role);
  const [skills, setSkills] = useState<string[]>(initialProfile.skills || []);
  const [isVerified, setIsVerified] = useState(initialProfile.is_verified);
  const [onboardingCompleted, setOnboardingCompleted] = useState(initialProfile.onboarding_completed);

  // ── Talent state ──
  const [currentJobTitle, setCurrentJobTitle] = useState((initialAdditional?.current_job_title as string) || '');
  const [currentEmployer, setCurrentEmployer] = useState((initialAdditional?.current_employer as string) || '');
  const [yearsExperience, setYearsExperience] = useState(String(initialAdditional?.years_experience || ''));
  const [o1Score, setO1Score] = useState(String(initialAdditional?.o1_score ?? ''));

  // ── Employer state ──
  const [companyName, setCompanyName] = useState((initialAdditional?.company_name as string) || '');
  const [industry, setIndustry] = useState((initialAdditional?.industry as string) || '');
  const [companySize, setCompanySize] = useState((initialAdditional?.company_size as string) || '');
  const [companyWebsite, setCompanyWebsite] = useState((initialAdditional?.company_website as string) || '');
  const [companyLogoUrl, setCompanyLogoUrl] = useState((initialAdditional?.company_logo_url as string) || '');
  const [companyDescription, setCompanyDescription] = useState((initialAdditional?.company_description as string) || '');

  // ── Lawyer state ──
  const [lawFirm, setLawFirm] = useState((initialAdditional?.law_firm as string) || '');
  const [barNumber, setBarNumber] = useState((initialAdditional?.bar_number as string) || '');
  const [lawyerYearsExp, setLawyerYearsExp] = useState(String(initialAdditional?.years_experience || ''));
  const [practiceAreas, setPracticeAreas] = useState<string[]>((initialAdditional?.practice_areas as string[]) || []);

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    setErrors([]);
    setSaveSuccess(false);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authData = getSupabaseAuthData();

    if (!authData) {
      setErrors(['Session expired. Please log in again.']);
      setSaving(false);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${authData.access_token}`,
      'apikey': anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    const newErrors: string[] = [];

    // 1. Update profiles table
    try {
      const profilePayload: Record<string, unknown> = {
        full_name: fullName || null,
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        avatar_url: avatarUrl || null,
        role,
        skills: skills.length > 0 ? skills : null,
        is_verified: isVerified,
        onboarding_completed: onboardingCompleted,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${initialProfile.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(profilePayload),
      });

      if (!res.ok) {
        const text = await res.text();
        newErrors.push(`Profile update failed: ${text}`);
      }
    } catch (err) {
      newErrors.push(`Profile update error: ${(err as Error).message}`);
    }

    // 2. Update role-specific table
    if (role === 'talent' && initialAdditional) {
      try {
        const talentPayload: Record<string, unknown> = {
          current_job_title: currentJobTitle || null,
          current_employer: currentEmployer || null,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          o1_score: o1Score ? parseFloat(o1Score) : null,
          updated_at: new Date().toISOString(),
        };

        const res = await fetch(`${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${initialProfile.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(talentPayload),
        });

        if (!res.ok) {
          const text = await res.text();
          newErrors.push(`Talent profile update failed: ${text}`);
        }
      } catch (err) {
        newErrors.push(`Talent update error: ${(err as Error).message}`);
      }
    }

    if (role === 'employer' && initialAdditional) {
      try {
        const employerPayload: Record<string, unknown> = {
          company_name: companyName || null,
          industry: industry || null,
          company_size: companySize || null,
          company_website: companyWebsite || null,
          company_logo_url: companyLogoUrl || null,
          company_description: companyDescription || null,
          updated_at: new Date().toISOString(),
        };

        const res = await fetch(`${supabaseUrl}/rest/v1/employer_profiles?user_id=eq.${initialProfile.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(employerPayload),
        });

        if (!res.ok) {
          const text = await res.text();
          newErrors.push(`Employer profile update failed: ${text}`);
        }
      } catch (err) {
        newErrors.push(`Employer update error: ${(err as Error).message}`);
      }
    }

    if (role === 'lawyer' && initialAdditional) {
      try {
        const lawyerPayload: Record<string, unknown> = {
          law_firm: lawFirm || null,
          bar_number: barNumber || null,
          years_experience: lawyerYearsExp ? parseInt(lawyerYearsExp) : null,
          practice_areas: practiceAreas.length > 0 ? practiceAreas : null,
          updated_at: new Date().toISOString(),
        };

        const res = await fetch(`${supabaseUrl}/rest/v1/lawyer_profiles?user_id=eq.${initialProfile.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(lawyerPayload),
        });

        if (!res.ok) {
          const text = await res.text();
          newErrors.push(`Lawyer profile update failed: ${text}`);
        }
      } catch (err) {
        newErrors.push(`Lawyer update error: ${(err as Error).message}`);
      }
    }

    setSaving(false);

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.refresh();
      }, 2000);
    }
  }, [
    fullName, headline, bio, location, avatarUrl, role, skills, isVerified, onboardingCompleted,
    currentJobTitle, currentEmployer, yearsExperience, o1Score,
    companyName, industry, companySize, companyWebsite, companyLogoUrl, companyDescription,
    lawFirm, barNumber, lawyerYearsExp, practiceAreas,
    initialProfile.id, initialAdditional, router,
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600">{email}</p>
        </div>
        {getRoleBadge(role)}
      </div>

      {/* ── Save Bar ── */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" /> All changes saved
            </span>
          )}
          {errors.length > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
              <XCircle className="w-4 h-4" /> {errors.length} error(s)
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save All Changes</>
          )}
        </button>
      </div>

      {/* ── Errors ── */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-700">{err}</p>
          ))}
        </div>
      )}

      {/* ── Avatar & Basic Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6 mb-6">
            <div className="shrink-0">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  getRoleIcon(role)
                )}
              </div>
            </div>
            <div className="flex-1">
              <EditableField label="Avatar URL" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField label="Full Name" value={fullName} onChange={setFullName} placeholder="John Doe" />
            <EditableField label="Email" value={email} onChange={() => {}} disabled placeholder="user@email.com" />
            <EditableField label="Headline" value={headline} onChange={setHeadline} placeholder="Software Engineer" />
            <EditableField label="Location" value={location} onChange={setLocation} placeholder="New York, USA" />
          </div>

          <div className="mt-4">
            <EditableField label="Bio" value={bio} onChange={setBio} multiline placeholder="Write a short bio..." />
          </div>

          <div className="mt-4">
            <TagsEditor label="Skills" tags={skills} onChange={setSkills} placeholder="Add a skill..." />
          </div>
        </CardContent>
      </Card>

      {/* ── Toggles ── */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <ToggleField
            label="Verified"
            value={isVerified}
            onChange={setIsVerified}
            description="Whether this user's identity has been verified"
          />
          <ToggleField
            label="Onboarding Completed"
            value={onboardingCompleted}
            onChange={setOnboardingCompleted}
            description="Whether the user has finished the onboarding flow"
          />
        </CardContent>
      </Card>

      {/* ── Role ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  role === r.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {r.label}
                {initialProfile.role === r.value && (
                  <span className="ml-1 text-xs opacity-75">(current)</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Changing a user&apos;s role affects their access permissions immediately.
          </p>
        </CardContent>
      </Card>

      {/* ── Talent Fields ── */}
      {role === 'talent' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Talent Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initialAdditional ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField label="Current Job Title" value={currentJobTitle} onChange={setCurrentJobTitle} placeholder="Software Engineer" />
                <EditableField label="Current Employer" value={currentEmployer} onChange={setCurrentEmployer} placeholder="Google" />
                <EditableField label="Years of Experience" value={yearsExperience} onChange={setYearsExperience} type="number" placeholder="5" />
                <EditableField label="O-1 Score (%)" value={o1Score} onChange={setO1Score} type="number" placeholder="85" />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No talent profile record found. Save to update the main profile only.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Employer Fields ── */}
      {role === 'employer' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Employer Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initialAdditional ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Inc." />
                  <EditableField label="Industry" value={industry} onChange={setIndustry} placeholder="Technology" />
                  <EditableField label="Company Size" value={companySize} onChange={setCompanySize} placeholder="50-200" />
                  <EditableField label="Website" value={companyWebsite} onChange={setCompanyWebsite} placeholder="https://acme.com" />
                  <div className="md:col-span-2">
                    <EditableField label="Company Logo URL" value={companyLogoUrl} onChange={setCompanyLogoUrl} placeholder="https://..." />
                  </div>
                </div>
                {companyLogoUrl && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Preview:</span>
                    <img src={companyLogoUrl} alt="Logo" className="w-12 h-12 object-contain rounded border" />
                  </div>
                )}
                <EditableField label="Company Description" value={companyDescription} onChange={setCompanyDescription} multiline placeholder="About the company..." />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No employer profile record found. Save to update the main profile only.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Lawyer Fields ── */}
      {role === 'lawyer' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" /> Lawyer Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initialAdditional ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField label="Law Firm" value={lawFirm} onChange={setLawFirm} placeholder="Smith & Associates" />
                  <EditableField label="Bar Number" value={barNumber} onChange={setBarNumber} placeholder="BAR123456" />
                  <EditableField label="Years of Experience" value={lawyerYearsExp} onChange={setLawyerYearsExp} type="number" placeholder="10" />
                </div>
                <TagsEditor
                  label="Practice Areas"
                  tags={practiceAreas}
                  onChange={setPracticeAreas}
                  placeholder="Add practice area..."
                  tagColor="bg-yellow-50 text-yellow-700"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No lawyer profile record found. Save to update the main profile only.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Other Admin Actions ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Other Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Send Password Reset
            </button>
            {!isVerified && (
              <button
                onClick={() => setIsVerified(true)}
                className="px-4 py-2 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                Verify User
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Timestamps ── */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {formatDate(initialProfile.created_at)}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {formatDate(initialProfile.updated_at)}
            </div>
            <div>
              <span className="font-medium">User ID:</span>
              <code className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-xs">{initialProfile.id}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}