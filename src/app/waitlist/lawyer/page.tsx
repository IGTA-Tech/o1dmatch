import { Metadata } from 'next';
import { Gift, Users, FileText, Target } from 'lucide-react';
import LawyerWaitlistForm from '@/components/waitlist/LawyerWaitlistForm';

export const metadata: Metadata = {
  title: 'Join the Waitlist | Immigration Lawyers | O1DMatch',
  description: 'Get qualified O-1 client referrals from O1DMatch. 3 months free access for early members.',
};

export default function LawyerWaitlistPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-violet-700">
            O1DMatch
          </a>
          <a
            href="/waitlist"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to Waitlist
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 border border-violet-200 rounded-full text-violet-700 text-sm mb-6">
                <Gift className="w-4 h-4" />
                Early Access - 3 Months Free
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                Grow your O-1 practice with{' '}
                <span className="text-violet-600">
                  qualified referrals
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                O1DMatch connects immigration attorneys with O-1 candidates who already have
                documented evidence. Spend less time qualifying, more time winning cases.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Pre-Qualified Leads</div>
                    <div className="text-sm text-gray-500">Candidates with AI-scored O-1 profiles and evidence</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Evidence Documentation</div>
                    <div className="text-sm text-gray-500">Candidates come with organized, classified evidence</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Directory Listing</div>
                    <div className="text-sm text-gray-500">Featured placement in our lawyer directory</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-violet-600">3</div>
                  <div className="text-sm text-gray-500">Months free</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-violet-600">2K+</div>
                  <div className="text-sm text-gray-500">Potential clients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-violet-600">8</div>
                  <div className="text-sm text-gray-500">Criteria pre-scored</div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Join the Waitlist</h2>
                <p className="text-gray-500">Get 3 months of free access when we launch</p>
              </div>
              <LawyerWaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How Lawyers Benefit from O1DMatch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-semibold mb-2">Pre-Organized Evidence</h3>
              <p className="text-sm text-gray-500">
                Clients arrive with evidence already classified into O-1 criteria categories
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold mb-2">Quality Referrals</h3>
              <p className="text-sm text-gray-500">
                AI scoring ensures candidates meet minimum O-1 thresholds before connecting
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold mb-2">Practice Growth</h3>
              <p className="text-sm text-gray-500">
                Featured listing in directory drives visibility with O-1 seeking candidates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="py-16 px-4 bg-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-violet-600 font-medium mb-4">TRUSTED BY IMMIGRATION ATTORNEYS</div>
          <p className="text-xl text-gray-700 italic mb-6">
            &ldquo;Having candidates arrive with organized, AI-classified evidence saves hours of
            initial consultations. O1DMatch pre-qualifies what used to take multiple meetings.&rdquo;
          </p>
          <div className="text-gray-500">
            — Immigration attorney, early beta tester
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#f8fafc] border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 O1DMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
