/* src/app/enterprise/page.tsx */
// import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ChevronRight, ArrowRight, Star } from "lucide-react";
import EnterpriseContactForm from "./EnterpriseContactForm";
import "@/app/theme.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Enterprise Partnerships | O1DMatch",
  description:
    "Custom enterprise solutions for immigration attorneys, staffing agencies, and employers who need more from the O1DMatch platform.",
};

export default function EnterprisePage() {
  return (
    <div className="o1d-page" style={{ minHeight: "100vh", background: "#FBF8F1", scrollBehavior: "smooth" }}>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{
        background: "#0B1D35",
        position: "relative",
        overflow: "hidden",
        paddingTop: "5.5rem",
        paddingBottom: "5rem",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Glow left */}
        <div style={{
          position: "absolute", top: "-30%", left: "-10%",
          width: 600, height: 600, pointerEvents: "none",
          background: "radial-gradient(circle,rgba(212,168,75,0.07) 0%,transparent 70%)",
        }} />
        {/* Glow right */}
        <div style={{
          position: "absolute", bottom: "-40%", right: "-10%",
          width: 700, height: 700, pointerEvents: "none",
          background: "radial-gradient(circle,rgba(212,168,75,0.06) 0%,transparent 70%)",
        }} />

        <div style={{
          maxWidth: 820, margin: "0 auto", padding: "0 1.5rem",
          textAlign: "center", position: "relative", zIndex: 2,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(212,168,75,0.1)", border: "1px solid rgba(212,168,75,0.25)",
            borderRadius: 100, padding: "0.35rem 1rem",
            fontSize: "0.75rem", color: "#E8C97A", fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            marginBottom: "1.75rem",
          }}>
            <Star size={12} />
            Enterprise Solutions
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
            fontWeight: 700, color: "#FFFFFF",
            marginBottom: "1.25rem", lineHeight: 1.1,
          }}>
            Enterprise{" "}
            <em style={{ fontStyle: "normal", color: "#D4A84B" }}>Partnerships</em>
          </h1>

          <p style={{
            fontSize: "1.1rem", color: "rgba(255,255,255,0.65)",
            lineHeight: 1.75, maxWidth: 620, margin: "0 auto 2.5rem",
          }}>
            Custom solutions for attorneys, staffing agencies, and employers
            who want more from O1DMatch.
          </p>

          {/* CTA row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "1rem", flexWrap: "wrap",
          }}>
            <a href="#contact" className="o1d-btn-primary" style={{ fontSize: "0.95rem", padding: "0.75rem 1.75rem" }}>
              Talk to Our Team <ArrowRight size={16} />
            </a>
            <a href="#who-its-for" style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.9rem", color: "rgba(255,255,255,0.65)",
              textDecoration: "none", fontWeight: 500,
            }}>
              Learn more <ChevronRight size={15} />
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "3rem",
            marginTop: "3.5rem", flexWrap: "wrap",
          }}>
            {[
              { value: "8",    label: "O-1 Criteria Scored" },
              { value: "4",    label: "User Types Supported" },
              { value: "100%", label: "AI-Powered Matching" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2rem", fontWeight: 700, color: "#D4A84B", margin: 0,
                }}>
                  {value}
                </p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: 0, marginTop: "0.2rem" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 1 — FOR EMPLOYERS
      ══════════════════════════════════════ */}
      <section style={{ padding: "5rem 1.5rem", background: "#FBF8F1" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>

          {/* Section label */}
          <div style={{ marginBottom: "2.75rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 700, color: "#D4A84B",
              textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.5rem",
            }}>
              For Employers
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
              fontWeight: 700, color: "#0B1D35",
              margin: "0 0 1rem", lineHeight: 1.15,
            }}>
              Managed Recruiting +{" "}
              <em style={{ fontStyle: "normal", color: "#D4A84B" }}>Immigration Compliance</em>
            </h2>
            <p style={{
              fontSize: "1rem", color: "#64748B", lineHeight: 1.7,
              maxWidth: 580, margin: 0,
            }}>
              A fully managed solution — we source the talent, handle the immigration
              process, and keep your company compliant from day one.
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className="enterprise-employer-grid"
          >

            {/* Left — feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                {
                  title: "Active O-1 Talent Recruiting",
                  body: "We actively recruit O-1 qualified talent for your company — you don't source, we do. Candidates are pre-scored across all 8 USCIS criteria before you ever see a profile.",
                },
                {
                  title: "Full Immigration Process Management",
                  body: "O1DMatch serves as the petitioner/agent — we handle the entire immigration process end to end, from petition preparation to USCIS submission.",
                },
                {
                  title: "USCIS-Compliant Contracts",
                  body: "All engagements are structured with USCIS-compliant contracts for contemplated future employment, ensuring your company meets regulatory requirements at every stage.",
                },
                {
                  title: "Unlimited Platform Access",
                  body: "Your team gets unlimited platform access plus a dedicated account manager who knows your hiring criteria and keeps things moving.",
                },
              ].map(({ title, body }) => (
                <div key={title} style={{
                  display: "flex", gap: "1rem", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#D4A84B", flexShrink: 0, marginTop: "0.45rem",
                  }} />
                  <div>
                    <p style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "0.95rem", fontWeight: 700, color: "#0B1D35",
                      margin: "0 0 0.3rem",
                    }}>
                      {title}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748B", lineHeight: 1.65 }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — pricing card */}
            <div style={{
              background: "#0B1D35",
              borderRadius: 20,
              padding: "2rem 2.25rem",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: "-40%", right: "-20%",
                width: 320, height: 320, pointerEvents: "none",
                background: "radial-gradient(circle,rgba(212,168,75,0.1) 0%,transparent 70%)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Label */}
                <p style={{
                  fontSize: "0.65rem", fontWeight: 700, color: "#D4A84B",
                  textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 1.25rem",
                }}>
                  Employer Plan
                </p>

                {/* Price */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem" }}>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "3rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1,
                    }}>
                      $2,000
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.35rem" }}>
                      / month
                    </span>
                  </div>
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                    Starting price — custom quotes available
                  </p>
                </div>

                {/* Included items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
                  {[
                    "Active O-1 talent recruiting",
                    "Full immigration process management",
                    "USCIS-compliant employment contracts",
                    "Unlimited platform access",
                    "Dedicated account manager",
                    "Placement fees on successful hires",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(212,168,75,0.15)", border: "1px solid rgba(212,168,75,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A84B" }} />
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a href="#contact" className="o1d-btn-primary" style={{
                  display: "flex", justifyContent: "center",
                  fontSize: "0.9rem", padding: "0.75rem 1.5rem",
                }}>
                  Get a Custom Quote
                </a>

                <p style={{
                  textAlign: "center", marginTop: "0.85rem",
                  fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
                }}>
                  No long-term commitment required to start
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — FOR ATTORNEYS
      ══════════════════════════════════════ */}
      <section style={{ padding: "5rem 1.5rem", background: "#0B1D35", position: "relative", overflow: "hidden" }}>
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
          position: "absolute", bottom: "-30%", left: "-10%",
          width: 600, height: 600, pointerEvents: "none",
          background: "radial-gradient(circle,rgba(212,168,75,0.07) 0%,transparent 70%)",
        }} />

        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Two-column layout — card left, features right */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className="enterprise-employer-grid"
          >

            {/* Left — partner card */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(212,168,75,0.3)",
              borderRadius: 20,
              padding: "2rem 2.25rem",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: "-40%", right: "-20%",
                width: 320, height: 320, pointerEvents: "none",
                background: "radial-gradient(circle,rgba(212,168,75,0.08) 0%,transparent 70%)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.45rem",
                  background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.3)",
                  borderRadius: 100, padding: "0.3rem 0.85rem",
                  fontSize: "0.7rem", color: "#E8C97A", fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A84B" }} />
                  O1DMatch Partner
                </div>

                {/* Free to join */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem" }}>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "3rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1,
                    }}>
                      Free
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.35rem" }}>
                      to join
                    </span>
                  </div>
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                    Earn from referrals and bulk code sales
                  </p>
                </div>

                {/* What you get */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
                  {[
                    "Bulk promo codes at a discount",
                    "20% commission on referred subscriptions",
                    "Priority attorney directory listing",
                    "\"O1DMatch Partner\" badge on your profile",
                    "Early access to new platform features",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(212,168,75,0.15)", border: "1px solid rgba(212,168,75,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A84B" }} />
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a href="#contact" className="o1d-btn-primary" style={{
                  display: "flex", justifyContent: "center",
                  fontSize: "0.9rem", padding: "0.75rem 1.5rem",
                }}>
                  Apply to Partner Program
                </a>

                <p style={{
                  textAlign: "center", marginTop: "0.85rem",
                  fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
                }}>
                  No fees, no minimums — start earning immediately
                </p>
              </div>
            </div>

            {/* Right — section label + feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              <div style={{ marginBottom: "2.25rem" }}>
                <p style={{
                  fontSize: "0.7rem", fontWeight: 700, color: "#D4A84B",
                  textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.5rem",
                }}>
                  For Attorneys
                </p>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
                  fontWeight: 700, color: "#FFFFFF",
                  margin: "0 0 1rem", lineHeight: 1.15,
                }}>
                  Partner{" "}
                  <em style={{ fontStyle: "normal", color: "#D4A84B" }}>Program</em>
                </h2>
                <p style={{
                  fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7,
                  maxWidth: 480, margin: 0,
                }}>
                  Join as a partner and unlock discounts, commissions, and visibility
                  that grow your practice while helping your O-1 clients succeed.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  {
                    title: "Bulk Promo Codes at a Discount",
                    body: "Buy promo codes in bulk at a reduced rate and pass savings directly to your O-1 clients. Give every client a head start on the platform without adding to their costs.",
                  },
                  {
                    title: "20% Referral Commission",
                    body: "Earn 20% commission on subscription revenue from every client you refer to O1DMatch — paid automatically as long as their subscription remains active.",
                  },
                  {
                    title: "Priority Directory Listing + Partner Badge",
                    body: "Your attorney profile is elevated to the top of the directory with a verified \"O1DMatch Partner\" badge, signaling credibility to talent and employers browsing for counsel.",
                  },
                  {
                    title: "Free to Join",
                    body: "There are no fees, no minimums, and no long-term commitments to become a partner. Apply, get approved, and start earning from your first referral.",
                  },
                ].map(({ title, body }) => (
                  <div key={title} style={{
                    display: "flex", gap: "1rem", alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#D4A84B", flexShrink: 0, marginTop: "0.45rem",
                    }} />
                    <div>
                      <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF",
                        margin: "0 0 0.3rem",
                      }}>
                        {title}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — FOR STAFFING AGENCIES
      ══════════════════════════════════════ */}
      <section style={{ padding: "5rem 1.5rem", background: "#FBF8F1" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom: "2.75rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 700, color: "#D4A84B",
              textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.5rem",
            }}>
              For Staffing Agencies
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
              fontWeight: 700, color: "#0B1D35",
              margin: "0 0 1rem", lineHeight: 1.15,
            }}>
              Agency{" "}
              <em style={{ fontStyle: "normal", color: "#D4A84B" }}>Partner Program</em>
            </h2>
            <p style={{
              fontSize: "1rem", color: "#64748B", lineHeight: 1.7,
              maxWidth: 560, margin: 0,
            }}>
              All the affiliate and bulk code benefits of the Attorney Partner Program,
              plus dedicated agency tools for managing multiple employer clients at scale.
            </p>
          </div>

          {/* Shared benefits row */}
          <div style={{
            background: "#FFFFFF", border: "1.5px solid #E8E0D4",
            borderRadius: 16, padding: "1.5rem 1.75rem",
            marginBottom: "2rem",
            display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
          }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 700, color: "#D4A84B",
              textTransform: "uppercase", letterSpacing: "0.1em",
              margin: 0, flexShrink: 0,
            }}>
              Included on all plans:
            </p>
            {[
              "Bulk promo codes at a discount",
              "20% referral commission",
              "Volume job posting discounts",
              "Bulk interest letter credits",
            ].map((item) => (
              <div key={item} style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.82rem", color: "#334155", fontWeight: 500,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A84B", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>

          {/* Two pricing cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
          className="enterprise-employer-grid">

            {/* Professional tier */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #E8E0D4",
              borderRadius: 20,
              padding: "2rem 2.25rem",
              display: "flex", flexDirection: "column", gap: "1.5rem",
            }}>
              <div>
                <p style={{
                  fontSize: "0.65rem", fontWeight: 700, color: "#64748B",
                  textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 0.75rem",
                }}>
                  Professional
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem", marginBottom: "0.35rem" }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.75rem", fontWeight: 700, color: "#0B1D35", lineHeight: 1,
                  }}>
                    $499
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "#94A3B8", marginBottom: "0.3rem" }}>/ month</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#94A3B8" }}>
                  For growing agencies managing multiple clients
                </p>
              </div>

              <div style={{ height: "1px", background: "#E8E0D4" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  "Unlimited employer clients",
                  "Unlimited job postings",
                  "Bulk interest letter credits",
                  "Volume job posting discounts",
                  "Bulk promo codes at a discount",
                  "20% referral commission",
                  "Priority support",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(212,168,75,0.1)", border: "1px solid rgba(212,168,75,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A84B" }} />
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#334155" }}>{item}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" style={{
                marginTop: "auto",
                display: "flex", justifyContent: "center", alignItems: "center",
                gap: "0.4rem", fontSize: "0.88rem", fontWeight: 600,
                color: "#0B1D35", textDecoration: "none",
                border: "1.5px solid #0B1D35", borderRadius: 10,
                padding: "0.75rem 1.5rem",
              }}>
                Get Started
              </a>
            </div>

            {/* Enterprise tier */}
            <div style={{
              background: "#0B1D35",
              border: "1.5px solid rgba(212,168,75,0.35)",
              borderRadius: 20,
              padding: "2rem 2.25rem",
              display: "flex", flexDirection: "column", gap: "1.5rem",
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: "-40%", right: "-20%",
                width: 320, height: 320, pointerEvents: "none",
                background: "radial-gradient(circle,rgba(212,168,75,0.1) 0%,transparent 70%)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Best value badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.3)",
                  borderRadius: 100, padding: "0.25rem 0.75rem",
                  fontSize: "0.65rem", color: "#E8C97A", fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}>
                  Most Popular
                </div>

                <p style={{
                  fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 0.75rem",
                }}>
                  Enterprise
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem", marginBottom: "0.35rem" }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.75rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1,
                  }}>
                    $999
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.3rem" }}>/ month</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                  For high-volume agencies needing full platform power
                </p>
              </div>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", position: "relative", zIndex: 1 }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", position: "relative", zIndex: 1 }}>
                {[
                  { label: "Everything in Professional", highlight: false },
                  { label: "API access", highlight: true },
                  { label: "Dedicated account manager", highlight: true },
                  { label: "Custom integration support", highlight: false },
                  { label: "Advanced analytics and reporting", highlight: false },
                  { label: "SLA-backed priority support", highlight: false },
                ].map(({ label, highlight }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: highlight ? "rgba(212,168,75,0.2)" : "rgba(255,255,255,0.06)",
                      border: highlight ? "1px solid rgba(212,168,75,0.4)" : "1px solid rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: highlight ? "#D4A84B" : "rgba(255,255,255,0.4)",
                      }} />
                    </div>
                    <span style={{
                      fontSize: "0.85rem",
                      color: highlight ? "#E8C97A" : "rgba(255,255,255,0.75)",
                      fontWeight: highlight ? 600 : 400,
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="o1d-btn-primary" style={{
                marginTop: "auto",
                display: "flex", justifyContent: "center",
                fontSize: "0.9rem", padding: "0.75rem 1.5rem",
                position: "relative", zIndex: 1,
              }}>
                Get a Custom Quote
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTACT FORM
      ══════════════════════════════════════ */}
      <section id="contact" style={{
        background: "#0B1D35", padding: "5rem 1.5rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 700, pointerEvents: "none",
          background: "radial-gradient(circle,rgba(212,168,75,0.06) 0%,transparent 65%)",
        }} />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 700, color: "#D4A84B",
              textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.6rem",
            }}>
              Get in Touch
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
              fontWeight: 700, color: "#FFFFFF",
              margin: "0 0 1rem", lineHeight: 1.15,
            }}>
              Let&apos;s build your{" "}
              <em style={{ fontStyle: "normal", color: "#D4A84B" }}>custom solution</em>
            </h2>
            <p style={{
              fontSize: "1rem", color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7, margin: 0,
            }}>
              Tell us about your firm or company and we&apos;ll follow up within 24 hours
              with a tailored proposal.
            </p>
          </div>

          <EnterpriseContactForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}