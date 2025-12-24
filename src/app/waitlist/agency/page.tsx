import { Metadata } from 'next';
import { Gift, Briefcase, Globe, TrendingUp } from 'lucide-react';
import AgencyWaitlistForm from '@/components/waitlist/AgencyWaitlistForm';

export const metadata: Metadata = {
  title: 'Join the Waitlist | Agencies | O1DMatch',
  description: 'Expand your agency with O-1 visa placements. Get 3 months free access to O1DMatch.',
};

export default function AgencyWaitlistPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-amber-500">
            O1DMatch
          </a>
          <a
            href="/waitlist"
            className="text-sm text-gray-400 hover:text-white transition-colors"
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-sm mb-6">
                <Gift className="w-4 h-4" />
                Early Access - 3 Months Free
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Expand your placements into{' '}
                <span className="text-amber-500">
                  O-1 visa talent
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                O1DMatch empowers staffing agencies to serve clients seeking extraordinary
                international talent. Access O-1 ready candidates and streamline placements.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-semibold">Pre-Vetted O-1 Candidates</div>
                    <div className="text-sm text-gray-500">Access candidates scored across all 8 O-1 criteria</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-semibold">White-Label Interest Letters</div>
                    <div className="text-sm text-gray-500">Generate letters on behalf of your clients</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-semibold">New Revenue Stream</div>
                    <div className="text-sm text-gray-500">Capture the growing demand for O-1 placements</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-amber-500">3</div>
                  <div className="text-sm text-gray-500">Months free</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-500">100+</div>
                  <div className="text-sm text-gray-500">Agency partners</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-500">8x</div>
                  <div className="text-sm text-gray-500">Faster matching</div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
                <p className="text-gray-400">Get 3 months of free access when we launch</p>
              </div>
              <AgencyWaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* Why Agencies Section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Why Agencies Partner with O1DMatch</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            More clients are asking for O-1 talent. O1DMatch helps you serve this demand without
            building immigration expertise in-house.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Qualified Candidates</h3>
              <p className="text-gray-400 text-sm">
                Every candidate has AI-verified evidence for O-1 eligibility. No more guessing.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Faster Placements</h3>
              <p className="text-gray-400 text-sm">
                Match candidates to client requirements in minutes, not weeks.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">Grow Your Business</h3>
              <p className="text-gray-400 text-sm">
                Add O-1 placements to your services without additional overhead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 O1DMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
