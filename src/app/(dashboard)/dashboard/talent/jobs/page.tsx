import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { ScoreInline } from '@/components/talent/ScoreDisplay';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
  Building2,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default async function TalentJobsPage() {
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

  // Get active jobs
  const { data: jobs } = await supabase
    .from('job_listings')
    .select(`
      *,
      employer:employer_profiles(
        company_name,
        company_website,
        logo_url,
        city,
        state
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get existing applications to filter out applied jobs
  const { data: applications } = await supabase
    .from('job_applications')
    .select('job_id')
    .eq('talent_id', talentProfile.id);

  const appliedJobIds = new Set(applications?.map((a) => a.job_id) || []);

  const talentScore = talentProfile.o1_score || 0;

  const categorizedJobs = {
    matching: jobs?.filter(
      (job) => !appliedJobIds.has(job.id) && job.min_score <= talentScore
    ) || [],
    stretch: jobs?.filter(
      (job) =>
        !appliedJobIds.has(job.id) &&
        job.min_score > talentScore &&
        job.min_score <= talentScore + 20
    ) || [],
    other: jobs?.filter(
      (job) => !appliedJobIds.has(job.id) && job.min_score > talentScore + 20
    ) || [],
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const renderJobCard = (job: NonNullable<typeof jobs>[number]) => (
    <Link key={job.id} href={`/dashboard/talent/jobs/${job.id}`}>
      <Card hover className="h-full">
        <CardContent className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {job.employer?.logo_url ? (
                <img
                  src={job.employer.logo_url}
                  alt={job.employer.company_name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.employer?.company_name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Min Score</span>
              <p className="font-semibold text-gray-900">{job.min_score}%</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
            {job.employer?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.employer.city}, {job.employer.state}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {job.work_arrangement?.replace('_', ' ')}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 flex-grow">
            {job.description?.substring(0, 150)}...
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              View Details
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600">Find opportunities that match your O-1 profile</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Your Score</p>
            <ScoreInline score={talentScore} showLabel={false} />
          </div>
        </div>
      </div>

      {/* Score explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Search className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">How matching works</p>
            <p className="text-sm text-blue-700 mt-1">
              Jobs are matched based on your O-1 score. &quot;Perfect Match&quot; jobs have a minimum
              score at or below yours. &quot;Stretch&quot; jobs are within 20 points of your score.
            </p>
          </div>
        </div>
      </div>

      {/* Perfect Matches */}
      {categorizedJobs.matching.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Perfect Matches</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.matching.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.matching.map(renderJobCard)}
          </div>
        </section>
      )}

      {/* Stretch Jobs */}
      {categorizedJobs.stretch.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stretch Opportunities</h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.stretch.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.stretch.map(renderJobCard)}
          </div>
        </section>
      )}

      {/* Other Jobs */}
      {categorizedJobs.other.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Other Opportunities</h2>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.other.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.other.map(renderJobCard)}
          </div>
        </section>
      )}

      {/* No Jobs */}
      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-600">
              Check back later for new opportunities.
            </p>
          </CardContent>
        </Card>
      ) : appliedJobIds.size === jobs.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You&apos;ve applied to all available jobs
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities, or view your{' '}
              <Link href="/dashboard/talent/applications" className="text-blue-600 hover:underline">
                applications
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
