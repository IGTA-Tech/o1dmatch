/* src/app/enterprise/tier/page.tsx */
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { TIERS, TierKey } from '@/lib/tiers';
import { Check, X, ArrowRight, Building2, Users, Scale, Sparkles, Star, Mail } from 'lucide-react';
import '@/app/theme.css';
import PlanCTAButton from './PlanCTAButton';

export const metadata = {
  title: 'My Enterprise Plan | O1DMatch',
  description: 'Your assigned O1DMatch enterprise plan and included features.',
};

/* ─────────────────────────────────────────────────────────
   Stripe Price IDs per tier — set in .env
───────────────────────────────────────────────────────── */
const TIER_PRICE_IDS: Partial<Record<TierKey, string>> = {
  managed_enterprise:  process.env.STRIPE_PRICE_ENTERPRISE_EMPLOYER   ?? '',
  agency_professional: process.env.STRIPE_PRICE_ENTERPRISE_AGENCY_PRO ?? '',
  agency_enterprise:   process.env.STRIPE_PRICE_ENTERPRISE_AGENCY_ENT ?? '',
  attorney_partner:    null as unknown as string, // free — no Stripe checkout
};

/* ─────────────────────────────────────────────────────────
   Feature lists per tier key
───────────────────────────────────────────────────────── */
const TIER_FEATURES: Record<TierKey, { text: string; included: boolean }[]> = {
  managed_enterprise: [
    { text: 'Unlimited active job postings',        included: true },
    { text: 'Unlimited interest letters',           included: true },
    { text: 'Unlimited scoring credits',            included: true },
    { text: 'Dedicated account manager',            included: true },
    { text: 'O1DMatch as petitioner / agent',       included: true },
    { text: 'Active O-1 talent recruiting',         included: true },
    { text: 'USCIS-compliant employment contracts', included: true },
    { text: 'Priority matching',                    included: true },
    { text: 'Monthly reporting',                    included: true },
  ],
  agency_professional: [
    { text: 'Unlimited employer clients',                included: true },
    { text: 'Unlimited job postings',                    included: true },
    { text: '200 bulk interest letter credits / month',  included: true },
    { text: 'Priority support',                          included: true },
    { text: 'Volume job posting discounts',              included: true },
    { text: 'Bulk promo codes at a discount',            included: true },
    { text: '20% referral commission',                   included: true },
    { text: 'API access',                                included: false },
    { text: 'Dedicated account manager',                 included: false },
  ],
  agency_enterprise: [
    { text: 'Everything in Agency Professional',  included: true },
    { text: 'API access',                         included: true },
    { text: 'Dedicated account manager',          included: true },
    { text: 'Advanced analytics and reporting',   included: true },
    { text: 'Custom integration support',         included: true },
    { text: 'SLA-backed priority support',        included: true },
    { text: 'White-label (planned)',              included: false },
  ],
  attorney_partner: [
    { text: '"O1DMatch Partner" badge on directory',    included: true },
    { text: 'Priority directory listing position',      included: true },
    { text: '20% commission on referred subscriptions', included: true },
    { text: 'Bulk promo codes at a discount',           included: true },
    { text: 'Early access to new platform features',    included: true },
    { text: 'No monthly subscription fee',              included: true },
  ],
};

const TIER_ICON: Record<TierKey, React.ElementType> = {
  managed_enterprise:  Building2,
  agency_professional: Users,
  agency_enterprise:   Users,
  attorney_partner:    Scale,
};

