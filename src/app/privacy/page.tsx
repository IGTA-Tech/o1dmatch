/* src/app/privacy/page.tsx */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield, Lock, Eye, Database, Share2, Trash2,
  Globe, Mail, Baby, RefreshCw, ChevronRight, FileText,
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
  { id: "introduction",          label: "Introduction" },
  { id: "information-collected", label: "Information We Collect" },
  { id: "how-we-use",            label: "How We Use Your Information" },
  { id: "data-sharing",          label: "Data Sharing & Disclosure" },
  { id: "data-security",         label: "Data Security" },
  { id: "data-retention",        label: "Data Retention" },
  { id: "your-rights",           label: "Your Rights" },
  { id: "cookies",               label: "Cookies & Tracking" },
  { id: "international",         label: "International Transfers" },
  { id: "children",              label: "Children\u2019s Privacy" },
  { id: "changes",               label: "Changes to This Policy" },
  { id: "contact",               label: "Contact Us" },
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
            Last updated: February 17, 2026
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

            {/* 1 */}
            <Section id="introduction" icon={Shield} title="1. Introduction">
              <p>
                O1DMatch (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a platform that
                connects individuals with extraordinary ability (&quot;Talent&quot;) with employers
                seeking to sponsor O-1 visas (&quot;Employers&quot;). This Privacy Policy describes how
                we collect, use, disclose, and protect your personal information when you access or use
                our website, applications, and services (collectively, the &quot;Platform&quot;).
              </p>
              <p>
                By using the Platform, you agree to the collection and use of information in accordance
                with this policy. If you do not agree, please do not use the Platform.
              </p>
            </Section>

            {/* 2 */}
            <Section id="information-collected" icon={Database} title="2. Information We Collect">
              <h3 className="terms-sub">2.1 Information You Provide</h3>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, password, and profile photo.</li>
                <li><strong>Professional Information:</strong> Job title, employer, skills, work history, education, and professional achievements.</li>
                <li><strong>Immigration Documents:</strong> Visa petition documents, evidence of extraordinary ability, exhibit packets, interest letters, and supporting materials uploaded for scoring or case management.</li>
                <li><strong>Payment Information:</strong> Billing address and payment method details processed securely through Stripe. We do not store full credit card numbers on our servers.</li>
                <li><strong>Communications:</strong> Messages, feedback, and support requests you send to us.</li>
              </ul>

              <h3 className="terms-sub">2.2 Information Collected Automatically</h3>
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, and time spent on the Platform.</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, and screen resolution.</li>
                <li><strong>Log Data:</strong> IP address, access times, referring URLs, and error logs.</li>
                <li><strong>Cookies:</strong> Small data files stored on your device (see Section 8).</li>
              </ul>

              <h3 className="terms-sub">2.3 Information from Third Parties</h3>
              <ul>
                <li>Authentication providers (e.g., Google OAuth) when you sign in with a third-party account.</li>
                <li>Payment processors (Stripe) for transaction verification.</li>
                <li>E-signature services (SignWell) for document signing status.</li>
              </ul>
            </Section>

            {/* 3 */}
            <Section id="how-we-use" icon={Eye} title="3. How We Use Your Information">
              <p>We use your information to:</p>
              <ul>
                <li>Provide, maintain, and improve the Platform and its features.</li>
                <li>Match Talent with Employers based on skills, experience, and visa eligibility criteria.</li>
                <li>Process and score visa petition documents using our AI-powered scoring tools to evaluate O-1 eligibility.</li>
                <li>Generate exhibits, petition materials, and interest letters for immigration case support.</li>
                <li>Process payments, manage subscriptions, and administer credit systems (e.g., re-score credits).</li>
                <li>Send transactional emails (account verification, password resets, interest letter approvals) and, with your consent, marketing communications.</li>
                <li>Detect fraud, abuse, and security threats to protect users and the Platform.</li>
                <li>Comply with legal obligations and respond to lawful requests.</li>
                <li>Conduct analytics and research to improve our services.</li>
              </ul>
            </Section>

            {/* 4 */}
            <Section id="data-sharing" icon={Share2} title="4. Data Sharing & Disclosure">
              <p>We do not sell your personal information. We may share data with:</p>
              <ul>
                <li><strong>Employers (for Talent users):</strong> Your profile information and scoring results may be shared with Employers you match with or express interest in, only to the extent necessary for the matching and sponsorship process.</li>
                <li><strong>Service Providers:</strong> Trusted third parties that help us operate the Platform, including Supabase (database and authentication), Stripe (payments), Vercel (hosting), SignWell (e-signatures), and Google Drive (document management).</li>
                <li><strong>AI Scoring Services:</strong> Documents you upload for petition scoring are processed by our AI scoring API to evaluate O-1 eligibility criteria. These documents are transmitted securely and used solely for scoring purposes.</li>
                <li><strong>Legal & Immigration Professionals:</strong> When you engage attorneys or agencies through the Platform, relevant case information may be shared with them at your direction.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or governmental authority, or to protect our rights, safety, or property.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</li>
              </ul>
            </Section>

            {/* 5 */}
            <Section id="data-security" icon={Lock} title="5. Data Security">
              <p>We implement industry-standard security measures to protect your data, including:</p>
              <ul>
                <li>Encryption of data in transit (TLS/SSL) and at rest.</li>
                <li>Row-level security (RLS) policies ensuring users can only access their own data.</li>
                <li>Secure authentication with encrypted password storage and session management.</li>
                <li>Server-side API key management — sensitive credentials like scoring and payment API keys are never exposed to the browser.</li>
                <li>Regular security reviews and monitoring for vulnerabilities.</li>
              </ul>
              <p>
                While we strive to protect your information, no method of electronic transmission or
                storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </Section>

            {/* 6 */}
            <Section id="data-retention" icon={Trash2} title="6. Data Retention">
              <p>We retain your personal information for as long as your account is active or as needed to provide services. Specifically:</p>
              <ul>
                <li><strong>Account Data:</strong> Retained until you delete your account.</li>
                <li><strong>Scoring Sessions & Documents:</strong> Retained for the duration of your subscription. You may delete individual scoring sessions at any time.</li>
                <li><strong>Payment Records:</strong> Retained as required by tax and financial regulations (typically 7 years).</li>
                <li><strong>Log Data:</strong> Automatically purged after 90 days.</li>
              </ul>
              <p>
                Upon account deletion, we will remove your personal information within 30 days, except
                where retention is required by law.
              </p>
            </Section>

            {/* 7 */}
            <Section id="your-rights" icon={Shield} title="7. Your Rights">
              <p>Depending on your jurisdiction, you may have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
                <li><strong>Portability:</strong> Request your data in a portable, machine-readable format.</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time using the link in each email.</li>
                <li><strong>Restrict Processing:</strong> Request that we limit how we use your data in certain circumstances.</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@o1dmatch.com" className="terms-link">
                  privacy@o1dmatch.com
                </a>
                . We will respond within 30 days.
              </p>

              <div className="terms-alert terms-alert-gold">
                <Shield size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>California Residents (CCPA):</strong> You have the right to know what
                  personal information we collect, request its deletion, and opt out of the sale of
                  personal information. We do not sell personal information.
                </div>
              </div>
              <div className="terms-alert terms-alert-gold">
                <Globe size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>EU/UK Residents (GDPR):</strong> You have additional rights including the
                  right to object to processing, withdraw consent, and lodge a complaint with a
                  supervisory authority.
                </div>
              </div>
            </Section>

            {/* 8 */}
            <Section id="cookies" icon={Eye} title="8. Cookies & Tracking">
              <p>We use the following types of cookies:</p>
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
                      ["Essential",  "Authentication, security, session management",  "Session"],
                      ["Functional", "User preferences, dashboard settings",          "1 year"],
                      ["Analytics",  "Usage patterns, feature adoption, performance", "2 years"],
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
              <p>
                You can control cookies through your browser settings. Disabling essential cookies may
                affect Platform functionality.
              </p>
            </Section>

            {/* 9 */}
            <Section id="international" icon={Globe} title="9. International Transfers">
              <p>
                Your information may be transferred to and processed in countries other than your country
                of residence, including the United States. We ensure appropriate safeguards are in place
                for international data transfers, including standard contractual clauses where required.
              </p>
            </Section>

            {/* 10 */}
            <Section id="children" icon={Baby} title="10. Children\u2019s Privacy">
              <p>
                The Platform is not intended for individuals under 18 years of age. We do not knowingly
                collect personal information from children. If we become aware that we have collected data
                from a child under 18, we will take steps to delete it promptly.
              </p>
            </Section>

            {/* 11 */}
            <Section id="changes" icon={RefreshCw} title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically. We will notify you of material changes by
                posting the new policy on this page with an updated &quot;Last updated&quot; date, and for
                significant changes, by sending an email notification. Your continued use of the Platform
                after changes take effect constitutes acceptance of the revised policy.
              </p>
            </Section>

            {/* 12 */}
            <Section id="contact" icon={Mail} title="12. Contact Us">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div style={{
                background: "#0B1D35", borderRadius: 14,
                padding: "1.4rem 1.6rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
              }}>
                <p style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.95rem", margin: 0 }}>O1DMatch</p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }}>
                  Email:{" "}
                  <a href="mailto:privacy@o1dmatch.com" style={{ color: "#D4A84B", textDecoration: "none" }}>
                    privacy@o1dmatch.com
                  </a>
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }}>
                  Contact Page:{" "}
                  <Link href="/contact" style={{ color: "#D4A84B", textDecoration: "none" }}>
                    o1dmatch.com/contact
                  </Link>
                </p>
              </div>
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