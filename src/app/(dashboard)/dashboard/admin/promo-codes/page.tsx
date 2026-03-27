// src/app/(dashboard)/dashboard/admin/promo-codes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Ticket, Loader2, Trash2, ToggleLeft, ToggleRight,
  Copy, Check, AlertCircle, Search, RefreshCw, X,
  Calendar, Users, Percent, Clock, Shield, Tag,
  ChevronDown, ChevronUp, Gift, Pencil,
  Package, DollarSign, TrendingUp, ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface PromoCode {
  id: string; code: string; type: string;
  description: string | null; trial_days: number; discount_percent: number;
  grants_igta_member: boolean; applicable_tier: string | null;
  applicable_user_type: string | null; max_uses: number | null;
  max_uses_per_user: number | null; current_uses: number;
  valid_from: string; valid_until: string | null;
  is_active: boolean; created_at: string; updated_at: string;
  batch_id?: string | null; assigned_to_partner?: string | null;
  purchase_price?: number | null;
}

interface FormData {
  code: string; type: string; description: string;
  trial_days: number; discount_percent: number; grants_igta_member: boolean;
  applicable_tiers: string[]; applicable_user_type: string;
  max_uses: string; max_uses_per_user: string;
  valid_from: string; valid_until: string; is_active: boolean;
}

interface AffiliatePartner {
  id: string; affiliate_code: string;
  profile: { full_name: string; email: string } | null;
}

interface BatchCode {
  id: string; code: string; current_uses: number;
  is_active: boolean; valid_until: string | null;
}

interface Batch {
  batch_id: string;
  partner: { id: string; affiliate_code: string; profile: { full_name: string; email: string } | null } | null;
  purchase_price: number | null; created_at: string;
  type: string; trial_days: number;
  applicable_tier: string | null; applicable_user_type: string | null;
  codes: BatchCode[]; total: number; used: number; revenue: number;
}

interface BatchForm {
  partnerId: string; count: number; type: string;
  trial_days: number; applicable_tier: string;
  applicable_user_type: string; valid_until: string;
  purchase_price: string; description: string;
}

const defaultForm: FormData = {
  code: "", type: "trial", description: "", trial_days: 14,
  discount_percent: 0, grants_igta_member: false,
  applicable_tiers: [], applicable_user_type: "both",
  max_uses: "", max_uses_per_user: "1",
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: "", is_active: true,
};

const defaultBatchForm: BatchForm = {
  partnerId: "", count: 10, type: "trial", trial_days: 90,
  applicable_tier: "talent:starter", applicable_user_type: "talent",
  valid_until: "", purchase_price: "", description: "",
};

const typeOptions = [
  { value: "trial",            label: "Free Trial",        icon: Clock,   color: "blue"   },
  { value: "discount",         label: "Discount",          icon: Percent, color: "green"  },
  { value: "igta_verification",label: "IGTA Verification", icon: Shield,  color: "purple" },
  { value: "free_upgrade",     label: "Free Upgrade",      icon: Gift,    color: "amber"  },
];

const userTypeOptions = [
  { value: "both",     label: "Both (any user)" },
  { value: "employer", label: "Employer only"   },
  { value: "talent",   label: "Talent only"     },
];

const EMPLOYER_PLAN_OPTIONS = [
  { value: "",                  label: "Any Employer Plan"        },
  { value: "employer:free",     label: "Free — $0/mo"            },
  { value: "employer:starter",  label: "Starter — $25/mo"        },
  { value: "employer:growth",   label: "Growth — $49/mo"         },
  { value: "employer:business", label: "Business — $99/mo"       },
  { value: "employer:enterprise",label: "Enterprise — $199/mo"   },
];

const TALENT_PLAN_OPTIONS = [
  { value: "",                        label: "Any Talent Plan"        },
  { value: "talent:profile_only",     label: "Free Profile — $0/mo"  },
  { value: "talent:starter",          label: "Starter — $100/mo"     },
  { value: "talent:active_match",     label: "Active Match — $500/mo"},
];