/* ─────────────────────────────────────────────────────────
   Feature list — same classes as pricing page
───────────────────────────────────────────────────────── */
function FeatureList({ features }: { features: { text: string; included: boolean }[] }) {
  return (
    <ul className="o1d-feature-list">
      {features.map((f, i) => (
        <li key={i} className="o1d-feature-item">
          <div className={`o1d-feature-check ${f.included ? 'o1d-feature-check-yes' : 'o1d-feature-check-no'}`}>
            {f.included
              ? <Check size={10} color="#10B981" />
              : <X     size={10} color="#94A3B8" />}
          </div>
          <span className={f.included ? 'o1d-feature-text-yes' : 'o1d-feature-text-no'}>
            {f.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────────────────────────
   Single plan card
───────────────────────────────────────────────────────── */
function PlanCard({ tierKey, isPartner, priceId }: { tierKey: TierKey; isPartner: boolean; priceId: string | null }) {
  const tier       = TIERS[tierKey];
  const Icon       = TIER_ICON[tierKey];
  const features   = TIER_FEATURES[tierKey];
  const isFeatured = tierKey === 'managed_enterprise' || tierKey === 'agency_enterprise';

  return (
    <div className={`o1d-price-card${isFeatured ? ' o1d-price-card-featured' : ''}`}>
      {isFeatured && (
        <div className="o1d-popular-badge">
          <Sparkles size={10} /> Enterprise Plan
        </div>
      )}

      <div className="o1d-price-header" style={{ paddingTop: isFeatured ? '2.25rem' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Icon size={15} style={{ color: '#D4A84B' }} />
          <p className="o1d-price-name">{tier.name}</p>
          {isPartner && tierKey === 'attorney_partner' && (
            <Star size={13} style={{ color: '#D4A84B', fill: '#D4A84B' }} />
          )}
        </div>

        {tier.price === 0 ? (
          <div className="o1d-price-amount">
            <span className="o1d-price-num">Free</span>
          </div>
        ) : (
          <div className="o1d-price-amount">
            <span className="o1d-price-currency">$</span>
            <span className="o1d-price-num">{tier.price.toLocaleString()}</span>
            <span className="o1d-price-per">/mo</span>
          </div>
        )}

        {tier.setupFee === 0 && tier.price > 0 && (
          <p style={{
            margin: '0.3rem 0 0',
            fontSize: '0.78rem',
            color: isFeatured ? 'rgba(255,255,255,0.5)' : '#94A3B8',
          }}>
            No setup fee
          </p>
        )}
      </div>

      <div className="o1d-price-divider" />

      <div className="o1d-price-features">
        <p className="o1d-features-label">What&apos;s included</p>
        <FeatureList features={features} />
      </div>

      <div className="o1d-price-btn-wrap">
        <PlanCTAButton priceId={priceId} tierKey={tierKey} isFeatured={isFeatured} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Page — server component
───────────────────────────────────────────────────────── */
export default async function EnterpriseTierPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let assignedTierKeys: TierKey[] = [];
  let isPartner = false;

  if (user) {
    // ── Fetch ALL assigned tiers (no .single() — supports multiple rows) ──
    const { data: assignments } = await supabase
      .from('enterprise_tier_assignments')
      .select('tier_key')
      .eq('user_id', user.id);

    assignedTierKeys = (assignments ?? [])
      .map((a) => a.tier_key as TierKey)
      .filter((k) => !!TIERS[k]); // guard against stale/invalid keys

    // Check attorney partner badge as fallback
    if (assignedTierKeys.length === 0) {
      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles')
        .select('is_partner')
        .eq('user_id', user.id)
        .single();

      if (lawyerProfile?.is_partner) {
        assignedTierKeys = ['attorney_partner'];
        isPartner = true;
      }
    } else if (assignedTierKeys.includes('attorney_partner')) {
      isPartner = true;
    }
  }

  const hasPlans = assignedTierKeys.length > 0;

  return (
    <div className="o1d-page" style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div className="o1d-pricing-hero">
        <div className="o1d-pricing-hero-glow" />
        <div className="o1d-pricing-hero-inner">
          <div className="o1d-hero-badge" style={{ marginBottom: '1.25rem' }}>
            <span className="o1d-pulse-dot" />
            <span>Your Enterprise Plan</span>
          </div>
          <h1 className="o1d-hero-h1" style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>
            {hasPlans ? (
              assignedTierKeys.length === 1
                ? <>Your <em>{TIERS[assignedTierKeys[0]].name}</em> Plan</>
                : <>Your <em>Enterprise</em> Plans</>
            ) : (
              <>No Enterprise Plan <em>Assigned</em></>
            )}
          </h1>
          <p className="o1d-hero-sub o1d-hero-sub-center">
            {hasPlans
              ? assignedTierKeys.length > 1
                ? `You have ${assignedTierKeys.length} active plans — here is everything included.`
                : 'Here is your current plan and everything it includes.'
              : 'You do not have an enterprise plan assigned yet.'}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="o1d-pricing-body">

        {/* ── No plan state ── */}
        {!hasPlans && (
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.5rem',
              background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail size={30} style={{ color: '#94A3B8' }} />
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem', fontWeight: 700, color: '#0B1D35', marginBottom: '0.75rem',
            }}>
              No enterprise plan yet
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.7, marginBottom: '2rem' }}>
              Enterprise plans are assigned by the O1DMatch team after you submit an inquiry.
              If you believe you should have a plan assigned, please contact us.
            </p>
            <Link href="/enterprise" className="o1d-btn-primary" style={{ display: 'inline-flex', fontSize: '0.9rem' }}>
              Submit Enterprise Inquiry <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ── Plans ── */}
        {hasPlans && (
          <div style={{ maxWidth: assignedTierKeys.length > 1 ? 880 : 440, margin: '0 auto' }}>

            {/* Attorney partner banner */}
            {isPartner && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.75rem 1.1rem', borderRadius: 10, marginBottom: '1.5rem',
                background: 'rgba(212,168,75,0.08)', border: '1px solid rgba(212,168,75,0.25)',
              }}>
                <Star size={16} style={{ color: '#D4A84B', fill: '#D4A84B', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#92620A' }}>
                  You are an O1DMatch Partner Attorney
                </p>
              </div>
            )}

            {/* Card grid — single card or side-by-side for multiple */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: assignedTierKeys.length > 1
                ? 'repeat(auto-fit, minmax(280px, 1fr))'
                : '1fr',
              gap: '1.25rem',
            }}>
              {assignedTierKeys.map((key) => (
                <PlanCard key={key} tierKey={key} isPartner={isPartner} priceId={TIER_PRICE_IDS[key] ?? null} />
              ))}
            </div>

            <p className="o1d-pricing-note" style={{ marginTop: '1.25rem' }}>
              Need to make changes to your plan?{' '}
              <a href="mailto:enterprise@o1dmatch.com" style={{ color: '#D4A84B', fontWeight: 600, textDecoration: 'none' }}>
                Contact us
              </a>
            </p>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}