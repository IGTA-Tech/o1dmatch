import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Send,
  Building2,
  Calendar,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { ApplicationStatus } from '@/types/enums';
// import Image from "next/image";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }
> = {
  submitted: { label: 'Submitted', variant: 'info' },
  pending: { label: 'Pending', variant: 'default' },
  under_review: { label: 'Under Review', variant: 'warning' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  shortlisted: { label: 'Shortlisted', variant: 'success' },
  interview_requested: { label: 'Interview Requested', variant: 'success' },
  letter_sent: { label: 'Letter Sent', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
  hired: { label: 'Hired', variant: 'success' },
};

export default async function TalentApplicationsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  const { data: applications, error: appError } = await supabase
  .from('job_applications')
  .select(`
    *,
    job:job_listings(
      id,
      title,
      department,
      work_arrangement,
      salary_min,
      salary_max,
      employer:employer_profiles(
        company_name,
        city,
        state
      )
    )
  `)
  .eq('talent_id', talentProfile.id)
  .neq('status', 'withdrawn')
  .order('created_at', { ascending: false });

  if(appError){ console.log(appError); }

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) =>
      ['submitted', 'under_review'].includes(a.status)
    ).length || 0,
    positive: applications?.filter((a) =>
      ['shortlisted', 'interview_requested', 'letter_sent', 'hired'].includes(a.status)
    ).length || 0,
    rejected: applications?.filter((a) => a.status === 'rejected').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track the status of your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
            <p className="text-sm text-gray-600">Positive Response</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">
              Start applying to jobs that match your profile.
            </p>
            <Link
              href="/dashboard/talent/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Application History</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {applications.map((application) => {
              const statusConfig = STATUS_CONFIG[application.status as ApplicationStatus];
              return (
                <div
                  key={application.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.job?.title || 'Unknown Position'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.job?.employer?.company_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </span>
                          {application.score_at_application && (
                            <span>Score: {application.score_at_application}%</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={statusConfig?.variant || 'default'}>
                        {statusConfig?.label || application.status}
                      </Badge>
                      <Link
                        href={`/dashboard/talent/applications/${application.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>

                  {application.employer_notes && (
                    <div className="mt-3 ml-16 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Employer note:</span>{' '}
                        {application.employer_notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
