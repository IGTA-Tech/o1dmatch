'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';
import Navbar from "@/components/Navbar";
import { Check, Building2, User, Sparkles, ArrowRight, X, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';
import { useO1DAnimations } from '@/hooks/useO1DAnimations';
import '@/app/theme.css';

type ViewType = 'employers' | 'talent';

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
    { text: 'Create & complete profile', included: true },
    { text: 'Employers can find & browse you', included: true },
    { text: 'O-1 Score (basic only)', included: true },
    { text: 'Upload evidence/documents', included: true },
    { text: 'Browse jobs (titles only)', included: true },
    { text: 'Receive interest letters (notification only)', included: true },
    { text: 'Express interest / Apply to jobs', included: false },
    { text: 'Immigration tools (VisaClear)', included: false },
    { text: 'Dedicated account manager', included: false },
  ],
  starter: [
    { text: 'Create & complete profile', included: true },
    { text: 'Employers can find & browse you', included: true },
    { text: 'Full O-1 Score breakdown + recommendations', included: true },
    { text: 'Upload evidence/documents', included: true },
    { text: 'Browse jobs (full details)', included: true },
    { text: 'View & respond to interest letters', included: true },
    { text: 'Express interest / Apply to jobs', included: true },
    { text: 'Immigration tools (VisaClear)', included: true },
    { text: 'Dedicated account manager', included: false },
  ],
  active_match: [
    { text: 'Create & complete profile', included: true },
    { text: 'Priority visibility for employers', included: true },
    { text: 'Full O-1 Score + Manager review', included: true },
    { text: 'Upload evidence/documents + Manager helps', included: true },
    { text: 'Browse jobs (full details)', included: true },
    { text: 'Interest letters handled by Manager', included: true },
    { text: 'Express interest / Apply + Manager assists', included: true },
    { text: 'Immigration tools (VisaClear)', included: true },
    { text: 'Dedicated account manager', included: true },
  ],
};

const FAQ_ITEMS = [
  {
    q: 'Can I change my plan later?',
    a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing automatically.",
  },
  {
    q: 'What are interest letters?',
    a: "Interest letters are messages employers send to O-1 visa candidates expressing interest in sponsoring them. They're a key part of the O-1 visa application process.",
  },
  {
    q: 'What does the dedicated account manager do?',
    a: 'With the Active Match plan ($500/mo), your dedicated account manager helps review your O-1 evidence, assists with job applications, handles interest letter responses, and provides personalized guidance throughout your visa journey.',
  },
  {
    q: 'Do you offer refunds?',
    a: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with your plan, contact our support team within 14 days of purchase for a full refund.",
  },
];

function PricingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewType>('employers');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{
    valid: boolean;
    message: string;
    promo?: { type: string; trialDays?: number; discountPercent?: number; grantsIGTAMember?: boolean };
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'canceled'; message: string } | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const authData = getSupabaseAuthData();
    if (authData?.user?.id) setUserId(authData.user.id);
  }, []);

  useEffect(() => {
    const canceled = searchParams.get('canceled');
    const success = searchParams.get('success');
    const promoApplied = searchParams.get('promo_applied');

    if (promoApplied === 'true') {
      setStatusMessage({ type: 'success', message: 'Promo code applied! Your plan has been upgraded.' });
      router.replace('/pricing', { scroll: false });
    } else if (canceled === 'true') {
      setStatusMessage({ type: 'canceled', message: "Payment was canceled. You can try again when you're ready." });
      router.replace('/pricing', { scroll: false });
    } else if (success === 'true') {
      setStatusMessage({ type: 'success', message: 'Payment successful! Your subscription is now active.' });
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
          userId: userId || undefined,
        }),
      });
      const data = await response.json();
      if (data.valid) {
        let message = 'Code applied! ';
        if (data.promo.trialDays) message += `${data.promo.trialDays}-day free trial included.`;
        if (data.promo.discountPercent) message += `${data.promo.discountPercent}% discount applied.`;
        if (data.promo.grantsIGTAMember) message = 'Innovative Automations member code verified! You qualify for free full access.';
        setPromoStatus({ valid: true, message, promo: data.promo });
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
    setSubscribing(tier);
    const userType = view === 'employers' ? 'employer' : 'talent';
    try {
      const promoType = promoStatus?.valid ? promoStatus.promo?.type : null;
      if (promoType === 'trial' || promoType === 'free_upgrade') {
        if (!userId) { router.push(`/login?redirect=/pricing&type=${userType}`); return; }
        const response = await fetch('/api/promo/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: promoCode, userType, tier, userId }),
        });
        if (response.status === 401) { router.push(`/login?redirect=/pricing&type=${userType}`); return; }
        const data = await response.json();
        if (data.success) {
          window.location.href = userType === 'employer'
            ? '/dashboard/employer/billing?promo_applied=true'
            : '/dashboard/talent/billing?promo_applied=true';
          return;
        } else {
          alert(data.error || 'Failed to apply promo code');
          setSubscribing(null);
          return;
        }
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, tier, promoCode: promoStatus?.valid ? promoCode : undefined }),
      });
      if (response.status === 401) { router.push(`/login?redirect=/pricing&type=${userType}`); return; }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        if (
          data.error === 'Unauthorized' ||
          data.error.toLowerCase().includes('unauthorized') ||
          data.error.toLowerCase().includes('not logged in') ||
          data.error.toLowerCase().includes('login required')
        ) {
          router.push(`/login?redirect=/pricing&type=${userType}`);
        } else {
          alert(data.error);
          setSubscribing(null);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setSubscribing(null);
    }
  };

  useO1DAnimations();

  const employerFeatured = 'growth';
  const talentFeatured   = 'starter';

  function PriceDisplay({ tierPrice, setupFee }: { tierPrice: number; setupFee: number }) {
    if (promoStatus?.valid && promoStatus.promo?.discountPercent && tierPrice > 0) {
      return (
        <>
          <div className="o1d-price-amount">
            <span className="o1d-price-currency-green">$</span>
            <span className="o1d-price-num o1d-price-discount-num">
              {Math.round(tierPrice * (1 - promoStatus.promo.discountPercent / 100))}
            </span>
            <span className="o1d-price-per">/mo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
            <span className="o1d-price-strike">${tierPrice}/mo</span>
            <span className="o1d-price-off-badge">{promoStatus.promo.discountPercent}% OFF</span>
          </div>
        </>
      );
    }
    return (
      <div className="o1d-price-amount">
        <span className="o1d-price-currency">$</span>
        <span className="o1d-price-num">{tierPrice}</span>
        <span className="o1d-price-per">/mo</span>
        {setupFee > 0 && <span className="o1d-price-setup" style={{ marginLeft: '0.5rem' }}>+${setupFee} setup</span>}
      </div>
    );
  }

  function PromoExtras({ tierPrice }: { tierPrice: number }) {
    if (!promoStatus?.valid || tierPrice === 0) return null;
    return (
      <>
        {promoStatus.promo?.trialDays && (
          <p className="o1d-price-trial">{promoStatus.promo.trialDays}-day free trial</p>
        )}
        {(promoStatus.promo?.type === 'trial' || promoStatus.promo?.type === 'free_upgrade') && (
          <p className="o1d-price-free-note"><CheckCircle size={11} /> No payment required</p>
        )}
      </>
    );
  }

  function SubscribeBtn({ tierKey, isFeatured }: { tierKey: string; isFeatured: boolean }) {
    const label = promoStatus?.valid && (promoStatus.promo?.type === 'trial' || promoStatus.promo?.type === 'free_upgrade')
      ? (promoStatus.promo?.type === 'trial' ? 'Start Free Trial' : 'Apply Promo')
      : 'Subscribe';
    return (
      <button
        onClick={() => handleSubscribe(tierKey as EmployerTier | TalentTier)}
        disabled={subscribing !== null}
        className={isFeatured ? 'o1d-price-btn-featured' : 'o1d-price-btn-default'}
      >
        {subscribing === tierKey
          ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
          : <>{label} <ArrowRight size={14} /></>}
      </button>
    );
  }

  function FeatureList({ features }: { features: { text: string; included: boolean }[] }) {
    return (
      <ul className="o1d-feature-list">
        {features.map((f, i) => (
          <li key={i} className="o1d-feature-item">
            <div className={`o1d-feature-check ${f.included ? 'o1d-feature-check-yes' : 'o1d-feature-check-no'}`}>
              {f.included ? <Check size={10} color="#10B981" /> : <X size={10} color="#94A3B8" />}
            </div>
            <span className={f.included ? 'o1d-feature-text-yes' : 'o1d-feature-text-no'}>{f.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="o1d-page" style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── Navy hero / controls ── */}
      <div className="o1d-pricing-hero">
        <div className="o1d-pricing-hero-glow" />
        <div className="o1d-pricing-hero-inner">

          <div className="o1d-hero-badge" style={{ marginBottom: '1.25rem' }}>
            <span className="o1d-pulse-dot" />
            <span>Transparent Pricing</span>
          </div>

          <h1 className="o1d-hero-h1" style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>
            Simple, <em>Transparent</em> Pricing
          </h1>
          <p className="o1d-hero-sub o1d-hero-sub-center" style={{ marginBottom: '2.5rem' }}>
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {/* Status banner */}
          {statusMessage && (
            <div style={{ maxWidth: 560, margin: '0 auto 1.5rem' }}>
              <div className={statusMessage.type === 'success' ? 'o1d-status-success' : 'o1d-status-canceled'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {statusMessage.type === 'success'
                    ? <CheckCircle size={17} color="#10B981" />
                    : <XCircle size={17} color="#D4A84B" />}
                  <span className={statusMessage.type === 'success' ? 'o1d-status-text-success' : 'o1d-status-text-canceled'}>
                    {statusMessage.message}
                  </span>
                </div>
                <button className="o1d-status-close" onClick={() => setStatusMessage(null)}>
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="o1d-toggle-wrap">
              <button
                onClick={() => setView('employers')}
                className={`o1d-toggle-btn ${view === 'employers' ? 'o1d-toggle-btn-active' : 'o1d-toggle-btn-inactive'}`}
              >
                <Building2 size={15} /> For Employers
              </button>
              <button
                onClick={() => setView('talent')}
                className={`o1d-toggle-btn ${view === 'talent' ? 'o1d-toggle-btn-active' : 'o1d-toggle-btn-inactive'}`}
              >
                <User size={15} /> For Talent
              </button>
            </div>
          </div>

          {/* Promo */}
          <div className="o1d-promo-bar">
            <input
              type="text"
              placeholder="Have a promo code?"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); setPromoStatus(null); }}
              className="o1d-promo-input"
            />
            <button onClick={validatePromo} disabled={validatingPromo || !promoCode.trim()} className="o1d-promo-apply">
              {validatingPromo ? 'Checking…' : 'Apply'}
            </button>
          </div>
          {promoStatus && (
            <p style={{ textAlign: 'center', fontSize: '0.82rem', paddingBottom: '1.25rem', color: promoStatus.valid ? '#10B981' : '#F87171' }}>
              {promoStatus.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="o1d-pricing-body">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {view === 'employers' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
              {(Object.entries(EMPLOYER_TIERS) as [EmployerTier, typeof EMPLOYER_TIERS[EmployerTier]][]).map(([key, tier]) => {
                const isFeatured = key === employerFeatured;
                const isFree = key === 'free';
                const features = EMPLOYER_FEATURES[key as keyof typeof EMPLOYER_FEATURES];
                return (
                  <div key={key} className={`o1d-price-card${isFeatured ? ' o1d-price-card-featured' : ''}`}>
                    {isFeatured && <div className="o1d-popular-badge"><Sparkles size={10} /> Popular</div>}
                    <div className="o1d-price-header" style={{ paddingTop: isFeatured ? '2.25rem' : undefined }}>
                      <p className="o1d-price-name">{tier.name}</p>
                      <PriceDisplay tierPrice={tier.price} setupFee={tier.setupFee} />
                      <PromoExtras tierPrice={tier.price} />
                    </div>
                    <div className="o1d-price-divider" />
                    <div className="o1d-price-features">
                      <p className="o1d-features-label">What&apos;s included</p>
                      <FeatureList features={features} />
                    </div>
                    <div className="o1d-price-btn-wrap">
                      {isFree
                        ? <Link href="/signup?type=employer" className="o1d-price-btn-free">Get Started Free</Link>
                        : <SubscribeBtn tierKey={key} isFeatured={isFeatured} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'talent' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', maxWidth: 900, margin: '0 auto' }}>
              {(Object.entries(TALENT_TIERS) as [TalentTier, typeof TALENT_TIERS[TalentTier]][]).map(([key, tier]) => {
                const isFeatured = key === talentFeatured;
                const isFree = key === 'profile_only';
                const features = TALENT_FEATURES[key as keyof typeof TALENT_FEATURES];
                return (
                  <div key={key} className={`o1d-price-card${isFeatured ? ' o1d-price-card-featured' : ''}`}>
                    {isFeatured && <div className="o1d-popular-badge"><Sparkles size={10} /> Most Popular</div>}
                    <div className="o1d-price-header" style={{ paddingTop: isFeatured ? '2.25rem' : undefined }}>
                      <p className="o1d-price-name">{tier.name}</p>
                      <PriceDisplay tierPrice={tier.price} setupFee={(tier as { setupFee?: number }).setupFee ?? 0} />
                      <PromoExtras tierPrice={tier.price} />
                    </div>
                    <div className="o1d-price-divider" />
                    <div className="o1d-price-features">
                      <p className="o1d-features-label">What&apos;s included</p>
                      <FeatureList features={features} />
                    </div>
                    <div className="o1d-price-btn-wrap">
                      {isFree
                        ? <Link href="/signup?type=talent" className="o1d-price-btn-free">Create Free Profile</Link>
                        : <SubscribeBtn tierKey={key} isFeatured={isFeatured} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="o1d-pricing-note" style={{ marginTop: '2.5rem' }}>
            All plans include secure data encryption, 99.9% uptime SLA, and access to our knowledge base.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '4.5rem auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="o1d-section-tag">Got questions?</span>
            <h2 className="o1d-section-title" style={{ color: '#0B1D35', marginTop: '0.5rem' }}>Frequently Asked Questions</h2>
          </div>
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} className="o1d-faq-card">
              <p className="o1d-faq-q">{q}</p>
              <p className="o1d-faq-a">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="o1d-footer">
        <div className="o1d-footer-inner">
          <div className="o1d-footer-grid">
            <div>
              <span className="o1d-footer-logo">O1DMatch</span>
              <p className="o1d-footer-tagline">
                Connecting exceptional talent with opportunities for O-1 visa sponsorship.
              </p>
            </div>
            <div className="o1d-footer-col">
              <h4>Platform</h4>
              <Link href="/how-it-works/candidates">For Candidates</Link>
              <Link href="/how-it-works/employers">For Employers</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div className="o1d-footer-col">
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>
            <div className="o1d-footer-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="o1d-footer-bottom">
            <span>© {new Date().getFullYear()} O1DMatch. All rights reserved.</span>
            <span>Built by a licensed immigration attorney.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="o1d-page" style={{ minHeight: '100vh' }}>
        <Navbar />
        <div className="o1d-loading-wrap"><div className="o1d-spinner" /></div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}