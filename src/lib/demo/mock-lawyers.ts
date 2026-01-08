/**
 * Mock Lawyer Data for Demo Mode
 */

import type { LawyerTier } from '@/types/enums';

import type {
  LawyerProfile,
  PublicLawyerProfile,
  LawyerConnectionRequest,
} from '@/types/models';

// ============================================================================
// LAWYER PROFILES
// ============================================================================

export const DEMO_LAWYER_PROFILES: LawyerProfile[] = [
  {
    id: 'lawyer-profile-1',
    user_id: 'demo-lawyer-1',
    attorney_name: 'Michael Thompson',
    attorney_title: 'Partner',
    firm_name: 'Thompson & Associates Immigration Law',
    firm_logo_url: null,
    bio: 'Michael Thompson is a leading immigration attorney with over 20 years of experience specializing in O-1 and EB-1 visas for exceptional talent. He has successfully represented Nobel laureates, Olympic athletes, Grammy winners, and Fortune 500 executives. His innovative approach and deep understanding of USCIS adjudication patterns have resulted in a 98% approval rate for O-1 petitions.',
    specializations: ['tech_ai', 'sciences', 'business'],
    visa_types: ['o1a', 'o1b', 'eb1a', 'eb1b'],
    firm_size: '10-25',
    office_location: 'New York, NY',
    website_url: 'https://thompsonimmigration.com',
    contact_email: 'michael@thompsonimmigration.com',
    contact_phone: '+1-555-0501',
    tier: 'featured',
    is_active: true,
    profile_views: 2450,
    connection_requests: 156,
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'lawyer-profile-2',
    user_id: 'demo-lawyer-2',
    attorney_name: 'Sarah Chen',
    attorney_title: 'Managing Partner',
    firm_name: 'Chen Immigration Group',
    firm_logo_url: null,
    bio: 'Sarah Chen founded Chen Immigration Group to help extraordinary artists and entertainers navigate the complex U.S. immigration system. With a background as a former USCIS officer and degrees from Yale Law School, she brings unique insights to every case. Her clients include Academy Award nominees, Broadway performers, and internationally acclaimed musicians.',
    specializations: ['arts', 'sports'],
    visa_types: ['o1b', 'p1', 'eb1a'],
    firm_size: '5-10',
    office_location: 'Los Angeles, CA',
    website_url: 'https://chenimmigration.com',
    contact_email: 'sarah@chenimmigration.com',
    contact_phone: '+1-555-0502',
    tier: 'featured',
    is_active: true,
    profile_views: 1890,
    connection_requests: 98,
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'lawyer-profile-3',
    user_id: 'demo-lawyer-3',
    attorney_name: 'David Park',
    attorney_title: 'Senior Associate',
    firm_name: 'Global Talent Immigration PLLC',
    firm_logo_url: null,
    bio: 'David Park specializes in immigration solutions for tech entrepreneurs and startup founders. A former software engineer turned attorney, he understands the unique challenges facing tech talent. He has helped hundreds of founders secure O-1 visas to launch their companies in the United States.',
    specializations: ['tech_ai', 'founders'],
    visa_types: ['o1a', 'eb1a', 'eb2'],
    firm_size: '25-50',
    office_location: 'San Francisco, CA',
    website_url: 'https://globaltalentimmigration.com',
    contact_email: 'david@globaltalentimmigration.com',
    contact_phone: '+1-555-0503',
    tier: 'premium',
    is_active: true,
    profile_views: 1234,
    connection_requests: 67,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'lawyer-profile-4',
    user_id: 'demo-lawyer-4',
    attorney_name: 'Amanda Rodriguez',
    attorney_title: 'Partner',
    firm_name: 'Rodriguez & Martinez LLP',
    firm_logo_url: null,
    bio: 'Amanda Rodriguez has built her practice around helping scientists and researchers achieve their American dream. With a PhD in molecular biology before attending Harvard Law, she uniquely understands the academic and research world. Her clients include NIH researchers, university professors, and biotech pioneers.',
    specializations: ['sciences', 'tech_ai'],
    visa_types: ['o1a', 'eb1a', 'eb1b', 'j1'],
    firm_size: '10-25',
    office_location: 'Boston, MA',
    website_url: 'https://rodriguezlaw.com',
    contact_email: 'amanda@rodriguezlaw.com',
    contact_phone: '+1-555-0504',
    tier: 'premium',
    is_active: true,
    profile_views: 987,
    connection_requests: 45,
    created_at: '2024-04-10T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'lawyer-profile-5',
    user_id: 'demo-lawyer-5',
    attorney_name: 'James Wilson',
    attorney_title: 'Of Counsel',
    firm_name: 'Elite Sports & Entertainment Law',
    firm_logo_url: null,
    bio: 'James Wilson represents elite athletes and sports professionals in their immigration matters. A former professional athlete himself, he understands the time-sensitive nature of sports careers. He has helped Olympic medalists, professional league players, and elite coaches secure visas to compete and work in the United States.',
    specializations: ['sports'],
    visa_types: ['o1a', 'o1b', 'p1'],
    firm_size: '5-10',
    office_location: 'Miami, FL',
    website_url: 'https://elitesportslaw.com',
    contact_email: 'james@elitesportslaw.com',
    contact_phone: '+1-555-0505',
    tier: 'basic',
    is_active: true,
    profile_views: 567,
    connection_requests: 23,
    created_at: '2024-05-05T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'lawyer-profile-6',
    user_id: 'demo-lawyer-6',
    attorney_name: 'Emily Zhang',
    attorney_title: 'Associate',
    firm_name: 'Zhang & Associates',
    firm_logo_url: null,
    bio: 'Emily Zhang focuses on helping business executives and entrepreneurs with extraordinary ability in business. She has successfully represented CEOs, venture capitalists, and serial entrepreneurs. Her pragmatic approach and attention to detail have earned her recognition as a Rising Star in immigration law.',
    specializations: ['business', 'founders'],
    visa_types: ['o1a', 'eb1a', 'eb1c', 'l1a'],
    firm_size: '1-5',
    office_location: 'Austin, TX',
    website_url: 'https://zhangimmigration.com',
    contact_email: 'emily@zhangimmigration.com',
    contact_phone: '+1-555-0506',
    tier: 'basic',
    is_active: true,
    profile_views: 345,
    connection_requests: 12,
    created_at: '2024-06-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
];

// Convert to public profiles (hide contact info)
export const DEMO_PUBLIC_LAWYER_PROFILES: PublicLawyerProfile[] = DEMO_LAWYER_PROFILES.map(lawyer => ({
  id: lawyer.id,
  attorney_name: lawyer.attorney_name,
  attorney_title: lawyer.attorney_title,
  firm_name: lawyer.firm_name,
  firm_logo_url: lawyer.firm_logo_url,
  bio: lawyer.bio,
  specializations: lawyer.specializations,
  visa_types: lawyer.visa_types,
  firm_size: lawyer.firm_size,
  office_location: lawyer.office_location,
  website_url: lawyer.website_url,
  tier: lawyer.tier,
}));

// ============================================================================
// CONNECTION REQUESTS
// ============================================================================

export const DEMO_CONNECTION_REQUESTS: LawyerConnectionRequest[] = [
  {
    id: 'connection-1',
    lawyer_id: 'lawyer-profile-1',
    requester_id: 'demo-talent-1',
    requester_type: 'talent',
    requester_name: 'Sarah Chen',
    requester_email: 'sarah.chen@demo.com',
    requester_phone: '+1-555-0101',
    message: 'Hi Michael, I\'m an AI researcher at DeepMind with 52 publications and an O-1 score of 92. I\'m looking to file my O-1A petition soon and would love to discuss working with your firm. I\'ve heard great things about your expertise in tech/AI cases.',
    share_profile: true,
    talent_profile_id: 'talent-profile-1',
    status: 'accepted',
    lawyer_notes: 'Strong candidate - scheduled initial consultation',
    responded_at: '2024-11-20T10:00:00Z',
    created_at: '2024-11-18T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z',
  },
  {
    id: 'connection-2',
    lawyer_id: 'lawyer-profile-2',
    requester_id: 'demo-talent-6',
    requester_type: 'talent',
    requester_name: 'Elena Popov',
    requester_email: 'elena.popov@demo.com',
    requester_phone: '+1-555-0106',
    message: 'I\'m a Grammy-nominated composer looking to transition to full-time work in the US film industry. I\'ve scored several major films and have an Emmy Award. Would love to discuss my O-1B options.',
    share_profile: true,
    talent_profile_id: 'talent-profile-6',
    status: 'pending',
    lawyer_notes: null,
    responded_at: null,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'connection-3',
    lawyer_id: 'lawyer-profile-3',
    requester_id: 'demo-employer-1',
    requester_type: 'employer',
    requester_name: 'John Martinez',
    requester_email: 'john.martinez@techcorp.ai',
    requester_phone: '+1-555-0201',
    message: 'We\'re TechCorp AI and looking for immigration counsel to help us sponsor multiple O-1 candidates. We\'re actively hiring ML researchers and need a firm that can handle high volume with quick turnaround.',
    share_profile: false,
    talent_profile_id: null,
    status: 'accepted',
    lawyer_notes: 'Enterprise client - set up master services agreement',
    responded_at: '2024-11-25T10:00:00Z',
    created_at: '2024-11-22T10:00:00Z',
    updated_at: '2024-11-25T10:00:00Z',
  },
];

// Helper to get lawyers by specialization
export function getLawyersBySpecialization(specialization: string): PublicLawyerProfile[] {
  return DEMO_PUBLIC_LAWYER_PROFILES.filter(lawyer =>
    lawyer.specializations.includes(specialization)
  );
}

// Helper to get lawyers by visa type
export function getLawyersByVisaType(visaType: string): PublicLawyerProfile[] {
  return DEMO_PUBLIC_LAWYER_PROFILES.filter(lawyer =>
    lawyer.visa_types.includes(visaType)
  );
}

// Helper to get lawyers by tier
export function getLawyersByTier(tier: LawyerTier): PublicLawyerProfile[] {
  return DEMO_PUBLIC_LAWYER_PROFILES.filter(lawyer => lawyer.tier === tier);
}
