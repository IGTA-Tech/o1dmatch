'use client';
// src/app/(dashboard)/dashboard/admin/enterprise-tiers/AssignTierClient.tsx

import { useState, useMemo } from 'react';
import {
  Building2, Users, Scale, Search, CheckCircle2,
  XCircle, Loader2, ChevronDown, X, Star,
  MessageSquare, Check, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { UserRow } from './types';
import type { Tier, TierKey } from '@/lib/tiers';

type RoleFilter = 'all' | 'employer' | 'agency' | 'lawyer' | 'assigned';

export interface EnterpriseInquiry {
  id:           string;
  full_name:    string;
  company_name: string;
  email:        string;
  phone:        string | null;
  user_type:    string | null;
  interests:    string[] | null;
  message:      string | null;
  status:       string;
  notes:        string | null;
  created_at:   string;
  updated_at:   string | null;
}

const INQUIRY_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  new:       { label: 'New',       bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8' },
  contacted: { label: 'Contacted', bg: 'rgba(245,158,11,0.1)', color: '#B45309' },
  qualified: { label: 'Qualified', bg: 'rgba(16,185,129,0.1)', color: '#065F46' },
  closed:    { label: 'Closed',    bg: 'rgba(100,116,139,0.1)',color: '#334155' },
  spam:      { label: 'Spam',      bg: 'rgba(239,68,68,0.1)',  color: '#991B1B' },
};

const USER_TYPE_LABELS: Record<string, string> = {
  employer:             'Employer',
  immigration_attorney: 'Immigration Attorney',
  staffing_agency:      'Staffing Agency',
};

const ROLE_ICON: Record<string, React.ElementType> = {
  employer: Building2,
  agency:   Users,
  lawyer:   Scale,
};

const ROLE_LABEL: Record<string, string> = {
  employer: 'Employer',
  agency:   'Staffing Agency',
  lawyer:   'Attorney',
};

/* Tiers available per role — agency has two */
const ROLE_TIERS: Record<string, TierKey[]> = {
  employer: ['managed_enterprise'],
  agency:   ['agency_professional', 'agency_enterprise'],
  lawyer:   ['attorney_partner'],
};

/* ─────────────────────────────────────────────────────────
   Tier badge (supports null or a single key)
───────────────────────────────────────────────────────── */
function TierBadge({ tierKey, tiers }: { tierKey: string; tiers: Record<TierKey, Tier> }) {
  const tier = tiers[tierKey as TierKey];
  const isPartner = tierKey === 'attorney_partner';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.65rem', borderRadius: 100,
      fontSize: '0.72rem', fontWeight: 600,
      background: isPartner ? 'rgba(212,168,75,0.1)' : 'rgba(16,185,129,0.1)',
      color: isPartner ? '#92620A' : '#065F46',
      border: isPartner ? '1px solid rgba(212,168,75,0.3)' : '1px solid rgba(16,185,129,0.25)',
    }}>
      {isPartner && <Star size={10} style={{ fill: '#D4A84B', color: '#D4A84B' }} />}
      {tier?.name ?? tierKey}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Assign modal
