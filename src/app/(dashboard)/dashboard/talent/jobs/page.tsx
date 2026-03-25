// src/app/(dashboard)/dashboard/talent/jobs/page.tsx

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
import { Briefcase, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import { JobsList } from './JobsList';

export const dynamic = 'force-dynamic';

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

  // Check subscription tier
  const { data: subscription } = await supabase
    .from('talent_subscriptions')
    .select('tier')
    .eq('talent_id', user.id)
    .single();

  const isFreeTier = !subscription || subscription.tier === 'profile_only';

  // Get active jobs — include employer user_id so we can look up subscriptions
  // (employer_subscriptions.employer_id = profiles.id = employer_profiles.user_id)
  const { data: jobs } = await supabase
    .from('job_listings')
    .select(`
      *,
      employer:employer_profiles(
        company_name,
        company_website,
        city,
        state,
        user_id
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

  // Determine which employers are on a featured plan (Growth, Business, Enterprise).
  //
  // IMPORTANT: employer_subscriptions has RLS that blocks talent users from reading
  // other employers' rows. We must use the service-role client to bypass RLS here,
  // since this is a read of public-facing data (featured badge visibility).
  //
  // Schema confirmed via SQL:
  //   job_listings.employer_id           = employer_profiles.id       (profile UUID)
  //   employer_subscriptions.employer_id = employer_profiles.user_id  (auth user UUID)
  //
  const employerUserIds = Array.from(
    new Set(
      (jobs || [])
        .map((j) => (j.employer as { user_id?: string } | null)?.user_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  let featuredEmployerIds: string[] = [];

  if (employerUserIds.length > 0) {
    // Use service role client to bypass RLS on employer_subscriptions
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: featuredSubs } = await adminClient
      .from('employer_subscriptions')
      .select('employer_id')
      .in('employer_id', employerUserIds)
      .in('tier', ['growth', 'business', 'enterprise']);

    if (featuredSubs && featuredSubs.length > 0) {
      const featuredUserIdSet = new Set(featuredSubs.map((s) => s.employer_id));
      featuredEmployerIds = (jobs || [])
        .filter((j) => featuredUserIdSet.has((j.employer as { user_id?: string } | null)?.user_id ?? ''))
        .map((j) => j.employer_id)
        .filter((id, idx, arr) => arr.indexOf(id) === idx); // dedupe
    }
  }

  // Strip leading numbering ("1) ", "2. ") + trim + collapse spaces
  const normalizeSkill = (raw: string): string =>
    raw.replace(/^\d+[).\s]+/, '').trim().replace(/\s+/g, ' ');

  // Returns true if the string looks like a sentence fragment rather than a skill tag:
  //  - longer than 40 chars
  //  - contains a full stop, semicolon, or parentheses
  //  - starts with a conjunction / preposition ("or ", "and ", "a ", "an ", "the ", "with ", "in ", "is ", "for ", "to ", "of ")
  //  - contains words like "experience", "preferred", "mandatory", "environment"
  const isJunk = (s: string): boolean => {
    if (s.length > 40) return true;
    if (/[.;()]/.test(s)) return true;
    if (/^(or|and|a|an|the|with|in|is|for|to|of|similar|related|such)/i.test(s)) return true;
    if (/(experience|preferred|mandatory|environment|production|deploying|analytical|problem.solving|technologies|abilities|datasets)/i.test(s)) return true;
    return false;
  };

  // Levenshtein distance — used to fuzzy-merge near-duplicate skills
  // e.g. "Artificaial Intelligency" vs "Artificial Intelligence"
  const levenshtein = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    return dp[m][n];
  };

  // Two skills are "same" if edit distance ≤ 20% of the longer string's length
  const isSimilar = (a: string, b: string): boolean => {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return true;
    return levenshtein(a, b) / maxLen <= 0.2;
  };

  // Build deduplicated skill list:
  //  1. Normalise every raw skill
  //  2. Exact-lowercase dedup first (fast path)
  //  3. Fuzzy-merge near-duplicates — keep the shorter/cleaner label as canonical
  const rawSkills: string[] = [];
  sortedJobs.forEach((job) => {
    [...(job.required_skills || []), ...(job.preferred_skills || [])].forEach((skill: string) => {
      const display = normalizeSkill(skill);
      if (display && !isJunk(display)) rawSkills.push(display);
    });
  });

  // Exact dedup (case-insensitive)
  const exactMap = new Map<string, string>();
  rawSkills.forEach((s) => {
    const key = s.toLowerCase();
    if (!exactMap.has(key)) exactMap.set(key, s);
  });

  // Fuzzy dedup — merge into the first similar canonical
  const canonicals: string[] = [];
  exactMap.forEach((display) => {
    const lc = display.toLowerCase();
    const existing = canonicals.find((c) => isSimilar(c.toLowerCase(), lc));
    if (!existing) canonicals.push(display);
    // else: drop this near-duplicate, the canonical already represents it
  });

  const availableSkills = canonicals.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
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

      {/* Upgrade Banner for Free Users */}
      {isFreeTier && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              Upgrade to view job details and apply
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              You can browse job titles on the free plan. To view full job details, match scores, and apply to positions, upgrade your subscription.
            </p>
          </div>
          <Link
            href="/dashboard/talent/billing"
            className="px-4 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 whitespace-nowrap font-medium"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Jobs List with Filters */}
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
      ) : (
        <JobsList jobs={sortedJobs} availableSkills={availableSkills} isFreeTier={isFreeTier} featuredEmployerIds={[...featuredEmployerIds]} />
      )}
    </div>
  );
}