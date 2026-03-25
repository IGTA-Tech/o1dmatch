// src/app/(dashboard)/dashboard/lawyer/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users,
  Eye,
  Mail,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  User,
  Star,
} from 'lucide-react';
import Link from 'next/link';

export default async function LawyerDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get lawyer profile
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Auto-create profile if missing
  if (!lawyerProfile) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    await supabase.from('lawyer_profiles').insert({
      user_id:   user.id,
      name:      profile?.full_name || '',
      email:     user.email || '',
      is_public: false,
    });

    redirect('/dashboard/lawyer/profile');
  }

  // Connection request stats
  const { data: requests } = await supabase
    .from('lawyer_connection_requests')
    .select('status')
    .eq('lawyer_id', lawyerProfile.id);

  const stats = {
    totalLeads:   requests?.length || 0,
    pending:      requests?.filter((r) => r.status === 'pending').length  || 0,
    accepted:     requests?.filter((r) => r.status === 'accepted').length || 0,
    profileViews: lawyerProfile.view_count || 0,
  };

  // Recent leads
  const { data: recentLeads } = await supabase
    .from('lawyer_connection_requests')
    .select('id, requester_name, requester_email, status, created_at')
    .eq('lawyer_id', lawyerProfile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const isPartner = lawyerProfile.is_partner ?? false;

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {lawyerProfile.name || 'Attorney'}!
            </h1>
            {isPartner && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.2rem 0.65rem', borderRadius: 100,
                fontSize: '0.7rem', fontWeight: 700,
                background: 'rgba(212,168,75,0.1)',
                border: '1px solid rgba(212,168,75,0.3)',
                color: '#92620A',
              }}>
                <Star size={11} style={{ fill: '#D4A84B', color: '#D4A84B' }} />
                O1DMatch Partner
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Manage your leads and public directory profile
          </p>
        </div>

        {!lawyerProfile.is_public && (
          <Link
            href="/dashboard/lawyer/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] font-semibold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: '#D4A84B', color: '#0B1D35' }}
          >
            Publish Profile
          </Link>
        )}
      </div>

      {/* Profile not public warning */}
      {!lawyerProfile.is_active && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Your profile is not public yet</p>
              <p className="text-sm text-yellow-700 mt-1">
                Complete your profile and publish it to appear in the O1DMatch attorney directory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partner benefits banner */}
      {isPartner && (
        <div style={{
          background: 'rgba(212,168,75,0.06)',
          border: '1px solid rgba(212,168,75,0.2)',
          borderRadius: 12,
          padding: '1rem 1.25rem',
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
                You earn 20% commission on every referred subscription and receive bulk promo code discounts.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/lawyer/profile"
            style={{
              fontSize: '0.82rem', fontWeight: 600, color: '#92620A',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            View profile →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads',    value: stats.totalLeads,   icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50',   href: '/dashboard/lawyer/leads' },
          { label: 'Pending',        value: stats.pending,      icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/dashboard/lawyer/leads?status=pending' },
          { label: 'Accepted',       value: stats.accepted,     icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50',  href: '/dashboard/lawyer/leads?status=accepted' },
          { label: 'Profile Views',  value: stats.profileViews, icon: Eye,          color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/lawyer/stats' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover padding="sm" className="h-full">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Link
              href="/dashboard/lawyer/leads"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!recentLeads || recentLeads.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No leads yet</p>
              <p className="text-sm text-gray-500 mt-1">
                {lawyerProfile.is_public
                  ? 'When users request to connect, they will appear here.'
                  : 'Publish your profile to start receiving leads.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lead.requester_name}</p>
                    <p className="text-sm text-gray-600">{lead.requester_email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {lead.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <Clock className="w-4 h-4" /> Pending
                      </span>
                    ) : lead.status === 'accepted' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" /> Accepted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <XCircle className="w-4 h-4" /> Declined
                      </span>
                    )}
                    <Link
                      href={`/dashboard/lawyer/leads/${lead.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/lawyer/profile">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Edit Profile</h3>
                <p className="text-sm text-gray-500">
                  Update your public directory information
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/lawyer/stats">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">
                  View profile performance and lead stats
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  );
}