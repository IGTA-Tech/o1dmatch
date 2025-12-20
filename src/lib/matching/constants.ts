// Matching algorithm weights
export const MATCHING_WEIGHTS = {
  o1_score: 0.4, // 40% - O-1 readiness score
  criteria_overlap: 0.3, // 30% - Criteria overlap with job requirements
  skills_match: 0.2, // 20% - Skills matching
  education_experience: 0.1, // 10% - Education & experience requirements
};

// Skill synonyms for flexible matching
export const SKILL_SYNONYMS: Record<string, string[]> = {
  javascript: ['js', 'ecmascript', 'es6', 'es2015+', 'vanilla js'],
  typescript: ['ts'],
  python: ['py', 'python3'],
  react: ['reactjs', 'react.js'],
  nodejs: ['node', 'node.js'],
  nextjs: ['next', 'next.js'],
  postgresql: ['postgres', 'psql', 'pg'],
  mongodb: ['mongo'],
  docker: ['containerization', 'containers'],
  kubernetes: ['k8s'],
  aws: ['amazon web services', 'amazon aws'],
  gcp: ['google cloud', 'google cloud platform'],
  azure: ['microsoft azure'],
  machinelearning: ['ml', 'machine-learning'],
  deeplearning: ['dl', 'deep-learning'],
  artificialintelligence: ['ai', 'artificial-intelligence'],
  datascience: ['data-science', 'ds'],
  java: ['java8', 'java11', 'java17'],
  csharp: ['c#', '.net', 'dotnet'],
  cpp: ['c++', 'cplusplus'],
  golang: ['go'],
  rust: ['rustlang'],
  sql: ['mysql', 'mssql', 'sqlite'],
  graphql: ['gql'],
  rest: ['restful', 'rest api', 'restful api'],
  html: ['html5'],
  css: ['css3', 'scss', 'sass', 'less'],
  git: ['github', 'gitlab', 'version control'],
  agile: ['scrum', 'kanban', 'sprint'],
  leadership: ['team lead', 'tech lead', 'engineering manager'],
  communication: ['presentation', 'public speaking'],
  problemsolving: ['analytical', 'critical thinking'],
};

// Normalize skill name for comparison
export function normalizeSkill(skill: string): string {
  return skill.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Check if two skills match (including synonyms)
export function skillsMatch(skill1: string, skill2: string): boolean {
  const norm1 = normalizeSkill(skill1);
  const norm2 = normalizeSkill(skill2);

  if (norm1 === norm2) return true;

  // Check synonyms
  for (const [key, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    const allVariants = [key, ...synonyms.map(normalizeSkill)];
    if (allVariants.includes(norm1) && allVariants.includes(norm2)) {
      return true;
    }
  }

  // Partial match (one contains the other)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true;
  }

  return false;
}

// Education level hierarchy (higher index = higher level)
export const EDUCATION_HIERARCHY = [
  'high_school',
  'associate',
  'bachelor',
  'bachelors',
  'master',
  'masters',
  'phd',
  'doctorate',
];

export function getEducationLevel(education: string): number {
  const normalized = education.toLowerCase().replace(/[^a-z]/g, '');

  // Check for PhD variants
  if (normalized.includes('phd') || normalized.includes('doctorate')) {
    return EDUCATION_HIERARCHY.indexOf('phd');
  }
  // Check for Master's variants
  if (normalized.includes('master') || normalized.includes('mba') || normalized.includes('ms')) {
    return EDUCATION_HIERARCHY.indexOf('master');
  }
  // Check for Bachelor's variants
  if (normalized.includes('bachelor') || normalized.includes('bs') || normalized.includes('ba')) {
    return EDUCATION_HIERARCHY.indexOf('bachelor');
  }
  // Check for Associate variants
  if (normalized.includes('associate') || normalized.includes('aa')) {
    return EDUCATION_HIERARCHY.indexOf('associate');
  }
  // Default to high school
  return 0;
}

// Compare education levels
export function meetsEducationRequirement(
  talentEducation: string | null,
  requiredEducation: string | null
): boolean {
  if (!requiredEducation) return true;
  if (!talentEducation) return false;

  const talentLevel = getEducationLevel(talentEducation);
  const requiredLevel = getEducationLevel(requiredEducation);

  return talentLevel >= requiredLevel;
}

// Score thresholds for match categories
export const MATCH_THRESHOLDS = {
  excellent: 85,
  good: 70,
  fair: 50,
  poor: 0,
};

export function getMatchCategory(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= MATCH_THRESHOLDS.excellent) return 'excellent';
  if (score >= MATCH_THRESHOLDS.good) return 'good';
  if (score >= MATCH_THRESHOLDS.fair) return 'fair';
  return 'poor';
}
