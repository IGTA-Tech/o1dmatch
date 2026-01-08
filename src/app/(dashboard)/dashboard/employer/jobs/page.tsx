import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  Edit,
  MoreVertical,
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { JobStatus } from '@/types/enums';

const STATUS_CONFIG: Record <JobStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }
> = {
  draft: { label: 'Draft', variant: 'default' },
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  closed: { label: 'Closed', variant: 'error' },
  filled: { label: 'Filled', variant: 'info' },
};

export default async function EmployerJobsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) {
    redirect('/dashboard/employer');
  }

  // Get all jobs with application counts  
  const { data: jobs } = await supabase
    .from('job_listings')
    .select(`
      *,
      applications:job_applications(count)
    `)
    .eq('employer_id', employerProfile.id)
    .order('created_at', { ascending: false });

  const stats = {
    total: jobs?.length || 0,
    active: jobs?.filter((j) => j.status === 'active').length || 0,
    totalApplications: jobs?.reduce(
      (sum, j) => sum + (j.applications?.[0]?.count || 0),
      0
    ) || 0,
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/employer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-600">Manage your job listings</p>
          </div>
        </div>
        <Link
          href="/dashboard/employer/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Jobs</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active Listings</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first job listing to start receiving applications.
            </p>
            <Link
              href="/dashboard/employer/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Post Your First Job
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Job Listings</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const statusConfig = STATUS_CONFIG[job.status as JobStatus];
              const applicationCount = job.applications?.[0]?.count || 0;

              return (
                <div
                  key={job.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant={statusConfig?.variant || 'default'}>
                          {statusConfig?.label || job.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        {job.locations && job.locations.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.locations[0]}
                            {job.locations.length > 1 && ` +${job.locations.length - 1}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{applicationCount}</span>
                          <span className="text-gray-500">applications</span>
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{job.view_count || 0}</span>
                          <span className="text-gray-500">views</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          Min score: {job.min_score || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/employer/jobs/${job.id}/applications`}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View Applications
                      </Link>
                      <Link
                        href={`/dashboard/employer/jobs/${job.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Link>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
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