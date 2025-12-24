# O1DMatch Waitlist Implementation Plan

## Overview
Implement 4 distinct waitlist landing pages targeting different user segments (Talent, Employer, Agency, Lawyer) with unique designs, forms, and value propositions.

---

## Implementation Phases

### Phase 1: Database Schema
**Files to modify:** `supabase/schema.sql`

Create the `waitlist` table with:
- Common fields (email, full_name, category)
- Segment-specific fields (talent fields, employer fields, agency fields, lawyer fields)
- Tracking fields (UTM parameters, queue_position, status)
- Auto-increment queue position trigger per category

### Phase 2: API Endpoint
**Files to create:** `src/app/api/waitlist/route.ts`

- POST endpoint for all waitlist submissions
- Validate required fields and category
- Check for duplicate email+category combinations
- Insert into Supabase with auto-assigned queue position
- Trigger notification email to waitlist@o1dmatch.com
- Return queue_position to client

### Phase 3: Email Notification
**Files to create:** `src/lib/email/waitlist-notification.ts`

- Use existing SendGrid/Resend infrastructure
- Format all form data in readable HTML table
- Include category, name, email, queue position
- Include offer type (50% off for talent, 3 months free for others)

### Phase 4: Form Components
**Files to create:**
- `src/components/waitlist/WaitlistFormTalent.tsx`
- `src/components/waitlist/WaitlistFormEmployer.tsx`
- `src/components/waitlist/WaitlistFormAgency.tsx`
- `src/components/waitlist/WaitlistFormLawyer.tsx`
- `src/components/waitlist/WaitlistSuccess.tsx`

Each form:
- Multi-step (3 steps) with progress indicator
- Field validation between steps
- Loading state during submission
- Success state with queue position

### Phase 5: Landing Pages
**Files to create:**
- `src/app/waitlist/page.tsx` (hub page)
- `src/app/waitlist/talent/page.tsx`
- `src/app/waitlist/employer/page.tsx`
- `src/app/waitlist/agency/page.tsx`
- `src/app/waitlist/lawyer/page.tsx`

Each page has unique:
- Color scheme and typography
- Hero content and value propositions
- Stats/trust indicators
- Special offer banner
- Form component

---

## Design Specifications

| Page | Background | Accent | Body Font | Heading Font |
|------|------------|--------|-----------|--------------|
| Talent | `#0a0f1a` (dark) | Blue-purple gradient | DM Sans | Instrument Serif |
| Employer | `#faf9f6` (cream) | `#16a34a` (green) | Manrope | Fraunces |
| Agency | `#0f0f0f` (dark) | `#f59e0b` (amber) | Plus Jakarta Sans | Crimson Pro |
| Lawyer | `#f8fafc` (light) | `#7c3aed` (purple) | Inter | Source Serif 4 |

---

## Offers by Segment

| Segment | Offer |
|---------|-------|
| Talent | 50% yearly discount ($250/month instead of $500/month) |
| Employer | 3 months FREE access |
| Agency | 3 months FREE access |
| Lawyer | 3 months FREE access |

---

## Form Fields by Segment

### Talent (3 steps)
1. Full Name, Email, Primary Field
2. Current Visa Status
3. Biggest Challenge, Timeline Urgency

### Employer (3 steps)
1. Company Name, Your Name, Job Title, Email
2. Company Size, Industry, Hiring Volume
3. Biggest Challenge

### Agency (3 steps)
1. Agency Name, Your Name, Title, Email
2. Agency Size, Annual Placements, International Experience
3. Primary Industries, Client Demand

### Lawyer (3 steps)
1. Full Name, Law Firm, Email, Bar State
2. Years Experience, Monthly O-1 Cases, Specializations
3. Acquisition Challenge, Office Location

---

## Implementation Order

1. [ ] Add database schema to `supabase/schema.sql`
2. [ ] Create email notification function
3. [ ] Create API endpoint
4. [ ] Create WaitlistSuccess component
5. [ ] Create TalentWaitlistForm component
6. [ ] Create Talent landing page
7. [ ] Create EmployerWaitlistForm component
8. [ ] Create Employer landing page
9. [ ] Create AgencyWaitlistForm component
10. [ ] Create Agency landing page
11. [ ] Create LawyerWaitlistForm component
12. [ ] Create Lawyer landing page
13. [ ] Create hub page linking to all 4
14. [ ] Add Google Fonts imports
15. [ ] Test all flows end-to-end

---

## Key Requirements

- Email notification to `waitlist@o1dmatch.com` on every submission
- Queue position displayed on success
- UTM parameter capture from URL
- No approval rate or success rate claims
- Mobile responsive design
- Distinct visual identity per segment