function stripPrefix(v: string): string { return v.replace(/^(employer|talent):/, ""); }
function planLabel(v: string): string {
  const all = [...EMPLOYER_PLAN_OPTIONS, ...TALENT_PLAN_OPTIONS];
  const match = all.find(o => o.value === v) ?? all.find(o => stripPrefix(o.value) === v);
  return match ? match.label.split(" —")[0] : v;
}
function isPrefixed(v: string): boolean { return v.startsWith("employer:") || v.startsWith("talent:"); }

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function typeBadge(type: string) {
  const cfg = typeOptions.find(t => t.value === type);
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[cfg?.color || "blue"]}`}>
      {cfg?.label || type}
    </span>
  );
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${seg(4)}-${seg(4)}`;
}

function fmt(n: number) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/* ================================================================== */
/*  PAGE                                                                */
/* ================================================================== */
export default function AdminPromoCodesPage() {
  /* ── existing state ── */
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState<"created_at" | "code" | "current_uses">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ── new batch state ── */
  const [activeTab, setActiveTab] = useState<"codes" | "batches">("codes");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState<BatchForm>(defaultBatchForm);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /* ---------- Load promo codes ---------- */
  const loadPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes");
      const json = await res.json();
      if (json.success) setPromoCodes(json.promoCodes || []);
      else setError(json.error || "Failed to load promo codes");
    } catch { setError("Failed to load promo codes"); }
    finally { setLoading(false); }
  }, []);

  /* ---------- Load batches ---------- */
  const loadBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes/batch");
      const json = await res.json();
      if (json.success) setBatches(json.batches || []);
    } catch { /* silent */ }
    finally { setBatchesLoading(false); }
  }, []);

  /* ---------- Load active affiliate partners ---------- */
  const loadPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_partners" }),
      });
      const json = await res.json();
      if (json.partners) setPartners(json.partners);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadPromoCodes(); }, [loadPromoCodes]);
  useEffect(() => {
    if (activeTab === "batches") { loadBatches(); loadPartners(); }
  }, [activeTab, loadBatches, loadPartners]);

  /* ---------- Open Edit ---------- */
  const handleEdit = (promo: PromoCode) => {
    setEditingId(promo.id);
    setError(""); setSuccess("");
    setForm({
      code: promo.code, type: promo.type,
      description: promo.description ?? "",
      trial_days: promo.trial_days, discount_percent: promo.discount_percent,
      grants_igta_member: promo.grants_igta_member,
      applicable_tiers: promo.applicable_tier
        ? promo.applicable_tier.split(",").map(s => s.trim()).filter(Boolean).map(raw => {
            if (isPrefixed(raw)) return raw;
            const empValues = EMPLOYER_PLAN_OPTIONS.filter(o => o.value !== "").map(o => stripPrefix(o.value));
            const talValues = TALENT_PLAN_OPTIONS.filter(o => o.value !== "").map(o => stripPrefix(o.value));
            if (promo.applicable_user_type === "employer") return `employer:${raw}`;
            if (promo.applicable_user_type === "talent") return `talent:${raw}`;
            if (talValues.includes(raw) && empValues.includes(raw)) return `employer:${raw}`;
            if (empValues.includes(raw)) return `employer:${raw}`;
            if (talValues.includes(raw)) return `talent:${raw}`;
            return raw;
          })
        : [],
      applicable_user_type: promo.applicable_user_type ?? "both",
      max_uses: promo.max_uses !== null ? String(promo.max_uses) : "",
      max_uses_per_user: promo.max_uses_per_user !== null ? String(promo.max_uses_per_user) : "",
      valid_from: promo.valid_from ? promo.valid_from.split("T")[0] : "",
      valid_until: promo.valid_until ? promo.valid_until.split("T")[0] : "",
      is_active: promo.is_active,
    });
    setShowForm(true);
  };

  /* ---------- Update ---------- */
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError(""); setSuccess("");
    if (!form.code.trim()) { setError("Promo code is required"); return; }
    setSaving(true);
    try {
      const payload = {
        id: editingId, code: form.code.toUpperCase().trim(), type: form.type,
        description: form.description.trim() || null,
        trial_days: form.type === "trial" ? form.trial_days : 0,
        discount_percent: form.type === "discount" ? form.discount_percent : 0,
        grants_igta_member: form.type === "igta_verification" ? true : form.grants_igta_member,
        applicable_tier: form.applicable_tiers.length > 0 ? form.applicable_tiers.map(stripPrefix).join(",") : null,
        applicable_user_type: form.applicable_user_type,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        max_uses_per_user: form.max_uses_per_user ? parseInt(form.max_uses_per_user) : 1,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        is_active: form.is_active,
      };
      const res = await fetch("/api/admin/promo-codes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Promo code "${payload.code}" updated successfully!`);
        setForm(defaultForm); setShowForm(false); setEditingId(null);
        loadPromoCodes(); setTimeout(() => setSuccess(""), 4000);
      } else { setError(json.error || "Failed to update promo code"); }
    } catch { setError("Failed to update promo code"); }
    finally { setSaving(false); }
  };

  /* ---------- Create ---------- */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.code.trim()) { setError("Promo code is required"); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(), type: form.type,
        description: form.description.trim() || null,
        trial_days: form.type === "trial" ? form.trial_days : 0,
        discount_percent: form.type === "discount" ? form.discount_percent : 0,
        grants_igta_member: form.type === "igta_verification" ? true : form.grants_igta_member,
        applicable_tier: form.applicable_tiers.length > 0 ? form.applicable_tiers.map(stripPrefix).join(",") : null,
        applicable_user_type: form.applicable_user_type,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        max_uses_per_user: form.max_uses_per_user ? parseInt(form.max_uses_per_user) : 1,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        is_active: form.is_active,
      };
      const res = await fetch("/api/admin/promo-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Promo code "${json.promoCode.code}" created successfully!`);
        setForm(defaultForm); setShowForm(false);
        loadPromoCodes(); setTimeout(() => setSuccess(""), 4000);
      } else { setError(json.error || "Failed to create promo code"); }
    } catch { setError("Failed to create promo code"); }
    finally { setSaving(false); }
  };

  /* ---------- Create Batch ---------- */
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.partnerId) { setError("Select a partner"); return; }
    if (batchForm.count < 1 || batchForm.count > 500) { setError("Count must be 1–500"); return; }
    setError(""); setBatchSaving(true);
    try {
      const res = await fetch("/api/admin/promo-codes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId:            batchForm.partnerId,
          count:                batchForm.count,
          type:                 batchForm.type,
          trial_days:           batchForm.trial_days,
          discount_percent:     0,
          applicable_tier:      stripPrefix(batchForm.applicable_tier),
          applicable_user_type: batchForm.applicable_user_type,
          valid_until:          batchForm.valid_until || null,
          purchase_price:       batchForm.purchase_price ? parseFloat(batchForm.purchase_price) : null,
          description:          batchForm.description || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`✓ Created ${json.count} codes in batch ${json.batchId}`);
        setShowBatchForm(false);
        setBatchForm(defaultBatchForm);
        loadBatches();
        setTimeout(() => setSuccess(""), 5000);
      } else { setError(json.error || "Failed to create batch"); }
    } catch { setError("Failed to create batch"); }
    finally { setBatchSaving(false); }
  };

  /* ---------- Toggle Active ---------- */
  const handleToggle = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch("/api/admin/promo-codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_active: !currentActive }) });
      const json = await res.json();
      if (json.success) setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentActive } : p));
    } catch { setError("Failed to toggle promo code"); }
    finally { setTogglingId(null); }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promo-codes?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPromoCodes(prev => prev.filter(p => p.id !== id));
        setSuccess(`Promo code "${code}" deleted`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch { setError("Failed to delete promo code"); }
    finally { setDeletingId(null); }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? (sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)
      : <ChevronDown className="w-3.5 h-3.5 opacity-30" />;

  const filtered = promoCodes
    .filter(p => {
      if (filterType !== "all" && p.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.code.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "code") return a.code.localeCompare(b.code) * dir;
      if (sortField === "current_uses") return (a.current_uses - b.current_uses) * dir;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });

  const EMPLOYER_PLANS = EMPLOYER_PLAN_OPTIONS.filter(o => o.value !== "");
  const TALENT_PLANS   = TALENT_PLAN_OPTIONS.filter(o => o.value !== "");
  const planOptions = form.applicable_user_type === "employer" ? EMPLOYER_PLANS
    : form.applicable_user_type === "talent" ? TALENT_PLANS
    : [...EMPLOYER_PLANS, ...TALENT_PLANS];

  const handleUserTypeChange = (newUserType: string) => {
    const validValues = newUserType === "employer" ? EMPLOYER_PLANS.map(o => o.value)
      : newUserType === "talent" ? TALENT_PLANS.map(o => o.value)
      : [...EMPLOYER_PLANS, ...TALENT_PLANS].map(o => o.value);
    setForm({ ...form, applicable_user_type: newUserType, applicable_tiers: form.applicable_tiers.filter(t => validValues.includes(t)) });
  };

  const activeCount = promoCodes.filter(p => p.is_active).length;
  const totalUses   = promoCodes.reduce((s, p) => s + p.current_uses, 0);
  const batchTotalRevenue = batches.reduce((s, b) => s + (b.purchase_price ?? 0), 0);
  const batchTotalUsed    = batches.reduce((s, b) => s + b.used, 0);

  /* ================================================================ */
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" /> Promo Codes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create promo codes and manage partner code batches</p>
        </div>
        {activeTab === "codes" && (
          <button
            onClick={() => { setShowForm(!showForm); setError(""); setEditingId(null); if (!showForm) setForm(defaultForm); }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${showForm ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Create Promo Code"}
          </button>
        )}
        {activeTab === "batches" && (
          <button
            onClick={() => { setShowBatchForm(!showBatchForm); setError(""); }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${showBatchForm ? "bg-gray-100 text-gray-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
          >
            {showBatchForm ? <X className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            {showBatchForm ? "Cancel" : "Generate Partner Batch"}
          </button>
        )}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: "codes",   label: `All Codes (${promoCodes.length})`,          icon: Ticket  },
          { key: "batches", label: `Partner Batches (${batches.length})`,        icon: Package },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as "codes" | "batches")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold -mb-px transition-colors ${
              activeTab === t.key ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          CODES TAB — everything from original, unchanged
      ════════════════════════════════════════════════════ */}
      {activeTab === "codes" && (
        <div className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Codes",  value: promoCodes.length, color: "text-gray-900" },
              { label: "Active",       value: activeCount,       color: "text-green-700" },
              { label: "Inactive",     value: promoCodes.length - activeCount, color: "text-gray-500" },
              { label: "Total Uses",   value: totalUses,         color: "text-blue-700" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Create / Edit form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">{editingId ? "Edit Promo Code" : "Create Promo Code"}</h2>
              <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-5">

                {/* Code + type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <div className="flex gap-2">
                      <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="SAVE20" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setForm({ ...form, code: generateCode() })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {typeOptions.map(t => (
                        <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${form.type === t.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                          <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Type-specific fields */}
                {form.type === "trial" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trial Duration (days)</label>
                    <input type="number" min="1" max="365" value={form.trial_days} onChange={e => setForm({ ...form, trial_days: parseInt(e.target.value) || 14 })}
                      className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                {form.type === "discount" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percent</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" max="100" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })}
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Internal note about this code" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* User type + applicable plans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable User Type</label>
                    <select value={form.applicable_user_type} onChange={e => handleUserTypeChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {userTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Plans</label>
                    <div className="border border-gray-200 rounded-lg p-2 max-h-36 overflow-y-auto space-y-1">
                      {planOptions.map(o => (
                        <label key={o.value} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                          <input type="checkbox" checked={form.applicable_tiers.includes(o.value)}
                            onChange={e => setForm({ ...form, applicable_tiers: e.target.checked ? [...form.applicable_tiers, o.value] : form.applicable_tiers.filter(t => t !== o.value) })}
                            className="rounded" />
                          <span className="text-xs text-gray-700">{o.label}</span>
                        </label>
                      ))}
                    </div>
                    {form.applicable_tiers.length === 0 && <p className="text-xs text-gray-400 mt-1">No selection = applies to all plans</p>}
                  </div>
                </div>

                {/* Limits + dates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Uses</label>
                    <input type="number" min="1" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                      placeholder="∞" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per User</label>
                    <input type="number" min="1" value={form.max_uses_per_user} onChange={e => setForm({ ...form, max_uses_per_user: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                    <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                    <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-blue-600" : "bg-gray-300"}`}
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{form.is_active ? "Active" : "Inactive"}</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingId ? "Update Code" : "Create Code"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search codes…" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", ...typeOptions.map(t => t.value)].map(f => (
                <button key={f} onClick={() => setFilterType(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterType === f ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {f === "all" ? "All" : typeOptions.find(t => t.value === f)?.label || f}
                </button>
              ))}
            </div>
            <button onClick={loadPromoCodes} className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
              <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No promo codes found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort("code")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700">
                          Code <SortIcon field="code" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Target</th>
                      <th className="px-4 py-3 text-center">
                        <button onClick={() => toggleSort("current_uses")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700 mx-auto">
                          Uses <SortIcon field="current_uses" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Validity</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(promo => {
                      const isExpired = !!(promo.valid_until && new Date(promo.valid_until) < new Date());
                      const isMaxed   = promo.max_uses !== null && promo.current_uses >= promo.max_uses;
                      return (
                        <tr key={promo.id} className={`hover:bg-gray-50 transition-colors ${!promo.is_active || isExpired || isMaxed ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs tracking-wider">{promo.code}</code>
                              <button onClick={() => handleCopy(promo.code, promo.id)} className="text-gray-400 hover:text-gray-600" title="Copy">
                                {copiedId === promo.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {promo.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{promo.description}</p>}
                            {promo.batch_id && <p className="text-[10px] text-indigo-400 mt-0.5 font-mono">batch</p>}
                          </td>
                          <td className="px-4 py-3">{typeBadge(promo.type)}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600">
                            {promo.type === "trial" && <span>{promo.trial_days} days</span>}
                            {promo.type === "discount" && <span>{promo.discount_percent}% off</span>}
                            {promo.type === "igta_verification" && <span>IGTA Badge</span>}
                            {promo.type === "free_upgrade" && <span>{promo.applicable_tier ? `→ ${promo.applicable_tier.split(",").map(t => planLabel(t.trim())).join(", ")}` : "Upgrade"}</span>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-gray-600 capitalize font-medium">
                              {promo.applicable_user_type === "employer" ? "Employer" : promo.applicable_user_type === "talent" ? "Talent" : "Both"}
                            </span>
                            {promo.applicable_tier && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {promo.applicable_tier.split(",").map(t => (
                                  <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">{planLabel(t.trim())}</span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium ${isMaxed ? "text-red-600" : "text-gray-700"}`}>
                              {promo.current_uses}
                              {promo.max_uses !== null ? <span className="text-gray-400"> / {promo.max_uses}</span> : <span className="text-gray-400"> / ∞</span>}
                            </span>
                            {promo.max_uses_per_user !== null && <span className="block text-[10px] text-gray-400 mt-0.5">{promo.max_uses_per_user}x per user</span>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="text-xs text-gray-500">
                              <span>{fmtDate(promo.valid_from)}</span>
                              {promo.valid_until && <span className={isExpired ? "text-red-500" : ""}>{" → "}{fmtDate(promo.valid_until)}</span>}
                              {!promo.valid_until && <span className="text-gray-400"> → No expiry</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isExpired ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Expired</span>
                              : isMaxed ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">Maxed</span>
                              : promo.is_active ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Active</span>
                              : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleEdit(promo)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleToggle(promo.id, promo.is_active)} disabled={togglingId === promo.id}
                                className={`p-1.5 rounded-lg transition-colors ${promo.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                                {togglingId === promo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : promo.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleDelete(promo.id, promo.code)} disabled={deletingId === promo.id} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                {deletingId === promo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PARTNER BATCHES TAB
      ════════════════════════════════════════════════════ */}
      {activeTab === "batches" && (
        <div className="space-y-6">

          {/* Batch stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Batches",    value: batches.length,                        color: "text-indigo-700" },
              { label: "Total Codes",      value: batches.reduce((s,b) => s+b.total, 0), color: "text-gray-900"   },
              { label: "Codes Used",       value: batchTotalUsed,                        color: "text-green-700"  },
              { label: "Partner Revenue",  value: `$${fmt(batchTotalRevenue)}`,          color: "text-blue-700"   },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Create batch form */}
          {showBatchForm && (
            <div className="bg-white border border-indigo-200 rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-600" /> Generate Partner Code Batch</h2>
                <p className="text-xs text-gray-400 mt-1">Creates multiple single-use promo codes assigned to a specific affiliate partner</p>
              </div>
              <form onSubmit={handleCreateBatch} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Partner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partner *</label>
                    <select value={batchForm.partnerId} onChange={e => setBatchForm({ ...batchForm, partnerId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select affiliate partner…</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.profile?.full_name ?? p.affiliate_code} — {p.affiliate_code}
                        </option>
                      ))}
                    </select>
                    {partners.length === 0 && <p className="text-xs text-amber-600 mt-1">No active partners found. Approve a partner first.</p>}
                  </div>

                  {/* Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Codes *</label>
                    <input type="number" min="1" max="500" value={batchForm.count}
                      onChange={e => setBatchForm({ ...batchForm, count: parseInt(e.target.value) || 1 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <p className="text-xs text-gray-400 mt-1">Max 500 per batch</p>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {typeOptions.filter(t => t.value === "trial" || t.value === "free_upgrade").map(t => (
                        <button key={t.value} type="button" onClick={() => setBatchForm({ ...batchForm, type: t.value })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${batchForm.type === t.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trial days */}
                  {batchForm.type === "trial" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trial Duration (days)</label>
                      <input type="number" min="1" max="365" value={batchForm.trial_days}
                        onChange={e => setBatchForm({ ...batchForm, trial_days: parseInt(e.target.value) || 90 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  )}

                  {/* User type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable User Type</label>
                    <select value={batchForm.applicable_user_type}
                      onChange={e => setBatchForm({ ...batchForm, applicable_user_type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {userTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  {/* Applicable tier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Plan</label>
                    <select value={batchForm.applicable_tier}
                      onChange={e => setBatchForm({ ...batchForm, applicable_tier: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {[...EMPLOYER_PLAN_OPTIONS, ...TALENT_PLAN_OPTIONS].filter(o => o.value).map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Purchase price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Purchase Price ($)
                      <span className="ml-1 text-xs text-gray-400 font-normal">— what partner paid for this batch</span>
                    </label>
                    <input type="number" min="0" step="0.01" value={batchForm.purchase_price}
                      onChange={e => setBatchForm({ ...batchForm, purchase_price: e.target.value })}
                      placeholder="e.g. 2100.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {batchForm.purchase_price && batchForm.count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        = ${fmt(parseFloat(batchForm.purchase_price || "0") / batchForm.count)} per code
                      </p>
                    )}
                  </div>

                  {/* Valid until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codes Valid Until</label>
                    <input type="date" value={batchForm.valid_until}
                      onChange={e => setBatchForm({ ...batchForm, valid_until: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <p className="text-xs text-gray-400 mt-1">Leave blank = no expiry</p>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                    <input value={batchForm.description} onChange={e => setBatchForm({ ...batchForm, description: e.target.value })}
                      placeholder="e.g. 10 codes for Attorney Wayne Gill, 3 months Starter access" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Summary box */}
                {batchForm.partnerId && batchForm.count > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-800">
                    <strong>Summary:</strong> Generate <strong>{batchForm.count}</strong> single-use{" "}
                    {batchForm.type === "trial" ? `${batchForm.trial_days}-day trial` : "upgrade"} codes
                    {batchForm.applicable_tier ? ` for ${planLabel(batchForm.applicable_tier)}` : ""}
                    {batchForm.purchase_price ? `, total value $${batchForm.purchase_price}` : ""}
                    {batchForm.valid_until ? `, expiring ${fmtDate(batchForm.valid_until)}` : ", no expiry"}.
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="submit" disabled={batchSaving || !batchForm.partnerId}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {batchSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Package className="w-4 h-4" /> Generate {batchForm.count} Codes</>}
                  </button>
                  <button type="button" onClick={() => { setShowBatchForm(false); setBatchForm(defaultBatchForm); }}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Batch list */}
          {batchesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : batches.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No partner batches yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "Generate Partner Batch" to create your first batch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map(batch => {
                const usedPct = batch.total > 0 ? Math.round((batch.used / batch.total) * 100) : 0;
                const isExpanded = expandedBatch === batch.batch_id;
                return (
                  <div key={batch.batch_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Batch header */}
                    <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedBatch(isExpanded ? null : batch.batch_id)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm">
                              {batch.partner?.profile?.full_name ?? batch.partner?.affiliate_code ?? "Unknown Partner"}
                            </p>
                            <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500">{batch.batch_id}</code>
                            {typeBadge(batch.type)}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {batch.type === "trial" ? `${batch.trial_days}-day trial` : "Free upgrade"}
                            {batch.applicable_tier ? ` · ${planLabel(batch.applicable_tier)}` : ""}
                            {" · "}Created {fmtDate(batch.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        {/* Usage bar */}
                        <div className="text-center min-w-[80px]">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${usedPct}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{batch.used}/{batch.total} used ({usedPct}%)</p>
                        </div>

                        {/* Revenue */}
                        {batch.purchase_price && (
                          <div className="text-center">
                            <p className="text-sm font-bold text-gray-900">${fmt(batch.purchase_price)}</p>
                            <p className="text-[10px] text-gray-400">paid by partner</p>
                          </div>
                        )}

                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </div>

                    {/* Expanded: code list */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Codes in this batch</p>
                          <button
                            onClick={() => {
                              const allCodes = batch.codes.map(c => c.code).join("\n");
                              navigator.clipboard.writeText(allCodes);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                            <Copy className="w-3 h-3" /> Copy all codes
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                {["Code", "Status", "Uses", "Expires"].map(h => (
                                  <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {batch.codes.map(c => (
                                <tr key={c.id} className={`hover:bg-gray-50 ${c.current_uses > 0 ? "opacity-60" : ""}`}>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      <code className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded tracking-wider">{c.code}</code>
                                      <button onClick={() => handleCopyCode(c.code)} className="text-gray-400 hover:text-gray-600">
                                        {copiedCode === c.code ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    {c.current_uses > 0
                                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Used</span>
                                      : c.is_active
                                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Available</span>
                                        : <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Inactive</span>}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-500">{c.current_uses}</td>
                                  <td className="px-4 py-2 text-xs text-gray-400">{fmtDate(c.valid_until)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}