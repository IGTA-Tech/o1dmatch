"use client";

import React, { useState, useEffect, useCallback } from "react";

const VISA_TYPES = ["O-1A", "O-1B", "EB-1A", "EB-2 NIW"] as const;
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
] as const;

const EVALUATION_API = process.env.NEXT_PUBLIC_EVALUATION_API_URL || "https://wyyhglyijavsfrvvlakl.supabase.co/functions/v1/evaluation-api";
const EVALUATION_API_KEY = process.env.NEXT_PUBLIC_EVALUATION_API_KEY || "";

// ─── Types ───────────────────────────────────────────────────────────────────
interface EvaluationRecord {
  id: string;
  full_name: string;
  email: string;
  visa_type: string;
  industry: string | null;
  linkedin_url: string | null;
  story: string | null;
  links: string[];
  job_id: string | null;
  status: string;
  status_url: string | null;
  api_message: string | null;
  api_response: Record<string, unknown> | null;
  created_at: string;
}

// ─── Status helpers ──────────────────────────────────────────────────────────
function getStatusStyle(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "processing":
    case "pending":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return "✓";
    case "processing":
    case "pending":
      return "⟳";
    case "failed":
      return "✗";
    default:
      return "•";
  }
}

// ─── Evaluation Form ─────────────────────────────────────────────────────────
function EvaluationForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    visaType: "",
    language: "en",
    industry: "",
    linkedinUrl: "",
    story: "",
    links: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    jobId: string;
    status: string;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessData(null);

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.visaType) {
      setError("Please select a visa type.");
      return;
    }

    setSubmitting(true);
    try {
      // Build links array from comma-separated input
      const linksArray = form.links
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      // Add LinkedIn URL to links if provided
      if (form.linkedinUrl.trim()) {
        linksArray.unshift(form.linkedinUrl.trim());
      }

      // Build API payload
      const apiPayload = {
        name: form.fullName.trim(),
        email: form.email.trim(),
        visaType: form.visaType,
        language: form.language,
        industry: form.industry.trim() || undefined,
        story: form.story.trim() || undefined,
        links: linksArray.length > 0 ? linksArray : undefined,
      };

      // 1. Call the evaluation API
      const res = await fetch(EVALUATION_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${EVALUATION_API_KEY}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message ?? body?.error ?? `API request failed (${res.status})`
        );
      }

      const apiResponse = await res.json();

      // 2. Save to Supabase via server API route
      const saveRes = await fetch("/api/visa-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          visa_type: form.visaType,
          industry: form.industry.trim() || null,
          linkedin_url: form.linkedinUrl.trim() || null,
          story: form.story.trim() || null,
          links: linksArray,
          job_id: apiResponse.jobId ?? null,
          status: apiResponse.status ?? "pending",
          status_url: apiResponse.statusUrl ?? null,
          api_message: apiResponse.message ?? null,
          api_response: apiResponse,
        }),
      });

      if (!saveRes.ok) {
        const saveBody = await saveRes.json().catch(() => null);
        console.error("[visa-eval] DB save failed:", saveBody);
        // Still show success for the API call, but warn about DB
      }

      // 3. Show success
      setSuccessData({
        jobId: apiResponse.jobId,
        status: apiResponse.status,
        message: apiResponse.message,
      });

      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Evaluation failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      fullName: "",
      email: "",
      visaType: "",
      language: "en",
      industry: "",
      linkedinUrl: "",
      story: "",
      links: "",
    });
    setSuccessData(null);
    setError(null);
  };

  if (successData) {
    return (
      <div className="space-y-5">
        {/* Success banner */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">{successData.message}</h3>
              <p className="mt-1 text-sm text-green-700">
                Your evaluation is being processed. You can track the status in the History tab.
              </p>
            </div>
          </div>
        </div>

        {/* Job details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Job ID</p>
              <p className="mt-1 font-mono text-sm font-semibold text-gray-900 break-all">{successData.jobId}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Status</p>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(successData.status)}`}>
                {getStatusIcon(successData.status)} {successData.status}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Candidate</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{form.fullName} · {form.visaType}</p>
          </div>
        </div>

        {/* New Evaluation button */}
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Evaluation
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">Candidate Information</h2>
        <p className="mt-0.5 text-xs text-gray-500">Fill in the details below to evaluate visa eligibility</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Row: Name + Email */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Candidate's full name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="candidate@email.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row: Visa Type + Language */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="visaType" className="block text-sm font-medium text-gray-700">
              Visa Type <span className="text-red-500">*</span>
            </label>
            <select
              id="visaType"
              name="visaType"
              value={form.visaType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select visa type…</option>
              {VISA_TYPES.map((vt) => (
                <option key={vt} value={vt}>{vt}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Industry + LinkedIn */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry / Field
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="e.g. Artificial Intelligence, Biotech…"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={form.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/…"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Story / Background */}
        <div>
          <label htmlFor="story" className="block text-sm font-medium text-gray-700">
            Background & Achievements
          </label>
          <textarea
            id="story"
            name="story"
            value={form.story}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the candidate's professional background, key achievements, awards, publications, patents, media coverage, memberships, and other relevant accomplishments…"
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">The more detail you provide, the more accurate the evaluation</p>
        </div>

        {/* Links */}
        <div>
          <label htmlFor="links" className="block text-sm font-medium text-gray-700">
            Supporting Links
          </label>
          <textarea
            id="links"
            name="links"
            value={form.links}
            onChange={handleChange}
            rows={3}
            placeholder={"Enter URLs separated by commas\ne.g. https://portfolio.com, https://publication.com/article"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated URLs to portfolios, publications, or profiles</p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting…
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Run Evaluation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Status Modal ────────────────────────────────────────────────────────────
function StatusModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-4 max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Evaluation Status</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Status Display ──────────────────────────────────────────────────────────
function StatusDisplay({ data }: { data: Record<string, unknown> }) {
  const jobId = data.jobId as string | undefined;
  const status = data.status as string | undefined;
  const progress = data.progress as number | undefined;
  const currentStage = data.currentStage as string | undefined;
  const score = data.score as number | null | undefined;
  const overview = data.overview as string | null | undefined;
  const createdAt = data.createdAt as string | undefined;
  const updatedAt = data.updatedAt as string | undefined;

  const barColor =
    status === "completed"
      ? "bg-green-500"
      : status === "failed"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div className="space-y-4">
      {/* Status + Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          {status && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}>
              {getStatusIcon(status)} {status}
            </span>
          )}
          {typeof progress === "number" && (
            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
          )}
        </div>
        {typeof progress === "number" && (
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Current Stage */}
      {currentStage && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Current Stage</p>
          <p className="mt-1 text-sm font-medium text-blue-900">{currentStage}</p>
        </div>
      )}

      {/* Score */}
      {score !== null && score !== undefined && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Score</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{score}</p>
        </div>
      )}

      {/* Overview */}
      {overview && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Overview</p>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{overview}</p>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {jobId && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Job ID</p>
            <p className="mt-1 font-mono text-xs font-medium text-gray-900 break-all">{jobId}</p>
          </div>
        )}
        {createdAt && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Created</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>

      {updatedAt && (
        <p className="text-xs text-gray-400 text-right">
          Last updated: {new Date(updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

// ─── Evaluation History ──────────────────────────────────────────────────────
function EvaluationHistory({ refreshKey }: { refreshKey: number }) {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/visa-evaluation");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Failed to load evaluations (${res.status})`);
      }
      const json = await res.json();
      setEvaluations(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations, refreshKey]);

  const handleCheckStatus = async (jobId: string) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalData(null);

    try {
      const res = await fetch(
        `${EVALUATION_API}/status/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${EVALUATION_API_KEY}`,
          },
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? body?.error ?? `Request failed (${res.status})`);
      }
      const json = await res.json();
      setModalData(json);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
    setModalError(null);
  };

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-gray-500">Loading evaluations…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchEvaluations}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No evaluations yet</h3>
        <p className="mt-1 text-sm text-gray-500">Submit your first evaluation using the &quot;New Evaluation&quot; tab.</p>
      </div>
    );
  }

  return (
    <>
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Candidate</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Visa Type</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Industry</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Job ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {evaluations.map((ev) => (
            <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
              <td className="whitespace-nowrap px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{ev.full_name.toLowerCase()}</p>
                  <p className="text-xs text-gray-500">{ev.email}</p>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">{ev.visa_type}</span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{ev.industry || "—"}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(ev.status)}`}>
                  {getStatusIcon(ev.status)} {ev.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-gray-500">
                {ev.job_id ? ev.job_id.slice(0, 12) + "…" : "—"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(ev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {ev.job_id ? (
                  <button
                    onClick={() => handleCheckStatus(ev.job_id!)}
                    className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Status
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Status Modal */}
    <StatusModal open={modalOpen} onClose={closeModal}>
      {modalLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-gray-500">Loading status…</span>
        </div>
      ) : modalError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{modalError}</p>
        </div>
      ) : modalData ? (
        <StatusDisplay data={modalData} />
      ) : null}
    </StatusModal>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type TabKey = "history" | "new-evaluation";

const TABS: { key: TabKey; label: string }[] = [
  { key: "history", label: "My Evaluations" },
  { key: "new-evaluation", label: "New Evaluation" },
];

export default function VisaEvaluationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Visa Evaluations</h1>
        <p className="mt-1 text-sm text-gray-500">Evaluate a candidate&apos;s eligibility for extraordinary ability visas</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "new-evaluation" && (
          <div className="mx-auto max-w-3xl">
            <EvaluationForm onSuccess={handleSuccess} />
          </div>
        )}
        {activeTab === "history" && <EvaluationHistory refreshKey={refreshKey} />}
      </div>
    </div>
  );
}