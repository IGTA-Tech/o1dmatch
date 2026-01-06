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
} from 'lucide-react';
import Link from 'next/link';

export default async function LawyerDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get lawyer profile
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no lawyer profile exists, create one
  if (!lawyerProfile) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    await supabase.from('lawyer_profiles').insert({
      user_id: user.id,
      name: profile?.full_name || '',
      email: user.email || '',
      is_public: false,
    });

    redirect('/dashboard/lawyer/profile');
  }

  // Get connection request stats
  const { data: requests } = await supabase
    .from('lawyer_connection_requests')
    .select('status')
    .eq('lawyer_id', lawyerProfile.id);

  const stats = {
    totalLeads: requests?.length || 0,
    pending: requests?.filter((r) => r.status === 'pending').length || 0,
    accepted: requests?.filter((r) => r.status === 'accepted').length || 0,
    profileViews: lawyerProfile.view_count || 0,
  };

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('lawyer_connection_requests')
    .select('*')
    .eq('lawyer_id', lawyerProfile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {lawyerProfile.name || 'Attorney'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your leads and public profile
          </p>
        </div>
        {!lawyerProfile.is_public && (
          <Link
            href="/dashboard/lawyer/profile" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Publish Profile
          </Link>
        )}
      </div>

      {/* Profile Status */}
      {!lawyerProfile.is_active && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Your profile is not public yet</p>
              <p className="text-sm text-yellow-700 mt-1">
                Complete your profile and publish it to appear in our public lawyer directory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                <p className="text-sm text-gray-600">Total Leads</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.profileViews}</p>
                <p className="text-sm text-gray-600">Profile Views</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
              View All
              <ArrowRight className="w-4 h-4" />
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
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    ) : lead.status === 'accepted' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Accepted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <XCircle className="w-4 h-4" />
                        Declined
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
                  Update your public profile information
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
                  View profile performance stats
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
