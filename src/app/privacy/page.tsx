/* src/app/privacy/page.tsx */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield, Lock, Eye, Database, Share2, Trash2,
  Globe, Mail, Baby, RefreshCw, ChevronRight, FileText,
  Users, AlertTriangle, List, Scale,
} from "lucide-react";
import "@/app/theme.css";

export const metadata = {
  title: "Privacy Policy | O1DMatch",
  description:
    "Learn how O1DMatch collects, uses, and protects your personal data on our O-1 visa talent platform.",
};

/* ─────────────────────────────────────────────────────────
   Section component
───────────────────────────────────────────────────────── */
function Section({
  id, icon: Icon, title, children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: "6rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.1rem" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#D4A84B",
        }}>
          <Icon size={18} />
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.25rem", fontWeight: 700, color: "#0B1D35", margin: 0,
        }}>
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: "3rem" }} className="terms-body">
        {children}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   TOC
───────────────────────────────────────────────────────── */
const tocItems = [
  { id: "information-collected", label: "1. Information We Collect" },
  { id: "how-we-use",            label: "2. How We Use Your Information" },
  { id: "anonymization",         label: "3. Anonymization of Talent Profiles" },
  { id: "data-sharing",          label: "4. When We Share Your Information" },
  { id: "data-retention",        label: "5. Data Retention" },
  { id: "your-rights",           label: "6. Your Rights and Choices" },
  { id: "cookies",               label: "7. Cookies and Tracking" },
  { id: "third-party-services",  label: "8. Third-Party Services" },
  { id: "international",         label: "9. International Data Transfers" },
  { id: "children",              label: "10. Children's Privacy" },
  { id: "data-security",         label: "11. Security Measures" },
  { id: "state-rights",          label: "12. California and State Rights" },
  { id: "changes",               label: "13. Changes to This Policy" },
  { id: "contact",               label: "14. Contact Information" },
  { id: "additional",            label: "15. Additional Disclosures" },
];

