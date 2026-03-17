// src/app/(dashboard)/dashboard/employer/jobs/new/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface JobFormData {
  title: string;
  description: string;
  locations: string;
  salary_min?: number;
  salary_max?: number;
  engagement_type: string;
  required_skills?: string;
}

const JOB_LIMITS: Record<string, number> = {
  free:       2,
  starter:    5,
  growth:     15,
  business:   50,
  enterprise: Infinity,
};

export default function NewJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Subscription gate ────────────────────────────────────────────────────
  const [planCheck, setPlanCheck] = useState<{
    loading: boolean;
    canPost: boolean;
    activeJobs: number;
    jobLimit: number;
    tier: string;
  }>({ loading: true, canPost: false, activeJobs: 0, jobLimit: 2, tier: 'free' });

  useEffect(() => {
    async function checkPlan() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const authData   = getSupabaseAuthData();

      if (!authData) {
        setPlanCheck(p => ({ ...p, loading: false }));
        return;
      }

      const { access_token: token, user } = authData;
      const headers = {
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      };

      try {
        // 1. Get employer profile id
        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/employer_profiles?user_id=eq.${user.id}&select=id`,
          { cache: 'no-store', headers }
        );
        const profiles = await profileRes.json();
        if (!profiles?.length) {
          setPlanCheck(p => ({ ...p, loading: false }));
          return;
        }
        const employerId = profiles[0].id;

        // 2. Fetch subscription tier
        const subRes = await fetch(
          `${supabaseUrl}/rest/v1/employer_subscriptions?employer_id=eq.${employerId}&select=tier`,
          { cache: 'no-store', headers }
        );
        const subs = await subRes.json();
        const tier = subs?.[0]?.tier ?? 'free';
        const jobLimit = JOB_LIMITS[tier] ?? 2;

        // 3. Count active jobs
        const jobsRes = await fetch(
          `${supabaseUrl}/rest/v1/job_listings?employer_id=eq.${employerId}&status=eq.active&select=id`,
          { cache: 'no-store', headers }
        );
        const activeJobs = (await jobsRes.json())?.length ?? 0;

        setPlanCheck({
          loading: false,
          canPost: activeJobs < jobLimit,
          activeJobs,
          jobLimit,
          tier,
        });
      } catch {
        // On error, allow posting (fail open)
        setPlanCheck({ loading: false, canPost: true, activeJobs: 0, jobLimit: 2, tier: 'free' });
      }
    }

    checkPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      engagement_type: 'full_time',
    },
  });

  const onSubmit = async (data: JobFormData) => {
    console.log('=== SUBMIT START ===');
    setSaving(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      // ── 1. Auth ────────────────────────────────────────────────────────────
      const authData = getSupabaseAuthData();

      if (!authData) {
        setError('Session expired. Please log out and log in again.');
        return;
      }

      const accessToken = authData.access_token;
      const userId = authData.user.id;
      const userEmail: string = authData.user.email ?? '';

      console.log('User ID:', userId);

      // ── 2. Employer profile ───────────────────────────────────────────────
      console.log('Fetching employer profile...');
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/employer_profiles?user_id=eq.${userId}&select=id,company_name`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: anonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Profile response status:', profileResponse.status);

      if (!profileResponse.ok) {
        const errText = await profileResponse.text();
        setError(`Failed to get profile: ${errText}`);
        return;
      }

      const profiles = await profileResponse.json();
      console.log('Employer profiles:', profiles);

      if (!profiles || profiles.length === 0) {
        setError('Employer profile not found. Please complete your profile first.');
        return;
      }

      const employerId = profiles[0].id;
      const companyName: string = profiles[0].company_name ?? '';
      console.log('Employer ID:', employerId);

      // ── 3. Re-verify plan limit at submit time ────────────────────────────
      console.log('Re-checking plan limit...');
      const [subRes, activeJobsRes] = await Promise.all([
        fetch(
          `${supabaseUrl}/rest/v1/employer_subscriptions?employer_id=eq.${employerId}&select=tier`,
          {
            cache: 'no-store',
            headers: { Authorization: `Bearer ${accessToken}`, apikey: anonKey, 'Content-Type': 'application/json' },
          }
        ),
        fetch(
          `${supabaseUrl}/rest/v1/job_listings?employer_id=eq.${employerId}&status=eq.active&select=id`,
          {
            cache: 'no-store',
            headers: { Authorization: `Bearer ${accessToken}`, apikey: anonKey, 'Content-Type': 'application/json' },
          }
        ),
      ]);

      const subs = await subRes.json();
      const currentTier = subs?.[0]?.tier ?? 'free';
      const currentLimit = JOB_LIMITS[currentTier] ?? 2;
      const currentActiveJobs = (await activeJobsRes.json())?.length ?? 0;

      console.log(`Plan: ${currentTier}, active: ${currentActiveJobs}/${currentLimit}`);

      if (currentActiveJobs >= currentLimit) {
        setSaving(false);
        setError(
          `You've reached the active job limit for your ${currentTier} plan ` +
          `(${currentActiveJobs}/${currentLimit === Infinity ? '∞' : currentLimit}). ` +
          `Please close an existing job or upgrade your plan.`
        );
        setPlanCheck({ loading: false, canPost: false, activeJobs: currentActiveJobs, jobLimit: currentLimit, tier: currentTier });
        return;
      }

      // ── 4. Insert job ─────────────────────────────────────────────────────
      const jobData = {
        employer_id: employerId,
        title: data.title,
        description: data.description,
        locations: data.locations ? [data.locations] : [],
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        engagement_type: data.engagement_type,
        required_skills: data.required_skills
          ? data.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        status: 'active',
      };

      console.log('Inserting job:', jobData);

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/job_listings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: anonKey,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(jobData),
      });

      console.log('Insert response status:', insertResponse.status);
      const responseText = await insertResponse.text();
      console.log('Insert response body:', responseText);

      if (!insertResponse.ok) {
        console.error('Insert error:', responseText);
        setError(`Failed to create job: ${responseText}`);
        return;
      }

      console.log('Job created successfully!');

      // ── 5. Send confirmation email (non-blocking) ─────────────────────────
      if (userEmail) {
        try {
          await fetch('/api/send-job-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: userEmail,
              toName: companyName || undefined,
              jobTitle: data.title,
              jobLocation: data.locations || null,
              engagementType: data.engagement_type,
              salaryMin: data.salary_min || null,
              salaryMax: data.salary_max || null,
            }),
          });
          console.log('Confirmation email sent to:', userEmail);
        } catch (emailErr) {
          // Email failure should NOT block the user — job is already saved
          console.warn('Email send failed (non-critical):', emailErr);
        }
      }

      router.push('/dashboard/employer/jobs');
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      console.log('=== SUBMIT END ===');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/employer/jobs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-gray-600">Create a new job listing for O-1 talent</p>
        </div>
      </div>

      {/* ── Plan gate: loading ── */}
      {planCheck.loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16 gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking your plan…
          </CardContent>
        </Card>
      )}

      {/* ── Plan gate: limit reached ── */}
      {!planCheck.loading && !planCheck.canPost && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center gap-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Active job limit reached
                </h2>
                <p className="text-gray-600 text-sm">
                  Your{' '}
                  <span className="font-medium capitalize">{planCheck.tier}</span>{' '}
                  plan allows up to{' '}
                  <span className="font-medium">
                    {planCheck.jobLimit === Infinity ? 'unlimited' : planCheck.jobLimit}
                  </span>{' '}
                  active job{planCheck.jobLimit !== 1 ? 's' : ''}. You currently have{' '}
                  <span className="font-medium">{planCheck.activeJobs}</span> active.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Close or pause an existing listing, or upgrade your plan to post more jobs.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Link
                  href="/dashboard/employer/jobs"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Manage Existing Jobs
                </Link>
                <Link
                  href="/dashboard/employer/billing"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Upgrade Plan
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Form: only rendered when allowed ── */}
      {!planCheck.loading && planCheck.canPost && (
        <>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    {...register('title', { required: 'Job title is required' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      {...register('locations')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      {...register('engagement_type')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Min ($)
                    </label>
                    <input
                      {...register('salary_min', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                      placeholder="e.g., 100000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Max ($)
                    </label>
                    <input
                      {...register('salary_max', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                      placeholder="e.g., 150000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>
                  <textarea
                    {...register('required_skills')}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                    placeholder="Enter skills separated by commas, e.g., Python, Machine Learning, AWS"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Post Job
                  </button>
                </div>
              </CardContent>
            </Card>
          </form>
        </>
      )}
    </div>
  );
}