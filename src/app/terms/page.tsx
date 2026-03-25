/* src/app/terms/page.tsx */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  FileText, Shield, Users, CreditCard, AlertTriangle,
  Scale, Ban, RefreshCw, Mail, ChevronRight,
  BookOpen, Gavel, UserCheck, ScrollText, DollarSign,
  Info, Lock, List,
} from "lucide-react";
import "@/app/theme.css";

export const metadata = {
  title: "Terms of Service | O1DMatch",
  description:
    "Terms and conditions for using the O1DMatch platform — O-1 visa talent matching, petition scoring, and case management.",
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
  { id: "parties-definitions",   label: "1. Parties And Definitions" },
  { id: "acceptance",            label: "2. Acceptance And Eligibility" },
  { id: "user-accuracy",         label: "3. User Responsibility for Accuracy" },
  { id: "no-legal-advice",       label: "4. No Legal Advice" },
  { id: "no-guarantees",         label: "5. No Guaranteed Outcomes" },
  { id: "interest-letters",      label: "6. Interest Letters" },
  { id: "placement-fees",        label: "7. Placement Fees" },
  { id: "subscriptions",         label: "8. Subscription, Billing And Payment" },
  { id: "intellectual-property", label: "9. Intellectual Property" },
  { id: "user-content",          label: "10. User Content And Conduct" },
  { id: "liability",             label: "11. Limitation of Liability" },
  { id: "indemnification",       label: "12. Indemnification" },
  { id: "arbitration",           label: "13. Arbitration And Class Action Waiver" },
  { id: "user-types",            label: "14. User-Type Provisions" },
  { id: "termination",           label: "15. Account Termination" },
  { id: "modifications",         label: "16. Modifications to Terms" },
  { id: "general",               label: "17. General Provisions" },
  { id: "contact",               label: "18. Contact Us" },
];

