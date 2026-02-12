"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PetitionCase {
  case_id: string;
  beneficiary_name: string;
  visa_type: string;
  status: string;
  progress_percentage: number;
  created_at: string;
  completed_at: string | null;
}

interface ApiResponse {
  data: PetitionCase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const VISA_TYPES = ["O-1A", "O-1B", "EB-1A", "EB-2 NIW"] as const;

const API_BASE = process.env.NEXT_PUBLIC_XOP_API_BASE || "https://www.xtraordinarypetitions.com";
const API_KEY = `Bearer ${process.env.NEXT_PUBLIC_XOP_KEY}`;

const API_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `${API_KEY}`,
};

// ─── Status helpers ──────────────────────────────────────────────────────────
function getStatusStyle(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "generating":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "initializing":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
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
    case "generating":
      return "⟳";
    case "initializing":
      return "◷";
    case "failed":
      return "✗";
    default:
      return "•";
  }
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ percentage, status }: { percentage: number; status: string }) {
  const barColor =
    status === "completed"
      ? "bg-green-500"
      : status === "failed"
        ? "bg-red-500"
        : status === "generating"
          ? "bg-blue-500"
          : "bg-yellow-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{percentage}%</span>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

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
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="relative mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Action Modal Hook ───────────────────────────────────────────────────────
function useActionModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);
  const [formCaseId, setFormCaseId] = useState<string | null>(null);

  const execute = useCallback(
    async (label: string, url: string, method: "GET" | "POST" = "GET") => {
      setTitle(label);
      setOpen(true);
      setLoading(true);
      setError(null);
      setData(null);
      setFormCaseId(null);

      try {
        const res = await fetch(url, { method, headers: API_HEADERS });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.message ?? body?.error ?? `Request failed (${res.status})`
          );
        }
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const [formPrefill, setFormPrefill] = useState<{ fullName: string; visaType: string } | null>(null);

  const openForm = useCallback((label: string, caseId: string, prefill?: { fullName: string; visaType: string }) => {
    setTitle(label);
    setFormCaseId(caseId);
    setFormPrefill(prefill ?? null);
    setOpen(true);
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setData(null);
    setError(null);
    setFormCaseId(null);
    setFormPrefill(null);
  }, []);

  return { open, title, loading, error, data, formCaseId, formPrefill, execute, openForm, close, setData, setError };
}

// ─── PDF Download Row ────────────────────────────────────────────────────────
function PdfDownloadRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="truncate text-xs text-gray-400">PDF Document</p>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </a>
    </div>
  );
}

