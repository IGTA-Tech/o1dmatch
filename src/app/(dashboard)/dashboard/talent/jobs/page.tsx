import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { ScoreInline } from '@/components/talent/ScoreDisplay';
import {
  calculateMatchScore,
  TalentMatchProfile,
  JobMatchProfile,
} from '@/lib/matching';
import { O1Criterion } from '@/types/enums';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
  Building2,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
// import Image from "next/image";

export default async function TalentJobsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  console.log("user ======>");
  console.log(user);
  if (!user) {
    redirect('/login');
  }

  // Get talent profile
  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  console.log("talentProfile ===========>");
  console.log(talentProfile);

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
        city,
        state
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
    console.log("jobs ===============> ");
    console.log(jobs);

  // Get existing applications to filter out applied jobs
  const { data: applications } = await supabase
    .from('job_applications')
    .select('job_id')
    .eq('talent_id', talentProfile.id);

  console.log("job_applications ===========> ");
  console.log(applications);

  const appliedJobIds = new Set(applications?.map((a) => a.job_id) || []);

  const talentScore = talentProfile.o1_score || 0;

  // Calculate smart match scores
  const talent: TalentMatchProfile = {
    id: talentProfile.id,
    o1_score: talentScore,
    criteria_met: (talentProfile.criteria_met as O1Criterion[]) || [],
    skills: (talentProfile.skills as string[]) || [],
    education_level: talentProfile.education_level,
    years_experience: talentProfile.years_experience,
  };

  const jobsWithMatches = (jobs || [])
    .filter((job) => !appliedJobIds.has(job.id))
    .map((job) => {
      const jobProfile: JobMatchProfile = {
        id: job.id,
        min_score: job.min_score,
        preferred_criteria: (job.preferred_criteria as O1Criterion[]) || [],
        required_skills: (job.required_skills as string[]) || [],
        preferred_skills: (job.preferred_skills as string[]) || [],
        required_education: job.required_education,
        min_experience: job.min_experience,
      };
      const match = calculateMatchScore(talent, jobProfile);
      return { ...job, match };
    });

  // Sort by match score
  const sortedJobs = jobsWithMatches.sort((a, b) => b.match.overall_score - a.match.overall_score);

  // Categorize by match quality
  const categorizedJobs = {
    excellent: sortedJobs.filter((job) => job.match.category === 'excellent'),
    good: sortedJobs.filter((job) => job.match.category === 'good'),
    fair: sortedJobs.filter((job) => job.match.category === 'fair'),
    poor: sortedJobs.filter((job) => job.match.category === 'poor'),
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const getMatchBadgeColor = (category: string) => {
    switch (category) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  type JobWithMatch = typeof sortedJobs[number];

  const renderJobCard = (job: JobWithMatch) => (
    <Link key={job.id} href={`/dashboard/talent/jobs/${job.id}`}>
      <Card hover className="h-full">
        <CardContent className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.employer?.company_name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getMatchBadgeColor(job.match.category)}`}
              >
                {job.match.overall_score}% match
              </span>
              <span className="text-xs text-gray-500">Min: {job.min_score}%</span>
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

      {/* Smart matching explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Smart Job Matching</p>
            <p className="text-sm text-gray-700 mt-1">
              Jobs are ranked using our AI-powered matching algorithm that considers your O-1 score,
              criteria met, skills, education, and experience. Higher match scores mean better fit.
            </p>
          </div>
        </div>
      </div>

      {/* Excellent Matches */}
      {categorizedJobs.excellent.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Excellent Matches</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.excellent.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.excellent.map(renderJobCard)}
          </div>
        </section>
      )}

      {/* Good Matches */}
      {categorizedJobs.good.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Good Matches</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.good.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.good.map(renderJobCard)}
          </div>
        </section>
      )}

      {/* Fair Matches */}
      {categorizedJobs.fair.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Fair Matches</h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.fair.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.fair.map(renderJobCard)}
          </div>
        </section>
      )}

      {/* Limited Matches */}
      {categorizedJobs.poor.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Other Opportunities</h2>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {categorizedJobs.poor.length} jobs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedJobs.poor.map(renderJobCard)}
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
      ) : sortedJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No new jobs to show
            </h3>
            <p className="text-gray-600">
              You&apos;ve seen all available jobs. Check your{' '}
              <Link href="/dashboard/talent/applications" className="text-blue-600 hover:underline">
                applications
              </Link>{' '}
              for updates.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
