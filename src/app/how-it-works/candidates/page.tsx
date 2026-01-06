import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  Brain,
  Mail,
  CheckCircle,
  FileText,
  Shield,
  Star,
  Eye,
} from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function HowItWorksCandidatesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />
      {/*<header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-gray-900">O1DMatch</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/how-it-works/candidates" className="text-blue-600 font-medium">
                For Candidates
              </Link>
              <Link href="/how-it-works/employers" className="text-gray-600 hover:text-gray-900">
                For Employers
              </Link>
              <Link href="/lawyers" className="text-gray-600 hover:text-gray-900">
                Lawyer Directory
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Log In
              </Link>
              <Link
                href="/signup?role=talent"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>*/}

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            For O-1 Visa Candidates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How O1DMatch Works
            <br />
            <span className="text-blue-600">For Candidates</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Build your O-1 profile, get matched with employers, and receive USCIS-ready
            interest letters to support your visa petition.
          </p>
          <Link
            href="/signup?role=talent"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Create Your Free Profile
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Step 1: Upload Evidence */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                Step 1
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your Evidence
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Start by uploading documents that prove your extraordinary abilities. Our AI
                automatically classifies each document across the 8 O-1 visa criteria.
              </p>
              <ul className="space-y-3">
                {[
                  'Awards and recognition certificates',
                  'Published articles and media coverage',
                  'Patents and original contributions',
                  'Membership certificates',
                  'Employment contracts showing high salary',
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
                  <span className="ml-2 text-sm text-gray-600">Evidence Manager</span>
                </div>
                <div className="p-6">
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50">
                    <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="font-medium text-gray-900">Drop files here or click to upload</p>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOC, JPG up to 10MB</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">award_certificate.pdf</p>
                        <p className="text-xs text-green-600">Classified: Awards</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">forbes_article.pdf</p>
                        <p className="text-xs text-green-600">Classified: Published Material</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: AI Classification */}
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
                  <span className="ml-2 text-sm text-gray-600">AI Analysis</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Document Analyzed</p>
                      <p className="text-sm text-gray-600">AI has classified your evidence</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800">Awards</span>
                        <span className="text-sm text-green-600">95% confidence</span>
                      </div>
                      <div className="mt-2 h-2 bg-green-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{width: '95%'}}></div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-800">Original Contributions</span>
                        <span className="text-sm text-blue-600">78% confidence</span>
                      </div>
                      <div className="mt-2 h-2 bg-blue-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{width: '78%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                Step 2
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI Classifies Your Evidence
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our AI analyzes each document and automatically classifies it against the
                8 USCIS O-1 criteria. No more guessing which category your evidence belongs to.
              </p>
              <ul className="space-y-3">
                {[
                  'Instant classification with confidence scores',
                  'Suggestions for additional evidence needed',
                  'Automatic extraction of key achievements',
                  'Multi-criteria matching for versatile documents',
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

      {/* Step 3: Track Your Score */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                Step 3
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Track Your O-1 Readiness Score
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                See your real-time O-1 readiness score based on how well your evidence covers
                the required criteria. Know exactly where you stand and what you need to improve.
              </p>
              <ul className="space-y-3">
                {[
                  'Visual breakdown of all 8 criteria',
                  "See which criteria you've met (need 3+)",
                  'Recommendations to improve your score',
                  'Compare your profile to successful applicants',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup - Dashboard */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-600">Your Dashboard</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-6 mb-6">
                    {/* Score Circle */}
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                        <circle cx="56" cy="56" r="48" stroke="#22C55E" strokeWidth="8" fill="none"
                          strokeDasharray="301.6" strokeDashoffset="75.4" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-3xl font-bold text-gray-900">75</span>
                          <span className="text-sm text-gray-500 block">Score</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600 text-lg">Strong Profile</p>
                      <p className="text-sm text-gray-600">5 of 8 criteria met</p>
                    </div>
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Awards', met: true },
                      { name: 'Memberships', met: true },
                      { name: 'Published Material', met: true },
                      { name: 'Judging', met: false },
                      { name: 'Original Contributions', met: true },
                      { name: 'Scholarly Articles', met: false },
                      { name: 'Critical Role', met: true },
                      { name: 'High Salary', met: false },
                    ].map((criterion) => (
                      <div key={criterion.name} className={`flex items-center gap-2 p-2 rounded-lg ${criterion.met ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <CheckCircle className={`w-4 h-4 ${criterion.met ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-sm ${criterion.met ? 'text-green-800' : 'text-gray-500'}`}>{criterion.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: Get Matched */}
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
                  <span className="ml-2 text-sm text-gray-600">Job Matches</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { company: 'TechCorp', role: 'Senior AI Engineer', score: 85, match: 'Excellent Match' },
                    { company: 'StartupXYZ', role: 'Lead Data Scientist', score: 78, match: 'Great Match' },
                    { company: 'Innovation Inc', role: 'Research Director', score: 72, match: 'Good Match' },
                  ].map((job) => (
                    <div key={job.company} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{job.role}</p>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">{job.score}%</span>
                          <p className="text-xs text-green-600">{job.match}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">O-1 Sponsor</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Remote OK</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
                Step 4
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Matched with Jobs
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Browse job listings from employers actively seeking O-1 candidates. See your
                match score for each position based on your profile and their requirements.
              </p>
              <ul className="space-y-3">
                {[
                  'Jobs filtered to match your O-1 score',
                  'Companies verified and ready to sponsor',
                  'Apply with one click',
                  'Track all your applications',
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

      {/* Step 5: Receive Letters */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                Step 5
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Receive Interest Letters
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Employers who are interested in your profile can send you USCIS-compliant
                interest letters. These letters are crucial evidence for your O-1 petition.
              </p>
              <ul className="space-y-3">
                {[
                  'USCIS-ready letter format',
                  'Digital signatures from verified employers',
                  'Download as PDF for your petition',
                  'Your identity protected until you accept',
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
                  <span className="ml-2 text-sm text-gray-600">Interest Letters</span>
                </div>
                <div className="p-6">
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">New Interest Letter!</p>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">TechCorp wants to sponsor your O-1 visa</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="text-center border-b border-gray-200 pb-4 mb-4">
                      <p className="font-bold text-gray-900">INTEREST LETTER</p>
                      <p className="text-sm text-gray-500">For O-1 Visa Petition</p>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>To Whom It May Concern,</p>
                      <p className="text-gray-400">TechCorp expresses genuine interest in employing the beneficiary as a Senior AI Engineer...</p>
                      <p className="text-gray-400">The candidate&apos;s extraordinary abilities in...</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">John Smith</p>
                        <p className="text-xs text-gray-500">CEO, TechCorp</p>
                      </div>
                      <button
                        className="px-4 py-2 bg-blue-400 text-white/80 rounded-lg text-sm cursor-not-allowed opacity-75"
                        disabled
                        title="Demo button - not functional"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">Your Privacy is Protected</h2>
          <p className="text-blue-100 text-lg mb-6">
            Your personal information (name, contact details, photo) is hidden from employers
            until you explicitly accept their interest letter. Employers only see your
            anonymized candidate ID, qualifications, and O-1 score.
          </p>
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>Anonymized Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>You Control Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Start Your O-1 Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands of extraordinary talents who are building their O-1 profiles
            and connecting with U.S. employers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=talent"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works/employers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-900 font-medium rounded-xl hover:border-gray-300 transition-colors"
            >
              I&apos;m an Employer
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
                <li><Link href="/signup?role=talent" className="hover:text-white">Create Profile</Link></li>
                <li><Link href="/login" className="hover:text-white">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/how-it-works/employers" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/signup?role=employer" className="hover:text-white">Post Jobs</Link></li>
                <li><Link href="/login" className="hover:text-white">Browse Talent</Link></li>
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
