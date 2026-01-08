import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  calculateMatchScore,
  getBestJobMatches,
  getBestTalentMatches,
  TalentMatchProfile,
  JobMatchProfile,
} from '@/lib/matching';
import { O1Criterion } from '@/types/enums';

export const dynamic = 'force-dynamic';

// Get match score between a specific talent and job
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const talentId = searchParams.get('talent_id');
    const jobId = searchParams.get('job_id');
    const mode = searchParams.get('mode') || 'single'; // single, jobs, talents

    if (mode === 'single') {
      if (!talentId || !jobId) {
        return NextResponse.json(
          { error: 'talent_id and job_id are required' },
          { status: 400 }
        );
      }

      const { talent, job, match } = await getSingleMatch(supabase, talentId, jobId);

      return NextResponse.json({
        success: true,
        data: {
          talent_id: talent.id,
          job_id: job.id,
          match,
        },
      });
    } else if (mode === 'jobs') {
      // Get best job matches for a talent
      if (!talentId) {
        return NextResponse.json(
          { error: 'talent_id is required for jobs mode' },
          { status: 400 }
        );
      }

      const limit = parseInt(searchParams.get('limit') || '10');
      const matches = await getJobMatchesForTalent(supabase, talentId, limit);

      return NextResponse.json({
        success: true,
        data: matches,
      });
    } else if (mode === 'talents') {
      // Get best talent matches for a job
      if (!jobId) {
        return NextResponse.json(
          { error: 'job_id is required for talents mode' },
          { status: 400 }
        );
      }

      // Verify user owns this job
      const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employerProfile) {
        return NextResponse.json(
          { error: 'Employer profile not found' },
          { status: 404 }
        );
      }

      const { data: job } = await supabase
        .from('job_listings')
        .select('employer_id')
        .eq('id', jobId)
        .single();

      if (!job || job.employer_id !== employerProfile.id) {
        return NextResponse.json(
          { error: 'Job not found or unauthorized' },
          { status: 404 }
        );
      }

      const limit = parseInt(searchParams.get('limit') || '20');
      const matches = await getTalentMatchesForJob(supabase, jobId, limit);

      return NextResponse.json({
        success: true,
        data: matches,
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('Job match error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate match' },
      { status: 500 }
    );
  }
}

async function getSingleMatch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  talentId: string,
  jobId: string
) {
  const adminSupabase = await createAdminClient();

  // Get talent profile
  const { data: talentProfile, error: talentError } = await adminSupabase
    .from('talent_profiles')
    .select('id, o1_score, criteria_met, skills, education_level, years_experience')
    .eq('id', talentId)
    .single();

  if (talentError || !talentProfile) {
    throw new Error('Talent profile not found');
  }

  // Get job listing
  const { data: jobListing, error: jobError } = await supabase
    .from('job_listings')
    .select('id, min_score, preferred_criteria, required_skills, preferred_skills, required_education, min_experience')
    .eq('id', jobId)
    .single();

  if (jobError || !jobListing) {
    throw new Error('Job listing not found');
  }

  const talent: TalentMatchProfile = {
    id: talentProfile.id,
    o1_score: talentProfile.o1_score || 0,
    criteria_met: (talentProfile.criteria_met as O1Criterion[]) || [],
    skills: (talentProfile.skills as string[]) || [],
    education_level: talentProfile.education_level,
    years_experience: talentProfile.years_experience,
  };

  const job: JobMatchProfile = {
    id: jobListing.id,
    min_score: jobListing.min_score,
    preferred_criteria: (jobListing.preferred_criteria as O1Criterion[]) || [],
    required_skills: (jobListing.required_skills as string[]) || [],
    preferred_skills: (jobListing.preferred_skills as string[]) || [],
    required_education: jobListing.required_education,
    min_experience: jobListing.min_experience,
  };

  const match = calculateMatchScore(talent, job);

  return { talent, job, match };
}

