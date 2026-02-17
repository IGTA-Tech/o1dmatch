/* src/app/terms/page.tsx */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  Scale,
  Ban,
  RefreshCw,
  Mail,
  ChevronRight,
  BookOpen,
  Gavel,
  UserCheck,
  ScrollText,
} from "lucide-react";

export const metadata = {
  title: "Terms of Service | O1DMatch",
  description:
    "Terms and conditions for using the O1DMatch platform — O-1 visa talent matching, petition scoring, and case management.",
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
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
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
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "User Accounts" },
  { id: "platform-services", label: "Platform Services" },
  { id: "user-obligations", label: "User Obligations" },
  { id: "prohibited", label: "Prohibited Activities" },
  { id: "payment", label: "Payment & Subscriptions" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "user-content", label: "User Content" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact Us" },
];

/* ================================================================== */
/*  PAGE                                                                */
/* ================================================================== */
export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="pt-16" />
      {/* ---- Hero ---- */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using the O1DMatch
            platform. By using our services, you agree to be bound by these
            terms.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm text-blue-100">
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
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Privacy Policy →
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* ---- 1. Acceptance ---- */}
            <Section
              id="acceptance"
              icon={BookOpen}
              title="1. Acceptance of Terms"
            >
              <p>
                These Terms of Service (&quot;Terms&quot;) constitute a legally
                binding agreement between you and O1DMatch (&quot;Company,&quot;
                &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) governing
                your access to and use of the O1DMatch platform, including our
                website, applications, APIs, and all related services
                (collectively, the &quot;Platform&quot;).
              </p>
              <p>
                By creating an account, accessing, or using the Platform, you
                acknowledge that you have read, understood, and agree to be
                bound by these Terms and our{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                . If you are using the Platform on behalf of an organization,
                you represent and warrant that you have the authority to bind
                that organization to these Terms.
              </p>
            </Section>

            {/* ---- 2. Eligibility ---- */}
            <Section
              id="eligibility"
              icon={UserCheck}
              title="2. Eligibility"
            >
              <p>To use the Platform, you must:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Be at least 18 years of age.</li>
                <li>
                  Have the legal capacity to enter into a binding agreement.
                </li>
                <li>
                  Not be prohibited from using the Platform under any applicable
                  law or regulation.
                </li>
                <li>
                  Provide accurate, current, and complete registration
                  information.
                </li>
              </ul>
              <p>
                Employer accounts must be registered by authorized
                representatives of legitimate business entities.
              </p>
            </Section>

            {/* ---- 3. Accounts ---- */}
            <Section id="accounts" icon={Users} title="3. User Accounts">
              <h3 className="font-semibold text-gray-900">3.1 Account Types</h3>
              <p>The Platform supports multiple account types:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Talent:</strong> Individuals seeking O-1 visa
                  sponsorship opportunities.
                </li>
                <li>
                  <strong>Employer:</strong> Companies and organizations looking
                  to sponsor O-1 visa candidates.
                </li>
                <li>
                  <strong>Agency:</strong> Immigration agencies and consulting
                  firms managing cases.
                </li>
                <li>
                  <strong>Lawyer:</strong> Immigration attorneys providing legal
                  services.
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-6">
                3.2 Account Security
              </h3>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Maintaining the confidentiality of your login credentials.
                </li>
                <li>
                  All activities that occur under your account.
                </li>
                <li>
                  Notifying us immediately of any unauthorized access or use of
                  your account.
                </li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that we
                reasonably believe have been compromised.
              </p>
            </Section>

            {/* ---- 4. Platform Services ---- */}
            <Section
              id="platform-services"
              icon={ScrollText}
              title="4. Platform Services"
            >
              <p>The Platform provides the following services:</p>

              <h3 className="font-semibold text-gray-900">
                4.1 Talent Matching
              </h3>
              <p>
                We connect Talent with Employers seeking to sponsor O-1 visas.
                Matching is based on skills, experience, and eligibility
                criteria. We do not guarantee any match will result in
                employment, sponsorship, or visa approval.
              </p>

              <h3 className="font-semibold text-gray-900 mt-6">
                4.2 Petition Scoring
              </h3>
              <p>
                Our AI-powered scoring tool evaluates petition documents against
                USCIS officer criteria to provide an estimated score, approval
                probability, and recommendations. Scoring results are
                informational only and do not constitute legal advice or
                guarantee any immigration outcome.
              </p>

              <h3 className="font-semibold text-gray-900 mt-6">
                4.3 Document Generation
              </h3>
              <p>
                The Platform provides tools for generating exhibit packets,
                interest letters, and other immigration-related documents.
                Users are responsible for reviewing all generated documents for
                accuracy before submission to any government agency.
              </p>

              <h3 className="font-semibold text-gray-900 mt-6">
                4.4 Case Management
              </h3>
              <p>
                Employers, agencies, and lawyers may use the Platform to manage
                visa cases, track progress, and collaborate on petition
                preparation.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Important Notice:</strong> O1DMatch is not a law firm
                    and does not provide legal advice. Our scoring tools,
                    document generators, and platform features are informational
                    tools only. For legal advice regarding immigration matters,
                    please consult a qualified immigration attorney.
                  </div>
                </div>
              </div>
            </Section>

            {/* ---- 5. User Obligations ---- */}
            <Section
              id="user-obligations"
              icon={UserCheck}
              title="5. User Obligations"
            >
              <p>By using the Platform, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Provide accurate, truthful, and complete information in your
                  profile, documents, and communications.
                </li>
                <li>
                  Only upload documents that you have the right to share and
                  that do not infringe on any third-party rights.
                </li>
                <li>
                  Use the Platform only for its intended purposes related to
                  O-1 visa talent matching and immigration case support.
                </li>
                <li>
                  Comply with all applicable laws, including U.S. immigration
                  laws and regulations.
                </li>
                <li>
                  Respect the intellectual property rights of O1DMatch and other
                  users.
                </li>
                <li>
                  Not misrepresent your qualifications, credentials, or
                  immigration status.
                </li>
              </ul>
            </Section>

            {/* ---- 6. Prohibited ---- */}
            <Section
              id="prohibited"
              icon={Ban}
              title="6. Prohibited Activities"
            >
              <p>You may not:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Use the Platform for any fraudulent, deceptive, or unlawful
                  purpose, including immigration fraud.
                </li>
                <li>
                  Submit false, misleading, or fabricated documents for scoring
                  or petition preparation.
                </li>
                <li>
                  Attempt to reverse-engineer, scrape, or extract data from our
                  AI scoring algorithms or proprietary systems.
                </li>
                <li>
                  Interfere with, disrupt, or compromise the security or
                  integrity of the Platform.
                </li>
                <li>
                  Create multiple accounts to circumvent credit limits,
                  subscription restrictions, or bans.
                </li>
                <li>
                  Harass, abuse, or send unsolicited communications to other
                  users.
                </li>
                <li>
                  Use automated tools (bots, crawlers, scrapers) to access the
                  Platform without written permission.
                </li>
                <li>
                  Resell, sublicense, or commercially exploit Platform services
                  without authorization.
                </li>
                <li>
                  Upload malware, viruses, or other harmful content.
                </li>
              </ul>
              <p>
                Violation of these prohibitions may result in immediate account
                suspension or termination without refund.
              </p>
            </Section>

            {/* ---- 7. Payment ---- */}
            <Section
              id="payment"
              icon={CreditCard}
              title="7. Payment & Subscriptions"
            >
              <h3 className="font-semibold text-gray-900">
                7.1 Subscription Plans
              </h3>
              <p>
                Certain features require a paid subscription. Subscription plans,
                pricing, and included features are described on our pricing page.
                We reserve the right to modify pricing with 30 days&apos; notice.
              </p>

              <h3 className="font-semibold text-gray-900 mt-6">
                7.2 Billing & Payment
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Payments are processed securely through Stripe. By providing
                  payment information, you authorize us to charge your payment
                  method for all fees incurred.
                </li>
                <li>
                  Subscriptions renew automatically unless cancelled before the
                  renewal date.
                </li>
                <li>All fees are quoted in U.S. dollars unless stated otherwise.</li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-6">
                7.3 Credits System
              </h3>
              <p>
                Certain features, such as re-scoring petitions, operate on a
                credit-based system. Credits are allocated monthly based on your
                subscription tier (e.g., 10 re-score credits per month for
                Employer accounts). Unused credits expire at the end of each
                calendar month and do not roll over. Credits are non-transferable
                and non-refundable.
              </p>

              <h3 className="font-semibold text-gray-900 mt-6">
                7.4 Refund Policy
              </h3>
              <p>
                Subscription fees are generally non-refundable. If you believe
                you are entitled to a refund due to a service issue, please
                contact us within 14 days of the charge. Refund requests are
                evaluated on a case-by-case basis.
              </p>
            </Section>

            {/* ---- 8. Intellectual Property ---- */}
            <Section
              id="intellectual-property"
              icon={FileText}
              title="8. Intellectual Property"
            >
              <p>
                The Platform, including its design, code, algorithms, scoring
                methodologies, text, graphics, logos, and all other content
                created by O1DMatch, is our intellectual property and is
                protected by copyright, trademark, and other applicable laws.
              </p>
              <p>
                We grant you a limited, non-exclusive, non-transferable,
                revocable license to access and use the Platform for its intended
                purpose during your active subscription or account.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or create derivative
                works based on the Platform or its content without our explicit
                written consent.
              </p>
            </Section>

            {/* ---- 9. User Content ---- */}
            <Section
              id="user-content"
              icon={Users}
              title="9. User Content"
            >
              <p>
                You retain ownership of all documents, profiles, and other
                content you upload to the Platform (&quot;User Content&quot;). By
                uploading User Content, you grant us a limited, non-exclusive
                license to process, store, and display your content as necessary
                to provide the Platform services, including sending your
                documents to our AI scoring service for analysis.
              </p>
              <p>
                You represent and warrant that you have the rights to upload all
                User Content and that it does not violate any third-party rights
                or applicable laws.
              </p>
              <p>
                We do not claim ownership of your User Content and will not use
                it for purposes other than providing Platform services without
                your explicit consent.
              </p>
            </Section>

            {/* ---- 10. Disclaimers ---- */}
            <Section
              id="disclaimers"
              icon={AlertTriangle}
              title="10. Disclaimers"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800 font-medium">
                  THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                  AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                  OR IMPLIED.
                </p>
              </div>
              <p>We specifically disclaim any warranties regarding:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Immigration Outcomes:</strong> We do not guarantee O-1
                  visa approval, RFE avoidance, or any specific immigration
                  result. Scoring results are estimates and not predictions of
                  USCIS decisions.
                </li>
                <li>
                  <strong>Employment Results:</strong> We do not guarantee that
                  Talent will find employment or that Employers will find
                  suitable candidates through the Platform.
                </li>
                <li>
                  <strong>Scoring Accuracy:</strong> AI-generated scores and
                  recommendations are informational and may not reflect actual
                  USCIS officer assessments.
                </li>
                <li>
                  <strong>Document Accuracy:</strong> Auto-generated documents
                  (exhibits, interest letters) require user review and should
                  not be submitted without verification by a qualified
                  professional.
                </li>
                <li>
                  <strong>Uptime & Availability:</strong> While we strive for
                  continuous availability, we do not guarantee uninterrupted or
                  error-free service.
                </li>
              </ul>
            </Section>

            {/* ---- 11. Liability ---- */}
            <Section
              id="liability"
              icon={Shield}
              title="11. Limitation of Liability"
            >
              <p>
                To the maximum extent permitted by applicable law, O1DMatch and
                its officers, directors, employees, agents, and affiliates shall
                not be liable for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Any indirect, incidental, special, consequential, or punitive
                  damages arising from your use of or inability to use the
                  Platform.
                </li>
                <li>
                  Loss of data, revenue, profits, or business opportunities.
                </li>
                <li>
                  Adverse immigration outcomes, including visa denials, RFEs,
                  or processing delays.
                </li>
                <li>
                  Actions or omissions of other users, employers, lawyers, or
                  agencies on the Platform.
                </li>
                <li>
                  Errors or inaccuracies in AI-generated scores, documents, or
                  recommendations.
                </li>
              </ul>
              <p>
                Our total aggregate liability for any claims arising from or
                related to these Terms or the Platform shall not exceed the
                amount you paid to us in the twelve (12) months preceding the
                claim.
              </p>
            </Section>

            {/* ---- 12. Indemnification ---- */}
            <Section
              id="indemnification"
              icon={Shield}
              title="12. Indemnification"
            >
              <p>
                You agree to indemnify, defend, and hold harmless O1DMatch and
                its officers, directors, employees, and agents from and against
                any claims, liabilities, damages, losses, and expenses
                (including reasonable attorneys&apos; fees) arising out of or
                related to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your use or misuse of the Platform.</li>
                <li>Your violation of these Terms.</li>
                <li>Your violation of any applicable law or regulation.</li>
                <li>
                  Any content you upload that infringes on third-party rights.
                </li>
                <li>
                  Any false or misleading information you provide through the
                  Platform.
                </li>
              </ul>
            </Section>

            {/* ---- 13. Termination ---- */}
            <Section
              id="termination"
              icon={Ban}
              title="13. Termination"
            >
              <p>
                <strong>By You:</strong> You may terminate your account at any
                time through your account settings or by contacting us. Upon
                termination, your right to access the Platform ceases
                immediately. Pre-paid subscription fees are non-refundable.
              </p>
              <p>
                <strong>By Us:</strong> We may suspend or terminate your account
                at any time, with or without notice, for conduct that we
                determine, in our sole discretion, violates these Terms, is
                harmful to other users or the Platform, or is otherwise
                objectionable.
              </p>
              <p>
                Upon termination, we will retain your data in accordance with
                our{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                . Sections regarding disclaimers, limitation of liability,
                indemnification, and governing law survive termination.
              </p>
            </Section>

            {/* ---- 14. Governing Law ---- */}
            <Section
              id="governing-law"
              icon={Gavel}
              title="14. Governing Law"
            >
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the State of Delaware, United States, without
                regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising under these Terms shall be resolved through
                binding arbitration administered by the American Arbitration
                Association (AAA) in accordance with its rules. The arbitration
                shall take place in Delaware, and the arbitrator&apos;s decision
                shall be final and binding.
              </p>
              <p>
                You agree that any dispute resolution proceedings will be
                conducted only on an individual basis and not in a class,
                consolidated, or representative action.
              </p>
            </Section>

            {/* ---- 15. Changes ---- */}
            <Section
              id="changes"
              icon={RefreshCw}
              title="15. Changes to Terms"
            >
              <p>
                We reserve the right to modify these Terms at any time. We will
                provide notice of material changes by posting the updated Terms
                on this page with a revised &quot;Last updated&quot; date and,
                for significant changes, by notifying you via email or
                in-platform notification.
              </p>
              <p>
                Your continued use of the Platform after the revised Terms take
                effect constitutes your acceptance of the changes. If you do not
                agree to the modified Terms, you must stop using the Platform
                and close your account.
              </p>
            </Section>

            {/* ---- 16. Contact ---- */}
            <Section id="contact" icon={Mail} title="16. Contact Us">
              <p>
                If you have questions or concerns about these Terms, please
                contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
                <p>
                  <strong>O1DMatch</strong>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:legal@o1dmatch.com"
                    className="text-blue-600 hover:underline"
                  >
                    legal@o1dmatch.com
                  </a>
                </p>
                <p>
                  Contact Page:{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:underline"
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
                href="/privacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Read Privacy Policy →
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