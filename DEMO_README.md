# O1DMatch Demo Site

This is the demo version of O1DMatch, a platform connecting O-1 visa candidates with U.S. employers. The demo uses mock data and simulated services, allowing developers to explore the full functionality without requiring any API keys or backend setup.

## Quick Start

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/IGTA-Tech/o1dmatch&branch=claude/netlify-demo-site-6rmUV)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/IGTA-Tech/o1dmatch.git
cd o1dmatch

# Switch to demo branch
git checkout claude/netlify-demo-site-6rmUV

# Install dependencies
npm install

# Copy demo environment file
cp .env.demo .env.local

# Start development server
npm run dev

# Visit http://localhost:3000/demo
```

## Demo Features

### User Roles
The demo includes pre-configured accounts for each user type:

| Role | Demo Account | Description |
|------|--------------|-------------|
| **Talent** | sarah.chen@demo.com | AI Researcher with O-1 score of 92 |
| **Employer** | john.martinez@techcorp.demo | TechCorp AI - hiring AI researchers |
| **Agency** | elite@agency.demo | Elite Talent Agency |
| **Lawyer** | michael.thompson@lawfirm.demo | Immigration attorney |
| **Admin** | admin@o1dmatch.demo | Platform administrator |

**Password for all accounts:** `demo123`

### Mock Data Included

- **8 Talent Profiles** with varied O-1 scores (68-92), industries, and criteria
- **5 Employer Profiles** across tech, healthcare, entertainment, and finance
- **2 Agency Profiles** with client companies
- **8 Job Listings** with detailed requirements and O-1 justifications
- **15 Documents** showing the AI classification system
- **6 Interest Letters** in various states (draft, sent, accepted, declined)
- **7 Job Applications** demonstrating the application workflow
- **6 Lawyer Profiles** with specializations and connection requests

### Simulated Features

All external services are mocked in demo mode:

| Feature | Demo Behavior |
|---------|---------------|
| **Authentication** | Instant login with demo accounts, role switching |
| **Document Upload** | Files accepted but stored temporarily |
| **AI Classification** | Returns realistic mock classifications |
| **Job Matching** | Full algorithm with mock talent/job data |
| **Interest Letters** | PDF generation simulated |
| **E-Signatures** | SignWell integration mocked |
| **Payments** | Stripe checkout/billing mocked |
| **Email** | No real emails sent - all simulated |

## Project Structure

```
src/lib/demo/
├── config.ts          # Demo mode configuration
├── demo-api.ts        # Mock API handlers
├── demo-auth.ts       # Mock authentication
├── mock-data.ts       # Talent profiles
├── mock-employers.ts  # Employers, agencies, jobs
├── mock-lawyers.ts    # Lawyer profiles
├── mock-letters.ts    # Interest letters, applications
├── mock-documents.ts  # Document classifications
├── mock-waitlist.ts   # Waitlist entries
└── index.ts           # Main exports

src/components/demo/
├── DemoBanner.tsx     # Top banner showing demo mode
├── DemoRoleSwitcher.tsx # Floating role switcher
├── DemoLoginPrompt.tsx  # Demo account selector
├── DemoWrapper.tsx    # Wrapper for demo UI
└── index.ts           # Component exports

src/hooks/
└── useDemoAuth.ts     # Demo-aware auth hook
```

## Environment Variables

For demo mode, only one variable is required:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

All other environment variables (Supabase, Stripe, OpenAI, etc.) are optional in demo mode as all services are mocked.

## Switching User Roles

While logged in, use the floating "Switch Role" button in the bottom-right corner to change between different user perspectives without logging out.

## Demo Limitations

- **No data persistence** - Changes reset on page refresh
- **No real emails** - All notifications are simulated
- **No file storage** - Uploaded files exist only in memory
- **No payments** - Stripe integration is mocked
- **No AI processing** - Document classification returns mock results

## For Developers

This demo is designed to help developers understand:

1. **User Flows** - How different user types interact with the platform
2. **Data Models** - The structure of talents, jobs, letters, etc.
3. **Feature Set** - All capabilities the platform should support
4. **UI/UX** - The intended user experience

See [DEVELOPER_PROPOSAL_REQUEST.md](./DEVELOPER_PROPOSAL_REQUEST.md) for information on contributing to this project.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS
- **State:** React Context, Hooks
- **Types:** TypeScript
- **Deployment:** Netlify (demo), Vercel (production)

## Support

For questions about the demo or the project:

- **GitHub Issues:** [IGTA-Tech/o1dmatch/issues](https://github.com/IGTA-Tech/o1dmatch/issues)
- **Project Docs:** See repository documentation

---

*O1DMatch Demo - Built for developer exploration*
