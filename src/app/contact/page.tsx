// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  MessageSquare,
  Clock,
  Globe,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const SUBJECTS = [
  "General Inquiry",
  "O-1 Visa Questions",
  "Employer Partnership",
  "Talent Registration",
  "Platform Support",
  "Billing & Subscriptions",
  "Press & Media",
  "Other",
];

const USER_TYPES = [
  { value: "talent", label: "I'm a Talent / Applicant" },
  { value: "employer", label: "I'm an Employer" },
  { value: "lawyer", label: "I'm an Immigration Lawyer" },
  { value: "agency", label: "I'm a Recruitment Agency" },
  { value: "general", label: "Other / General" },
];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!subject) {
      setError("Please select a subject");
      return;
    }
    if (!message.trim()) {
      setError("Please enter your message");
      return;
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          subject,
          message: message.trim(),
          user_type: userType,
          website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  // Success State
  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex items-center justify-center px-4 pt-16">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Message Sent!
            </h1>
            <p className="text-gray-600 mb-2">
              Thank you for reaching out. We&apos;ve received your message and
              will get back to you within 24 hours.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              A confirmation has been sent to <strong>{email}</strong>
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setEmail("");
                  setPhone("");
                  setSubject("");
                  setMessage("");
                  setUserType("general");
                }}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Send Another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              We&apos;d love to hear from you
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Contact Us
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Have questions about the O-1 visa process or our platform?
              We&apos;re here to help. Fill out the form below and we&apos;ll
              respond within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Info Cards */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Email
                    </h3>
                    <a
                      href="mailto:support@o1dmatch.com"
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      support@o1dmatch.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Phone
                    </h3>
                    <a
                      href="tel:+1-800-000-0000"
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      +1 (800) 000-0000
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Mon-Fri, 9am-6pm EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Office
                    </h3>
                    <p className="text-sm text-gray-600">United States</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Response Time
                    </h3>
                    <p className="text-sm text-gray-600">Within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Serving
                    </h3>
                    <p className="text-sm text-gray-600">
                      Global talent & U.S. employers
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Callout */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-2">
                  Looking for quick answers?
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Check our knowledge base for answers to commonly asked
                  questions about the O-1 visa process.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors"
                >
                  Visit Our Blog
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      opacity: 0,
                      height: 0,
                      width: 0,
                    }}
                  />

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        maxLength={100}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        maxLength={200}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Phone & User Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number{" "}
                        <span className="text-gray-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        maxLength={20}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        I am a...
                      </label>
                      <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                      >
                        {USER_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                    >
                      <option value="">Select a subject...</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      maxLength={5000}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none placeholder:text-gray-400 leading-relaxed"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        Please provide as much detail as possible
                      </p>
                      <p className="text-xs text-gray-400">
                        {message.length}/5000
                      </p>
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <p className="text-xs text-gray-400 leading-relaxed">
                    By submitting this form, you agree that we may use the
                    information you provide to respond to your inquiry. We will
                    never share your information with third parties. See our{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    for details.
                  </p>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} O1DMatch. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}