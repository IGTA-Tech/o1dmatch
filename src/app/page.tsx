'use client';

import Link from 'next/link';
import {
  Star,
  ArrowRight,
  CheckCircle,
  Building2,
  Briefcase,
  Scale,
  Info,
  Upload,
  BarChart3,
  Mail,
  Handshake,
} from 'lucide-react';
import Navbar from "@/components/Navbar";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function Home() {
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

      {/* How It Works - New Design */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How O1DMatch Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A streamlined 4-step process to connect O-1 talent with employers
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line - Desktop */}
            <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      1
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Create Your Profile
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Sign up and upload your evidence of extraordinary abilities. Add your achievements, awards, publications, and more.
                  </p>
                  
                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Takes only 10 minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      2
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-purple-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Get Your O-1 Score
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our AI analyzes your evidence across the 8 O-1 criteria and generates a comprehensive readiness score.
                  </p>
                  
                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>AI-powered analysis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      3
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-green-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Receive Interest Letters
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Employers browse your anonymized profile and send USCIS-ready interest letters to support your visa petition.
                  </p>
                  
                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Privacy protected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      4
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform">
                    <Handshake className="w-7 h-7 text-orange-500" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Connect & Get Hired
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Accept connections, reveal your identity, and work with employers and attorneys to complete your O-1 petition.
                  </p>
                  
                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Full support provided</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href={signupHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* O-1 Criteria */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              8 Criteria
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O-1 Visa Criteria We Track
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We help you document and score your evidence across all 8 criteria
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Awards', desc: 'National or international recognition', icon: '🏆' },
              { name: 'Memberships', desc: 'Elite professional associations', icon: '👥' },
              { name: 'Published Material', desc: 'Media coverage about you', icon: '📰' },
              { name: 'Judging', desc: 'Evaluating others in your field', icon: '⚖️' },
              { name: 'Original Contributions', desc: 'Significant innovations', icon: '💡' },
              { name: 'Scholarly Articles', desc: 'Published research work', icon: '📚' },
              { name: 'Critical Role', desc: 'Key positions at notable orgs', icon: '🎯' },
              { name: 'High Salary', desc: 'Above-market compensation', icon: '💰' },
            ].map((criterion, index) => (
              <div
                key={criterion.name}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{criterion.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {criterion.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{criterion.desc}</p>
                  </div>
                </div>
                {/* Criterion number badge */}
                <div className="absolute top-3 right-3 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  {index + 1}
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
              <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-semibold rounded-full mb-4">
                For Employers
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Access O-1 Ready Talent
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
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
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-900 font-medium rounded-xl hover:border-gray-300 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left - Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-white">O1DMatch</span>
            </div>

            {/* Center - Tagline */}
            <p className="text-gray-400 text-sm text-center">
              Connecting exceptional talent with opportunities for O-1 visa sponsorship.
            </p>

            {/* Right - Copyright */}
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} O1DMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}