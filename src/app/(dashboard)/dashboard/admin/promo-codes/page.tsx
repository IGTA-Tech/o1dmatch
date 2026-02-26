// src/app/(dashboard)/dashboard/admin/promo-codes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Ticket,
  Loader2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Calendar,
  Users,
  Percent,
  Clock,
  Shield,
  Tag,
  ChevronDown,
  ChevronUp,
  Gift,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PromoCode {
  id: string;
  code: string;
  type: string;
  description: string | null;
  trial_days: number;
  discount_percent: number;
  grants_igta_member: boolean;
  applicable_tier: string | null;
  applicable_user_type: string | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  code: string;
  type: string;
  description: string;
  trial_days: number;
  discount_percent: number;
  grants_igta_member: boolean;
  applicable_tier: string;
  applicable_user_type: string;
  max_uses: string;
  max_uses_per_user: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const defaultForm: FormData = {
  code: "",
  type: "trial",
  description: "",
  trial_days: 14,
  discount_percent: 0,
  grants_igta_member: false,
  applicable_tier: "",
  applicable_user_type: "both",
  max_uses: "",
  max_uses_per_user: "1",
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: "",
  is_active: true,
};

const typeOptions = [
  { value: "trial", label: "Free Trial", icon: Clock, color: "blue" },
  { value: "discount", label: "Discount", icon: Percent, color: "green" },
  { value: "igta_verification", label: "IGTA Verification", icon: Shield, color: "purple" },
  { value: "free_upgrade", label: "Free Upgrade", icon: Gift, color: "amber" },
];

const tierOptions = [
  { value: "", label: "Any Tier" },
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "enterprise", label: "Enterprise" },
];

