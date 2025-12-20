export * from './constants';

import {
  MATCHING_WEIGHTS,
  skillsMatch,
  meetsEducationRequirement,
  getMatchCategory,
} from './constants';
import { O1Criterion } from '@/types/enums';

export interface TalentMatchProfile {
  id: string;
  o1_score: number;
  criteria_met: O1Criterion[];
  skills: string[];
  education_level?: string | null;
  years_experience?: number | null;
}

export interface JobMatchProfile {
  id: string;
  min_score?: number;
  preferred_criteria?: O1Criterion[];
  required_skills?: string[];
  preferred_skills?: string[];
  required_education?: string | null;
  min_experience?: number | null;
}

export interface MatchBreakdown {
  score_requirement: {
    required: number;
    has: number;
    met: boolean;
    points: number;
  };
  criteria_match: {
    criterion: string;
    required: boolean;
    has: boolean;
    points: number;
  }[];
  skills_match: {
    skill: string;
    required: boolean;
    has: boolean;
    points: number;
  }[];
  education_match: {
    required: string | null;
    has: string | null;
    met: boolean;
    points: number;
  };
  experience_match: {
    required: number | null;
    has: number | null;
    met: boolean;
    points: number;
  };
}

export interface MatchResult {
  overall_score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: MatchBreakdown;
  summary: string;
}

/**
 * Calculate match score between a talent and a job
 */
export function calculateMatchScore(
  talent: TalentMatchProfile,
  job: JobMatchProfile
): MatchResult {
  const breakdown: MatchBreakdown = {
    score_requirement: {
      required: job.min_score || 0,
      has: talent.o1_score,
      met: false,
      points: 0,
    },
    criteria_match: [],
    skills_match: [],
    education_match: {
      required: job.required_education || null,
      has: talent.education_level || null,
      met: false,
      points: 0,
    },
    experience_match: {
      required: job.min_experience || null,
      has: talent.years_experience || null,
      met: false,
      points: 0,
    },
  };

  // 1. O-1 Score Match (40%)
  const scorePoints = calculateScorePoints(talent.o1_score, job.min_score || 0);
  breakdown.score_requirement.met = talent.o1_score >= (job.min_score || 0);
  breakdown.score_requirement.points = scorePoints;

  // 2. Criteria Overlap (30%)
  const { criteriaPoints, criteriaBreakdown } = calculateCriteriaPoints(
    talent.criteria_met,
    job.preferred_criteria || []
  );
  breakdown.criteria_match = criteriaBreakdown;

  // 3. Skills Match (20%)
  const { skillsPoints, skillsBreakdown } = calculateSkillsPoints(
    talent.skills,
    job.required_skills || [],
    job.preferred_skills || []
  );
  breakdown.skills_match = skillsBreakdown;

  // 4. Education & Experience (10%)
  const { educationPoints, experiencePoints } = calculateEducationExperiencePoints(
    talent,
    job
  );
  breakdown.education_match.met = meetsEducationRequirement(
    talent.education_level ?? null,
    job.required_education ?? null
  );
  breakdown.education_match.points = educationPoints;
  breakdown.experience_match.met =
    !job.min_experience || (talent.years_experience || 0) >= job.min_experience;
  breakdown.experience_match.points = experiencePoints;

  // Calculate overall score
  const overall_score = Math.round(
    scorePoints * MATCHING_WEIGHTS.o1_score +
      criteriaPoints * MATCHING_WEIGHTS.criteria_overlap +
      skillsPoints * MATCHING_WEIGHTS.skills_match +
      (educationPoints + experiencePoints) / 2 * MATCHING_WEIGHTS.education_experience
  );

  const category = getMatchCategory(overall_score);
  const summary = generateSummary(overall_score, category, breakdown);

  return {
    overall_score,
    category,
    breakdown,
    summary,
  };
}

function calculateScorePoints(talentScore: number, requiredScore: number): number {
  if (requiredScore === 0) return 100; // No requirement
  if (talentScore >= requiredScore) {
    // Full points + bonus for exceeding
    const excess = talentScore - requiredScore;
    return Math.min(100, 80 + excess * 0.5);
  }
  // Partial points based on how close
  const percentage = talentScore / requiredScore;
  return Math.round(percentage * 70);
}

function calculateCriteriaPoints(
  talentCriteria: O1Criterion[],
  preferredCriteria: O1Criterion[]
): { criteriaPoints: number; criteriaBreakdown: MatchBreakdown['criteria_match'] } {
  if (preferredCriteria.length === 0) {
    return { criteriaPoints: 100, criteriaBreakdown: [] };
  }

  const breakdown: MatchBreakdown['criteria_match'] = [];
  let matchedCount = 0;

  for (const criterion of preferredCriteria) {
    const has = talentCriteria.includes(criterion);
    if (has) matchedCount++;
    breakdown.push({
      criterion,
      required: true,
      has,
      points: has ? 100 / preferredCriteria.length : 0,
    });
  }

  // Bonus for extra criteria
  const extraCriteria = talentCriteria.filter((c) => !preferredCriteria.includes(c));
  for (const criterion of extraCriteria) {
    breakdown.push({
      criterion,
      required: false,
      has: true,
      points: 5, // Small bonus for extra criteria
    });
  }

  const basePoints = (matchedCount / preferredCriteria.length) * 100;
  const bonusPoints = Math.min(extraCriteria.length * 5, 20); // Cap bonus at 20

  return {
    criteriaPoints: Math.min(100, basePoints + bonusPoints),
    criteriaBreakdown: breakdown,
  };
}

