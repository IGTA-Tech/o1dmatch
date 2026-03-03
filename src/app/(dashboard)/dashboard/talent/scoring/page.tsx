/* /src/app/(dashboard)/dashboard/employer/scoring/page.tsx */
"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, /* ...existing imports */ } from "lucide-react";
import {
  Star,
  FileUp,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
  AlertCircle,
  BarChart3,
  FileText,
  ChevronRight,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Award,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CriteriaScore {
  score?: number;
  criterionNumber?: number;
  criterionName?: string;
  rating?: string;
  strengths?: string[];
  officerConcerns?: string[];
  [key: string]: unknown;
}

interface RfePrediction {
  topic?: string;
  probability?: number;
  suggestedEvidence?: string[];
  [key: string]: unknown;
}

interface Recommendations {
  critical?: string[];
  high?: string[];
  recommended?: string[];
  [key: string]: unknown;
}

interface ScoringResult {
  success?: boolean;
  status?: string;
  sessionId?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ScoringSession {
  id: string;
  session_id: string;
  status: string;
  progress: number;
  visa_type: string;
  document_type: string;
  beneficiary_name: string | null;
  overall_score: number | null;
  overall_rating: string | null;
  approval_probability: number | null;
  rfe_probability: number | null;
  denial_risk: number | null;
  criteria_scores: CriteriaScore[];
  rfe_predictions: RfePrediction[];
  weaknesses: string[];
  strengths: string[];
  recommendations: Recommendations;
  full_report: string | null;
  api_response: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface CreditInfo {
  remaining: number;
  used: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
}

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */
const Spinner = ({ text = "Processing..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    <p className="text-gray-600 text-sm font-medium">{text}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */
const ScoreRing = ({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) => {
  const getColor = (s: number) => {
    if (s >= 80) return { text: "text-green-600", ring: "#16a34a" };
    if (s >= 60) return { text: "text-yellow-600", ring: "#ca8a04" };
    if (s >= 40) return { text: "text-orange-500", ring: "#f97316" };
    return { text: "text-red-600", ring: "#dc2626" };
  };
  const colors = getColor(score);
  const isSmall = size === "sm";
  const dim = isSmall ? 64 : 160;
  const r = isSmall ? 26 : 70;
  const sw = isSmall ? 6 : 12;
  const circ = 2 * Math.PI * r;

  return (
    <div className={`relative ${isSmall ? "w-16 h-16" : "w-40 h-40"}`}>
      <svg className={`${isSmall ? "w-16 h-16" : "w-40 h-40"} -rotate-90`} viewBox={`0 0 ${dim} ${dim}`}>
        <circle cx={dim / 2} cy={dim / 2} r={r} stroke="#e5e7eb" strokeWidth={sw} fill="none" />
        <circle cx={dim / 2} cy={dim / 2} r={r} stroke={colors.ring} strokeWidth={sw} fill="none"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${isSmall ? "text-sm" : "text-4xl"} font-bold ${colors.text}`}>{score}%</span>
        {!isSmall && <span className="text-xs text-gray-500 mt-1">Score</span>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Probability Bar                                                    */
/* ------------------------------------------------------------------ */
const ProbBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="font-semibold" style={{ color }}>{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Criteria Card                                                      */
/* ------------------------------------------------------------------ */
const CriteriaCard = ({ c }: { c: CriteriaScore }) => {
  const [open, setOpen] = useState(false);
  const ratingColor = (r: string) => {
    const rl = r?.toLowerCase();
    if (rl === "strong") return "bg-green-100 text-green-800";
    if (rl === "moderate" || rl === "medium") return "bg-yellow-100 text-yellow-800";
    if (rl === "weak") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">{c.score ?? "—"}</div>
          <p className="text-sm font-medium text-gray-900 text-left">{c.criterionNumber ? `#${c.criterionNumber} ` : ""}{c.criterionName || "Criterion"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ratingColor(c.rating ?? "")}`}>{c.rating}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
          {(c.strengths?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Strengths</p>
              <ul className="space-y-1">{c.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-xs text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-green-400">{s}</li>
              ))}</ul>
            </div>
          )}
          {(c.officerConcerns?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Officer Concerns</p>
              <ul className="space-y-1">{c.officerConcerns?.map((s: string, i: number) => (
                <li key={i} className="text-xs text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-orange-400">{s}</li>
              ))}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Score Display                                                      */
/* ------------------------------------------------------------------ */
const ScoreDisplay = ({ result, fromDB }: { result: ScoringResult | ScoringSession; fromDB?: boolean }) => {
  const dbResult = fromDB ? (result as ScoringSession) : null;
  const apiResult = fromDB ? null : (result as ScoringResult);
  const r = apiResult ? ((apiResult.data as Record<string, unknown>)?.results as Record<string, unknown> || null) : null;

  const overallScore = dbResult ? dbResult.overall_score : ((r?.overallScore as number) ?? null);
  const overallRating = dbResult ? dbResult.overall_rating : ((r?.overallRating as string) ?? null);
  const approvalProb = dbResult ? dbResult.approval_probability : ((r?.approvalProbability as number) ?? null);
  const rfeProb = dbResult ? dbResult.rfe_probability : ((r?.rfeProbability as number) ?? null);
  const denialRisk = dbResult ? dbResult.denial_risk : ((r?.denialRisk as number) ?? null);
  const criteriaScores = dbResult ? (dbResult.criteria_scores || []) : ((r?.criteriaScores as CriteriaScore[]) || []);
  const rfePredictions = dbResult ? (dbResult.rfe_predictions || []) : ((r?.rfePredictions as RfePrediction[]) || []);
  const weaknesses = dbResult ? (dbResult.weaknesses || []) : ((r?.weaknesses as string[]) || []);
  const strengths = dbResult ? (dbResult.strengths || []) : ((r?.strengths as string[]) || []);
  const recommendations: Recommendations = dbResult ? (dbResult.recommendations || {}) : ((r?.recommendations as Recommendations) || {});
  const fullReport = dbResult ? dbResult.full_report : ((r?.fullReport as string) || null);
  const status = dbResult ? dbResult.status : ((apiResult?.data as Record<string, unknown>)?.status as string || apiResult?.status || "unknown");
  const progress = dbResult ? dbResult.progress : ((apiResult?.data as Record<string, unknown>)?.progress as number ?? null);

  const scorePercent = overallScore != null ? Math.round(Number(overallScore)) : null;
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-6">
      {scorePercent != null && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={scorePercent} size="lg" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              {overallRating && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  {overallRating.toLowerCase() === "approve" ? <ShieldCheck className="w-5 h-5 text-green-600" /> : <ShieldAlert className="w-5 h-5 text-orange-500" />}
                  <span className="text-lg font-bold text-gray-900">{overallRating}</span>
                </div>
              )}
              <div className="space-y-2">
                {approvalProb != null && <ProbBar label="Approval Probability" value={approvalProb} color="#16a34a" />}
                {rfeProb != null && <ProbBar label="RFE Probability" value={rfeProb} color="#ca8a04" />}
                {denialRisk != null && <ProbBar label="Denial Risk" value={denialRisk} color="#dc2626" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {scorePercent == null && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "completed" ? "bg-green-100 text-green-800"
                : status === "scoring" || status === "processing" ? "bg-blue-100 text-blue-800"
                  : status === "failed" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
              }`}>
              {status === "completed" && <CheckCircle className="w-3 h-3" />}
              {(status === "scoring" || status === "processing") && <Loader2 className="w-3 h-3 animate-spin" />}
              {status}
            </span>
          </div>
          {progress != null && progress > 0 && progress < 100 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="text-blue-600 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {criteriaScores.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-blue-500" /> Criteria Scores</h4>
          <div className="space-y-2">{criteriaScores.map((c: CriteriaScore, i: number) => <CriteriaCard key={i} c={c} />)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Strengths</h4>
            <ul className="space-y-1.5">{strengths.map((s: string, i: number) => (
              <li key={i} className="text-xs text-green-900 flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{s}</li>
            ))}</ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Weaknesses</h4>
            <ul className="space-y-1.5">{weaknesses.map((s: string, i: number) => (
              <li key={i} className="text-xs text-red-900 flex items-start gap-2"><XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />{s}</li>
            ))}</ul>
          </div>
        )}
      </div>

      {rfePredictions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> RFE Predictions</h4>
          <div className="space-y-3">{rfePredictions.map((rfe: RfePrediction, i: number) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-yellow-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">{rfe.topic}</span>
                <span className="text-xs font-bold text-yellow-700">{rfe.probability}% likely</span>
              </div>
              {(rfe.suggestedEvidence?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1">{rfe.suggestedEvidence?.map((e: string, j: number) => (
                  <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />{e}</li>
                ))}</ul>
              )}
            </div>
          ))}</div>
        </div>
      )}

      {recommendations && ((recommendations.critical?.length ?? 0) > 0 || (recommendations.high?.length ?? 0) > 0 || (recommendations.recommended?.length ?? 0) > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-1"><Star className="w-4 h-4" /> Recommendations</h4>
          <div className="space-y-3">
            {[
              { key: "critical", label: "Critical", color: "text-red-600", dot: "bg-red-500" },
              { key: "high", label: "High Priority", color: "text-orange-600", dot: "bg-orange-500" },
              { key: "recommended", label: "Recommended", color: "text-blue-600", dot: "bg-blue-500" },
            ].map(({ key, label, color, dot }) =>
              ((recommendations[key as keyof Recommendations] as string[] | undefined)?.length ?? 0) > 0 ? (
                <div key={key}>
                  <span className={`text-xs font-bold ${color} uppercase`}>{label}</span>
                  <ul className="mt-1 space-y-1">{(recommendations[key as keyof Recommendations] as string[])?.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-gray-800 flex items-start gap-2"><span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 flex-shrink-0`} />{rec}</li>
                  ))}</ul>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {fullReport && (
        <div>
          <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
            <FileText className="w-4 h-4" /> {showReport ? "Hide" : "Show"} Full Report
            {showReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showReport && (
            <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap text-xs leading-relaxed">{fullReport}</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function ScoringPage() {
  const [activeTab, setActiveTab] = useState<"score" | "new">("score");

  /* --- Current Score tab --- */
  const [sessions, setSessions] = useState<ScoringSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ScoringSession | null>(null);
  const [rescoringId, setRescoringId] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  /* --- New Scoring tab --- */
  const [step, setStep] = useState<"form" | "upload" | "scoring" | "processing" | "result">("form");
  const [visaType, setVisaType] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [resultFromDB, setResultFromDB] = useState<ScoringSession | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === "score") {
      loadHistory();
      loadCredits();
    }
  }, [activeTab]);

  const loadCredits = async () => {
    setCreditsLoading(true);
    try {
      const res = await fetch("/api/scoring-credits");
      const json = await res.json();
      if (json.success) setCredits(json.credits);
    } catch (err) {
      console.error("Failed to load credits:", err);
    } finally {
      setCreditsLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/scoring?action=history");
      const json = await res.json();
      if (json.success) setSessions(json.sessions || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this scoring session?")) return;
    try {
      const res = await fetch(`/api/scoring?sessionId=${encodeURIComponent(sessionId)}&action=delete`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        if (selectedSession?.session_id === sessionId) setSelectedSession(null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  /* --- Re-score: check credits, deduct, trigger scoring API, poll for updated results --- */
  const handleRescore = async (session: ScoringSession) => {
    // Check credits first
    if (credits && credits.remaining <= 0) {
      setError("No re-score credits remaining. Credits reset at the end of the month.");
      return;
    }

    const creditsLeft = credits?.remaining ?? 0;
    if (!confirm(`Re-score "${session.beneficiary_name || session.visa_type}"?\nThis will use 1 credit (${creditsLeft - 1} remaining after this).`)) return;

    const sid = session.session_id;
    setRescoringId(sid);
    setError("");

    try {
      // 1. Deduct 1 credit first
      const creditRes = await fetch("/api/scoring-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct" }),
      });
      const creditJson = await creditRes.json();

      if (!creditJson.success) {
        throw new Error(creditJson.error || "No credits remaining. Credits reset at the end of the month.");
      }

      // Update local credit state immediately
      setCredits(creditJson.credits);

      // 2. Trigger re-scoring via the existing score action
      const res = await fetch("/api/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "score", sessionId: sid }),
      });
      const json = await res.json();

      if (!res.ok && res.status !== 202 && !json.success) {
        throw new Error(json.error?.message || json.error || "Failed to trigger re-scoring");
      }

      // 3. Update local state to show "scoring" status
      setSessions((prev) =>
        prev.map((s) => (s.session_id === sid ? { ...s, status: "scoring" } : s))
      );

      // 4. Poll for completed results
      let attempts = 0;
      const maxAttempts = 120;

      const poll = async (): Promise<void> => {
        attempts++;
        try {
          const dbRes = await fetch(`/api/scoring?action=check&sessionId=${encodeURIComponent(sid)}`);
          const dbJson = await dbRes.json();

          if (dbJson.found && dbJson.session?.status === "completed" && dbJson.session?.overall_score != null) {
            setSessions((prev) =>
              prev.map((s) => (s.session_id === sid ? { ...s, ...dbJson.session } : s))
            );
            if (selectedSession?.session_id === sid) setSelectedSession(dbJson.session);
            setRescoringId(null);
            return;
          }

          if (dbJson.found && dbJson.session?.status === "failed") {
            throw new Error("Re-scoring failed. Please try again.");
          }

          const pollRes = await fetch(`/api/scoring?sessionId=${encodeURIComponent(sid)}`);
          const pollJson = await pollRes.json();
          const status = pollJson?.data?.status || pollJson?.status;

          if (status === "completed") {
            await loadHistory();
            setRescoringId(null);
            return;
          }

          if (status === "failed" || status === "error") {
            throw new Error("Re-scoring failed.");
          }

          if (attempts >= maxAttempts) {
            throw new Error("Re-scoring is taking too long. Check back later.");
          }

          await new Promise((r) => setTimeout(r, 5000));
          return poll();
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Re-scoring failed");
          setRescoringId(null);
          await loadHistory();
        }
      };

      await poll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to trigger re-scoring");
      setRescoringId(null);
      // Refresh credits in case deduction failed
      await loadCredits();
    }
  };

  /* --- Step 1: Create session --- */
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: Record<string, string> = { visaType, documentType };
      if (beneficiaryName.trim()) body.beneficiaryName = beneficiaryName.trim();

      const res = await fetch("/api/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success && json.sessionId) {
        setSessionId(json.sessionId);
        setStep("upload");
      } else {
        throw new Error(json.error?.message || json.error || json.message || "Failed to create session");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create scoring session");
    } finally {
      setLoading(false);
    }
  };

  /* --- File handling --- */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset after a tick so the onChange fires again for same file
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 100);
  };
  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* --- Step 2: Upload documents --- */
  const handleUploadDocuments = async () => {
    if (files.length === 0) { setError("Please select at least one document"); return; }
    setLoading(true);
    setError("");
    setUploadProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length });
        const formData = new FormData();
        formData.append("document", files[i]);
        const res = await fetch(`/api/scoring?sessionId=${encodeURIComponent(sessionId)}`, { method: "POST", body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || json.error || `Failed to upload: ${files[i].name}`);
      }
      setUploadProgress(null);
      setStep("scoring");
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload documents");
      setUploadProgress(null);
      setLoading(false);
    }
  };

  /* --- Step 3: Trigger scoring --- */
  const handleTriggerScoring = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "score", sessionId }),
      });
      const json = await res.json();
      if (res.status === 202 || json.success) {
        setStep("processing");
        pollForResults(sessionId);
      } else {
        throw new Error(json.error?.message || json.error || "Failed to trigger scoring");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to trigger scoring");
      setLoading(false);
    }
  };

  /* --- Step 4: Poll for results (DB-first, then external API) --- */
  const pollForResults = async (sid?: string) => {
    const target = sid || sessionId;
    setLoading(true);
    setError("");
    setResultFromDB(null);
    let attempts = 0;
    const maxAttempts = 120;

    const poll = async (): Promise<void> => {
      attempts++;
      try {
        // 1. Check DB first — webhook may have already updated it
        const dbRes = await fetch(`/api/scoring?action=check&sessionId=${encodeURIComponent(target)}`);
        const dbJson = await dbRes.json();

        if (dbJson.found && dbJson.session?.status === "completed" && dbJson.session?.overall_score != null) {
          console.log(`[Scoring] Found completed results in DB (webhook) at attempt ${attempts}`);
          setResultFromDB(dbJson.session);
          setStep("result");
          setLoading(false);
          return;
        }

        if (dbJson.found && dbJson.session?.status === "failed") {
          throw new Error("Scoring failed. Please try again or contact support.");
        }

        // 2. Fall back to external API poll
        const res = await fetch(`/api/scoring?sessionId=${encodeURIComponent(target)}`);
        const json = await res.json();
        console.log(`[Scoring] Poll attempt ${attempts}:`, json?.data?.status, json?.data?.progress);

        const status = json?.data?.status || json?.status;

        if (status === "completed") {
          setResult(json);
          setStep("result");
          setLoading(false);
          return;
        }

        if (status === "failed" || status === "error") {
          throw new Error(json.error?.message || json.error || "Scoring failed");
        }

        if (attempts >= maxAttempts) {
          throw new Error("Scoring is taking longer than expected. Check back using Session ID: " + target);
        }

        await new Promise((r) => setTimeout(r, 5000));
        return poll();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch results");
        setLoading(false);
      }
    };

    await poll();
  };

  const resetForm = () => {
    setStep("form");
    setVisaType("");
    setDocumentType("");
    setBeneficiaryName("");
    setSessionId("");
    setFiles([]);
    setError("");
    setResult(null);
    setResultFromDB(null);
    setUploadProgress(null);
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  const statusBadge = (s: string) => {
    if (s === "completed") return "bg-green-100 text-green-800";
    if (s === "scoring" || s === "processing" || s === "pending") return "bg-blue-100 text-blue-800";
    if (s === "failed") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const allSteps = ["form", "upload", "scoring", "processing", "result"];

  /* ================================================================ */
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-blue-600" /> USCIS Petition Scoring
          </h1>
          <p className="text-gray-500 mt-1">Score your visa petition documents with AI-powered analysis</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab("score")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "score" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Current Score</span>
          </button>
          <button onClick={() => setActiveTab("new")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "new" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <span className="flex items-center gap-2"><FileUp className="w-4 h-4" /> New Scoring</span>
          </button>
        </div>

        {/* ============ TAB 1: Current Score ============ */}
        {activeTab === "score" && (
          <div className="space-y-6">
            {selectedSession ? (
              <div className="space-y-4">
                {/* Back button */}
                <button
                  onClick={() => setSelectedSession(null)}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Scoring History
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedSession.beneficiary_name || selectedSession.visa_type} — {selectedSession.document_type?.replace(/_/g, " ")}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Session: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{selectedSession.session_id}</code> · {fmtDate(selectedSession.created_at)}</p>
                    </div>
                    <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                  </div>
                  <ScoreDisplay result={selectedSession} fromDB />
                </div>
              </div>
            ) : (
              <>
                {/* Credit Balance Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${credits && credits.remaining > 0 ? "bg-green-50" : "bg-red-50"
                        }`}>
                        <Star className={`w-5 h-5 ${credits && credits.remaining > 0 ? "text-green-600" : "text-red-500"}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Re-score Credits</h3>
                        <p className="text-xs text-gray-500">
                          {credits
                            ? `Resets ${new Date(credits.periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                            : "Loading..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {creditsLoading ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : credits ? (
                        <>
                          <div className="text-right">
                            <div className="flex items-baseline gap-1">
                              <span className={`text-2xl font-bold ${credits.remaining > 0 ? "text-green-600" : "text-red-500"}`}>
                                {credits.remaining}
                              </span>
                              <span className="text-sm text-gray-400">/ {credits.limit}</span>
                            </div>
                            <p className="text-xs text-gray-400">{credits.used} used this month</p>
                          </div>
                          <div className="w-20 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${credits.remaining > 3 ? "bg-green-500" : credits.remaining > 0 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${(credits.remaining / credits.limit) * 100}%` }}
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {credits && credits.remaining === 0 && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      All re-score credits have been used this month. Credits will reset on {new Date(credits.periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4" /> Scoring History</h3>
                    <button onClick={loadHistory} disabled={historyLoading} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} /> Refresh
                    </button>
                  </div>
                  {historyLoading && sessions.length === 0 && <Spinner text="Loading history..." />}
                  {!historyLoading && sessions.length === 0 && (
                    <div className="text-center py-10">
                      <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No scoring sessions yet</p>
                      <button onClick={() => setActiveTab("new")} className="mt-3 text-sm text-blue-600 hover:underline">Start a new scoring →</button>
                    </div>
                  )}
                  {sessions.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left">Beneficiary</th>
                            <th className="px-4 py-3 text-left">Visa</th>
                            <th className="px-4 py-3 text-left">Doc Type</th>
                            <th className="px-4 py-3 text-center">Score</th>
                            <th className="px-4 py-3 text-center">Rating</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sessions.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900">{s.beneficiary_name || "—"}</td>
                              <td className="px-4 py-3 text-gray-600">{s.visa_type}</td>
                              <td className="px-4 py-3 text-gray-600 capitalize">{s.document_type?.replace(/_/g, " ")}</td>
                              <td className="px-4 py-3 text-center">{s.overall_score != null ? <span className="font-bold text-blue-600">{s.overall_score}%</span> : <span className="text-gray-400">—</span>}</td>
                              <td className="px-4 py-3 text-center">{s.overall_rating ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.overall_rating.toLowerCase() === "approve" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>{s.overall_rating}</span> : <span className="text-gray-400">—</span>}</td>
                              <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(s.status)}`}>{s.status}</span></td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(s.created_at)}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => { setSelectedSession(s); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline">View</button>
                                  {rescoringId === s.session_id ? (
                                    <span className="text-orange-500 text-xs font-medium flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" /> Scoring...
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleRescore(s)}
                                      disabled={rescoringId !== null || (credits !== null && credits.remaining <= 0)}
                                      title={credits && credits.remaining <= 0 ? "No credits remaining — resets at month end" : `${credits?.remaining ?? "..."} credits remaining`}
                                      className="text-orange-600 hover:text-orange-800 text-xs font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                                    >
                                      Re-score
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteSession(s.session_id)} className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                </>
              )} 
            </div>  
        )}

            {/* ============ TAB 2: New Scoring ============ */}
            {activeTab === "new" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[
                    { key: "form", label: "Details", num: 1 },
                    { key: "upload", label: "Upload", num: 2 },
                    { key: "scoring", label: "Score", num: 3 },
                    { key: "processing", label: "Processing", num: 4 },
                    { key: "result", label: "Results", num: 5 },
                  ].map((s, i, arr) => {
                    const currentIdx = allSteps.indexOf(step);
                    const stepIdx = allSteps.indexOf(s.key);
                    return (
                      <div key={s.key} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s.key ? "bg-blue-600 text-white" : currentIdx > stepIdx ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                          }`}>{currentIdx > stepIdx ? <CheckCircle className="w-4 h-4" /> : s.num}</div>
                        <span className={`text-xs font-medium hidden sm:inline ${step === s.key ? "text-blue-600" : "text-gray-400"}`}>{s.label}</span>
                        {i < arr.length - 1 && <div className="w-6 h-px bg-gray-200 mx-0.5" />}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <XCircle className="w-4 h-4 flex-shrink-0" /><div className="flex-1">{error}</div>
                    <button onClick={() => setError("")} className="text-red-400 hover:text-red-600"><XCircle className="w-4 h-4" /></button>
                  </div>
                )}

                {/* Step 1: Form */}
                {step === "form" && (
                  <form onSubmit={handleCreateSession} className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900">Petition Details</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type <span className="text-red-500">*</span></label>
                      <select value={visaType} onChange={(e) => setVisaType(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                        <option value="">Select visa type...</option>
                        <option value="O-1A">O-1A — Extraordinary Ability</option>
                        <option value="O-1B">O-1B — Extraordinary Achievement (Arts)</option>
                        <option value="P-1A">P-1A — Internationally Recognized Athlete</option>
                        <option value="EB-1A">EB-1A — Employment-Based First Preference</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Type <span className="text-red-500">*</span></label>
                      <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                        <option value="">Select document type...</option>
                        <option value="full_petition">Full Petition</option>
                        <option value="rfe_response">RFE Response</option>
                        <option value="exhibit_packet">Exhibit Packet</option>
                        <option value="contract_deal_memo">Contract / Deal Memo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name <span className="text-gray-400 text-xs">(optional)</span></label>
                      <input type="text" value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} placeholder="Enter beneficiary name..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                    </div>
                    <button type="submit" disabled={loading || !visaType || !documentType} className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Session...</> : <>Create Scoring Session <ChevronRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                )}

                {/* Step 2: Upload */}
                {step === "upload" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Upload Documents</h2>
                      <p className="text-sm text-gray-500 mt-1">Session ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{sessionId}</code></p>
                    </div>
                    <input id="scoring-file-input" ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.txt,.doc,.docx" onChange={handleFileSelect} style={{ display: "none" }} />
                    <label htmlFor="scoring-file-input" className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">Click to select files</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, images, text, or Word documents — Max 150MB per file</p>
                    </label>
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
                        {files.map((file, i) => (
                          <div key={`${file.name}-${i}`} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0"><p className="text-sm text-gray-800 truncate">{file.name}</p><p className="text-xs text-gray-400">{formatFileSize(file.size)}</p></div>
                            <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadProgress && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2"><Loader2 className="w-4 h-4 text-blue-600 animate-spin" /><span className="text-sm font-medium text-blue-700">Uploading file {uploadProgress.current} of {uploadProgress.total}...</span></div>
                        <div className="w-full bg-blue-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} /></div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => { setStep("form"); setFiles([]); setError(""); }} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
                      <button onClick={handleUploadDocuments} disabled={loading || files.length === 0} className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Documents</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Trigger Scoring */}
                {step === "scoring" && (
                  <div className="space-y-5">
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Documents Uploaded Successfully</h2>
                      <p className="text-sm text-gray-500 mt-1">{files.length} document{files.length !== 1 ? "s" : ""} uploaded to session <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{sessionId}</code></p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Ready to Score</h4>
                      <p className="text-xs text-gray-600">Click the button below to start the AI scoring analysis. This will evaluate your petition documents against USCIS officer criteria and generate a detailed score report.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setStep("upload"); setError(""); }} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
                      <button onClick={handleTriggerScoring} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting Scoring...</> : <><Star className="w-4 h-4" /> Start Scoring Analysis</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Processing */}
                {step === "processing" && (
                  <div className="text-center py-8">
                    <Spinner text="AI is scoring your petition... This may take a few minutes." />
                    <p className="text-xs text-gray-400 mt-4">Session ID: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{sessionId}</code></p>
                    <p className="text-xs text-gray-400 mt-1">You can check the score later in the &quot;Current Score&quot; tab.</p>
                  </div>
                )}

                {/* Step 5: Results */}
                {step === "result" && (result || resultFromDB) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Scoring Results</h2>
                      <div className="flex gap-2">
                        <button onClick={() => pollForResults(sessionId)} disabled={loading} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                        </button>
                        <button onClick={resetForm} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" /> New Scoring
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 text-xs text-gray-500">
                      <AlertCircle className="w-3.5 h-3.5" /> Session ID: <code className="bg-white px-2 py-0.5 rounded border font-mono">{sessionId}</code>
                    </div>
                    {resultFromDB ? (
                      <ScoreDisplay result={resultFromDB} fromDB />
                    ) : (
                      <ScoreDisplay result={result!} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
    </div>
      );
}