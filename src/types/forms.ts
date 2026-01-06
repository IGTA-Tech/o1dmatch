import { z } from 'zod';

// ============================================
// AUTH FORMS
// ============================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['talent', 'employer', 'agency', 'lawyer']),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  agree_terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// TALENT PROFILE FORMS
// ============================================

export const talentBasicInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  professional_headline: z.string().max(140, 'Headline must be 140 characters or less').optional(),
});

export type TalentBasicInfoFormData = z.infer<typeof talentBasicInfoSchema>;

// export const talentLocationSchema = z.object({
//   city: z.string().optional(),
//   state: z.string().optional(),
//   country: z.string().optional(),
//   willing_to_relocate: z.boolean().optional(),
//   preferred_locations: z.array(z.string()).optional(),
//   work_arrangement: z.enum(['on_site', 'hybrid', 'remote', 'flexible']).optional(),
//   engagement_type: z.enum(['full_time', 'part_time', 'contract_w2', 'consulting_1099', 'project_based']).optional(),
//   salary_min: z.number().optional(),
//   salary_preferred: z.number().optional(),
//   available_start: z.enum(['immediately', 'upon_approval', 'specific_date']).optional(),
//   available_start_date: z.string().optional(),
// });
export const talentLocationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  willing_to_relocate: z.boolean().optional(),
  preferred_locations: z.array(z.string()).default([]),  // Remove .optional()
  work_arrangement: z.enum(['on_site', 'hybrid', 'remote', 'flexible', '']).optional().nullable(),
  engagement_type: z.enum(['full_time', 'part_time', 'contract_w2', 'consulting_1099', 'project_based', '']).optional().nullable(),
  salary_min: z.number().optional().nullable(),
  salary_preferred: z.number().optional().nullable(),
  available_start: z.enum(['immediately', '2_weeks', '1_month', '2_months', '3_months', 'specific_date', '']).optional().nullable(),
  available_start_date: z.string().optional().nullable(),
});

export type TalentLocationFormData = z.infer<typeof talentLocationSchema>;

export const talentProfessionalSchema = z.object({
  current_job_title: z.string().optional(),
  current_employer: z.string().optional(),
  industry: z.string().optional(),
  years_experience: z.number().min(0).max(50).optional(),
  seniority: z.enum(['entry', 'mid', 'senior', 'lead', 'principal', 'executive']).optional(),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills').optional(),
});

export type TalentProfessionalFormData = z.infer<typeof talentProfessionalSchema>;

export const talentEducationSchema = z.object({
  education: z.enum(['high_school', 'bachelors', 'masters', 'phd', 'other']).optional(),
  university: z.string().optional(),
  field_of_study: z.string().optional(),
  graduation_year: z.number().min(1950).max(2030).optional(),
});

export type TalentEducationFormData = z.infer<typeof talentEducationSchema>;

