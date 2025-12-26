# O1DMatch - Technical Issues Briefing for Developers

**Status:** Seeking qualified developer to complete production deployment
**NDA Required:** Yes - will be provided upon selection
**Demo Site:** https://demo.o1dmatch.com (or https://o1dmatch-demo.netlify.app)

---

## Project Overview

O1DMatch is a two-sided marketplace connecting O-1 visa candidates with US employers. The platform is 80% complete but requires a skilled developer to resolve integration issues and bring it to production.

### Resources

| Resource | URL |
|----------|-----|
| **GitHub Repository** | https://github.com/IGTA-Tech/o1dmatch |
| **Demo Site (Netlify)** | https://demo.o1dmatch.com |
| **Production (Vercel)** | https://vercel.com/igta-tech/o1dmatch |
| **Demo Branch** | `claude/netlify-demo-site-6rmUV` |
| **Main Branch** | `main` |

---

## Current Technical Issues

The demo site works with mock data. The production site has the following integration issues that need to be resolved:

### 1. Supabase Authentication Issues

**Problem:** User sign-in/sign-up is not working correctly in production.

**Symptoms:**
- Users cannot register new accounts
- Login attempts fail silently or with cryptic errors
- Session persistence issues across page refreshes
- SSR auth context not properly hydrating

**Current Implementation:**
- Supabase Auth with SSR (`@supabase/ssr`)
- Next.js 14 App Router
- Middleware for protected routes

**Files Involved:**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `middleware.ts`

**What We Need:**
- Diagnosis of the root cause
- Working authentication flow (email/password)
- Proper session handling with SSR
- Magic link option (optional but preferred)

---

### 2. Database Schema & RLS Policies

**Problem:** Row Level Security policies may be blocking legitimate operations.

**Current State:**
- Schema defined in `supabase/migrations/`
- RLS policies exist but may be misconfigured
- Some queries return empty results when data exists

**What We Need:**
- Review and fix RLS policies for all tables
- Ensure proper access patterns for each user role
- Test all CRUD operations per role

---

### 3. Email Service Not Sending

**Problem:** Transactional emails are not being delivered.

**Current Implementation:**
- Primary: SendGrid
- Fallback: Resend
- Templates in `src/lib/email/templates.ts`

**What We Need:**
- Working email delivery for:
  - Account verification
  - Password reset
  - Interest letter notifications
  - Waitlist confirmations
- Proper error handling and logging

**Open to Alternatives:**
- If you recommend a different email provider (Postmark, AWS SES, etc.), explain why

---

### 4. Stripe Integration Issues

**Problem:** Subscription checkout and billing not fully functional.

**Current Implementation:**
- Stripe Checkout for subscriptions
- Webhook handling for events
- Usage-based limits per tier

**Files Involved:**
- `src/lib/stripe/client.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/subscriptions/limits.ts`

**What We Need:**
- Working subscription checkout flow
- Proper webhook handling
- Usage tracking and enforcement

---

### 5. SignWell E-Signature Integration

**Problem:** Document signing flow not completing.

**Current Implementation:**
- SignWell API for e-signatures on interest letters
- Webhook for signature completion

**Files Involved:**
- `src/lib/signwell/client.ts`
- `src/app/api/signwell/webhook/route.ts`

**What We Need:**
- Working document creation and sending
- Signature tracking and status updates
- PDF retrieval after signing

**Open to Alternatives:**
- DocuSign, HelloSign, or other providers if better suited

---

### 6. AI Document Classification

**Problem:** Document upload and AI classification pipeline needs completion.

**Current Implementation:**
- PDF text extraction (`pdf-parse`)
- OCR for scanned documents (`tesseract.js`)
- OpenAI GPT-4o for classification
- Claude 3.5 Sonnet as fallback

**What We Need:**
- Reliable text extraction from various document types
- Accurate classification to 8 O-1 criteria
- Confidence scoring
- Score calculation from verified documents

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **UI** | React 18, Tailwind CSS |
| **Database** | Supabase (PostgreSQL + Auth + Storage) |
| **Payments** | Stripe |
| **Email** | SendGrid / Resend |
| **E-Signatures** | SignWell |
| **AI** | OpenAI GPT-4o, Claude 3.5 Sonnet |
| **Document Processing** | pdf-parse, Tesseract.js |
| **PDF Generation** | @react-pdf/renderer |
| **Testing** | Playwright |
| **Deployment** | Vercel (prod), Netlify (demo) |

---

## What We're Asking From You

### In Your Proposal, Please Address:

#### 1. Diagnosis Approach
- How would you investigate and diagnose the authentication issues?
- What tools/methods would you use to debug the Supabase integration?

#### 2. Solution Strategy
- Would you keep the current tech stack or recommend changes?
- If recommending alternatives, explain:
  - Why the alternative is better
  - Migration effort required
  - Any cost implications

#### 3. Implementation Plan
- How would you prioritize fixing these issues?
- What's your approach to testing each integration?
- How would you ensure nothing breaks during fixes?

#### 4. Alternative Tools (Optional)
If you believe different tools would work better, tell us:

| Current Tool | Your Recommendation | Why |
|--------------|---------------------|-----|
| Supabase Auth | ? | |
| SendGrid/Resend | ? | |
| SignWell | ? | |
| OpenAI/Claude | ? | |

#### 5. Your Experience
- Have you worked with Supabase Auth + Next.js 14 App Router?
- Experience with similar SaaS platforms?
- Portfolio links to relevant projects

---

## How to Explore the Project

### 1. View the Demo Site
Visit https://demo.o1dmatch.com and log in with any demo account:
- **Password for all:** `demo123`
- Talent: `sarah.chen@demo.com`
- Employer: `john.martinez@techcorp.demo`
- Agency: `elite@agency.demo`
- Lawyer: `michael.thompson@lawfirm.demo`

### 2. Clone and Review Code
```bash
git clone https://github.com/IGTA-Tech/o1dmatch.git
cd o1dmatch

# View production code
git checkout main

# View demo code (works without API keys)
git checkout claude/netlify-demo-site-6rmUV
```

### 3. Key Directories
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/
│   ├── supabase/       # Supabase client & auth
│   ├── stripe/         # Stripe integration
│   ├── email/          # Email templates & sending
│   ├── signwell/       # E-signature integration
│   └── extraction/     # Document processing
├── hooks/              # React hooks
└── types/              # TypeScript types

supabase/
├── migrations/         # Database schema
└── seed.sql           # Sample data
```

---

## Evaluation Criteria

We will evaluate proposals based on:

1. **Technical Understanding** - Do you grasp the issues and their causes?
2. **Practical Solutions** - Are your proposed fixes realistic?
3. **Clear Communication** - Can you explain complex issues simply?
4. **Relevant Experience** - Have you solved similar problems before?
5. **Proactive Thinking** - Do you identify issues we haven't mentioned?

---

## Submission

Please provide:

1. **Your diagnosis** of what's causing the auth/integration issues
2. **Your proposed solution** (keep current stack or alternatives)
3. **Estimated effort** to fix each issue category
4. **Your relevant experience** and portfolio
5. **Any questions** you have about the project

---

## Questions?

If you need clarification on any aspect of the project, include your questions in your proposal. We're happy to provide additional context.

---

*O1DMatch - Connecting extraordinary talent with opportunity*
