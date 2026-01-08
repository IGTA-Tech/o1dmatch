import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  ArrowLeft,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default async function LawyerStatsPage() {
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

  if (!lawyerProfile) {
    redirect('/dashboard/lawyer/profile');
  }

  // Get all connection requests
  const { data: requests } = await supabase
    .from('lawyer_connection_requests')
    .select('*')
    .eq('lawyer_id', lawyerProfile.id)
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalRequests = requests?.length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  const acceptedRequests = requests?.filter(r => r.status === 'accepted').length || 0;
  const declinedRequests = requests?.filter(r => r.status === 'declined').length || 0;

  // Calculate response rate
  const respondedRequests = acceptedRequests + declinedRequests;
  const responseRate = totalRequests > 0 ? Math.round((respondedRequests / totalRequests) * 100) : 0;

  // Calculate acceptance rate
  const acceptanceRate = respondedRequests > 0 ? Math.round((acceptedRequests / respondedRequests) * 100) : 0;

  // Get requests by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentRequests = requests?.filter(r => new Date(r.created_at) >= sixMonthsAgo) || [];

  // Group by month
  const requestsByMonth: Record<string, number> = {};
  recentRequests.forEach(r => {
    const month = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    requestsByMonth[month] = (requestsByMonth[month] || 0) + 1;
  });

  // Get requester type breakdown
  const requesterTypes: Record<string, number> = {};
  requests?.forEach(r => {
    const type = r.requester_type || 'unknown';
    requesterTypes[type] = (requesterTypes[type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/lawyer"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your profile performance and leads</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{lawyerProfile.profile_views || 0}</p>
            <p className="text-sm text-gray-500">Profile Views</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{responseRate}%</p>
            <p className="text-sm text-gray-500">Response Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{acceptanceRate}%</p>
            <p className="text-sm text-gray-500">Acceptance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Lead Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{pendingRequests}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${totalRequests > 0 ? (pendingRequests / totalRequests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{acceptedRequests}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${totalRequests > 0 ? (acceptedRequests / totalRequests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-700">Declined</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{declinedRequests}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${totalRequests > 0 ? (declinedRequests / totalRequests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(requesterTypes).length > 0 ? (
              Object.entries(requesterTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{count}</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${totalRequests > 0 ? (count / totalRequests) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No leads yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leads Over Time (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(requestsByMonth).length > 0 ? (
            <div className="flex items-end gap-4 h-40">
              {Object.entries(requestsByMonth).map(([month, count]) => {
                const maxCount = Math.max(...Object.values(requestsByMonth));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '20px' : '4px' }}
                    />
                    <span className="text-xs text-gray-500">{month}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No leads in the last 6 months</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips to Improve Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <p className="text-gray-700">Complete all profile fields to appear higher in search results</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <p className="text-gray-700">Add specific visa types you handle to match with relevant leads</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <p className="text-gray-700">Respond to leads quickly to improve your response rate</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">4</span>
              </div>
              <p className="text-gray-700">Write a detailed bio highlighting your O-1 visa expertise</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}