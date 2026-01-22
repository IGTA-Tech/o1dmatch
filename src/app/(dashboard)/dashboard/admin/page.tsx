// src/app/(dashboard)/dashboard/admin/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  FileText,
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get stats
  const [
    { count: pendingLettersCount },
    { count: approvedLettersCount },
    { count: rejectedLettersCount },
    { count: totalTalentCount },
    { count: totalEmployerCount },
  ] = await Promise.all([
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('admin_status', 'pending_review'),
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('admin_status', 'approved'),
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('admin_status', 'rejected'),
    supabase
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('employer_profiles')
      .select('*', { count: 'exact', head: true }),
  ]);

  // Get recent pending letters
  const { data: pendingLetters } = await supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      created_at,
      employer:employer_profiles(company_name),
      talent:talent_profiles(first_name, last_name)
    `)
    .eq('admin_status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      label: 'Pending Review',
      value: pendingLettersCount || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/dashboard/admin/letters?status=pending_review',
    },
    {
      label: 'Approved Letters',
      value: approvedLettersCount || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/dashboard/admin/letters?status=approved',
    },
    {
      label: 'Rejected Letters',
      value: rejectedLettersCount || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/dashboard/admin/letters?status=rejected',
    },
    {
      label: 'Total Talent',
      value: totalTalentCount || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/admin/users?role=talent',
    },
    {
      label: 'Total Employers',
      value: totalEmployerCount || 0,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/dashboard/admin/users?role=employer',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {profile?.full_name || 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover padding="sm" className="h-full">
              <CardContent>
                <div className="flex flex-col">
                  <div className={`p-2 rounded-lg ${stat.bgColor} w-fit mb-2`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Letters for Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Review ({pendingLettersCount || 0})
            </CardTitle>
            <Link
              href="/dashboard/admin/letters?status=pending_review"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLetters && pendingLetters.length > 0 ? (
            <div className="space-y-3">
              {pendingLetters.map((letter) => (
                <Link
                  key={letter.id}
                  href={`/dashboard/admin/letters/${letter.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{letter.job_title}</h4>
                      <p className="text-sm text-gray-600">
                        From: {letter.employer?.company_name || 'Unknown'} → 
                        To: {letter.talent?.first_name} {letter.talent?.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(letter.created_at).toLocaleDateString()}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No letters pending review
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/admin/letters">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Letters</h3>
                <p className="text-sm text-gray-500">
                  Review, approve, or reject interest letters
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/settings">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Admin Settings</h3>
                <p className="text-sm text-gray-500">
                  Configure notification email and preferences
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