───────────────────────────────────────────────────────── */
function AssignModal({
  user,
  tiers,
  onClose,
  onSuccess,
}: {
  user: UserRow;
  tiers: Record<TierKey, Tier>;
  onClose: () => void;
  onSuccess: (userId: string, tierKeys: string[], isPartner: boolean) => void;
}) {
  const availableTierKeys = ROLE_TIERS[user.role] ?? [];
  const isMulti           = availableTierKeys.length > 1;

  // For multi-tier roles (agency): checkboxes — start from currently assigned
  // For single-tier roles: radio-style single selection
  const [selectedKeys, setSelectedKeys] = useState<TierKey[]>(
    (user.assigned_tiers ?? []) as TierKey[]
  );
  const [removeAll, setRemoveAll] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const toggleKey = (key: TierKey) => {
    setRemoveAll(false);
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectSingle = (key: TierKey) => {
    setRemoveAll(false);
    setSelectedKeys([key]);
  };

  const currentlyAssigned = user.assigned_tiers ?? [];
  const hasChanged = removeAll
    ? currentlyAssigned.length > 0
    : JSON.stringify([...selectedKeys].sort()) !== JSON.stringify([...currentlyAssigned].sort());

  const handleAssign = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/assign-enterprise-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:   user.id,
          tierKeys: removeAll ? [] : selectedKeys,
          role:     user.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Assignment failed');
      const newKeys      = removeAll ? [] : selectedKeys;
      const newIsPartner = newKeys.includes('attorney_partner' as TierKey);
      onSuccess(user.id, newKeys, newIsPartner);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(11,29,53,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 480,
          padding: '1.75rem', position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            {(() => { const Icon = ROLE_ICON[user.role] ?? Building2; return <Icon size={16} style={{ color: '#D4A84B' }} />; })()}
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4A84B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {ROLE_LABEL[user.role]}
            </p>
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#0B1D35', margin: 0 }}>
            {user.full_name || user.email}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>{user.email}</p>
        </div>

        {/* Currently assigned */}
        {currentlyAssigned.length > 0 && (
          <div style={{
            padding: '0.65rem 1rem', borderRadius: 10, marginBottom: '1.25rem',
            background: '#F8FAFC', border: '1px solid #E2E8F0',
          }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>
              Currently assigned
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentlyAssigned.map((key) => (
                <TierBadge key={key} tierKey={key} tiers={tiers} />
              ))}
            </div>
          </div>
        )}

        {/* Tier selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            {isMulti
              ? 'Select plans to assign (can select both)'
              : 'Select tier to assign'}
          </p>

          {/* Multi-select hint for agency */}
          {isMulti && (
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
              Check one or both plans — the user will have access to all checked plans.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {availableTierKeys.map((key) => {
              const tier       = tiers[key];
              const isChecked  = selectedKeys.includes(key) && !removeAll;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => isMulti ? toggleKey(key) : selectSingle(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1rem', borderRadius: 10, cursor: 'pointer',
                    border: isChecked ? '2px solid #D4A84B' : '1.5px solid #E2E8F0',
                    background: isChecked ? 'rgba(212,168,75,0.05)' : '#FFFFFF',
                    textAlign: 'left', transition: 'all 0.15s', width: '100%',
                  }}
                >
                  {/* Checkbox / radio visual */}
                  <div style={{
                    width: 20, height: 20, borderRadius: isMulti ? 5 : '50%',
                    border: isChecked ? '2px solid #D4A84B' : '2px solid #CBD5E1',
                    background: isChecked ? '#D4A84B' : '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {isChecked && (
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="#0B1D35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  {/* Tier info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0B1D35' }}>
                      {tier.name}
                      {key === 'attorney_partner' && (
                        <Star size={12} style={{ display: 'inline', marginLeft: '0.4rem', color: '#D4A84B', fill: '#D4A84B' }} />
                      )}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>
                      {tier.price === 0 ? 'Free' : `$${tier.price.toLocaleString()}/month`}
                      {tier.stripePriceId && (
                        <span style={{ marginLeft: '0.5rem', color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          {tier.stripePriceId}
                        </span>
                      )}
                    </p>
                  </div>

                  {!isMulti && isChecked && (
                    <CheckCircle2 size={18} style={{ color: '#D4A84B', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}

            {/* Remove all (only if something is assigned) */}
            {currentlyAssigned.length > 0 && (
              <button
                type="button"
                onClick={() => { setRemoveAll(true); setSelectedKeys([]); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                  border: removeAll ? '2px solid #EF4444' : '1.5px solid #E2E8F0',
                  background: removeAll ? 'rgba(239,68,68,0.04)' : '#FFFFFF',
                  textAlign: 'left', transition: 'all 0.15s', width: '100%',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5,
                  border: removeAll ? '2px solid #EF4444' : '2px solid #CBD5E1',
                  background: removeAll ? '#EF4444' : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}>
                  {removeAll && <XCircle size={12} style={{ color: '#FFFFFF' }} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#DC2626' }}>
                    Remove all tier assignments
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                    Revert user to standard plan
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.85rem', color: '#DC2626',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 10,
              border: '1.5px solid #E2E8F0', background: '#FFFFFF',
              fontSize: '0.88rem', fontWeight: 600, color: '#64748B',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !hasChanged}
            style={{
              flex: 2, padding: '0.75rem', borderRadius: 10,
              border: 'none',
              background: removeAll ? '#EF4444' : '#D4A84B',
              color: removeAll ? '#FFFFFF' : '#0B1D35',
              fontSize: '0.88rem', fontWeight: 700,
              cursor: loading || !hasChanged ? 'not-allowed' : 'pointer',
              opacity: loading || !hasChanged ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.15s',
            }}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
              : removeAll
              ? 'Remove All Tiers'
              : `Assign ${selectedKeys.length > 1 ? `${selectedKeys.length} Plans` : 'Tier'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main client component
───────────────────────────────────────────────────────── */
export default function AssignTierClient({
  users: initialUsers,
  tiers,
  inquiries: initialInquiries,
}: {
  users:     UserRow[];
  tiers:     Record<TierKey, Tier>;
  inquiries: EnterpriseInquiry[];
}) {
  const PAGE_SIZE = 50;

  const [users, setUsers]               = useState<UserRow[]>(initialUsers);
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>('all');
  const [search, setSearch]             = useState('');
  const [modal, setModal]               = useState<UserRow | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);

  // ── Inquiries state ──
  const [mainTab, setMainTab]             = useState<'users' | 'inquiries'>('users');
  const [inquiries, setInquiries]         = useState<EnterpriseInquiry[]>(initialInquiries);
  const [inqStatusFilter, setInqStatusFilter] = useState<string>('all');
  const [inqUserTypeFilter, setInqUserTypeFilter] = useState<string>('all');
  const [inqSearch, setInqSearch]         = useState('');
  const [editingInquiry, setEditingInquiry] = useState<string | null>(null);
  const [editNotes, setEditNotes]         = useState('');
  const [editStatus, setEditStatus]       = useState('');
  const [savingInquiry, setSavingInquiry] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'all'      ? true
                      : roleFilter === 'assigned' ? (u.assigned_tiers ?? []).length > 0
                      : u.role === roleFilter;
      const matchSearch = !search || [u.full_name, u.email, u.company_name, u.law_firm]
        .some((v) => v?.toLowerCase().includes(search.toLowerCase()));
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageStart  = (safePage - 1) * PAGE_SIZE;
  const paginated  = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const handleRoleFilter = (f: RoleFilter) => { setRoleFilter(f); setCurrentPage(1); };
  const handleSearch     = (v: string)      => { setSearch(v);     setCurrentPage(1); };

  const handleSuccess = (userId: string, tierKeys: string[], isPartner: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, assigned_tiers: tierKeys, assigned_tier: tierKeys[0] ?? null, is_partner: isPartner }
          : u
      )
    );
  };

  const counts = {
    employer: users.filter((u) => u.role === 'employer').length,
    agency:   users.filter((u) => u.role === 'agency').length,
    lawyer:   users.filter((u) => u.role === 'lawyer').length,
    assigned: users.filter((u) => (u.assigned_tiers ?? []).length > 0).length,
  };

  // ── Filtered inquiries ──
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => {
      const matchStatus   = inqStatusFilter   === 'all' || i.status    === inqStatusFilter;
      const matchUserType = inqUserTypeFilter === 'all' || i.user_type === inqUserTypeFilter;
      const matchSearch   = !inqSearch || [i.full_name, i.company_name, i.email]
        .some(v => v?.toLowerCase().includes(inqSearch.toLowerCase()));
      return matchStatus && matchUserType && matchSearch;
    });
  }, [inquiries, inqStatusFilter, inqUserTypeFilter, inqSearch]);

  // ── Save inquiry status + notes ──
  const handleSaveInquiry = async (id: string) => {
    setSavingInquiry(true);
    try {
      await fetch('/api/admin/enterprise-inquiry', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, status: editStatus, notes: editNotes }),
      });
      setInquiries(prev => prev.map(i =>
        i.id === id ? { ...i, status: editStatus, notes: editNotes } : i
      ));
      setEditingInquiry(null);
    } catch { /* silent */ }
    finally { setSavingInquiry(false); }
  };

  return (
    <>
      {/* ── Main tab switcher ── */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1.5px solid #E2E8F0', marginBottom: '1.5rem' }}>
        {[
          { key: 'users',     label: 'Users',                                       icon: Users        },
          { key: 'inquiries', label: `Inquiries (${inquiries.length})`,             icon: MessageSquare},
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setMainTab(key as 'users' | 'inquiries')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600,
              borderBottom: mainTab === key ? '2px solid #D4A84B' : '2px solid transparent',
              color: mainTab === key ? '#92620A' : '#64748B',
              background: 'none', border: 'none',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1.5px',
            }}>
            <Icon size={15} /> {label}
            {key === 'inquiries' && inquiries.filter(i => i.status === 'new').length > 0 && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                borderRadius: 100, background: '#EF4444', color: '#fff',
              }}>
                {inquiries.filter(i => i.status === 'new').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ USERS TAB ══════════════════════════════════════════ */}
      {mainTab === 'users' && (
      <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Employers',      value: counts.employer, icon: Building2,   color: 'text-blue-600',   bg: 'bg-blue-50',   filter: 'employer' as RoleFilter },
          { label: 'Agencies',       value: counts.agency,   icon: Users,       color: 'text-purple-600', bg: 'bg-purple-50', filter: 'agency'   as RoleFilter },
          { label: 'Attorneys',      value: counts.lawyer,   icon: Scale,       color: 'text-indigo-600', bg: 'bg-indigo-50', filter: 'lawyer'   as RoleFilter },
          { label: 'Tiers Assigned', value: counts.assigned, icon: CheckCircle2,color: 'text-green-600',  bg: 'bg-green-50',  filter: 'assigned' as RoleFilter },
        ].map(({ label, value, icon: Icon, color, bg, filter }) => (
          <button
            key={label}
            onClick={() => handleRoleFilter(filter)}
            className={`text-left w-full ${roleFilter === filter ? 'ring-2 ring-[#D4A84B]' : ''}`}
            style={{ borderRadius: 12, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1rem', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className={`p-2 ${bg} rounded-lg w-fit`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <CardTitle>Users</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search name or email…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    paddingLeft: '2.25rem', paddingRight: '0.75rem',
                    paddingTop: '0.5rem', paddingBottom: '0.5rem',
                    border: '1.5px solid #E2E8F0', borderRadius: 8,
                    fontSize: '0.85rem', color: '#0B1D35', outline: 'none',
                    width: 220,
                  }}
                />
              </div>
              {/* Role filter */}
              <div style={{ position: 'relative' }}>
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilter(e.target.value as RoleFilter)}
                  style={{
                    appearance: 'none', paddingLeft: '0.75rem', paddingRight: '2rem',
                    paddingTop: '0.5rem', paddingBottom: '0.5rem',
                    border: '1.5px solid #E2E8F0', borderRadius: 8,
                    fontSize: '0.85rem', color: '#0B1D35', outline: 'none',
                    cursor: 'pointer', background: '#FFFFFF',
                  }}
                >
                  <option value="all">All roles</option>
                  <option value="employer">Employers</option>
                  <option value="agency">Agencies</option>
                  <option value="lawyer">Attorneys</option>
                  <option value="assigned">Tiers Assigned</option>
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {paginated.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {['User', 'Role', 'Company / Firm', 'Assigned Tiers', 'Joined', 'Action'].map((h) => (
                      <th key={h} style={{
                        padding: '0.6rem 0.75rem', textAlign: 'left',
                        fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u) => {
                    const Icon = ROLE_ICON[u.role] ?? Building2;
                    const assignedTiers = u.assigned_tiers ?? [];
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        {/* User */}
                        <td style={{ padding: '0.75rem' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#0B1D35' }}>
                              {u.full_name || '—'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>{u.email}</p>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.2rem 0.6rem', borderRadius: 100,
                            fontSize: '0.72rem', fontWeight: 600,
                            background: '#F8FAFC', color: '#475569',
                            border: '1px solid #E2E8F0',
                          }}>
                            <Icon size={11} />
                            {ROLE_LABEL[u.role] ?? u.role}
                          </span>
                        </td>

                        {/* Company / Firm */}
                        <td style={{ padding: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                          {u.company_name || u.law_firm || <span style={{ color: '#CBD5E1' }}>—</span>}
                        </td>

                        {/* Assigned tiers — supports multiple */}
                        <td style={{ padding: '0.75rem' }}>
                          {assignedTiers.length === 0 ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '0.2rem 0.6rem', borderRadius: 100,
                              fontSize: '0.72rem', fontWeight: 600,
                              background: '#F1F5F9', color: '#94A3B8',
                            }}>
                              No tier
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {assignedTiers.map((key) => (
                                <TierBadge key={key} tierKey={key} tiers={tiers} />
                              ))}
                              {u.is_partner && !assignedTiers.includes('attorney_partner') && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                  fontSize: '0.68rem', color: '#D4A84B', fontWeight: 600,
                                }}>
                                  <Star size={10} style={{ fill: '#D4A84B' }} /> Partner
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Joined */}
                        <td style={{ padding: '0.75rem', color: '#94A3B8', fontSize: '0.82rem' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        {/* Action */}
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => setModal(u)}
                            style={{
                              padding: '0.4rem 0.85rem',
                              border: '1.5px solid #D4A84B', borderRadius: 7,
                              background: '#FFFFFF', color: '#92620A',
                              fontSize: '0.8rem', fontWeight: 600,
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = '#D4A84B';
                              (e.currentTarget as HTMLButtonElement).style.color = '#0B1D35';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                              (e.currentTarget as HTMLButtonElement).style.color = '#92620A';
                            }}
                          >
                            {assignedTiers.length > 0 ? 'Change Tiers' : 'Assign Tier'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '1rem', marginTop: '0.5rem',
              borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                Showing{' '}
                <strong style={{ color: '#475569' }}>
                  {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)}
                </strong>
                {' '}of{' '}
                <strong style={{ color: '#475569' }}>{filtered.length}</strong>
                {' '}users
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 7, border: '1.5px solid #E2E8F0', background: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: safePage === 1 ? 'not-allowed' : 'pointer', opacity: safePage === 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                {(() => {
                  const pages: (number | '…')[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (safePage > 3) pages.push('…');
                    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
                    if (safePage < totalPages - 2) pages.push('…');
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    p === '…' ? (
                      <span key={`e-${idx}`} style={{ padding: '0 0.25rem', color: '#94A3B8', fontSize: '0.82rem' }}>…</span>
                    ) : (
                      <button key={p} onClick={() => setCurrentPage(p as number)} style={{ width: 34, height: 34, borderRadius: 7, border: safePage === p ? '2px solid #D4A84B' : '1.5px solid #E2E8F0', background: safePage === p ? '#D4A84B' : '#FFFFFF', color: safePage === p ? '#0B1D35' : '#475569', fontSize: '0.82rem', fontWeight: safePage === p ? 700 : 500, cursor: 'pointer' }}>
                        {p}
                      </button>
                    )
                  );
                })()}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 7, border: '1.5px solid #E2E8F0', background: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', opacity: safePage === totalPages ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {modal && (
        <AssignModal
          user={modal}
          tiers={tiers}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      </>
      )} {/* end users tab */}

      {/* ══ INQUIRIES TAB ══════════════════════════════════════ */}
      {mainTab === 'inquiries' && (
        <div className="space-y-4">

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input type="text" placeholder="Search name, company, email…"
                value={inqSearch} onChange={e => setInqSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.85rem', color: '#0B1D35', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <select value={inqStatusFilter} onChange={e => setInqStatusFilter(e.target.value)}
                style={{ appearance: 'none', paddingLeft: '0.75rem', paddingRight: '2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.85rem', color: '#0B1D35', outline: 'none', cursor: 'pointer', background: '#FFFFFF' }}>
                <option value="all">All statuses</option>
                {Object.entries(INQUIRY_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            </div>
            {/* User type filter */}
            <div style={{ position: 'relative' }}>
              <select value={inqUserTypeFilter} onChange={e => setInqUserTypeFilter(e.target.value)}
                style={{ appearance: 'none', paddingLeft: '0.75rem', paddingRight: '2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.85rem', color: '#0B1D35', outline: 'none', cursor: 'pointer', background: '#FFFFFF' }}>
                <option value="all">All types</option>
                {Object.entries(USER_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
              {filteredInquiries.length} of {inquiries.length}
            </p>
          </div>

          {/* Inquiries list */}
          {filteredInquiries.length === 0 ? (
            <div style={{ background: '#fff', border: '1px dashed #E2E8F0', borderRadius: 12, padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
              <MessageSquare size={28} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No inquiries found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInquiries.map(inq => {
                const isEditing = editingInquiry === inq.id;
                const st = INQUIRY_STATUS_LABELS[inq.status] ?? INQUIRY_STATUS_LABELS['new'];
                return (
                  <Card key={inq.id}>
                    <CardContent>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                        {/* Left: inquiry details */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0B1D35' }}>{inq.full_name}</p>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 100, background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                            {inq.user_type && (
                              <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: 100, background: 'rgba(212,168,75,0.1)', color: '#92620A', fontWeight: 600 }}>
                                {USER_TYPE_LABELS[inq.user_type] ?? inq.user_type}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#475569' }}>
                            {inq.company_name} · <a href={`mailto:${inq.email}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>{inq.email}</a>
                            {inq.phone && ` · ${inq.phone}`}
                          </p>
                          {inq.interests && inq.interests.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                              {inq.interests.map(interest => (
                                <span key={interest} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 100, background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>
                                  {interest.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                          {inq.message && (
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, borderLeft: '3px solid #E2E8F0', paddingLeft: '0.6rem' }}>
                              {inq.message}
                            </p>
                          )}
                          {inq.notes && !isEditing && (
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: '#0B1D35', background: 'rgba(212,168,75,0.07)', border: '1px solid rgba(212,168,75,0.2)', borderRadius: 7, padding: '0.4rem 0.6rem' }}>
                              📝 {inq.notes}
                            </p>
                          )}
                          <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                            {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Right: edit panel or action button */}
                        <div style={{ flexShrink: 0 }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: 220 }}>
                              {/* Status select */}
                              <div style={{ position: 'relative' }}>
                                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                                  style={{ width: '100%', appearance: 'none', paddingLeft: '0.65rem', paddingRight: '1.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', border: '1.5px solid #E2E8F0', borderRadius: 7, fontSize: '0.82rem', color: '#0B1D35', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                                  {Object.entries(INQUIRY_STATUS_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>
                                <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                              </div>
                              {/* Notes textarea */}
                              <textarea
                                rows={3}
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                                placeholder="Add internal notes…"
                                style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1.5px solid #E2E8F0', borderRadius: 7, fontSize: '0.82rem', color: '#0B1D35', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                              />
                              {/* Save / cancel */}
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={() => handleSaveInquiry(inq.id)} disabled={savingInquiry}
                                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem', borderRadius: 7, background: '#0B1D35', color: '#fff', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: savingInquiry ? 'not-allowed' : 'pointer', opacity: savingInquiry ? 0.6 : 1 }}>
                                  {savingInquiry ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
                                  Save
                                </button>
                                <button onClick={() => setEditingInquiry(null)}
                                  style={{ padding: '0.45rem 0.75rem', borderRadius: 7, background: '#F1F5F9', color: '#475569', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingInquiry(inq.id); setEditStatus(inq.status); setEditNotes(inq.notes ?? ''); }}
                              style={{ padding: '0.4rem 0.85rem', border: '1.5px solid #D4A84B', borderRadius: 7, background: '#FFFFFF', color: '#92620A', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Update
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}