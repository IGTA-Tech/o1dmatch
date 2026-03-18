'use client';
// src/app/(dashboard)/dashboard/admin/reports/ReportCharts.tsx

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  Users, FileText, Upload, Activity, Globe,
  TrendingUp, Eye, MapPin, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';

// ── colour tokens ────────────────────────────────────────────────────────────
const NAVY   = '#0B1D35';
const GOLD   = '#D4A84B';
const GOLD2  = '#E8C97A';
const SLATE  = '#64748B';
const GREEN  = '#22C55E';
const RED    = '#EF4444';
const YELLOW = '#F59E0B';
const BLUE   = '#3B82F6';
const PURPLE = '#A78BFA';

const ROLE_COLORS: Record<string, string> = {
  talent: GOLD, employer: BLUE, agency: PURPLE, lawyer: GREEN,
};
const STATUS_COLORS: Record<string, string> = {
  sent: BLUE, accepted: GREEN, declined: RED, draft: SLATE,
  pending: YELLOW, verified: GREEN, needs_review: YELLOW, rejected: RED,
};

// ── Types ────────────────────────────────────────────────────────────────────
interface DailyRow {
  date:            string;
  label:           string;
  signups:         number;
  letters:         number;
  acceptedLetters: number;
  docs:            number;
  views:           number;
  unique:          number;
  signupRoles:     Record<string, number>;
}

interface ReportData {
  generatedAt: string;
  kpis: {
    totalSignups24h:    number;
    totalLetters24h:    number;
    totalDocs24h:       number;
    totalActive24h:     number;
    totalPageViews24h:  number;
    uniqueVisitors24h:  number;
    totalUsers:         number;
  };
  signupsByRole:   Record<string, number>;
  letterStats:     Record<string, number>;
  docStats:        Record<string, number>;
  activeByRole:    Record<string, number>;
  topPages:        { path: string; count: number }[];
  recentVisitors:  { ip_address: string; country: string | null; city: string | null; path: string; created_at: string }[];
  dailyRows:       DailyRow[];
}

