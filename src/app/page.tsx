'use client';

// import { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Users,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Building2,
  Briefcase,
  Scale,
  Info,
} from 'lucide-react';
import Navbar from "@/components/Navbar";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loginHref = isDemoMode ? '/demo' : '/login';
  const signupHref = isDemoMode ? '/demo' : '/signup';
  const talentSignupHref = isDemoMode ? '/demo' : '/signup?role=talent';
  const employerSignupHref = isDemoMode ? '/demo' : '/signup?role=employer';

  return (
    <div className="min-h-screen bg-white">
      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            <span>Demo Mode - Explore with sample data. No real accounts or transactions.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Navbar />
      {/*<header className={`fixed ${isDemoMode ? 'top-10' : 'top-0'} left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-gray-900">O1DMatch</span>
            </div>

            {/* Desktop Navigation 
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/how-it-works/candidates" className="text-gray-600 hover:text-gray-900">
                For Candidates
              </Link>
              <Link href="/how-it-works/employers" className="text-gray-600 hover:text-gray-900">
                For Employers
              </Link>
              <Link href="/lawyers" className="text-gray-600 hover:text-gray-900">
                Lawyer Directory
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href={loginHref} className="text-gray-600 hover:text-gray-900">
                Log In
              </Link>
              <Link
                href={signupHref}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>

            {/* Mobile Menu Button 
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation 
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/how-it-works/candidates"
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  For Candidates
                </Link>
                <Link
                  href="/how-it-works/employers"
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  For Employers
                </Link>
                <Link
                  href="/lawyers"
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Lawyer Directory
                </Link>
                <Link
                  href={loginHref}
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href={signupHref}
                  className="px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>*/}

      {/* Hero */}
      <section className={`${isDemoMode ? 'pt-40' : 'pt-32'} pb-20 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            The O-1 Visa Talent Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Connect Extraordinary Talent
            <br />
            <span className="text-blue-600">with U.S. Employers</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            O1DMatch bridges the gap between O-1 visa candidates and employers ready to hire.
            Build your profile, showcase your extraordinary abilities, and get matched with
            opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={talentSignupHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              I&apos;m a Talent
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={employerSignupHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-900 font-medium rounded-xl hover:border-gray-300 transition-colors"
            >
              I&apos;m an Employer
              <Building2 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How O1DMatch Works
            </h2>
            <p className="text-lg text-gray-600">
              A streamlined process for O-1 visa matching
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Build Your O-1 Profile
              </h3>
              <p className="text-gray-600">
                Upload evidence of your extraordinary abilities. Our AI classifies your
                achievements across the 8 O-1 criteria and calculates your readiness score.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Matched with Employers
              </h3>
              <p className="text-gray-600">
                Employers browse anonymized talent profiles and express interest.
                Your identity stays protected until you accept a connection.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Receive Interest Letters
              </h3>
              <p className="text-gray-600">
                Get USCIS-ready interest letters from employers. These support your
                O-1 petition and demonstrate genuine job offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* O-1 Criteria */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O-1 Visa Criteria We Track
            </h2>
            <p className="text-lg text-gray-600">
              We help you document and score your evidence across all 8 criteria
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Awards', desc: 'National or international recognition' },
              { name: 'Memberships', desc: 'Elite professional associations' },
              { name: 'Published Material', desc: 'Media coverage about you' },
              { name: 'Judging', desc: 'Evaluating others in your field' },
              { name: 'Original Contributions', desc: 'Significant innovations' },
              { name: 'Scholarly Articles', desc: 'Published research work' },
              { name: 'Critical Role', desc: 'Key positions at notable orgs' },
              { name: 'High Salary', desc: 'Above-market compensation' },
            ].map((criterion) => (
              <div
                key={criterion.name}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{criterion.name}</p>
                  <p className="text-sm text-gray-500">{criterion.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="py-20 bg-blue-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">
                Employers: Access O-1 Ready Talent
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Browse pre-qualified candidates with verified O-1 credentials.
                Send interest letters with one click to support their visa petitions.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Browse anonymized talent profiles',
                  'Filter by O-1 readiness score',
                  'Send USCIS-compliant interest letters',
                  'Reveal contact info only when accepted',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-200" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={employerSignupHref}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors"
              >
                Create Employer Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">500+ Active Talent</p>
                    <p className="text-blue-200 text-sm">O-1 ready candidates</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">100+ Companies</p>
                    <p className="text-blue-200 text-sm">Actively hiring</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">50+ Immigration Attorneys</p>
                    <p className="text-blue-200 text-sm">In our directory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join O1DMatch today and take the next step in your O-1 visa journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={signupHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/lawyers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-900 font-medium rounded-xl hover:border-gray-300 transition-colors"
            >
              Browse Lawyer Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O1</span>
                </div>
                <span className="font-semibold text-white">O1DMatch</span>
              </div>
              <p className="text-sm">
                The marketplace connecting extraordinary talent with U.S. employers for O-1 visa opportunities.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Talent</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/how-it-works/candidates" className="hover:text-white">How It Works</Link></li>
                <li><Link href={talentSignupHref} className="hover:text-white">Create Profile</Link></li>
                <li><Link href={loginHref} className="hover:text-white">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/how-it-works/employers" className="hover:text-white">How It Works</Link></li>
                <li><Link href={employerSignupHref} className="hover:text-white">Post Jobs</Link></li>
                <li><Link href={loginHref} className="hover:text-white">Browse Talent</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/lawyers" className="hover:text-white">Lawyer Directory</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} O1DMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
