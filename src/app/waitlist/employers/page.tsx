'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  FileCheck,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Mail,
  Briefcase,
  Globe,
  Clock,
  Shield,
  Star,
} from 'lucide-react';

export default function EmployerWaitlistPage() {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Save to Supabase waitlist table
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            You&apos;re on the list!
          </h1>
          <p className="text-blue-200 mb-8">
            We&apos;ll notify you at <span className="text-white font-medium">{email}</span> when
            O1DMatch launches for employers. Get ready to connect with extraordinary O-1 talent.
          </p>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8">
            <p className="text-sm text-blue-200 mb-2">Your position</p>
            <p className="text-4xl font-bold text-white mb-2">#47</p>
            <p className="text-sm text-blue-300">in the employer waitlist</p>
          </div>
          <Link
            href="/"
            className="text-blue-300 hover:text-white transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O1</span>
            </div>
            <span className="font-semibold text-white">O1DMatch</span>
          </Link>
          <Link
            href="/waitlist/talent"
            className="text-blue-300 hover:text-white text-sm transition-colors"
          >
            I&apos;m a talent →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Early Access for Employers
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Hire Extraordinary
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  O-1 Visa Talent
                </span>
              </h1>
              <p className="text-xl text-blue-200 mb-8">
                Join the waitlist to be among the first employers to access
                pre-qualified O-1 candidates with verified extraordinary abilities.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, text: 'Access pre-vetted O-1 ready candidates' },
                  { icon: FileCheck, text: 'Send USCIS-compliant interest letters instantly' },
                  { icon: Clock, text: 'Reduce hiring time by 60%' },
                  { icon: Shield, text: 'Verified profiles with AI-scored credentials' },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-blue-100">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 text-sm text-blue-300">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-900"
                    />
                  ))}
                </div>
                <span>127 employers already on the waitlist</span>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">
                  Early adopters get 3 months free
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Join the Employer Waitlist
              </h2>
              <p className="text-blue-200 mb-6">
                Be first to access O-1 talent when we launch.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-200 mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-blue-200 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-blue-200 mb-2">
                    Company Size
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <select
                      required
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="" className="bg-slate-800">Select size</option>
                      <option value="1-10" className="bg-slate-800">1-10 employees</option>
                      <option value="11-50" className="bg-slate-800">11-50 employees</option>
                      <option value="51-200" className="bg-slate-800">51-200 employees</option>
                      <option value="201-500" className="bg-slate-800">201-500 employees</option>
                      <option value="500+" className="bg-slate-800">500+ employees</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    'Joining...'
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-blue-300/60 mt-4 text-center">
                No spam. We&apos;ll only email you about launch updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            What You&apos;ll Get Access To
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Curated Talent Pool',
                description: 'Browse profiles of candidates who meet O-1 criteria with verified credentials.',
              },
              {
                icon: FileCheck,
                title: 'Instant Interest Letters',
                description: 'Generate USCIS-compliant interest letters with one click, ready for e-signature.',
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Connect with extraordinary talent from around the world seeking U.S. opportunities.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-blue-300 text-sm">
          <p>© 2025 O1DMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
