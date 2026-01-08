'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';
import Navbar from "@/components/Navbar";
import { Check, Building2, User, Sparkles, ArrowRight } from 'lucide-react';

type ViewType = 'employers' | 'talent';

export default function PricingPage() {
  const [view, setView] = useState<ViewType>('employers');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const validatePromo = async () => {
    if (!promoCode.trim()) return;

    setValidatingPromo(true);
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          userType: view === 'employers' ? 'employer' : 'talent',
        }),
      });
      const data = await response.json();

      if (data.valid) {
        let message = 'Code applied! ';
        if (data.promo.trialDays) {
          message += `${data.promo.trialDays}-day free trial included.`;
        }
        if (data.promo.discountPercent) {
          message += `${data.promo.discountPercent}% discount applied.`;
        }
        if (data.promo.grantsIGTAMember) {
          message = 'Innovative Automations member code verified! You qualify for free full access.';
        }
        setPromoStatus({ valid: true, message });
      } else {
        setPromoStatus({ valid: false, message: data.error || 'Invalid code' });
      }
    } catch {
      setPromoStatus({ valid: false, message: 'Failed to validate code' });
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubscribe = async (tier: EmployerTier | TalentTier) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: view === 'employers' ? 'employer' : 'talent',
          tier,
          promoCode: promoStatus?.valid ? promoCode : undefined,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="pt-24" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView('employers')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${view === 'employers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Building2 className="w-4 h-4" />
              For Employers
            </button>
            <button
              onClick={() => setView('talent')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${view === 'talent'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <User className="w-4 h-4" />
              For Talent
            </button>
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Have a promo code?"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoStatus(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={validatePromo}
              disabled={validatingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validatingPromo ? 'Checking...' : 'Apply'}
            </button>
          </div>
          {promoStatus && (
            <p className={`mt-2 text-sm ${promoStatus.valid ? 'text-green-600' : 'text-red-600'}`}>
              {promoStatus.message}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        {view === 'employers' ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {(Object.entries(EMPLOYER_TIERS) as [EmployerTier, typeof EMPLOYER_TIERS[EmployerTier]][]).map(
              ([key, tier]) => (
                <div
                  key={key}
                  className={`relative bg-white rounded-2xl border-2 p-6 ${key === 'growth'
                      ? 'border-blue-600 shadow-xl scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {key === 'growth' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tier.name}</h3>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-gray-500">/mo</span>
                    {tier.setupFee > 0 && (
                      <p className="text-sm text-gray-500">+ ${tier.setupFee} one-time setup</p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {key === 'free' ? (
                    <Link
                      href="/auth/register?type=employer"
                      className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Get Started Free
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(key)}
                      className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${key === 'growth'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                      Subscribe <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {(Object.entries(TALENT_TIERS) as [TalentTier, typeof TALENT_TIERS[TalentTier]][]).map(
              ([key, tier]) => (
                <div
                  key={key}
                  className={`relative bg-white rounded-2xl border-2 p-6 ${key === 'active_match'
                      ? 'border-blue-600 shadow-xl scale-105'
                      : key === 'igta_member'
                        ? 'border-green-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {key === 'active_match' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Best Value
                      </span>
                    </div>
                  )}

                  {key === 'igta_member' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Clients
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tier.name}</h3>

                  <div className="mb-4">
                    {key === 'igta_member' ? (
                      <>
                        <span className="text-3xl font-bold text-green-600">FREE</span>
                        <p className="text-sm text-gray-500">For verified Innovative Automations clients</p>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                        <span className="text-gray-500">/mo</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {key === 'profile_only' ? (
                    <Link
                      href="/auth/register?type=talent"
                      className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Create Free Profile
                    </Link>
                  ) : key === 'igta_member' ? (
                    <Link
                      href="/auth/register?type=talent&igta=true"
                      className="block w-full text-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Verify Membership
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(key)}
                      className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${key === 'active_match'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                      Subscribe <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately, and we&apos;ll prorate your billing automatically.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What are interest letters?</h3>
              <p className="text-gray-600">
                Interest letters are messages employers send to O-1 visa candidates expressing
                interest in sponsoring them. They&apos;re a key part of the O-1 visa application process.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">I&apos;m an Innovative Automations client. How do I get free access?</h3>
              <p className="text-gray-600">
                If you&apos;re enrolled in an Innovative Automations visa program, you&apos;ll receive a verification code via
                email. Use this code during signup to unlock full access at no cost.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the one-time setup fee?</h3>
              <p className="text-gray-600">
                The setup fee covers account configuration, onboarding support, and profile
                optimization. Enterprise plans have no setup fee.
              </p>
            </div>
          </div>
        </div>
      </main>

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