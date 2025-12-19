import {
  UserRole,
  VisaStatus,
  DocumentStatus,
  ClassificationConfidence,
  O1Criterion,
  JobStatus,
  ApplicationStatus,
  LetterStatus,
  CommitmentLevel,
  WorkArrangement,
  EngagementType,
  LawyerTier,
  ConnectionStatus,
} from './enums';

// Base profile linked to Supabase auth
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Evidence summary for each criterion
export interface CriterionEvidence {
  score: number;
  max_score: number;
  met: boolean;
  evidence_count: number;
  has: string[];
  needs: string[];
}

export interface EvidenceSummary {
  awards?: CriterionEvidence;
  memberships?: CriterionEvidence;
  published_material?: CriterionEvidence;
  judging?: CriterionEvidence;
  original_contributions?: CriterionEvidence;
  scholarly_articles?: CriterionEvidence;
  critical_role?: CriterionEvidence;
  high_salary?: CriterionEvidence;
}

// Full talent profile (internal use only)
export interface TalentProfile {
  id: string;
  user_id: string;
  candidate_id: string;

  // Identity
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;

  // Professional Info
  professional_headline: string | null;
  current_job_title: string | null;
  current_employer: string | null;
  industry: string | null;
  years_experience: number | null;
  seniority: string | null;
  skills: string[];

  // Education
  education: string | null;
  university: string | null;
  field_of_study: string | null;
  graduation_year: number | null;

  // Location
  city: string | null;
  state: string | null;
  country: string;
  willing_to_relocate: boolean;
  preferred_locations: string[];

  // Work Preferences
  work_arrangement: WorkArrangement | null;
  engagement_type: EngagementType | null;
  salary_min: number | null;
  salary_preferred: number | null;
  available_start: string | null;
  available_start_date: string | null;

  // Online Profiles
  linkedin_url: string | null;
  github_url: string | null;
  google_scholar_url: string | null;
  personal_website: string | null;

  // Resume
  resume_url: string | null;
  resume_filename: string | null;

  // O-1 Score Data
  o1_score: number;
  visa_status: VisaStatus;
  criteria_met: O1Criterion[];
  evidence_summary: EvidenceSummary;
  score_updated_at: string | null;

  // Metrics
  publications_count: number;
  h_index: number;
  citations_count: number;
  patents_count: number;

  // Profile Settings
  profile_photo_url: string | null;
  is_public: boolean;

  created_at: string;
  updated_at: string;
}

// Masked talent profile (what employers see before letter accepted)
export interface MaskedTalentProfile {
  candidate_id: string;
  o1_score: number;
  visa_status: VisaStatus;

  // Professional (no employer name)
  current_job_title: string | null;
  industry: string | null;
  years_experience: number | null;
  seniority: string | null;
  skills: string[];

  // Education
  education: string | null;

  // Location (city/state only)
  city: string | null;
  state: string | null;

  // Preferences
  willing_to_relocate: boolean;
  preferred_locations: string[];
  work_arrangement: WorkArrangement | null;
  engagement_type: EngagementType | null;
  salary_min: number | null;

  // O-1 Data
  criteria_met: O1Criterion[];
  evidence_summary: EvidenceSummary;

  // NOT included:
  // - first_name, last_name
  // - email, phone
  // - current_employer
  // - linkedin_url, github_url, etc.
  // - resume_url
}

// Revealed talent info (after letter accepted)
export interface RevealedTalentInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
}

// Talent document
export interface TalentDocument {
  id: string;
  talent_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  criterion: O1Criterion | null;
  auto_classified_criterion: O1Criterion | null;
  classification_confidence: ClassificationConfidence | null;
  classification_notes: string | null;
  status: DocumentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Employer profile
export interface EmployerProfile {
  id: string;
  user_id: string;

  // Company Info
  company_name: string;
  legal_name: string | null;
  dba_name: string | null;
  company_logo_url: string | null;
  company_website: string | null;
  industry: string | null;
  company_size: string | null;
  year_founded: number | null;
  company_description: string | null;

  // Address
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;

  // Signatory
  signatory_name: string;
  signatory_title: string | null;
  signatory_email: string;
  signatory_phone: string | null;

  // Certifications
  is_authorized_signatory: boolean;
  understands_o1_usage: boolean;
  agrees_to_terms: boolean;
  profile_complete: boolean;