const userTypeOptions = [
  { value: "both", label: "Both" },
  { value: "employer", label: "Employer" },
  { value: "talent", label: "Talent" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function typeBadge(type: string) {
  const cfg = typeOptions.find((t) => t.value === type);
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
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
  ];
  return segments.join("-");
}

/* ================================================================== */
/*  PAGE                                                                */
/* ================================================================== */
export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<"created_at" | "code" | "current_uses">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ---------- Load promo codes ---------- */
  const loadPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes");
      const json = await res.json();
      if (json.success) setPromoCodes(json.promoCodes || []);
      else setError(json.error || "Failed to load promo codes");
    } catch {
      setError("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromoCodes();
  }, [loadPromoCodes]);

  /* ---------- Create ---------- */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.code.trim()) {
      setError("Promo code is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        description: form.description.trim() || null,
        trial_days: form.type === "trial" ? form.trial_days : 0,
        discount_percent: form.type === "discount" ? form.discount_percent : 0,
        grants_igta_member: form.type === "igta_verification" ? true : form.grants_igta_member,
        applicable_tier: form.applicable_tier || null,
        applicable_user_type: form.applicable_user_type,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        max_uses_per_user: form.max_uses_per_user ? parseInt(form.max_uses_per_user) : 1,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        is_active: form.is_active,
      };

      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(`Promo code "${json.promoCode.code}" created successfully!`);
        setForm(defaultForm);
        setShowForm(false);
        loadPromoCodes();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(json.error || "Failed to create promo code");
      }
    } catch {
      setError("Failed to create promo code");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Toggle Active ---------- */
  const handleToggle = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      const json = await res.json();
      if (json.success) {
        setPromoCodes((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
        );
      }
    } catch {
      setError("Failed to toggle promo code");
    } finally {
      setTogglingId(null);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promo-codes?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPromoCodes((prev) => prev.filter((p) => p.id !== id));
        setSuccess(`Promo code "${code}" deleted`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to delete promo code");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Copy Code ---------- */
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ---------- Sort ---------- */
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 opacity-30" />
    );

  /* ---------- Filter & Sort ---------- */
  const filtered = promoCodes
    .filter((p) => {
      if (filterType !== "all" && p.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.code.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "code") return a.code.localeCompare(b.code) * dir;
      if (sortField === "current_uses") return (a.current_uses - b.current_uses) * dir;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });

  const activeCount = promoCodes.filter((p) => p.is_active).length;
  const totalUses = promoCodes.reduce((sum, p) => sum + p.current_uses, 0);

  /* ================================================================ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            Promo Codes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage promotional codes for subscriptions
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            if (!showForm) setForm(defaultForm);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            showForm
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Create Promo Code"}
        </button>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ---- Create Form ---- */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Promo Code
            </h2>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-5">
            {/* Row 1: Code + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promo Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WELCOME-2026"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase tracking-wider"
                    maxLength={50}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, code: generateCode() })}
                    className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Uppercase, alphanumeric, hyphens, underscores
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setForm({ ...form, type: opt.value })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.type === opt.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Welcome offer for new employers — 30 day free trial"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Conditional fields based on type */}
            {form.type === "trial" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Trial Duration (days)
                </label>
                <input
                  type="number"
                  value={form.trial_days}
                  onChange={(e) => setForm({ ...form, trial_days: parseInt(e.target.value) || 0 })}
                  min={1}
                  max={365}
                  className="w-32 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            )}

            {form.type === "discount" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-green-800 mb-1">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Discount Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })}
                    min={1}
                    max={100}
                    className="w-32 px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white"
                  />
                  <span className="text-sm text-green-700 font-medium">%</span>
                </div>
              </div>
            )}

            {form.type === "igta_verification" && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-800">
                  <Shield className="w-4 h-4 inline mr-1" />
                  This code will grant IGTA member verification status to users who redeem it.
                </p>
              </div>
            )}

            {form.type === "free_upgrade" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <Gift className="w-4 h-4 inline mr-1" />
                  This code will grant a free tier upgrade to users who redeem it.
                </p>
              </div>
            )}

            {/* Row 3: Tier + User Type + Max Uses + Max Per User */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicable Tier
                </label>
                <select
                  value={form.applicable_tier}
                  onChange={(e) => setForm({ ...form, applicable_tier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {tierOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  value={form.applicable_user_type}
                  onChange={(e) => setForm({ ...form, applicable_user_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {userTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Total Uses
                </label>
                <input
                  type="number"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Unlimited"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank for unlimited</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses Per User
                </label>
                <input
                  type="number"
                  value={form.max_uses_per_user}
                  onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })}
                  placeholder="Unlimited"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Defaults to 1 if left blank</p>
              </div>
            </div>

            {/* Row 4: Valid dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Valid From
                </label>
                <input
                  type="date"
                  value={form.valid_from}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Valid Until
                </label>
                <input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank for no expiry</p>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.is_active ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.is_active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                {form.is_active ? "Active immediately" : "Save as inactive (draft)"}
              </span>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(defaultForm);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !form.code.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Creating..." : "Create Promo Code"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Stats Row ---- */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Tag className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{promoCodes.length}</p>
            <p className="text-xs text-gray-500">Total Codes</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <ToggleRight className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalUses}</p>
            <p className="text-xs text-gray-500">Total Redemptions</p>
          </div>
        </div>
      </div>

      {/* ---- Filter + Search Bar ---- */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All ({promoCodes.length})
            </button>
            {typeOptions.map((opt) => {
              const count = promoCodes.filter((p) => p.type === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === opt.value
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {opt.label} ({count})
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search codes..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={loadPromoCodes}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ---- Table ---- */}
        {loading && promoCodes.length === 0 ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading promo codes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {search || filterType !== "all" ? "No matching promo codes found" : "No promo codes yet"}
            </p>
            {!showForm && !search && filterType === "all" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create your first promo code
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    <button onClick={() => toggleSort("code")} className="flex items-center gap-1 hover:text-gray-700">
                      Code <SortIcon field="code" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Details</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">For</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">
                    <button onClick={() => toggleSort("current_uses")} className="flex items-center gap-1 hover:text-gray-700 mx-auto">
                      Uses <SortIcon field="current_uses" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Valid</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((promo) => {
                  const isExpired = promo.valid_until && new Date(promo.valid_until) < new Date();
                  const isMaxed = promo.max_uses !== null && promo.current_uses >= promo.max_uses;

                  return (
                    <tr
                      key={promo.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        !promo.is_active || isExpired || isMaxed ? "opacity-60" : ""
                      }`}
                    >
                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs tracking-wider">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => handleCopy(promo.code, promo.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            {copiedId === promo.id ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {promo.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                            {promo.description}
                          </p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">{typeBadge(promo.type)}</td>

                      {/* Details */}
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600">
                        {promo.type === "trial" && <span>{promo.trial_days} days</span>}
                        {promo.type === "discount" && <span>{promo.discount_percent}% off</span>}
                        {promo.type === "igta_verification" && <span>IGTA Badge</span>}
                        {promo.type === "free_upgrade" && (
                          <span>{promo.applicable_tier ? `→ ${promo.applicable_tier}` : "Upgrade"}</span>
                        )}
                      </td>

                      {/* User Type */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500 capitalize">
                          {promo.applicable_user_type || "Both"}
                          {promo.applicable_tier && (
                            <span className="block text-gray-400">{promo.applicable_tier}</span>
                          )}
                        </span>
                      </td>

                      {/* Uses */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${isMaxed ? "text-red-600" : "text-gray-700"}`}>
                          {promo.current_uses}
                          {promo.max_uses !== null && (
                            <span className="text-gray-400"> / {promo.max_uses}</span>
                          )}
                          {promo.max_uses === null && (
                            <span className="text-gray-400"> / ∞</span>
                          )}
                        </span>
                        {promo.max_uses_per_user !== null && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {promo.max_uses_per_user}x per user
                          </span>
                        )}
                      </td>

                      {/* Valid dates */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-gray-500">
                          <span>{fmtDate(promo.valid_from)}</span>
                          {promo.valid_until && (
                            <span className={isExpired ? "text-red-500" : ""}>
                              {" → "}{fmtDate(promo.valid_until)}
                            </span>
                          )}
                          {!promo.valid_until && <span className="text-gray-400"> → No expiry</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {isExpired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Expired
                          </span>
                        ) : isMaxed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                            Maxed
                          </span>
                        ) : promo.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggle(promo.id, promo.is_active)}
                            disabled={togglingId === promo.id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              promo.is_active
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                            title={promo.is_active ? "Deactivate" : "Activate"}
                          >
                            {togglingId === promo.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : promo.is_active ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id, promo.code)}
                            disabled={deletingId === promo.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            {deletingId === promo.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}