// ── shared components ────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = GOLD }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color?: string;
}) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #E2D9CC', borderRadius: 14,
      padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
      boxShadow: '0 1px 4px rgba(11,29,53,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} style={{ color }} />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: SLATE, letterSpacing: '0.03em', textTransform: 'uppercase' as const }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: NAVY, lineHeight: 1.1, fontFamily: "'Playfair Display', serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.75rem', color: SLATE }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #E2D9CC', borderRadius: 14,
      padding: '1.5rem', boxShadow: '0 1px 4px rgba(11,29,53,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1EDE6',
      }}>
        <Icon size={16} style={{ color: GOLD }} />
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: NAVY, margin: 0, letterSpacing: '0.02em' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: NAVY, border: `1px solid ${GOLD}40`, borderRadius: 8,
      padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: '#fff',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      {label && <p style={{ margin: '0 0 4px', color: GOLD2, fontWeight: 600 }}>{label}</p>}
      {payload.map((e) => (
        <p key={e.name} style={{ margin: '2px 0', color: e.color || '#fff' }}>
          {e.name}: <strong>{e.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── delta badge ───────────────────────────────────────────────────────────────
function Delta({ curr, prev }: { curr: number; prev: number }) {
  if (prev === 0 && curr === 0) return <span style={{ color: SLATE, fontSize: '0.72rem' }}>—</span>;
  const diff = curr - prev;
  const color = diff > 0 ? GREEN : diff < 0 ? RED : SLATE;
  const sign  = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color }}>
      {sign} {Math.abs(diff)}
    </span>
  );
}

// ── main export ───────────────────────────────────────────────────────────────
export function ReportCharts({ data }: { data: ReportData }) {
  const { kpis, signupsByRole, letterStats, docStats, activeByRole, topPages, recentVisitors, dailyRows } = data;
  const [tableRows, setTableRows] = useState(14); // initially show 14 days
  const [sortAsc, setSortAsc]     = useState(false); // newest first by default

  const generatedAt = new Date(data.generatedAt).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // Chart arrays
  const signupChartData = Object.entries(signupsByRole).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1), count, fill: ROLE_COLORS[role] || GOLD,
  }));
  const letterChartData = Object.entries(letterStats).filter(([, v]) => v > 0).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1), value, fill: STATUS_COLORS[status] || SLATE,
  }));
  const docChartData = Object.entries(docStats).map(([status, count]) => ({
    status: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), count, fill: STATUS_COLORS[status] || SLATE,
  }));
  const activeChartData = Object.entries(activeByRole).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1), count, fill: ROLE_COLORS[role] || GOLD,
  }));

  // 30-day chart — use every other label to avoid overlap
  const chartRows = dailyRows.map((r, i) => ({
    label:   i % 4 === 0 ? r.label : '', // show label every 4 days
    Signups: r.signups,
    Letters: r.letters,
    Docs:    r.docs,
    Views:   r.views,
    fullLabel: r.label,
  }));

  // Table sorted + limited
  const sortedRows = sortAsc ? [...dailyRows] : [...dailyRows].reverse();
  const visibleRows = sortedRows.slice(0, tableRows);

  // Running totals for summary row
  const totals = dailyRows.reduce((acc, r) => ({
    signups: acc.signups + r.signups,
    letters: acc.letters + r.letters,
    acceptedLetters: acc.acceptedLetters + r.acceptedLetters,
    docs:    acc.docs    + r.docs,
    views:   acc.views   + r.views,
    unique:  acc.unique  + r.unique,
  }), { signups: 0, letters: 0, acceptedLetters: 0, docs: 0, views: 0, unique: 0 });

  return (
    <div style={{ background: '#FBF8F1', minHeight: '100vh', padding: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <TrendingUp size={20} style={{ color: GOLD }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: NAVY, margin: 0 }}>
              Platform Report
            </h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: SLATE, margin: 0 }}>
            Generated {generatedAt}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            padding: '0.4rem 0.9rem', borderRadius: 100,
            background: `${GOLD}15`, border: `1px solid ${GOLD}40`,
            fontSize: '0.75rem', fontWeight: 700, color: GOLD, letterSpacing: '0.06em',
          }}>LAST 24H SNAPSHOT</span>
          <span style={{
            padding: '0.4rem 0.9rem', borderRadius: 100,
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            fontSize: '0.75rem', fontWeight: 700, color: '#166534',
          }}>{kpis.totalUsers.toLocaleString()} TOTAL USERS</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard icon={Users}    label="New Signups"     value={kpis.totalSignups24h}   sub="Last 24 hours"   color={GOLD}   />
        <KpiCard icon={FileText} label="Letters"         value={kpis.totalLetters24h}   sub="Last 24 hours"   color={BLUE}   />
        <KpiCard icon={Upload}   label="Documents"       value={kpis.totalDocs24h}      sub="Last 24 hours"   color={GREEN}  />
        <KpiCard icon={Activity} label="Active Users"    value={kpis.totalActive24h}    sub="Last 24 hours"   color={PURPLE} />
        <KpiCard icon={Eye}      label="Page Views"      value={kpis.totalPageViews24h} sub="Last 24 hours"   color={BLUE}   />
        <KpiCard icon={Globe}    label="Unique Visitors" value={kpis.uniqueVisitors24h} sub="Distinct IPs"    color={GREEN}  />
      </div>

      {/* ── 30-day multi-metric line chart ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <SectionCard title="30-Day Activity Overview — Signups, Letters, Documents, Page Views" icon={Calendar}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.78rem', color: SLATE }}>{v}</span>} />
              <Line type="monotone" dataKey="Signups" stroke={GOLD}   strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Letters" stroke={BLUE}   strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Docs"    stroke={GREEN}  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Views"   stroke={PURPLE} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Daily Breakdown Table ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <SectionCard title="Day-by-Day Breakdown (Last 30 Days)" icon={Calendar}>

          {/* 30-day totals summary strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem',
            marginBottom: '1.25rem', padding: '0.9rem 1rem',
            background: `${GOLD}08`, border: `1px solid ${GOLD}25`, borderRadius: 10,
          }}>
            {[
              { label: '30d Signups',  value: totals.signups,         color: GOLD },
              { label: '30d Letters',  value: totals.letters,         color: BLUE },
              { label: '30d Accepted', value: totals.acceptedLetters, color: GREEN },
              { label: '30d Docs',     value: totals.docs,            color: GREEN },
              { label: '30d Views',    value: totals.views,           color: PURPLE },
              { label: '30d Unique',   value: totals.unique,          color: BLUE },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color, fontFamily: "'Playfair Display', serif" }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: SLATE, marginTop: 2, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Sort toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.35rem 0.75rem', borderRadius: 6, cursor: 'pointer',
                background: `${GOLD}10`, border: `1px solid ${GOLD}30`,
                fontSize: '0.75rem', fontWeight: 600, color: NAVY,
              }}
            >
              {sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {sortAsc ? 'Oldest first' : 'Newest first'}
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${GOLD}30` }}>
                  {['Date', 'Signups', '↳ Talent', '↳ Employer', '↳ Agency', '↳ Lawyer', 'Letters', 'Accepted', 'Documents', 'Page Views', 'Unique Visitors', 'vs prev day'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.5rem 0.7rem',
                      fontSize: '0.7rem', fontWeight: 700, color: SLATE,
                      letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => {
                  // Find previous day for delta (respecting sort direction)
                  const allSorted = sortAsc ? dailyRows : [...dailyRows].reverse();
                  const rowIndexInAll = allSorted.findIndex(r => r.date === row.date);
                  const prevRow = allSorted[rowIndexInAll + 1];
                  const todayTotal = row.signups + row.letters + row.docs;
                  const prevTotal  = prevRow ? prevRow.signups + prevRow.letters + prevRow.docs : 0;

                  const isToday = row.date === new Date().toISOString().split('T')[0];
                  const isEven  = idx % 2 === 0;

                  return (
                    <tr
                      key={row.date}
                      style={{
                        background: isToday ? `${GOLD}08` : isEven ? '#FAFAF8' : '#FFFFFF',
                        borderBottom: '1px solid #F1EDE6',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '0.5rem 0.7rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, color: NAVY }}>{row.label}</span>
                          {isToday && (
                            <span style={{
                              fontSize: '0.62rem', fontWeight: 700, color: GOLD,
                              background: `${GOLD}15`, padding: '1px 5px', borderRadius: 4,
                            }}>TODAY</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: SLATE }}>{row.date}</div>
                      </td>
                      <td style={{ padding: '0.5rem 0.7rem', fontWeight: 700, color: row.signups > 0 ? NAVY : SLATE }}>{row.signups || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.signupRoles.talent  > 0 ? GOLD   : SLATE }}>{row.signupRoles.talent   || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.signupRoles.employer > 0 ? BLUE   : SLATE }}>{row.signupRoles.employer  || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.signupRoles.agency  > 0 ? PURPLE : SLATE }}>{row.signupRoles.agency   || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.signupRoles.lawyer  > 0 ? GREEN  : SLATE }}>{row.signupRoles.lawyer   || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', fontWeight: row.letters > 0 ? 600 : 400, color: row.letters > 0 ? NAVY : SLATE }}>{row.letters || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.acceptedLetters > 0 ? GREEN : SLATE }}>{row.acceptedLetters || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.docs > 0 ? NAVY : SLATE }}>{row.docs || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.views > 0 ? NAVY : SLATE }}>{row.views || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem', color: row.unique > 0 ? BLUE : SLATE }}>{row.unique || '—'}</td>
                      <td style={{ padding: '0.5rem 0.7rem' }}>
                        {prevRow
                          ? <Delta curr={todayTotal} prev={prevTotal} />
                          : <span style={{ color: SLATE, fontSize: '0.72rem' }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show more / less */}
          {dailyRows.length > 14 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              {tableRows < 30 ? (
                <button
                  onClick={() => setTableRows(30)}
                  style={{
                    padding: '0.45rem 1.25rem', borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', border: `1.5px solid ${GOLD}40`,
                    fontSize: '0.8rem', fontWeight: 600, color: GOLD,
                  }}
                >
                  Show all 30 days
                </button>
              ) : (
                <button
                  onClick={() => setTableRows(14)}
                  style={{
                    padding: '0.45rem 1.25rem', borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', border: `1.5px solid #E2D9CC`,
                    fontSize: '0.8rem', fontWeight: 600, color: SLATE,
                  }}
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row: Signups by role + Letter status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <SectionCard title="New Signups by Role (24h)" icon={Users}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signupChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE6" vertical={false} />
              <XAxis dataKey="role" tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Signups" radius={[6, 6, 0, 0]}>
                {signupChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Interest Letters (24h)" icon={FileText}>
          {letterChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={letterChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {letterChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.78rem', color: SLATE }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: SLATE, fontSize: '0.85rem' }}>
              No letters in the last 24 hours
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row: Docs + Active users ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <SectionCard title="Documents Uploaded (24h)" icon={Upload}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={docChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE6" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Documents" radius={[6, 6, 0, 0]}>
                {docChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Active Users by Role (24h)" icon={Activity}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activeChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE6" vertical={false} />
              <XAxis dataKey="role" tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Active users" radius={[6, 6, 0, 0]}>
                {activeChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Row: Top pages + Recent visitors ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem', marginBottom: '2rem' }}>
        <SectionCard title="Top Pages (24h)" icon={Eye}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topPages.length === 0 && <p style={{ color: SLATE, fontSize: '0.82rem' }}>No page views recorded yet.</p>}
            {topPages.map(({ path, count }, i) => {
              const pct = topPages[0]?.count ? Math.round((count / topPages[0].count) * 100) : 0;
              return (
                <div key={path}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.78rem', color: NAVY, fontWeight: 500, maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i + 1}. {path}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY }}>{count}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: '#F1EDE6', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: GOLD, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Recent Unique Visitors (24h)" icon={MapPin}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  {['IP Address', 'Country', 'City', 'Last Page', 'Time'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.4rem 0.6rem', color: SLATE,
                      fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em',
                      textTransform: 'uppercase' as const, borderBottom: '1px solid #F1EDE6',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentVisitors.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '1rem 0.6rem', color: SLATE, textAlign: 'center' }}>No visitors recorded yet.</td></tr>
                )}
                {recentVisitors.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F9F6F1' }}>
                    <td style={{ padding: '0.45rem 0.6rem', color: NAVY, fontFamily: 'monospace', fontSize: '0.75rem' }}>{v.ip_address || '—'}</td>
                    <td style={{ padding: '0.45rem 0.6rem', color: NAVY }}>{v.country || '—'}</td>
                    <td style={{ padding: '0.45rem 0.6rem', color: SLATE }}>{v.city || '—'}</td>
                    <td style={{ padding: '0.45rem 0.6rem', color: SLATE, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.path}</td>
                    <td style={{ padding: '0.45rem 0.6rem', color: SLATE, whiteSpace: 'nowrap' }}>
                      {new Date(v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '1rem 1.25rem', borderRadius: 10,
        background: `${GOLD}08`, border: `1px solid ${GOLD}25`,
        fontSize: '0.78rem', color: SLATE,
      }}>
        <strong style={{ color: NAVY }}>Note:</strong> Active users approximated by profile updates in last 24h.
        Visitor geo requires an <a href="https://ipinfo.io" style={{ color: GOLD }}>ipinfo.io</a> token in middleware.
        Page refreshes to latest data on each visit.
      </div>
    </div>
  );
}