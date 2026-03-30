'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';
import { Check, Building2, User, Sparkles, ArrowRight, X, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useO1DAnimations } from '@/hooks/useO1DAnimations';
import '@/app/theme.css';
import Footer from "@/components/Footer";

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
    a: "Interest letters are messages employers send to O-1 visa candidates expressing interest in sponsoring them. They're a key part of the O-1 visa interest inquiry process.",
  },
  {
    q: 'What does the dedicated account manager do?',
    a: 'With the Active Match plan ($500/mo), your dedicated account manager helps review your O-1 evidence, assists with job interest inquirys, handles interest letter responses, and provides personalized guidance throughout your visa journey.',
  },
  {
    q: 'Do you offer refunds?',
    a: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with your plan, contact our support team within 14 days of purchase for a full refund.",
  },
];

function PricingPageContent({ initialUserId, initialRole }: {
  initialUserId: string | null;
  initialRole: 'employer' | 'talent' | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewType>(
    // initialRole locks the default view server-side
    initialRole === 'talent' ? 'talent' : 'employers'
  );

  // Locked setter — ignores changes when the user has a known role
  const setViewSafe = (v: ViewType) => {
    if (!userRole) setView(v);
  };
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{
    valid: boolean;
    message: string;
    promo?: {
      type: string;
      trialDays?: number;
      discountPercent?: number;
      grantsIGTAMember?: boolean;
      applicableTiers?: string[]; // empty = applies to all plans
    };
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'canceled'; message: string } | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(initialUserId);
  const [userRole, setUserRole] = useState<'employer' | 'talent' | null>(initialRole);

  useEffect(() => {
    // If server already provided the role, just set the view and stop
    if (initialRole) {
      if (initialRole === 'employer') setView('employers');
      else if (initialRole === 'talent') setView('talent');
      return;
    }

    // Fallback: use Supabase browser client (reliable, works with HttpOnly cookies)
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      setUserId(session.user.id);
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }: { data: { role: string } | null }) => {
          if (data?.role === 'employer') { setUserRole('employer'); setView('employers'); }
          else if (data?.role === 'talent') { setUserRole('talent'); setView('talent'); }
        });
    });
  }, [initialRole]);

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
        const applicableTiers: string[] = data.promo.applicableTiers ?? [];
        if (applicableTiers.length > 0) {
          message += ` Applies to: ${applicableTiers.join(', ')}.`;
        }
        setPromoStatus({ valid: true, message, promo: { ...data.promo, applicableTiers } });
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

  /** Returns true if the active promo applies to this plan key.
   *  Empty applicableTiers means the promo applies to ALL plans. */
  function promoAppliesToTier(tierKey: string): boolean {
    if (!promoStatus?.valid) return true;
    const tiers = promoStatus.promo?.applicableTiers ?? [];
    return tiers.length === 0 || tiers.includes(tierKey);
  }

  function PriceDisplay({ tierPrice, setupFee, tierKey }: { tierPrice: number; setupFee: number; tierKey: string }) {
    const eligible = promoAppliesToTier(tierKey);
    if (promoStatus?.valid && eligible && promoStatus.promo?.discountPercent && tierPrice > 0) {
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

  function PromoExtras({ tierPrice, tierKey }: { tierPrice: number; tierKey: string }) {
    if (!promoStatus?.valid || tierPrice === 0) return null;
    const eligible = promoAppliesToTier(tierKey);
    if (!eligible) return (
      <p style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        ✕ Promo not valid for this plan
      </p>
    );
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
    const promoActive  = promoStatus?.valid ?? false;
    const eligible     = promoAppliesToTier(tierKey);
    const promoMismatch = promoActive && !eligible;

    const label = promoActive && eligible && (promoStatus?.promo?.type === 'trial' || promoStatus?.promo?.type === 'free_upgrade')
      ? (promoStatus.promo?.type === 'trial' ? 'Start Free Trial' : 'Apply Promo')
      : 'Subscribe';

    if (promoMismatch) {
      return (
        <button
          disabled
          title="This promo code does not apply to this plan"
          style={{
            width: '100%', padding: '0.6rem 1rem', borderRadius: 8, fontSize: '0.82rem',
            fontWeight: 600, cursor: 'not-allowed', opacity: 0.55,
            background: 'transparent', border: '1.5px solid #CBD5E1', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}
        >
          ✕ Not Eligible for Promo
        </button>
      );
    }

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

          {/* Toggle — only shown when user has no locked role */}
          {!userRole && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="o1d-toggle-wrap">
              <button
                onClick={() => setViewSafe('employers')}
                className={`o1d-toggle-btn ${view === 'employers' ? 'o1d-toggle-btn-active' : 'o1d-toggle-btn-inactive'}`}
              >
                <Building2 size={15} /> For Employers
              </button>
              <button
                onClick={() => setViewSafe('talent')}
                className={`o1d-toggle-btn ${view === 'talent' ? 'o1d-toggle-btn-active' : 'o1d-toggle-btn-inactive'}`}
              >
                <User size={15} /> For Talent
              </button>
            </div>
          </div>
          )}
          {/* Role-locked label shown instead of toggle */}
          {userRole && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 1.1rem', borderRadius: 100,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)',
            }}>
              {userRole === 'employer' ? <><Building2 size={13} /> Employer Plans</> : <><User size={13} /> Talent Plans</>}
            </div>
          </div>
          )}

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
                const isFeatured    = key === employerFeatured;
                const isFree        = key === 'free';
                const features      = EMPLOYER_FEATURES[key as keyof typeof EMPLOYER_FEATURES];
                const promoMismatch = (promoStatus?.valid ?? false) && !promoAppliesToTier(key) && !isFree;
                return (
                  <div
                    key={key}
                    className={`o1d-price-card${isFeatured ? ' o1d-price-card-featured' : ''}`}
                    style={{ opacity: promoMismatch ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    {isFeatured && <div className="o1d-popular-badge"><Sparkles size={10} /> Popular</div>}
                    <div className="o1d-price-header" style={{ paddingTop: isFeatured ? '2.25rem' : undefined }}>
                      <p className="o1d-price-name">{tier.name}</p>
                      <PriceDisplay tierPrice={tier.price} setupFee={tier.setupFee} tierKey={key} />
                      <PromoExtras tierPrice={tier.price} tierKey={key} />
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
                const isFeatured    = key === talentFeatured;
                const isFree        = key === 'profile_only';
                const features      = TALENT_FEATURES[key as keyof typeof TALENT_FEATURES];
                const promoMismatch = (promoStatus?.valid ?? false) && !promoAppliesToTier(key) && !isFree;
                return (
                  <div
                    key={key}
                    className={`o1d-price-card${isFeatured ? ' o1d-price-card-featured' : ''}`}
                    style={{ opacity: promoMismatch ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    {isFeatured && <div className="o1d-popular-badge"><Sparkles size={10} /> Most Popular</div>}
                    <div className="o1d-price-header" style={{ paddingTop: isFeatured ? '2.25rem' : undefined }}>
                      <p className="o1d-price-name">{tier.name}</p>
                      <PriceDisplay tierPrice={tier.price} setupFee={(tier as { setupFee?: number }).setupFee ?? 0} tierKey={key} />
                      <PromoExtras tierPrice={tier.price} tierKey={key} />
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

        {/* Payment Methods */}
        <div style={{ maxWidth: 680, margin: '3rem auto 0', padding: '0 1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#D4A84B', marginBottom: '1rem' }}>
            Accepted Payment Methods
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Visa */}
              <svg width="56" height="36" viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
                <rect width="56" height="36" rx="4" fill="#1A1F71"/>
                <text x="28" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">VISA</text>
              </svg>
              {/* Mastercard */}
              <svg width="56" height="36" viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
                <rect width="56" height="36" rx="4" fill="#252525"/>
                <circle cx="22" cy="18" r="9" fill="#EB001B"/>
                <circle cx="34" cy="18" r="9" fill="#F79E1B"/>
                <path d="M28 10.6a9 9 0 010 14.8 9 9 0 000-14.8z" fill="#FF5F00"/>
              </svg>
              {/* Amex */}
              <svg width="56" height="36" viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="American Express">
                <rect width="56" height="36" rx="4" fill="#006FCF"/>
                <text x="28" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
              </svg>
              {/* Lock + Stripe */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Secured by Stripe</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.6', maxWidth: '480px' }}>
              Secure payments powered by Stripe. We accept Visa, Mastercard, and American Express. All transactions are encrypted and PCI-compliant.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export function PricingPage({ initialUserId, initialRole }: {
  initialUserId: string | null;
  initialRole: 'employer' | 'talent' | null;
}) {
  return (
    <Suspense fallback={
      <div className="o1d-page" style={{ minHeight: '100vh' }}>
        <div className="o1d-loading-wrap"><div className="o1d-spinner" /></div>
      </div>
    }>
      <PricingPageContent initialUserId={initialUserId} initialRole={initialRole} />
    </Suspense>
  );
}