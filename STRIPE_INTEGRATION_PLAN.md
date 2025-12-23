# Stripe Integration Plan for O1DMatch

## Overview

This document outlines the Stripe payment integration strategy for O1DMatch. Implementation is planned but **NOT live yet**.

---

## Pricing Structure (From /pricing page)

### Employer Plans

| Plan | Monthly | Setup Fee | Active Jobs | Letters/mo |
|------|---------|-----------|-------------|------------|
| Free | $0 | $0 | 2 | 5 |
| Starter | $25 | $100 | 5 | 15 |
| Growth | $49 | $100 | 15 | 40 |
| Business | $99 | $100 | 50 | 100 |
| Enterprise | $199 | $0 | Unlimited | Unlimited |

### Talent Plans

| Plan | Monthly | Features |
|------|---------|----------|
| Free | $0 | Basic profile, limited applications |
| Active Match | $19 | Priority matching, unlimited apps |

---

## Stripe Products to Create

### In Stripe Dashboard (stripe.com/dashboard)

```
Products:
├── employer_free (no Stripe needed)
├── employer_starter
│   ├── Price: $25/mo (recurring)
│   └── Price: $100 (one-time setup)
├── employer_growth
│   ├── Price: $49/mo (recurring)
│   └── Price: $100 (one-time setup)
├── employer_business
│   ├── Price: $99/mo (recurring)
│   └── Price: $100 (one-time setup)
├── employer_enterprise
│   └── Price: $199/mo (recurring)
├── talent_free (no Stripe needed)
└── talent_active_match
    └── Price: $19/mo (recurring)
```

---

## Environment Variables Needed

```bash
# Stripe Keys (get from stripe.com/dashboard/apikeys)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_EMPLOYER_STARTER=price_xxxxx
STRIPE_PRICE_EMPLOYER_STARTER_SETUP=price_xxxxx
STRIPE_PRICE_EMPLOYER_GROWTH=price_xxxxx
STRIPE_PRICE_EMPLOYER_GROWTH_SETUP=price_xxxxx
STRIPE_PRICE_EMPLOYER_BUSINESS=price_xxxxx
STRIPE_PRICE_EMPLOYER_BUSINESS_SETUP=price_xxxxx
STRIPE_PRICE_EMPLOYER_ENTERPRISE=price_xxxxx
STRIPE_PRICE_TALENT_ACTIVE_MATCH=price_xxxxx
```

---

## Database Schema (Already Exists)

From `/src/lib/subscriptions/schema.sql`:

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  metric TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
);
```

---

## Existing API Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/stripe/checkout` | Create checkout session | ✅ Built |
| `/api/stripe/webhook` | Handle Stripe events | ✅ Built |
| `/api/stripe/billing-portal` | Customer portal | ✅ Built |

---

## Implementation Steps

### Phase 1: Stripe Setup (Do First)
1. [ ] Create Stripe account (if not done)
2. [ ] Create products and prices in Stripe Dashboard
3. [ ] Copy price IDs to environment variables
4. [ ] Set up webhook endpoint in Stripe Dashboard
5. [ ] Add env vars to Vercel

### Phase 2: Database Migration
1. [ ] Run subscription schema migration in Supabase
2. [ ] Add RLS policies for subscriptions table
3. [ ] Test database connectivity

### Phase 3: Testing
1. [ ] Test checkout flow with test cards
2. [ ] Test webhook handling
3. [ ] Test subscription status updates
4. [ ] Test usage limit enforcement

### Phase 4: Go Live
1. [ ] Switch to live Stripe keys
2. [ ] Update webhook to production URL
3. [ ] Monitor for issues

---

## Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 3220 | 3D Secure required |

---

## Webhook Events to Handle

```typescript
// Already implemented in /api/stripe/webhook
switch (event.type) {
  case 'checkout.session.completed':
    // Create subscription record
    break;
  case 'customer.subscription.updated':
    // Update subscription status
    break;
  case 'customer.subscription.deleted':
    // Handle cancellation
    break;
  case 'invoice.payment_failed':
    // Handle failed payment
    break;
}
```

---

## Usage Limits Enforcement

From `/src/lib/subscriptions/limits.ts`:

```typescript
// Check if user can perform action
export async function checkLimit(
  userId: string,
  metric: 'job_postings' | 'interest_letters'
): Promise<{ allowed: boolean; remaining: number }>

// Increment usage
export async function incrementUsage(
  userId: string,
  metric: string
): Promise<void>
```

---

## Promo Code System (Already Built)

- `/api/promo/validate` - Validate promo codes
- `/api/promo/verify-igta` - IGTA client verification
- Supports: percentage off, fixed amount, free months

---

## Notes

- **DO NOT GO LIVE** until waitlist phase is complete
- Test mode is enabled (`SIGNWELL_TEST_MODE=true` pattern)
- All Stripe code exists but needs price IDs
- Consider offering annual plans for discount

---

## Quick Start Checklist

```
[ ] Get Stripe test API keys
[ ] Create products in Stripe Dashboard
[ ] Add STRIPE_SECRET_KEY to .env.local
[ ] Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
[ ] Create prices and add price IDs to .env.local
[ ] Test checkout flow
[ ] Add env vars to Vercel (when ready)
```

---

*Last updated: December 2024*
