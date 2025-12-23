'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Mail,
  User,
  Users,
  Globe,
  Award,
  Star,
  Gift,
  Shield,
  Zap,
  Crown,
  Lock,
} from 'lucide-react';

export default function TalentWaitlistPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [expertise, setExpertise] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasInvite, setHasInvite] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {hasInvite ? 'Welcome to the Beta!' : 'You\'re In!'}
          </h1>
          <p className="text-purple-200 mb-8">
            {hasInvite ? (
              <>
                Your beta access has been confirmed. Check your email at{' '}
                <span className="text-white font-medium">{email}</span> for your
                exclusive login credentials.
              </>
            ) : (
              <>
                We&apos;ll notify you at <span className="text-white font-medium">{email}</span> when
                a beta spot opens up. In the meantime, prepare your O-1 evidence!
              </>
            )}
          </p>

          {hasInvite ? (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur rounded-xl p-6 mb-8 border border-purple-500/30">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Beta Perks Unlocked</span>
              </div>
              <ul className="space-y-2 text-left text-purple-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Forever free access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Priority job matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Direct support from founders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Exclusive beta badge
                </li>
              </ul>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8">
              <p className="text-sm text-purple-200 mb-2">Your position</p>
              <p className="text-4xl font-bold text-white mb-2">#234</p>
              <p className="text-sm text-purple-300">in the talent waitlist</p>
            </div>
          )}

          <Link
            href="/"
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O1</span>
            </div>
            <span className="font-semibold text-white">O1DMatch</span>
          </Link>
          <Link
            href="/waitlist/employers"
            className="text-purple-300 hover:text-white text-sm transition-colors"
          >
            I&apos;m an employer →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium mb-6">
                <Crown className="w-4 h-4" />
                Exclusive Beta Program
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Be Among the First
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Extraordinary Talents
                </span>
              </h1>
              <p className="text-xl text-purple-200 mb-8">
                Join our exclusive beta program and get lifetime free access to O1DMatch.
                Help us build the future of O-1 visa matching.
              </p>

              {/* Beta Perks */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-8 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-semibold">Beta Tester Perks</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Star, text: 'Forever free access' },
                    { icon: Zap, text: 'Priority job matching' },
                    { icon: Shield, text: 'Founder support' },
                    { icon: Award, text: 'Exclusive beta badge' },
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <perk.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-100 text-sm">{perk.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <p className="text-2xl font-bold text-white">50</p>
                  <p className="text-purple-300">Beta spots left</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">234</p>
                  <p className="text-purple-300">On waitlist</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-purple-300">Countries</p>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              {/* Invite Code Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {hasInvite ? 'Redeem Your Invite' : 'Join the Waitlist'}
                </h2>
                <button
                  onClick={() => setHasInvite(!hasInvite)}
                  className="text-sm text-purple-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  {hasInvite ? 'No code?' : 'Have a code?'}
                </button>
              </div>

              {hasInvite && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-6 border border-purple-500/30">
                  <div className="flex items-center gap-2 text-purple-200 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Enter your invite code for instant beta access</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {hasInvite && (
                  <div>
                    <label className="block text-sm text-purple-200 mb-2">
                      Invite Code
                    </label>
                    <div className="relative">
                      <Crown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <input
                        type="text"
                        required={hasInvite}
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="BETA-XXXX-XXXX"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase tracking-wider"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-purple-200 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-purple-200 mb-2">
                      Expertise
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <select
                        required
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      >
                        <option value="" className="bg-slate-800">Select</option>
                        <option value="tech" className="bg-slate-800">Tech/Engineering</option>
                        <option value="science" className="bg-slate-800">Sciences</option>
                        <option value="arts" className="bg-slate-800">Arts/Entertainment</option>
                        <option value="business" className="bg-slate-800">Business</option>
                        <option value="athletics" className="bg-slate-800">Athletics</option>
                        <option value="other" className="bg-slate-800">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    'Processing...'
                  ) : hasInvite ? (
                    <>
                      Activate Beta Access
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-purple-300/60 mt-4 text-center">
                {hasInvite
                  ? 'Your invite was sent by someone who believes in your extraordinary abilities.'
                  : 'We\'ll notify you when a beta spot opens up.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is O-1 */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Perfect for O-1 Visa Candidates
          </h2>
          <p className="text-purple-200 text-center mb-12 max-w-2xl mx-auto">
            The O-1 visa is for individuals with extraordinary ability. If you have
            achievements in your field, O1DMatch helps you connect with U.S. employers.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Awards', desc: 'National or international prizes' },
              { icon: Users, title: 'Memberships', desc: 'Elite professional associations' },
              { icon: Globe, title: 'Publications', desc: 'Media coverage of your work' },
              { icon: Star, title: 'High Salary', desc: 'Above-market compensation' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-purple-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-purple-300 text-sm">
          <p>© 2025 O1DMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