/* ─────────────────────────────────────────────────────────
   Page (Server Component — no "use client")
───────────────────────────────────────────────────────── */
export default function PrivacyPolicyPage() {
  return (
    <div className="o1d-page" style={{ minHeight: "100vh", background: "#FBF8F1" }}>
      <Navbar />

      {/* ── Navy Hero ── */}
      <section style={{
        background: "#0B1D35",
        position: "relative",
        overflow: "hidden",
        paddingTop: "5rem",
        paddingBottom: "4rem",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Gold glow */}
        <div style={{
          position: "absolute", top: "-40%", right: "-15%",
          width: 700, height: 700, pointerEvents: "none",
          background: "radial-gradient(circle,rgba(212,168,75,0.08) 0%,transparent 70%)",
        }} />

        <div style={{
          maxWidth: 760, margin: "0 auto", padding: "0 1.5rem",
          textAlign: "center", position: "relative", zIndex: 2,
        }}>
          {/* Icon tile */}
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 1.5rem",
            background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#D4A84B",
          }}>
            <Shield size={30} />
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "3rem", fontWeight: 700, color: "#FFFFFF",
            marginBottom: "1rem", lineHeight: 1.1,
          }}>
            Privacy{" "}
            <em style={{ fontStyle: "normal", color: "#D4A84B" }}>Policy</em>
          </h1>

          <p style={{
            fontSize: "1.05rem", color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7, maxWidth: 560, margin: "0 auto 1.5rem",
          }}>
            Your privacy matters. Learn how O1DMatch collects, uses, and
            safeguards your personal information.
          </p>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(212,168,75,0.1)", border: "1px solid rgba(212,168,75,0.2)",
            borderRadius: 100, padding: "0.4rem 1.1rem",
            fontSize: "0.8rem", color: "#E8C97A", fontWeight: 500,
          }}>
            <RefreshCw size={13} />
            Last updated: March 25, 2026
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <div
          className="terms-layout"
          style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}
        >

          {/* ── Sticky Sidebar ── */}
          <aside className="terms-sidebar" style={{ width: 220, flexShrink: 0 }}>
            <div style={{ position: "sticky", top: "6rem" }}>

              {/* TOC card */}
              <div style={{
                background: "#FFFFFF", borderRadius: 14,
                border: "1.5px solid #E8E0D4",
                padding: "1.25rem", marginBottom: "1rem",
              }}>
                <p style={{
                  fontSize: "0.65rem", fontWeight: 700, color: "#D4A84B",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.9rem",
                }}>
                  On This Page
                </p>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="terms-toc-link"
                      style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        fontSize: "0.78rem", color: "#64748B",
                        padding: "0.3rem 0",
                      }}
                    >
                      <ChevronRight size={11} style={{ color: "#D4A84B", flexShrink: 0 }} />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Terms link card */}
              <div style={{
                background: "#0B1D35", borderRadius: 12,
                padding: "1rem 1.1rem",
                display: "flex", alignItems: "center", gap: "0.6rem",
              }}>
                <FileText size={16} style={{ color: "#D4A84B", flexShrink: 0 }} />
                <Link href="/terms" style={{
                  fontSize: "0.8rem", fontWeight: 600,
                  color: "#E8C97A", textDecoration: "none",
                }}>
                  Terms of Service →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* Preamble */}
            <div className="terms-body" style={{ marginBottom: 0 }}>
              <p>
                This Privacy Policy describes how O1D Match LLC (&quot;O1DMatch,&quot; &quot;we,&quot;
                &quot;us,&quot; or &quot;our&quot;), a Florida limited liability company operating within
                the Innovative Global Talent Agency (IGTA) network, collects, uses, discloses, and
                protects information in connection with the O1DMatch platform, including the websites
                located at o1dmatch.com and app.o1dmatch.com, and all related services (collectively,
                the &quot;Platform&quot;).
              </p>
              <p>
                By accessing or using the Platform, you agree to the collection, use, and disclosure
                of your information as described in this Privacy Policy. If you do not agree with this
                Privacy Policy, do not use the Platform. This Privacy Policy is incorporated into and
                subject to our{" "}
                <Link href="/terms" className="terms-link">Terms of Service</Link>.
              </p>
            </div>

            {/* 1. Information We Collect */}
            <Section id="information-collected" icon={Database} title="1. Information We Collect">
              <h3 className="terms-sub">1.1 Information You Provide Directly</h3>
              <p>
                We collect information you voluntarily provide when you create an account, build a
                profile, use Platform features, or communicate with us, including:
              </p>

              <p><strong>(a) Account and Profile Information:</strong></p>
              <ul>
                <li>Full name, email address, phone number, and login credentials</li>
                <li>Professional title, employer/organization name, and work history</li>
                <li>Educational background, degrees, and institutions</li>
                <li>Country of origin, nationality, and immigration status information</li>
                <li>Professional achievements, awards, publications, patents, memberships, and other evidence of extraordinary ability</li>
                <li>Photographs and profile images</li>
                <li>Biography and professional summary</li>
                <li>User type (Talent, Employer, Staffing Agency, or Immigration Attorney)</li>
                <li>For Attorneys: bar admission information, licensing jurisdictions, practice areas, and firm affiliation</li>
                <li>For Employers/Agencies: company name, size, industry, EIN, and business information</li>
              </ul>

              <p><strong>(b) Documents and Evidence:</strong></p>
              <ul>
                <li>Resumes, curricula vitae, and cover letters</li>
                <li>Evidence documents supporting O-1 visa criteria (awards documentation, publication records, membership certificates, press coverage, salary information, contracts, recommendation letters, and similar materials)</li>
                <li>Interest letters and related correspondence</li>
                <li>Job postings and job descriptions</li>
                <li>Any other files, documents, or materials you upload to the Platform</li>
              </ul>

              <p><strong>(c) Communications:</strong></p>
              <ul>
                <li>Messages sent through the Platform&apos;s messaging features</li>
                <li>Communications with O1DMatch support</li>
                <li>Survey responses and feedback</li>
              </ul>

              <p><strong>(d) Payment Information:</strong></p>
              <ul>
                <li>Billing name and address</li>
                <li>Payment card information (processed and stored by Stripe; O1DMatch does not store full card numbers)</li>
                <li>Subscription plan and billing history</li>
                <li>Promotional code usage</li>
              </ul>

              <h3 className="terms-sub">1.2 Information Collected Automatically</h3>
              <p>When you access or use the Platform, we automatically collect certain information, including:</p>

              <p><strong>(a) Usage Data:</strong></p>
              <ul>
                <li>Pages and features accessed, actions taken on the Platform</li>
                <li>Search queries and browsing activity within the Platform</li>
                <li>AI scores viewed, interest letters generated, and matches explored</li>
                <li>Date, time, frequency, and duration of Platform use</li>
                <li>Referring and exit pages</li>
              </ul>

              <p><strong>(b) Device and Technical Information:</strong></p>
              <ul>
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system and device type</li>
                <li>Screen resolution and language preferences</li>
                <li>Unique device identifiers</li>
              </ul>

              <p><strong>(c) Cookies and Similar Technologies:</strong></p>
              <ul>
                <li>Session cookies (to maintain your login state)</li>
                <li>Persistent cookies (to remember your preferences)</li>
                <li>Analytics cookies (to understand Platform usage patterns)</li>
              </ul>
              <p>See Section 7 for more information about cookies.</p>

              <h3 className="terms-sub">1.3 Information from Third Parties</h3>
              <p>We may receive information about you from third parties, including:</p>
              <ul>
                <li>Payment verification information from Stripe</li>
                <li>Authentication data if you sign in using third-party services (e.g., Google OAuth)</li>
                <li>Publicly available professional information to supplement your profile (with your consent, where required)</li>
              </ul>
            </Section>

            {/* 2. How We Use Your Information */}
            <Section id="how-we-use" icon={Eye} title="2. How We Use Your Information">
              <p>We use the information we collect for the following purposes:</p>

              <h3 className="terms-sub">2.1 Platform Operations and Service Delivery</h3>
              <ul>
                <li>Creating and managing your account</li>
                <li>Facilitating connections between Talent, Employers, Agencies, and Attorneys</li>
                <li>Processing and displaying job postings</li>
                <li>Enabling messaging and communication between Users</li>
                <li>Processing subscription payments and billing</li>
              </ul>

              <h3 className="terms-sub">2.2 AI-Powered Features</h3>
              <ul>
                <li>Performing AI evidence scoring and assessment across the eight USCIS O-1 extraordinary ability criteria</li>
                <li>Generating interest letters using AI-assisted templates</li>
                <li>Matching talent with relevant job opportunities and employers</li>
                <li>Providing AI-generated recommendations and assessments</li>
                <li>Training, improving, and developing our AI models and scoring algorithms</li>
              </ul>

              <h3 className="terms-sub">2.3 Anonymization and Matching</h3>
              <ul>
                <li>Creating anonymized talent profiles for display to Employers and Agencies</li>
                <li>Facilitating the matching process while protecting talent identity until consent is given</li>
                <li>Generating anonymized and aggregated data for analytics and platform improvement</li>
              </ul>

              <h3 className="terms-sub">2.4 Communications</h3>
              <ul>
                <li>Sending transactional emails (account verification, password resets, subscription confirmations)</li>
                <li>Sending notifications about matches, interest letters, messages, and Platform activity</li>
                <li>Sending service updates and announcements</li>
                <li>Responding to your inquiries and support requests</li>
              </ul>

              <h3 className="terms-sub">2.5 Analytics and Improvement</h3>
              <ul>
                <li>Understanding how Users interact with the Platform</li>
                <li>Analyzing usage patterns to improve features and user experience</li>
                <li>Conducting research and generating aggregated, anonymized insights</li>
                <li>Debugging, testing, and improving Platform performance and security</li>
              </ul>

              <h3 className="terms-sub">2.6 Legal and Compliance</h3>
              <ul>
                <li>Complying with applicable laws, regulations, and legal processes</li>
                <li>Enforcing our Terms of Service and other agreements</li>
                <li>Protecting the rights, property, and safety of O1DMatch, our Users, and the public</li>
                <li>Detecting and preventing fraud, abuse, and security threats</li>
              </ul>
            </Section>

            {/* 3. Anonymization */}
            <Section id="anonymization" icon={Users} title="3. Anonymization of Talent Profiles">
              <h3 className="terms-sub">3.1 Anonymized Display</h3>
              <p>
                Talent profiles are displayed to Employers and Agencies in an anonymized format.
                Personally identifying information — including name, contact information, specific
                employer names, and other details that could directly identify the talent — is
                redacted or obscured in the anonymized profile view.
              </p>

              <h3 className="terms-sub">3.2 Identity Disclosure</h3>
              <p>
                A Talent User&apos;s identity is revealed to an Employer or Agency only when the
                Talent User affirmatively accepts an interest letter or otherwise explicitly consents
                to identity disclosure through the Platform&apos;s designated mechanisms.
              </p>

              <h3 className="terms-sub">3.3 Limitations</h3>
              <div className="terms-alert terms-alert-gold">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  While O1DMatch takes reasonable steps to anonymize talent profiles, we cannot
                  guarantee that a talent&apos;s identity cannot be inferred from the content of
                  their profile, evidence, achievements, or other information they choose to include.
                  Users acknowledge this inherent limitation.
                </div>
              </div>
            </Section>

            {/* 4. When We Share */}
            <Section id="data-sharing" icon={Share2} title="4. When We Share Your Information">
              <p>
                O1DMatch does not sell your personal information. We share your information only in
                the following circumstances:
              </p>

              <h3 className="terms-sub">4.1 With Other Platform Users</h3>
              <ul>
                <li><strong>Anonymized Talent Profiles:</strong> Employers and Agencies can view anonymized talent profiles as described in Section 3.</li>
                <li><strong>Revealed Profiles:</strong> When a Talent User consents to identity disclosure, relevant profile information is shared with the applicable Employer or Agency.</li>
                <li><strong>Employer/Job Information:</strong> Job postings and employer information are visible to Talent Users and Attorneys.</li>
                <li><strong>Attorney Directory:</strong> Attorney profile information is visible to other Users browsing the directory.</li>
                <li><strong>Messages:</strong> Messages sent through the Platform are shared with the intended recipients.</li>
              </ul>

              <h3 className="terms-sub">4.2 With Service Providers</h3>
              <p>
                We share information with third-party service providers who perform services on our
                behalf, including:
              </p>
              <ul>
                <li><strong>Stripe, Inc.</strong> — Payment processing, subscription management, and billing</li>
                <li><strong>Supabase</strong> — Database hosting, authentication, and backend infrastructure</li>
                <li><strong>SendGrid (Twilio)</strong> — Transactional and notification email delivery</li>
                <li><strong>Google Analytics (if applicable)</strong> — Website analytics and usage tracking</li>
                <li><strong>Cloud hosting providers</strong> — Data storage and computing infrastructure</li>
                <li><strong>AI service providers</strong> — AI model hosting and processing</li>
              </ul>
              <p>
                These service providers are contractually obligated to use your information only for
                the purposes of providing services to O1DMatch and in accordance with applicable data
                protection laws.
              </p>

              <h3 className="terms-sub">4.3 For Legal Compliance</h3>
              <p>We may disclose your information when we believe in good faith that disclosure is necessary to:</p>
              <ul>
                <li>Comply with applicable law, regulation, legal process, or governmental request</li>
                <li>Enforce our Terms of Service or other agreements</li>
                <li>Protect the rights, property, or safety of O1DMatch, our Users, or the public</li>
                <li>Detect, prevent, or address fraud, security, or technical issues</li>
                <li>Respond to lawful requests from law enforcement or government agencies</li>
              </ul>

              <h3 className="terms-sub">4.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, reorganization, bankruptcy, asset sale, or
                other business transfer involving O1DMatch (or its parent, the Innovative Global
                Talent Agency network), your information may be transferred to the acquiring or
                successor entity. We will notify you via email and/or a prominent notice on the
                Platform of any such change in ownership and any choices you may have regarding
                your information.
              </p>

              <h3 className="terms-sub">4.5 With Your Consent</h3>
              <p>
                We may share your information with third parties when you provide explicit consent
                to such sharing.
              </p>

              <h3 className="terms-sub">4.6 Aggregated and De-Identified Data</h3>
              <p>
                We may share aggregated, anonymized, or de-identified data that cannot reasonably
                be used to identify you with third parties for research, analytics, marketing, or
                other purposes.
              </p>
            </Section>

            {/* 5. Data Retention */}
            <Section id="data-retention" icon={Trash2} title="5. Data Retention">
              <h3 className="terms-sub">5.1 Active Accounts</h3>
              <p>
                We retain your personal information for as long as your account remains active and
                as needed to provide the Platform&apos;s services.
              </p>

              <h3 className="terms-sub">5.2 After Account Closure</h3>
              <p>Following account deletion or termination, O1DMatch retains your information for a reasonable period as necessary to:</p>
              <ul>
                <li>Comply with legal obligations (including tax, financial reporting, and immigration-related record-keeping requirements)</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Prevent fraud and abuse</li>
                <li>Maintain platform integrity and security</li>
                <li>Fulfill the legitimate business purposes described in this Privacy Policy</li>
              </ul>

              <h3 className="terms-sub">5.3 Retention Periods</h3>
              <p>
                Specific retention periods vary by data type and purpose. Generally, we retain
                account data for a minimum of three (3) years following account closure, and
                financial/billing records for a minimum of seven (7) years as required by tax and
                financial regulations. AI training data derived from your Content may be retained
                indefinitely in anonymized or aggregated form.
              </p>
              <div style={{ overflowX: "auto", marginBottom: "0.85rem" }}>
                <table style={{
                  width: "100%", fontSize: "0.85rem",
                  borderCollapse: "collapse", borderRadius: 12, overflow: "hidden",
                  border: "1px solid #E8E0D4",
                }}>
                  <thead>
                    <tr style={{ background: "#0B1D35" }}>
                      {["Data Type", "Retention Period", "Notes"].map((h) => (
                        <th key={h} style={{
                          padding: "0.7rem 1rem", textAlign: "left",
                          fontWeight: 600, color: "#E8C97A", fontSize: "0.8rem",
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Account and Profile Data",    "Until account deletion",          "Deleted within 30 days of deletion request"],
                      ["Evidence Documents",          "Until deleted or account closed", "You may delete individual documents at any time"],
                      ["Interest Letters",            "Until deleted or account closed", "Letters submitted to USCIS should be retained by employer separately"],
                      ["O-1 Scores and Session Data", "Duration of active subscription", "Accessible in dashboard; deleted on account close"],
                      ["Payment Records",             "7 years minimum",                 "Required by tax and financial regulations"],
                      ["Communications and Messages", "2 years from last activity",      "Exportable on request"],
                      ["Log and Audit Data",          "90 days",                         "Automatically purged"],
                      ["AI Training Data",            "Indefinite (anonymized only)",    "De-identified; cannot be linked back to individual users"],
                    ].map(([type, period, notes], i) => (
                      <tr key={type} style={{
                        background: i % 2 === 0 ? "#FFFFFF" : "#FBF8F1",
                        borderTop: "1px solid #E8E0D4",
                      }}>
                        <td style={{ padding: "0.65rem 1rem", fontWeight: 600, color: "#0B1D35" }}>{type}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#475569" }}>{period}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#475569" }}>{notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="terms-sub">5.4 Deletion</h3>
              <p>
                When personal information is no longer needed for any retained purpose, we will
                delete or anonymize it in accordance with our data management practices. Deletion
                from backup systems may take additional time.
              </p>
            </Section>

            {/* 6. Your Rights */}
            <Section id="your-rights" icon={Shield} title="6. Your Rights and Choices">
              <h3 className="terms-sub">6.1 Access and Correction</h3>
              <p>
                You may access and update most of your personal information through your account
                settings on the Platform. If you need assistance accessing or correcting information
                that is not available through your account settings, contact us at{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>.
              </p>

              <h3 className="terms-sub">6.2 Account Deletion</h3>
              <p>
                You may request deletion of your account by using the account deletion feature in
                your settings or by contacting us at{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>.
                Please note that:
              </p>
              <ul>
                <li>Account deletion does not result in immediate deletion of all your data. We retain certain information as described in Section 5.</li>
                <li>We may retain information necessary for legal compliance, dispute resolution, fraud prevention, and enforcement of our Terms of Service.</li>
                <li>Aggregated or anonymized data derived from your information may be retained indefinitely.</li>
                <li>Content shared with other Users (such as messages or revealed profile information) may remain visible to those Users.</li>
              </ul>

              <h3 className="terms-sub">6.3 Communication Preferences</h3>
              <p>
                You may opt out of non-essential marketing communications by following the
                unsubscribe instructions in our emails or adjusting your notification preferences
                in your account settings. You cannot opt out of transactional communications
                necessary for Platform operations (such as billing confirmations, security alerts,
                and Terms of Service updates).
              </p>

              <h3 className="terms-sub">6.4 Cookie Preferences</h3>
              <p>
                You may manage cookie preferences through your browser settings. Please note that
                disabling certain cookies may impair Platform functionality. See Section 7 for
                more information.
              </p>
            </Section>

            {/* 7. Cookies */}
            <Section id="cookies" icon={Eye} title="7. Cookies and Tracking Technologies">
              <h3 className="terms-sub">7.1 Types of Cookies We Use</h3>
              <div style={{ overflowX: "auto", marginBottom: "0.85rem" }}>
                <table style={{
                  width: "100%", fontSize: "0.85rem",
                  borderCollapse: "collapse", borderRadius: 12, overflow: "hidden",
                  border: "1px solid #E8E0D4",
                }}>
                  <thead>
                    <tr style={{ background: "#0B1D35" }}>
                      {["Type", "Purpose", "Duration"].map((h) => (
                        <th key={h} style={{
                          padding: "0.7rem 1rem", textAlign: "left",
                          fontWeight: 600, color: "#E8C97A", fontSize: "0.8rem",
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Strictly Necessary", "Session management, authentication, security — cannot be disabled", "Session"],
                      ["Functional",         "User preferences, display settings, language preferences",           "1 year"],
                      ["Analytics",          "Usage patterns, feature adoption, Platform performance",             "2 years"],
                      ["Performance",        "Monitor Platform performance and identify issues",                    "Session"],
                    ].map(([type, purpose, duration], i) => (
                      <tr key={type} style={{
                        background: i % 2 === 0 ? "#FFFFFF" : "#FBF8F1",
                        borderTop: "1px solid #E8E0D4",
                      }}>
                        <td style={{ padding: "0.65rem 1rem", fontWeight: 600, color: "#0B1D35" }}>{type}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#475569" }}>{purpose}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#475569" }}>{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="terms-sub">7.2 Managing Cookies</h3>
              <p>
                Most web browsers allow you to control cookies through their settings. You can set
                your browser to refuse cookies or alert you when cookies are being sent. However,
                some Platform features may not function properly without cookies.
              </p>

              <h3 className="terms-sub">7.3 Do Not Track</h3>
              <p>
                The Platform does not currently respond to &quot;Do Not Track&quot; browser signals,
                as there is no industry-wide standard for this technology.
              </p>
            </Section>

            {/* 8. Third-Party Services */}
            <Section id="third-party-services" icon={Globe} title="8. Third-Party Services">
              <p>
                The Platform integrates with and relies on third-party services. Each third-party
                service has its own privacy policy governing its collection and use of data:
              </p>
              <div style={{ overflowX: "auto", marginBottom: "0.85rem" }}>
                <table style={{
                  width: "100%", fontSize: "0.85rem",
                  borderCollapse: "collapse", borderRadius: 12, overflow: "hidden",
                  border: "1px solid #E8E0D4",
                }}>
                  <thead>
                    <tr style={{ background: "#0B1D35" }}>
                      {["Provider", "Purpose", "Privacy Policy"].map((h) => (
                        <th key={h} style={{
                          padding: "0.7rem 1rem", textAlign: "left",
                          fontWeight: 600, color: "#E8C97A", fontSize: "0.8rem",
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Stripe, Inc.",      "Payment processing",           "stripe.com/privacy"],
                      ["Supabase",          "Backend infrastructure",       "supabase.com/privacy"],
                      ["Twilio / SendGrid", "Email delivery",               "twilio.com/legal/privacy"],
                      ["Google Analytics",  "Analytics (if applicable)",    "policies.google.com/privacy"],
                    ].map(([provider, purpose, policy], i) => (
                      <tr key={provider} style={{
                        background: i % 2 === 0 ? "#FFFFFF" : "#FBF8F1",
                        borderTop: "1px solid #E8E0D4",
                      }}>
                        <td style={{ padding: "0.65rem 1rem", fontWeight: 600, color: "#0B1D35" }}>{provider}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#475569" }}>{purpose}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#475569" }}>
                          <a
                            href={`https://${policy}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#D4A84B", textDecoration: "none" }}
                          >
                            {policy}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                O1DMatch is not responsible for the privacy practices of third-party services. We
                encourage you to review the privacy policies of any third-party services you interact
                with.
              </p>
            </Section>

            {/* 9. International */}
            <Section id="international" icon={Globe} title="9. International Data Transfers">
              <h3 className="terms-sub">9.1 Data Processing in the United States</h3>
              <p>
                The Platform is operated from the United States, and your information is processed
                and stored in the United States. If you access the Platform from outside the United
                States, you understand and consent to the transfer, processing, and storage of your
                information in the United States, where data protection laws may differ from those
                in your country of residence.
              </p>

              <h3 className="terms-sub">9.2 Consent to Transfer</h3>
              <p>
                By using the Platform, you explicitly consent to the transfer of your personal
                information to the United States and acknowledge that U.S. data protection laws may
                not provide the same level of protection as the laws of your home country.
              </p>

              <h3 className="terms-sub">9.3 Safeguards</h3>
              <p>
                We implement reasonable administrative, technical, and physical safeguards to
                protect your information regardless of where it is processed.
              </p>

              <div className="terms-alert terms-alert-gold">
                <Globe size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Note for non-US Talent:</strong> By using O1DMatch, you understand that
                  your profile information, evidence documentation, and O-1 score may be shared with
                  US-based employers as part of the Platform&apos;s core matching functionality.
                  This cross-border data sharing is necessary to deliver the services you have
                  requested.
                </div>
              </div>
            </Section>

            {/* 10. Children */}
            <Section id="children" icon={Baby} title="10. Children's Privacy">
              <p>
                The Platform is not intended for use by individuals under the age of eighteen (18).
                We do not knowingly collect personal information from children under 18.
              </p>
              <p>
                If we become aware that we have collected personal information from a child under 18,
                we will take steps to delete such information promptly.
              </p>
              <p>
                If you believe that we have inadvertently collected information from a child under 18,
                please contact us immediately at{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>.
              </p>
            </Section>

            {/* 11. Security */}
            <Section id="data-security" icon={Lock} title="11. Security Measures">
              <h3 className="terms-sub">11.1 Technical Safeguards</h3>
              <p>O1DMatch implements industry-standard technical security measures to protect your information, including:</p>
              <ul>
                <li>Encryption of data in transit using TLS/SSL</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure authentication mechanisms and password hashing</li>
                <li>Access controls and role-based permissions</li>
                <li>Regular security assessments and monitoring</li>
              </ul>

              <h3 className="terms-sub">11.2 Operational Safeguards</h3>
              <p>We maintain operational security measures including:</p>
              <ul>
                <li>Limiting access to personal information to authorized personnel who need it for legitimate business purposes</li>
                <li>Employee and contractor confidentiality obligations</li>
                <li>Incident response procedures for potential data breaches</li>
                <li>Regular review and updating of security practices</li>
              </ul>

              <h3 className="terms-sub">11.3 No Absolute Guarantee</h3>
              <p>
                While we take reasonable measures to protect your information, no method of electronic
                transmission or storage is 100% secure. We cannot guarantee the absolute security of
                your information. You use the Platform and transmit information at your own risk.
              </p>

              <h3 className="terms-sub">11.4 Breach Notification</h3>
              <p>
                In the event of a data breach that affects your personal information, we will notify
                you and applicable regulatory authorities as required by law.
              </p>
            </Section>

            {/* 12. California and State Rights */}
            <Section id="state-rights" icon={Scale} title="12. California and State Privacy Rights">
              <h3 className="terms-sub">12.1 California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)</h3>
              <p>If you are a California resident, you may have additional rights under the CCPA/CPRA, including:</p>
              <ul>
                <li>
                  <strong>Right to Know:</strong> You have the right to request information about the
                  categories and specific pieces of personal information we have collected about you,
                  the sources of that information, the business purposes for collection, and the
                  categories of third parties with whom we share it.
                </li>
                <li>
                  <strong>Right to Delete:</strong> You have the right to request deletion of your
                  personal information, subject to certain exceptions (such as legal compliance,
                  completing transactions, and security purposes).
                </li>
                <li>
                  <strong>Right to Correct:</strong> You have the right to request correction of
                  inaccurate personal information.
                </li>
                <li>
                  <strong>Right to Opt-Out of Sale/Sharing:</strong> O1DMatch does not sell your
                  personal information. We do not share personal information for cross-context
                  behavioral advertising.
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
                  for exercising your privacy rights.
                </li>
                <li>
                  <strong>Authorized Agent:</strong> You may designate an authorized agent to make
                  requests on your behalf, subject to verification.
                </li>
              </ul>

              <h3 className="terms-sub">12.2 Exercising California Rights</h3>
              <p>
                To exercise your California privacy rights, contact us at{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>{" "}
                or call{" "}
                <a href="tel:+15617944621" className="terms-link">(561) 794-4621</a>.
                We will verify your identity before processing your request.
              </p>

              <h3 className="terms-sub">12.3 Categories of Information Collected</h3>
              <p>
                In the preceding twelve (12) months, we have collected the following categories of
                personal information: identifiers (name, email, phone, IP address);
                professional/employment information; education information; internet/electronic
                network activity; geolocation data (derived from IP address); and inferences drawn
                from the above.
              </p>

              <h3 className="terms-sub">12.4 Other State Privacy Laws</h3>
              <p>
                If you reside in a state with additional consumer privacy protections (such as
                Virginia, Colorado, Connecticut, Utah, or others), you may have similar rights to
                access, delete, correct, and opt out. Contact us at{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>{" "}
                to exercise any applicable rights.
              </p>

              <div className="terms-alert terms-alert-gold">
                <Shield size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>California Residents (CCPA):</strong> You have the right to know what
                  personal information we collect, request its deletion, and opt out of the sale of
                  personal information. We do not sell personal information.
                </div>
              </div>
            </Section>

            {/* 13. Changes */}
            <Section id="changes" icon={RefreshCw} title="13. Changes to This Privacy Policy">
              <p>O1DMatch reserves the right to update or modify this Privacy Policy at any time.</p>
              <p>
                For material changes, we will provide notice via email to the address associated
                with your account and/or through a prominent notice on the Platform at least thirty
                (30) days before the changes take effect.
              </p>
              <p>
                Non-material changes (such as formatting, clarifications, or typographical
                corrections) may be made at any time without advance notice.
              </p>
              <p>
                Your continued use of the Platform after the effective date of any changes
                constitutes your acceptance of the updated Privacy Policy.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </Section>

            {/* 14. Contact */}
            <Section id="contact" icon={Mail} title="14. Data Protection Officer and Contact Information">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data practices, please contact us. For privacy-specific inquiries, please
                include &quot;Privacy&quot; in the subject line of your email.
              </p>
              <div style={{
                background: "#0B1D35", borderRadius: 14,
                padding: "1.4rem 1.6rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
              }}>
                <p style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.95rem", margin: 0 }}>O1D Match LLC</p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }}>
                  Email:{" "}
                  <a href="mailto:info@o1dmatch.com" style={{ color: "#D4A84B", textDecoration: "none" }}>
                    info@o1dmatch.com
                  </a>
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }}>
                  Phone:{" "}
                  <a href="tel:+15617944621" style={{ color: "#D4A84B", textDecoration: "none" }}>
                    (561) 794-4621
                  </a>
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }}>
                  Website:{" "}
                  <Link href="/" style={{ color: "#D4A84B", textDecoration: "none" }}>
                    o1dmatch.com
                  </Link>
                </p>
              </div>
            </Section>

            {/* 15. Additional Disclosures */}
            <Section id="additional" icon={List} title="15. Additional Disclosures">
              <h3 className="terms-sub">15.1 AI and Automated Decision-Making</h3>
              <p>
                The Platform uses artificial intelligence and automated processing to generate
                evidence scores, match talent with opportunities, and produce interest letters.
                These automated tools assist Users but do not make final decisions regarding visa
                eligibility, employment, or other outcomes. Users are encouraged to use
                AI-generated outputs as one factor among many in their decision-making and to
                consult with qualified professionals.
              </p>

              <h3 className="terms-sub">15.2 Anonymized Data for AI Training</h3>
              <p>
                O1DMatch may use anonymized, aggregated, or de-identified data derived from User
                Content and Platform usage to train, improve, and develop its AI models and
                algorithms. This data is processed in a manner that does not identify individual
                Users.
              </p>

              <h3 className="terms-sub">15.3 Third-Party Links</h3>
              <p>
                The Platform may contain links to third-party websites or services. This Privacy
                Policy does not apply to third-party sites, and we are not responsible for their
                privacy practices.
              </p>

              <h3 className="terms-sub">15.4 Governing Law</h3>
              <p>
                This Privacy Policy is governed by the laws of the State of Florida, consistent
                with the{" "}
                <Link href="/terms" className="terms-link">Terms of Service</Link>.
              </p>
            </Section>

            {/* Bottom nav */}
            <div style={{
              paddingTop: "2rem", borderTop: "1px solid #E8E0D4",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
            }}>
              <Link href="/" style={{ fontSize: "0.85rem", color: "#64748B", textDecoration: "none" }}>
                ← Back to Home
              </Link>
              <Link href="/terms" className="o1d-btn-primary" style={{ fontSize: "0.88rem" }}>
                <FileText size={15} /> Read Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="o1d-footer">
        <div className="o1d-footer-inner">
          <div className="o1d-footer-grid">
            <div>
              <span className="o1d-footer-logo">O1DMatch</span>
              <p className="o1d-footer-tagline">
                Connecting exceptional talent with opportunities for O-1 visa sponsorship.
              </p>
            </div>
            <div className="o1d-footer-col">
              <h4>Platform</h4>
              <Link href="/how-it-works/candidates">For Candidates</Link>
              <Link href="/how-it-works/employers">For Employers</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div className="o1d-footer-col">
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>
            <div className="o1d-footer-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="o1d-footer-bottom">
            <span>© {new Date().getFullYear()} O1DMatch. All rights reserved.</span>
            <span>Built by a licensed immigration attorney.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}