/**
 * Mock Waitlist Data for Demo Mode
 */

export interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string;
  user_type: 'talent' | 'employer' | 'agency' | 'lawyer';
  phone: string | null;
  promo_code: string | null;
  referral_source: string | null;
  priority_score: number;
  status: 'pending' | 'invited' | 'converted';
  created_at: string;
}

export const DEMO_WAITLIST_ENTRIES: WaitlistEntry[] = [
  {
    id: 'waitlist-1',
    email: 'emma.watson@example.com',
    full_name: 'Emma Watson',
    user_type: 'talent',
    phone: '+1-555-1001',
    promo_code: 'EARLY2024',
    referral_source: 'linkedin',
    priority_score: 95,
    status: 'invited',
    created_at: '2024-10-01T10:00:00Z',
  },
  {
    id: 'waitlist-2',
    email: 'tech.startup@example.com',
    full_name: 'TechStart Inc.',
    user_type: 'employer',
    phone: '+1-555-1002',
    promo_code: null,
    referral_source: 'google',
    priority_score: 88,
    status: 'pending',
    created_at: '2024-10-05T10:00:00Z',
  },
  {
    id: 'waitlist-3',
    email: 'global.recruiting@example.com',
    full_name: 'Global Recruiting Partners',
    user_type: 'agency',
    phone: '+1-555-1003',
    promo_code: 'AGENCY50',
    referral_source: 'referral',
    priority_score: 92,
    status: 'pending',
    created_at: '2024-10-08T10:00:00Z',
  },
  {
    id: 'waitlist-4',
    email: 'jennifer.law@lawfirm.example',
    full_name: 'Jennifer Law',
    user_type: 'lawyer',
    phone: '+1-555-1004',
    promo_code: null,
    referral_source: 'conference',
    priority_score: 85,
    status: 'invited',
    created_at: '2024-10-10T10:00:00Z',
  },
  {
    id: 'waitlist-5',
    email: 'ai.researcher@university.edu',
    full_name: 'Dr. Alex Morgan',
    user_type: 'talent',
    phone: null,
    promo_code: 'PHD2024',
    referral_source: 'twitter',
    priority_score: 90,
    status: 'pending',
    created_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 'waitlist-6',
    email: 'biotech.company@example.com',
    full_name: 'BioTech Innovations',
    user_type: 'employer',
    phone: '+1-555-1006',
    promo_code: 'BIOTECH',
    referral_source: 'blog',
    priority_score: 87,
    status: 'pending',
    created_at: '2024-10-18T10:00:00Z',
  },
  {
    id: 'waitlist-7',
    email: 'film.composer@hollywood.example',
    full_name: 'Marcus Chen',
    user_type: 'talent',
    phone: '+1-555-1007',
    promo_code: null,
    referral_source: 'referral',
    priority_score: 82,
    status: 'pending',
    created_at: '2024-10-20T10:00:00Z',
  },
  {
    id: 'waitlist-8',
    email: 'fintech.unicorn@example.com',
    full_name: 'FinTech Unicorn LLC',
    user_type: 'employer',
    phone: '+1-555-1008',
    promo_code: 'UNICORN',
    referral_source: 'vc_intro',
    priority_score: 98,
    status: 'invited',
    created_at: '2024-10-22T10:00:00Z',
  },
  {
    id: 'waitlist-9',
    email: 'quantum.physicist@lab.example',
    full_name: 'Dr. Nina Patel',
    user_type: 'talent',
    phone: '+1-555-1009',
    promo_code: 'QUANTUM',
    referral_source: 'academic',
    priority_score: 91,
    status: 'pending',
    created_at: '2024-10-25T10:00:00Z',
  },
  {
    id: 'waitlist-10',
    email: 'sports.agent@agency.example',
    full_name: 'Elite Sports Management',
    user_type: 'agency',
    phone: '+1-555-1010',
    promo_code: null,
    referral_source: 'sports_conference',
    priority_score: 80,
    status: 'pending',
    created_at: '2024-10-28T10:00:00Z',
  },
];

// Statistics for demo dashboard
export const DEMO_WAITLIST_STATS = {
  total: DEMO_WAITLIST_ENTRIES.length,
  byType: {
    talent: DEMO_WAITLIST_ENTRIES.filter(e => e.user_type === 'talent').length,
    employer: DEMO_WAITLIST_ENTRIES.filter(e => e.user_type === 'employer').length,
    agency: DEMO_WAITLIST_ENTRIES.filter(e => e.user_type === 'agency').length,
    lawyer: DEMO_WAITLIST_ENTRIES.filter(e => e.user_type === 'lawyer').length,
  },
  byStatus: {
    pending: DEMO_WAITLIST_ENTRIES.filter(e => e.status === 'pending').length,
    invited: DEMO_WAITLIST_ENTRIES.filter(e => e.status === 'invited').length,
    converted: DEMO_WAITLIST_ENTRIES.filter(e => e.status === 'converted').length,
  },
  averagePriorityScore: Math.round(
    DEMO_WAITLIST_ENTRIES.reduce((sum, e) => sum + e.priority_score, 0) / DEMO_WAITLIST_ENTRIES.length
  ),
  withPromoCode: DEMO_WAITLIST_ENTRIES.filter(e => e.promo_code).length,
};
