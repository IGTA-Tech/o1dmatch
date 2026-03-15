import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Target,
  Globe,
  Heart,
  Users,
  Award,
  ArrowRight,
  Lightbulb,
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

        {/* Section 1 — Mission Statement */}
        <section className="py-20" style={{ background: '#FAFAF7' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
            >
              <Target className="w-3.5 h-3.5" />
              Our Mission
            </div>
            <p className="text-xl sm:text-2xl leading-relaxed" style={{ color: '#0B1D35' }}>
              O1DMatch exists to connect extraordinary people with extraordinary opportunities — regardless
              of where they were born. We built the infrastructure to make the O-1 visa accessible,
              understandable, and achievable for talent in every field.
            </p>
          </div>
        </section>

        {/* Section 2 — What is the O-1 Visa? */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
              >
                <Globe className="w-3.5 h-3.5" />
                The O-1 Visa
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                What is the O-1 Visa?
              </h2>
            </div>
            <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
              <p>
                The O-1 visa is a U.S. work authorization for individuals with extraordinary ability or
                achievement in their field. It applies to science, business, finance, education, the arts,
                athletics, and the digital economy — any field where you can document that you are among the best.
              </p>
              <p>
                Unlike the H-1B lottery, the O-1 has no annual cap and is not random. There is no requirement
                for an employer to sponsor you. If your achievements speak for themselves, you may qualify.
              </p>
              <p>
                Examples: award-winning researchers, published authors, championship athletes, top executives,
                independent artists, viral content creators, world-class chefs, decorated architects,
                financial professionals, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 — Why We Built O1DMatch */}
        <section className="py-20" style={{ background: '#FAFAF7' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Why We Built This
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                Why We Built O1DMatch
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg text-center">
              585,000+ qualified professionals are rejected by the H-1B lottery every year — not because they
              aren&apos;t talented, but because of random chance. At the same time, U.S. employers desperately
              need global talent but can&apos;t afford the cost and uncertainty of traditional sponsorship. We
              built O1DMatch to solve both problems at once — a two-sided marketplace where extraordinary
              talent meets the companies ready to hire them.
            </p>
          </div>
        </section>

        {/* Section 4 — Who This Is For */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.12)', color: '#D4A84B' }}
              >
                <Users className="w-3.5 h-3.5" />
                Who This Is For
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: '#0B1D35', fontFamily: "'Playfair Display', serif" }}
              >
                Built for Both Sides
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div
                className="rounded-2xl p-8"
                style={{ background: '#0B1D35' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(212,168,75,0.15)' }}
                >
                  <Users className="w-6 h-6" style={{ color: '#E8C97A' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">For Talent</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)' }} className="leading-relaxed">
                  Scientists, engineers, executives, artists, athletes, creators, freelancers, healthcare
                  professionals, educators, filmmakers, architects, financial professionals — if you&apos;re
                  extraordinary at what you do, in any field, you belong here.
                </p>
              </div>
              <div
                className="rounded-2xl p-8"
                style={{ background: '#FAFAF7', border: '1px solid #E8ECF1' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(11,29,53,0.06)' }}
                >
                  <Award className="w-6 h-6" style={{ color: '#0B1D35' }} />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#0B1D35' }}>For Employers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Companies that need exceptional global talent without the burden of H-1B sponsorship. From
                  startups to Fortune 500s — browse pre-vetted O-1 candidates and send an interest letter
                  in one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — About the Founders */}
        <section className="py-20" style={{ background: '#0B1D35' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(212,168,75,0.15)', color: '#E8C97A' }}
              >
                <Heart className="w-3.5 h-3.5" />
                Our Founders
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                About the Founders
              </h2>
            </div>
            <div
              className="rounded-2xl p-8 sm:p-10 space-y-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p style={{ color: 'rgba(255,255,255,0.75)' }} className="leading-relaxed text-lg">
                O1DMatch was built by world-class immigration attorneys with over 15 years of frontline
                experience securing O-1 and P-1 visas for some of the most recognized names in sports,
                entertainment, finance, and media — including talent from the NFL, NBA G League, ESPN,
                Goldman Sachs, Netflix, and more.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)' }} className="leading-relaxed text-lg">
                Our founding team has federally litigated agent-based O-1 visa cases against USCIS,
                establishing landmark precedent that changed how the industry approaches visa sponsorship
                for talent without traditional employer relationships.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)' }} className="leading-relaxed text-lg">
                We are published contributors to the AILA official treatise on Immigration Options for
                Artists, Entertainers &amp; Athletes — the definitive legal reference in this field.
              </p>
              <p style={{ color: '#E8C97A' }} className="leading-relaxed text-lg font-semibold">
                We didn&apos;t build this from the outside. We built it because we lived it.
              </p>
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