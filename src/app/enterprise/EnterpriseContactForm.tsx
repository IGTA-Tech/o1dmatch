"use client";
/* src/app/enterprise/EnterpriseContactForm.tsx */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";

const INTERESTS = [
  { value: "managed_recruiting",  label: "Managed Recruiting" },
  { value: "bulk_promo_codes",    label: "Bulk Promo Codes" },
  { value: "affiliate_program",   label: "Affiliate Program" },
  { value: "volume_pricing",      label: "Volume Pricing" },
  { value: "other",               label: "Other" },
];

type FormState = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  user_type: string;
  interests: string[];
  message: string;
};

const EMPTY: FormState = {
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  user_type: "",
  interests: [],
  message: "",
};

export default function EnterpriseContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCheckbox(value: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((v) => v !== value)
        : [...prev.interests, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      // 1 — Save to Supabase
      const { error: dbError } = await supabase
        .from("enterprise_inquiries")
        .insert([{
          full_name:    form.full_name,
          company_name: form.company_name,
          email:        form.email,
          phone:        form.phone || null,
          user_type:    form.user_type,
          interests:    form.interests,
          message:      form.message || null,
          created_at:   new Date().toISOString(),
        }]);

      if (dbError) throw new Error(dbError.message);

      // 2 — Send notification email
      const res = await fetch("/api/enterprise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        // Email failure is non-fatal — lead is already saved
        console.error("Email notification failed:", await res.text());
      }

      setStatus("success");
      setForm(EMPTY);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  /* ── Input style helper ── */
  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "0.7rem 1rem",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    fontSize: "0.9rem", color: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.78rem", fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    display: "block", marginBottom: "0.4rem",
    letterSpacing: "0.02em",
  };

  /* ── Success state ── */
  if (status === "success") {
    return (
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1.5px solid rgba(212,168,75,0.3)",
        borderRadius: 20,
        padding: "3rem 2rem",
        textAlign: "center",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle2 size={26} style={{ color: "#D4A84B" }} />
        </div>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.4rem", fontWeight: 700, color: "#FFFFFF", margin: 0,
        }}>
          Thank you!
        </h3>
        <p style={{ margin: 0, fontSize: "1rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Row 1 — Full Name + Company */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
        className="enterprise-form-row">
        <div>
          <label htmlFor="full_name" style={labelStyle}>
            Full Name <span style={{ color: "#D4A84B" }}>*</span>
          </label>
          <input
            id="full_name" name="full_name" type="text"
            required placeholder="Jane Smith"
            value={form.full_name} onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="company_name" style={labelStyle}>
            Company / Firm Name <span style={{ color: "#D4A84B" }}>*</span>
          </label>
          <input
            id="company_name" name="company_name" type="text"
            required placeholder="Acme Corp"
            value={form.company_name} onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 2 — Email + Phone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
        className="enterprise-form-row">
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email <span style={{ color: "#D4A84B" }}>*</span>
          </label>
          <input
            id="email" name="email" type="email"
            required placeholder="jane@acmecorp.com"
            value={form.email} onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="phone" style={labelStyle}>
            Phone <span style={{ color: "rgba(255,255,255,0.35)" }}>(optional)</span>
          </label>
          <input
            id="phone" name="phone" type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone} onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 3 — I am a */}
      <div>
        <label htmlFor="user_type" style={labelStyle}>
          I am a <span style={{ color: "#D4A84B" }}>*</span>
        </label>
        <select
          id="user_type" name="user_type"
          required
          value={form.user_type} onChange={handleChange}
          style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
        >
          <option value="" disabled style={{ background: "#0B1D35" }}>Select one…</option>
          <option value="employer"          style={{ background: "#0B1D35" }}>Employer</option>
          <option value="immigration_attorney" style={{ background: "#0B1D35" }}>Immigration Attorney</option>
          <option value="staffing_agency"   style={{ background: "#0B1D35" }}>Staffing Agency</option>
        </select>
      </div>

      {/* Row 4 — Checkboxes */}
      <div>
        <p style={{ ...labelStyle, marginBottom: "0.75rem" }}>
          What are you interested in?
        </p>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "0.6rem",
        }}>
          {INTERESTS.map(({ value, label }) => {
            const checked = form.interests.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleCheckbox(value)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.45rem",
                  padding: "0.45rem 0.9rem",
                  borderRadius: 100,
                  border: checked
                    ? "1px solid rgba(212,168,75,0.6)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: checked
                    ? "rgba(212,168,75,0.12)"
                    : "rgba(255,255,255,0.04)",
                  color: checked ? "#E8C97A" : "rgba(255,255,255,0.6)",
                  fontSize: "0.82rem", fontWeight: checked ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {checked && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A84B" }} />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 5 — Message */}
      <div>
        <label htmlFor="message" style={labelStyle}>
          Message <span style={{ color: "rgba(255,255,255,0.35)" }}>(optional)</span>
        </label>
        <textarea
          id="message" name="message"
          rows={4}
          placeholder="Tell us about your firm, current volume, or any specific requirements…"
          value={form.message} onChange={handleChange}
          style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <p style={{
          margin: 0, padding: "0.75rem 1rem",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 10, fontSize: "0.85rem", color: "#FCA5A5",
        }}>
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="o1d-btn-primary"
        style={{
          width: "100%", justifyContent: "center",
          fontSize: "0.95rem", padding: "0.85rem 1.5rem",
          opacity: status === "loading" ? 0.7 : 1,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Submitting…
          </>
        ) : (
          "Submit Inquiry"
        )}
      </button>

      <p style={{
        textAlign: "center", margin: 0,
        fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
      }}>
        We respond to all enterprise inquiries within 24 hours.
      </p>
    </form>
  );
}