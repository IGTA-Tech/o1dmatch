import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Search,
  Users,
  FileText,
  CheckCircle,
  Shield,
  Send,
  Filter,
  UserCheck,
} from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function HowItWorksEmployersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */} 
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            For Employers
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How O1DMatch Works
            <br />
            <span className="text-green-600">For Employers</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Access a curated pool of O-1 ready talent. Browse anonymized profiles,
            send interest letters, and connect with extraordinary candidates.
          </p>
          <Link
            href="/signup?role=employer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            Create Employer Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Step 1: Create Company Profile */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                Step 1
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Set Up Your Company Profile
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Create your employer account and complete your company profile. This information
                will be used to generate official interest letters for candidates.
              </p>
              <ul className="space-y-3">
                {[
                  'Company name and description',
                  'Authorized signatory information',
                  'Company logo and branding',
                  'Contact details for candidates',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-600">Company Profile</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      TC
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">TechCorp Inc.</p>
                      <p className="text-sm text-gray-600">San Francisco, CA</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">TechCorp Inc.</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Signatory</label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">John Smith, CEO</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Email</label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">john@techcorp.com</div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">Profile verified and ready to send letters</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Post Jobs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual mockup */}
            <div className="order-2 lg:order-1 bg-white rounded-2xl p-6 shadow-lg">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-600">Post a Job</span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">Senior AI Engineer</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm h-20">
                      We&apos;re looking for an exceptional AI engineer to lead our ML team...
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min O-1 Score</label>
                      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">50%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">Remote / SF</div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium">
                    Post Job
                  </button>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                Step 2
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Post Job Listings
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Create job listings for positions you want to fill with O-1 talent.
                Set minimum score requirements and let candidates apply directly.
              </p>
              <ul className="space-y-3">
                {[
                  'Set minimum O-1 score requirements',
                  'Receive applications from qualified candidates',
                  'Track all applicants in one place',
                  'Filter by criteria match and experience',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Browse Talent */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                Step 3
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse Pre-Qualified Talent
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Access our database of O-1 ready candidates. All profiles are pre-qualified
                with verified evidence and calculated readiness scores.
              </p>
              <ul className="space-y-3">
                {[
                  'Search by industry, skills, and experience',
                  'Filter by minimum O-1 readiness score',
                  'See which visa criteria each candidate meets',
                  'View professional headlines and backgrounds',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup - Browse Talent */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-600">Browse Talent</span>
                </div>
                <div className="p-4">
                  {/* Search bar */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-400">Search talent...</div>
                    </div>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg">
                      <Filter className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Talent cards */}
                  <div className="space-y-3">
                    {[
                      { id: 'O1D-4821', industry: 'Technology', score: 82, criteria: ['Awards', 'Original Contributions', 'High Salary'] },
                      { id: 'O1D-7392', industry: 'Research', score: 75, criteria: ['Scholarly Articles', 'Judging', 'Memberships'] },
                      { id: 'O1D-1056', industry: 'Business', score: 68, criteria: ['Critical Role', 'Awards', 'Published Material'] },
                    ].map((talent) => (
                      <div key={talent.id} className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                              {talent.id.substring(4, 6)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{talent.id}</p>
                              <p className="text-xs text-gray-500">{talent.industry}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{talent.score}%</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {talent.criteria.map((c) => (
                            <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{c}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: Send Interest Letters */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual mockup */}
            <div className="order-2 lg:order-1 bg-white rounded-2xl p-6 shadow-lg">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-600">Send Interest Letter</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      48
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Candidate O1D-4821</p>
                      <p className="text-sm text-gray-600">Technology - 82% O-1 Score</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position Offered</label>
                      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">Senior AI Engineer</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Why this candidate?</label>
                      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm h-16">
                        Their expertise in ML and proven track record of innovation...
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> A USCIS-compliant interest letter will be generated
                        with your company details and digital signature.
                      </p>
                    </div>
                    <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Interest Letter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
                Step 4
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Send Interest Letters
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Found a candidate you like? Send them a USCIS-compliant interest letter
                with just a few clicks. The letter is automatically generated with your
                company details and digital signature.
              </p>
              <ul className="space-y-3">
                {[
                  'One-click letter generation',
                  'USCIS-compliant format',
                  'Automatic digital signature',
                  'Candidate notified immediately',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 5: Connect */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                Step 5
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Connect When They Accept
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                When a candidate accepts your interest letter, their full profile is revealed.
                Now you can contact them directly and begin the hiring process.
              </p>
              <ul className="space-y-3">
                {[
                  'Full candidate profile revealed',
                  'Direct contact information',
                  'Download the signed interest letter',
                  'Proceed with visa sponsorship',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-600">Connected Candidate</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <UserCheck className="w-10 h-10 text-white" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Sarah Chen</h3>
                    <p className="text-gray-600">Senior Machine Learning Engineer</p>
                    <p className="text-sm text-gray-500">Formerly at Google AI</p>
                  </div>

                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">sarah.chen@email.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="text-sm font-medium text-gray-900">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">O-1 Score</span>
                      <span className="text-sm font-bold text-green-600">82%</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      className="flex-1 py-2.5 bg-green-400 text-white/80 rounded-lg font-medium text-sm cursor-not-allowed opacity-75"
                      disabled
                      title="Demo button - not functional"
                    >
                      Download Letter
                    </button>
                    <button
                      className="flex-1 py-2.5 border border-gray-200 text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed opacity-75"
                      disabled
                      title="Demo button - not functional"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Employers Choose O1DMatch
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Pre-Qualified Talent',
                desc: 'Every candidate has verified evidence and a calculated O-1 readiness score. No guessing games.',
              },
              {
                icon: FileText,
                title: 'USCIS-Ready Letters',
                desc: 'Generate compliant interest letters with one click. Proper format, digital signatures included.',
              },
              {
                icon: Shield,
                title: 'Privacy Protected',
                desc: 'Candidate identities stay hidden until they accept. Reduces bias and protects both parties.',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
                <benefit.icon className="w-10 h-10 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-green-100">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Candidates' },
              { value: '100+', label: 'Companies Hiring' },
              { value: '1,200+', label: 'Letters Sent' },
              { value: '85%', label: 'Response Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Find Extraordinary Talent?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join leading companies who are hiring O-1 talent through O1DMatch.
            Create your free employer account today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=employer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              Create Employer Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works/candidates"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-900 font-medium rounded-xl hover:border-gray-300 transition-colors"
            >
              I&apos;m a Candidate
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
