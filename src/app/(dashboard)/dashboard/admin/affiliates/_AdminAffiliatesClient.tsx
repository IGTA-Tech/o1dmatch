'use client';
// src/app/(dashboard)/dashboard/admin/affiliates/_AdminAffiliatesClient.tsx

import { useState, useTransition } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface Stats {
  totalPartners: number; activePartners: number; pendingApplications: number;
  pendingCommissions: number; readyToApprove: number; totalEarned: number; totalPending: number;
}
interface Partner {
  id: string; user_id: string; affiliate_code: string; partner_type: string;
  commission_rate: number; status: string; total_referrals: number;
  total_conversions: number; total_earned: number; total_pending: number;
  total_paid: number; payout_email: string | null; payout_method: string | null;
  profile?: { full_name: string | null; email: string } | null;
  [key: string]: unknown;
}
interface Commission {
  id: string; affiliate_id: string; referred_user_id: string;
  gross_amount: number; commission_amount: number; commission_rate: number;
  status: string; clawback_until: string | null; created_at: string;
  affiliate?: { affiliate_code: string; profile?: { full_name: string | null; email: string } | null } | null;
  referred_user?: { full_name: string | null; email: string } | null;
  [key: string]: unknown;
}
interface Payout {
  id: string; partner_id: string; amount: number; status: string;
  period_start: string; period_end: string;
  partner?: { affiliate_code: string; payout_email: string | null; payout_method: string | null; profile?: { full_name: string | null; email: string } | null } | null;
  [key: string]: unknown;
}
interface Props {
  partners: Partner[]; commissions: Commission[]; payouts: Payout[];
  activeTab: string; stats: Stats;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  active:    'bg-green-100 text-green-800',
  approved:  'bg-blue-100 text-blue-800',
  paid:      'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  inactive:  'bg-gray-100 text-gray-500',
  clawback:  'bg-red-100 text-red-700',
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] ?? 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

