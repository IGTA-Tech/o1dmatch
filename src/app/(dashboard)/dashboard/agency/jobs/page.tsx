import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  Eye,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyJobsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get agency jobs with client info
  const { data: jobs } = await supabase
    .from('job_listings')
    .select(`
      *,
      client:agency_clients(
        company_name,
        show_client_identity
      )
    `)
    .eq('agency_id', agencyProfile.id)
    .order('created_at', { ascending: false });

  // Get application counts
  const jobIds = jobs?.map(j => j.id) || [];
  const applicationCounts: Record<string, number> = {};
  
  if (jobIds.length > 0) {
    const { data: applications } = await supabase
      .from('job_applications')
      .select('job_id')
      .in('job_id', jobIds);
    
    applications?.forEach(app => {
      applicationCounts[app.job_id] = (applicationCounts[app.job_id] || 0) + 1;
    });
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', variant: 'success' as const };
      case 'paused':
        return { label: 'Paused', variant: 'warning' as const };
      case 'closed':
        return { label: 'Closed', variant: 'default' as const };
      case 'draft':
        return { label: 'Draft', variant: 'info' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-gray-600">Manage job postings for your clients</p>
        </div>
        <Link
          href="/dashboard/agency/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {/* Jobs List */}
      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Listings</h3>
            <p className="text-gray-600 mb-6">
              Create your first job posting for a client.
            </p>
            <Link
              href="/dashboard/agency/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const status = getStatusBadge(job.status);
            const salary = formatSalary(job.salary_min, job.salary_max);
            const appCount = applicationCounts[job.id] || 0;

            return (
              <Card key={job.id} hover>
                <CardContent className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/agency/jobs/${job.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.client?.show_client_identity 
                          ? job.client?.company_name 
                          : 'Confidential Client'}
                      </span>
                      {job.locations && job.locations.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.locations.join(', ')}
                        </span>
                      )}
                      {salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {salary}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {formatDate(job.created_at)}
                      </span>
                      <span className="capitalize">
                        {job.engagement_type?.replace('_', ' ')}
                      </span>
                      <span className="capitalize">
                        {job.work_arrangement?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Application Count */}
                    <Link
                      href={`/dashboard/agency/jobs/${job.id}/applications`}
                      className="text-center hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                        <Users className="w-5 h-5 text-gray-400" />
                        {appCount}
                      </div>
                      <p className="text-xs text-gray-500">Applications</p>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/agency/jobs/${job.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Job"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}