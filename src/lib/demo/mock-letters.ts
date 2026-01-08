/**
 * Mock Interest Letters and Applications for Demo Mode
 */


import type { InterestLetter, JobApplication } from '@/types/models';

// ============================================================================
// INTEREST LETTERS
// ============================================================================

export const DEMO_INTEREST_LETTERS: InterestLetter[] = [
  {
    id: 'letter-1',
    talent_id: 'talent-profile-1',
    employer_id: 'employer-profile-1',
    agency_id: null,
    agency_client_id: null,
    source_type: 'browse',
    job_id: 'job-1',
    application_id: null,
    commitment_level: 'firm_commitment',
    job_title: 'Senior ML Research Scientist',
    department: 'Research',
    salary_min: 400000,
    salary_max: 500000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: 'full_time',
    start_timing: 'Upon visa approval',
    duration_years: null,
    work_arrangement: 'hybrid',
    locations: ['San Francisco, CA'],
    duties_description: `As a Senior ML Research Scientist, you will:
- Lead research projects on advanced language models and AI systems
- Publish groundbreaking research at top ML conferences
- Mentor a team of researchers and collaborate with product teams
- Drive technical direction for critical AI initiatives`,
    why_o1_required: `We are seeking Dr. Chen specifically because of her extraordinary achievements in AI research. Her 52 publications, h-index of 34, and recognition including the ACM Best Paper Award and NeurIPS Outstanding Paper Award demonstrate that she is among the very top researchers in machine learning globally. Her expertise in attention mechanisms and large language models is directly relevant to our core technology, and her contributions would be transformative for our research program. No domestic worker with comparable qualifications is available for this specialized role.`,
    letter_content: null,
    pdf_url: '/demo/letters/letter-1.pdf',
    status: 'accepted',
    talent_response_message: 'Thank you for this incredible opportunity! I\'m excited to join TechCorp AI and contribute to your research mission. Looking forward to discussing next steps.',
    responded_at: '2024-11-25T10:00:00Z',
    expires_at: '2025-01-15T10:00:00Z',
    revealed_at: '2024-11-25T10:00:00Z',
    signwell_document_id: 'sw-doc-001',
    signwell_status: 'signed',
    signed_pdf_url: '/demo/letters/letter-1-signed.pdf',
    signature_requested_at: '2024-11-22T10:00:00Z',
    signature_completed_at: '2024-11-23T10:00:00Z',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-25T10:00:00Z',
  },
  {
    id: 'letter-2',
    talent_id: 'talent-profile-3',
    employer_id: 'employer-profile-2',
    agency_id: null,
    agency_client_id: null,
    source_type: 'browse',
    job_id: 'job-2',
    application_id: null,
    commitment_level: 'intent_to_engage',
    job_title: 'Chief Medical AI Officer',
    department: 'Executive',
    salary_min: 550000,
    salary_max: 700000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: 'full_time',
    start_timing: 'Q1 2025',
    duration_years: null,
    work_arrangement: 'on_site',
    locations: ['Boston, MA'],
    duties_description: `As Chief Medical AI Officer, you will:
- Define and execute our medical AI strategy across all product lines
- Lead cross-functional teams of 50+ engineers and clinical researchers
- Navigate FDA regulatory pathways for AI/ML medical devices
- Serve as the company's public face for medical AI initiatives`,
    why_o1_required: `Dr. Santos represents the rare combination of deep scientific expertise and entrepreneurial leadership essential for this role. Her NIH Director's New Innovator Award, 38 publications in top journals including Nature and Science, and success in building GeneTech Labs to a $45M Series B demonstrate extraordinary ability in both research and business leadership. Her expertise in gene therapy and clinical translation directly aligns with our mission, and her track record of FDA interactions will be invaluable.`,
    letter_content: null,
    pdf_url: '/demo/letters/letter-2.pdf',
    status: 'viewed',
    talent_response_message: null,
    responded_at: null,
    expires_at: '2025-01-20T10:00:00Z',
    revealed_at: null,
    signwell_document_id: null,
    signwell_status: null,
    signed_pdf_url: null,
    signature_requested_at: null,
    signature_completed_at: null,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'letter-3',
    talent_id: 'talent-profile-5',
    employer_id: 'employer-profile-5',
    agency_id: null,
    agency_client_id: null,
    source_type: 'browse',
    job_id: 'job-5',
    application_id: null,
    commitment_level: 'conditional_offer',
    job_title: 'Head of Protocol Engineering',
    department: 'Engineering',
    salary_min: 380000,
    salary_max: 480000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: 'full_time',
    start_timing: 'Immediate upon visa approval',
    duration_years: null,
    work_arrangement: 'remote',
    locations: ['Remote'],
    duties_description: `As Head of Protocol Engineering, you will:
- Architect and lead development of core DeFi protocol infrastructure
- Manage a team of 15 senior protocol engineers
- Conduct security audits and manage risk assessment processes
- Represent our protocol at major blockchain conferences and with partners`,
    why_o1_required: `Yuki Tanaka has demonstrated extraordinary ability in blockchain protocol development through authoring EIP-4844 (Proto-Danksharding), one of the most significant Ethereum improvements in recent years. His work has garnered 25,000+ GitHub stars and his DeFi protocol innovations have secured billions in value. This level of expertise is exceptionally rare, and Yuki's specific knowledge of protocol-level Ethereum development is essential for our technical roadmap.`,
    letter_content: null,
    pdf_url: '/demo/letters/letter-3.pdf',
    status: 'sent',
    talent_response_message: null,
    responded_at: null,
    expires_at: '2025-01-30T10:00:00Z',
    revealed_at: null,
    signwell_document_id: 'sw-doc-003',
    signwell_status: 'sent',
    signed_pdf_url: null,
    signature_requested_at: '2024-12-10T10:00:00Z',
    signature_completed_at: null,
    created_at: '2024-12-08T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
  },
  {
    id: 'letter-4',
    talent_id: 'talent-profile-6',
    employer_id: 'employer-profile-4',
    agency_id: null,
    agency_client_id: null,
    source_type: 'browse',
    job_id: 'job-4',
    application_id: null,
    commitment_level: 'offer_extended',
    job_title: 'Lead Film Composer',
    department: 'Music',
    salary_min: 400000,
    salary_max: 550000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: 'contract_w2',
    start_timing: 'March 2025 (project start)',
    duration_years: 3,
    work_arrangement: 'flexible',
    locations: ['Los Angeles, CA'],
    duties_description: `As Lead Film Composer, you will:
- Compose original scores for our slate of 3-4 feature films annually
- Collaborate directly with directors on musical vision and execution
- Lead recording sessions with major orchestras in LA and abroad
- Mentor junior composers and build our in-house music team`,
    why_o1_required: `Elena Popov's Grammy nomination, Emmy Award, and BMI Film Music Award demonstrate that she has reached the pinnacle of the film scoring profession. Her work on major studio films has been critically acclaimed and commercially successful. The specific artistic vision she brings cannot be replicated by domestic talent, and her availability to work on our upcoming slate of prestige films is a unique opportunity. Her extraordinary ability in music composition is essential to the creative success of our productions.`,
    letter_content: null,
    pdf_url: '/demo/letters/letter-4.pdf',
    status: 'accepted',
    talent_response_message: 'I am thrilled to accept this offer! Working with Creative Studios has been a dream, and I\'m excited to bring my vision to your upcoming projects.',
    responded_at: '2024-12-18T10:00:00Z',
    expires_at: '2025-02-01T10:00:00Z',
    revealed_at: '2024-12-18T10:00:00Z',
    signwell_document_id: 'sw-doc-004',
    signwell_status: 'signed',
    signed_pdf_url: '/demo/letters/letter-4-signed.pdf',
    signature_requested_at: '2024-12-12T10:00:00Z',
    signature_completed_at: '2024-12-15T10:00:00Z',
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2024-12-18T10:00:00Z',
  },
  {
    id: 'letter-5',
    talent_id: 'talent-profile-2',
    employer_id: 'employer-profile-1',
    agency_id: null,
    agency_client_id: null,
    source_type: 'application',
    job_id: null,
    application_id: 'application-2',
    commitment_level: 'exploratory_interest',
    job_title: 'Head of Design',
    department: 'Product',
    salary_min: 320000,
    salary_max: 400000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: 'full_time',
    start_timing: 'Flexible',
    duration_years: null,
    work_arrangement: 'hybrid',
    locations: ['San Francisco, CA', 'New York, NY'],
    duties_description: `As Head of Design, you will:
- Lead our product design organization of 20+ designers
- Define the visual language and design system for our AI products
- Partner with product and engineering leadership on strategy
- Ensure our products are accessible, delightful, and effective`,
    why_o1_required: `Alex Kumar's Red Dot Design Award, Apple Design Award, and Webby Award wins demonstrate extraordinary achievement in product design. His work at Figma building the design team from 3 to 25 and leading a redesign that generated $50M in additional revenue shows both creative excellence and business impact. His unique design vision for AI products would be transformational for our company.`,
    letter_content: null,
    pdf_url: '/demo/letters/letter-5.pdf',
    status: 'draft',
    talent_response_message: null,
    responded_at: null,
    expires_at: null,
    revealed_at: null,
    signwell_document_id: null,
    signwell_status: null,
    signed_pdf_url: null,
    signature_requested_at: null,
    signature_completed_at: null,
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2024-12-20T10:00:00Z',
  },
  {
    id: 'letter-6',
    talent_id: 'talent-profile-7',
    employer_id: 'employer-profile-3',
    agency_id: null,
    agency_client_id: null,
    source_type: 'browse',
    job_id: 'job-3',
    application_id: null,
    commitment_level: 'firm_commitment',
    job_title: 'Principal Quantum Engineer',
    department: 'Engineering',
    salary_min: 320000,
    salary_max: 400000,
    salary_period: 'annual',
    salary_negotiable: true,
    engagement_type: 'full_time',
    start_timing: 'Q1 2025',
    duration_years: null,
    work_arrangement: 'on_site',
    locations: ['Seattle, WA'],
    duties_description: `As Principal Quantum Engineer, you will:
- Design and implement next-generation quantum control systems
- Develop novel error correction protocols for our superconducting qubits
- Collaborate with physics team on qubit characterization and optimization
- Set technical direction and mentor the engineering team`,
    why_o1_required: `Dr. Okonkwo's 25 publications in quantum computing, including a Nature Physics paper, and his novel contributions to quantum error correction demonstrate extraordinary ability in this highly specialized field. His work at IBM Quantum on superconducting qubit systems gives him rare expertise directly applicable to our technology. Quantum computing talent at this level is exceptionally scarce, and David's specific knowledge would accelerate our roadmap significantly.`,
    letter_content: null,
    pdf_url: '/demo/letters/letter-6.pdf',
    status: 'declined',
    talent_response_message: 'Thank you for this generous offer. After careful consideration, I\'ve decided to continue in my current role at IBM Quantum. I wish you the best with Quantum Dynamics.',
    responded_at: '2024-12-15T10:00:00Z',
    expires_at: '2025-01-15T10:00:00Z',
    revealed_at: null,
    signwell_document_id: 'sw-doc-006',
    signwell_status: 'declined',
    signed_pdf_url: null,
    signature_requested_at: '2024-12-08T10:00:00Z',
    signature_completed_at: null,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
];

// ============================================================================
// JOB APPLICATIONS
// ============================================================================

export const DEMO_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'application-1',
    job_id: 'job-1',
    talent_id: 'talent-profile-1',
    cover_message: `I am excited to apply for the Senior ML Research Scientist position at TechCorp AI. With 52 publications in top ML venues, an h-index of 34, and recognition including the ACM Best Paper Award and NeurIPS Outstanding Paper Award, I believe I can make significant contributions to your research team.

My work on novel attention mechanisms and large language models directly aligns with TechCorp's mission. I led a 15-person research team at DeepMind and have experience translating research into production systems.

I would welcome the opportunity to discuss how my background can contribute to your groundbreaking work in AI.`,
    attached_documents: ['doc-1', 'doc-2', 'doc-3'],
    score_at_application: 92,
    criteria_met_at_application: ['awards', 'scholarly_articles', 'original_contributions', 'judging', 'critical_role'],
    status: 'letter_sent',
    employer_rating: 5,
    employer_notes: 'Exceptional candidate - exactly what we\'re looking for. Sent interest letter immediately.',
    applied_at: '2024-11-18T10:00:00Z',
    reviewed_at: '2024-11-19T10:00:00Z',
    created_at: '2024-11-18T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z',
  },
  {
    id: 'application-2',
    job_id: 'job-1',
    talent_id: 'talent-profile-2',
    cover_message: `While I come from a design background rather than ML research, I believe my expertise in human-AI interaction could bring a unique perspective to TechCorp AI.

My Red Dot and Apple Design Awards demonstrate my commitment to excellence, and my experience building Figma's design organization shows I can contribute to cross-functional initiatives.

I'd love to discuss how design thinking can enhance AI research and product development.`,
    attached_documents: ['doc-4', 'doc-5'],
    score_at_application: 78,
    criteria_met_at_application: ['awards', 'published_material', 'judging', 'critical_role'],
    status: 'reviewed',
    employer_rating: 3,
    employer_notes: 'Interesting background but not a fit for research role. Could be interesting for design leadership.',
    applied_at: '2024-11-20T10:00:00Z',
    reviewed_at: '2024-11-22T10:00:00Z',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-12-20T10:00:00Z',
  },
  {
    id: 'application-3',
    job_id: 'job-3',
    talent_id: 'talent-profile-7',
    cover_message: `I am writing to express my strong interest in the Principal Quantum Engineer position at Quantum Dynamics.

At IBM Quantum, I have developed novel error correction codes that have improved qubit coherence times by 40%. My 25 publications and APS Fellowship demonstrate my contributions to the field.

I am excited about the opportunity to work on practical quantum computing applications and would welcome the chance to discuss how I can contribute to Quantum Dynamics' mission.`,
    attached_documents: ['doc-6', 'doc-7'],
    score_at_application: 75,
    criteria_met_at_application: ['scholarly_articles', 'original_contributions', 'memberships'],
    status: 'letter_sent',
    employer_rating: 5,
    employer_notes: 'Perfect fit for the role. Deep quantum expertise and proven track record.',
    applied_at: '2024-12-01T10:00:00Z',
    reviewed_at: '2024-12-03T10:00:00Z',
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'application-4',
    job_id: 'job-5',
    talent_id: 'talent-profile-5',
    cover_message: `I am excited to apply for the Head of Protocol Engineering role at FinTech Global.

As the author of EIP-4844 and a core contributor to Ethereum, I have deep expertise in protocol-level development. My DeFi protocol has secured over $2B in total value locked, demonstrating my ability to build secure, scalable systems.

I would love to bring this experience to FinTech Global and help build the future of decentralized finance.`,
    attached_documents: ['doc-8'],
    score_at_application: 68,
    criteria_met_at_application: ['original_contributions', 'scholarly_articles', 'high_salary'],
    status: 'shortlisted',
    employer_rating: 5,
    employer_notes: 'EIP-4844 author - this is exactly who we need. Schedule interview ASAP.',
    applied_at: '2024-12-05T10:00:00Z',
    reviewed_at: '2024-12-06T10:00:00Z',
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-08T10:00:00Z',
  },
  {
    id: 'application-5',
    job_id: 'job-4',
    talent_id: 'talent-profile-6',
    cover_message: `I am thrilled to apply for the Lead Film Composer position at Creative Studios.

My Grammy-nominated and Emmy-winning work speaks to my ability to create memorable, impactful scores. I have composed for major studio films and understand the collaborative nature of film production.

I would be honored to bring my artistic vision to Creative Studios' upcoming projects.`,
    attached_documents: ['doc-9', 'doc-10'],
    score_at_application: 85,
    criteria_met_at_application: ['awards', 'published_material', 'critical_role', 'high_salary'],
    status: 'letter_sent',
    employer_rating: 5,
    employer_notes: 'Grammy-nominated, Emmy winner - exactly the caliber we need for our prestige projects.',
    applied_at: '2024-12-08T10:00:00Z',
    reviewed_at: '2024-12-09T10:00:00Z',
    created_at: '2024-12-08T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
  },
  {
    id: 'application-6',
    job_id: 'job-7',
    talent_id: 'talent-profile-1',
    cover_message: `I am deeply interested in the Distinguished Engineer - AI Safety position at TechCorp AI.

Beyond my research in ML, I have become increasingly focused on alignment and safety. I have published work on interpretability and served on the NeurIPS safety track program committee.

I believe ensuring AI systems are safe and beneficial is the most important challenge in our field, and I would be excited to contribute to TechCorp's safety research.`,
    attached_documents: ['doc-1', 'doc-11'],
    score_at_application: 92,
    criteria_met_at_application: ['awards', 'scholarly_articles', 'original_contributions', 'judging', 'critical_role'],
    status: 'pending',
    employer_rating: null,
    employer_notes: null,
    applied_at: '2024-12-20T10:00:00Z',
    reviewed_at: null,
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2024-12-20T10:00:00Z',
  },
  {
    id: 'application-7',
    job_id: 'job-2',
    talent_id: 'talent-profile-3',
    cover_message: `I am writing to express my interest in the Chief Medical AI Officer position at Innovate Health.

As a biotech entrepreneur with an NIH Director's Award and 38 publications, I have the scientific credentials. As co-founder and CSO of GeneTech Labs (45M Series B), I have the business experience.

I am passionate about applying AI to improve patient outcomes and would welcome the opportunity to lead Innovate Health's medical AI initiatives.`,
    attached_documents: ['doc-12', 'doc-13'],
    score_at_application: 88,
    criteria_met_at_application: ['awards', 'scholarly_articles', 'original_contributions', 'high_salary', 'critical_role'],
    status: 'under_review',
    employer_rating: 4,
    employer_notes: 'Strong candidate, but concerned about timing given her current company. Need to understand her situation better.',
    applied_at: '2024-12-15T10:00:00Z',
    reviewed_at: '2024-12-18T10:00:00Z',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-18T10:00:00Z',
  },
];

// Helper functions
export function getLettersByTalent(talentId: string): InterestLetter[] {
  return DEMO_INTEREST_LETTERS.filter(letter => letter.talent_id === talentId);
}

export function getLettersByEmployer(employerId: string): InterestLetter[] {
  return DEMO_INTEREST_LETTERS.filter(letter => letter.employer_id === employerId);
}

export function getApplicationsByTalent(talentId: string): JobApplication[] {
  return DEMO_JOB_APPLICATIONS.filter(app => app.talent_id === talentId);
}

export function getApplicationsByJob(jobId: string): JobApplication[] {
  return DEMO_JOB_APPLICATIONS.filter(app => app.job_id === jobId);
}
