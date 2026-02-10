'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';
import Navbar from "@/components/Navbar";
import { Check, Building2, User, Sparkles, ArrowRight, X, XCircle, CheckCircle } from 'lucide-react';

type ViewType = 'employers' | 'talent';

// Features with included status for each tier
const EMPLOYER_FEATURES = {
  free: [
    { text: 'Browse talent profiles', included: true },
    { text: 'View O-1 scores', included: true },
    { text: 'Basic search filters', included: true },
    { text: '2 active job postings', included: true },
    { text: '5 interest letters/month', included: true },
    { text: 'Priority support', included: false },
    { text: 'Analytics dashboard', included: false },
    { text: 'API access', included: false },
  ],
  starter: [
    { text: 'Browse talent profiles', included: true },
    { text: 'View O-1 scores', included: true },
    { text: 'Advanced search filters', included: true },
    { text: '5 active job postings', included: true },
    { text: '15 interest letters/month', included: true },
    { text: 'Priority listing', included: true },
    { text: 'Analytics dashboard', included: false },
    { text: 'API access', included: false },
  ],
  growth: [
    { text: 'Browse talent profiles', included: true },
    { text: 'View O-1 scores', included: true },
    { text: 'Advanced search filters', included: true },
    { text: '15 active job postings', included: true },
    { text: '40 interest letters/month', included: true },
    { text: 'Featured employer badge', included: true },
    { text: 'Analytics dashboard', included: true },
    { text: 'API access', included: false },
  ],
  business: [
    { text: 'Browse talent profiles', included: true },
    { text: 'View O-1 scores', included: true },
    { text: 'Advanced search filters', included: true },
    { text: '50 active job postings', included: true },
    { text: '100 interest letters/month', included: true },
    { text: 'Dedicated account manager', included: true },
    { text: 'Analytics dashboard', included: true },
    { text: 'API access', included: true },
  ],
  enterprise: [
    { text: 'Browse talent profiles', included: true },
    { text: 'View O-1 scores', included: true },
    { text: 'Advanced search filters', included: true },
    { text: 'Unlimited job postings', included: true },
    { text: 'Unlimited interest letters', included: true },
    { text: 'Dedicated success manager', included: true },
    { text: 'Analytics dashboard', included: true },
    { text: 'API access', included: true },
  ],
};

const TALENT_FEATURES = {
  profile_only: [
    { text: 'Create & maintain profile', included: true },
    { text: 'Upload evidence documents', included: true },
    { text: 'AI O-1 score assessment', included: true },
    { text: 'Browse job listings', included: true },
    { text: 'Receive interest letters', included: false },
    { text: 'Apply to job postings', included: false },
    { text: 'Priority visibility', included: false },
    { text: 'Dedicated matching specialist', included: false },
  ],
  starter: [
    { text: 'Create & maintain profile', included: true },
    { text: 'Upload evidence documents', included: true },
    { text: 'AI O-1 score assessment', included: true },
    { text: 'Browse job listings', included: true },
    { text: 'Receive interest letters', included: true },
    { text: 'Apply to job postings', included: true },
    { text: 'Priority visibility', included: false },
    { text: 'Dedicated matching specialist', included: false },
  ],
  active_match: [
    { text: 'Create & maintain profile', included: true },
    { text: 'Upload evidence documents', included: true },
    { text: 'AI O-1 score assessment', included: true },
    { text: 'Browse job listings', included: true },
    { text: 'Receive interest letters', included: true },
    { text: 'Apply to job postings', included: true },
    { text: 'Priority visibility', included: true },
    { text: 'Dedicated matching specialist', included: true },
  ],
  igta_member: [
    { text: 'Create & maintain profile', included: true },
    { text: 'Upload evidence documents', included: true },
    { text: 'AI O-1 score assessment', included: true },
    { text: 'Browse job listings', included: true },
    { text: 'Receive interest letters', included: true },
    { text: 'Apply to job postings', included: true },
    { text: 'Priority visibility', included: true },
    { text: 'Dedicated matching specialist', included: true },
  ],
};

function PricingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewType>('employers');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'canceled'; message: string } | null>(null);

  // Handle success/canceled query params
  useEffect(() => {
    const canceled = searchParams.get('canceled');
    const success = searchParams.get('success');

    if (canceled === 'true') {
      setStatusMessage({
        type: 'canceled',
        message: 'Payment was canceled. You can try again when you\'re ready.',
      });
      // Clean up URL
      router.replace('/pricing', { scroll: false });
    } else if (success === 'true') {
      setStatusMessage({
        type: 'success',
        message: 'Payment successful! Your subscription is now active.',
      });
      // Clean up URL
      router.replace('/pricing', { scroll: false });
    }
  }, [searchParams, router]);

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

      // Check for unauthorized (401) - redirect to login
      if (response.status === 401) {
        const userType = view === 'employers' ? 'employer' : 'talent';
        router.push(`/login?redirect=/pricing&type=${userType}`);
        return;
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        // Check if error message indicates unauthorized
        if (data.error === 'Unauthorized' || data.error.toLowerCase().includes('unauthorized') || data.error.toLowerCase().includes('not logged in') || data.error.toLowerCase().includes('login required')) {
          const userType = view === 'employers' ? 'employer' : 'talent';
          router.push(`/login?redirect=/pricing&type=${userType}`);
        } else {
          alert(data.error);
        }
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

      {/* Status Message Banner */}
      {statusMessage && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              statusMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <span className="font-medium">{statusMessage.message}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className={`p-1 rounded-lg transition-colors ${
                statusMessage.type === 'success'
                  ? 'hover:bg-green-100'
                  : 'hover:bg-amber-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setView('employers')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all ${
                view === 'employers'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              For Employers
            </button>
            <button
              onClick={() => setView('talent')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all ${
                view === 'talent'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={validatePromo}
              disabled={validatingPromo || !promoCode.trim()}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5">
            {(Object.entries(EMPLOYER_TIERS) as [EmployerTier, typeof EMPLOYER_TIERS[EmployerTier]][]).map(
              ([key, tier]) => {
                const features = EMPLOYER_FEATURES[key as keyof typeof EMPLOYER_FEATURES];
                return (
                  <div
                    key={key}
                    className={`relative flex flex-col bg-white rounded-2xl border-2 transition-all duration-200 ${
                      key === 'growth'
                        ? 'border-blue-600 shadow-xl shadow-blue-100 scale-[1.02] z-10'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Popular Badge */}
                    {key === 'growth' && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-3.5 h-3.5" /> Popular
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={`p-6 ${key === 'growth' ? 'pt-8' : ''}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline">
                          <span className="text-lg text-gray-500">$</span>
                          <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                          <span className="text-gray-500 ml-1">/mo</span>
                        </div>
                        {tier.setupFee > 0 && (
                          <p className="text-sm text-gray-500 mt-1">+ ${tier.setupFee} one-time setup</p>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="px-6">
                      <div className="border-t border-gray-100" />
                    </div>

                    {/* Features List */}
                    <div className="p-6 pt-4 flex-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        What&apos;s included
                      </p>
                      <ul className="space-y-3">
                        {features?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {feature.included ? (
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button at Bottom */}
                    <div className="p-6 pt-0">
                      {key === 'free' ? (
                        <Link
                          href="/signup?type=employer"
                          className="block w-full text-center py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all"
                        >
                          Get Started Free
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(key)}
                          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                            key === 'growth'
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          Subscribe <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
            {(Object.entries(TALENT_TIERS) as [TalentTier, typeof TALENT_TIERS[TalentTier]][]).map(
              ([key, tier]) => {
                const features = TALENT_FEATURES[key as keyof typeof TALENT_FEATURES];
                return (
                  <div
                    key={key}
                    className={`relative flex flex-col bg-white rounded-2xl border-2 transition-all duration-200 ${
                      key === 'active_match'
                        ? 'border-blue-600 shadow-xl shadow-blue-100 scale-[1.02] z-10'
                        : key === 'igta_member'
                        ? 'border-green-500 shadow-lg shadow-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Best Value Badge */}
                    {key === 'active_match' && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-3.5 h-3.5" /> Best Value
                        </span>
                      </div>
                    )}

                    {/* IGTA Badge */}
                    {key === 'igta_member' && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          ✨ Our Clients
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={`p-6 ${key === 'active_match' || key === 'igta_member' ? 'pt-8' : ''}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

                      {/* Price */}
                      <div className="mb-4">
                        {key === 'igta_member' ? (
                          <>
                            <span className="text-4xl font-bold text-green-600">FREE</span>
                            <p className="text-sm text-gray-500 mt-1">For verified Innovative Automations clients</p>
                          </>
                        ) : (
                          <div className="flex items-baseline">
                            <span className="text-lg text-gray-500">$</span>
                            <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                            <span className="text-gray-500 ml-1">/mo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="px-6">
                      <div className="border-t border-gray-100" />
                    </div>

                    {/* Features List */}
                    <div className="p-6 pt-4 flex-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        What&apos;s included
                      </p>
                      <ul className="space-y-3">
                        {features?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {feature.included ? (
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button at Bottom */}
                    <div className="p-6 pt-0">
                      {key === 'profile_only' ? (
                        <Link
                          href="/signup?type=talent"
                          className="block w-full text-center py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all"
                        >
                          Create Free Profile
                        </Link>
                      ) : key === 'igta_member' ? (
                        <Link
                          href="/signup?type=talent&igta=true"
                          className="block w-full text-center py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold shadow-md shadow-green-200 transition-all"
                        >
                          Verify Membership
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(key)}
                          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                            key === 'active_match'
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          Subscribe <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Comparison Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            All plans include secure data encryption, 99.9% uptime SLA, and access to our knowledge base.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately, and we&apos;ll prorate your billing automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What are interest letters?</h3>
              <p className="text-gray-600">
                Interest letters are messages employers send to O-1 visa candidates expressing
                interest in sponsoring them. They&apos;re a key part of the O-1 visa application process.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">I&apos;m an Innovative Automations client. How do I get free access?</h3>
              <p className="text-gray-600">
                If you&apos;re enrolled in an Innovative Global Talent Agency visa program, you&apos;ll receive a verification code via
                email. Use this code during signup to unlock full access at no cost.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day money-back guarantee. If you&apos;re not satisfied with your plan,
                contact our support team within 14 days of purchase for a full refund.
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

// Wrap in Suspense for useSearchParams
export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="pt-24" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}