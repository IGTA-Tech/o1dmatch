import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users,
  FileText,
  Briefcase,
  Mail,
  Scale,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get counts
  const [
    { count: totalUsers },
    { count: talentCount },
    { count: employerCount },
    { count: pendingDocs },
    { count: verifiedDocs },
    { count: activeJobs },
    { count: totalLetters },
    { count: publicLawyers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'talent'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    supabase.from('talent_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('talent_documents').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }),
    supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }).eq('is_public', true),
  ]);

  // Get recent pending documents
  const { data: recentPendingDocs } = await supabase
    .from('talent_documents')
    .select(`
      *,
      talent:talent_profiles(candidate_id, first_name, last_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
                <p className="text-sm text-gray-600">Total Users</p>
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
                <p className="text-2xl font-bold text-yellow-600">{pendingDocs || 0}</p>
                <p className="text-sm text-gray-600">Pending Docs</p>
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
                <p className="text-2xl font-bold text-green-600">{activeJobs || 0}</p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{totalLetters || 0}</p>
                <p className="text-sm text-gray-600">Letters Sent</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Talent</span>
                <span className="font-medium">{talentCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Employers</span>
                <span className="font-medium">{employerCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Public Lawyers</span>
                <span className="font-medium">{publicLawyers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  Pending Review
                </span>
                <span className="font-medium">{pendingDocs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Verified
                </span>
                <span className="font-medium">{verifiedDocs || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents Pending Review</CardTitle>
            <Link
              href="/admin/documents"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!recentPendingDocs || recentPendingDocs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600">All documents reviewed!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">
                        {doc.talent?.candidate_id || 'Unknown'} •{' '}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/documents/${doc.id}`}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/documents">
          <Card hover>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Review Documents</h3>
                <p className="text-sm text-gray-500">
                  {pendingDocs || 0} pending review
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card hover>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">
                  View and edit user accounts
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/lawyers">
          <Card hover>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Scale className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Verify Lawyers</h3>
                <p className="text-sm text-gray-500">
                  Review lawyer profiles
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
