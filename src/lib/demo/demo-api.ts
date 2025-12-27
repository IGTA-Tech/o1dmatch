/**
 * Demo API Service
 *
 * Provides mock API responses for all endpoints in demo mode.
 */

import type { O1Criterion, ClassificationConfidence, JobStatus } from '@/types/enums';
import type { TalentProfile, MaskedTalentProfile, JobListing, InterestLetter, JobApplication, TalentDocument, JobMatch } from '@/types/models';
import { simulateDelay } from './config';
import { DEMO_TALENT_PROFILES, DEMO_MASKED_TALENTS, maskTalentProfile } from './mock-data';
import { DEMO_JOB_LISTINGS, DEMO_JOB_LISTINGS_WITH_EMPLOYERS } from './mock-employers';
import { DEMO_PUBLIC_LAWYER_PROFILES } from './mock-lawyers';
import { DEMO_INTEREST_LETTERS, DEMO_JOB_APPLICATIONS, getLettersByTalent, getLettersByEmployer, getApplicationsByTalent, getApplicationsByJob } from './mock-letters';
import { DEMO_TALENT_DOCUMENTS, getDocumentsByTalent } from './mock-documents';

/**
 * Demo API Service - Simulates all backend API calls
 */
export class DemoAPI {
  // ============================================================================
  // TALENT APIs
  // ============================================================================

  static async getTalentProfile(userId: string): Promise<TalentProfile | null> {
    await simulateDelay('api');
    return DEMO_TALENT_PROFILES.find(t => t.user_id === userId) || DEMO_TALENT_PROFILES[0];
  }

  static async getMaskedTalents(filters?: {
    minScore?: number;
    criteria?: O1Criterion[];
    skills?: string[];
  }): Promise<MaskedTalentProfile[]> {
    await simulateDelay('api');

    let talents = [...DEMO_MASKED_TALENTS];

    if (filters?.minScore) {
      talents = talents.filter(t => t.o1_score >= filters.minScore!);
    }

    if (filters?.criteria?.length) {
      talents = talents.filter(t =>
        filters.criteria!.some(c => t.criteria_met.includes(c))
      );
    }

    if (filters?.skills?.length) {
      talents = talents.filter(t =>
        filters.skills!.some(s => t.skills.includes(s))
      );
    }

    return talents;
  }

  static async updateTalentProfile(userId: string, updates: Partial<TalentProfile>): Promise<TalentProfile> {
    await simulateDelay('api');
    const profile = DEMO_TALENT_PROFILES.find(t => t.user_id === userId) || DEMO_TALENT_PROFILES[0];
    return { ...profile, ...updates, updated_at: new Date().toISOString() };
  }

  // ============================================================================
  // DOCUMENT APIs
  // ============================================================================

  static async getDocuments(talentId: string): Promise<TalentDocument[]> {
    await simulateDelay('api');
    return getDocumentsByTalent(talentId);
  }

