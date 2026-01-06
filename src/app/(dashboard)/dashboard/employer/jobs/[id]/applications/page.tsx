import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  FileText,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { ApplicationActions } from './ApplicationActions';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'info' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  submitted: { label: 'Submitted', variant: 'info' },
  under_review: { label: 'Under Review', variant: 'warning' },
  reviewing: { label: 'Reviewing', variant: 'default' },
  shortlisted: { label: 'Shortlisted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  hired: { label: 'Hired', variant: 'success' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
};

export default async function JobApplicationsPage({
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

  // Get employer profile
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) {
    redirect('/dashboard/employer');
  }

  // Get job details
  const { data: job } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', id)
    .eq('employer_id', employerProfile.id)
    .single();

  if (!job) {
    redirect('/dashboard/employer/jobs');
  }

  // Get applications for this job
  const { data: applications, error: appError } = await supabase
    .from('job_applications')
    .select(`
      *,
      talent:talent_profiles(
        id,
        user_id,
        phone,
        professional_headline,
        o1_score,
        city,
        state
      )
    `)
    .eq('job_id', id)
    .order('created_at', { ascending: false });

  if(appError){
    console.log(appError);
  }

  // Get user emails for talents
  const talentEmails: Record<string, string> = {};
  if (applications && applications.length > 0) {
    const userIds = applications
      .map(a => a.talent?.user_id)
      .filter(Boolean);
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach(p => {
          talentEmails[p.id] = p.email;
        });
      }
    }
  }

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => ['pending', 'submitted', 'under_review'].includes(a.status)).length || 0,
    shortlisted: applications?.filter((a) => a.status === 'shortlisted').length || 0,
    rejected: applications?.filter((a) => a.status === 'rejected').length || 0,
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
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">{job.title}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
            <p className="text-sm text-gray-600">Shortlisted</p>
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
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              Applications will appear here when candidates apply to this job.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {applications.map((application) => {
              const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
              const talent = application.talent;
              const talentEmail = talent?.user_id ? talentEmails[talent.user_id] : null;

              return (
                <div key={application.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          Applicant #{application.id.slice(0, 8)}
                        </h3>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                        {talent?.o1_score && (
                          <span className="text-sm text-blue-600 font-medium">
                            O-1 Score: {talent.o1_score}%
                          </span>
                        )}
                      </div>

                      {talent?.professional_headline && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <FileText className="w-4 h-4" />
                          {talent.professional_headline}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {talentEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {talentEmail}
                          </span>
                        )}
                        {talent?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {talent.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(application.applied_at || application.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {application.cover_message && (
                        <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {application.cover_message.substring(0, 200)}
                          {application.cover_message.length > 200 && '...'}
                        </p>
                      )}
                    </div>

                    <ApplicationActions
                      applicationId={application.id}
                      currentStatus={application.status}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}