import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users,
  Briefcase,
  Mail,
  Building2,
  ArrowRight,
  Plus,
  TrendingUp,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no agency profile exists, create one
  if (!agencyProfile) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    await supabase.from('agency_profiles').insert({
      user_id: user.id,
      agency_name: profile?.full_name ? `${profile.full_name} Agency` : 'My Agency',
    });

    redirect('/dashboard/agency/profile');
  }

  // Get stats
  const [
    { count: clientsCount },
    { count: activeJobsCount },
    { count: applicantsCount },
    { count: lettersSentCount },
  ] = await Promise.all([
    supabase
      .from('agency_clients')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyProfile.id)
      .eq('status', 'active'),
    supabase
      .from('job_listings')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyProfile.id)
      .eq('status', 'active'),
    supabase
      .from('job_applications')
      .select('*, job:job_listings!inner(*)', { count: 'exact', head: true })
      .eq('job.agency_id', agencyProfile.id),
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyProfile.id),
  ]);

  const stats = [
    {
      label: 'Active Clients',
      value: clientsCount || 0,
      icon: Building2,
      href: '/dashboard/agency/clients',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Jobs',
      value: activeJobsCount || 0,
      icon: Briefcase,
      href: '/dashboard/agency/jobs',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Applicants',
      value: applicantsCount || 0,
      icon: FolderOpen,
      href: '/dashboard/agency/applicants',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Letters Sent',
      value: lettersSentCount || 0,
      icon: Mail,
      href: '/dashboard/agency/letters',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {agencyProfile.agency_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your clients and place O-1 talent
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/agency/clients/new"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
          <Link
            href="/dashboard/agency/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/agency/clients">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Clients</h3>
                <p className="text-sm text-gray-500">
                  View and manage employer clients
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/agency/applicants">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Review Applicants</h3>
                <p className="text-sm text-gray-500">
                  Review applications for your jobs
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/agency/profile">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Agency Profile</h3>
                <p className="text-sm text-gray-500">
                  Update your agency information
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900">Add Clients</h4>
              <p className="text-sm text-gray-500 mt-1">
                Register your employer clients who need O-1 talent
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900">Post Jobs</h4>
              <p className="text-sm text-gray-500 mt-1">
                Create job listings on behalf of your clients
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900">Match & Place</h4>
              <p className="text-sm text-gray-500 mt-1">
                Review applicants and send interest letters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
