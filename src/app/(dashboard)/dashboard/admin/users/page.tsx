// src/app/(dashboard)/dashboard/admin/users/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users,
  User,
  Building2,
  Scale,
  Shield,
  Search,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { StatusToggle } from './StatusToggle';

interface PageProps {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role, search, page } = await searchParams;

  const PAGE_SIZE = 80;
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const rangeFrom = (currentPage - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Build query
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by role if provided
  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  // Search by email, name, or candidate_id
  // candidate_id lives in talent_profiles, so we resolve matching user_ids first
  let candidateUserIds: string[] = [];
  if (search) {
    const { data: candidateMatches } = await supabase
      .from('talent_profiles')
      .select('user_id')
      .ilike('candidate_id', `%${search}%`);
    candidateUserIds = (candidateMatches || [])
      .map((r) => r.user_id)
      .filter(Boolean) as string[];
  }

  // Build the OR filter: email / name match OR is a matched candidate
  if (search) {
    const orParts = [`email.ilike.%${search}%`, `full_name.ilike.%${search}%`];
    if (candidateUserIds.length > 0) {
      orParts.push(`id.in.(${candidateUserIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  // Filtered count for pagination (same OR logic)
  const countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
  let filteredCountQuery = countQuery;
  if (role && role !== 'all') filteredCountQuery = filteredCountQuery.eq('role', role);
  if (search) {
    const orParts = [`email.ilike.%${search}%`, `full_name.ilike.%${search}%`];
    if (candidateUserIds.length > 0) {
      orParts.push(`id.in.(${candidateUserIds.join(',')})`);
    }
    filteredCountQuery = filteredCountQuery.or(orParts.join(','));
  }
  const { count: filteredTotal } = await filteredCountQuery;

  const { data: users, error } = await query.range(rangeFrom, rangeTo);
  const totalPages = Math.max(1, Math.ceil((filteredTotal || 0) / PAGE_SIZE));

  if (error) {
    console.error('Error fetching users:', error);
  }

  // Fetch status from talent_profiles and employer_profiles in bulk
  const userIds = (users || []).map((u) => u.id);

  const [{ data: talentStatuses }, { data: employerStatuses }] = await Promise.all([
    supabase
      .from('talent_profiles')
      .select('user_id, status')
      .in('user_id', userIds.length > 0 ? userIds : ['']),
    supabase
      .from('employer_profiles')
      .select('user_id, status')
      .in('user_id', userIds.length > 0 ? userIds : ['']),
  ]);

  const talentStatusMap = new Map<string, string>(
    (talentStatuses || []).map((r) => [r.user_id, r.status ?? 'enabled'])
  );
  const employerStatusMap = new Map<string, string>(
    (employerStatuses || []).map((r) => [r.user_id, r.status ?? 'enabled'])
  );

  const getProfileStatus = (profileId: string, profileRole: string): string | null => {
    if (profileRole === 'talent') return talentStatusMap.get(profileId) ?? null;
    if (profileRole === 'employer') return employerStatusMap.get(profileId) ?? null;
    return null;
  };

  // Get counts for each role
  const [
    { count: allCount },
    { count: talentCount },
    { count: employerCount },
    { count: lawyerCount },
    { count: adminCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'talent'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lawyer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
  ]);

  const tabs = [
    { key: 'all', label: 'All Users', count: allCount || 0, icon: Users },
    { key: 'talent', label: 'Talent', count: talentCount || 0, icon: User },
    { key: 'employer', label: 'Employers', count: employerCount || 0, icon: Building2 },
    { key: 'lawyer', label: 'Lawyers', count: lawyerCount || 0, icon: Scale },
    { key: 'admin', label: 'Admins', count: adminCount || 0, icon: Shield },
  ];

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'talent':
        return <Badge variant="info">Talent</Badge>;
      case 'employer':
        return <Badge variant="success">Employer</Badge>;
      case 'lawyer':
        return <Badge variant="warning">Lawyer</Badge>;
      case 'admin':
        return <Badge variant="error">Admin</Badge>;
      case 'agency':
        return <Badge variant="default">Agency</Badge>;
      default:
        return <Badge variant="default">{userRole}</Badge>;
    }
  };

  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'talent':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'employer':
        return <Building2 className="w-4 h-4 text-green-500" />;
      case 'lawyer':
        return <Scale className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ── Pagination URL builder ──
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.set('role', role);
    if (search) params.set('search', search);
    params.set('page', String(p));
    return `/dashboard/admin/users?${params.toString()}`;
  };

  const pageWindow = (() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">View and manage all registered users</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent>
          <form method="GET" className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={search || ''}
                placeholder="Search by email, name, or Candidate ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {role && <input type="hidden" name="role" value={role} />}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            {search && (
              <Link
                href={`/dashboard/admin/users${role ? `?role=${role}` : ''}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/admin/users${tab.key === 'all' ? '' : `?role=${tab.key}`}${search ? `&search=${search}` : ''}`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              (role === tab.key || (!role && tab.key === 'all'))
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing{' '}
          {(filteredTotal ?? 0) === 0 ? 0 : rangeFrom + 1}–
          {Math.min(rangeTo + 1, filteredTotal ?? 0)} of {filteredTotal ?? 0} user
          {(filteredTotal ?? 0) !== 1 ? 's' : ''}
          {(role && role !== 'all') || search ? ' (filtered)' : ''}
        </span>
        <span>{PAGE_SIZE} per page</span>
      </div>

      {/* Users List */}
      <Card>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Verified?</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.full_name || ''}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              getRoleIcon(profile.role)
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {profile.full_name || 'No name'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(profile.role)}
                      </td>
                      {/* Verified? */}
                      <td className="py-4 px-4">
                        {profile.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            <XCircle className="w-4 h-4" /> No
                          </span>
                        )}
                      </td>
                      {/* Account Status — inline toggle */}
                      <td className="py-4 px-4">
                        <StatusToggle
                          userId={profile.id}
                          role={profile.role}
                          currentStatus={getProfileStatus(profile.id, profile.role)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(profile.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/dashboard/admin/users/${profile.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
              {(role || search) && (
                <Link
                  href="/dashboard/admin/users"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Link
              href={buildPageUrl(1)}
              aria-disabled={currentPage === 1}
              className={`px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-30' : ''}`}
            >«</Link>
            <Link
              href={buildPageUrl(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-30' : ''}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Link>
            {pageWindow[0] > 1 && <span className="px-2 text-gray-400">…</span>}
            {pageWindow.map((p) => (
              <Link
                key={p}
                href={buildPageUrl(p)}
                className={`min-w-[2rem] text-center px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  p === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </Link>
            ))}
            {pageWindow[pageWindow.length - 1] < totalPages && <span className="px-2 text-gray-400">…</span>}
            <Link
              href={buildPageUrl(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-30' : ''}`}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={buildPageUrl(totalPages)}
              aria-disabled={currentPage === totalPages}
              className={`px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-30' : ''}`}
            >»</Link>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tabs.map((tab) => (
          <Card key={tab.key} padding="sm">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  tab.key === 'talent' ? 'bg-blue-50' :
                  tab.key === 'employer' ? 'bg-green-50' :
                  tab.key === 'lawyer' ? 'bg-yellow-50' :
                  tab.key === 'admin' ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <tab.icon className={`w-5 h-5 ${
                    tab.key === 'talent' ? 'text-blue-500' :
                    tab.key === 'employer' ? 'text-green-500' :
                    tab.key === 'lawyer' ? 'text-yellow-500' :
                    tab.key === 'admin' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                  <p className="text-xs text-gray-500">{tab.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}