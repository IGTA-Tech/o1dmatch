'use client';
// src/app/(dashboard)/dashboard/lawyer/affiliate/_AffiliateDashboard.tsx
// Also imported by lawyer affiliate page

import { useState } from 'react';
import {
  Copy, Check, TrendingUp, Users, DollarSign,
  Clock, Send, Star,
} from 'lucide-react';

interface AffiliatePartner {
  id: string;
  affiliate_code: string;
  commission_rate: number;
  status: string;
  total_referrals: number;
  total_conversions: number;
  total_earned: number;
  total_pending: number;
  total_paid: number;
  payout_email: string | null;
  payout_method: string | null;
  requires_1099: boolean;
  w9_collected: boolean;
  rejection_reason?: string | null;
  [key: string]: unknown;
}

interface Commission {
  id: string;
  gross_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  clawback_until: string | null;
  created_at: string;
  stripe_sub_id?: string | null;
  referred_user?: { full_name: string; email: string } | null;
  [key: string]: unknown;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  paid_date: string | null;
  payout_method: string | null;
  payout_reference: string | null;
}

interface Props {
  partner: AffiliatePartner;
  commissions: Commission[];
  payouts: Payout[];
  userName: string;
  commissionThisMonth: number;
  activeSubscriptions: number;
  partnerType: 'agency' | 'lawyer';
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.o1dmatch.com';

const STATUS_PILL: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  paid:     'bg-green-100 text-green-800',
  clawback: 'bg-red-100 text-red-800',
};

