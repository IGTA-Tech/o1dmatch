// src/app/(dashboard)/dashboard/employer/jobs/[id]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface JobFormData {
  title: string;
  description: string;
  department?: string;
  locations: string;
  salary_min?: number;
  salary_max?: number;
  engagement_type: string;
  work_arrangement?: string;
  required_skills?: string;
  preferred_skills?: string;
  min_years_experience?: number;
  min_education?: string;
  status: string;
}

interface JobData {
  id: string;
  title: string;
  description: string;
  department?: string;
  locations?: string[];
  salary_min?: number;
  salary_max?: number;
  engagement_type?: string;
  work_arrangement?: string;
  required_skills?: string[];
  preferred_skills?: string[];
  min_years_experience?: number;
  min_education?: string;
  status?: string;
  employer_id: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      engagement_type: 'full_time',
      work_arrangement: 'on_site',
      status: 'active',
    },
  });

  // Fetch existing job data
  useEffect(() => {
    const fetchJob = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      try {
        const authData = getSupabaseAuthData();

        if (!authData) {
          router.push('/login');
          return;
        }

        const accessToken = authData.access_token;
        const userId = authData.user.id;

        // Get employer profile first
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/employer_profiles?user_id=eq.${userId}&select=id`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!profileResponse.ok) {
          setError('Failed to get employer profile');
          setLoading(false);
          return;
        }

        const profiles = await profileResponse.json();

        if (!profiles || profiles.length === 0) {
          setError('Employer profile not found');
          setLoading(false);
          return;
        }

        const employerId = profiles[0].id;

        // Fetch job details
        const jobResponse = await fetch(
          `${supabaseUrl}/rest/v1/job_listings?id=eq.${jobId}&employer_id=eq.${employerId}&select=*`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!jobResponse.ok) {
          setError('Failed to fetch job details');
          setLoading(false);
          return;
        }

        const jobs = await jobResponse.json();

        if (!jobs || jobs.length === 0) {
          setError('Job not found or you do not have permission to edit it');
          setLoading(false);
          return;
        }

        const jobData = jobs[0];
        setJob(jobData);

        // Populate form with existing data
        reset({
          title: jobData.title || '',
          description: jobData.description || '',
          department: jobData.department || '',
          locations: jobData.locations?.join(', ') || '',
          salary_min: jobData.salary_min || undefined,
          salary_max: jobData.salary_max || undefined,
          engagement_type: jobData.engagement_type || 'full_time',
          work_arrangement: jobData.work_arrangement || 'on_site',
          required_skills: jobData.required_skills?.join(', ') || '',
          preferred_skills: jobData.preferred_skills?.join(', ') || '',
          min_years_experience: jobData.min_years_experience || undefined,
          min_education: jobData.min_education || '',
          status: jobData.status || 'active',
        });

      } catch (err) {
        console.error('Error fetching job:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, router, reset]);

  const onSubmit = async (data: JobFormData) => {
    console.log("=== UPDATE START ===");
    setSaving(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      const authData = getSupabaseAuthData();

      if (!authData) {
        setError('Session expired. Please log out and log in again.');
        setSaving(false);
        return;
      }

      const accessToken = authData.access_token;

      // Prepare updated job data
      const jobData = {
        title: data.title,
        description: data.description,
        department: data.department || null,
        locations: data.locations 
          ? data.locations.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        engagement_type: data.engagement_type,
        work_arrangement: data.work_arrangement || 'on_site',
        required_skills: data.required_skills
          ? data.required_skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        preferred_skills: data.preferred_skills
          ? data.preferred_skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        min_years_experience: data.min_years_experience || null,
        min_education: data.min_education || null,
        status: data.status,
      };

      console.log("Updating job:", jobData);

      // Update job
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/job_listings?id=eq.${jobId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(jobData),
        }
      );

      console.log("Update response status:", updateResponse.status);
      const responseText = await updateResponse.text();
      console.log("Update response body:", responseText);

      if (!updateResponse.ok) {
        console.error("Update error:", responseText);
        setError(`Failed to update job: ${responseText}`);
        setSaving(false);
        return;
      }

      console.log("Job updated successfully!");
      router.push('/dashboard/employer/jobs');
    } catch (err) {
      console.error("Error:", err);
      setError('An unexpected error occurred');
    } finally {
      console.log("=== UPDATE END ===");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
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
            <h1 className="text-2xl font-bold text-gray-900">Job Not Found</h1>
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-gray-600">Update your job listing details</p>
        </div>
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  {...register('title', { required: 'Job title is required' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  {...register('department')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Engineering, Marketing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locations
                </label>
                <input
                  {...register('locations')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., San Francisco, CA, New York, NY"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple locations with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Arrangement
                </label>
                <select
                  {...register('work_arrangement')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="on_site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  {...register('engagement_type')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 150000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Years of Experience
                </label>
                <input
                  {...register('min_years_experience', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Education
                </label>
                <select
                  {...register('min_education')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No requirement</option>
                  <option value="high_school">High School</option>
                  <option value="bachelors">Bachelor&apos;s Degree</option>
                  <option value="masters">Master&apos;s Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills
              </label>
              <textarea
                {...register('required_skills')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter skills separated by commas, e.g., Python, Machine Learning, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Skills
              </label>
              <textarea
                {...register('preferred_skills')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter nice-to-have skills separated by commas"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/dashboard/employer/jobs"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
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
      </form>
    </div>
  );
}