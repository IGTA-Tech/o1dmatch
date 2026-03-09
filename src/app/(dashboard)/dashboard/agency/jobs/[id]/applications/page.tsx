// src/app/(dashboard)/dashboard/agency/jobs/[id]/applications/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  // Verify agency ownership
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id, agency_name')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get job — verify it belongs to this agency
  const { data: job } = await supabase
    .from('job_listings')
    .select(`
      id,
      title,
      status,
      locations,
      client:agency_clients(company_name, show_client_identity)
    `)
    .eq('id', jobId)
    .eq('agency_id', agencyProfile.id)
    .single();

  if (!job) {
    redirect('/dashboard/agency/jobs');
  }

  // Get all applications with talent profile info
  const { data: applications } = await supabase
    .from('job_applications')
    .select(`
      id,
      status,
      cover_message,
      score_at_application,
      applied_at,
      talent:talent_profiles(
        id,
        first_name,
        last_name,
        professional_headline,
        current_job_title,
        years_experience,
        skills,
        o1_score
      )
    `)
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'warning' as const, icon: Clock };
      case 'reviewing':
        return { label: 'Reviewing', variant: 'info' as const, icon: Clock };
      case 'shortlisted':
        return { label: 'Shortlisted', variant: 'success' as const, icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejected', variant: 'error' as const, icon: XCircle };
      case 'hired':
        return { label: 'Hired', variant: 'success' as const, icon: CheckCircle };
      default:
        return { label: status, variant: 'default' as const, icon: Clock };
    }
  };

  const clientRaw = Array.isArray(job.client) ? job.client[0] : job.client;
  const clientName = clientRaw?.show_client_identity
    ? clientRaw?.company_name
    : 'Confidential Client';

  const total = applications?.length || 0;
  const pending = applications?.filter(a => a.status === 'pending').length || 0;
  const shortlisted = applications?.filter(a => a.status === 'shortlisted').length || 0;
  const rejected = applications?.filter(a => a.status === 'rejected').length || 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/agency/jobs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Badge variant={job.status === 'active' ? 'success' : 'default'}>
              {job.status}
            </Badge>
          </div>
          <p className="text-gray-600 flex items-center gap-2 mt-1 text-sm">
            <Briefcase className="w-4 h-4" />
            {clientName}
            {job.locations && job.locations.length > 0 && (
              <span className="text-gray-400">· {job.locations.join(', ')}</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{shortlisted}</p>
            <p className="text-sm text-gray-600">Shortlisted</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Applicants ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
              <p className="text-sm text-gray-500">
                Applications will appear here once candidates apply for this job.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app) => {
                const talentRaw = Array.isArray(app.talent) ? app.talent[0] : app.talent;
                const talent = talentRaw as {
                  id: string;
                  first_name: string;
                  last_name: string;
                  professional_headline?: string;
                  current_job_title?: string;
                  years_experience?: number;
                  skills?: string[];
                  o1_score?: number;
                } | null;

                const statusConfig = getStatusConfig(app.status ?? 'pending');
                const StatusIcon = statusConfig.icon;
                const score = app.score_at_application ?? talent?.o1_score ?? null;

                return (
                  <div key={app.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-4">

                      {/* Avatar */}
                      <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-semibold text-sm">
                          {talent?.first_name?.[0]}{talent?.last_name?.[0]}
                        </span>
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {talent?.first_name} {talent?.last_name}
                          </h3>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {score !== null && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
                              <Star className="w-3 h-3" />
                              O-1 Score: {score}%
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {talent?.professional_headline || talent?.current_job_title || 'No headline'}
                          {talent?.years_experience && (
                            <span className="text-gray-400"> · {talent.years_experience} yrs exp</span>
                          )}
                        </p>

                        {/* Skills */}
                        {talent?.skills && talent.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {talent.skills.slice(0, 6).map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {talent.skills.length > 6 && (
                              <span className="text-xs text-gray-400">
                                +{talent.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Cover message */}
                        {app.cover_message && (
                          <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {app.cover_message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Applied date + CTA */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(app.applied_at)}
                        </div>
                        <Link
                          href={`/dashboard/agency/letters/new?talent=${talent?.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Send Interest Letter
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}