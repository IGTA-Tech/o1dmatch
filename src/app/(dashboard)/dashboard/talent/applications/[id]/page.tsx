import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default async function ApplicationDetailPage({
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
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  // Get application details with job and employer info
  const { data: application } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:job_listings(
        id,
        title,
        description,
        locations,
        salary_min,
        salary_max,
        engagement_type,
        required_skills,
        employer:employer_profiles(
          id,
          company_name,
          company_website,
          city,
          state
        )
      )
    `)
    .eq('id', id)
    .eq('talent_id', talentProfile.id)
    .single();

  if (!application) {
    redirect('/dashboard/talent/applications');
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'reviewing':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'reviewing':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/talent/applications"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <p className="text-gray-600">{application.job?.title}</p>
        </div>
        {getStatusBadge(application.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {application.job?.title}
              </h3>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Building2 className="w-4 h-4" />
                <span>{application.job?.employer?.company_name}</span>
                {application.job?.employer?.city && (
                  <>
                    <span>•</span>
                    <span>{application.job.employer.city}, {application.job.employer.state}</span>
                  </>
                )}
              </div>

              {application.job?.description && (
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {application.job.description}
                </p>
              )}

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Salary Range</p>
                  <p className="font-medium">
                    {formatSalary(application.job?.salary_min, application.job?.salary_max)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="font-medium capitalize">
                    {application.job?.engagement_type?.replace('_', ' ') || 'Full time'}
                  </p>
                </div>
              </div>

              {application.job?.required_skills && application.job.required_skills.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {application.job.required_skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/dashboard/talent/jobs/${application.job?.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Full Job Listing →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Cover Message */}
          {application.cover_message && (
            <Card>
              <CardHeader>
                <CardTitle>Your Cover Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {application.cover_message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Employer Response */}
          {application.employer_response && (
            <Card>
              <CardHeader>
                <CardTitle>Employer Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {application.employer_response}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(application.status)}
                <div>
                  <p className="font-medium capitalize">{application.status}</p>
                  <p className="text-sm text-gray-500">Current Status</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Applied On</p>
                    <p className="font-medium">
                      {new Date(application.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {application.updated_at !== application.created_at && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(application.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-gray-400 font-medium text-sm">%</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">O-1 Score at Application</p>
                  <p className="font-medium">{application.score_at_application || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Card */}
          {application.job?.employer && (
            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{application.job.employer.company_name}</p>
                    {application.job.employer.city && (
                      <p className="text-sm text-gray-500">
                        {application.job.employer.city}, {application.job.employer.state}
                      </p>
                    )}
                  </div>
                </div>
                {application.job.employer.company_website && (
                  
                    <a href={application.job.employer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-3 inline-block"
                  >
                    Visit Website →
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