function anonymize(commission: Commission): string {
  const name = commission.referred_user?.full_name;
  if (!name) return 'Anonymous User';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0] + '***';
  return parts[0] + ' ' + parts[1][0] + '.';
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AffiliateDashboard({
  partner, commissions, payouts,
  commissionThisMonth, activeSubscriptions, partnerType,
}: Props) {
  const [copiedKey, setCopiedKey]       = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'overview' | 'referrals' | 'payouts'>('overview');
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dashBase = partnerType === 'agency' ? '/dashboard/agency' : '/dashboard/lawyer';

  const talentLink   = `${BASE_URL}/signup?role=talent&ref=${partner.affiliate_code}`;
  const employerLink = `${BASE_URL}/signup?role=employer&ref=${partner.affiliate_code}`;
  const generalLink  = `${BASE_URL}/signup?ref=${partner.affiliate_code}`;

  const commissionRate = Math.round(partner.commission_rate * 100);

  // ── Request payout handler ────────────────────────────────
  const handleRequestPayout = async () => {
    if (partner.total_pending < 50) return;
    setRequestingPayout(true);
    try {
      await fetch('/api/affiliate/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id }),
      });
      setPayoutRequested(true);
    } catch {}
    setRequestingPayout(false);
  };

  // ── Pending state ─────────────────────────────────────────
  if (partner.status === 'pending') {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(212,168,75,0.12)', border: '2px solid rgba(212,168,75,0.3)' }}>
          <Clock size={28} style={{ color: '#D4A84B' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h2>
        <p className="text-gray-500 text-sm">
          Your affiliate partner application is being reviewed. You&apos;ll be notified once approved.
        </p>
      </div>
    );
  }

  if (partner.status !== 'active') {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
          <TrendingUp size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account Inactive</h2>
        <p className="text-gray-500 text-sm">
          {partner.rejection_reason ?? 'Please contact support for more information.'}
        </p>
      </div>
    );
  }

  const tabs = [
    { key: 'overview',  label: 'Overview' },
    { key: 'referrals', label: `Referrals (${commissions.length})` },
    { key: 'payouts',   label: `Payouts (${payouts.length})` },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Program</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(212,168,75,0.12)', color: '#92620A', border: '1px solid rgba(212,168,75,0.25)' }}>
              <Star size={10} style={{ fill: '#D4A84B', color: '#D4A84B' }} /> Partner
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Earn {commissionRate}% commission on first payment · 30-day attribution window
          </p>
        </div>

        {/* Request payout */}
        <button
          onClick={handleRequestPayout}
          disabled={partner.total_pending < 50 || payoutRequested || requestingPayout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#0B1D35', color: '#fff' }}
          title={partner.total_pending < 50 ? `Minimum payout is $50 (you have $${fmt(partner.total_pending)} pending)` : ''}
        >
          <Send size={14} />
          {payoutRequested ? 'Request Sent ✓' : requestingPayout ? 'Sending…' : 'Request Payout'}
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Referrals',     value: partner.total_referrals,           icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Active Subscriptions',value: activeSubscriptions,               icon: TrendingUp,  color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Commission This Month',value: `$${fmt(commissionThisMonth)}`,   icon: Clock,       color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Earned',        value: `$${fmt(partner.total_earned)}`,   icon: DollarSign,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Paid',          value: `$${fmt(partner.total_paid)}`,     icon: Check,       color: 'text-teal-600',   bg: 'bg-teal-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={15} className={s.color} />
            </div>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pending balance callout ────────────────────────── */}
      {partner.total_pending > 0 && (
        <div className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
          style={{ background: 'rgba(212,168,75,0.06)', border: '1.5px solid rgba(212,168,75,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black" style={{ color: '#D4A84B' }}>
              ${fmt(partner.total_pending)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Pending balance</p>
              <p className="text-xs text-gray-500">Awaiting admin approval · Min $50 to request payout</p>
            </div>
          </div>
          {partner.total_pending >= 50 && !payoutRequested && (
            <button onClick={handleRequestPayout} disabled={requestingPayout}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ background: '#D4A84B', color: '#0B1D35' }}>
              {requestingPayout ? 'Sending…' : 'Request Payout →'}
            </button>
          )}
          {payoutRequested && (
            <span className="text-sm font-semibold text-green-600">✓ Payout request sent to admin</span>
          )}
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px transition-colors ${
              activeTab === t.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* Affiliate links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Your Referral Links</h2>
            <p className="text-xs text-gray-400 mb-4">Share these links — anyone who signs up and pays earns you {commissionRate}% commission</p>
            <div className="space-y-3">
              {[
                { label: 'Talent signup',   url: talentLink,   key: 'talent',   badge: 'Most popular' },
                { label: 'Employer signup', url: employerLink, key: 'employer', badge: null },
                { label: 'General signup',  url: generalLink,  key: 'general',  badge: null },
              ].map(link => (
                <div key={link.key} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs text-gray-400 font-medium">{link.label}</p>
                      {link.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{link.badge}</span>
                      )}
                    </div>
                    <p className="text-sm font-mono text-gray-700 truncate">{link.url}</p>
                  </div>
                  <button onClick={() => copy(link.url, link.key)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                    style={{
                      background: copiedKey === link.key ? '#16a34a' : '#0B1D35',
                      color: '#fff',
                    }}>
                    {copiedKey === link.key
                      ? <><Check size={12} /> Copied</>
                      : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              ))}
            </div>

            {/* Affiliate code */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-400">Your code:</span>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded-lg font-mono text-gray-800 font-semibold">
                {partner.affiliate_code}
              </code>
              <button onClick={() => copy(partner.affiliate_code, 'code')}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors">
                {copiedKey === 'code' ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy code</>}
              </button>
            </div>
          </div>

          {/* Commission rate card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">What you earn</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase">Plan</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase">Price</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase">Your {commissionRate}%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { plan: 'Talent — Starter',       price: 250 },
                  { plan: 'Talent — Active Match',  price: 500 },
                  { plan: 'Employer — Growth',      price: 99 },
                  { plan: 'Employer — Business',    price: 199 },
                ].map(row => (
                  <tr key={row.plan}>
                    <td className="py-2.5 text-gray-700">{row.plan}</td>
                    <td className="py-2.5 text-gray-500">${row.price}</td>
                    <td className="py-2.5 font-bold text-green-700">
                      ${(row.price * partner.commission_rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">First payment only · 30-day clawback if cancelled · $50 minimum payout</p>
          </div>

          {/* 1099 warning */}
          {partner.requires_1099 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">⚠ W-9 Required</p>
              <p className="text-sm text-amber-700 mt-1">
                You&apos;ve earned $600+ this year. A W-9 form is required before your next payout.
                {!partner.w9_collected && (
                  <a href={`${dashBase}/affiliate/w9`} className="underline font-medium ml-1">Submit W-9 →</a>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          REFERRALS TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'referrals' && (
        <div>
          {commissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
              <TrendingUp size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No referrals yet</p>
              <p className="text-gray-400 text-xs mt-1">Share your link to start earning</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'User', 'Plan', 'Commission/mo', 'Status', 'Clawback Until'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {commissions.map(c => {
                    const clawbackPassed = c.clawback_until && new Date() > new Date(c.clawback_until);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{anonymize(c)}</p>
                          <p className="text-xs text-gray-400">Referred user</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          ${c.gross_amount?.toFixed(2)} plan
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-green-700">${c.commission_amount?.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 ml-1">({Math.round(c.commission_rate * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_PILL[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {c.clawback_until ? (
                            <span className={clawbackPassed ? 'text-green-600 font-medium' : 'text-orange-500'}>
                              {new Date(c.clawback_until).toLocaleDateString()}
                              {clawbackPassed ? ' ✓' : ' (active)'}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PAYOUTS TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Earned',  value: `$${fmt(partner.total_earned)}`,  color: 'text-indigo-700' },
              { label: 'Total Pending', value: `$${fmt(partner.total_pending)}`, color: 'text-orange-600' },
              { label: 'Total Paid',    value: `$${fmt(partner.total_paid)}`,    color: 'text-green-700'  },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Payout request */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Request a Payout</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Minimum $50 · Admin processes payouts manually · Typically within 5–7 business days
                </p>
                {partner.payout_email && (
                  <p className="text-xs text-gray-500 mt-1">
                    Payout email: <span className="font-medium">{partner.payout_email}</span>
                    {partner.payout_method && ` · ${partner.payout_method}`}
                  </p>
                )}
              </div>
              <button onClick={handleRequestPayout}
                disabled={partner.total_pending < 50 || payoutRequested || requestingPayout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: '#0B1D35', color: '#fff' }}>
                <Send size={13} />
                {payoutRequested ? 'Request Sent ✓' : requestingPayout ? 'Sending…' : `Request $${fmt(partner.total_pending)}`}
              </button>
            </div>
            {partner.total_pending < 50 && partner.total_pending > 0 && (
              <p className="text-xs text-orange-500 mt-2">
                ${fmt(50 - partner.total_pending)} more needed to reach the $50 minimum
              </p>
            )}
          </div>

          {/* Payout history */}
          {payouts.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-sm">No payouts yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Payout History</h3>
              </div>
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Period', 'Amount', 'Method', 'Reference', 'Status', 'Paid Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payouts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{p.period_start} – {p.period_end}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">${fmt(p.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{p.payout_method ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{p.payout_reference ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {p.paid_date ? new Date(p.paid_date).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}