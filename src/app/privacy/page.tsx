/* src/app/privacy/page.tsx */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Share2,
  Trash2,
  Globe,
  Mail,
  Baby,
  RefreshCw,
  ChevronRight,
  FileText,
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | O1DMatch",
  description:
    "Learn how O1DMatch collects, uses, and protects your personal data on our O-1 visa talent platform.",
};

/* ------------------------------------------------------------------ */
/*  Section Component                                                  */
/* ------------------------------------------------------------------ */
function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="pl-12 space-y-4 text-gray-700 text-[15px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                  */
/* ------------------------------------------------------------------ */
const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "information-collected", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "data-sharing", label: "Data Sharing & Disclosure" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "cookies", label: "Cookies & Tracking" },
  { id: "international", label: "International Transfers" },
  { id: "children", label: "Children\u2019s Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

/* ================================================================== */
/*  PAGE                                                                */
/* ================================================================== */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="pt-16" />
      {/* ---- Hero ---- */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Your privacy matters. Learn how O1DMatch collects, uses, and
            safeguards your personal information.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm text-green-100">
            <RefreshCw className="w-4 h-4" />
            Last updated: February 17, 2026
          </div>
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar TOC (sticky on desktop) */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                On this page
              </h3>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/terms"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Terms of Service →
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* ---- 1. Introduction ---- */}
            <Section id="introduction" icon={Shield} title="1. Introduction">
              <p>
                O1DMatch (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a platform that
                connects individuals with extraordinary ability (&quot;Talent&quot;)
                with employers seeking to sponsor O-1 visas (&quot;Employers&quot;).
                This Privacy Policy describes how we collect, use, disclose, and
                protect your personal information when you access or use our
                website, applications, and services (collectively, the
                &quot;Platform&quot;).
              </p>
              <p>
                By using the Platform, you agree to the collection and use of
                information in accordance with this policy. If you do not agree,
                please do not use the Platform.
              </p>
            </Section>

            {/* ---- 2. Information We Collect ---- */}
            <Section
              id="information-collected"
              icon={Database}
              title="2. Information We Collect"
            >
              <h3 className="font-semibold text-gray-900">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Account Information:</strong> Name, email address,
                  phone number, password, and profile photo.
                </li>
                <li>
                  <strong>Professional Information:</strong> Job title, employer,
                  skills, work history, education, and professional
                  achievements.
                </li>
                <li>
                  <strong>Immigration Documents:</strong> Visa petition
                  documents, evidence of extraordinary ability, exhibit packets,
                  interest letters, and supporting materials uploaded for
                  scoring or case management.
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing address and
                  payment method details processed securely through Stripe. We
                  do not store full credit card numbers on our servers.
                </li>
                <li>
                  <strong>Communications:</strong> Messages, feedback, and
                  support requests you send to us.
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-6">
                2.2 Information Collected Automatically
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used,
                  actions taken, and time spent on the Platform.
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, operating
                  system, device identifiers, and screen resolution.
                </li>
                <li>
                  <strong>Log Data:</strong> IP address, access times, referring
                  URLs, and error logs.
                </li>
                <li>
                  <strong>Cookies:</strong> Small data files stored on your
                  device (see Section 8).
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-6">
                2.3 Information from Third Parties
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Authentication providers (e.g., Google OAuth) when you sign in
                  with a third-party account.
                </li>
                <li>
                  Payment processors (Stripe) for transaction verification.
                </li>
                <li>
                  E-signature services (SignWell) for document signing status.
                </li>
              </ul>
            </Section>

            {/* ---- 3. How We Use ---- */}
            <Section
              id="how-we-use"
              icon={Eye}
              title="3. How We Use Your Information"
            >
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Provide, maintain, and improve the Platform and its features.
                </li>
                <li>
                  Match Talent with Employers based on skills, experience, and
                  visa eligibility criteria.
                </li>
                <li>
                  Process and score visa petition documents using our AI-powered
                  scoring tools to evaluate O-1 eligibility.
                </li>
                <li>
                  Generate exhibits, petition materials, and interest letters
                  for immigration case support.
                </li>
                <li>
                  Process payments, manage subscriptions, and administer credit
                  systems (e.g., re-score credits).
                </li>
                <li>
                  Send transactional emails (account verification, password
                  resets, interest letter approvals) and, with your consent,
                  marketing communications.
                </li>
                <li>
                  Detect fraud, abuse, and security threats to protect users and
                  the Platform.
                </li>
                <li>
                  Comply with legal obligations and respond to lawful requests.
                </li>
                <li>
                  Conduct analytics and research to improve our services.
                </li>
              </ul>
            </Section>

            {/* ---- 4. Data Sharing ---- */}
            <Section
              id="data-sharing"
              icon={Share2}
              title="4. Data Sharing & Disclosure"
            >
              <p>
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Employers (for Talent users):</strong> Your profile
                  information and scoring results may be shared with Employers
                  you match with or express interest in, only to the extent
                  necessary for the matching and sponsorship process.
                </li>
                <li>
                  <strong>Service Providers:</strong> Trusted third parties that
                  help us operate the Platform, including Supabase (database and
                  authentication), Stripe (payments), Vercel (hosting), SignWell
                  (e-signatures), and Google Drive (document management).
                </li>
                <li>
                  <strong>AI Scoring Services:</strong> Documents you upload for
                  petition scoring are processed by our AI scoring API to
                  evaluate O-1 eligibility criteria. These documents are
                  transmitted securely and used solely for scoring purposes.
                </li>
                <li>
                  <strong>Legal & Immigration Professionals:</strong> When you
                  engage attorneys or agencies through the Platform, relevant
                  case information may be shared with them at your direction.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information if required by law, court order, or governmental
                  authority, or to protect our rights, safety, or property.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets, your information may
                  be transferred to the acquiring entity.
                </li>
              </ul>
            </Section>

            {/* ---- 5. Data Security ---- */}
            <Section
              id="data-security"
              icon={Lock}
              title="5. Data Security"
            >
              <p>
                We implement industry-standard security measures to protect your
                data, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Encryption of data in transit (TLS/SSL) and at rest.
                </li>
                <li>
                  Row-level security (RLS) policies ensuring users can only
                  access their own data.
                </li>
                <li>
                  Secure authentication with encrypted password storage and
                  session management.
                </li>
                <li>
                  Server-side API key management — sensitive credentials like
                  scoring and payment API keys are never exposed to the browser.
                </li>
                <li>
                  Regular security reviews and monitoring for vulnerabilities.
                </li>
              </ul>
              <p>
                While we strive to protect your information, no method of
                electronic transmission or storage is 100% secure. We cannot
                guarantee absolute security.
              </p>
            </Section>

            {/* ---- 6. Data Retention ---- */}
            <Section
              id="data-retention"
              icon={Trash2}
              title="6. Data Retention"
            >
              <p>
                We retain your personal information for as long as your account
                is active or as needed to provide services. Specifically:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Account Data:</strong> Retained until you delete your
                  account.
                </li>
                <li>
                  <strong>Scoring Sessions & Documents:</strong> Retained for
                  the duration of your subscription. You may delete individual
                  scoring sessions at any time.
                </li>
                <li>
                  <strong>Payment Records:</strong> Retained as required by tax
                  and financial regulations (typically 7 years).
                </li>
                <li>
                  <strong>Log Data:</strong> Automatically purged after 90 days.
                </li>
              </ul>
              <p>
                Upon account deletion, we will remove your personal information
                within 30 days, except where retention is required by law.
              </p>
            </Section>

            {/* ---- 7. Your Rights ---- */}
            <Section
              id="your-rights"
              icon={Shield}
              title="7. Your Rights"
            >
              <p>
                Depending on your jurisdiction, you may have the following
                rights:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data
                  we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete data.
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  data, subject to legal retention requirements.
                </li>
                <li>
                  <strong>Portability:</strong> Request your data in a portable,
                  machine-readable format.
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing emails at
                  any time using the link in each email.
                </li>
                <li>
                  <strong>Restrict Processing:</strong> Request that we limit
                  how we use your data in certain circumstances.
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:privacy@o1dmatch.com"
                  className="text-green-600 hover:underline font-medium"
                >
                  privacy@o1dmatch.com
                </a>
                . We will respond within 30 days.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>California Residents (CCPA):</strong> You have the
                  right to know what personal information we collect, request
                  its deletion, and opt out of the sale of personal information.
                  We do not sell personal information.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>EU/UK Residents (GDPR):</strong> You have additional
                  rights including the right to object to processing, withdraw
                  consent, and lodge a complaint with a supervisory authority.
                </p>
              </div>
            </Section>

            {/* ---- 8. Cookies ---- */}
            <Section id="cookies" icon={Eye} title="8. Cookies & Tracking">
              <p>We use the following types of cookies:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-700">
                        Purpose
                      </th>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-700">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-2.5 font-medium">Essential</td>
                      <td className="px-4 py-2.5">
                        Authentication, security, session management
                      </td>
                      <td className="px-4 py-2.5">Session</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium">Functional</td>
                      <td className="px-4 py-2.5">
                        User preferences, dashboard settings
                      </td>
                      <td className="px-4 py-2.5">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium">Analytics</td>
                      <td className="px-4 py-2.5">
                        Usage patterns, feature adoption, performance
                      </td>
                      <td className="px-4 py-2.5">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                You can control cookies through your browser settings. Disabling
                essential cookies may affect Platform functionality.
              </p>
            </Section>

            {/* ---- 9. International ---- */}
            <Section
              id="international"
              icon={Globe}
              title="9. International Transfers"
            >
              <p>
                Your information may be transferred to and processed in
                countries other than your country of residence, including the
                United States. We ensure appropriate safeguards are in place for
                international data transfers, including standard contractual
                clauses where required.
              </p>
            </Section>

            {/* ---- 10. Children ---- */}
            <Section
              id="children"
              icon={Baby}
              title="10. Children\u2019s Privacy"
            >
              <p>
                The Platform is not intended for individuals under 18 years of
                age. We do not knowingly collect personal information from
                children. If we become aware that we have collected data from a
                child under 18, we will take steps to delete it promptly.
              </p>
            </Section>

            {/* ---- 11. Changes ---- */}
            <Section
              id="changes"
              icon={RefreshCw}
              title="11. Changes to This Policy"
            >
              <p>
                We may update this Privacy Policy periodically. We will notify
                you of material changes by posting the new policy on this page
                with an updated &quot;Last updated&quot; date, and for significant
                changes, by sending an email notification. Your continued use of
                the Platform after changes take effect constitutes acceptance of
                the revised policy.
              </p>
            </Section>

            {/* ---- 12. Contact ---- */}
            <Section id="contact" icon={Mail} title="12. Contact Us">
              <p>
                If you have questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
                <p>
                  <strong>O1DMatch</strong>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:privacy@o1dmatch.com"
                    className="text-green-600 hover:underline"
                  >
                    privacy@o1dmatch.com
                  </a>
                </p>
                <p>
                  Contact Page:{" "}
                  <Link
                    href="/contact"
                    className="text-green-600 hover:underline"
                  >
                    o1dmatch.com/contact
                  </Link>
                </p>
              </div>
            </Section>

            {/* ---- Bottom nav ---- */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to Home
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Read Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-white">O1DMatch</span>
            </div>
            <p className="text-gray-400 text-sm text-center">
              Connecting exceptional talent with opportunities for O-1 visa
              sponsorship.
            </p>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} O1DMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}