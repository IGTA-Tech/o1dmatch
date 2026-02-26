'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  Users,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  FileText,
  Globe,
  Shield,
  Target,
  Zap,
  Star,
  Lightbulb,
  Rocket,
  Send,
  Eye,
  Award,
  Search,
  UserCheck,
  Clock,
  PenTool,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Complete Company Profile',
    subtitle: 'Establish your presence and credibility on the platform',
    icon: Building2,
    color: '#D4A84B',
    bgColor: 'rgba(212,168,75,0.08)',
    cta: { label: 'Edit Profile', href: '/dashboard/employer/profile' },
    content: {
      heading: 'A strong profile attracts top O-1 talent',
      description:
        'Your company profile is the first thing candidates see. A complete, professional profile significantly increases candidate acceptance rates for interest letters and job applications.',
      items: [
        {
          icon: Building2,
          title: 'Company Information',
          text: 'Add your company name, industry, size, website, and a compelling description that explains what your organization does and why top talent should join.',
        },
        {
          icon: Globe,
          title: 'Location & Work Setup',
          text: 'Specify your office locations and whether you offer remote, hybrid, or on-site positions. O-1 candidates need to understand the work arrangement.',
        },
        {
          icon: Shield,
          title: 'Authorized Signatory',
          text: 'Designate the person authorized to sign interest letters and sponsorship documents. This is legally required for all O-1 petition support materials.',
        },
        {
          icon: Award,
          title: 'Company Logo & Branding',
          text: 'Upload your logo to make your profile stand out. Listings with logos receive 4x more views from qualified candidates.',
        },
      ],
      tips: [
        'Complete all required fields — incomplete profiles can\'t send interest letters',
        'Write a description that highlights innovation, growth, and why talent thrives at your company',
        'The authorized signatory should be a C-level executive or VP for strongest petition impact',
        'Keep your profile updated — stale info reduces candidate confidence',
      ],
    },
  },
  {
    id: 2,
    title: 'Post Jobs',
    subtitle: 'Create listings that attract extraordinary O-1 candidates',
    icon: Briefcase,
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
    cta: { label: 'Post a Job', href: '/dashboard/employer/jobs/new' },
    content: {
      heading: 'Job listings are your talent magnet',
      description:
        'When you post a job, it instantly becomes visible to all qualified talent in our marketplace. Candidates whose O-1 score meets your minimum threshold will see your listing and can apply directly.',
      items: [
        {
          icon: FileText,
          title: 'Job Details & Requirements',
          text: 'Specify the role title, department, responsibilities, and required qualifications. Be specific about what extraordinary ability looks like for this position.',
        },
        {
          icon: Target,
          title: 'Minimum O-1 Score',
          text: 'Set a minimum score threshold for applicants. Higher thresholds mean fewer but stronger candidates. We recommend starting at 40-60% for most roles.',
        },
        {
          icon: Zap,
          title: 'Sponsorship Details',
          text: 'Clearly state your willingness to sponsor O-1 visas, estimated timeline, and any relocation support you offer. Transparency drives applications.',
        },
        {
          icon: Star,
          title: 'Compensation & Benefits',
          text: 'Include salary range, equity, benefits, and any signing bonuses. Competitive packages significantly increase application rates for top-tier talent.',
        },
      ],
      tips: [
        'Jobs with clear O-1 sponsorship details receive 3x more applications',
        'Include salary ranges — listings without them get 50% fewer views',
        'Keep requirements focused on extraordinary ability, not years of experience',
        'Update job status promptly when roles are filled to maintain platform trust',
      ],
    },
  },
  {
    id: 3,
    title: 'Browse Candidates',
    subtitle: 'Discover pre-screened talent matched to your needs',
    icon: Users,
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    cta: { label: 'Browse Talent', href: '/dashboard/employer/browse' },
    content: {
      heading: 'Find extraordinary talent proactively',
      description:
        'Don\'t just wait for applications — browse our talent pool of pre-screened O-1 candidates. Filter by field, score, expertise, and availability to find the perfect match for your team.',
      items: [
        {
          icon: Search,
          title: 'Smart Filters',
          text: 'Filter candidates by field of expertise, O-1 score range, industry, location preference, and availability. Find exactly the talent profile you\'re looking for.',
        },
        {
          icon: Eye,
          title: 'Candidate Profiles',
          text: 'View detailed profiles including professional summaries, key achievements, evidence strength across all 8 O-1 criteria, and their readiness score.',
        },
        {
          icon: UserCheck,
          title: 'Score-Based Matching',
          text: 'Our scoring system pre-qualifies candidates. Focus your time on candidates who meet your threshold — they\'ve already demonstrated extraordinary ability.',
        },
        {
          icon: Clock,
          title: 'Availability & Timeline',
          text: 'See each candidate\'s target start date and visa timeline so you can plan hiring and sponsorship activities accordingly.',
        },
      ],
      tips: [
        'Start with broader filters and narrow down — you might discover talent in adjacent fields',
        'Candidates with scores above 60% typically have strong petition foundations',
        'Save searches to get notified when new matching candidates join the platform',
        'Review candidate evidence strength — it indicates petition success likelihood',
      ],
    },
  },
  {
    id: 4,
    title: 'Send Interest Letters',
    subtitle: 'Express formal sponsorship intent to candidates you want to hire',
    icon: Mail,
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.08)',
    cta: { label: 'View Letters', href: '/dashboard/employer/letters' },
    content: {
      heading: 'Interest letters are the bridge to sponsorship',
      description:
        'An interest letter is a formal expression of your intent to hire and sponsor an O-1 candidate. It\'s a critical document in the O-1 petition process and signals serious commitment to both the candidate and USCIS.',
      items: [
        {
          icon: PenTool,
          title: 'Draft & Customize',
          text: 'Use our template system to draft professional interest letters. Customize the content to highlight why this specific candidate\'s extraordinary ability is essential to your organization.',
        },
        {
          icon: Send,
          title: 'Send for Review',
          text: 'Letters are reviewed by our admin team before being delivered to candidates. This ensures quality, compliance, and professionalism in every communication.',
        },
        {
          icon: UserCheck,
          title: 'Candidate Acceptance',
          text: 'Once approved and delivered, candidates can review and accept your letter. Accepted letters become part of their O-1 petition evidence package.',
        },
        {
          icon: Shield,
          title: 'Contact Exchange',
          text: 'When a candidate signs and accepts your interest letter, contact information is revealed to both parties so you can proceed with the hiring and petition process.',
        },
      ],
      tips: [
        'Complete your company profile first — it\'s required before sending letters',
        'Be specific about why this candidate\'s skills are essential to your business',
        'Letters from C-level executives carry more weight with USCIS',
        'Follow up promptly when a candidate accepts — momentum matters in immigration',
      ],
    },
  },
];

