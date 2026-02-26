'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  FileText,
  BarChart3,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Upload,
  FolderOpen,
  Star,
  Target,
  TrendingUp,
  Zap,
  Award,
  Globe,
  Lightbulb,
  Rocket,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Build Your Profile',
    subtitle: 'Tell us about your extraordinary achievements',
    icon: User,
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
    cta: { label: 'Complete Profile', href: '/dashboard/talent/profile' },
    content: {
      heading: 'Your profile is your first impression',
      description:
        'A strong profile helps employers understand your background and makes it easier for our matching algorithm to connect you with the right opportunities.',
      items: [
        {
          icon: User,
          title: 'Personal & Professional Details',
          text: 'Add your name, field of expertise, current role, and a professional summary that highlights what makes you extraordinary.',
        },
        {
          icon: Globe,
          title: 'Areas of Expertise',
          text: 'Select your field — sciences, arts, education, business, or athletics. This helps us match you with relevant employers and visa categories.',
        },
        {
          icon: Award,
          title: 'Key Achievements',
          text: 'List your most notable accomplishments — awards, publications, patents, major projects, or leadership roles that demonstrate extraordinary ability.',
        },
        {
          icon: Target,
          title: 'Visa Goals & Timeline',
          text: 'Let us know your target start date and preferred locations so employers can plan accordingly.',
        },
      ],
      tips: [
        'Be specific — "Led a team of 50 engineers" is stronger than "managed engineers"',
        'Include metrics where possible — revenue generated, papers cited, users reached',
        'Upload a professional photo to increase employer engagement by 3x',
      ],
    },
  },
  {
    id: 2,
    title: 'Upload Evidence',
    subtitle: 'Document your extraordinary ability across 8 criteria',
    icon: FileText,
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    cta: { label: 'Upload Evidence', href: '/dashboard/talent/evidence' },
    content: {
      heading: 'Evidence is the backbone of your O-1 petition',
      description:
        'The O-1 visa requires proof of extraordinary ability in at least 3 of 8 criteria. Upload documents for each criterion you qualify for — the more evidence, the stronger your case.',
      items: [
        {
          icon: Award,
          title: 'Awards & Recognition',
          text: 'National or international prizes, fellowships, grants, or honors in your field. Include certificates, press coverage, or official announcements.',
        },
        {
          icon: FolderOpen,
          title: 'Published Material',
          text: 'Articles, books, research papers you\'ve authored, or major media coverage about you and your work. PDFs, links, or screenshots all work.',
        },
        {
          icon: Star,
          title: 'Judging & Review',
          text: 'Evidence of serving as a judge, reviewer, or panelist — peer review records, conference committee invitations, or editorial board memberships.',
        },
        {
          icon: Upload,
          title: 'Original Contributions',
          text: 'Patents, open-source projects, novel methodologies, or any work that\'s had a significant impact in your field. Include citations or adoption metrics.',
        },
      ],
      tips: [
        'Upload PDFs, images, or links — we accept all common formats',
        'Label each document clearly with the criterion it supports',
        'Quality over quantity — one strong piece of evidence beats five weak ones',
        'Don\'t worry about perfection — you can add more evidence anytime',
      ],
    },
  },
  {
    id: 3,
    title: 'Your O-1 Score & Matching',
    subtitle: 'Understand your readiness and connect with employers',
    icon: BarChart3,
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.08)',
    cta: { label: 'Go to Dashboard', href: '/dashboard/talent' },
    content: {
      heading: 'Your score reflects your petition strength',
      description:
        'As you upload evidence, our system calculates an O-1 readiness score based on the quantity and quality of documentation across all 8 criteria. This score powers everything.',
      items: [
        {
          icon: TrendingUp,
          title: 'Real-Time Scoring',
          text: 'Your O-1 score updates automatically as you add evidence. Track which criteria are strong, which need work, and see exactly where to focus your efforts.',
        },
        {
          icon: Briefcase,
          title: 'Employer Matching',
          text: 'Employers post positions with minimum score requirements. When your score meets or exceeds a job\'s threshold, you\'ll appear in their talent pool automatically.',
        },
        {
          icon: Zap,
          title: 'Interest Letters',
          text: 'Employers who want to sponsor you can send interest letters directly through the platform — a critical piece of any O-1 petition.',
        },
        {
          icon: Lightbulb,
          title: 'Actionable Insights',
          text: 'The criteria breakdown shows exactly where you stand on each of the 8 categories, with suggestions on what to upload next to improve your score.',
        },
      ],
      tips: [
        'You need at least 3 of 8 criteria met for a strong O-1 petition',
        'A higher score means more job matches and employer visibility',
        'Check your dashboard regularly — new jobs are posted daily',
        'Apply to positions even if your score is slightly below the threshold',
      ],
    },
  },
];

export default function WelcomePage() {
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
          Your O-1 Visa Journey Starts Here
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Follow these three steps to build your profile, upload your evidence, and get matched
          with employers ready to sponsor your O-1 visa.
        </p>
      </div>

      {/* Step Selector */}
      <div className="flex items-center justify-center gap-3">
        {steps.map((s, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isActive ? '#0B1D35' : isCompleted ? 'rgba(16,185,129,0.08)' : '#F1F5F9',
                color: isActive ? '#E8C97A' : isCompleted ? '#10B981' : '#64748B',
                border: isActive ? '1px solid rgba(212,168,75,0.3)' : '1px solid transparent',
              }}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
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
          href="/dashboard/talent"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Rocket className="w-4 h-4" />
          Skip intro and go to dashboard
        </Link>
      </div>
    </div>
  );
}