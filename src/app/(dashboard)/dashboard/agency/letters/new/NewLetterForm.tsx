'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  ArrowLeft,
  Building2,
  User,
  Briefcase,
  DollarSign,
  MapPin,
  FileText,
  Loader2,
  Save,
  Send,
} from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  company_name: string;
  signatory_name: string;
  signatory_title: string | null;
  signatory_email: string;
}

interface Job {
  id: string;
  title: string;
  department: string | null;
  agency_client_id: string | null;
  client: { company_name: string } | null;
}

interface Talent {
  id: string;
  user_id: string | null;
  professional_headline: string | null;
  full_name: string | null;
  email: string | null;
}

interface NewLetterFormProps {
  agencyId: string;
  agencyName: string;
  clients: Client[];
  jobs: Job[];
  talents: Talent[];
  preselectedTalentId?: string;
  preselectedTalent?: {
    id: string;
    professional_headline: string | null;
    o1_score: number | null;
  } | null;
  preselectedTalentUser?: {
    full_name: string;
    email: string;
  } | null;
  preselectedJobId?: string;
  preselectedClientId?: string;
}

export default function NewLetterForm({
  agencyId,
  agencyName,
  clients,
  jobs,
  talents,
  preselectedTalentId,
  preselectedTalent,
  preselectedTalentUser,
  preselectedJobId,
  preselectedClientId,
}: NewLetterFormProps) {
  if(agencyName){console.log(agencyName);}
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '');
  const [selectedTalentId, setSelectedTalentId] = useState(preselectedTalentId || '');
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId || '');

  // Position Details
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [commitmentLevel, setCommitmentLevel] = useState('intent_to_engage');
  const [engagementType, setEngagementType] = useState('full_time');
  const [workArrangement, setWorkArrangement] = useState('hybrid');
  const [locations, setLocations] = useState('');
  const [startTiming, setStartTiming] = useState('');

  // Compensation
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [salaryNegotiable, setSalaryNegotiable] = useState(true);

  // O-1 Justification
  const [dutiesDescription, setDutiesDescription] = useState('');
  const [whyO1Required, setWhyO1Required] = useState('');

  // Personal Message
  const [letterContent, setLetterContent] = useState('');

  // Filter jobs by selected client
  const filteredJobs = selectedClientId
    ? jobs.filter(j => j.agency_client_id === selectedClientId)
    : jobs;

  // Auto-populate when job is selected
  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId);
      if (job) {
        setJobTitle(job.title);
        if (job.department) setDepartment(job.department);
        if (job.agency_client_id) setSelectedClientId(job.agency_client_id);
      }
    }
  }, [selectedJobId, jobs]);

  const validateForm = () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return false;
    }
    if (!selectedTalentId) {
      setError('Please select a talent');
      return false;
    }
    if (!jobTitle.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!dutiesDescription.trim()) {
      setError('Duties description is required for O-1 petition');
      return false;
    }
    if (!whyO1Required.trim()) {
      setError('O-1 justification is required for petition');
      return false;
    }
    return true;
  };

  /*const handleSubmit = async (isDraft: boolean) => {
    console.log("Started==========> ");
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('interest_letters')
        .insert({
          agency_id: agencyId,
          agency_client_id: selectedClientId,
          talent_id: selectedTalentId,
          job_id: selectedJobId || null,
          source_type: 'agency',
          job_title: jobTitle.trim(),
          department: department.trim() || null,
          commitment_level: commitmentLevel,
          engagement_type: engagementType,
          work_arrangement: workArrangement,
          locations: locations ? locations.split(',').map(l => l.trim()).filter(Boolean) : [],
          start_timing: startTiming || null,
          salary_min: salaryMin || null,
          salary_max: salaryMax || null,
          salary_negotiable: salaryNegotiable,
          duties_description: dutiesDescription.trim(),
          why_o1_required: whyO1Required.trim(),
          letter_content: letterContent.trim() || null,
          status: isDraft ? 'draft' : 'sent',
          sent_at: isDraft ? null : new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push('/dashboard/agency/letters');
      router.refresh();

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save letter');
    } finally {
      setSaving(false);
    }
  };*/

  const handleSubmit = async (isDraft: boolean) => {
    console.log("Sttart supabase communication =========> ");
    if (!validateForm()) return;
  
    setSaving(true);
    setError(null);
  
    try {
      console.log("Line 206 =========> ");
      const { error: insertError } = await supabase
        .from('interest_letters')
        .insert({
          agency_id: agencyId,
          agency_client_id: selectedClientId,
          talent_id: selectedTalentId,
          job_id: selectedJobId || null,
          source_type: 'agency',
          job_title: jobTitle.trim(),
          department: department.trim() || null,
          commitment_level: commitmentLevel,
          engagement_type: engagementType,
          work_arrangement: workArrangement,
          locations: locations ? locations.split(',').map(l => l.trim()).filter(Boolean) : [],
          start_timing: startTiming || null,
          salary_min: salaryMin || null,
          salary_max: salaryMax || null,
          salary_negotiable: salaryNegotiable,
          duties_description: dutiesDescription.trim(),
          why_o1_required: whyO1Required.trim(),
          letter_content: letterContent.trim() || null,
          status: isDraft ? 'draft' : 'sent',
          // REMOVED: sent_at - column doesn't exist in table
        });
        console.log("Line 231 =========> ");
  
      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }
  
      router.push('/dashboard/agency/letters');
      router.refresh();
  
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save letter');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/agency/letters"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Interest Letter</h1>
          <p className="text-gray-600">Create an interest letter on behalf of a client</p>
        </div>
      </div>

      {/* Preselected Talent Info */}
      {preselectedTalent && preselectedTalentUser && (
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{preselectedTalentUser.full_name}</h3>
              <p className="text-gray-600">{preselectedTalent.professional_headline}</p>
            </div>
            {preselectedTalent.o1_score && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {preselectedTalent.o1_score}%
                </div>
                <p className="text-sm text-gray-500">O-1 Score</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client & Talent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Client & Talent Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                No clients found.{' '}
                <Link href="/dashboard/agency/clients/new" className="text-blue-600 hover:underline">
                  Add a client first
                </Link>
              </p>
            )}
          </div>

          {!preselectedTalentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Talent *
              </label>
              <select
                value={selectedTalentId}
                onChange={(e) => setSelectedTalentId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a talent...</option>
                {talents.map((talent) => (
                  <option key={talent.id} value={talent.id}>
                    {talent.full_name || 'Unnamed'} - {talent.professional_headline || 'No headline'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Job Posting (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No linked job</option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} {job.client?.company_name ? `(${job.client.company_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Position Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Position Details
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
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
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
              Commitment Level *
            </label>
            <select
              value={commitmentLevel}
              onChange={(e) => setCommitmentLevel(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="exploratory_interest">Exploratory Interest</option>
              <option value="intent_to_engage">Intent to Engage</option>
              <option value="conditional_offer">Conditional Offer</option>
              <option value="firm_commitment">Firm Commitment</option>
              <option value="offer_extended">Offer Extended</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="consulting">Consulting</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Timing
              </label>
              <input
                type="text"
                value={startTiming}
                onChange={(e) => setStartTiming(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Upon visa approval"
              />
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
                placeholder="e.g., San Francisco, Remote (comma separated)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
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
              id="salaryNegotiable"
              checked={salaryNegotiable}
              onChange={(e) => setSalaryNegotiable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="salaryNegotiable" className="text-sm text-gray-700">
              Salary is negotiable
            </label>
          </div>
        </CardContent>
      </Card>

      {/* O-1 Justification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            O-1 Justification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            These sections are critical for the O-1 visa petition. Be specific about the role and why it requires someone of extraordinary ability.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Duties & Responsibilities *
            </label>
            <textarea
              value={dutiesDescription}
              onChange={(e) => setDutiesDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the specific duties and responsibilities of this role..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why O-1 Visa is Required *
            </label>
            <textarea
              value={whyO1Required}
              onChange={(e) => setWhyO1Required(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Explain why this position requires someone with extraordinary ability, and why the candidate's specific skills are necessary..."
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Message */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Message (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={letterContent}
            onChange={(e) => setLetterContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add a personal message to the candidate..."
          />
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/agency/letters"
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Letter
        </button>
      </div>
    </div>
  );
}