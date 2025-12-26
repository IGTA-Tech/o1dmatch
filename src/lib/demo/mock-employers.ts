/**
 * Mock Employer Data for Demo Mode
 */

import {
  WorkArrangement,
  EngagementType,
  JobStatus,
  O1Criterion,
} from '@/types/enums';

import type {
  EmployerProfile,
  AgencyProfile,
  AgencyClient,
  JobListing,
} from '@/types/models';

// ============================================================================
// EMPLOYER PROFILES
// ============================================================================

export const DEMO_EMPLOYER_PROFILES: EmployerProfile[] = [
  {
    id: 'employer-profile-1',
    user_id: 'demo-employer-1',
    company_name: 'TechCorp AI',
    legal_name: 'TechCorp AI Inc.',
    dba_name: null,
    company_logo_url: null,
    company_website: 'https://techcorp.ai',
    industry: 'Artificial Intelligence',
    company_size: '500-1000',
    year_founded: 2018,
    company_description: 'Leading AI research company building next-generation language models and AI systems. We\'re on a mission to develop safe and beneficial artificial general intelligence.',
    street_address: '100 AI Boulevard',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94105',
    country: 'USA',
    signatory_name: 'John Martinez',
    signatory_title: 'VP of Engineering',
    signatory_email: 'john.martinez@techcorp.ai',
    signatory_phone: '+1-555-0201',
    is_authorized_signatory: true,
    understands_o1_usage: true,
    agrees_to_terms: true,
    profile_complete: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'employer-profile-2',
    user_id: 'demo-employer-2',
    company_name: 'Innovate Health',
    legal_name: 'Innovate Health Technologies Inc.',
    dba_name: null,
    company_logo_url: null,
    company_website: 'https://innovatehealth.com',
    industry: 'Healthcare Technology',
    company_size: '1000-5000',
    year_founded: 2015,
    company_description: 'Transforming healthcare through AI-powered diagnostics and personalized medicine. Our platform helps doctors make better decisions and patients get better outcomes.',
    street_address: '200 Medical Center Drive',
    city: 'Boston',
    state: 'MA',
    zip_code: '02115',
    country: 'USA',
    signatory_name: 'Lisa Johnson',
    signatory_title: 'Chief People Officer',
    signatory_email: 'lisa.johnson@innovatehealth.com',
    signatory_phone: '+1-555-0202',
    is_authorized_signatory: true,
    understands_o1_usage: true,
    agrees_to_terms: true,
    profile_complete: true,
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'employer-profile-3',
    user_id: 'demo-employer-3',
    company_name: 'Quantum Dynamics',
    legal_name: 'Quantum Dynamics Corporation',
    dba_name: 'QD Labs',
    company_logo_url: null,
    company_website: 'https://quantumdynamics.tech',
    industry: 'Quantum Computing',
    company_size: '100-500',
    year_founded: 2020,
    company_description: 'Building practical quantum computers for enterprise applications. We\'re solving the hardest problems in quantum error correction and scalable qubit systems.',
    street_address: '50 Quantum Way',
    city: 'Seattle',
    state: 'WA',
    zip_code: '98101',
    country: 'USA',
    signatory_name: 'Robert Chang',
    signatory_title: 'CEO',
    signatory_email: 'robert.chang@quantumdynamics.tech',
    signatory_phone: '+1-555-0203',
    is_authorized_signatory: true,
    understands_o1_usage: true,
    agrees_to_terms: true,
    profile_complete: true,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'employer-profile-4',
    user_id: 'demo-employer-4',
    company_name: 'Creative Studios',
    legal_name: 'Creative Studios Entertainment LLC',
    dba_name: null,
    company_logo_url: null,
    company_website: 'https://creativestudios.com',
    industry: 'Entertainment & Media',
    company_size: '200-500',
    year_founded: 2012,
    company_description: 'Award-winning production company creating content for streaming platforms, film, and television. We tell stories that matter and entertain millions worldwide.',
    street_address: '1000 Sunset Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90028',
    country: 'USA',
    signatory_name: 'Amanda Chen',
    signatory_title: 'Head of Talent',
    signatory_email: 'amanda.chen@creativestudios.com',
    signatory_phone: '+1-555-0204',
    is_authorized_signatory: true,
    understands_o1_usage: true,
    agrees_to_terms: true,
    profile_complete: true,
    created_at: '2024-04-10T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'employer-profile-5',
    user_id: 'demo-employer-5',
    company_name: 'FinTech Global',
    legal_name: 'FinTech Global Inc.',
    dba_name: null,
    company_logo_url: null,
    company_website: 'https://fintechglobal.io',
    industry: 'Financial Technology',
    company_size: '500-1000',
    year_founded: 2017,
    company_description: 'Building the future of decentralized finance. Our platform enables secure, fast, and low-cost cross-border transactions using blockchain technology.',
    street_address: '500 Financial District',
    city: 'New York',
    state: 'NY',
    zip_code: '10005',
    country: 'USA',
    signatory_name: 'Michael Brown',
    signatory_title: 'CTO',
    signatory_email: 'michael.brown@fintechglobal.io',
    signatory_phone: '+1-555-0205',
    is_authorized_signatory: true,
    understands_o1_usage: true,
    agrees_to_terms: true,
    profile_complete: true,
    created_at: '2024-05-05T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
];

// ============================================================================
// AGENCY PROFILES
// ============================================================================

export const DEMO_AGENCY_PROFILES: AgencyProfile[] = [
  {
    id: 'agency-profile-1',
    user_id: 'demo-agency-1',
    agency_name: 'Elite Talent Agency',
    legal_name: 'Elite Talent Solutions Inc.',
    agency_logo_url: null,
    agency_website: 'https://elitetalentagency.com',
    agency_description: 'Premier talent agency specializing in placing exceptional international talent with Fortune 500 companies. We handle all aspects of O-1 sponsorship and placement.',
    contact_name: 'Jennifer Park',
    contact_email: 'jennifer.park@elitetalentagency.com',
    contact_phone: '+1-555-0301',
    street_address: '750 Executive Plaza',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    country: 'USA',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'agency-profile-2',
    user_id: 'demo-agency-2',
    agency_name: 'Global Tech Recruiters',
    legal_name: 'GTR Holdings LLC',
    agency_logo_url: null,
    agency_website: 'https://globaltechrecruiters.com',
    agency_description: 'Specialized in placing top-tier technology talent from around the world. Our network spans 50+ countries and 1000+ tech companies.',
    contact_name: 'David Kim',
    contact_email: 'david.kim@globaltechrecruiters.com',
    contact_phone: '+1-555-0302',
    street_address: '300 Tech Center',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    country: 'USA',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
];

// ============================================================================
// AGENCY CLIENTS
// ============================================================================

export const DEMO_AGENCY_CLIENTS: AgencyClient[] = [
  {
    id: 'agency-client-1',
    agency_id: 'agency-profile-1',
    show_client_identity: true,
    company_name: 'MegaCorp Industries',
    legal_name: 'MegaCorp Industries International Inc.',
    company_logo_url: null,
    company_website: 'https://megacorp.com',
    industry: 'Manufacturing & Technology',
    company_size: '10000+',
    company_description: 'Global leader in advanced manufacturing and industrial automation.',
    street_address: '1 MegaCorp Plaza',
    city: 'Detroit',
    state: 'MI',
    zip_code: '48201',
    country: 'USA',
    signatory_name: 'Thomas Anderson',
    signatory_title: 'SVP Human Resources',
    signatory_email: 'thomas.anderson@megacorp.com',
    signatory_phone: '+1-555-0401',
    is_active: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'agency-client-2',
    agency_id: 'agency-profile-1',
    show_client_identity: false,
    company_name: 'Stealth Startup',
    legal_name: 'Stealth Mode Inc.',
    company_logo_url: null,
    company_website: null,
    industry: 'Technology',
    company_size: '50-100',
    company_description: 'Stealth-mode AI startup backed by top VCs.',
    street_address: '100 Innovation Drive',
    city: 'Palo Alto',
    state: 'CA',
    zip_code: '94301',
    country: 'USA',
    signatory_name: 'Sarah Williams',
    signatory_title: 'CEO',
    signatory_email: 'sarah.williams@stealthstartup.com',
    signatory_phone: '+1-555-0402',
    is_active: true,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
];

// ============================================================================
// JOB LISTINGS
// ============================================================================

export const DEMO_JOB_LISTINGS: JobListing[] = [
  {
    id: 'job-1',
    employer_id: 'employer-profile-1',
    agency_id: null,
    agency_client_id: null,
    title: 'Senior ML Research Scientist',
    department: 'Research',
    description: `We're looking for a world-class ML researcher to join our team working on next-generation language models. You'll be leading research initiatives and publishing at top venues.

## Responsibilities
- Lead research projects on large language models
- Publish papers at top ML conferences (NeurIPS, ICML, ICLR)
- Mentor junior researchers and PhD interns
- Collaborate with product teams to deploy research

## Requirements
- PhD in ML, CS, or related field
- Strong publication record at top venues
- Experience with large-scale distributed training
- Expertise in transformers and attention mechanisms`,
    why_o1_required: 'This role requires extraordinary ability in AI research, evidenced by significant publications, awards, or other recognition that demonstrates the candidate is among the top researchers in their field.',
    work_arrangement: WorkArrangement.HYBRID,
    locations: ['San Francisco, CA', 'New York, NY'],
    salary_min: 350000,
    salary_max: 500000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Flexible',
    start_date: null,
    min_score: 75,
    preferred_criteria: [O1Criterion.SCHOLARLY_ARTICLES, O1Criterion.AWARDS, O1Criterion.ORIGINAL_CONTRIBUTIONS],
    required_skills: ['Machine Learning', 'Deep Learning', 'Python', 'PyTorch'],
    preferred_skills: ['TensorFlow', 'JAX', 'Distributed Systems', 'NLP'],
    min_education: 'PhD',
    education_preferred_not_required: false,
    min_years_experience: 5,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: true,
    posted_at: '2024-11-15T10:00:00Z',
    closes_at: '2025-02-15T10:00:00Z',
    views_count: 1250,
    applications_count: 45,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'job-2',
    employer_id: 'employer-profile-2',
    agency_id: null,
    agency_client_id: null,
    title: 'Chief Medical AI Officer',
    department: 'Executive',
    description: `Lead our medical AI initiatives as we transform healthcare diagnostics. You'll work with world-class clinicians and AI researchers to develop FDA-approved AI systems.

## Responsibilities
- Define and execute medical AI strategy
- Lead cross-functional teams of 50+ engineers and clinicians
- Navigate FDA regulatory pathway for AI/ML medical devices
- Represent company at major medical and AI conferences

## Requirements
- MD or PhD in relevant medical/technical field
- 10+ years experience in healthcare AI or medical devices
- Track record of FDA approvals or major clinical deployments
- Published research in medical AI or clinical informatics`,
    why_o1_required: 'This executive role requires demonstrated extraordinary achievement in medical AI, including significant innovations, leadership of major projects, or pioneering contributions that have advanced the field.',
    work_arrangement: WorkArrangement.ON_SITE,
    locations: ['Boston, MA'],
    salary_min: 500000,
    salary_max: 750000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Q1 2025',
    start_date: '2025-01-15',
    min_score: 80,
    preferred_criteria: [O1Criterion.ORIGINAL_CONTRIBUTIONS, O1Criterion.CRITICAL_ROLE, O1Criterion.SCHOLARLY_ARTICLES],
    required_skills: ['Medical AI', 'FDA Regulations', 'Leadership', 'Clinical Research'],
    preferred_skills: ['Deep Learning', 'Medical Imaging', 'Clinical Trials'],
    min_education: 'PhD',
    education_preferred_not_required: false,
    min_years_experience: 10,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: true,
    posted_at: '2024-11-20T10:00:00Z',
    closes_at: '2025-01-31T10:00:00Z',
    views_count: 890,
    applications_count: 23,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'job-3',
    employer_id: 'employer-profile-3',
    agency_id: null,
    agency_client_id: null,
    title: 'Principal Quantum Engineer',
    department: 'Engineering',
    description: `Join our team building the next generation of quantum computers. You'll work on cutting-edge problems in quantum error correction and control systems.

## Responsibilities
- Design and implement quantum control systems
- Develop novel error correction protocols
- Collaborate with physics team on qubit characterization
- Mentor engineering team and set technical direction

## Requirements
- PhD in Physics, EE, or related field
- 5+ years experience with superconducting qubits
- Published work in quantum computing
- Strong programming skills (Python, C++)`,
    why_o1_required: 'Quantum computing expertise at this level is extremely rare. We need someone with proven extraordinary contributions to quantum hardware or software, as evidenced by publications, patents, or major technical achievements.',
    work_arrangement: WorkArrangement.ON_SITE,
    locations: ['Seattle, WA'],
    salary_min: 280000,
    salary_max: 400000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Immediate',
    start_date: null,
    min_score: 70,
    preferred_criteria: [O1Criterion.SCHOLARLY_ARTICLES, O1Criterion.ORIGINAL_CONTRIBUTIONS, O1Criterion.MEMBERSHIPS],
    required_skills: ['Quantum Computing', 'Python', 'Physics'],
    preferred_skills: ['Superconducting Qubits', 'Error Correction', 'Control Systems', 'C++'],
    min_education: 'PhD',
    education_preferred_not_required: false,
    min_years_experience: 5,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: false,
    posted_at: '2024-11-25T10:00:00Z',
    closes_at: '2025-03-01T10:00:00Z',
    views_count: 456,
    applications_count: 12,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-11-25T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'job-4',
    employer_id: 'employer-profile-4',
    agency_id: null,
    agency_client_id: null,
    title: 'Lead Film Composer',
    department: 'Music',
    description: `We're seeking a world-class film composer for our upcoming slate of feature films and streaming series. This is a rare opportunity to score multiple high-profile projects.

## Responsibilities
- Compose original scores for 3-4 projects annually
- Collaborate with directors and showrunners on musical vision
- Lead recording sessions with major orchestras
- Deliver on tight production schedules

## Requirements
- Grammy, Emmy, or Oscar nomination/win preferred
- Portfolio of scored feature films or major TV series
- Ability to work in multiple genres
- Strong relationships with orchestras and musicians`,
    why_o1_required: 'Film scoring at this level requires extraordinary artistic achievement, typically evidenced by major awards, acclaim from industry peers, and a body of work that demonstrates exceptional creative ability.',
    work_arrangement: WorkArrangement.FLEXIBLE,
    locations: ['Los Angeles, CA'],
    salary_min: 300000,
    salary_max: 600000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.CONTRACT_W2,
    start_timing: 'Project-based',
    start_date: null,
    min_score: 75,
    preferred_criteria: [O1Criterion.AWARDS, O1Criterion.PUBLISHED_MATERIAL, O1Criterion.CRITICAL_ROLE],
    required_skills: ['Film Scoring', 'Orchestration', 'Music Production'],
    preferred_skills: ['Logic Pro', 'Pro Tools', 'Conducting'],
    min_education: null,
    education_preferred_not_required: true,
    min_years_experience: 8,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: true,
    posted_at: '2024-11-28T10:00:00Z',
    closes_at: '2025-02-28T10:00:00Z',
    views_count: 678,
    applications_count: 18,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-11-28T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'job-5',
    employer_id: 'employer-profile-5',
    agency_id: null,
    agency_client_id: null,
    title: 'Head of Protocol Engineering',
    department: 'Engineering',
    description: `Lead our blockchain protocol development team. You'll design and implement cutting-edge DeFi protocols that handle billions in transaction volume.

## Responsibilities
- Architect core protocol infrastructure
- Lead team of 15 protocol engineers
- Conduct security audits and risk assessments
- Represent protocol at major conferences

## Requirements
- 5+ years blockchain development experience
- Authored successful DeFi protocols or EIPs
- Deep expertise in Solidity and/or Rust
- Understanding of cryptographic primitives`,
    why_o1_required: 'Protocol-level blockchain development requires rare expertise. We need someone with demonstrated original contributions to the field, such as widely-adopted protocols, significant EIPs, or other innovations.',
    work_arrangement: WorkArrangement.REMOTE,
    locations: ['Remote (US timezone preferred)'],
    salary_min: 350000,
    salary_max: 500000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Immediate',
    start_date: null,
    min_score: 65,
    preferred_criteria: [O1Criterion.ORIGINAL_CONTRIBUTIONS, O1Criterion.SCHOLARLY_ARTICLES, O1Criterion.HIGH_SALARY],
    required_skills: ['Solidity', 'Blockchain', 'Smart Contracts', 'DeFi'],
    preferred_skills: ['Rust', 'Go', 'Cryptography', 'Security Auditing'],
    min_education: 'Bachelors',
    education_preferred_not_required: true,
    min_years_experience: 5,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: false,
    posted_at: '2024-12-01T10:00:00Z',
    closes_at: '2025-03-01T10:00:00Z',
    views_count: 345,
    applications_count: 28,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'job-6',
    employer_id: null,
    agency_id: 'agency-profile-1',
    agency_client_id: 'agency-client-1',
    title: 'VP of Robotics Engineering',
    department: 'Engineering',
    description: `MegaCorp Industries seeks a VP of Robotics Engineering to lead our autonomous manufacturing initiative. You'll build and lead a world-class robotics team.

## Responsibilities
- Lead 100+ person robotics engineering organization
- Define 5-year technical roadmap for autonomous manufacturing
- Partner with operations to deploy at scale
- Build partnerships with universities and research labs

## Requirements
- 15+ years robotics experience, 8+ in leadership
- Track record of deploying robots at scale
- Published research or patents in robotics
- Experience with industrial automation`,
    why_o1_required: 'Leadership of large-scale robotics programs requires demonstrated extraordinary ability in the field, including major innovations, successful deployments, or recognized expertise that sets the candidate apart.',
    work_arrangement: WorkArrangement.HYBRID,
    locations: ['Detroit, MI'],
    salary_min: 450000,
    salary_max: 650000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Q1 2025',
    start_date: '2025-02-01',
    min_score: 80,
    preferred_criteria: [O1Criterion.ORIGINAL_CONTRIBUTIONS, O1Criterion.CRITICAL_ROLE, O1Criterion.AWARDS],
    required_skills: ['Robotics', 'Leadership', 'Automation', 'Manufacturing'],
    preferred_skills: ['ROS', 'Computer Vision', 'ML', 'Industrial Robots'],
    min_education: 'PhD',
    education_preferred_not_required: true,
    min_years_experience: 15,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: true,
    posted_at: '2024-11-10T10:00:00Z',
    closes_at: '2025-01-31T10:00:00Z',
    views_count: 567,
    applications_count: 15,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-11-10T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'job-7',
    employer_id: 'employer-profile-1',
    agency_id: null,
    agency_client_id: null,
    title: 'Distinguished Engineer - AI Safety',
    department: 'Safety & Alignment',
    description: `Join our AI Safety team to work on the most important problem in AI: ensuring advanced AI systems are safe and aligned with human values.

## Responsibilities
- Lead research on AI alignment and interpretability
- Develop safety evaluation frameworks
- Publish and present at top AI safety venues
- Advise leadership on safety implications

## Requirements
- World-class expertise in AI safety or alignment
- Strong publication record in AI/ML
- Ability to think creatively about novel risks
- Excellent communication skills`,
    why_o1_required: 'AI Safety research requires extraordinary intellectual ability and a track record of original thinking about novel technical problems. Candidates should demonstrate significant contributions to the field.',
    work_arrangement: WorkArrangement.HYBRID,
    locations: ['San Francisco, CA'],
    salary_min: 400000,
    salary_max: 600000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Flexible',
    start_date: null,
    min_score: 85,
    preferred_criteria: [O1Criterion.SCHOLARLY_ARTICLES, O1Criterion.ORIGINAL_CONTRIBUTIONS, O1Criterion.JUDGING],
    required_skills: ['Machine Learning', 'AI Safety', 'Research', 'Python'],
    preferred_skills: ['Interpretability', 'Formal Verification', 'Philosophy'],
    min_education: 'PhD',
    education_preferred_not_required: false,
    min_years_experience: 7,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: true,
    posted_at: '2024-12-05T10:00:00Z',
    closes_at: '2025-03-31T10:00:00Z',
    views_count: 789,
    applications_count: 32,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'job-8',
    employer_id: 'employer-profile-2',
    agency_id: null,
    agency_client_id: null,
    title: 'Principal Biomedical Scientist',
    department: 'Research',
    description: `Lead breakthrough research in personalized medicine. You'll work at the intersection of genomics, AI, and clinical medicine.

## Responsibilities
- Design and lead clinical research studies
- Develop novel biomarkers and diagnostics
- Collaborate with clinical partners
- Mentor research team

## Requirements
- PhD or MD in relevant field
- 10+ years biomedical research experience
- Strong publication record in high-impact journals
- Experience with clinical translation`,
    why_o1_required: 'This role requires demonstrated extraordinary ability in biomedical research, including breakthrough discoveries, major publications, or other significant contributions to the field.',
    work_arrangement: WorkArrangement.ON_SITE,
    locations: ['Boston, MA', 'Cambridge, MA'],
    salary_min: 300000,
    salary_max: 450000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: EngagementType.FULL_TIME,
    start_timing: 'Q2 2025',
    start_date: '2025-04-01',
    min_score: 75,
    preferred_criteria: [O1Criterion.SCHOLARLY_ARTICLES, O1Criterion.ORIGINAL_CONTRIBUTIONS, O1Criterion.AWARDS],
    required_skills: ['Biomedical Research', 'Genomics', 'Clinical Research'],
    preferred_skills: ['Bioinformatics', 'Machine Learning', 'Drug Discovery'],
    min_education: 'PhD',
    education_preferred_not_required: false,
    min_years_experience: 10,
    status: JobStatus.ACTIVE,
    visibility: 'public',
    is_featured: false,
    posted_at: '2024-12-10T10:00:00Z',
    closes_at: '2025-04-30T10:00:00Z',
    views_count: 234,
    applications_count: 8,
    is_flagged: false,
    flag_reason: null,
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
  },
];

// Add employer references to job listings
export const DEMO_JOB_LISTINGS_WITH_EMPLOYERS: JobListing[] = DEMO_JOB_LISTINGS.map(job => {
  if (job.employer_id) {
    const employer = DEMO_EMPLOYER_PROFILES.find(e => e.id === job.employer_id);
    return { ...job, employer };
  }
  if (job.agency_id) {
    const agency = DEMO_AGENCY_PROFILES.find(a => a.id === job.agency_id);
    const agency_client = job.agency_client_id
      ? DEMO_AGENCY_CLIENTS.find(c => c.id === job.agency_client_id)
      : undefined;
    return { ...job, agency, agency_client };
  }
  return job;
});