function calculateSkillsPoints(
  talentSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): { skillsPoints: number; skillsBreakdown: MatchBreakdown['skills_match'] } {
  const breakdown: MatchBreakdown['skills_match'] = [];

  if (requiredSkills.length === 0 && preferredSkills.length === 0) {
    return { skillsPoints: 100, skillsBreakdown: [] };
  }

  let requiredMatched = 0;
  let preferredMatched = 0;

  // Check required skills
  for (const skill of requiredSkills) {
    const has = talentSkills.some((ts) => skillsMatch(ts, skill));
    if (has) requiredMatched++;
    breakdown.push({
      skill,
      required: true,
      has,
      points: has ? 100 / (requiredSkills.length || 1) : 0,
    });
  }

  // Check preferred skills
  for (const skill of preferredSkills) {
    const has = talentSkills.some((ts) => skillsMatch(ts, skill));
    if (has) preferredMatched++;
    breakdown.push({
      skill,
      required: false,
      has,
      points: has ? 50 / (preferredSkills.length || 1) : 0,
    });
  }

  // If no required skills or all required met
  if (requiredSkills.length === 0 || requiredMatched === requiredSkills.length) {
    const requiredPoints = requiredSkills.length > 0 ? 60 : 0; // 60% for required
    const preferredPoints =
      preferredSkills.length > 0
        ? (preferredMatched / preferredSkills.length) * 40
        : requiredSkills.length > 0
          ? 40
          : 100;
    return {
      skillsPoints: requiredPoints + preferredPoints,
      skillsBreakdown: breakdown,
    };
  }

  // Some required skills missing
  const requiredRatio = requiredMatched / requiredSkills.length;
  return {
    skillsPoints: Math.round(requiredRatio * 60),
    skillsBreakdown: breakdown,
  };
}

function calculateEducationExperiencePoints(
  talent: TalentMatchProfile,
  job: JobMatchProfile
): { educationPoints: number; experiencePoints: number } {
  // Education points
  let educationPoints = 100;
  if (job.required_education) {
    educationPoints = meetsEducationRequirement(
      talent.education_level ?? null,
      job.required_education
    )
      ? 100
      : 40;
  }

  // Experience points
  let experiencePoints = 100;
  if (job.min_experience) {
    const talentExp = talent.years_experience || 0;
    if (talentExp >= job.min_experience) {
      experiencePoints = 100;
    } else if (talentExp >= job.min_experience * 0.75) {
      experiencePoints = 80;
    } else if (talentExp >= job.min_experience * 0.5) {
      experiencePoints = 60;
    } else {
      experiencePoints = 30;
    }
  }

  return { educationPoints, experiencePoints };
}

function generateSummary(
  score: number,
  category: string,
  breakdown: MatchBreakdown
): string {
  const parts: string[] = [];

  if (category === 'excellent') {
    parts.push('Excellent match!');
  } else if (category === 'good') {
    parts.push('Good potential match.');
  } else if (category === 'fair') {
    parts.push('Moderate match.');
  } else {
    parts.push('Limited match.');
  }

  // Score requirement
  if (!breakdown.score_requirement.met && breakdown.score_requirement.required > 0) {
    parts.push(
      `O-1 score (${breakdown.score_requirement.has}%) is below requirement (${breakdown.score_requirement.required}%).`
    );
  }

  // Skills gaps
  const missingRequired = breakdown.skills_match.filter((s) => s.required && !s.has);
  if (missingRequired.length > 0 && missingRequired.length <= 3) {
    parts.push(
      `Missing skills: ${missingRequired.map((s) => s.skill).join(', ')}.`
    );
  } else if (missingRequired.length > 3) {
    parts.push(`Missing ${missingRequired.length} required skills.`);
  }

  // Criteria gaps
  const missingCriteria = breakdown.criteria_match.filter((c) => c.required && !c.has);
  if (missingCriteria.length > 0) {
    parts.push(
      `Missing ${missingCriteria.length} preferred criteria.`
    );
  }

  return parts.join(' ');
}

/**
 * Get best matches for a talent across multiple jobs
 */
export function getBestJobMatches(
  talent: TalentMatchProfile,
  jobs: JobMatchProfile[],
  limit = 10
): Array<{ job: JobMatchProfile; match: MatchResult }> {
  const matches = jobs.map((job) => ({
    job,
    match: calculateMatchScore(talent, job),
  }));

  return matches
    .sort((a, b) => b.match.overall_score - a.match.overall_score)
    .slice(0, limit);
}

/**
 * Get best talent matches for a job
 */
export function getBestTalentMatches(
  job: JobMatchProfile,
  talents: TalentMatchProfile[],
  limit = 10
): Array<{ talent: TalentMatchProfile; match: MatchResult }> {
  const matches = talents.map((talent) => ({
    talent,
    match: calculateMatchScore(talent, job),
  }));

  return matches
    .sort((a, b) => b.match.overall_score - a.match.overall_score)
    .slice(0, limit);
}