/* ─────────────────────────────────────────────────────────
   Page (Server Component — no "use client")
───────────────────────────────────────────────────────── */
export default function TermsOfServicePage() {
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
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "-40%", right: "-15%",
          width: 700, height: 700, pointerEvents: "none",
          background: "radial-gradient(circle,rgba(212,168,75,0.08) 0%,transparent 70%)",
        }} />

        <div style={{
          maxWidth: 760, margin: "0 auto", padding: "0 1.5rem",
          textAlign: "center", position: "relative", zIndex: 2,
        }}>
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 1.5rem",
            background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#D4A84B",
          }}>
            <Scale size={30} />
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "3rem", fontWeight: 700, color: "#FFFFFF",
            marginBottom: "1rem", lineHeight: 1.1,
          }}>
            Terms of{" "}
            <em style={{ fontStyle: "normal", color: "#D4A84B" }}>Service</em>
          </h1>

          <p style={{
            fontSize: "1.05rem", color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7, maxWidth: 560, margin: "0 auto 1.5rem",
          }}>
            Please read these terms carefully before using the O1DMatch platform.
            By using our services, you agree to be bound by these terms.
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

              {/* Privacy link card */}
              <div style={{
                background: "#0B1D35", borderRadius: 12,
                padding: "1rem 1.1rem",
                display: "flex", alignItems: "center", gap: "0.6rem",
              }}>
                <Shield size={16} style={{ color: "#D4A84B", flexShrink: 0 }} />
                <Link href="/privacy" style={{
                  fontSize: "0.8rem", fontWeight: 600,
                  color: "#E8C97A", textDecoration: "none",
                }}>
                  Privacy Policy →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* Preamble Alert */}
            <div className="terms-alert terms-alert-red" style={{ marginBottom: 0 }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: "0.88rem", lineHeight: 1.65 }}>
                PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THE O1DMATCH PLATFORM.
                BY ACCESSING OR USING O1DMATCH.COM, APP.O1DMATCH.COM, OR ANY RELATED SERVICES,
                YOU AGREE TO BE BOUND BY THESE TERMS. THESE TERMS CONTAIN A MANDATORY BINDING
                ARBITRATION PROVISION AND A CLASS ACTION WAIVER IN SECTION 13.
              </p>
            </div>

            {/* 1. Parties & Definitions */}
            <Section id="parties-definitions" icon={List} title="1. Parties And Definitions">
              <p>
                <strong>&quot;O1DMatch,&quot; &quot;we,&quot; &quot;us,&quot;</strong> or <strong>&quot;our&quot;</strong> refers
                to O1D Match LLC, a Florida limited liability company operating within the Innovative
                Global Talent Agency (IGTA) network.
              </p>
              <p>
                <strong>&quot;User,&quot; &quot;you,&quot;</strong> or <strong>&quot;your&quot;</strong> refers to any individual
                or entity that accesses or uses the Platform, including:
              </p>
              <ul>
                <li>
                  <strong>Talent</strong> — Individuals seeking O-1 visa classification or other
                  immigration benefits who create profiles, upload evidence, and engage with employers
                  through the Platform.
                </li>
                <li>
                  <strong>Employer</strong> — Companies, organizations, or their authorized
                  representatives who post job opportunities, browse talent profiles, and issue interest
                  letters through the Platform.
                </li>
                <li>
                  <strong>Staffing Agency (&quot;Agency&quot;)</strong> — Third-party staffing or recruitment
                  agencies that post job opportunities and facilitate connections on behalf of employer
                  clients.
                </li>
                <li>
                  <strong>Immigration Attorney (&quot;Attorney&quot;)</strong> — Licensed attorneys who list
                  themselves in the Platform&apos;s attorney directory and may interact with talent or
                  employers through the Platform.
                </li>
              </ul>
              <p>
                <strong>&quot;Platform&quot;</strong> means the websites located at o1dmatch.com and
                app.o1dmatch.com, all associated subdomains, mobile applications (if any), APIs, and
                all features, tools, content, and services made available through them.
              </p>
              <p>
                <strong>&quot;AI Tools&quot;</strong> means O1DMatch&apos;s artificial intelligence-powered
                features, including but not limited to evidence scoring across the eight (8) USCIS O-1
                extraordinary ability criteria, interest letter generation, profile matching, and any
                other automated assessment or generation features.
              </p>
              <p>
                <strong>&quot;Interest Letter&quot;</strong> means a letter generated through the Platform
                that expresses a potential employer&apos;s or organization&apos;s non-binding interest
                in an O-1 visa candidate.
              </p>
              <p>
                <strong>&quot;Content&quot;</strong> means all text, data, documents, images, files,
                profiles, communications, and other materials uploaded, submitted, posted, or transmitted
                through the Platform by Users.
              </p>
            </Section>

            {/* 2. Acceptance & Eligibility */}
            <Section id="acceptance" icon={BookOpen} title="2. Acceptance of Terms And Eligibility">
              <p>
                By creating an account, accessing, or using the Platform in any manner, you represent
                and warrant that:
              </p>
              <ul>
                <li>You are at least eighteen (18) years of age.</li>
                <li>You have the legal capacity and authority to enter into these Terms.</li>
                <li>You are not prohibited from using the Platform under any applicable law.</li>
                <li>
                  If you are acting on behalf of an entity, you have the authority to bind that entity
                  to these Terms.
                </li>
              </ul>
              <p>
                O1DMatch reserves the right to refuse service, terminate accounts, or restrict access
                to any person or entity for any reason or no reason, at our sole discretion.
              </p>
            </Section>

            {/* 3. User Responsibility for Accuracy */}
            <Section id="user-accuracy" icon={UserCheck} title="3. User Responsibility for Accuracy of Information">
              <h3 className="terms-sub">3.1 Certification of Accuracy</h3>
              <p>
                By using the Platform, you certify that <strong>ALL</strong> information you submit,
                upload, post, or otherwise provide through the Platform is true, accurate, complete,
                and not misleading. This includes, without limitation, your profile information,
                employment history, educational credentials, evidence of extraordinary ability,
                professional achievements, job postings, company information, licensing credentials,
                and any other representations made through the Platform.
              </p>

              <h3 className="terms-sub">3.2 Sole Responsibility</h3>
              <p>
                You are solely and exclusively responsible for the accuracy, completeness, and legality
                of all information and Content you provide through the Platform. You acknowledge that
                O1DMatch relies on the accuracy of User-submitted information to operate the Platform
                and that inaccurate information may adversely affect other Users, the integrity of the
                Platform, and immigration proceedings.
              </p>

              <h3 className="terms-sub">3.3 No Verification Obligation</h3>
              <p>
                O1DMatch is under no obligation to verify, validate, authenticate, or confirm the
                accuracy or truthfulness of any information submitted by Users. While O1DMatch may, in
                its sole discretion, take steps to review or screen certain Content, such actions do
                not create any duty, obligation, or liability on the part of O1DMatch regarding the
                accuracy of User-submitted information.
              </p>

              <h3 className="terms-sub">3.4 Consequences of Inaccuracy</h3>
              <p>You acknowledge that submitting false, misleading, or inaccurate information may result in:</p>
              <ul>
                <li>Immediate termination of your account.</li>
                <li>
                  Adverse consequences in immigration proceedings, including but not limited to petition
                  denial, revocation, or findings of fraud by USCIS.
                </li>
                <li>
                  Civil or criminal liability under applicable federal and state laws, including
                  immigration fraud statutes.
                </li>
                <li>Liability to other Users or third parties harmed by your inaccurate information.</li>
              </ul>
              <p>O1DMatch bears no responsibility for any such consequences.</p>

              <h3 className="terms-sub">3.5 Duty to Update</h3>
              <p>
                You agree to promptly update your information whenever it changes to ensure continued
                accuracy.
              </p>
            </Section>

            {/* 4. No Legal Advice */}
            <Section id="no-legal-advice" icon={Info} title="4. No Legal Advice — Critical Disclaimer">
              <div className="terms-alert terms-alert-gold">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>O1DMatch Is Not a Law Firm.</strong> O1DMATCH IS NOT A LAW FIRM, DOES NOT
                  PROVIDE LEGAL ADVICE, AND DOES NOT PROVIDE LEGAL REPRESENTATION. Nothing on the
                  Platform constitutes legal advice, a legal opinion, or an attorney-client relationship
                  between you and O1DMatch.
                </div>
              </div>

              <h3 className="terms-sub">4.2 AI Tools Are Assessment Tools, Not Legal Opinions</h3>
              <p>
                The AI-powered scoring, evidence assessment, and all other AI Tools provided through
                the Platform are informational and analytical tools designed to help Users evaluate
                potential O-1 visa eligibility. AI scores, assessments, recommendations, and any other
                outputs generated by the AI Tools are <strong>NOT</strong> legal opinions, legal advice,
                or predictions of USCIS outcomes. They are computational assessments based on publicly
                available criteria and User-submitted data.
              </p>

              <h3 className="terms-sub">4.3 Consult Qualified Legal Counsel</h3>
              <p>
                O1DMatch strongly recommends that all Users consult with a qualified, licensed
                immigration attorney before making any decisions regarding immigration petitions, visa
                applications, or related legal matters. The information provided through the Platform
                is not a substitute for professional legal advice tailored to your specific
                circumstances.
              </p>

              <h3 className="terms-sub">4.4 Attorney Directory Disclaimer</h3>
              <p>
                The presence of attorneys in the O1DMatch attorney directory does not constitute legal
                advice from O1DMatch. Any attorney-client relationships formed through connections made
                on the Platform are exclusively between the attorney and the client. O1DMatch is not a
                party to, and assumes no responsibility or liability for, any such relationships.
              </p>

              <h3 className="terms-sub">4.5 Interest Letter Language</h3>
              <p>
                Interest letters generated through the Platform use templates and AI-assisted language
                formatted for USCIS requirements. The generation of such letters does not constitute
                the practice of law by O1DMatch. Users and their attorneys are solely responsible for
                reviewing, editing, and determining the appropriateness of any interest letter before
                submission to USCIS or any other party.
              </p>
            </Section>

            {/* 5. No Guaranteed Outcomes */}
            <Section id="no-guarantees" icon={AlertTriangle} title="5. No Guaranteed Outcomes">
              <div className="terms-alert terms-alert-red">
                <p style={{ fontWeight: 600, margin: 0 }}>
                  O1DMATCH DOES NOT GUARANTEE, WARRANT, OR PROMISE ANY PARTICULAR OUTCOME.
                </p>
              </div>
              <p>This expressly includes, but is not limited to:</p>
              <ul>
                <li>Approval of any O-1 visa petition or any other immigration benefit by USCIS or any government agency.</li>
                <li>Employment, job placement, hiring, or any particular employment outcome.</li>
                <li>The accuracy, reliability, or predictive value of any AI score, assessment, or recommendation.</li>
                <li>The quality, suitability, or availability of any talent, employer, job opportunity, or attorney listed on the Platform.</li>
                <li>The acceptance or effectiveness of any interest letter generated through the Platform.</li>
                <li>Any specific return on investment from use of the Platform or its subscription plans.</li>
              </ul>
              <h3 className="terms-sub">5.2 Facilitator, Not Guarantor</h3>
              <p>
                O1DMatch is a technology platform that facilitates connections between Users and
                provides AI-powered tools. Actual outcomes depend entirely on factors beyond
                O1DMatch&apos;s control, including but not limited to USCIS adjudication decisions,
                employer hiring decisions, individual qualifications, the quality of evidence presented,
                legal representation, and applicable laws and regulations.
              </p>
              <h3 className="terms-sub">5.3 Acknowledgment of Risk</h3>
              <p>
                You acknowledge and accept that immigration processes are inherently uncertain, that
                USCIS decisions are discretionary, and that use of the Platform does not increase the
                likelihood of any particular outcome. You assume all risk associated with reliance on
                the Platform&apos;s tools and features.
              </p>
            </Section>

            {/* 6. Interest Letters */}
            <Section id="interest-letters" icon={ScrollText} title="6. Interest Letters">
              <div className="terms-alert terms-alert-gold">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Non-Binding Nature.</strong> Interest letters generated through the Platform
                  are non-binding expressions of interest only.
                </div>
              </div>

              <h3 className="terms-sub">6.1 An Interest Letter Is NOT:</h3>
              <ul>
                <li>An employment contract or agreement.</li>
                <li>A job offer, whether conditional or unconditional.</li>
                <li>A commitment to hire, employ, or engage the talent in any capacity.</li>
                <li>A visa sponsorship commitment or agreement.</li>
                <li>A guarantee that the employer will petition for or support an O-1 visa application.</li>
                <li>A binding obligation of any kind on either the talent or the employer.</li>
              </ul>

              <h3 className="terms-sub">6.2 No Obligation Created</h3>
              <p>
                Neither the talent nor the employer (nor any agency acting on an employer&apos;s
                behalf) is legally bound by an interest letter issued through the Platform. Either
                party may decline to proceed at any time, for any reason, without liability to the
                other party or to O1DMatch.
              </p>

              <h3 className="terms-sub">6.3 USCIS Acceptance Not Guaranteed</h3>
              <p>
                O1DMatch generates interest letters formatted to meet general USCIS requirements for
                O-1 visa petitions. However, O1DMatch does not guarantee that any interest letter will
                be accepted, deemed sufficient, or given any particular weight by USCIS or any other
                adjudicating body. The sufficiency of an interest letter is determined solely by USCIS
                in its discretion.
              </p>

              <h3 className="terms-sub">6.4 User Review Required</h3>
              <p>
                All interest letters generated through the Platform should be reviewed by the involved
                parties and, where appropriate, qualified legal counsel before use in any immigration
                proceeding.
              </p>
            </Section>

            {/* 7. Placement Fees — standalone highlighted section */}
            <section id="placement-fees" style={{ scrollMarginTop: "6rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0B1D35 0%, #112640 100%)",
                border: "1.5px solid rgba(212,168,75,0.4)",
                borderRadius: 16,
                padding: "1.75rem 1.75rem 1.6rem",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Decorative glow */}
                <div style={{
                  position: "absolute", top: "-30%", right: "-10%",
                  width: 320, height: 320, pointerEvents: "none",
                  background: "radial-gradient(circle, rgba(212,168,75,0.1) 0%, transparent 70%)",
                }} />

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.1rem", position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "rgba(212,168,75,0.18)", border: "1px solid rgba(212,168,75,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <DollarSign size={20} style={{ color: "#D4A84B" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, color: "#D4A84B", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      Important Notice — Section 7
                    </p>
                    <h2 style={{
                      margin: 0, fontFamily: "'Playfair Display', serif",
                      fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF",
                    }}>
                      Placement Fees
                    </h2>
                  </div>
                </div>

                {/* Body */}
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <p style={{ margin: 0, fontSize: "0.93rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                    O1DMatch reserves the right to charge placement fees when talent is successfully
                    matched with an employer through the Platform, resulting in employment, engagement,
                    or a contractual relationship of any kind.
                  </p>

                  {/* Three-point grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem", marginTop: "0.25rem" }}>
                    {[
                      {
                        title: "Fee Structure",
                        body: "Placement fees may be structured as a percentage of the talent's first-year total compensation, a flat fee, a combination thereof, or any other arrangement as determined by O1DMatch in its sole discretion.",
                      },
                      {
                        title: "Acknowledgment",
                        body: "By using the Platform, all Users acknowledge that placement fees may apply to successful matches. Specific fee structures and rates will be communicated before they take effect.",
                      },
                      {
                        title: "Non-Circumvention",
                        body: "Users shall not circumvent O1DMatch's placement fee structure by completing transactions outside the Platform after an initial introduction was made through it. Violation entitles O1DMatch to the full placement fee plus collection costs.",
                      },
                    ].map(({ title, body }) => (
                      <div key={title} style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(212,168,75,0.2)",
                        borderRadius: 10,
                        padding: "1rem 1.1rem",
                      }}>
                        <p style={{ margin: "0 0 0.4rem", fontWeight: 700, fontSize: "0.83rem", color: "#D4A84B" }}>
                          {title}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Survival notice */}
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "0.6rem",
                    background: "rgba(212,168,75,0.1)", border: "1px solid rgba(212,168,75,0.25)",
                    borderRadius: 10, padding: "0.85rem 1rem", marginTop: "0.25rem",
                  }}>
                    <AlertTriangle size={15} style={{ color: "#D4A84B", flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
                      <strong style={{ color: "#E8C97A" }}>Survival of Placement Fee Obligations:</strong>{" "}
                      The obligation to pay placement fees survives termination or expiration of a
                      User&apos;s account. If an employment or engagement relationship results from a
                      connection made through the Platform within twelve (12) months of either
                      party&apos;s last use of the Platform, the placement fee shall apply. Questions?
                      Contact us at{" "}
                      <a href="mailto:info@o1dmatch.com" style={{ color: "#D4A84B", textDecoration: "none" }}>
                        info@o1dmatch.com
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Subscription, Billing & Payment */}
            <Section id="subscriptions" icon={CreditCard} title="8. Subscription, Billing And Payment">
              <h3 className="terms-sub">8.1 Subscription Plans</h3>
              <p>
                O1DMatch offers various subscription plans, including free and paid tiers. Current
                subscription plans and pricing are available on the Platform. Plans may include,
                without limitation, the Talent Starter plan and various Employer plans, each with
                different features and pricing.
              </p>

              <h3 className="terms-sub">8.2 Auto-Renewal</h3>
              <p>
                <strong>ALL PAID SUBSCRIPTION PLANS AUTOMATICALLY RENEW</strong> at the end of each
                billing cycle (monthly or annually, as applicable) unless you cancel your subscription
                before the renewal date. By subscribing to a paid plan, you authorize O1DMatch to
                charge your designated payment method for each renewal period.
              </p>

              <h3 className="terms-sub">8.3 No Refunds</h3>
              <p>
                All subscription fees are non-refundable. No refunds or credits will be issued for
                partial months, partial subscription periods, unused features, or account termination
                (whether by you or by O1DMatch). If you cancel your subscription, you will retain
                access to paid features through the end of your current billing period.
              </p>

              <h3 className="terms-sub">8.4 Payment Processing</h3>
              <p>
                All payment processing is handled by Stripe, Inc. (&quot;Stripe&quot;). By providing
                payment information, you agree to Stripe&apos;s terms of service and privacy policy.
                O1DMatch does not store your full payment card details.
              </p>

              <h3 className="terms-sub">8.5 Promotional Codes</h3>
              <p>
                O1DMatch may offer promotional codes (&quot;Promo Codes&quot;) from time to time.
                Promo Codes are non-transferable, may not be combined with other offers, have no cash
                value, may be limited in quantity or duration, and may be revoked or modified by
                O1DMatch at any time for any reason. Abuse of Promo Codes may result in account
                termination.
              </p>

              <h3 className="terms-sub">8.6 Pricing Changes</h3>
              <p>
                O1DMatch reserves the right to change subscription pricing at any time. For existing
                subscribers, pricing changes will take effect at the start of the next billing cycle
                following at least thirty (30) days&apos; advance notice via email or Platform
                notification. Continued use of the Platform after a price change takes effect
                constitutes acceptance of the new pricing.
              </p>

              <h3 className="terms-sub">8.7 Failed Payments</h3>
              <p>
                If a payment fails, O1DMatch may retry the charge, suspend or downgrade your account,
                or terminate your account. O1DMatch is not liable for any consequences of account
                suspension or termination due to failed payments.
              </p>
            </Section>

            {/* 9. Intellectual Property */}
            <Section id="intellectual-property" icon={FileText} title="9. Intellectual Property">
              <h3 className="terms-sub">9.1 O1DMatch Property</h3>
              <p>
                The Platform, including all software, code, AI models, machine learning algorithms,
                scoring methodologies, letter templates, user interface designs, graphics, logos,
                trademarks, trade names, data compilations, and all other content and materials created
                by or on behalf of O1DMatch (collectively, &quot;O1DMatch IP&quot;), is the exclusive
                property of O1D Match LLC and/or its licensors, protected by United States and
                international intellectual property laws.
              </p>

              <h3 className="terms-sub">9.2 Limited License to Users</h3>
              <p>
                Subject to these Terms, O1DMatch grants you a limited, non-exclusive, non-transferable,
                non-sublicensable, revocable license to access and use the Platform solely for its
                intended purposes. This license does not include the right to:
              </p>
              <ul>
                <li>Copy, modify, distribute, sell, lease, or create derivative works based on the Platform or O1DMatch IP.</li>
                <li>Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code or algorithms of any part of the Platform.</li>
                <li>Use any data mining, scraping, robots, or similar automated data gathering or extraction methods on the Platform.</li>
                <li>Remove, alter, or obscure any proprietary notices on the Platform.</li>
              </ul>

              <h3 className="terms-sub">9.3 User Content License</h3>
              <p>
                Users retain ownership of the Content they upload to the Platform. However, by
                uploading Content you grant O1DMatch a worldwide, non-exclusive, royalty-free,
                sublicensable, transferable license to use, reproduce, process, analyze, store, display,
                distribute, and create derivative works from your Content for the purposes of: (a)
                operating and providing the Platform; (b) AI model training, improvement, and
                development; (c) generating anonymized or aggregated data and analytics; (d) complying
                with legal obligations; and (e) any other purpose related to the operation, improvement,
                or promotion of the Platform. This license survives termination of your account.
              </p>

              <h3 className="terms-sub">9.4 Feedback</h3>
              <p>
                Any feedback, suggestions, ideas, or recommendations you provide regarding the Platform
                shall become the exclusive property of O1DMatch. You hereby assign all rights in
                Feedback to O1DMatch and agree that O1DMatch may use Feedback for any purpose without
                compensation or attribution.
              </p>
            </Section>

            {/* 10. User Content & Conduct */}
            <Section id="user-content" icon={Users} title="10. User-Generated Content And Conduct">
              <h3 className="terms-sub">10.1 User Responsibility</h3>
              <p>
                You are solely responsible for all Content you upload, post, transmit, or otherwise
                make available through the Platform. O1DMatch does not pre-screen Content and assumes
                no responsibility or liability for User-generated Content.
              </p>

              <h3 className="terms-sub">10.2 Prohibited Content and Conduct</h3>
              <p>You agree not to use the Platform to:</p>
              <ul>
                <li>Submit false, fraudulent, misleading, or deceptive information.</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
                <li>Upload Content that infringes any intellectual property rights, privacy rights, or other rights of any third party.</li>
                <li>Upload Content that is defamatory, obscene, harassing, threatening, or otherwise objectionable.</li>
                <li>Engage in any activity that violates any applicable federal, state, local, or international law or regulation, including immigration laws.</li>
                <li>Transmit viruses, malware, or other harmful code.</li>
                <li>Interfere with the operation of the Platform or any other User&apos;s use of the Platform.</li>
                <li>Use the Platform for any purpose other than its intended use.</li>
                <li>Collect or harvest information about other Users without their consent.</li>
                <li>Use the Platform to send unsolicited communications or spam.</li>
                <li>Attempt to gain unauthorized access to any part of the Platform, other Users&apos; accounts, or any systems or networks connected to the Platform.</li>
              </ul>

              <h3 className="terms-sub">10.3 Right to Remove Content</h3>
              <p>
                O1DMatch reserves the right, but has no obligation, to monitor, review, edit, or
                remove any Content at any time, for any reason, without notice. O1DMatch shall have
                no liability for any action taken or not taken with respect to User Content.
              </p>
            </Section>

            {/* 11. Limitation of Liability */}
            <Section id="liability" icon={Shield} title="11. Limitation of Liability">
              <h3 className="terms-sub">11.1 Liability Cap</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, O1DMATCH&apos;S TOTAL AGGREGATE
                LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR
                USE OF THE PLATFORM SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES ACTUALLY PAID BY YOU
                TO O1DMATCH DURING THE TWELVE (12) MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT
                GIVING RISE TO THE CLAIM. IF YOU HAVE NOT PAID ANY FEES TO O1DMATCH, O1DMATCH&apos;S
                TOTAL LIABILITY SHALL NOT EXCEED FIFTY DOLLARS ($50.00).
              </p>

              <h3 className="terms-sub">11.2 Exclusion of Damages</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE O1DMATCH PARTIES SHALL NOT
                BE LIABLE FOR ANY:
              </p>
              <ul>
                <li>Indirect, incidental, special, consequential, punitive, or exemplary damages.</li>
                <li>Loss of profits, revenue, data, business opportunities, or goodwill.</li>
                <li>Cost of procurement of substitute services.</li>
                <li>Damages arising from or related to any USCIS decision, including petition denial, revocation, or request for evidence.</li>
                <li>Damages arising from or related to any employer&apos;s hiring decision or failure to hire.</li>
                <li>Damages arising from the accuracy or inaccuracy of AI scoring, assessments, or recommendations.</li>
                <li>Damages arising from the actions, omissions, or Content of third parties, including other Users.</li>
                <li>Damages arising from Platform downtime, errors, interruptions, or data loss.</li>
                <li>Damages arising from unauthorized access to or alteration of your data.</li>
                <li>Damages arising from any attorney-client relationship formed through the Platform.</li>
              </ul>

              <h3 className="terms-sub">11.3 Disclaimer of Warranties</h3>
              <div className="terms-alert terms-alert-red">
                <p style={{ fontWeight: 600, margin: 0 }}>
                  THE PLATFORM AND ALL CONTENT, TOOLS, FEATURES, AND SERVICES ARE PROVIDED ON AN
                  &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED. O1DMATCH DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED
                  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                  NON-INFRINGEMENT.
                </p>
              </div>
            </Section>

            {/* 12. Indemnification */}
            <Section id="indemnification" icon={Shield} title="12. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless O1DMatch and all O1DMatch Parties
                from and against any and all claims, actions, demands, liabilities, damages, losses,
                costs, and expenses (including reasonable attorneys&apos; fees) arising out of or
                relating to:
              </p>
              <ul>
                <li>Your use of or access to the Platform.</li>
                <li>Your violation of these Terms.</li>
                <li>Any Content you upload, submit, or transmit through the Platform.</li>
                <li>Any inaccurate, false, or misleading information you provide through the Platform.</li>
                <li>Your violation of any applicable law, regulation, or third-party right.</li>
                <li>Any dispute between you and another User of the Platform.</li>
                <li>Any claim by a third party related to your use of the Platform or Content you provided.</li>
                <li>Any immigration proceeding, petition, or application in which information or materials from the Platform were used.</li>
                <li>Your circumvention or attempted circumvention of placement fees.</li>
              </ul>
              <p>
                O1DMatch reserves the right, at your expense, to assume the exclusive defense and
                control of any matter subject to indemnification by you. You agree not to settle any
                such claim without O1DMatch&apos;s prior written consent.
              </p>
            </Section>

            {/* 13. Arbitration */}
            <section id="arbitration" style={{ scrollMarginTop: "6rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0B1D35 0%, #112640 100%)",
                border: "1.5px solid rgba(212,168,75,0.4)",
                borderRadius: 16,
                padding: "1.75rem 1.75rem 1.6rem",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "-30%", right: "-10%",
                  width: 320, height: 320, pointerEvents: "none",
                  background: "radial-gradient(circle, rgba(212,168,75,0.1) 0%, transparent 70%)",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.1rem", position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "rgba(212,168,75,0.18)", border: "1px solid rgba(212,168,75,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Gavel size={20} style={{ color: "#D4A84B" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, color: "#D4A84B", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      Important — Section 13
                    </p>
                    <h2 style={{
                      margin: 0, fontFamily: "'Playfair Display', serif",
                      fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF",
                    }}>
                      Mandatory Binding Arbitration And Class Action Waiver
                    </h2>
                  </div>
                </div>

                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <p style={{ margin: 0, fontSize: "0.93rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                    YOU AND O1DMATCH AGREE THAT ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF
                    OR RELATING TO THESE TERMS, THE PLATFORM, OR YOUR USE OF THE PLATFORM SHALL BE
                    RESOLVED EXCLUSIVELY THROUGH FINAL AND BINDING INDIVIDUAL ARBITRATION, RATHER
                    THAN IN COURT, except that either party may bring an individual action in small
                    claims court if the claim qualifies.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem", marginTop: "0.25rem" }}>
                    {[
                      {
                        title: "Arbitration Administration",
                        body: "Arbitration shall be administered by the American Arbitration Association (AAA) or JAMS under their respective rules then in effect.",
                      },
                      {
                        title: "Venue",
                        body: "All arbitration proceedings shall take place in Charlotte, North Carolina (Mecklenburg County), unless the parties mutually agree otherwise in writing.",
                      },
                      {
                        title: "Class Action Waiver",
                        body: "EACH PARTY MAY BRING DISPUTES ONLY IN AN INDIVIDUAL CAPACITY. NO CLASS, COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE ACTIONS ARE PERMITTED.",
                      },
                    ].map(({ title, body }) => (
                      <div key={title} style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(212,168,75,0.2)",
                        borderRadius: 10,
                        padding: "1rem 1.1rem",
                      }}>
                        <p style={{ margin: "0 0 0.4rem", fontWeight: 700, fontSize: "0.83rem", color: "#D4A84B" }}>
                          {title}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "0.6rem",
                    background: "rgba(212,168,75,0.1)", border: "1px solid rgba(212,168,75,0.25)",
                    borderRadius: 10, padding: "0.85rem 1rem", marginTop: "0.25rem",
                  }}>
                    <AlertTriangle size={15} style={{ color: "#D4A84B", flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
                      <strong style={{ color: "#E8C97A" }}>Opt-Out Right:</strong>{" "}
                      You may opt out of this arbitration provision by sending written notice to{" "}
                      <a href="mailto:info@o1dmatch.com" style={{ color: "#D4A84B", textDecoration: "none" }}>
                        info@o1dmatch.com
                      </a>{" "}
                      within thirty (30) days of your first use of the Platform. The notice must
                      include your name, address, email, and a clear statement that you wish to opt
                      out of arbitration. If you opt out, disputes shall be submitted to the exclusive
                      jurisdiction of the state and federal courts in Mecklenburg County, North
                      Carolina. YOU AND O1DMATCH HEREBY WAIVE ANY RIGHT TO A JURY TRIAL.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 14. User-Type-Specific Provisions */}
            <Section id="user-types" icon={Users} title="14. User-Type-Specific Provisions">
              <h3 className="terms-sub">14.1 Talent Users</h3>
              <ul>
                <li>By creating a Talent profile, you certify that all claims of extraordinary ability, achievements, awards, publications, memberships, and other evidence submitted through the Platform are truthful and accurately represent your qualifications.</li>
                <li>You acknowledge that the AI score and evidence assessment provided by the Platform is an informational tool and is NOT a legal assessment or prediction of O-1 visa eligibility. You should not rely solely on the AI score when making immigration decisions.</li>
                <li>You consent to your profile being made visible to Employers and Agencies in an anonymized format. Your identity will not be revealed until you affirmatively choose to accept an interest letter or otherwise consent to identity disclosure.</li>
                <li>You acknowledge that placement fees may apply if you are successfully matched with an employer through the Platform.</li>
              </ul>

              <h3 className="terms-sub">14.2 Employer Users</h3>
              <ul>
                <li>By issuing an interest letter through the Platform, you acknowledge that it is a non-binding expression of interest and does not constitute a job offer, employment contract, visa sponsorship commitment, or any binding obligation.</li>
                <li>You are not committing to hire, sponsor, or petition for any talent by sending an interest letter. Either party may decline to proceed at any stage.</li>
                <li>You acknowledge and agree that placement fees may be charged for successful hires resulting from connections made through the Platform, as set forth in Section 7.</li>
                <li>You are responsible for the accuracy of all job postings, company information, and other Content you submit to the Platform.</li>
              </ul>

              <h3 className="terms-sub">14.3 Agency Users</h3>
              <ul>
                <li>By using the Platform on behalf of employer clients, you represent and warrant that you have the full legal authority to act on behalf of each employer client.</li>
                <li>You are responsible for the accuracy of all jobs posted on behalf of your employer clients.</li>
                <li>You acknowledge that placement fees may apply to successful matches for your employer clients, and that you may be jointly and severally liable with your employer client for such fees.</li>
                <li>You agree to ensure that your employer clients are aware of and comply with these Terms.</li>
              </ul>

              <h3 className="terms-sub">14.4 Attorney Users</h3>
              <ul>
                <li>By listing yourself in the O1DMatch attorney directory, you represent and warrant that you are a licensed attorney in good standing in at least one U.S. jurisdiction and that you are authorized to practice immigration law.</li>
                <li>Listing in the directory does NOT constitute an endorsement, recommendation, or referral by O1DMatch. O1DMatch does not evaluate, verify, or vouch for the qualifications or competence of any listed attorney.</li>
                <li>You are solely responsible for your own legal advice, legal opinions, legal representation, and client relationships.</li>
                <li>You agree to comply with all applicable rules of professional conduct and bar requirements in connection with your use of the Platform.</li>
                <li>You are responsible for ensuring that your directory listing, including credentials and practice areas, is accurate and current.</li>
              </ul>
            </Section>

            {/* 15. Account Termination */}
            <Section id="termination" icon={Ban} title="15. Account Termination">
              <h3 className="terms-sub">15.1 Termination by O1DMatch</h3>
              <p>
                O1DMatch may suspend, restrict, or terminate your account and access to the Platform
                at any time, for any reason or no reason, with or without notice, at our sole
                discretion. Reasons for termination may include violation of these Terms, fraudulent
                activity, inactivity, failure to pay fees, legal requirements, or operational
                considerations.
              </p>

              <h3 className="terms-sub">15.2 Termination by User</h3>
              <p>
                You may delete your account at any time through the Platform&apos;s account settings
                or by contacting us at{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>.
                Deletion of your account does not entitle you to any refund of fees paid.
              </p>

              <h3 className="terms-sub">15.3 Effect of Termination</h3>
              <p>Upon termination:</p>
              <ul>
                <li>Your license to use the Platform immediately terminates.</li>
                <li>You must cease all use of the Platform.</li>
                <li>O1DMatch may delete or retain your Content and data in accordance with our <Link href="/privacy" className="terms-link">Privacy Policy</Link>.</li>
                <li>Sections that by their nature should survive termination shall survive, including but not limited to Sections 3, 4, 5, 7, 9, 10, 11, 12, 13, and 17.</li>
              </ul>

              <h3 className="terms-sub">15.4 Data Retention After Termination</h3>
              <p>
                O1DMatch retains the right to retain your data following account termination as
                described in our{" "}
                <Link href="/privacy" className="terms-link">Privacy Policy</Link>, including for
                legal compliance, dispute resolution, fraud prevention, and enforcement of these Terms.
              </p>
            </Section>

            {/* 16. Modifications to Terms */}
            <Section id="modifications" icon={RefreshCw} title="16. Modifications to Terms">
              <h3 className="terms-sub">16.1 Right to Modify</h3>
              <p>
                O1DMatch reserves the right to modify, amend, or update these Terms at any time, at
                our sole discretion.
              </p>

              <h3 className="terms-sub">16.2 Notice of Material Changes</h3>
              <p>
                For material changes to these Terms, O1DMatch will provide at least thirty (30) days&apos;
                advance notice via email to the address associated with your account and/or through a
                prominent notice on the Platform.
              </p>

              <h3 className="terms-sub">16.3 Acceptance Through Continued Use</h3>
              <p>
                Your continued use of the Platform after the effective date of any modifications
                constitutes your acceptance of the modified Terms. If you do not agree to the modified
                Terms, you must stop using the Platform and close your account before the modifications
                take effect.
              </p>

              <h3 className="terms-sub">16.4 Non-Material Changes</h3>
              <p>
                O1DMatch may make non-material changes to these Terms (such as formatting, typographical
                corrections, or clarifications) at any time without advance notice.
              </p>
            </Section>

            {/* 17. General Provisions */}
            <Section id="general" icon={Lock} title="17. General Provisions">
              <h3 className="terms-sub">17.1 Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                State of Florida, without regard to its conflict of law provisions.
              </p>

              <h3 className="terms-sub">17.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable,
                such provision shall be modified to the minimum extent necessary to make it
                enforceable, and the remaining provisions shall continue in full force and effect.
              </p>

              <h3 className="terms-sub">17.3 Entire Agreement</h3>
              <p>
                These Terms, together with the Privacy Policy and any other policies or agreements
                referenced herein, constitute the entire agreement between you and O1DMatch regarding
                the Platform and supersede all prior and contemporaneous agreements.
              </p>

              <h3 className="terms-sub">17.4 Waiver</h3>
              <p>
                The failure of O1DMatch to enforce any right or provision of these Terms shall not
                constitute a waiver of such right or provision. Any waiver must be in writing and
                signed by O1DMatch.
              </p>

              <h3 className="terms-sub">17.5 Assignment</h3>
              <p>
                You may not assign or transfer these Terms or any rights or obligations hereunder
                without O1DMatch&apos;s prior written consent. O1DMatch may freely assign or transfer
                these Terms without restriction, including in connection with a merger, acquisition,
                reorganization, or sale of assets.
              </p>

              <h3 className="terms-sub">17.6 Force Majeure</h3>
              <p>
                O1DMatch shall not be liable for any failure or delay in performance resulting from
                causes beyond its reasonable control, including but not limited to acts of God, natural
                disasters, pandemic, war, terrorism, government actions, internet or telecommunications
                failures, power failures, or third-party service provider failures.
              </p>

              <h3 className="terms-sub">17.7 Notices</h3>
              <p>
                All notices to O1DMatch must be sent to{" "}
                <a href="mailto:info@o1dmatch.com" className="terms-link">info@o1dmatch.com</a>.
                Notices to Users will be sent to the email address associated with the User&apos;s account.
              </p>

              <h3 className="terms-sub">17.8 No Third-Party Beneficiaries</h3>
              <p>
                These Terms do not create any third-party beneficiary rights in any individual or
                entity that is not a party to these Terms.
              </p>

              <h3 className="terms-sub">17.9 Relationship of Parties</h3>
              <p>
                Nothing in these Terms creates a partnership, joint venture, agency, or employment
                relationship between you and O1DMatch.
              </p>
            </Section>

            {/* 18. Contact */}
            <Section id="contact" icon={Mail} title="18. Contact Us">
              <p>If you have questions or concerns about these Terms, please contact us:</p>
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

            {/* Bottom nav */}
            <div style={{
              paddingTop: "2rem", borderTop: "1px solid #E8E0D4",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
            }}>
              <Link href="/" style={{ fontSize: "0.85rem", color: "#64748B", textDecoration: "none" }}>
                ← Back to Home
              </Link>
              <Link href="/privacy" className="o1d-btn-primary" style={{ fontSize: "0.88rem" }}>
                <Shield size={15} /> Read Privacy Policy →
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