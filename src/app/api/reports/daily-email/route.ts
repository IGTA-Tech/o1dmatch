// src/app/api/reports/daily-email/route.ts
//
// Triggered daily by Vercel Cron (see vercel.json).
// Can also be called manually: POST /api/reports/daily-email
// Protected by CRON_SECRET so only Vercel (or you) can trigger it.

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const REPORT_EMAIL  = 'applications@innovativeglobaltalent.agency';
const REPORT_NAME   = 'O1DMatch Daily Report';

// ── Email transporter (same SMTP config as send-for-review route) ────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST     || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function sinceNDays(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function buildDayRange(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
}

function fmt(n: number): string {
  return n > 0 ? String(n) : '—';
}

function delta(curr: number, prev: number): string {
  if (prev === 0 && curr === 0) return '—';
  const diff = curr - prev;
  if (diff > 0) return `▲ ${diff}`;
  if (diff < 0) return `▼ ${Math.abs(diff)}`;
  return '→ 0';
}

function deltaColor(curr: number, prev: number): string {
  const diff = curr - prev;
  if (diff > 0) return '#16a34a';
  if (diff < 0) return '#dc2626';
  return '#64748b';
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Security: verify cron secret so this can't be triggered publicly
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseService = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const cutoff24h = sinceNDays(1);
  const cutoff30d = sinceNDays(30);

  try {
    // ── Fetch all data in parallel ──────────────────────────────────────────
    const [
      signups24h,
      letters24h,
      docs24h,
      active24h,
      visitors24h,
      signups30d,
      letters30d,
      docs30d,
      visitors30d,
      totalUsersRes,
    ] = await Promise.all([
      supabaseService.from('profiles').select('role, created_at').gte('created_at', cutoff24h),
      supabaseService.from('interest_letters').select('status, created_at').gte('created_at', cutoff24h),
      supabaseService.from('talent_documents').select('status, created_at').gte('created_at', cutoff24h),
      supabaseService.from('profiles').select('role, updated_at').gte('updated_at', cutoff24h),
      supabaseService.from('page_views').select('ip_address, path, created_at').gte('created_at', cutoff24h),
      supabaseService.from('profiles').select('role, created_at').gte('created_at', cutoff30d),
      supabaseService.from('interest_letters').select('status, created_at').gte('created_at', cutoff30d),
      supabaseService.from('talent_documents').select('status, created_at').gte('created_at', cutoff30d),
      supabaseService.from('page_views').select('ip_address, created_at').gte('created_at', cutoff30d),
      supabaseService.from('profiles').select('role', { count: 'exact', head: true }),
    ]);

    // ── 24h KPIs ─────────────────────────────────────────────────────────────
    const signupsByRole = { talent: 0, employer: 0, agency: 0, lawyer: 0 };
    (signups24h.data || []).forEach((p: { role: string }) => {
      const r = p.role as keyof typeof signupsByRole;
      if (r in signupsByRole) signupsByRole[r]++;
    });

    const letterStats = { sent: 0, accepted: 0, declined: 0, draft: 0 };
    (letters24h.data || []).forEach((l: { status: string }) => {
      const s = l.status as keyof typeof letterStats;
      if (s in letterStats) letterStats[s]++;
    });

    const docStats = { pending: 0, verified: 0, needs_review: 0, rejected: 0 };
    (docs24h.data || []).forEach((d: { status: string }) => {
      const s = d.status as keyof typeof docStats;
      if (s in docStats) docStats[s]++;
    });

    const activeByRole = { talent: 0, employer: 0, agency: 0, lawyer: 0 };
    (active24h.data || []).forEach((p: { role: string }) => {
      const r = p.role as keyof typeof activeByRole;
      if (r in activeByRole) activeByRole[r]++;
    });

    const v24h        = visitors24h.data || [];
    const uniqueIps   = new Set(v24h.map((v: { ip_address: string }) => v.ip_address)).size;
    const totalSignups = Object.values(signupsByRole).reduce((a, b) => a + b, 0);
    const totalLetters = Object.values(letterStats).reduce((a, b) => a + b, 0);
    const totalDocs    = Object.values(docStats).reduce((a, b) => a + b, 0);
    const totalActive  = Object.values(activeByRole).reduce((a, b) => a + b, 0);
    const totalUsers   = totalUsersRes.count || 0;

    // ── 30-day daily rows (last 7 shown in email, rest as totals) ────────────
    const days = buildDayRange(30);

    interface DayRow {
      date: string; label: string;
      signups: number; letters: number; acceptedLetters: number;
      docs: number; views: number; unique: number;
    }

    const dailyRows: DayRow[] = days.map(dayStr => {
      const label = new Date(dayStr + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const signups  = (signups30d.data  || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
      const letters  = (letters30d.data  || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
      const docs     = (docs30d.data     || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
      const views    = (visitors30d.data || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).length;
      const unique   = new Set(
        (visitors30d.data || []).filter((r: { created_at: string }) => r.created_at.startsWith(dayStr)).map((r: { ip_address: string }) => r.ip_address)
      ).size;
      const acceptedLetters = (letters30d.data || []).filter(
        (r: { created_at: string; status: string }) => r.created_at.startsWith(dayStr) && r.status === 'accepted'
      ).length;
      return { date: dayStr, label, signups, letters, acceptedLetters, docs, views, unique };
    });

    // Last 7 days for the email table (newest first)
    const last7 = [...dailyRows].reverse().slice(0, 7);

    // Yesterday vs day before for trend arrows in KPI section
    const yesterday    = dailyRows[dailyRows.length - 1];
    const dayBefore    = dailyRows[dailyRows.length - 2];

    // 30-day totals
    const totals30d = dailyRows.reduce((acc, r) => ({
      signups: acc.signups + r.signups,
      letters: acc.letters + r.letters,
      docs:    acc.docs    + r.docs,
      views:   acc.views   + r.views,
    }), { signups: 0, letters: 0, docs: 0, views: 0 });

    // ── Build HTML email ──────────────────────────────────────────────────────
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.o1dmatch.com';

    const kpiRow = (label: string, value: number, prev: number, color: string) => `
      <td style="padding:12px 10px; text-align:center; border-right:1px solid #e2d9cc;">
        <div style="font-size:28px; font-weight:800; color:${color}; font-family:'Georgia',serif; line-height:1;">${value}</div>
        <div style="font-size:11px; color:#64748b; margin-top:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">${label}</div>
        <div style="font-size:11px; font-weight:700; color:${deltaColor(value, prev)}; margin-top:3px;">${delta(value, prev)} vs prev 24h</div>
      </td>`;

    const dailyTableRows = last7.map((row, i) => {
      const isToday = row.date === new Date().toISOString().split('T')[0];
      const bg = isToday ? '#fffbf0' : i % 2 === 0 ? '#fafaf8' : '#ffffff';
      return `
        <tr style="background:${bg};">
          <td style="padding:9px 12px; font-weight:${isToday ? '700' : '400'}; color:#0b1d35; white-space:nowrap; border-bottom:1px solid #f1ede6;">
            ${row.label}${isToday ? ' <span style="font-size:10px;background:#d4a84b;color:#0b1d35;padding:1px 5px;border-radius:3px;font-weight:700;">TODAY</span>' : ''}
          </td>
          <td style="padding:9px 12px; text-align:center; color:${row.signups > 0 ? '#0b1d35' : '#94a3b8'}; border-bottom:1px solid #f1ede6;">${fmt(row.signups)}</td>
          <td style="padding:9px 12px; text-align:center; color:${row.letters > 0 ? '#3b82f6' : '#94a3b8'}; border-bottom:1px solid #f1ede6;">${fmt(row.letters)}</td>
          <td style="padding:9px 12px; text-align:center; color:${row.acceptedLetters > 0 ? '#16a34a' : '#94a3b8'}; border-bottom:1px solid #f1ede6;">${fmt(row.acceptedLetters)}</td>
          <td style="padding:9px 12px; text-align:center; color:${row.docs > 0 ? '#0b1d35' : '#94a3b8'}; border-bottom:1px solid #f1ede6;">${fmt(row.docs)}</td>
          <td style="padding:9px 12px; text-align:center; color:${row.views > 0 ? '#6366f1' : '#94a3b8'}; border-bottom:1px solid #f1ede6;">${fmt(row.views)}</td>
          <td style="padding:9px 12px; text-align:center; color:${row.unique > 0 ? '#3b82f6' : '#94a3b8'}; border-bottom:1px solid #f1ede6;">${fmt(row.unique)}</td>
        </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:#0b1d35;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center;">
      <div style="display:inline-block;background:rgba(212,168,75,0.15);border:1px solid rgba(212,168,75,0.3);border-radius:100px;padding:5px 14px;margin-bottom:14px;">
        <span style="font-size:11px;color:#e8c97a;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Daily Platform Report</span>
      </div>
      <h1 style="font-family:'Georgia',serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 6px;">O1DMatch</h1>
      <p style="font-size:14px;color:rgba(255,255,255,0.55);margin:0;">${reportDate}</p>
    </div>

    <!-- Gold bar -->
    <div style="height:4px;background:linear-gradient(90deg,#d4a84b,#e8c97a,#d4a84b);"></div>

    <!-- Body -->
    <div style="background:#ffffff;border:1px solid #e2d9cc;border-top:none;border-radius:0 0 14px 14px;overflow:hidden;">

      <!-- Total users banner -->
      <div style="background:#f9f6f1;border-bottom:1px solid #e2d9cc;padding:14px 32px;text-align:center;">
        <span style="font-size:13px;color:#64748b;">Total registered users: </span>
        <span style="font-size:18px;font-weight:800;color:#0b1d35;font-family:'Georgia',serif;">${totalUsers.toLocaleString()}</span>
      </div>

      <!-- 24h KPI section -->
      <div style="padding:24px 32px 0;">
        <h2 style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 14px;">Last 24 Hours</h2>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2d9cc;border-bottom:1px solid #e2d9cc;">
        <tr>
          ${kpiRow('New Signups',    totalSignups, dayBefore?.signups || 0,      '#d4a84b')}
          ${kpiRow('Letters Sent',   totalLetters, dayBefore?.letters || 0,      '#3b82f6')}
          ${kpiRow('Docs Uploaded',  totalDocs,    dayBefore?.docs    || 0,      '#22c55e')}
          ${kpiRow('Active Users',   totalActive,  0,                            '#a78bfa')}
          ${kpiRow('Page Views',     v24h.length,  dayBefore?.views   || 0,      '#6366f1')}
          <td style="padding:12px 10px; text-align:center;">
            <div style="font-size:28px; font-weight:800; color:#3b82f6; font-family:'Georgia',serif; line-height:1;">${uniqueIps}</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Unique Visitors</div>
          </td>
        </tr>
      </table>

      <!-- Signup breakdown -->
      <div style="padding:20px 32px;border-bottom:1px solid #f1ede6;">
        <h3 style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Signups by Role (24h)</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${(['talent','employer','agency','lawyer'] as const).map(role => {
              const colors: Record<string, string> = { talent: '#d4a84b', employer: '#3b82f6', agency: '#a78bfa', lawyer: '#22c55e' };
              return `<td style="text-align:center;padding:8px;">
                <div style="font-size:22px;font-weight:800;color:${colors[role]};font-family:'Georgia',serif;">${signupsByRole[role]}</div>
                <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:capitalize;margin-top:3px;">${role}</div>
              </td>`;
            }).join('')}
          </tr>
        </table>
      </div>

      <!-- 30d totals strip -->
      <div style="padding:16px 32px;background:#f9f6f1;border-bottom:1px solid #e2d9cc;">
        <h3 style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">30-Day Totals</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#d4a84b;font-family:'Georgia',serif;">${totals30d.signups}</div>
              <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;margin-top:2px;">Signups</div>
            </td>
            <td style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#3b82f6;font-family:'Georgia',serif;">${totals30d.letters}</div>
              <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;margin-top:2px;">Letters</div>
            </td>
            <td style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#22c55e;font-family:'Georgia',serif;">${totals30d.docs}</div>
              <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;margin-top:2px;">Documents</div>
            </td>
            <td style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#6366f1;font-family:'Georgia',serif;">${totals30d.views}</div>
              <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;margin-top:2px;">Page Views</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- 7-day daily table -->
      <div style="padding:20px 32px 24px;">
        <h3 style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Last 7 Days — Day by Day</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2d9cc;border-radius:8px;overflow:hidden;font-size:12px;">
          <thead>
            <tr style="background:#f1ede6;">
              <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #e2d9cc;">Date</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2d9cc;">Signups</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2d9cc;">Letters</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2d9cc;">Accepted</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2d9cc;">Docs</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2d9cc;">Views</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2d9cc;">Unique</th>
            </tr>
          </thead>
          <tbody>
            ${dailyTableRows}
          </tbody>
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:0 32px 28px;text-align:center;">
        <a href="${appUrl}/dashboard/admin/reports"
           style="display:inline-block;background:#d4a84b;color:#0b1d35;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
          View Full Report →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px;font-size:11px;color:#94a3b8;">
      <p style="margin:0 0 4px;">O1DMatch · Built by a licensed immigration attorney</p>
      <p style="margin:0;">This report is sent daily to ${REPORT_EMAIL}</p>
    </div>

  </div>
</body>
</html>`;

    // ── Send email ────────────────────────────────────────────────────────────
    await transporter.sendMail({
      from:    `"${REPORT_NAME}" <${process.env.SMTP_FROM || 'noreply@o1dmatch.com'}>`,
      to:      REPORT_EMAIL,
      subject: `O1DMatch Daily Report — ${reportDate}`,
      html,
    });

    console.log(`[daily-email] Report sent to ${REPORT_EMAIL} for ${reportDate}`);

    return NextResponse.json({
      success: true,
      sentTo:  REPORT_EMAIL,
      date:    reportDate,
      kpis: { totalSignups, totalLetters, totalDocs, totalActive, pageViews: v24h.length, uniqueVisitors: uniqueIps, totalUsers },
    });

  } catch (error) {
    console.error('[daily-email] Failed:', error);
    return NextResponse.json({ error: 'Failed to generate or send report' }, { status: 500 });
  }
}