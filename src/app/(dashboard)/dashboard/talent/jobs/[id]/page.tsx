import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ApplyButton } from './ApplyButton';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get talent profile
  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  // Get job details
  const { data: job } = await supabase
    .from('job_listings')
    .select(`
      *,
      employer:employer_profiles(
        id,
        company_name,
        company_website,
        company_description,
        city,
        state,
        industry
      )
    `)
    .eq('id', id)
    .single();

  if (!job) {
    redirect('/dashboard/talent/jobs');
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from('job_applications')
    .select('id, status, created_at')
    .eq('job_id', id)
    .eq('talent_id', talentProfile.id)
    .single();

  const hasApplied = !!existingApplication;

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const talentScore = talentProfile.o1_score || 0;
  const meetsMinScore = talentScore >= (job.min_score || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/talent/jobs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-gray-600">{job.employer?.company_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.why_o1_required && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Why O-1 Talent?</h4>
                  <p className="text-blue-800 text-sm">{job.why_o1_required}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.required_skills && job.required_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {job.employer && (
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.employer.company_name}</h3>
                    {job.employer.industry && (
                      <p className="text-sm text-gray-600">{job.employer.industry}</p>
                    )}
                    {job.employer.city && (
                      <p className="text-sm text-gray-500 mt-1">
                        {job.employer.city}, {job.employer.state}
                      </p>
                    )}
                    {job.employer.company_description && (
                      <p className="text-sm text-gray-600 mt-3">
                        {job.employer.company_description}
                      </p>
                    )}
                    {job.employer.company_website && (
                      
                        <a href={job.employer.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardContent>
              {hasApplied ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Already Applied</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Applied on {new Date(existingApplication.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className="capitalize">{existingApplication.status}</span>
                  </p>
                  <Link
                    href="/dashboard/talent/applications"
                    className="text-blue-600 hover:underline text-sm mt-3 inline-block"
                  >
                    View My Applications
                  </Link>
                </div>
              ) : (
                <div>
                  {!meetsMinScore && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your O-1 score ({talentScore}%) is below the minimum requirement ({job.min_score}%).
                        You can still apply, but consider improving your profile.
                      </p>
                    </div>
                  )}
                  <ApplyButton
                    jobId={job.id}
                    talentId={talentProfile.id}
                    talentScore={talentScore}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Info */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Salary Range</p>
                  <p className="font-medium">{formatSalary(job.salary_min, job.salary_max)}</p>
                </div>
              </div>

              {job.locations && job.locations.length > 0 && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{job.locations.join(', ')}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Work Arrangement</p>
                  <p className="font-medium capitalize">
                    {job.work_arrangement?.replace('_', ' ') || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="font-medium capitalize">
                    {job.engagement_type?.replace('_', ' ') || 'Full time'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="font-medium">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Minimum O-1 Score</p>
                <p className="font-medium text-lg">
                  {job.min_score || 0}%
                  {meetsMinScore ? (
                    <span className="text-green-600 text-sm ml-2">✓ You qualify</span>
                  ) : (
                    <span className="text-yellow-600 text-sm ml-2">Below requirement</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}