export const talentOnlineProfilesSchema = z.object({
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  google_scholar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  personal_website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type TalentOnlineProfilesFormData = z.infer<typeof talentOnlineProfilesSchema>;

// ============================================
// DOCUMENT UPLOAD FORM
// ============================================

export const documentUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  criterion: z.enum([
    'awards',
    'memberships',
    'published_material',
    'judging',
    'original_contributions',
    'scholarly_articles',
    'critical_role',
    'high_salary',
  ]).optional(),
  auto_classify: z.boolean().default(true),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

// ============================================
// EMPLOYER PROFILE FORM
// ============================================

export const employerProfileSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional(),
  dba_name: z.string().optional(),
  company_website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  year_founded: z.number().min(1800).max(2030).optional(),
  company_description: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  signatory_name: z.string().min(1, 'Signatory name is required'),
  signatory_title: z.string().optional(),
  signatory_email: z.string().email('Invalid email'),
  signatory_phone: z.string().optional(),
  is_authorized_signatory: z.boolean().refine(val => val === true, 'You must certify you are authorized'),
  understands_o1_usage: z.boolean().refine(val => val === true, 'You must acknowledge O-1 usage'),
  agrees_to_terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

export type EmployerProfileFormData = z.infer<typeof employerProfileSchema>;

// ============================================
// JOB POSTING FORM
// ============================================

export const jobPostingStep1Schema = z.object({
  title: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  work_arrangement: z.enum(['on_site', 'hybrid', 'remote', 'flexible']).default('on_site'),
  locations: z.array(z.string()).min(1, 'At least one location is required'),
});

export const jobPostingStep2Schema = z.object({
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_period: z.enum(['year', 'month', 'hour']).default('year'),
  salary_negotiable: z.boolean().default(false),
  engagement_type: z.enum(['full_time', 'part_time', 'contract_w2', 'consulting_1099', 'project_based']).default('full_time'),
  start_timing: z.enum(['upon_approval', 'within_30_days', 'within_90_days', 'specific_date', 'flexible']).optional(),
  start_date: z.string().optional(),
  closes_at: z.string().optional(),
});

export const jobPostingStep3Schema = z.object({
  min_score: z.number().min(0).max(100).default(0),
  preferred_criteria: z.array(z.enum([
    'awards',
    'memberships',
    'published_material',
    'judging',
    'original_contributions',
    'scholarly_articles',
    'critical_role',
    'high_salary',
  ])).default([]),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  min_education: z.enum(['any', 'bachelors', 'masters', 'phd_preferred', 'phd_required']).optional(),
  education_preferred_not_required: z.boolean().default(false),
  min_years_experience: z.number().min(0).max(30).optional(),
});

export const jobPostingStep4Schema = z.object({
  description: z.string().min(50, 'Job description must be at least 50 characters'),
  why_o1_required: z.string().optional(),
  visibility: z.enum(['public', 'invite_only', 'featured']).default('public'),
});

export type JobPostingStep1FormData = z.infer<typeof jobPostingStep1Schema>;
export type JobPostingStep2FormData = z.infer<typeof jobPostingStep2Schema>;
export type JobPostingStep3FormData = z.infer<typeof jobPostingStep3Schema>;
export type JobPostingStep4FormData = z.infer<typeof jobPostingStep4Schema>;

export type JobPostingFormData = JobPostingStep1FormData &
  JobPostingStep2FormData &
  JobPostingStep3FormData &
  JobPostingStep4FormData;

// ============================================
// INTEREST LETTER FORM
// ============================================

export const interestLetterStep1Schema = z.object({
  commitment_level: z.enum([
    'exploratory_interest',
    'intent_to_engage',
    'conditional_offer',
    'firm_commitment',
    'offer_extended',
  ]),
});

export const interestLetterStep2Schema = z.object({
  job_title: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_period: z.enum(['year', 'month', 'hour']).default('year'),
  salary_negotiable: z.boolean().default(false),
});

export const interestLetterStep3Schema = z.object({
  engagement_type: z.enum(['full_time', 'part_time', 'contract_w2', 'consulting_1099', 'project_based']).default('full_time'),
  start_timing: z.enum(['upon_approval', 'within_30_days', 'within_90_days', 'specific_date', 'flexible']).optional(),
  duration_years: z.number().min(1).max(5).default(3),
  work_arrangement: z.enum(['on_site', 'hybrid', 'remote', 'flexible']).default('on_site'),
  locations: z.array(z.string()).min(1, 'At least one location is required'),
});

export const interestLetterStep4Schema = z.object({
  duties_description: z.string().min(50, 'Duties description must be at least 50 characters'),
  why_o1_required: z.string().min(50, 'O-1 justification must be at least 50 characters'),
});

export const interestLetterStep5Schema = z.object({
  confirm_accurate: z.boolean().refine(val => val === true, 'You must confirm accuracy'),
  confirm_authorized: z.boolean().refine(val => val === true, 'You must confirm authorization'),
  confirm_understand_usage: z.boolean().refine(val => val === true, 'You must confirm understanding'),
});

export type InterestLetterFormData = z.infer<typeof interestLetterStep1Schema> &
  z.infer<typeof interestLetterStep2Schema> &
  z.infer<typeof interestLetterStep3Schema> &
  z.infer<typeof interestLetterStep4Schema>;

// ============================================
// LAWYER CONNECTION REQUEST FORM
// ============================================

export const lawyerConnectionRequestSchema = z.object({
  requester_type: z.enum(['talent', 'employer', 'other']),
  requester_name: z.string().min(1, 'Name is required'),
  requester_email: z.string().email('Invalid email'),
  requester_phone: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  share_profile: z.boolean().default(false),
  consent_share_contact: z.boolean().refine(val => val === true, 'You must consent to share contact info'),
});

export type LawyerConnectionRequestFormData = z.infer<typeof lawyerConnectionRequestSchema>;

// ============================================
// APPLICATION FORM
// ============================================

export const applicationSchema = z.object({
  cover_message: z.string().max(1000, 'Cover message must be 1000 characters or less').optional(),
  attached_documents: z.array(z.string()).default([]),
  below_threshold_reason: z.string().optional(),
  consent_share_profile: z.boolean().refine(val => val === true, 'You must consent to share your profile'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