  static async uploadDocument(talentId: string, file: File, title: string): Promise<TalentDocument> {
    await simulateDelay('upload');

    // Simulate document upload and classification
    const newDoc: TalentDocument = {
      id: `doc-${Date.now()}`,
      talent_id: talentId,
      title: title,
      description: null,
      file_url: `/demo/documents/${file.name}`,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      criterion: null,
      auto_classified_criterion: null,
      classification_confidence: null,
      classification_notes: null,
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      review_notes: null,
      score_impact: null,
      extraction_method: 'pdf',
      extraction_confidence: null,
      extracted_text: null,
      ai_reasoning: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newDoc;
  }

  static async classifyDocument(documentId: string): Promise<TalentDocument> {
    await simulateDelay('classification');

    // Find the document
    const doc = DEMO_TALENT_DOCUMENTS.find(d => d.id === documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    // Simulate AI classification
    const criteria: O1Criterion[] = ['awards', 'memberships', 'published_material', 'judging', 'original_contributions', 'scholarly_articles', 'critical_role', 'high_salary'];
    const randomCriterion = criteria[Math.floor(Math.random() * criteria.length)];
    const confidences = ['high', 'medium', 'low'] as ClassificationConfidence[];
    const randomConfidence = confidences[Math.floor(Math.random() * 2)]; // Bias toward high/medium

    return {
      ...doc,
      auto_classified_criterion: randomCriterion,
      classification_confidence: randomConfidence,
      classification_notes: `AI classified this document as evidence for ${randomCriterion.replace('_', ' ')}.`,
      score_impact: randomConfidence === 'high' ? 10 : randomConfidence === 'medium' ? 7 : 4,
      extraction_confidence: 0.85,
      ai_reasoning: `Based on the document content, this appears to be evidence of ${randomCriterion.replace('_', ' ')}. The extracted text contains relevant keywords and context.`,
      updated_at: new Date().toISOString(),
    };
  }

  // ============================================================================
  // JOB APIs
  // ============================================================================

  static async getJobs(filters?: {
    status?: JobStatus;
    minScore?: number;
    skills?: string[];
  }): Promise<JobListing[]> {
    await simulateDelay('api');

    let jobs = [...DEMO_JOB_LISTINGS_WITH_EMPLOYERS];

    if (filters?.status) {
      jobs = jobs.filter(j => j.status === filters.status);
    }

    if (filters?.minScore) {
      jobs = jobs.filter(j => j.min_score <= filters.minScore!);
    }

    return jobs;
  }

  static async getJob(jobId: string): Promise<JobListing | null> {
    await simulateDelay('api');
    return DEMO_JOB_LISTINGS_WITH_EMPLOYERS.find(j => j.id === jobId) || null;
  }

  static async createJob(employerId: string, jobData: Partial<JobListing>): Promise<JobListing> {
    await simulateDelay('api');

    const newJob: JobListing = {
      id: `job-${Date.now()}`,
      employer_id: employerId,
      agency_id: null,
      agency_client_id: null,
      title: jobData.title || 'New Position',
      department: jobData.department || null,
      description: jobData.description || '',
      why_o1_required: jobData.why_o1_required || '',
      work_arrangement: jobData.work_arrangement!,
      locations: jobData.locations || [],
      salary_min: jobData.salary_min || null,
      salary_max: jobData.salary_max || null,
      salary_period: jobData.salary_period || 'annual',
      salary_negotiable: jobData.salary_negotiable || false,
      engagement_type: jobData.engagement_type!,
      start_timing: jobData.start_timing || null,
      start_date: jobData.start_date || null,
      min_score: jobData.min_score || 50,
      preferred_criteria: jobData.preferred_criteria || [],
      required_skills: jobData.required_skills || [],
      preferred_skills: jobData.preferred_skills || [],
      min_education: jobData.min_education || null,
      education_preferred_not_required: jobData.education_preferred_not_required || true,
      min_years_experience: jobData.min_years_experience || null,
      status: 'draft',
      visibility: 'public',
      is_featured: false,
      posted_at: null,
      closes_at: null,
      views_count: 0,
      applications_count: 0,
      is_flagged: false,
      flag_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newJob;
  }

  // ============================================================================
  // APPLICATION APIs
  // ============================================================================

  static async getApplications(talentId?: string, jobId?: string): Promise<JobApplication[]> {
    await simulateDelay('api');

    if (talentId) {
      return getApplicationsByTalent(talentId);
    }
    if (jobId) {
      return getApplicationsByJob(jobId);
    }
    return DEMO_JOB_APPLICATIONS;
  }

  static async createApplication(talentId: string, jobId: string, coverMessage: string): Promise<JobApplication> {
    await simulateDelay('api');

    const talent = DEMO_TALENT_PROFILES.find(t => t.id === talentId);

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      job_id: jobId,
      talent_id: talentId,
      cover_message: coverMessage,
      attached_documents: [],
      score_at_application: talent?.o1_score || 50,
      criteria_met_at_application: talent?.criteria_met || [],
      status: 'pending',
      employer_rating: null,
      employer_notes: null,
      applied_at: new Date().toISOString(),
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newApp;
  }

  // ============================================================================
  // LETTER APIs
  // ============================================================================

  static async getLetters(talentId?: string, employerId?: string): Promise<InterestLetter[]> {
    await simulateDelay('api');

    if (talentId) {
      return getLettersByTalent(talentId);
    }
    if (employerId) {
      return getLettersByEmployer(employerId);
    }
    return DEMO_INTEREST_LETTERS;
  }

  static async getLetter(letterId: string): Promise<InterestLetter | null> {
    await simulateDelay('api');
    return DEMO_INTEREST_LETTERS.find(l => l.id === letterId) || null;
  }

  static async createLetter(letterData: Partial<InterestLetter>): Promise<InterestLetter> {
    await simulateDelay('api');

    const newLetter: InterestLetter = {
      id: `letter-${Date.now()}`,
      talent_id: letterData.talent_id!,
      employer_id: letterData.employer_id || null,
      agency_id: letterData.agency_id || null,
      agency_client_id: letterData.agency_client_id || null,
      source_type: letterData.source_type || 'browse',
      job_id: letterData.job_id || null,
      application_id: letterData.application_id || null,
      commitment_level: letterData.commitment_level!,
      job_title: letterData.job_title!,
      department: letterData.department || null,
      salary_min: letterData.salary_min || null,
      salary_max: letterData.salary_max || null,
      salary_period: letterData.salary_period || 'annual',
      salary_negotiable: letterData.salary_negotiable || false,
      engagement_type: letterData.engagement_type || null,
      start_timing: letterData.start_timing || null,
      duration_years: letterData.duration_years || null,
      work_arrangement: letterData.work_arrangement || null,
      locations: letterData.locations || [],
      duties_description: letterData.duties_description!,
      why_o1_required: letterData.why_o1_required!,
      letter_content: null,
      pdf_url: null,
      status: 'draft',
      talent_response_message: null,
      responded_at: null,
      expires_at: null,
      revealed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newLetter;
  }

  static async sendLetter(letterId: string): Promise<InterestLetter> {
    await simulateDelay('api');

    const letter = DEMO_INTEREST_LETTERS.find(l => l.id === letterId);
    if (!letter) {
      throw new Error('Letter not found');
    }

    return {
      ...letter,
      status: 'sent',
      pdf_url: `/demo/letters/${letterId}.pdf`,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      updated_at: new Date().toISOString(),
    };
  }

  static async respondToLetter(letterId: string, accept: boolean, message?: string): Promise<InterestLetter> {
    await simulateDelay('api');

    const letter = DEMO_INTEREST_LETTERS.find(l => l.id === letterId);
    if (!letter) {
      throw new Error('Letter not found');
    }

    return {
      ...letter,
      status: accept ? 'accepted' : 'declined',
      talent_response_message: message || null,
      responded_at: new Date().toISOString(),
      revealed_at: accept ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
  }

  // ============================================================================
  // MATCHING APIs
  // ============================================================================

  static async calculateMatch(talentId: string, jobId: string): Promise<JobMatch> {
    await simulateDelay('api');

    const talent = DEMO_TALENT_PROFILES.find(t => t.id === talentId);
    const job = DEMO_JOB_LISTINGS.find(j => j.id === jobId);

    if (!talent || !job) {
      throw new Error('Talent or job not found');
    }

    // Calculate match score
    const scoreRequirementMet = talent.o1_score >= job.min_score;
    const scorePoints = scoreRequirementMet ? 40 : Math.floor((talent.o1_score / job.min_score) * 40);

    const criteriaMatch = job.preferred_criteria.map(criterion => ({
      criterion,
      required: false,
      has: talent.criteria_met.includes(criterion),
      points: talent.criteria_met.includes(criterion) ? 5 : 0,
    }));
    const criteriaPoints = criteriaMatch.reduce((sum, c) => sum + c.points, 0);

    const skillsMatch = [...job.required_skills, ...job.preferred_skills].map(skill => ({
      skill,
      required: job.required_skills.includes(skill),
      has: talent.skills.includes(skill),
      points: talent.skills.includes(skill) ? (job.required_skills.includes(skill) ? 5 : 2) : 0,
    }));
    const skillsPoints = Math.min(skillsMatch.reduce((sum, s) => sum + s.points, 0), 20);

    const educationMet = !job.min_education || talent.education === job.min_education || talent.education === 'PhD';
    const educationPoints = educationMet ? 10 : 0;

    const experienceMet = !job.min_years_experience || (talent.years_experience || 0) >= job.min_years_experience;
    const experiencePoints = experienceMet ? 5 : 0;

    const overallScore = Math.min(scorePoints + criteriaPoints + skillsPoints + educationPoints + experiencePoints, 100);

    return {
      overall_score: overallScore,
      score_requirement: {
        required: job.min_score,
        has: talent.o1_score,
        met: scoreRequirementMet,
        points: scorePoints,
      },
      criteria_match: criteriaMatch,
      skills_match: skillsMatch,
      education_match: {
        required: job.min_education,
        has: talent.education,
        met: educationMet,
        points: educationPoints,
      },
      experience_match: {
        required: job.min_years_experience,
        has: talent.years_experience,
        met: experienceMet,
        points: experiencePoints,
      },
    };
  }

  static async getMatchingJobs(talentId: string, limit: number = 10): Promise<Array<{ job: JobListing; match: JobMatch }>> {
    await simulateDelay('api');

    const talent = DEMO_TALENT_PROFILES.find(t => t.id === talentId);
    if (!talent) {
      return [];
    }

    const results = await Promise.all(
      DEMO_JOB_LISTINGS_WITH_EMPLOYERS
        .filter(j => j.status === 'active')
        .map(async job => ({
          job,
          match: await this.calculateMatch(talentId, job.id),
        }))
    );

    return results
      .sort((a, b) => b.match.overall_score - a.match.overall_score)
      .slice(0, limit);
  }

  static async getMatchingTalents(jobId: string, limit: number = 20): Promise<Array<{ talent: MaskedTalentProfile; match: JobMatch }>> {
    await simulateDelay('api');

    const job = DEMO_JOB_LISTINGS.find(j => j.id === jobId);
    if (!job) {
      return [];
    }

    const results = await Promise.all(
      DEMO_TALENT_PROFILES
        .filter(t => t.is_public)
        .map(async talent => ({
          talent: maskTalentProfile(talent),
          match: await this.calculateMatch(talent.id, jobId),
        }))
    );

    return results
      .sort((a, b) => b.match.overall_score - a.match.overall_score)
      .slice(0, limit);
  }

  // ============================================================================
  // LAWYER APIs
  // ============================================================================

  static async getLawyers(filters?: {
    specialization?: string;
    visaType?: string;
  }) {
    await simulateDelay('api');

    let lawyers = [...DEMO_PUBLIC_LAWYER_PROFILES];

    if (filters?.specialization) {
      lawyers = lawyers.filter(l => l.specializations.includes(filters.specialization!));
    }

    if (filters?.visaType) {
      lawyers = lawyers.filter(l => l.visa_types.includes(filters.visaType!));
    }

    return lawyers;
  }

  // ============================================================================
  // SCORE CALCULATION
  // ============================================================================

  static async calculateScore(talentId: string): Promise<{ score: number; criteria_met: O1Criterion[] }> {
    await simulateDelay('api');

    const documents = getDocumentsByTalent(talentId).filter(d => d.status === 'verified');

    // Calculate score from verified documents
    const scoreBycriterion: Record<string, number> = {};

    for (const doc of documents) {
      if (doc.criterion && doc.score_impact) {
        const current = scoreBycriterion[doc.criterion] || 0;
        scoreBycriterion[doc.criterion] = Math.min(current + doc.score_impact, 25); // Max 25 per criterion
      }
    }

    const totalScore = Math.min(Object.values(scoreBycriterion).reduce((sum, s) => sum + s, 0), 100);
    const criteriaMet = Object.entries(scoreBycriterion)
      .filter(([, score]) => score >= 15) // Criterion met if score >= 15
      .map(([criterion]) => criterion as O1Criterion);

    return { score: totalScore, criteria_met: criteriaMet };
  }

  // ============================================================================
  // WAITLIST APIs
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async joinWaitlist(data: {
    email: string;
    full_name: string;
    user_type: string;
    phone?: string;
    promo_code?: string;
  }): Promise<{ success: boolean; position?: number }> {
    await simulateDelay('api');

    // Simulate successful waitlist signup
    return {
      success: true,
      position: Math.floor(Math.random() * 500) + 100, // Random position 100-600
    };
  }

  static async checkWaitlistStatus(email: string): Promise<{ onWaitlist: boolean; position?: number }> {
    await simulateDelay('api');

    // Simulate checking waitlist
    if (email.includes('demo')) {
      return { onWaitlist: true, position: 42 };
    }
    return { onWaitlist: false };
  }

  // ============================================================================
  // SIGNWELL (E-SIGNATURE) APIs
  // ============================================================================

  static async requestSignature(letterId: string): Promise<{ success: boolean; signatureUrl?: string }> {
    await simulateDelay('api');

    return {
      success: true,
      signatureUrl: `https://demo.signwell.com/sign/${letterId}`,
    };
  }

  static async getSignatureStatus(letterId: string): Promise<{ status: string; signedAt?: string }> {
    await simulateDelay('api');

    const letter = DEMO_INTEREST_LETTERS.find(l => l.id === letterId);
    return {
      status: letter?.signwell_status || 'pending',
      signedAt: letter?.signature_completed_at || undefined,
    };
  }

  // ============================================================================
  // STRIPE (BILLING) APIs
  // ============================================================================

  static async createCheckoutSession(tier: string): Promise<{ url: string }> {
    await simulateDelay('api');

    return {
      url: `/demo/checkout?tier=${tier}&demo=true`,
    };
  }

  static async getBillingPortalUrl(): Promise<{ url: string }> {
    await simulateDelay('api');

    return {
      url: '/demo/billing-portal?demo=true',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getSubscription(userId: string): Promise<{ tier: string; status: string }> {
    await simulateDelay('api');

    return {
      tier: 'growth',
      status: 'active',
    };
  }
}
