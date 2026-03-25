/* src/lib/tiers.ts */

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface TierFeatures {
    // Employer features
    activeJobs?:           number;
    lettersPerMonth?:      number;
    scoringCredits?:       number;
    dedicatedManager?:     boolean;
    petitionerServices?:   boolean;
    activeRecruiting?:     boolean;
    complianceContract?:   boolean;
    priorityMatching?:     boolean;
    monthlyReporting?:     boolean;
  
    // Agency features
    unlimitedClients?:     boolean;
    unlimitedJobs?:        boolean;
    bulkLetterCredits?:    number;
    prioritySupport?:      boolean;
    apiAccess?:            boolean;
    whiteLabel?:           boolean;
    customIntegrations?:   boolean;
    advancedAnalytics?:    boolean;
    slaSupport?:           boolean;
  
    // Attorney partner features
    partnerBadge?:              boolean;
    priorityDirectoryListing?:  boolean;
    bulkPromoCodes?:            boolean;
    referralCommission?:        number;
    affiliateProgram?:          boolean;
  }
  
  export interface Tier {
    name:               string;
    price:              number;
    setupFee:           number;
    stripePriceId:      string | null;
    billingInterval:    'month' | 'year' | null;
    showOnPricingPage:  boolean;
    adminAssignOnly:    boolean;
    features:           TierFeatures;
  }
  
  export type TierKey =
    | 'managed_enterprise'
    | 'agency_professional'
    | 'agency_enterprise'
    | 'attorney_partner';
  
  // ─────────────────────────────────────────────────────────
  // Tier definitions
  // ─────────────────────────────────────────────────────────
  
  export const TIERS: Record<TierKey, Tier> = {
  
    // ── Employer Enterprise ────────────────────────────────
    // Hidden from /pricing — admin-assigned only after
    // enterprise inquiry form submission.
    managed_enterprise: {
      name:              'Managed Enterprise',
      price:             2000,
      setupFee:          0,
      stripePriceId:     'price_1TEoldBsxM9WuBhjAQk2Kku8',
      billingInterval:   'month',
      showOnPricingPage: false,
      adminAssignOnly:   true,
      features: {
        activeJobs:          Infinity,
        lettersPerMonth:     Infinity,
        scoringCredits:      Infinity,
        dedicatedManager:    true,
        petitionerServices:  true,
        activeRecruiting:    true,
        complianceContract:  true,
        priorityMatching:    true,
        monthlyReporting:    true,
      },
    },
  
    // ── Agency Professional ────────────────────────────────
    // Shown on /pricing under Agency section.
    agency_professional: {
      name:              'Agency Professional',
      price:             499,
      setupFee:          0,
      stripePriceId:     'price_1TEoqBBsxM9WuBhj4EGKKEjL',
      billingInterval:   'month',
      showOnPricingPage: true,
      adminAssignOnly:   false,
      features: {
        unlimitedClients:  true,
        unlimitedJobs:     true,
        bulkLetterCredits: 200,    // per month
        prioritySupport:   true,
        apiAccess:         false,
        dedicatedManager:  false,
        whiteLabel:        false,  // planned future feature
      },
    },
  
    // ── Agency Enterprise ──────────────────────────────────
    // Shown on /pricing under Agency section and /enterprise.
    agency_enterprise: {
      name:              'Agency Enterprise',
      price:             999,
      setupFee:          0,
      stripePriceId:     'price_1TEorpBsxM9WuBhjiQBUH9lB',
      billingInterval:   'month',
      showOnPricingPage: true,
      adminAssignOnly:   false,
      features: {
        unlimitedClients:   true,
        unlimitedJobs:      true,
        bulkLetterCredits:  Infinity,
        prioritySupport:    true,
        apiAccess:          true,
        dedicatedManager:   true,
        whiteLabel:         false,  // planned future feature
        customIntegrations: true,
        advancedAnalytics:  true,
        slaSupport:         true,
      },
    },
  
    // ── Attorney Partner ───────────────────────────────────
    // Free — no Stripe product.
    // Admin activates by:
    //   1. Inserting a row into affiliate_partners
    //   2. Setting lawyer_profiles.is_partner = true
    attorney_partner: {
      name:              'Attorney Partner',
      price:             0,
      setupFee:          0,
      stripePriceId:     null,
      billingInterval:   null,
      showOnPricingPage: false,
      adminAssignOnly:   true,
      features: {
        partnerBadge:             true,
        priorityDirectoryListing: true,
        bulkPromoCodes:           true,
        referralCommission:       0.20,  // 20%
        affiliateProgram:         true,
      },
    },
  };
  
  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────
  
  /** All tiers visible on the self-service pricing page */
  export const PRICING_PAGE_TIERS = (
    Object.entries(TIERS) as [TierKey, Tier][]
  ).filter(([, tier]) => tier.showOnPricingPage);
  
  /** All tiers that require admin assignment */
  export const ADMIN_ONLY_TIERS = (
    Object.entries(TIERS) as [TierKey, Tier][]
  ).filter(([, tier]) => tier.adminAssignOnly);
  
  /** Look up a tier by its Stripe price ID */
  export function getTierByPriceId(priceId: string): [TierKey, Tier] | undefined {
    return (Object.entries(TIERS) as [TierKey, Tier][]).find(
      ([, tier]) => tier.stripePriceId === priceId
    );
  }
  
  /** Look up a tier by key (type-safe) */
  export function getTier(key: TierKey): Tier {
    return TIERS[key];
  }