// ── Helper: call the admin affiliates API route ───────────────
async function adminAction(body: Record<string, unknown>): Promise<{ success: boolean; error?: string; count?: number }> {
  const res = await fetch('/api/admin/affiliates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function AdminAffiliatesClient({
  partners: initialPartners, commissions: initialCommissions,
  payouts: initialPayouts, activeTab, stats,
}: Props) {
  const [tab, setTab]                 = useState(activeTab);
  const [partners, setPartners]       = useState(initialPartners);
  const [commissions, setCommissions] = useState(initialCommissions);
  const [payouts, setPayouts]         = useState(initialPayouts);
  const [isPending, startTransition]  = useTransition();
  const [toast, setToast]             = useState<string | null>(null);
  const [payoutRefs, setPayoutRefs]   = useState<Record<string, string>>({});
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [newRate, setNewRate]         = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null); // per-row spinner
  const [selectedCommissions, setSelectedCommissions] = useState<Set<string>>(new Set());
  const [selectedPayouts, setSelectedPayouts]         = useState<Set<string>>(new Set());
  const [bulkRef, setBulkRef]                         = useState('');
  const [bulkApproving, setBulkApproving]             = useState(false);
  const [bulkPaying, setBulkPaying]                   = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Approveble commissions (pending + clawback passed) ──
  const approvableCommissions = commissions.filter(
    c => c.status === 'pending' && c.clawback_until && new Date() > new Date(c.clawback_until)
  );

  // ── Bulk approve selected commissions ──
  const handleBulkApproveSelected = async () => {
    if (selectedCommissions.size === 0) return;
    if (!confirm(`Approve ${selectedCommissions.size} selected commission${selectedCommissions.size > 1 ? 's' : ''}?`)) return;
    setBulkApproving(true);
    const ids = Array.from(selectedCommissions);
    let approved = 0;
    const newPayouts: Payout[] = [];
    for (const id of ids) {
      const res = await adminAction({ action: 'approve_commission', commissionId: id }) as { success: boolean; payout?: Payout; error?: string };
      if (res.success) {
        approved++;
        if (res.payout) newPayouts.push(res.payout);
      }
    }
    setCommissions(prev => prev.map(c => selectedCommissions.has(c.id) ? { ...c, status: 'approved' } : c));
    if (newPayouts.length > 0) setPayouts(prev => [...newPayouts, ...prev]);
    setSelectedCommissions(new Set());
    setBulkApproving(false);
    showToast(`✓ ${approved} commission${approved > 1 ? 's' : ''} approved — ${newPayouts.length} payout${newPayouts.length > 1 ? 's' : ''} created`);
  };

  // ── Bulk mark payouts paid ──
  const handleBulkMarkPaid = async () => {
    if (selectedPayouts.size === 0) return;
    if (!bulkRef.trim()) { showToast('Enter a reference for all selected payouts'); return; }
    if (!confirm(`Mark ${selectedPayouts.size} payout${selectedPayouts.size > 1 ? 's' : ''} as paid with reference "${bulkRef}"?`)) return;
    setBulkPaying(true);
    const ids = Array.from(selectedPayouts);
    let paid = 0;
    for (const id of ids) {
      const res = await adminAction({ action: 'mark_payout_paid', payoutId: id, reference: bulkRef });
      if (res.success) paid++;
    }
    setPayouts(prev => prev.filter(p => !selectedPayouts.has(p.id)));
    setSelectedPayouts(new Set());
    setBulkRef('');
    setBulkPaying(false);
    showToast(`✓ ${paid} payout${paid > 1 ? 's' : ''} marked as paid`);
  };

  // ── Partner: approve/suspend ──
  const handlePartnerStatus = (id: string, status: 'active' | 'suspended' | 'inactive') => {
    startTransition(async () => {
      const res = await adminAction({ action: 'update_partner_status', partnerId: id, status });
      if (res.success) {
        setPartners(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        showToast(`Partner ${status}`);
      } else {
        showToast(`Error: ${res.error}`);
      }
    });
  };

  // ── Commission rate edit ──
  const handleRateUpdate = (id: string) => {
    const rate = parseFloat(newRate) / 100;
    if (isNaN(rate) || rate <= 0 || rate > 1) return;
    startTransition(async () => {
      const res = await adminAction({ action: 'update_commission_rate', partnerId: id, rate });
      if (res.success) {
        setPartners(prev => prev.map(p => p.id === id ? { ...p, commission_rate: rate } : p));
        setEditingRate(null);
        showToast('Rate updated');
      } else {
        showToast(`Error: ${res.error}`);
      }
    });
  };

  // ── Bulk approve ──
  const handleBulkApprove = () => {
    if (!confirm('Approve all pending commissions where the 30-day clawback period has ended?')) return;
    startTransition(async () => {
      const res = await adminAction({ action: 'bulk_approve' });
      if (res.success) {
        showToast(`✓ ${res.count ?? 0} commissions approved`);
        // Mark approved in local state
        setCommissions(prev => prev.map(c =>
          c.status === 'pending' && c.clawback_until && new Date() > new Date(c.clawback_until)
            ? { ...c, status: 'approved' }
            : c
        ));
      } else {
        showToast(`Error: ${res.error}`);
      }
    });
  };

  // ── Approve single commission — auto-creates a pending payout ──
  const handleApproveCommission = (id: string) => {
    setApprovingId(id);
    startTransition(async () => {
      const res = await adminAction({ action: 'approve_commission', commissionId: id }) as { success: boolean; payout?: Payout; error?: string };
      setApprovingId(null);
      if (res.success) {
        setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
        if (res.payout) {
          const newPayout = res.payout;
          setPayouts(prev => [newPayout, ...prev]);
          showToast('✓ Commission approved — pending payout created');
        } else {
          showToast('Commission approved');
        }
      } else {
        showToast(`Error: ${res.error}`);
      }
    });
  };

  // ── Mark payout paid ──
  const handleMarkPaid = (payoutId: string) => {
    const ref = payoutRefs[payoutId]?.trim();
    if (!ref) return alert('Enter a payout reference first.');
    startTransition(async () => {
      const res = await adminAction({ action: 'mark_payout_paid', payoutId, reference: ref });
      if (res.success) {
        setPayouts(prev => prev.filter(p => p.id !== payoutId));
        showToast('Payout marked as paid ✓');
      } else {
        showToast(`Error: ${res.error}`);
      }
    });
  };

  // ── Export CSV ──
  const handleExportCSV = () => {
    const rows = [
      ['Partner Name', 'Partner Email', 'Affiliate Code', 'Amount', 'Payout Email', 'Payout Method'],
      ...payouts.map((p: Payout) => [
        p.partner?.profile?.full_name ?? '',
        p.partner?.profile?.email ?? '',
        p.partner?.affiliate_code ?? '',
        p.amount?.toFixed(2) ?? '0',
        p.partner?.payout_email ?? '',
        p.partner?.payout_method ?? '',
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = `affiliate-payouts-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const TABS = [
    { key: 'partners',    label: `Partners (${partners.length})` },
    { key: 'commissions', label: `Commissions (${commissions.length})`, badge: stats.readyToApprove },
    { key: 'payouts',     label: `Pending Payouts (${payouts.length})`, badge: payouts.length > 0 ? payouts.length : undefined },
  ];

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Partners</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage partners, commissions, and payouts</p>
        </div>
        <div className="flex gap-2">
          {stats.readyToApprove > 0 && (
            <button onClick={handleBulkApprove} disabled={isPending}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
              ✓ Bulk Approve ({stats.readyToApprove})
            </button>
          )}
          <button onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Partners',     value: stats.totalPartners,       color: 'text-gray-900' },
          { label: 'Active',       value: stats.activePartners,      color: 'text-green-700' },
          { label: 'Pending Apps', value: stats.pendingApplications, color: 'text-yellow-700', alert: stats.pendingApplications > 0 },
          { label: 'Pending Comm', value: stats.pendingCommissions,  color: 'text-orange-700' },
          { label: 'Ready Approve',value: stats.readyToApprove,      color: 'text-blue-700', alert: stats.readyToApprove > 0 },
          { label: 'Total Earned', value: `$${stats.totalEarned.toFixed(0)}`, color: 'text-indigo-700' },
          { label: 'Total Pending',value: `$${stats.totalPending.toFixed(0)}`, color: 'text-orange-700' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border p-3 ${s.alert ? 'border-yellow-300' : 'border-gray-200'}`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold -mb-px transition-colors relative ${
              tab === t.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {t.label}
            {t.badge ? (
              <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── PARTNERS TAB ── */}
      {tab === 'partners' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Partner', 'Code', 'Type', 'Rate', 'Referrals', 'Earned', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{p.profile?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{p.profile?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{p.affiliate_code}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.partner_type}</td>
                  <td className="px-4 py-3">
                    {editingRate === p.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="1" max="100" value={newRate} onChange={e => setNewRate(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRateUpdate(p.id); if (e.key === 'Escape') setEditingRate(null); }}
                          autoFocus className="w-14 text-xs border border-blue-400 rounded px-1.5 py-1 focus:outline-none" />
                        <span className="text-xs">%</span>
                        <button onClick={() => handleRateUpdate(p.id)} className="text-green-600 text-sm">✓</button>
                        <button onClick={() => setEditingRate(null)} className="text-red-400 text-sm">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingRate(p.id); setNewRate(String(Math.round(p.commission_rate * 100))); }}
                        className="text-sm font-semibold text-blue-700 hover:underline">
                        {Math.round(p.commission_rate * 100)}% <span className="text-gray-300 text-xs">✎</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.total_referrals}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${(p.total_earned ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.status === 'pending' && (
                        <button onClick={() => handlePartnerStatus(p.id, 'active')} disabled={isPending}
                          className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-50">Approve</button>
                      )}
                      {p.status === 'active' && (
                        <button onClick={() => handlePartnerStatus(p.id, 'suspended')} disabled={isPending}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50">Suspend</button>
                      )}
                      {p.status === 'suspended' && (
                        <button onClick={() => handlePartnerStatus(p.id, 'active')} disabled={isPending}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50">Reinstate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!partners.length && (
            <div className="text-center py-12 text-gray-400 text-sm">No affiliate partners yet.</div>
          )}
        </div>
      )}

      {/* ── COMMISSIONS TAB ── */}
      {tab === 'commissions' && (
        <div className="space-y-3">
          {/* Bulk toolbar — shows when rows are selected */}
          {selectedCommissions.size > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-blue-700">
                {selectedCommissions.size} selected
              </span>
              <button
                onClick={handleBulkApproveSelected}
                disabled={bulkApproving}
                className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {bulkApproving ? (
                  <><svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg> Approving…</>
                ) : `✓ Approve ${selectedCommissions.size} selected`}
              </button>
              <button
                onClick={() => setSelectedCommissions(new Set())}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={approvableCommissions.length > 0 && approvableCommissions.every(c => selectedCommissions.has(c.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedCommissions(new Set(approvableCommissions.map(c => c.id)));
                      } else {
                        setSelectedCommissions(new Set());
                      }
                    }}
                    title="Select all approvable commissions"
                  />
                </th>
                {['Referred User', 'Partner', 'Payment', 'Commission', 'Clawback Until', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((c: Commission) => {
                const clawbackPassed = c.clawback_until && new Date() > new Date(c.clawback_until);
                const canSelect = c.status === 'pending' && !!clawbackPassed;
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 ${selectedCommissions.has(c.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      {canSelect && (
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedCommissions.has(c.id)}
                          onChange={e => {
                            setSelectedCommissions(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) { next.add(c.id); } else { next.delete(c.id); }
                              return next;
                            });
                          }}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{c.referred_user?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{c.referred_user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{c.affiliate?.profile?.full_name ?? '—'}</p>
                      <code className="text-xs text-gray-400">{c.affiliate?.affiliate_code}</code>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">${c.gross_amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-green-700">${c.commission_amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{Math.round(c.commission_rate * 100)}%</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {c.clawback_until ? (
                        <span className={clawbackPassed ? 'text-green-600 font-medium' : 'text-orange-500'}>
                          {new Date(c.clawback_until).toLocaleDateString()}
                          {clawbackPassed ? ' ✓' : ' (active)'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                    <td className="px-4 py-3">
                      {c.status === 'pending' && clawbackPassed && (
                        <button
                          onClick={() => handleApproveCommission(c.id)}
                          disabled={approvingId === c.id || isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:underline disabled:opacity-70 disabled:no-underline"
                        >
                          {approvingId === c.id ? (
                            <>
                              <svg className="animate-spin w-3 h-3 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                              </svg>
                              Approving…
                            </>
                          ) : (
                            'Approve'
                          )}
                        </button>
                      )}
                      {c.status === 'pending' && !clawbackPassed && (
                        <span className="text-xs text-gray-400 italic">In clawback</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!commissions.length && (
            <div className="text-center py-12 text-gray-400 text-sm">No commissions found.</div>
          )}
        </div>
        </div>
      )}

      {/* ── PAYOUTS TAB ── */}
      {tab === 'payouts' && (
        <div className="space-y-3">

          {/* Bulk mark paid toolbar */}
          {payouts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 flex-wrap shadow-sm">
              <input
                type="checkbox"
                className="rounded"
                checked={payouts.length > 0 && payouts.every(p => selectedPayouts.has(p.id))}
                onChange={e => {
                  if (e.target.checked) setSelectedPayouts(new Set(payouts.map(p => p.id)));
                  else setSelectedPayouts(new Set());
                }}
              />
              <span className="text-sm text-gray-600 font-medium">
                {selectedPayouts.size > 0 ? `${selectedPayouts.size} selected` : 'Select all'}
              </span>
              {selectedPayouts.size > 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Bulk reference (PayPal batch, check #)"
                    value={bulkRef}
                    onChange={e => setBulkRef(e.target.value)}
                    className="text-sm border border-gray-300 rounded-xl px-3 py-2 flex-1 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleBulkMarkPaid}
                    disabled={bulkPaying || !bulkRef.trim()}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {bulkPaying ? (
                      <><svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg> Marking paid…</>
                    ) : `✓ Mark ${selectedPayouts.size} as Paid`}
                  </button>
                  <button onClick={() => { setSelectedPayouts(new Set()); setBulkRef(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline">
                    Clear
                  </button>
                </>
              )}
            </div>
          )}

          {payouts.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400 text-sm">
              No pending payouts.
            </div>
          ) : (
            payouts.map((p: Payout) => (
              <div key={p.id} className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-colors ${selectedPayouts.has(p.id) ? 'border-green-300 bg-green-50' : ''}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="rounded flex-shrink-0"
                    checked={selectedPayouts.has(p.id)}
                    onChange={e => {
                      setSelectedPayouts(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) { next.add(p.id); } else { next.delete(p.id); }
                        return next;
                      });
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900">{p.partner?.profile?.full_name ?? '—'}</p>
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.partner?.affiliate_code}</code>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                      <span>Email: {p.partner?.payout_email ?? '—'}</span>
                      <span>Method: {p.partner?.payout_method ?? '—'}</span>
                      <span>Period: {p.period_start} → {p.period_end}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-900">${p.amount.toFixed(2)}</span>
                    <input
                      type="text"
                      placeholder="Reference (PayPal tx, check #)"
                      value={payoutRefs[p.id] ?? ''}
                      onChange={e => setPayoutRefs(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-xl px-3 py-2 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => handleMarkPaid(p.id)} disabled={isPending}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                      Mark Paid
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}