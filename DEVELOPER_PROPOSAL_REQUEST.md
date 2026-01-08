# O1DMatch - Developer Proposal Request

## Introduction

We're looking for a talented developer or team to help bring O1DMatch to production. To help you understand the project scope and vision, we've created a **live demo site** that showcases how the platform should function with realistic mock data.

**Demo Site:** [https://o1dmatch-demo.netlify.app](https://o1dmatch-demo.netlify.app)
*(Note: This is a fully functional demo with mock data - no real API keys or payment processing)*

---

## Project Overview

**O1DMatch** is a SaaS platform that connects O-1 visa candidates with employers ready to sponsor them. Think of it as a specialized talent marketplace with built-in immigration compliance features.

### The Problem We're Solving
- O-1 visa candidates struggle to find employers willing to provide interest/support letters
- Employers don't have an easy way to discover qualified O-1 talent
- The O-1 application process requires specific documentation that's hard to organize and validate
- Lawyers need a streamlined way to connect with potential clients

---

## Core Features

### 1. **Talent Management**
- Comprehensive talent profiles with O-1 visa scoring (0-100 scale)
- Profile visibility controls (public/private)
- Visa status tracking (not filed → filed → approved)
- Skills, education, and experience tracking
- Online profile integration (LinkedIn, GitHub, Google Scholar)
- Resume storage with privacy protection (hidden until letter accepted)

### 2. **AI-Powered Document Processing**
- Upload documents (PDFs, images, scanned docs)
- Automatic text extraction (PDF parsing + OCR for scanned documents)
- AI classification to 8 O-1 criteria:
  1. Awards & Recognition
  2. Professional Memberships
  3. Published Material About Candidate
  4. Judging Others' Work
  5. Original Contributions
  6. Scholarly Articles
  7. Critical/Essential Role
  8. High Salary
- Confidence scoring (high/medium/low)
- Automatic score calculation based on verified documents

### 3. **Intelligent Job Matching**
- Weighted matching algorithm considering:
  - O-1 score requirements (40% weight)
  - Criteria match (25%)
  - Skills match (20%)
  - Education requirements (10%)
  - Experience requirements (5%)
- Match categories: Excellent, Good, Fair, Poor
- Two-way matching (jobs for talent, talent for jobs)

### 4. **Interest Letter System**
- 5 commitment levels with templated legal language:
  - Exploratory Interest
  - Intent to Engage
  - Conditional Offer
  - Firm Commitment
  - Offer Extended
- PDF generation for letters
- E-signature integration (SignWell)
- Privacy protection (talent identity revealed only on acceptance)

### 5. **Subscription & Billing**
- **Employer Tiers:** Free, Starter ($25/mo), Growth ($49/mo), Business ($99/mo), Enterprise ($199/mo)
- **Talent Tiers:** Profile Only (free), Starter ($250/mo), Active Match ($500/mo), IGTA Member (free)
- Usage limits per tier (jobs, letters/month)
- Stripe integration for payments

### 6. **Lawyer Directory**
- Attorney profiles with specializations
- Visa types handled (O-1A, O-1B, EB-1A, etc.)
- Connection request system
- Directory tiers (basic, premium, featured)

### 7. **Waitlist System**
- Pre-launch signup for all user types
- Promo code tracking for referrals
- Priority scoring for invitation ordering

### 8. **Multi-User Platform**
- **Talent:** Build profile, upload evidence, receive letters, apply to jobs
- **Employers:** Post jobs, browse talent, send interest letters
- **Agencies:** Manage client companies, send letters on behalf of clients
- **Lawyers:** Directory listing, receive connection requests
- **Admins:** Document verification, user management

---

## Current Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **UI** | React 18, Tailwind CSS |
| **Database** | Supabase (PostgreSQL) with RLS |
| **Auth** | Supabase Auth (SSR) |
| **Storage** | Supabase Storage |
| **Payments** | Stripe |
| **Email** | SendGrid (primary), Resend (fallback) |
| **E-Signatures** | SignWell |
| **AI/ML** | OpenAI GPT-4o (primary), Claude 3.5 Sonnet (fallback) |
| **Document Processing** | pdf-parse, Tesseract.js |
| **PDF Generation** | @react-pdf/renderer |
| **Testing** | Playwright |
| **Deployment** | Vercel |

---

## Project Resources

### GitHub Repository
**[https://github.com/IGTA-Tech/o1dmatch](https://github.com/IGTA-Tech/o1dmatch)**

The repository contains:
- Complete source code
- Database migration scripts
- API documentation
- Type definitions
- Test suites

### Current Deployment
**[Vercel Project](https://vercel.com/igta-tech/o1dmatch)**

---

## What We're Looking For

We want to hear your proposal on how you would approach completing this project. Please address the following:

### 1. **Technical Approach**
- Would you continue with the existing tech stack, or do you recommend changes?
- If recommending changes, explain the benefits and migration path
- How would you handle the AI/document processing pipeline?
- What's your approach to ensuring security and data privacy?

### 2. **Architecture Improvements**
- Do you see any architectural issues that should be addressed?
- How would you optimize for performance and scalability?
- What testing strategy would you implement?

### 3. **Feature Implementation**
- Which features would you prioritize?
- Are there any features you'd approach differently?
- What additional features might add value?

### 4. **Timeline & Milestones**
- How would you break down the work?
- What would be your MVP approach?
- What are the key milestones?

### 5. **Your Experience**
- Share relevant projects you've built (especially SaaS, immigration tech, or marketplace platforms)
- Experience with the tech stack (Next.js, Supabase, Stripe, etc.)
- Team composition (if applicable)

---

## Evaluation Criteria

Proposals will be evaluated on:

1. **Technical Understanding** - Do you understand the complexity of the project?
2. **Solution Quality** - Is your approach practical and well-reasoned?
3. **Innovation** - Do you bring fresh ideas while respecting existing work?
4. **Communication** - Is your proposal clear and well-organized?
5. **Feasibility** - Can you realistically deliver what you propose?

---

## How to Submit

1. Review the demo site and explore all features
2. Clone the GitHub repository and review the codebase
3. Prepare your proposal addressing the points above
4. Include:
   - Your technical approach (existing stack or new recommendations)
   - Estimated effort breakdown
   - Relevant portfolio/experience
   - Any questions or clarifications needed

**The strongest proposal will be selected to move forward with the project.**

---

## Questions?

If you have questions about the project scope, technical requirements, or submission process, please reach out. We're happy to clarify any aspects of the platform.

---

*O1DMatch is a project by IGTA-Tech focused on streamlining the O-1 visa process for exceptional talent.*
