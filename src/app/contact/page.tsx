// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send, Loader2, CheckCircle, AlertCircle,
  Mail, Phone, MapPin, ArrowRight,
  MessageSquare, Clock, Globe,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useO1DAnimations } from "@/hooks/useO1DAnimations";
import "@/app/theme.css";

const SUBJECTS = [
  "General Inquiry", "O-1 Visa Questions", "Employer Partnership",
  "Talent Registration", "Platform Support", "Billing & Subscriptions",
  "Press & Media", "Other",
];

const USER_TYPES = [
  { value: "talent",   label: "I'm a Talent / Applicant" },
  { value: "employer", label: "I'm an Employer" },
  { value: "lawyer",   label: "I'm an Immigration Lawyer" },
  { value: "agency",   label: "I'm a Recruitment Agency" },
  { value: "general",  label: "Other / General" },
];

const INFO_ITEMS = [
  {
    icon: <Mail size={18} />, label: "Email",
    content: (
      <a href="mailto:support@o1dmatch.com" style={{ color: "#D4A84B", fontSize: "0.85rem", textDecoration: "none" }}>
        support@o1dmatch.com
      </a>
    ),
  },
  {
    icon: <Phone size={18} />, label: "Phone",
    content: (
      <>
        <a href="tel:+18000000000" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", textDecoration: "none", display: "block" }}>
          +1 (800) 000-0000
        </a>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Mon–Fri, 9am–6pm EST</span>
      </>
    ),
  },
  {
    icon: <MapPin size={18} />, label: "Office",
    content: <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>United States</span>,
  },
  {
    icon: <Clock size={18} />, label: "Response Time",
    content: <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Within 24 hours</span>,
  },
  {
    icon: <Globe size={18} />, label: "Serving",
    content: <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Global talent & U.S. employers</span>,
  },
];

const inputBase: React.CSSProperties = {
  width: "100%", padding: "0.7rem 1rem",
  border: "1.5px solid #E8E0D4", borderRadius: "10px",
  fontSize: "0.88rem", fontFamily: "'DM Sans', sans-serif",
  color: "#1E293B", background: "#FDFCFA", outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
};

const labelS: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 600,
  color: "#0B1D35", marginBottom: "0.45rem", letterSpacing: "0.01em",
};

