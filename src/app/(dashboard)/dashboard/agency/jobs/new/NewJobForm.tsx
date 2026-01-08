'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  MapPin,
  Loader2,
  Save,
  Building2,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  company_name: string;
  industry: string | null;
}

interface NewJobFormProps {
  agencyId: string;
  agencyName: string;
  clients: Client[];
}

export function NewJobForm({ agencyId, agencyName, clients }: NewJobFormProps) {
  if(agencyName){} console.log(agencyName);
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client Selection
  const [selectedClientId, setSelectedClientId] = useState('');

  // Job Details
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [engagementType, setEngagementType] = useState('full_time');
  const [workArrangement, setWorkArrangement] = useState('hybrid');
  const [locations, setLocations] = useState('');

  // Compensation
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [showSalary, setShowSalary] = useState(true);

  // Requirements
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
//   const [educationLevel, setEducationLevel] = useState('');
  const [visaSponsorship, setVisaSponsorship] = useState(true);

  const validateForm = () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return false;
    }
    if (!title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!description.trim()) {
      setError('Job description is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('job_listings')
        .insert({
          agency_id: agencyId,
          agency_client_id: selectedClientId,
          title: title.trim(),
          department: department.trim() || null,
          description: description.trim(),
          engagement_type: engagementType,
          work_arrangement: workArrangement,
          locations: locations ? locations.split(',').map(l => l.trim()).filter(Boolean) : [],
          salary_min: salaryMin || null,
          salary_max: salaryMax || null,
          show_salary: showSalary,
          required_skills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
          experience_level: experienceLevel || null,
        //   education_level: educationLevel || null,
          visa_sponsorship: visaSponsorship,
          status: 'active',
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push('/dashboard/agency/jobs');
      router.refresh();

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/agency/jobs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-gray-600">Create a job listing for a client</p>
        </div>
      </div>

      {/* No Clients Warning */}
      {clients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Added</h3>
            <p className="text-gray-600 mb-4">
              You need to add a client before posting a job.
            </p>
            <Link
              href="/dashboard/agency/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Your First Client
            </Link>
          </CardContent>
        </Card>
      )}

      {clients.length > 0 && (
        <form onSubmit={handleSubmit}>
          {/* Client Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Client Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name}
                      {client.industry && ` (${client.industry})`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This job will be posted on behalf of the selected client.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior AI Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engagement Type
                  </label>
                  <select
                    value={engagementType}
                    onChange={(e) => setEngagementType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Arrangement
                  </label>
                  <select
                    value={workArrangement}
                    onChange={(e) => setWorkArrangement(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locations
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., San Francisco, New York (comma separated)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Min ($)
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Max ($)
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 250000"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showSalary"
                  checked={showSalary}
                  onChange={(e) => setShowSalary(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="showSalary" className="text-sm text-gray-700">
                  Display salary range on job listing
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Python, Machine Learning, TensorFlow (comma separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (6-10 years)</option>
                    <option value="lead">Lead / Principal (10+ years)</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not specified</option>
                    <option value="high_school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor&apos;s Degree</option>
                    <option value="master">Master&apos;s Degree</option>
                    <option value="doctorate">Doctorate (PhD)</option>
                  </select>
                </div> */}
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="visaSponsorship"
                  checked={visaSponsorship}
                  onChange={(e) => setVisaSponsorship(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="visaSponsorship" className="text-sm text-gray-700">
                  <span className="font-medium">O-1 Visa Sponsorship Available</span>
                  <span className="block text-gray-500">Client will sponsor O-1 visa for qualified candidates</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/dashboard/agency/jobs"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}