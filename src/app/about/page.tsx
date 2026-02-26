import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Target,
  Globe,
  Shield,
  Zap,
  Heart,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Scale,
  Rocket,
} from 'lucide-react';
import '../globals.css';

export const metadata = {
  title: 'About O1DMatch | Our Mission to Transform O-1 Visa Immigration',
  description:
    'O1DMatch is the premier platform connecting extraordinary talent with U.S. employers through a streamlined O-1 visa process. Learn about our mission, values, and team.',
};

export default function AboutPage() {
  return (
    <div className="navy-hero-page">
      <Navbar />
      <main className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#0B1D35' }}>
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Glow */}
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #D4A84B 0%, transparent 70%)' }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(212,168,75,0.15)', color: '#E8C97A' }}
            >
              <Globe className="w-4 h-4" />
              Our Story
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Bridging Extraordinary Talent
              <br />
              <span style={{ color: '#D4A84B' }}>With Extraordinary Opportunity</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              O1DMatch was born from a simple truth: the O-1 visa process is broken. We&apos;re
              building the platform that fixes it — for talent, employers, and the immigration
              professionals who serve them.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20" style={{ background: '#FAFAF7' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
                >
                  <Target className="w-3.5 h-3.5" />
                  Our Mission
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold mb-6"
                  style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
                >
                  Making O-1 Visas Accessible to All Extraordinary Individuals
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Every year, thousands of world-class researchers, artists, athletes, and business
                  leaders struggle with the O-1 visa petition process. Mountains of paperwork, unclear
                  criteria, and no single platform to connect talent with willing sponsors.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  O1DMatch changes that. We&apos;ve built an end-to-end platform that helps talent
                  organize their evidence, connects them with employers ready to sponsor, and gives
                  immigration attorneys the tools to build winning petitions — all in one place.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: 'Talent Matched', value: '2,000+' },
                  { icon: Award, label: 'Petitions Supported', value: '850+' },
                  { icon: Globe, label: 'Countries Represented', value: '60+' },
                  { icon: CheckCircle, label: 'Approval Rate', value: '94%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-6 text-center"
                    style={{ background: '#FFFFFF', border: '1px solid #E8ECF1' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'rgba(212,168,75,0.1)' }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: '#D4A84B' }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#0B1D35' }}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The Problem / Solution */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Why O1DMatch
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                Solving a Real Problem
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Fragmented Process',
                  description:
                    'Talent, employers, and lawyers use separate tools — spreadsheets, emails, shared drives. We unify everything into one intelligent workflow.',
                },
                {
                  icon: Scale,
                  title: 'Unclear Criteria',
                  description:
                    'Most applicants don\'t know where they stand on the 8 O-1 criteria. Our scoring system gives instant clarity and actionable next steps.',
                },
                {
                  icon: Shield,
                  title: 'No Marketplace',
                  description:
                    'There\'s been no way for qualified O-1 candidates to find employers willing to sponsor. O1DMatch creates that marketplace for the first time.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl p-8 transition-all hover:-translate-y-1"
                  style={{ background: '#FAFAF7', border: '1px solid #E8ECF1' }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(11,29,53,0.06)' }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: '#0B1D35' }} />
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

        {/* Values */}
        <section className="py-20" style={{ background: '#0B1D35' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.15)', color: '#E8C97A' }}
              >
                <Heart className="w-3.5 h-3.5" />
                Our Values
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                What Drives Us Every Day
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Globe,
                  title: 'Global First',
                  description: 'We build for talent everywhere, not just Silicon Valley.',
                },
                {
                  icon: Shield,
                  title: 'Trust & Transparency',
                  description: 'Immigration is high-stakes. We earn trust through clarity.',
                },
                {
                  icon: Zap,
                  title: 'Radical Simplicity',
                  description: 'Complex processes deserve simple, elegant solutions.',
                },
                {
                  icon: Heart,
                  title: 'Human-Centered',
                  description: 'Behind every petition is a person pursuing their dream.',
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(212,168,75,0.12)' }}
                  >
                    <value.icon className="w-6 h-6" style={{ color: '#E8C97A' }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20" style={{ background: '#FAFAF7' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(212,168,75,0.12)' }}
            >
              <Rocket className="w-8 h-8" style={{ color: '#D4A84B' }} />
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              Whether you&apos;re extraordinary talent looking for a sponsor, or an employer seeking
              world-class professionals — O1DMatch is built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                style={{ background: '#D4A84B', color: '#0B1D35' }}
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/how-it-works/candidates"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                style={{ background: '#0B1D35', color: '#FFFFFF' }}
              >
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0B1D35' }} className="py-10">
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