function useFocus() {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.target.style.borderColor = "#D4A84B";
      e.target.style.boxShadow = "0 0 0 3px rgba(212,168,75,0.12)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.target.style.borderColor = "#E8E0D4";
      e.target.style.boxShadow = "none";
    },
  };
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [userType, setUserType] = useState("general");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const focus = useFocus();
  useO1DAnimations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim())                                                  { setError("Please enter your name"); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))   { setError("Please enter a valid email address"); return; }
    if (!subject)                                                       { setError("Please select a subject"); return; }
    if (!message.trim())                                               { setError("Please enter your message"); return; }
    if (message.trim().length < 10)                                    { setError("Message must be at least 10 characters"); return; }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() || null, subject, message: message.trim(), user_type: userType, website }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send message. Please try again."); return; }
      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSuccess(false); setName(""); setEmail(""); setPhone("");
    setSubject(""); setMessage(""); setUserType("general");
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="o1d-page" style={{ minHeight: "100vh" }}>
        <Navbar />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#FBF8F1" }}>
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.75rem",
            }}>
              <CheckCircle size={38} color="#10B981" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "#0B1D35", marginBottom: "0.75rem", fontWeight: 700 }}>
              Message Sent!
            </h1>
            <p style={{ color: "#64748B", lineHeight: 1.65, marginBottom: "0.5rem" }}>
              Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#94A3B8", marginBottom: "2.5rem" }}>
              A confirmation has been sent to <strong style={{ color: "#0B1D35" }}>{email}</strong>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" className="o1d-btn-primary">Back to Home</Link>
              <button onClick={resetForm} className="o1d-btn-outline" style={{ border: "1.5px solid #CBD5E1" }}>Send Another</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="o1d-page" style={{ minHeight: "100vh" }}>
      <Navbar />

      {/* ── Navy Hero ── */}
      <div className="o1d-pricing-hero" style={{ paddingBottom: "3.5rem" }}>
        <div className="o1d-pricing-hero-glow" />
        <div className="o1d-pricing-hero-inner">
          <div className="o1d-hero-badge" style={{ marginBottom: "1.25rem" }}>
            <MessageSquare size={13} style={{ color: "#E8C97A" }} />
            <span>We&apos;d love to hear from you</span>
          </div>
          <h1 className="o1d-hero-h1" style={{ fontSize: "2.8rem", marginBottom: "0.75rem" }}>
            Get in <em>Touch</em>
          </h1>
          <p className="o1d-hero-sub o1d-hero-sub-center">
            Have questions about the O-1 visa process or our platform?
            Fill out the form and we&apos;ll respond within 24 hours.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="o1d-pricing-body" style={{ paddingTop: "3.5rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem", alignItems: "start" }} className="contact-grid">

            {/* ── Sidebar ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Info card – navy */}
              <div style={{ background: "#0B1D35", borderRadius: "16px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#D4A84B", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Contact Info
                </p>
                {INFO_ITEMS.map(({ icon, label, content }) => (
                  <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
                      background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#D4A84B",
                    }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {label}
                      </p>
                      {content}
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ callout – gold */}
              <div style={{ background: "linear-gradient(135deg, #D4A84B 0%, #B8862D 100%)", borderRadius: "16px", padding: "1.75rem" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.05rem", color: "#0B1D35", marginBottom: "0.5rem" }}>
                  Looking for quick answers?
                </p>
                <p style={{ fontSize: "0.83rem", color: "rgba(11,29,53,0.7)", marginBottom: "1.25rem", lineHeight: 1.55 }}>
                  Check our knowledge base for answers to commonly asked questions about the O-1 visa process.
                </p>
                <Link href="/blog" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.55rem 1.1rem", borderRadius: "8px",
                  background: "rgba(11,29,53,0.12)", color: "#0B1D35",
                  fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                }}>
                  Visit Our Blog <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* ── Form card ── */}
            <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1.5px solid #E8E0D4", padding: "2.25rem" }}>

              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.9rem 1.1rem", borderRadius: "10px", marginBottom: "1.5rem",
                  background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)",
                }}>
                  <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "0.85rem", color: "#B91C1C" }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Honeypot */}
                <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1} autoComplete="off"
                  style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }} />

                {/* Row 1: Name + Email */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelS}>Full Name <span style={{ color: "#EF4444" }}>*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith" maxLength={100} style={inputBase} {...focus} />
                  </div>
                  <div>
                    <label style={labelS}>Email Address <span style={{ color: "#EF4444" }}>*</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com" maxLength={200} style={inputBase} {...focus} />
                  </div>
                </div>

                {/* Row 2: Phone + User Type */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelS}>Phone <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span></label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000" maxLength={20} style={inputBase} {...focus} />
                  </div>
                  <div>
                    <label style={labelS}>I am a…</label>
                    <select value={userType} onChange={(e) => setUserType(e.target.value)}
                      style={{ ...inputBase, cursor: "pointer" }} {...focus}>
                      {USER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={labelS}>Subject <span style={{ color: "#EF4444" }}>*</span></label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    style={{ ...inputBase, cursor: "pointer" }} {...focus}>
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label style={labelS}>Message <span style={{ color: "#EF4444" }}>*</span></label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help you…" rows={6} maxLength={5000}
                    style={{ ...inputBase, resize: "none", lineHeight: 1.6 }} {...focus} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Please provide as much detail as possible</span>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{message.length}/5000</span>
                  </div>
                </div>

                {/* Privacy */}
                <p style={{ fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.6 }}>
                  By submitting this form, you agree that we may use the information you provide to respond to your inquiry.
                  We will never share your information with third parties. See our{" "}
                  <Link href="/privacy" style={{ color: "#D4A84B", textDecoration: "underline" }}>Privacy Policy</Link> for details.
                </p>

                {/* Submit */}
                <div>
                  <button type="submit" disabled={sending} className="o1d-btn-primary"
                    style={{ opacity: sending ? 0.7 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
                    {sending
                      ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                      : <><Send size={16} /> Send Message</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="o1d-footer" style={{ marginTop: "4rem" }}>
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

      <style>{`
        @media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .form-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}