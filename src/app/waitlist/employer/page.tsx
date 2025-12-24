import { Metadata } from 'next';
import { Gift, Search, FileCheck, Clock } from 'lucide-react';
import EmployerWaitlistForm from '@/components/waitlist/EmployerWaitlistForm';

export const metadata: Metadata = {
  title: 'Join the Waitlist | Employers | O1DMatch',
  description: 'Get early access to O1DMatch and find extraordinary O-1 visa talent. 3 months free for early members.',
};

export default function EmployerWaitlistPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-green-700">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm mb-6">
                <Gift className="w-4 h-4" />
                Early Access - 3 Months Free
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                Hire{' '}
                <span className="text-green-600">
                  extraordinary talent
                </span>{' '}
                with O-1 visa expertise
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                O1DMatch gives you access to pre-vetted O-1 visa candidates.
                Browse profiles, send interest letters, and hire world-class talent.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Browse O-1 Ready Talent</div>
                    <div className="text-sm text-gray-500">Access candidates scored on all 8 O-1 criteria</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Generate Interest Letters</div>
                    <div className="text-sm text-gray-500">USCIS-compliant letters with one click</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Faster Hiring</div>
                    <div className="text-sm text-gray-500">Reduce time-to-hire for international talent</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-green-600">3</div>
                  <div className="text-sm text-gray-500">Months free access</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">1000+</div>
                  <div className="text-sm text-gray-500">O-1 candidates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">50+</div>
                  <div className="text-sm text-gray-500">Industries covered</div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Join the Waitlist</h2>
                <p className="text-gray-500">Get 3 months of free access when we launch</p>
              </div>
              <EmployerWaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How O1DMatch Works for Employers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Browse Talent</h3>
              <p className="text-sm text-gray-500">Search pre-vetted O-1 candidates by skills and industry</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Review Profiles</h3>
              <p className="text-sm text-gray-500">See O-1 scores and verified evidence for each candidate</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Send Interest Letter</h3>
              <p className="text-sm text-gray-500">Generate USCIS-compliant interest letters instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Hire & Sponsor</h3>
              <p className="text-sm text-gray-500">Connect directly and sponsor your new O-1 hire</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#faf9f6] border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 O1DMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