// ─── Get Exhibit Display ─────────────────────────────────────────────────────
function ExhibitDisplay({ data }: { data: Record<string, unknown> }) {
  const exhibit = (data.data ?? data) as Record<string, unknown>;

  const caseId = exhibit.caseId as string | undefined;
  const status = exhibit.status as string | undefined;
  const progress = exhibit.progress as number | undefined;
  const totalExhibits = exhibit.totalExhibits as number | undefined;
  const petitionLetterUrl = exhibit.petitionLetterUrl as string | undefined;
  const exhibitPackageUrl = exhibit.exhibitPackageUrl as string | undefined;
  const tableOfContentsUrl = exhibit.tableOfContentsUrl as string | undefined;

  return (
    <div className="space-y-5">
      {/* Case info header */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
        {caseId && (
          <div className="text-sm">
            <span className="text-gray-500">Case ID: </span>
            <span className="font-mono font-medium text-gray-900">{caseId}</span>
          </div>
        )}
        {status && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}>
            {getStatusIcon(status)} {status}
          </span>
        )}
        {typeof progress === "number" && (
          <span className="text-xs text-gray-500">{progress}% complete</span>
        )}
        {typeof totalExhibits === "number" && (
          <span className="text-xs text-gray-500">{totalExhibits} exhibits</span>
        )}
      </div>

      {/* Download links */}
      <div className="space-y-3">
        {petitionLetterUrl ? (
          <PdfDownloadRow label="Petition Letter" url={petitionLetterUrl} />
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                <svg className="h-5 w-5 text-yellow-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Petition Letter</p>
                <p className="text-xs text-yellow-600 font-medium">In Process</p>
              </div>
            </div>
          </div>
        )}
        {exhibitPackageUrl ? (
          <PdfDownloadRow label="Exhibit Package" url={exhibitPackageUrl} />
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                <svg className="h-5 w-5 text-yellow-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Exhibit Package</p>
                <p className="text-xs text-yellow-600 font-medium">In Process</p>
              </div>
            </div>
          </div>
        )}
        {tableOfContentsUrl ? (
          <PdfDownloadRow label="Table of Contents" url={tableOfContentsUrl} />
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                <svg className="h-5 w-5 text-yellow-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Table of Contents</p>
                <p className="text-xs text-yellow-600 font-medium">In Process</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Progress Display ────────────────────────────────────────────────────────
function ProgressDisplay({ data }: { data: Record<string, unknown> }) {
  const root = (data.data ?? data) as Record<string, unknown>;
  const petition = root.petition as Record<string, unknown> | undefined;

  if (!petition) {
    return (
      <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 font-mono leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  const errorMessage = petition.errorMessage as string | null;

  // If there's an error, show it prominently
  if (errorMessage) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No error — show progress details
  const status = petition.status as string;
  const progress = petition.progress as number;
  const currentStage = petition.currentStage as string;
  const currentMessage = petition.currentMessage as string;
  const documentCount = petition.documentCount as number;

  const barColor =
    status === "completed"
      ? "bg-green-500"
      : status === "failed"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}>
            {getStatusIcon(status)} {status}
          </span>
          <span className="text-sm font-semibold text-gray-900">{progress}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Current Stage</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{currentStage}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Documents</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{documentCount}</p>
        </div>
      </div>

      {/* Current message */}
      {currentMessage && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">{currentMessage}</p>
        </div>
      )}
    </div>
  );
}

// ─── Generate Documents Form ─────────────────────────────────────────────────
function GenerateDocumentsForm({
  caseId,
  prefill,
  onSuccess,
  onError,
}: {
  caseId: string;
  prefill?: { fullName: string; visaType: string } | null;
  onSuccess: (data: unknown) => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    fullName: prefill?.fullName ?? "",
    visaType: prefill?.visaType ?? "",
    urls: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      onError("Full name is required.");
      return;
    }
    if (!form.visaType) {
      onError("Please select a visa type.");
      return;
    }

    setSubmitting(true);
    onError("");

    try {
      const urlList = form.urls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      const res = await fetch(`${API_BASE}/api/v1/cases/${caseId}/generate`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({
          beneficiaryInfo: {
            fullName: form.fullName.trim(),
            visaType: form.visaType,
          },
          urls: urlList,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? body?.error ?? `Request failed (${res.status})`);
      }

      const json = await res.json();
      onSuccess(json);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to generate documents");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="genFullName" className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="genFullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
          placeholder="Beneficiary's full name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Visa Type */}
      <div>
        <label htmlFor="genVisaType" className="block text-sm font-medium text-gray-700">
          Visa Type <span className="text-red-500">*</span>
        </label>
        <select
          id="genVisaType"
          name="visaType"
          value={form.visaType}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select visa type…</option>
          {VISA_TYPES.map((vt) => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </div>

      {/* URLs */}
      <div>
        <label htmlFor="genUrls" className="block text-sm font-medium text-gray-700">
          URLs
        </label>
        <textarea
          id="genUrls"
          name="urls"
          value={form.urls}
          onChange={handleChange}
          rows={4}
          placeholder="Enter URLs separated by commas&#10;e.g. https://example.com/article1, https://example.com/article2"
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">Comma-separated list of supporting URLs</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating…
          </>
        ) : (
          "Generate Documents"
        )}
      </button>
    </form>
  );
}

// ─── Generate Exhibit Display ────────────────────────────────────────────────
function GenerateExhibitDisplay({ data }: { data: Record<string, unknown> }) {
  const inner = (data.data ?? data) as Record<string, unknown>;
  const caseId = inner.caseId as string | undefined;
  const status = inner.status as string | undefined;
  const message = inner.message as string | undefined;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            {message && <p className="text-sm font-medium text-blue-900">{message}</p>}
            {status && (
              <span className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}>
                {getStatusIcon(status)} {status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Case ID */}
      {caseId && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Case ID</span>
          <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">{caseId}</p>
        </div>
      )}
    </div>
  );
}

// ─── Authenticated Download Button ───────────────────────────────────────────
function AuthDownloadButton({ url, filename }: { url: string; filename: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: API_HEADERS,
      });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="ml-4 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {downloading ? "Downloading…" : "Download"}
    </button>
  );
}

