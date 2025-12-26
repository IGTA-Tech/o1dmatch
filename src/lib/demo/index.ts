/**
 * Demo Mode - Main Export File
 *
 * This module provides all demo functionality for the Netlify demo site.
 * Import from this file to access mock data and demo utilities.
 */

// Configuration
export * from './config';

// Mock Data - Profiles
export {
  DEMO_PROFILES,
  DEMO_TALENT_PROFILES,
  DEMO_MASKED_TALENTS,
  maskTalentProfile,
} from './mock-data';

// Mock Data - Employers & Jobs
export {
  DEMO_EMPLOYER_PROFILES,
  DEMO_AGENCY_PROFILES,
  DEMO_AGENCY_CLIENTS,
  DEMO_JOB_LISTINGS,
  DEMO_JOB_LISTINGS_WITH_EMPLOYERS,
} from './mock-employers';

// Mock Data - Lawyers
export {
  DEMO_LAWYER_PROFILES,
  DEMO_PUBLIC_LAWYER_PROFILES,
  DEMO_CONNECTION_REQUESTS,
  getLawyersBySpecialization,
  getLawyersByVisaType,
  getLawyersByTier,
} from './mock-lawyers';

// Mock Data - Letters & Applications
export {
  DEMO_INTEREST_LETTERS,
  DEMO_JOB_APPLICATIONS,
  getLettersByTalent,
  getLettersByEmployer,
  getApplicationsByTalent,
  getApplicationsByJob,
} from './mock-letters';

// Mock Data - Documents
export {
  DEMO_TALENT_DOCUMENTS,
  getDocumentsByTalent,
  getDocumentsByCriterion,
  getDocumentsByStatus,
  getVerifiedDocuments,
  getPendingReviewDocuments,
} from './mock-documents';

// Demo API Service
export { DemoAPI } from './demo-api';

// Demo Auth
export { DemoAuth, DEMO_USERS } from './demo-auth';
