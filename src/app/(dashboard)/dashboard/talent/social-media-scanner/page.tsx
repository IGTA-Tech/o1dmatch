"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  ArrowLeft,
  Lightbulb,
  Download,
  Clock,
} from "lucide-react";
import PaidTierGate from '@/components/PaidTierGate';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";
type Platform = "youtube" | "reddit" | "twitter" | "instagram" | "tiktok" | "text";

interface FlaggedItem {
  id: string;
  platform: string;
  content: string;
  content_type: string;
  keywords_matched: string[];
  risk_level: RiskLevel;
  category: string;
  context: string;
  recommendation: string;
  url?: string;
  timestamp?: string;
}

interface ScanSummary {
  total_flags: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  safe: number;
}

interface ScanResponse {
  success?: boolean;
  platform: string;
  items_scanned: number;
  overall_risk: RiskLevel;
  summary: ScanSummary;
  flagged_items: FlaggedItem[];
  scanned_at: string;
  content_stats?: { characters: number; words: number; segments: number };
  error?: string;
}

/* ================================================================== */
/*  Platform Config with Export Steps + Tips                            */
/* ================================================================== */
interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  description: string;
  inputType: "text" | "url";
  placeholder: string;
  exportSteps: string[];
  tips: string[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    description: "Scan channel videos, comments, and descriptions",
    inputType: "url",
    placeholder: "https://www.youtube.com/@yourchannel or https://www.youtube.com/channel/UC...",
    exportSteps: [
      "Go to your YouTube channel page",
      "Copy your channel URL from the browser address bar (e.g. youtube.com/@yourchannel)",
      "Paste the URL below — we automatically fetch and scan all public video titles, descriptions, and metadata",
      "Processing may take 30–60 seconds depending on channel size",
    ],
    tips: [
      "We automatically fetch and scan all public video titles, descriptions, and metadata from your channel",
      "Processing may take 30–60 seconds depending on how many videos you have",
      "Private and unlisted videos are not included in the scan",
      "Community posts and YouTube Shorts captions are also checked if available",
      "Consider reviewing video thumbnails and pinned comments separately — those require manual review",
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "🔴",
    description: "Scan posts, comments, and subreddit activity",
    inputType: "text",
    placeholder: "Paste your Reddit posts and comments here...\n\nSeparate different posts with blank lines.\n\nTip: Include subreddit names (e.g. r/immigration) for better context.",
    exportSteps: [
      "Go to your Reddit profile → click your username at the top right",
      "Click \"Overview\" to see all your posts and comments",
      "For each post/comment: click the three dots (⋯) → \"Copy Text\"",
      "Alternatively, visit reddit.com/user/YOUR_USERNAME/overview and manually copy your content",
      "For bulk export: use redditmetis.com or request your data at reddit.com/settings/data-request",
      "Paste all copied content below — separate different posts with blank lines",
    ],
    tips: [
      "Include the subreddit name (e.g., r/politics, r/worldnews) for more accurate context analysis",
      "Reddit comments remain publicly accessible even after account deletion — cached copies may persist",
      "Political subreddits and news discussion threads are the most commonly flagged areas",
      "Anonymous Reddit accounts can still be linked to visa applicants through device fingerprinting or email association",
      "Pay attention to any comments you made on posts about protests, immigration policy, or foreign affairs",
    ],
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "𝕏",
    description: "Scan tweets, replies, retweets, and likes",
    inputType: "text",
    placeholder: "Paste your tweets here...\n\nSeparate different tweets with blank lines.\n\nInclude retweets and quote tweets too.",
    exportSteps: [
      "Go to Settings → Your Account → Download an archive of your data",
      "X will prepare your archive — this can take 24–48 hours",
      "Once ready, download and extract the ZIP file",
      "Open the \"tweets.js\" file in a text editor — it contains all your tweet text",
      "Copy the tweet content and paste below",
      "Alternatively: scroll through your profile and manually copy individual tweets, replies, and quote tweets",
    ],
    tips: [
      "Retweets and quote tweets are also reviewed by USCIS — not just your original posts",
      "Deleted tweets may still exist in cached versions, screenshots, or the Wayback Machine",
      "Your Likes tab is also visible — liked tweets with flagged content can raise concerns",
      "Review your bio, pinned tweet, and header image for any sensitive content",
      "Twitter Spaces recordings, if saved, may also be reviewed",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    description: "Scan captions, comments, stories, and bio text",
    inputType: "text",
    placeholder: "Paste your Instagram captions and comments here...\n\nSeparate different posts with blank lines.",
    exportSteps: [
      "Open Instagram → Settings → Accounts Center → Your information and permissions",
      "Select \"Download your information\" → choose your Instagram account",
      "Select \"All available information\" → choose JSON format → Request download",
      "Instagram will email you a download link (can take up to 48 hours)",
      "Extract the ZIP file and open the JSON files in the \"content\" folder",
      "Copy the caption text from your posts and comments, then paste below",
    ],
    tips: [
      "Story highlights with text overlays should be reviewed manually — text scanning only covers captions",
      "Instagram captions with political hashtags (#FreePalestine, #BLM, etc.) are commonly flagged",
      "Comments you left on others' posts are also visible and can be flagged",
      "Saved posts and private collections are typically not part of USCIS screening",
      "Review tagged photos where others may have added sensitive captions mentioning you",
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    description: "Scan video captions, comments, and descriptions",
    inputType: "text",
    placeholder: "Paste your TikTok captions and video descriptions here...\n\nSeparate different posts with blank lines.",
    exportSteps: [
      "Open TikTok → Profile → Menu (☰) → Settings and Privacy",
      "Go to Account → Download your data → choose JSON format",
      "Request data download — TikTok will notify you when it's ready (1–3 days)",
      "Download and extract the file",
      "Open the \"Video\" section and copy all captions and descriptions",
      "Paste all content below",
    ],
    tips: [
      "Video audio and visual content cannot be text-scanned — review those manually for sensitive content",
      "Duets and Stitches you made with flagged creators may affect your profile",
      "Comments you left on others' videos are publicly visible and searchable",
      "TikTok bio text and profile links are included in social media screening",
      "Sound/music choices with explicit or political lyrics may also raise flags upon manual review",
    ],
  },
  {
    id: "text",
    name: "Text / Other",
    icon: "📝",
    description: "Scan any text — LinkedIn, Facebook, WhatsApp, emails, blogs",
    inputType: "text",
    placeholder: "Paste any text content to scan...\n\nThis works for LinkedIn posts, Facebook updates, WhatsApp messages, Telegram chats, blog articles, emails, or any other text.",
    exportSteps: [
      "Copy text from any platform — LinkedIn, Facebook, WhatsApp, Telegram, email, blogs, etc.",
      "For LinkedIn: go to your Profile → Activity tab → copy your post and article text",
      "For Facebook: Settings → Your Information → Download Your Information → select Posts",
      "For WhatsApp: open a chat → tap three dots (⋯) → More → Export Chat (without media)",
      "For Telegram: open a chat → tap three dots → Export Chat History",
      "Paste all content below — works for any text from any source",
    ],
    tips: [
      "This universal scanner works for any text content from any platform or source",
      "LinkedIn posts and articles are increasingly reviewed by USCIS for O-1 and EB visa applicants",
      "WhatsApp and Telegram group messages can surface if devices are inspected at ports of entry",
      "Academic papers, blog posts, and public comments with sensitive geopolitical topics should be reviewed",
      "Personal emails are generally private, but scan any content you've posted publicly or semi-publicly",
    ],
  },
];

/* ================================================================== */
/*  Risk Helpers                                                       */
/* ================================================================== */
function getRiskColor(risk: RiskLevel) {
  switch (risk) {
    case "critical": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-100 text-red-800", bar: "bg-red-500" };
    case "high": return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", bar: "bg-orange-500" };
    case "medium": return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", badge: "bg-amber-100 text-amber-800", bar: "bg-yellow-500" };
    case "low": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-800", bar: "bg-blue-400" };
    case "safe": return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "bg-green-100 text-green-800", bar: "bg-green-500" };
  }
}

function getRiskIcon(risk: RiskLevel) {
  switch (risk) {
    case "critical": return <ShieldAlert className="w-5 h-5 text-red-600" />;
    case "high": return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    case "medium": return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case "low": return <Info className="w-5 h-5 text-blue-500" />;
    case "safe": return <CheckCircle className="w-5 h-5 text-green-600" />;
  }
}

function getRiskLabel(risk: RiskLevel) {
  switch (risk) {
    case "critical": return "Critical Risk";
    case "high": return "High Risk";
    case "medium": return "Medium Risk";
    case "low": return "Low Risk";
    case "safe": return "Safe";
  }
}

function getCategoryLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */
export default function SocialMediaScannerPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [inputText, setInputText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showExportSteps, setShowExportSteps] = useState(true);
  const [copied, setCopied] = useState(false);

  const platform = selectedPlatform ? PLATFORMS.find((p) => p.id === selectedPlatform)! : null;

  /* ── Scan handler ─────────────────────────────────────────────── */
  const handleScan = useCallback(async () => {
    if (!selectedPlatform || !inputText.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const body: Record<string, unknown> = { platform: selectedPlatform };

      if (selectedPlatform === "youtube") {
        // YouTube: send channelUrl — visaclear API fetches videos automatically
        body.channel_url = inputText.trim();
      } else {
        body.text = inputText.trim();
      }

      const res = await fetch("/api/social-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: ScanResponse = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Scan failed. Please try again.");
        return;
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setScanning(false);
    }
  }, [selectedPlatform, inputText]);

  /* ── Helpers ──────────────────────────────────────────────────── */
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      // next.has(id) ? next.delete(id) : next.add(id);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBack = () => {
    setSelectedPlatform(null);
    setInputText("");
    setResult(null);
    setError(null);
    setExpandedItems(new Set());
    setShowExportSteps(true);
  };

  const handleNewScan = () => {
    setInputText("");
    setResult(null);
    setError(null);
    setExpandedItems(new Set());
  };

  const handleCopyResults = () => {
    if (!result) return;
    const lines = [
      `Social Media Scan — ${result.platform.toUpperCase()}`,
      `Scanned: ${new Date(result.scanned_at).toLocaleString()}`,
      `Overall Risk: ${getRiskLabel(result.overall_risk)}`,
      `Items Scanned: ${result.items_scanned} | Flags: ${result.summary.total_flags}`,
      `Breakdown: Critical ${result.summary.critical} | High ${result.summary.high} | Medium ${result.summary.medium} | Low ${result.summary.low} | Safe ${result.summary.safe}`,
      "",
      ...result.flagged_items.map(
        (item, i) =>
          `${i + 1}. [${item.risk_level.toUpperCase()}] Keywords: ${item.keywords_matched.join(", ")}\n   Category: ${getCategoryLabel(item.category)}\n   ${item.recommendation}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================================================================ */
  /*  RENDER: Platform Selection Screen                                */
  /* ================================================================ */
  if (!selectedPlatform) {
    return (
      <PaidTierGate
        featureName="O-1 Scoring"
        featureDescription="Upgrade your plan to access O-1 visa scoring and detailed analysis."
      >
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-[#D4A84B]" />
              Social Media Scanner
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Scan your social media content for keywords that could flag your USCIS visa application
            </p>
          </div>

          {/* Platform Selection Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a platform to scan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className="p-6 rounded-xl border-2 border-gray-200 text-left transition hover:border-[#D4A84B] hover:shadow-md bg-white group"
                >
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#0B1D35]">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-500">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How It Works
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>1. Select a platform</strong> — Choose which social media to scan</p>
              <p><strong>2. Connect or paste</strong> — Enter a YouTube channel URL, or follow the export guide and paste your content for other platforms</p>
              <p><strong>3. Review results</strong> — See flagged content with risk levels and matched keywords</p>
              <p><strong>4. Take action</strong> — Delete, archive, or prepare explanations for flagged content</p>
            </div>
          </div>

          {/* USCIS Warning */}
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              USCIS Social Media Screening
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              USCIS has significantly expanded social media screening for visa applicants. H-1B, H-4, O-1,
              EB-1, and other visa applicants may now be required to make their social media profiles public
              for review. Content from years ago can resurface during adjudication.
            </p>
            <p className="text-sm text-yellow-700">
              Proactively audit your content across all platforms before filing your petition. This tool scans
              text content against a database of ~500 USCIS-flagged terms across categories including
              extremism, controlled substances, immigration fraud, and political activism.
            </p>
          </div>

          {/* Quick Tips */}
          <div className="bg-[#0B1D35] text-white rounded-xl p-6">
            <h3 className="font-semibold text-[#E8C97A] mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Quick Tips Before You Scan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
              <div className="space-y-2">
                <p>• Scan <strong className="text-white/90">all</strong> your social media accounts, not just one</p>
                <p>• Even casual language or jokes can trigger keyword matches</p>
                <p>• Academic discussions and news commentary can still be flagged</p>
                <p>• Scan content in every language you post in — not just English</p>
              </div>
              <div className="space-y-2">
                <p>• Deleted content may still exist in cached versions or screenshots</p>
                <p>• Review content posted by others that tags or mentions you</p>
                <p>• Group chats and shared posts can also surface in screening</p>
                <p>• Re-scan after making changes to verify your cleanup is complete</p>
              </div>
            </div>
            {/* Risk Level Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-white/10">
              {[
                { label: "Critical", color: "bg-red-500", desc: "Delete immediately" },
                { label: "High", color: "bg-orange-500", desc: "Recommend removal" },
                { label: "Medium", color: "bg-yellow-500", desc: "Review context carefully" },
                { label: "Low", color: "bg-blue-400", desc: "Monitor" },
                { label: "Safe", color: "bg-green-500", desc: "No action needed" },
              ].map((level) => (
                <div key={level.label} className="text-center">
                  <div className={`h-2 rounded-full ${level.color} mb-1.5`} />
                  <div className="text-xs font-medium text-white/90">{level.label}</div>
                  <div className="text-[10px] text-white/50">{level.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PaidTierGate>
    );
  }

  /* ================================================================ */
  /*  RENDER: Scanner View (platform selected)                         */
  /* ================================================================ */
  return (
    <PaidTierGate
      featureName="O-1 Scoring"
      featureDescription="Upgrade your plan to access O-1 visa scoring and detailed analysis."
    >
      <div className="space-y-5">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to platforms
        </button>

        {/* Platform Header */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <span className="text-3xl">{platform!.icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {platform!.name} Scanner
            </h2>
            <p className="text-sm text-gray-500">{platform!.description}</p>
          </div>
        </div>

        {/* ── Export / Data Guide (collapsible) ─────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowExportSteps(!showExportSteps)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#D4A84B]" />
              <span className="text-sm font-semibold text-gray-700">
                {selectedPlatform === "youtube"
                  ? "How to find your YouTube channel URL"
                  : `How to export your ${platform!.name} data`}
              </span>
            </div>
            {showExportSteps ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showExportSteps && (
            <div className="px-5 pb-4 border-t border-gray-100">
              <ol className="mt-3 space-y-2.5">
                {platform!.exportSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4A84B]/10 text-[#D4A84B] flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* ── Scanner Input Area ────────────────────────────────────── */}
        {!result && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {selectedPlatform === "youtube" ? (
              /* YouTube: URL input with auto-fetch */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={platform!.placeholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A84B]/40 focus:border-[#D4A84B]"
                />
                <div className="mt-2 flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-2.5">
                  <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Just paste your channel URL — we&apos;ll automatically fetch all public videos and scan their titles,
                    descriptions, and metadata. Processing takes 30–60 seconds depending on channel size.
                  </span>
                </div>
              </div>
            ) : (
              /* Other platforms: textarea input */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your {platform!.name} content
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={platform!.placeholder}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A84B]/40 focus:border-[#D4A84B] resize-y font-mono"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {inputText.length > 0
                      ? `${inputText.split(/\s+/).filter(Boolean).length} words · ${inputText.length} characters`
                      : "Paste your content above"}
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {inputText && (
                <button
                  onClick={() => setInputText("")}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
              <button
                onClick={handleScan}
                disabled={scanning || !inputText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                style={{ background: "#D4A84B", color: "#0B1D35" }}
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {selectedPlatform === "youtube" ? "Fetching & Scanning Channel..." : "Scanning..."}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {selectedPlatform === "youtube" ? "Scan Channel" : "Scan Content"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Scan Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
              <button
                onClick={() => { setError(null); }}
                className="text-xs text-red-700 underline mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Results ───────────────────────────────────────────────── */}
        {result && (
          <>
            <ScanResults
              result={result}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
              onCopy={handleCopyResults}
              copied={copied}
            />

            {/* New Scan / Back Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewScan}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition hover:-translate-y-0.5"
                style={{ background: "#D4A84B", color: "#0B1D35" }}
              >
                <Search className="w-4 h-4" />
                New {platform!.name} Scan
              </button>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Switch Platform
              </button>
            </div>
          </>
        )}

        {/* ── Platform Tips (shown when no results yet) ─────────────── */}
        {!result && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {platform!.name} Tips
            </h3>
            <ul className="space-y-2">
              {platform!.tips.map((tip, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PaidTierGate>
  );
}

/* ================================================================== */
/*  Scan Results Component                                             */
/* ================================================================== */
function ScanResults({
  result,
  expandedItems,
  toggleExpand,
  onCopy,
  copied,
}: {
  result: ScanResponse;
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const colors = getRiskColor(result.overall_risk);

  return (
    <div className="space-y-4">
      {/* ── Overall Risk Banner ─────────────────────────────────── */}
      <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {getRiskIcon(result.overall_risk)}
            <div>
              <p className={`text-lg font-bold ${colors.text}`}>
                {getRiskLabel(result.overall_risk)}
              </p>
              <p className="text-sm text-gray-500">
                {result.items_scanned} segment{result.items_scanned !== 1 ? "s" : ""} scanned
                {result.content_stats && ` · ${result.content_stats.words} words`}
                {" · "}
                {new Date(result.scanned_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Report
              </>
            )}
          </button>
        </div>

        {/* Summary Bars */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          {(["critical", "high", "medium", "low", "safe"] as RiskLevel[]).map((level) => {
            const count = result.summary[level];
            const lc = getRiskColor(level);
            return (
              <div key={level} className="text-center">
                <div className="text-xl font-bold text-gray-800">{count}</div>
                <div className={`h-1.5 rounded-full mt-1 ${count > 0 ? lc.bar : "bg-gray-200"}`} />
                <div className="text-[10px] text-gray-500 mt-1 capitalize">{level}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── All Clear ───────────────────────────────────────────── */}
      {result.summary.total_flags === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-semibold text-green-800">No Flagged Content Found</p>
          <p className="text-sm text-green-600 mt-1">
            Your content appears clean of USCIS-flagged keywords. Remember to also
            review images, videos, and audio content separately — this tool scans text only.
          </p>
        </div>
      )}

      {/* ── Flagged Items ───────────────────────────────────────── */}
      {result.flagged_items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Flagged Items ({result.flagged_items.length})
            </h3>
            <button
              onClick={() => {
                // Expand/collapse all
                const allIds = result.flagged_items.map((i) => i.id);
                const allExpanded = allIds.every((id) => expandedItems.has(id));
                if (allExpanded) {
                  allIds.forEach((id) => toggleExpand(id));
                } else {
                  allIds.filter((id) => !expandedItems.has(id)).forEach((id) => toggleExpand(id));
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {result.flagged_items.every((i) => expandedItems.has(i.id))
                ? "Collapse All"
                : "Expand All"}
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {result.flagged_items.map((item) => {
              const ic = getRiskColor(item.risk_level);
              const isExpanded = expandedItems.has(item.id);

              return (
                <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-start gap-3 text-left"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getRiskIcon(item.risk_level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ic.badge}`}>
                          {item.risk_level.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {item.keywords_matched.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 ml-8 space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Context</p>
                        <p className="text-sm text-gray-700 font-mono leading-relaxed">{item.context}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Content Preview</p>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{item.content}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${ic.bg} border ${ic.border}`}>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Recommendation</p>
                        <p className={`text-sm font-medium ${ic.text}`}>{item.recommendation}</p>
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View original
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── What to Do Next ─────────────────────────────────────── */}
      <div className="bg-[#0B1D35] text-white rounded-xl p-5">
        <h3 className="font-semibold text-[#E8C97A] mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          What to Do Next
        </h3>
        <div className="space-y-2 text-sm text-white/70">
          <p>
            • <strong className="text-white/90">Critical & High flags:</strong> Delete
            or archive the content immediately before filing your petition. These
            keywords are most likely to trigger adverse action.
          </p>
          <p>
            • <strong className="text-white/90">Medium flags:</strong> Review the
            context carefully — if the content is academic, journalistic, or clearly
            non-threatening, prepare a brief written explanation to have on hand.
          </p>
          <p>
            • <strong className="text-white/90">Low flags:</strong> Monitor but
            generally acceptable — document your reasoning for keeping the content
            in case questions arise.
          </p>
          <p>
            • <strong className="text-white/90">Re-scan after cleanup:</strong> Run
            the scanner again after deleting or modifying flagged content to
            confirm everything is clean.
          </p>
          <p>
            • <strong className="text-white/90">Consult your attorney:</strong> Share
            this report with your immigration lawyer for professional guidance
            on borderline cases.
          </p>
        </div>
      </div>
    </div>
  );
}