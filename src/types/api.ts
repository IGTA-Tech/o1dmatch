import {
  Profile,
  MaskedTalentProfile,
  JobListing,
  EvidenceSummary,
  JobMatch,
  RevealedTalentInfo,
  PublicLawyerProfile,
} from './models';
import { O1Criterion, ApplicationStatus, LetterStatus } from './enums';

// ============================================
// BASE RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// ============================================
// AUTH
// ============================================

export interface SignUpRequest {
  email: string;
  password: string;
  role: 'talent' | 'employer' | 'agency' | 'lawyer';
  full_name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

// ============================================
// TALENT
// ============================================

export interface TalentProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  professional_headline?: string;
  current_job_title?: string;
  current_employer?: string;
  industry?: string;
  years_experience?: number;
  seniority?: string;
  skills?: string[];
  education?: string;
  university?: string;
  field_of_study?: string;
  graduation_year?: number;
  city?: string;
  state?: string;
  country?: string;
  willing_to_relocate?: boolean;
  preferred_locations?: string[];
  work_arrangement?: string;
  engagement_type?: string;
  salary_min?: number;
  salary_preferred?: number;
  available_start?: string;
  available_start_date?: string;
  linkedin_url?: string;
  github_url?: string;
  google_scholar_url?: string;
  personal_website?: string;
  is_public?: boolean;
}

export interface DocumentUploadRequest {
  title: string;
  description?: string;
  criterion?: O1Criterion;
  auto_classify?: boolean;
}

export interface DocumentUploadResponse {
  id: string;
  file_url: string;
  title: string;
  status: string;
  auto_classified_criterion?: O1Criterion;
  classification_confidence?: string;
  classification_notes?: string;
  score_impact?: number;
}

export interface ScoreResponse {
  o1_score: number;
  visa_status: string;
  criteria_met: O1Criterion[];
  evidence_summary: EvidenceSummary;
  score_updated_at: string;
}

// ============================================
// EMPLOYER
// ============================================

export interface EmployerProfileUpdateRequest {
  company_name?: string;
  legal_name?: string;
  dba_name?: string;
  company_website?: string;
  industry?: string;
  company_size?: string;
  year_founded?: number;
  company_description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  signatory_name?: string;
  signatory_title?: string;
  signatory_email?: string;
  signatory_phone?: string;
  is_authorized_signatory?: boolean;
  understands_o1_usage?: boolean;
  agrees_to_terms?: boolean;
}

export interface TalentBrowseRequest {
  min_score?: number;
  industry?: string;
  skills?: string[];
  education?: string;
  location?: string;
  criteria_met?: O1Criterion[];
  work_arrangement?: string;
  page?: number;
  per_page?: number;
}

export type TalentBrowseResponse = PaginatedResponse<MaskedTalentProfile>;

// ============================================
// JOBS
// ============================================

export interface JobCreateRequest {
  title: string;
  department?: string;
  description: string;
  why_o1_required?: string;
  work_arrangement?: string;
  locations?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  salary_negotiable?: boolean;
  engagement_type?: string;
  start_timing?: string;
  start_date?: string;
  min_score?: number;
  preferred_criteria?: O1Criterion[];
  required_skills?: string[];
  preferred_skills?: string[];
  min_education?: string;
  education_preferred_not_required?: boolean;
  min_years_experience?: number;
  visibility?: string;
  closes_at?: string;
}

export interface JobMatchResponse {
  job: JobListing;
  match: JobMatch;
}

// ============================================
// APPLICATIONS
// ============================================

export interface ApplicationCreateRequest {
  job_id: string;
  cover_message?: string;
  attached_documents?: string[];
}

export interface ApplicationResponse {
  id: string;
  job_id: string;
  talent_id: string;
  status: ApplicationStatus;
  score_at_application: number;
  criteria_met_at_application: O1Criterion[];
  created_at: string;
}

export interface ApplicationUpdateRequest {
  status?: ApplicationStatus;
  employer_rating?: number;
  employer_notes?: string;
}

// ============================================
// INTEREST LETTERS
// ============================================

export interface LetterCreateRequest {
  talent_id: string;
  source_type: 'browse' | 'application';
  job_id?: string;
  application_id?: string;
  commitment_level: string;
  job_title: string;
  department?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  salary_negotiable?: boolean;
  engagement_type?: string;
  start_timing?: string;
  duration_years?: number;
  work_arrangement?: string;
  locations?: string[];
  duties_description: string;
  why_o1_required: string;
}

export interface LetterCreateResponse {
  letter_id: string;
  pdf_url: string;
  status: LetterStatus;
  talent_revealed: RevealedTalentInfo;
}

export interface LetterRespondRequest {
  accept: boolean;
  message?: string;
}

// ============================================
// LAWYERS
// ============================================

export interface LawyerSearchRequest {
  specializations?: string[];
  visa_types?: string[];
  page?: number;
  per_page?: number;
}

export type LawyerSearchResponse = PaginatedResponse<PublicLawyerProfile>;

export interface ConnectionRequestCreate {
  lawyer_id: string;
  requester_type: 'talent' | 'employer' | 'other';
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  message: string;
  share_profile?: boolean;
}

export interface ConnectionRequestRespond {
  accept: boolean;
  lawyer_notes?: string;
}

// ============================================
// ADMIN
// ============================================

export interface AdminStatsResponse {
  users: {
    total: number;
    talent: number;
    employer: number;
    agency: number;
    lawyer: number;
  };
  documents: {
    pending: number;
    verified: number;
    rejected: number;
  };
  jobs: {
    active: number;
    total: number;
    flagged: number;
  };
  letters: {
    this_month: number;
    acceptance_rate: number;
  };
}

export interface DocumentReviewRequest {
  status: 'verified' | 'rejected';
  criterion?: O1Criterion;
  review_notes?: string;
}

export interface ScoreOverrideRequest {
  talent_id: string;
  override_score?: number;
  criterion_overrides?: Record<O1Criterion, number>;
  reason: string;
}

export interface UserUpdateRequest {
  role?: string;
  is_verified?: boolean;
}