export default function EmployerWelcomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
        >
          <Sparkles className="w-4 h-4" />
          Welcome to O1DMatch
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
        >
          Hire Extraordinary O-1 Talent
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Follow these four steps to set up your company, post jobs, discover pre-screened
          candidates, and send interest letters to start the sponsorship process.
        </p>
      </div>

      {/* Step Selector */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {steps.map((s, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isActive ? '#0B1D35' : isCompleted ? 'rgba(16,185,129,0.08)' : '#F1F5F9',
                color: isActive ? '#E8C97A' : isCompleted ? '#10B981' : '#64748B',
                border: isActive ? '1px solid rgba(212,168,75,0.3)' : '1px solid transparent',
              }}
            >
              {isCompleted ? (
                <CheckCircle className="w-4.5 h-4.5" />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isActive ? 'rgba(212,168,75,0.2)' : 'rgba(100,116,139,0.15)',
                    color: isActive ? '#E8C97A' : '#64748B',
                  }}
                >
                  {s.id}
                </div>
              )}
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E8ECF1', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
      >
        {/* Step Header */}
        <div
          className="px-8 py-6 flex items-center gap-5"
          style={{ background: '#0B1D35' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(212,168,75,0.15)' }}
          >
            <step.icon className="w-7 h-7" style={{ color: '#E8C97A' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Step {step.id}: {step.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-sm mt-0.5">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-8">
          <h3 className="text-xl font-bold mb-2" style={{ color: '#0B1D35' }}>
            {step.content.heading}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-8">
            {step.content.description}
          </p>

          {/* Info Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {step.content.items.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: '#FAFAF7', border: '1px solid #E8ECF1' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: step.bgColor }}
                >
                  <item.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#0B1D35' }}>
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{ background: 'rgba(212,168,75,0.06)', border: '1px solid rgba(212,168,75,0.15)' }}
          >
            <p className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: '#D4A84B' }}>
              <Lightbulb className="w-4 h-4" />
              Pro Tips
            </p>
            <ul className="space-y-2">
              {step.content.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D4A84B' }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: '#F1F5F9', color: '#64748B' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: '#0B1D35', color: '#E8C97A' }}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}
              <Link
                href={step.cta.href}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: '#D4A84B', color: '#0B1D35' }}
              >
                {step.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Skip */}
      <div className="text-center pb-4">
        <Link
          href="/dashboard/employer"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Rocket className="w-4 h-4" />
          Skip intro and go to dashboard
        </Link>
      </div>
    </div>
  );
}