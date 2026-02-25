// src/app/(dashboard)/dashboard/employer/jobs/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
// import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseAuthData  } from '@/lib/supabase/getToken';

interface JobFormData {
    title: string;
    description: string;
    locations: string;
    salary_min?: number;
    salary_max?: number;
    engagement_type: string;
    required_skills?: string;
}

export default function NewJobPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // const supabase = createClient();

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
      console.log("=== SUBMIT START ===");
      setSaving(true);
      setError(null);
    
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
      try {
        // Get auth data from cookie
        const authData = getSupabaseAuthData();
    
        if (!authData) {
          setError('Session expired. Please log out and log in again.');
          setSaving(false);
          return;
        }
    
        const accessToken = authData.access_token;
        const userId = authData.user.id;
    
        console.log("User ID:", userId);
    
        // Get employer profile
        console.log("Fetching employer profile...");
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
    
        console.log("Profile response status:", profileResponse.status);
    
        if (!profileResponse.ok) {
          const errText = await profileResponse.text();
          setError(`Failed to get profile: ${errText}`);
          setSaving(false);
          return;
        }
    
        const profiles = await profileResponse.json();
        console.log("Employer profiles:", profiles);
    
        if (!profiles || profiles.length === 0) {
          setError('Employer profile not found. Please complete your profile first.');
          setSaving(false);
          return;
        }
    
        const employerId = profiles[0].id;
        console.log("Employer ID:", employerId);
    
        // Prepare job data
        const jobData = {
          employer_id: employerId,
          title: data.title,
          description: data.description,
          locations: data.locations ? [data.locations] : [],
          salary_min: data.salary_min || null,
          salary_max: data.salary_max || null,
          engagement_type: data.engagement_type,
          required_skills: data.required_skills
            ? data.required_skills.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          status: 'active',
        };
    
        console.log("Inserting job:", jobData);
    
        // Insert job
        const insertResponse = await fetch(
          `${supabaseUrl}/rest/v1/job_listings`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(jobData),
          }
        );
    
        console.log("Insert response status:", insertResponse.status);
        const responseText = await insertResponse.text();
        console.log("Insert response body:", responseText);
    
        if (!insertResponse.ok) {
          console.error("Insert error:", responseText);
          setError(`Failed to create job: ${responseText}`);
          setSaving(false);
          return;
        }
    
        console.log("Job created successfully!");
        router.push('/dashboard/employer/jobs');
      } catch (err) {
        console.error("Error:", err);
        setError('An unexpected error occurred');
      } finally {
        console.log("=== SUBMIT END ===");
        setSaving(false);
      }
    };

    // const onSubmit = async (data: JobFormData) => {
    //     console.log("I am calling");
    //     setSaving(true);
    //     setError(null);

    //     try {
    //         const { data: { user } } = await supabase.auth.getUser();
    //         if (!user) {
    //             router.push('/login');
    //             return;
    //         }
    //         console.log(user);
    //         const { data: employerProfile } = await supabase
    //             .from('employer_profiles')
    //             .select('id')
    //             .eq('user_id', user.id)
    //             .single();
    //         console.log(employerProfile);
    //         if (!employerProfile) {
    //             setError('Employer profile not found');
    //             return;
    //         }
    //         console.log("I am calling -62");
    //         console.log("employerProfile.id => ", employerProfile.id);
    //         console.log("data ==> ", data);
    //         const { error: insertError } = await supabase
    //             .from('job_listings')
    //             .insert({
    //                 employer_id: employerProfile.id,
    //                 title: data.title,
    //                 description: data.description,
    //                 locations: data.locations ? [data.locations] : [],  // Convert string to array
    //                 salary_min: data.salary_min || null,
    //                 salary_max: data.salary_max || null,
    //                 engagement_type: data.engagement_type,
    //                 required_skills: data.required_skills
    //                     ? data.required_skills.split(',').map(s => s.trim()).filter(Boolean)  // Convert comma-separated string to array
    //                     : [],
    //                 status: 'active',
    //             });

    //         if (insertError) {
    //             setError(insertError.message);
    //             return;
    //         }

    //         router.push('/dashboard/employer/jobs');
    //     } catch {
    //         setError('An unexpected error occurred');
    //     } finally {
    //         setSaving(false);
    //     }
    // };

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
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Post Job
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}