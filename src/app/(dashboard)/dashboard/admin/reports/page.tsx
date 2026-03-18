// src/app/(dashboard)/dashboard/admin/reports/page.tsx

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { ReportCharts } from './ReportCharts';

// ── helpers ───────────────────────────────────────────────────────────────────

function sinceNDays(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

/** Returns an array of YYYY-MM-DD strings for the last N days, newest last */
function buildDayRange(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function AdminReportsPage() {
  const supabase        = await createClient();
  const supabaseService = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Auth + admin guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const cutoff24h = sinceNDays(1);
  const cutoff30d = sinceNDays(30);

  // ── All queries in parallel ───────────────────────────────────────────────
  const [
    signups24hResult,
    letters24hResult,
    docs24hResult,
    active24hResult,
    visitors24hResult,
    signups30dResult,
    letters30dResult,
    docs30dResult,
    visitors30dResult,
    totalUsersResult,
  ] = await Promise.all([

    // 24h snapshots
    supabaseService.from('profiles').select('role, created_at').gte('created_at', cutoff24h),
    supabaseService.from('interest_letters').select('status, created_at').gte('created_at', cutoff24h),
    supabaseService.from('talent_documents').select('status, created_at').gte('created_at', cutoff24h),
    supabaseService.from('profiles').select('role, updated_at').gte('updated_at', cutoff24h),
    supabaseService.from('page_views').select('path, ip_address, country, city, created_at')
      .gte('created_at', cutoff24h).order('created_at', { ascending: false }).limit(300),

    // 30d for daily breakdown
    supabaseService.from('profiles').select('role, created_at').gte('created_at', cutoff30d),
    supabaseService.from('interest_letters').select('status, created_at').gte('created_at', cutoff30d),
    supabaseService.from('talent_documents').select('status, created_at').gte('created_at', cutoff30d),
    supabaseService.from('page_views').select('ip_address, created_at').gte('created_at', cutoff30d),

    // All-time totals
    supabaseService.from('profiles').select('role', { count: 'exact', head: true }),
  ]);

  // ── 24h aggregates ────────────────────────────────────────────────────────
  const signupsByRole = { talent: 0, employer: 0, agency: 0, lawyer: 0 };
  (signups24hResult.data || []).forEach((p: { role: string }) => {
    const r = p.role as keyof typeof signupsByRole;
    if (r in signupsByRole) signupsByRole[r]++;
  });

  const letterStats = { sent: 0, accepted: 0, declined: 0, draft: 0 };
  (letters24hResult.data || []).forEach((l: { status: string }) => {
    const s = l.status as keyof typeof letterStats;
    if (s in letterStats) letterStats[s]++;
  });

  const docStats = { pending: 0, verified: 0, needs_review: 0, rejected: 0 };
  (docs24hResult.data || []).forEach((d: { status: string }) => {
    const s = d.status as keyof typeof docStats;
    if (s in docStats) docStats[s]++;
  });

  const activeByRole = { talent: 0, employer: 0, agency: 0, lawyer: 0 };
  (active24hResult.data || []).forEach((p: { role: string }) => {
    const r = p.role as keyof typeof activeByRole;
    if (r in activeByRole) activeByRole[r]++;
  });

  const visitors24h   = visitors24hResult.data || [];
  const uniqueIps24h  = new Set(visitors24h.map((v: { ip_address: string }) => v.ip_address)).size;

  // Top pages (24h)
  const pageCount: Record<string, number> = {};
  visitors24h.forEach((v: { path: string }) => {
    pageCount[v.path] = (pageCount[v.path] || 0) + 1;
  });
  const topPages = Object.entries(pageCount)
    .sort(([, a], [, b]) => b - a).slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Recent unique visitors (24h)
  const seenIps = new Set<string>();
  const recentVisitors = visitors24h
    .filter((v: { ip_address: string }) => {
      if (seenIps.has(v.ip_address)) return false;
      seenIps.add(v.ip_address);
      return true;
    }).slice(0, 20);

  // ── 30-day daily breakdown ────────────────────────────────────────────────
  const days = buildDayRange(30);

  const dailyRows = days.map(dayStr => {
    const label = new Date(dayStr + 'T12:00:00Z').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });

    const signups  = (signups30dResult.data  || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
    const letters  = (letters30dResult.data  || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
    const docs     = (docs30dResult.data     || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
    const views    = (visitors30dResult.data || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
    const unique   = new Set(
      (visitors30dResult.data || [])
        .filter((r: { created_at: string }) => r.created_at.startsWith(dayStr))
        .map((r: { ip_address: string }) => r.ip_address)
    ).size;

    const acceptedLetters = (letters30dResult.data || []).filter(
      (r: { created_at: string; status: string }) => r.created_at.startsWith(dayStr) && r.status === 'accepted'
    ).length;

    // Signup breakdown by role
    const signupRoles = { talent: 0, employer: 0, agency: 0, lawyer: 0 };
    (signups30dResult.data || [])
      .filter((r: { created_at: string }) => r.created_at.startsWith(dayStr))
      .forEach((r: { role: string }) => {
        const k = r.role as keyof typeof signupRoles;
        if (k in signupRoles) signupRoles[k]++;
      });

    return { date: dayStr, label, signups, letters, acceptedLetters, docs, views, unique, signupRoles };
  });

  // ── KPI totals ─────────────────────────────────────────────────────────────
  const totalUsers = totalUsersResult.count || 0;

  const reportData = {
    generatedAt: new Date().toISOString(),
    kpis: {
      totalSignups24h:   Object.values(signupsByRole).reduce((a, b) => a + b, 0),
      totalLetters24h:   Object.values(letterStats).reduce((a, b) => a + b, 0),
      totalDocs24h:      Object.values(docStats).reduce((a, b) => a + b, 0),
      totalActive24h:    Object.values(activeByRole).reduce((a, b) => a + b, 0),
      totalPageViews24h: visitors24h.length,
      uniqueVisitors24h: uniqueIps24h,
      totalUsers,
    },
    signupsByRole,
    letterStats,
    docStats,
    activeByRole,
    topPages,
    recentVisitors,
    dailyRows,
  };

  return <ReportCharts data={reportData} />;
}