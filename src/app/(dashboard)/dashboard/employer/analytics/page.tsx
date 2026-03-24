// src/app/(dashboard)/dashboard/employer/analytics/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  TrendingUp,
  Briefcase,
  Users,
  Mail,
  Eye,
  ArrowLeft,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ── helpers ──────────────────────────────────────────────────────────────────
function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 100);
}

function monthLabel(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

export default async function EmployerAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // ── Employer profile ──────────────────────────────────────────────────────
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single();
  if (!employerProfile) redirect('/dashboard/employer');

  // ── Plan gate — use service role to bypass RLS ────────────────────────────
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: subRow } = await adminClient
    .from('employer_subscriptions')
    .select('tier')
    .eq('employer_id', user.id)
    .single();

  const tier = subRow?.tier ?? 'free';
  const hasAccess = ['growth', 'business', 'enterprise'].includes(tier);

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights into your hiring activity</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics requires Growth plan or above</h2>
            <p className="text-gray-600 text-sm">
              Upgrade to Growth, Business, or Enterprise to access detailed analytics on your jobs,
              interest inquiry, talent browsing activity, and interest letter performance.
            </p>
            <Link
              href="/dashboard/employer/billing"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Plans &amp; Upgrade
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const empId = employerProfile.id;

  // ── Fetch all data in parallel ────────────────────────────────────────────
  // Use the regular supabase client for job_listings, job_applications, and
  // interest_letters — RLS works correctly for these tables (employer reads
  // their own rows via employer_id = profile id, which matches auth session).
  // adminClient is only needed for employer_subscriptions where the employer_id
  // stores the auth user ID (not profile ID), causing an RLS mismatch.
  const [
    { data: jobs, error: jobsErr },
    { data: letters },
    { data: lettersSentThisMonth },
  ] = await Promise.all([
    supabase
      .from('job_listings')
      .select('id, title, status, views_count, created_at')
      .eq('employer_id', empId)
      .order('created_at', { ascending: false }),

    supabase
      .from('interest_letters')
      .select('id, status, created_at, talent_id')
      .eq('employer_id', empId)
      .order('created_at', { ascending: false }),

    supabase
      .from('interest_letters')
      .select('id')
      .eq('employer_id', empId)
      .eq('status', 'sent')
      .gte('created_at', (() => {
        const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.toISOString();
      })()),
  ]);

  if (jobsErr) console.error('[Analytics] jobs query error:', jobsErr.message);

  // Fetch applications after jobs resolves (needs job IDs)
  const jobIds = (jobs || []).map(j => j.id);
  const { data: appsData } = jobIds.length > 0
    ? await supabase
        .from('job_applications')
        .select('id, job_id, status, created_at, score_at_application')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const allJobs = jobs || [];
  const allApps = appsData || [];
  const allLetters = letters || [];

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const totalJobs = allJobs.length;
  const activeJobs = allJobs.filter(j => j.status === 'active').length;
  const totalViews = allJobs.reduce((s, j) => s + (j.views_count || 0), 0);
  const totalApps = allApps.length;
  const pendingApps = allApps.filter(a => a.status === 'pending').length;
  const acceptedApps = allApps.filter(a => a.status === 'accepted').length;
  const rejectedApps = allApps.filter(a => a.status === 'rejected').length;
  const conversionRate = pct(totalApps, totalViews);
  const totalLettersSent = allLetters.filter(l => l.status === 'sent').length;
  const lettersThisMonth = (lettersSentThisMonth || []).length;
  const acceptedLetters = allLetters.filter(l => l.status === 'accepted').length;
  const letterAcceptRate = pct(acceptedLetters, totalLettersSent);

  // ── Per-job stats ─────────────────────────────────────────────────────────
  const jobStats = allJobs.map(job => {
    const jobApps = allApps.filter(a => a.job_id === job.id);
    const avgScore = jobApps.length
      ? Math.round(jobApps.reduce((s, a) => s + (a.score_at_application || 0), 0) / jobApps.length)
      : 0;
    return {
      ...job,
      appCount: jobApps.length,
      avgScore,
      views: job.views_count || 0,
    };
  });

  // ── Monthly application trend (last 6 months) ─────────────────────────────
  const monthlyApps = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const y = d.getFullYear(), m = d.getMonth();
    const count = allApps.filter(a => {
      const ad = new Date(a.created_at);
      return ad.getFullYear() === y && ad.getMonth() === m;
    }).length;
    return { label: monthLabel(5 - i), count };
  });

  const maxMonthlyApps = Math.max(...monthlyApps.map(m => m.count), 1);

  // ── Application status breakdown ─────────────────────────────────────────
  const statusBreakdown = [
    { label: 'Pending', count: pendingApps, color: 'bg-yellow-400', icon: Clock },
    { label: 'Accepted', count: acceptedApps, color: 'bg-green-500', icon: CheckCircle },
    { label: 'Rejected', count: rejectedApps, color: 'bg-red-400', icon: XCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">{employerProfile.company_name} · Hiring insights</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
          style={{ background: 'rgba(212,168,75,0.12)', color: '#b08a2e' }}>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {tier} plan
        </span>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: totalJobs, sub: `${activeJobs} active`, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Views', value: totalViews, sub: 'across all jobs', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Interest inquiry', value: totalApps, sub: `${conversionRate}% view→apply`, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Letters Sent', value: totalLettersSent, sub: `${lettersThisMonth} this month`, icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Application Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Interest inquiry — Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalApps === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No interest inquiry yet
              </div>
            ) : (
              <div className="flex items-end gap-3 h-48 pt-4">
                {monthlyApps.map(m => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-700">{m.count || ''}</span>
                    <div className="w-full rounded-t-md bg-blue-500 transition-all"
                      style={{ height: `${Math.max((m.count / maxMonthlyApps) * 160, m.count > 0 ? 8 : 0)}px` }} />
                    <span className="text-[10px] text-gray-400">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalApps === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No interest inquiry yet</p>
            ) : (
              <>
                {statusBreakdown.map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <s.icon className="w-4 h-4" />
                        {s.label}
                      </span>
                      <span className="font-semibold">{s.count} <span className="text-gray-400 font-normal">({pct(s.count, totalApps)}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all`}
                        style={{ width: `${pct(s.count, totalApps)}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Acceptance rate</span>
                    <span className="font-semibold text-green-600">{pct(acceptedApps, totalApps)}%</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interest Letters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: totalLettersSent, color: 'text-blue-600' },
          { label: 'Accepted by Talent', value: acceptedLetters, color: 'text-green-600' },
          { label: 'Acceptance Rate', value: `${letterAcceptRate}%`, color: 'text-amber-600' },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Interest Letters · {m.label}
              </p>
              <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Job Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-600" />
            Job Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allJobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No jobs posted yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Job Title</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Views</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Interest inquiry</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Avg Score</th>
                    <th className="text-center py-2 pl-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">View→Apply %</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.map(job => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <Link href={`/dashboard/employer/jobs/${job.id}/applications`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'active' ? 'bg-green-100 text-green-700' :
                          job.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-gray-700">{job.views}</td>
                      <td className="py-3 px-3 text-center font-medium text-gray-700">{job.appCount}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-semibold ${job.avgScore >= 70 ? 'text-green-600' : job.avgScore >= 40 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {job.avgScore > 0 ? `${job.avgScore}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-center font-medium text-gray-700">
                        {job.views > 0 ? `${pct(job.appCount, job.views)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}