import { Metadata } from 'next';
import { Sparkles, Star, Users, Zap } from 'lucide-react';
import TalentWaitlistForm from '@/components/waitlist/TalentWaitlistForm';

export const metadata: Metadata = {
  title: 'Join the Waitlist | O-1 Talent | O1DMatch',
  description: 'Get early access to O1DMatch and connect with employers ready to sponsor O-1 visas. 50% off for early members.',
};

export default function TalentWaitlistPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="py-6 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm mb-6">
                  <Sparkles className="w-4 h-4" />
                  Early Access - 50% Off
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Your{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    extraordinary talent
                  </span>{' '}
                  deserves an extraordinary path
                </h1>

                {/* Subheadline */}
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  O1DMatch connects exceptional professionals with U.S. employers ready to sponsor O-1 visas.
                  Join the waitlist and be first to access our matching platform.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="text-3xl font-bold text-white">500+</div>
                    <div className="text-sm text-gray-500">Employers ready</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">8</div>
                    <div className="text-sm text-gray-500">O-1 criteria tracked</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">50%</div>
                    <div className="text-sm text-gray-500">Early access discount</div>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Join 2,000+ waiting</span>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
                  <p className="text-gray-400">Get early access and lock in 50% off</p>
                </div>
                <TalentWaitlistForm />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">What you&apos;ll get access to</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Profile Scoring</h3>
                <p className="text-gray-400 text-sm">
                  Upload your evidence and get an instant O-1 readiness score across all 8 criteria
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Employer Matching</h3>
                <p className="text-gray-400 text-sm">
                  Get matched with employers actively seeking O-1 talent in your field
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Interest Letters</h3>
                <p className="text-gray-400 text-sm">
                  Receive USCIS-compliant interest letters from interested employers
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
    </div>
  );
}
