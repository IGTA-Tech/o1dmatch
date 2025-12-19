// User roles
export type UserRole = 'talent' | 'employer' | 'agency' | 'lawyer' | 'admin';

// Visa status for talent
export type VisaStatus =
  | 'not_filed'
  | 'early_stage'
  | 'profile_building'
  | 'strong_candidate'
  | 'ready_to_file'
  | 'filed'
  | 'approved'
  | 'denied';

// Document status
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';

// AI classification confidence
export type ClassificationConfidence = 'high' | 'medium' | 'low';

// O-1 criteria types
export type O1Criterion =
  | 'awards'
  | 'memberships'
  | 'published_material'
  | 'judging'
  | 'original_contributions'
  | 'scholarly_articles'
  | 'critical_role'
  | 'high_salary';

// Job status
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'filled';

// Application status
export type ApplicationStatus =
  | 'submitted'
  | 'pending'
  | 'under_review'
  | 'reviewed'
  | 'shortlisted'
  | 'interview_requested'
  | 'letter_sent'
  | 'rejected'
  | 'withdrawn'
  | 'hired';

// Interest letter status
export type LetterStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired';

// Commitment level for interest letters
export type CommitmentLevel =
  | 'exploratory_interest'
  | 'intent_to_engage'
  | 'conditional_offer'
  | 'firm_commitment'
  | 'offer_extended';

// Work arrangement types
export type WorkArrangement = 'on_site' | 'hybrid' | 'remote' | 'flexible';

// Engagement types
export type EngagementType =
  | 'full_time'
  | 'part_time'
  | 'contract_w2'
  | 'consulting_1099'
  | 'project_based';

// Lawyer directory tier
export type LawyerTier = 'basic' | 'premium' | 'featured';

// Connection request status
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

// Commitment levels with their legal language
export const COMMITMENT_LEVELS: Record<
  CommitmentLevel,
  {
    name: string;
    description: string;
    language: string;
  }
> = {
  exploratory_interest: {
    name: 'Exploratory Interest',
    description: 'Lowest commitment - expressing initial interest',
    language:
      'We are interested in exploring the possibility of engaging {name} for a position as {title}. While we have not made a final determination, we believe {name}\'s qualifications warrant serious consideration for this role.',
  },
  intent_to_engage: {
    name: 'Intent to Engage',
    description: 'Genuine interest in engaging the candidate',
    language:
      'We have a genuine interest in engaging {name} as a {title}. Based on our review of {name}\'s qualifications and experience, we intend to pursue discussions regarding potential employment, contingent upon {name}\'s ability to obtain appropriate work authorization.',
  },
  conditional_offer: {
    name: 'Conditional Offer',
    description: 'Intent to offer, subject to visa approval',
    language:
      'We intend to offer {name} employment as a {title}, subject to {name}\'s obtaining O-1 visa approval. Upon approval of the visa petition, we are prepared to offer an annual salary in the range of {salary_range}, commensurate with {name}\'s extraordinary abilities and the market rate for such positions.',
  },
  firm_commitment: {
    name: 'Firm Commitment',
    description: 'Strong commitment to immediately engage upon approval',
    language:
      'We are prepared to immediately engage {name} as a {title} upon approval of {his_her} O-1 visa petition. We are offering an annual compensation package in the range of {salary_range}. This position is available immediately, and we are committed to sponsoring {name}\'s visa application.',
  },
  offer_extended: {
    name: 'Offer Extended',
    description: 'Highest commitment - formal offer already made',
    language:
      'We have extended a formal offer of employment to {name} for the position of {title} at an annual salary of {salary_range}. This offer is contingent only upon {name}\'s obtaining O-1 visa approval. We fully support {name}\'s visa petition and confirm our commitment to employ {name} in this capacity.',
  },
};

// O-1 Criteria definitions
export const O1_CRITERIA: Record<
  O1Criterion,
  {
    name: string;
    description: string;
    examples: string[];
    maxScore: number;
    threshold: number;
  }
> = {
  awards: {
    name: 'Awards',
    description:
      'Nationally or internationally recognized prizes or awards for excellence',
    examples: [
      'Best Paper Award at major conference',
      'Industry excellence award',
      'National/international competition winner',
    ],
    maxScore: 25,
    threshold: 10,
  },
  memberships: {
    name: 'Memberships',
    description:
      'Membership in associations requiring outstanding achievements',
    examples: [
      'ACM Fellow',
      'IEEE Senior Member',
      'Invitation-only professional groups',
    ],
    maxScore: 25,
    threshold: 10,
  },
  published_material: {
    name: 'Published Material',
    description: 'Published material about you in professional/major media',
    examples: [
      'News articles about your work',
      'MIT Technology Review feature',
      'VentureBeat profile',
    ],
    maxScore: 25,
    threshold: 10,
  },
  judging: {
    name: 'Judging',
    description: 'Participation as a judge of others\' work in the field',
    examples: [
      'Conference paper reviewer',
      'Grant review panel member',
      'Competition judge',
    ],
    maxScore: 25,
    threshold: 10,
  },
  original_contributions: {
    name: 'Original Contributions',
    description: 'Original contributions of major significance in the field',
    examples: [
      'Patents',
      'Novel algorithms/methods',
      'Industry-adopted innovations',
    ],
    maxScore: 25,
    threshold: 10,
  },
  scholarly_articles: {
    name: 'Scholarly Articles',
    description: 'Authorship of scholarly articles in professional journals',
    examples: [
      'Peer-reviewed publications',
      'Conference papers',
      'Citations in the field',
    ],
    maxScore: 25,
    threshold: 10,
  },
  critical_role: {
    name: 'Critical Role',
    description:
      'Employment in a critical or essential capacity for distinguished organizations',
    examples: [
      'Senior/Lead position at Fortune 500',
      'Key technical role at prominent startup',
      'Essential team leadership',
    ],
    maxScore: 25,
    threshold: 10,
  },
  high_salary: {
    name: 'High Salary',
    description:
      'High salary or remuneration compared to others in the field',
    examples: [
      'Top 10% salary in field',
      'Documented above-market compensation',
      'Significant equity grants',
    ],
    maxScore: 25,
    threshold: 10,
  },
};

// Score thresholds for visa status
export const SCORE_THRESHOLDS = {
  EXCEPTIONAL: { min: 80, status: 'ready_to_file' as VisaStatus, label: 'Exceptional' },
  READY_TO_FILE: { min: 70, status: 'ready_to_file' as VisaStatus, label: 'Ready to File' },
  STRONG_CANDIDATE: { min: 50, status: 'strong_candidate' as VisaStatus, label: 'Strong Candidate' },
  PROFILE_BUILDING: { min: 40, status: 'profile_building' as VisaStatus, label: 'Profile Building' },
  EARLY_STAGE: { min: 0, status: 'early_stage' as VisaStatus, label: 'Early Stage' },
};

export function getScoreStatus(score: number): {
  status: VisaStatus;
  label: string;
  color: string;
} {
  if (score >= 80) return { status: 'ready_to_file', label: 'Exceptional', color: 'green' };
  if (score >= 70) return { status: 'ready_to_file', label: 'Ready to File', color: 'green' };
  if (score >= 50) return { status: 'strong_candidate', label: 'Strong Candidate', color: 'yellow' };
  if (score >= 40) return { status: 'profile_building', label: 'Profile Building', color: 'yellow' };
  return { status: 'early_stage', label: 'Early Stage', color: 'red' };
}

// Alias for getScoreStatus for API compatibility
export function getVisaStatus(score: number) {
  return getScoreStatus(score);
}