// ─── Get Documents Display ───────────────────────────────────────────────────
function DocumentsDisplay({ data }: { data: Record<string, unknown> }) {
  const docs = (Array.isArray(data.data) ? data.data : []) as Array<Record<string, unknown>>;
  if (docs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">No Documents Yet</h3>
        <p className="mt-1 text-sm text-gray-500">Documents haven&apos;t been generated for this case yet. Use &quot;Generate Documents&quot; to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {docs.map((doc, idx) => {
        const name = (doc.documentName as string) ?? `Document ${idx + 1}`;
        const type = (doc.documentType as string) ?? "";
        const wordCount = doc.wordCount as number | undefined;
        const generatedAt = doc.generatedAt as string | undefined;
        const downloadUrl = doc.downloadUrl as string | undefined;
        const fullUrl = downloadUrl ? `${API_BASE}${downloadUrl}?format=text` : null;

        return (
          <div
            key={(doc.documentNumber as number) ?? idx}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  {type && (
                    <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 capitalize">
                      {type}
                    </span>
                  )}
                  {typeof wordCount === "number" && (
                    <span>{wordCount.toLocaleString()} words</span>
                  )}
                  {generatedAt && (
                    <span>
                      {new Date(generatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {fullUrl && (
              <AuthDownloadButton url={fullUrl} filename={`${name}.txt`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Generate Documents Display ──────────────────────────────────────────────
function GenerateDocumentsDisplay({ data }: { data: Record<string, unknown> }) {
  const inner = (data.data ?? data) as Record<string, unknown>;
  const caseId = inner.caseId as string | undefined;
  const status = inner.status as string | undefined;
  const message = inner.message as string | undefined;
  const totalBatches = inner.totalBatches as number | undefined;
  const nextBatch = inner.nextBatch as number | undefined;

  return (
    <div className="space-y-4">
      {/* Message banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            {message && <p className="text-sm font-medium text-blue-900">{message}</p>}
            {status && (
              <span className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}>
                {getStatusIcon(status)} {status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {caseId && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Case ID</p>
            <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{caseId}</p>
          </div>
        )}
        {typeof totalBatches === "number" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Batches</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{totalBatches}</p>
          </div>
        )}
      </div>

      {/* Batch progress */}
      {typeof nextBatch === "number" && typeof totalBatches === "number" && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Batch Progress</span>
            <span className="text-sm font-semibold text-gray-900">{nextBatch - 1} / {totalBatches}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${((nextBatch - 1) / totalBatches) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Next batch: {nextBatch} of {totalBatches}</p>
        </div>
      )}
    </div>
  );
}

// ─── Response Display (router) ───────────────────────────────────────────────
function ResponseDisplay({ data, modalTitle }: { data: unknown; modalTitle: string }) {
  if (data === null || data === undefined) return null;

  const obj = data as Record<string, unknown>;
  const inner = (obj.data ?? obj) as Record<string, unknown>;

  // Get Exhibit response
  if (
    modalTitle === "Get Exhibit" &&
    typeof obj === "object" &&
    (inner.caseId !== undefined)
  ) {
    return <ExhibitDisplay data={obj} />;
  }

  // Progress response
  if (modalTitle === "Progress" && typeof obj === "object" && inner.petition) {
    return <ProgressDisplay data={obj} />;
  }

  // Generate Exhibit response
  if (modalTitle === "Generate Exhibit" && typeof obj === "object" && inner.message) {
    return <GenerateExhibitDisplay data={obj} />;
  }

  // Generate Documents response
  if (modalTitle === "Generate Documents" && typeof obj === "object" && inner.message) {
    return <GenerateDocumentsDisplay data={obj} />;
  }

  // Get Documents response
  if (modalTitle === "Get Documents") {
    return <DocumentsDisplay data={obj} />;
  }

  // Fallback: formatted JSON
  return (
    <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 font-mono leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ─── Action Button ───────────────────────────────────────────────────────────
function ActionButton({
  label,
  icon,
  variant,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  variant: "blue" | "green" | "purple";
  onClick: () => void;
}) {
  const styles = {
    blue: "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200",
    green: "text-green-700 bg-green-50 hover:bg-green-100 border-green-200",
    purple: "text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${styles[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── My Cases Tab ────────────────────────────────────────────────────────────
function MyCasesTab() {
  const [cases, setCases] = useState<PetitionCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modal = useActionModal();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/cases`, {
        method: "GET",
        headers: API_HEADERS,
      });
      if (!res.ok) throw new Error(`Failed to fetch cases (${res.status})`);
      const json: ApiResponse = await res.json();
      setCases(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleProgress = (caseId: string) => {
    modal.execute("Progress", `${API_BASE}/api/v1/cases/${caseId}/progress`, "GET");
  };

  const handleGenerateExhibit = (caseId: string) => {
    modal.execute("Generate Exhibit", `${API_BASE}/api/v1/cases/${caseId}/exhibits`, "POST");
  };

  const handleGetExhibit = (caseId: string) => {
    modal.execute("Get Exhibit", `${API_BASE}/api/v1/cases/${caseId}/exhibits`, "GET");
  };

  const handleGenerateDocuments = (c: PetitionCase) => {
    modal.openForm("Generate Documents", c.case_id, {
      fullName: c.beneficiary_name,
      visaType: c.visa_type,
    });
  };

  const handleGetDocuments = (caseId: string) => {
    modal.execute("Get Documents", `${API_BASE}/api/v1/cases/${caseId}/documents`, "GET");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-gray-500">Loading cases…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchCases}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No cases yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first petition case using the &quot;New Case&quot; tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Case ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Beneficiary
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Visa Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {cases.map((c) => (
              <tr key={c.case_id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-600">
                  {c.case_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                  {c.beneficiary_name.toLowerCase()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {c.visa_type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(c.status)}`}
                  >
                    <span>{getStatusIcon(c.status)}</span>
                    {c.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <ProgressBar percentage={c.progress_percentage} status={c.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ActionButton
                      label="Progress"
                      variant="blue"
                      onClick={() => handleProgress(c.case_id)}
                      icon={
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Generate Exhibit"
                      variant="purple"
                      onClick={() => handleGenerateExhibit(c.case_id)}
                      icon={
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Get Exhibit"
                      variant="green"
                      onClick={() => handleGetExhibit(c.case_id)}
                      icon={
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Generate Documents"
                      variant="purple"
                      onClick={() => handleGenerateDocuments(c)}
                      icon={
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Get Documents"
                      variant="green"
                      onClick={() => handleGetDocuments(c.case_id)}
                      icon={
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shared Modal */}
      <Modal open={modal.open} title={modal.title} onClose={modal.close}>
        {modal.formCaseId && !modal.data ? (
          <>
            {modal.error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{modal.error}</p>
              </div>
            )}
            <GenerateDocumentsForm
              caseId={modal.formCaseId}
              prefill={modal.formPrefill}
              onSuccess={(data) => modal.setData(data)}
              onError={(msg) => modal.setError(msg || null)}
            />
          </>
        ) : modal.loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3 text-gray-500">Loading…</span>
          </div>
        ) : modal.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{modal.error}</p>
          </div>
        ) : modal.data ? (
          <ResponseDisplay data={modal.data} modalTitle={modal.title} />
        ) : null}
      </Modal>
    </>
  );
}

// ─── New Case Tab ────────────────────────────────────────────────────────────
function NewCaseTab({ onCaseCreated }: { onCaseCreated: () => void }) {
  const [form, setForm] = useState({
    beneficiaryName: "",
    visaType: "",
    fieldOfWork: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.beneficiaryName.trim()) {
      setError("Beneficiary name is required.");
      return;
    }
    if (!form.visaType) {
      setError("Please select a visa type.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/cases`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({
          beneficiaryName: form.beneficiaryName.trim(),
          visaType: form.visaType,
          fieldOfWork: form.fieldOfWork.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? body?.error ?? `Request failed (${res.status})`);
      }

      setSuccess(true);
      setForm({ beneficiaryName: "", visaType: "", fieldOfWork: "" });
      onCaseCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create case");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Case created successfully!
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="beneficiaryName" className="block text-sm font-medium text-gray-700">
          Beneficiary Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="beneficiaryName"
          name="beneficiaryName"
          value={form.beneficiaryName}
          onChange={handleChange}
          required
          placeholder="Full name of the beneficiary"
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

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
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fieldOfWork" className="block text-sm font-medium text-gray-700">
          Field of Work
        </label>
        <input
          type="text"
          id="fieldOfWork"
          name="fieldOfWork"
          value={form.fieldOfWork}
          onChange={handleChange}
          placeholder="e.g. Artificial Intelligence, Biotechnology…"
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">Field of work or specialization (optional)</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creating…
          </>
        ) : (
          "Create Case"
        )}
      </button>
    </form>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type TabKey = "my-cases" | "new-case";

const TABS: { key: TabKey; label: string }[] = [
  { key: "my-cases", label: "My Cases" },
  { key: "new-case", label: "New Case" },
];

export default function XtraordinaryPetitionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("my-cases");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCaseCreated = () => {
    setRefreshKey((k) => k + 1);
    setActiveTab("my-cases");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Xtraordinary Petitions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your immigration petition cases
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
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
        {activeTab === "my-cases" && <MyCasesTab key={refreshKey} />}
        {activeTab === "new-case" && <NewCaseTab onCaseCreated={handleCaseCreated} />}
      </div>
    </div>
  );
}