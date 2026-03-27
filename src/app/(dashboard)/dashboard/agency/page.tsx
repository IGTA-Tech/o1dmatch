// src/app/(dashboard)/dashboard/agency/page.tsx
// ── CHANGES FROM ORIGINAL ──────────────────────────────────
// 1. Fetches affiliate_partners record for the agency user
// 2. Shows affiliate banner + quick-action card when partner
// All stats queries, welcome header, and layout UNCHANGED.
// ────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users, Briefcase, Mail, Building2, ArrowRight, Plus,
  TrendingUp, FolderOpen, Search, Star,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agencyProfile } = await supabase
    .from('agency_profiles').select('*').eq('user_id', user.id).single();

  if (!agencyProfile) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    await supabase.from('agency_profiles').insert({
      user_id:     user.id,
      agency_name: profile?.full_name ? `${profile.full_name} Agency` : 'My Agency',
    });
    redirect('/dashboard/agency/profile');
  }

  // Stats — UNCHANGED
  const [
    { count: clientsCount },
    { count: activeJobsCount },
    { count: applicantsCount },
    { count: lettersSentCount },
  ] = await Promise.all([
    supabase.from('agency_clients').select('*', { count: 'exact', head: true }).eq('agency_id', agencyProfile.id).eq('status', 'active'),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('agency_id', agencyProfile.id).eq('status', 'active'),
    supabase.from('job_applications').select('*, job:job_listings!inner(*)', { count: 'exact', head: true }).eq('job.agency_id', agencyProfile.id),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }).eq('agency_id', agencyProfile.id),
  ]);

  // ── NEW: fetch affiliate partner record ───────────────────
  const { data: affiliatePartner } = await supabase
    .from('affiliate_partners')
    .select('affiliate_code, total_referrals, total_conversions, total_pending, commission_rate, status')
    .eq('user_id', user.id)
    .single();

  const isPartner = !!affiliatePartner && affiliatePartner.status === 'active';
  // ── END NEW ───────────────────────────────────────────────

  const stats = [
    { label: 'Active Clients',             value: clientsCount    || 0, icon: Building2, href: '/dashboard/agency/clients',    color: 'text-blue-600',   bgColor: 'bg-blue-50' },
    { label: 'Active Jobs',                value: activeJobsCount || 0, icon: Briefcase, href: '/dashboard/agency/jobs',       color: 'text-green-600',  bgColor: 'bg-green-50' },
    { label: 'Total Interested Candidates',value: applicantsCount || 0, icon: FolderOpen,href: '/dashboard/agency/applicants', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Letters Sent',               value: lettersSentCount|| 0, icon: Mail,      href: '/dashboard/agency/letters',    color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome Header — UNCHANGED */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {agencyProfile.agency_name}!
          </h1>
          <p className="text-gray-600 mt-1">Manage your clients and place O-1 talent</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/agency/clients/new"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" /> Add Client
          </Link>
          <Link href="/dashboard/agency/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Post Job
          </Link>
        </div>
      </div>

      {/* ── NEW: Affiliate partner banner ── */}
      {isPartner && affiliatePartner && (
        <div style={{
          background: 'rgba(212,168,75,0.06)', border: '1px solid rgba(212,168,75,0.2)',
          borderRadius: 12, padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div className="flex items-center gap-2.5">
            <Star size={18} style={{ color: '#D4A84B', fill: '#D4A84B', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#92620A' }}>
                You&apos;re an O1DMatch Partner
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#92620A', opacity: 0.8 }}>
                Earn {Math.round(affiliatePartner.commission_rate * 100)}% commission on the first payment from every referred subscriber.
                &nbsp;·&nbsp; {affiliatePartner.total_referrals} referral{affiliatePartner.total_referrals !== 1 ? 's' : ''}
                &nbsp;·&nbsp; ${(affiliatePartner.total_pending ?? 0).toFixed(2)} pending
              </p>
            </div>
          </div>
          <Link href="/dashboard/agency/affiliate"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92620A', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            View affiliate dashboard →
          </Link>
        </div>
      )}

      {/* Stats Grid — UNCHANGED */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <Card hover padding="sm" className="h-full">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions — UNCHANGED base + conditional affiliate card */}
      <div className={`grid grid-cols-1 ${isPartner ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4`}>
        {[
          { href: '/dashboard/agency/clients',    icon: Users,      bg: 'bg-blue-50',   color: 'text-blue-600',   title: 'Manage Clients',      sub: 'View and manage employer clients' },
          { href: '/dashboard/agency/applicants', icon: FolderOpen, bg: 'bg-green-50',  color: 'text-green-600',  title: 'Review Interested Candidates', sub: 'Review interest inquiry for your jobs' },
          { href: '/dashboard/agency/profile',    icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-600', title: 'Agency Profile',      sub: 'Update your agency information' },
          { href: '/dashboard/agency/browse',     icon: Search,     bg: 'bg-teal-50',   color: 'text-teal-600',   title: 'Browse Talent',       sub: 'Discover O-1 visa candidates' },
        ].map(action => (
          <Link key={action.href} href={action.href}>
            <Card hover className="h-full">
              <CardContent className="flex items-center gap-4">
                <div className={`p-3 ${action.bg} rounded-lg`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.sub}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* ── NEW: affiliate card ── */}
        {isPartner && (
          <Link href="/dashboard/agency/affiliate">
            <Card hover className="h-full">
              <CardContent className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(212,168,75,0.12)' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#D4A84B' }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Affiliate Program</h3>
                  <p className="text-sm text-gray-500">
                    {affiliatePartner
                      ? `${affiliatePartner.total_conversions} conversions · $${(affiliatePartner.total_pending ?? 0).toFixed(2)} pending`
                      : 'View your referral earnings'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* How it Works — UNCHANGED */}
      <Card>
        <CardHeader><CardTitle>How it Works</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Add Clients',   sub: 'Register your employer clients who need O-1 talent' },
              { n: '2', title: 'Post Jobs',     sub: 'Create job listings on behalf of your clients' },
              { n: '3', title: 'Match & Place', sub: 'Review interested Candidates and send interest letters' },
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">{step.n}</span>
                </div>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{step.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}