async function getJobMatchesForTalent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  talentId: string,
  limit: number
) {
  const adminSupabase = await createAdminClient();

  // Get talent profile
  const { data: talentProfile } = await adminSupabase
    .from('talent_profiles')
    .select('id, o1_score, criteria_met, skills, education_level, years_experience')
    .eq('id', talentId)
    .single();

  if (!talentProfile) {
    throw new Error('Talent profile not found');
  }

  // Get active job listings
  const { data: jobListings } = await supabase
    .from('job_listings')
    .select(`
      id, title, min_score, preferred_criteria, required_skills, preferred_skills,
      required_education, min_experience,
      employer:employer_profiles(company_name, logo_url),
      salary_min, salary_max, work_arrangement, locations
    `)
    .eq('status', 'active')
    .limit(100); // Get more jobs than limit for better matching

  if (!jobListings || jobListings.length === 0) {
    return [];
  }

  const talent: TalentMatchProfile = {
    id: talentProfile.id,
    o1_score: talentProfile.o1_score || 0,
    criteria_met: (talentProfile.criteria_met as O1Criterion[]) || [],
    skills: (talentProfile.skills as string[]) || [],
    education_level: talentProfile.education_level,
    years_experience: talentProfile.years_experience,
  };

  const jobs: JobMatchProfile[] = jobListings.map((job) => ({
    id: job.id,
    min_score: job.min_score,
    preferred_criteria: (job.preferred_criteria as O1Criterion[]) || [],
    required_skills: (job.required_skills as string[]) || [],
    preferred_skills: (job.preferred_skills as string[]) || [],
    required_education: job.required_education,
    min_experience: job.min_experience,
  }));

  const matches = getBestJobMatches(talent, jobs, limit);

  // Enhance with job details
  return matches.map(({ job, match }) => {
    const jobDetails = jobListings.find((j) => j.id === job.id);
    // Handle both single object and array from Supabase joins
    const employer = Array.isArray(jobDetails?.employer)
      ? jobDetails?.employer[0]
      : jobDetails?.employer;
    return {
      job_id: job.id,
      title: jobDetails?.title,
      company_name: employer?.company_name,
      logo_url: employer?.logo_url,
      salary_min: jobDetails?.salary_min,
      salary_max: jobDetails?.salary_max,
      work_arrangement: jobDetails?.work_arrangement,
      locations: jobDetails?.locations,
      match_score: match.overall_score,
      match_category: match.category,
      match_summary: match.summary,
    };
  });
}

async function getTalentMatchesForJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  limit: number
) {
  const adminSupabase = await createAdminClient();

  // Get job listing
  const { data: jobListing } = await supabase
    .from('job_listings')
    .select('id, min_score, preferred_criteria, required_skills, preferred_skills, required_education, min_experience')
    .eq('id', jobId)
    .single();

  if (!jobListing) {
    throw new Error('Job listing not found');
  }

  // Get talent profiles (public profiles only)
  const { data: talentProfiles } = await adminSupabase
    .from('talent_profiles')
    .select(`
      id, candidate_id, o1_score, criteria_met, skills, education_level, years_experience,
      current_job_title, city, state, visa_status
    `)
    .eq('visibility', 'public')
    .gte('o1_score', (jobListing.min_score || 0) * 0.5) // At least 50% of min score
    .limit(100);

  if (!talentProfiles || talentProfiles.length === 0) {
    return [];
  }

  const job: JobMatchProfile = {
    id: jobListing.id,
    min_score: jobListing.min_score,
    preferred_criteria: (jobListing.preferred_criteria as O1Criterion[]) || [],
    required_skills: (jobListing.required_skills as string[]) || [],
    preferred_skills: (jobListing.preferred_skills as string[]) || [],
    required_education: jobListing.required_education,
    min_experience: jobListing.min_experience,
  };

  const talents: TalentMatchProfile[] = talentProfiles.map((t) => ({
    id: t.id,
    o1_score: t.o1_score || 0,
    criteria_met: (t.criteria_met as O1Criterion[]) || [],
    skills: (t.skills as string[]) || [],
    education_level: t.education_level,
    years_experience: t.years_experience,
  }));

  const matches = getBestTalentMatches(job, talents, limit);

  // Enhance with talent details
  return matches.map(({ talent, match }) => {
    const talentDetails = talentProfiles.find((t) => t.id === talent.id);
    return {
      talent_id: talent.id,
      candidate_id: talentDetails?.candidate_id,
      o1_score: talentDetails?.o1_score,
      current_job_title: talentDetails?.current_job_title,
      city: talentDetails?.city,
      state: talentDetails?.state,
      visa_status: talentDetails?.visa_status,
      criteria_met: talentDetails?.criteria_met,
      match_score: match.overall_score,
      match_category: match.category,
      match_summary: match.summary,
      breakdown: match.breakdown,
    };
  });
}