  created_at: string;
  updated_at: string;
}

// Agency profile
export interface AgencyProfile {
  id: string;
  user_id: string;
  agency_name: string;
  legal_name: string | null;
  agency_logo_url: string | null;
  agency_website: string | null;
  agency_description: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

// Agency client
export interface AgencyClient {
  id: string;
  agency_id: string;
  show_client_identity: boolean;
  company_name: string;
  legal_name: string | null;
  company_logo_url: string | null;
  company_website: string | null;
  industry: string | null;
  company_size: string | null;
  company_description: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  signatory_name: string;
  signatory_title: string | null;
  signatory_email: string;
  signatory_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Job listing
export interface JobListing {
  id: string;
  employer_id: string | null;
  agency_id: string | null;
  agency_client_id: string | null;

  title: string;
  department: string | null;
  description: string;
  why_o1_required: string | null;

  work_arrangement: WorkArrangement;
  locations: string[];

  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  salary_negotiable: boolean;

  engagement_type: EngagementType;
  start_timing: string | null;
  start_date: string | null;

  min_score: number;
  preferred_criteria: O1Criterion[];
  required_skills: string[];
  preferred_skills: string[];
  min_education: string | null;
  education_preferred_not_required: boolean;
  min_years_experience: number | null;

  status: JobStatus;
  visibility: string;
  is_featured: boolean;

  posted_at: string | null;
  closes_at: string | null;

  views_count: number;
  applications_count: number;

  is_flagged: boolean;
  flag_reason: string | null;

  created_at: string;
  updated_at: string;

  // Joined data
  employer?: EmployerProfile;
  agency?: AgencyProfile;
  agency_client?: AgencyClient;
}

// Job application
export interface JobApplication {
  id: string;
  job_id: string;
  talent_id: string;
  cover_message: string | null;
  attached_documents: string[];
  score_at_application: number | null;
  criteria_met_at_application: O1Criterion[];
  status: ApplicationStatus;
  employer_rating: number | null;
  employer_notes: string | null;
  applied_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined data
  job?: JobListing;
  talent?: MaskedTalentProfile;
}

// Interest letter
export interface InterestLetter {
  id: string;
  talent_id: string;
  employer_id: string | null;
  agency_id: string | null;
  agency_client_id: string | null;

  source_type: 'browse' | 'application';
  job_id: string | null;
  application_id: string | null;

  commitment_level: CommitmentLevel;
  job_title: string;
  department: string | null;

  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  salary_negotiable: boolean;

  engagement_type: EngagementType | null;
  start_timing: string | null;
  duration_years: number | null;
  work_arrangement: WorkArrangement | null;
  locations: string[];

  duties_description: string;
  why_o1_required: string;

  letter_content: string | null;
  pdf_url: string | null;

  status: LetterStatus;
  talent_response_message: string | null;
  responded_at: string | null;
  expires_at: string | null;
  revealed_at: string | null;

  created_at: string;
  updated_at: string;

  // Joined data
  employer?: EmployerProfile;
  talent?: TalentProfile | MaskedTalentProfile;
}

// Lawyer profile
export interface LawyerProfile {
  id: string;
  user_id: string;
  attorney_name: string;
  attorney_title: string | null;
  firm_name: string;
  firm_logo_url: string | null;
  bio: string | null;
  specializations: string[];
  visa_types: string[];
  firm_size: string | null;
  office_location: string | null;
  website_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  tier: LawyerTier;
  is_active: boolean;
  profile_views: number;
  connection_requests: number;
  created_at: string;
  updated_at: string;
}

// Public lawyer profile (no contact info)
export interface PublicLawyerProfile {
  id: string;
  attorney_name: string;
  attorney_title: string | null;
  firm_name: string;
  firm_logo_url: string | null;
  bio: string | null;
  specializations: string[];
  visa_types: string[];
  firm_size: string | null;
  office_location: string | null;
  website_url: string | null;
  tier: LawyerTier;
  // NO contact_email, contact_phone
}

// Lawyer connection request
export interface LawyerConnectionRequest {
  id: string;
  lawyer_id: string;
  requester_id: string;
  requester_type: 'talent' | 'employer' | 'other';
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  message: string;
  share_profile: boolean;
  talent_profile_id: string | null;
  status: ConnectionStatus;
  lawyer_notes: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined data
  lawyer?: LawyerProfile;
  talent_profile?: MaskedTalentProfile;
}

// Score override (admin)
export interface ScoreOverride {
  id: string;
  talent_id: string;
  override_score: number | null;
  criterion_overrides: Record<O1Criterion, number> | null;
  admin_id: string;
  reason: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Admin note
export interface AdminNote {
  id: string;
  user_id: string;
  admin_id: string;
  note: string;
  created_at: string;
}

// Activity log
export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Job match calculation result
export interface JobMatch {
  overall_score: number;
  score_requirement: {
    required: number;
    has: number;
    met: boolean;
    points: number;
  };
  criteria_match: {
    criterion: O1Criterion;
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
