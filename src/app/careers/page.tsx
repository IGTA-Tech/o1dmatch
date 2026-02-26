import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Rocket,
  Globe,
  Heart,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  Briefcase,
  Code,
  Megaphone,
  Users,
  Shield,
  Star,
  Coffee,
  Laptop,
  GraduationCap,
  Plane,
  HeartPulse,
} from 'lucide-react';
import '../globals.css';

export const metadata = {
  title: 'Careers at O1DMatch | Join Our Team',
  description:
    'Join O1DMatch and help build the future of O-1 visa immigration. We\'re hiring across engineering, design, marketing, and operations.',
};

const openRoles = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    icon: Code,
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Build and scale our Next.js + Supabase platform. You\'ll work on matching algorithms, document pipelines, and real-time collaboration features.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    icon: Star,
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Design intuitive workflows for complex immigration processes. Turn legal complexity into elegant, human-centered interfaces.',
  },
  {
    title: 'Growth Marketing Manager',
    team: 'Marketing',
    icon: Megaphone,
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Own our go-to-market strategy for talent and employer acquisition. Build campaigns that reach extraordinary people worldwide.',
  },
  {
    title: 'Immigration Operations Lead',
    team: 'Operations',
    icon: Shield,
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Work closely with immigration attorneys to improve our petition workflows, document templates, and compliance processes.',
  },
  {
    title: 'Customer Success Associate',
    team: 'Success',
    icon: Users,
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Help talent and employers navigate the platform, resolve issues quickly, and ensure every user feels supported through their visa journey.',
  },
];

const benefits = [
  { icon: Laptop, label: 'Fully Remote', description: 'Work from anywhere in the US' },
  { icon: HeartPulse, label: 'Health & Dental', description: 'Full coverage for you & family' },
  { icon: Coffee, label: 'Unlimited PTO', description: 'We trust you to recharge' },
  { icon: GraduationCap, label: 'Learning Budget', description: '$2,000/yr for growth' },
  { icon: Plane, label: 'Team Retreats', description: 'Quarterly in-person gatherings' },
  { icon: Zap, label: 'Equity', description: 'Own a piece of what we build' },
];

export default function CareersPage() {
  return (
    <div className="navy-hero-page">
      <Navbar />
      <main className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#0B1D35' }}>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #D4A84B 0%, transparent 70%)' }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(212,168,75,0.15)', color: '#E8C97A' }}
            >
              <Rocket className="w-4 h-4" />
              We&apos;re Hiring
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Build the Future of
              <br />
              <span style={{ color: '#D4A84B' }}>Immigration Technology</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Join a mission-driven team that&apos;s making the O-1 visa process accessible to
              extraordinary talent worldwide. Remote-first, high-impact, and growing fast.
            </p>
            <a
              href="#open-roles"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{ background: '#D4A84B', color: '#0B1D35' }}
            >
              View Open Roles
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Why Join */}
        <section className="py-20" style={{ background: '#FAFAF7' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
              >
                <Heart className="w-3.5 h-3.5" />
                Why O1DMatch
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                More Than a Job — A Mission
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Immigration is personal. Behind every petition is a person pursuing their dream.
                Your work here matters in a tangible, human way.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: 'Global Impact',
                  description:
                    'Your code, designs, and strategies directly help extraordinary people from 60+ countries achieve their goals in the United States.',
                },
                {
                  icon: Zap,
                  title: 'Move Fast, Ship Often',
                  description:
                    'We\'re a small, senior team that ships weekly. No bureaucracy, no endless meetings — just building what matters.',
                },
                {
                  icon: Briefcase,
                  title: 'Own Your Work',
                  description:
                    'You\'ll have real ownership over product decisions, architecture choices, and customer outcomes from day one.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl p-8 transition-all hover:-translate-y-1"
                  style={{ background: '#FFFFFF', border: '1px solid #E8ECF1' }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(212,168,75,0.1)' }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: '#D4A84B' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#0B1D35' }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                Benefits & Perks
              </h2>
              <p className="text-gray-600 text-lg">
                We take care of our team so they can take care of our users.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-start gap-4 rounded-xl p-5"
                  style={{ background: '#FAFAF7', border: '1px solid #E8ECF1' }}
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(11,29,53,0.06)' }}
                  >
                    <benefit.icon className="w-5 h-5" style={{ color: '#0B1D35' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#0B1D35' }}>{benefit.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section id="open-roles" className="py-20" style={{ background: '#FAFAF7' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Open Positions
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                Join Our Team
              </h2>
              <p className="text-gray-600">
                {openRoles.length} open roles — all remote-friendly
              </p>
            </div>

            <div className="space-y-4">
              {openRoles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
                  style={{ background: '#FFFFFF', border: '1px solid #E8ECF1' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(212,168,75,0.1)' }}
                    >
                      <role.icon className="w-6 h-6" style={{ color: '#D4A84B' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: '#0B1D35' }}>
                          {role.title}
                        </h3>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full self-start"
                          style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
                        >
                          {role.team}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {role.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {role.type}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 text-gray-300 group-hover:text-[#D4A84B] transition-colors flex-shrink-0 hidden sm:block mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Don't see your role? */}
            <div
              className="mt-8 rounded-2xl p-8 text-center"
              style={{ background: 'rgba(11,29,53,0.03)', border: '1px dashed rgba(11,29,53,0.15)' }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0B1D35' }}>
                Don&apos;t see your role?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We&apos;re always looking for exceptional people. Send us your resume and tell us how
                you&apos;d contribute.
              </p>
              <a
                href="mailto:careers@o1dmatch.com"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: '#0B1D35', color: '#FFFFFF' }}
              >
                careers@o1dmatch.com
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20" style={{ background: '#0B1D35' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Shape the Future of Immigration
            </h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Your work will directly help thousands of extraordinary people achieve their American
              dream. That&apos;s not just a tagline — it&apos;s our daily reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#open-roles"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                style={{ background: '#D4A84B', color: '#0B1D35' }}
              >
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0B1D35', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs"
                  style={{ background: '#D4A84B', color: '#0B1D35' }}
                >
                  O1
                </div>
                <span className="text-white font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  O1DMatch
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/careers" className="hover:text-white transition-colors">Careers</Link>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                &copy; {new Date().getFullYear()} O1DMatch. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}