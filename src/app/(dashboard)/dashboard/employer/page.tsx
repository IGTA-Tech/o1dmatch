import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users,
  Briefcase,
  Mail,
  Eye,
  ArrowRight,
  Plus,
  TrendingUp,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default async function EmployerDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get employer profile
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no employer profile exists, create one
  if (!employerProfile) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    await supabase.from('employer_profiles').insert({
      user_id: user.id,
      company_name: profile?.full_name ? `${profile.full_name}'s Company` : 'My Company',
      signatory_name: profile?.full_name || '',
      signatory_email: user.email || '',
    });

    redirect('/dashboard/employer/profile');
  }

  // Get stats
  const [
    { count: activeJobsCount },
    { count: totalApplicationsCount },
    { count: lettersSentCount },
  ] = await Promise.all([
    supabase
      .from('job_listings')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerProfile.id)
      .eq('status', 'active'),
    supabase
      .from('job_applications')
      .select('*, job:job_listings!inner(*)', { count: 'exact', head: true })
      .eq('job.employer_id', employerProfile.id),
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerProfile.id),
  ]);

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:job_listings!inner(
        id,
        title,
        employer_id
      ),
      talent:talent_profiles(
        candidate_id,
        professional_headline,
        o1_score,
        industry
      )
    `)
    .eq('job.employer_id', employerProfile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      label: 'Active Jobs',
      value: activeJobsCount || 0,
      icon: Briefcase,
      href: '/dashboard/employer/jobs',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Applications',
      value: totalApplicationsCount || 0,
      icon: Users,
      href: '/dashboard/employer/jobs',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Letters Sent',
      value: lettersSentCount || 0,
      icon: Mail,
      href: '/dashboard/employer/letters',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Profile Views',
      value: employerProfile.view_count || 0,
      icon: Eye,
      href: '/dashboard/employer/profile',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const isProfileComplete =
    employerProfile.company_name &&
    employerProfile.signatory_name &&
    employerProfile.signatory_email &&
    employerProfile.is_authorized_signatory;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {employerProfile.company_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and connect with O-1 talent
          </p>
        </div>
        <Link
          href="/dashboard/employer/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      {/* Profile completion warning */}
      {!isProfileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Complete your company profile</p>
              <p className="text-sm text-yellow-700 mt-1">
                A complete profile is required to send interest letters to candidates.
              </p>
            </div>
            <Link
              href="/dashboard/employer/profile"
              className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}

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

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link
              href="/dashboard/employer/jobs"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!recentApplications || recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No applications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Post a job to start receiving applications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.talent?.candidate_id || 'Unknown Candidate'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Applied for {app.job?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.talent?.o1_score && (
                      <span className="text-sm font-medium text-green-600">
                        {app.talent.o1_score}% score
                      </span>
                    )}
                    <Link
                      href={`/dashboard/employer/jobs/${app.job?.id}/applications`}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/employer/browse">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Browse Talent</h3>
                <p className="text-sm text-gray-500">
                  Search our database of O-1 candidates
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/employer/jobs/new">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Post a Job</h3>
                <p className="text-sm text-gray-500">
                  Create a new job listing
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/employer/letters">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Track Letters</h3>
                <p className="text-sm text-gray-500">
                  View sent interest letters
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
