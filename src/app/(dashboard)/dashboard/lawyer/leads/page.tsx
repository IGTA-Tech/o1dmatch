import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default async function LawyerLeadsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get lawyer profile
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('id')
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'warning' as const, icon: Clock };
      case 'accepted':
        return { label: 'Accepted', variant: 'success' as const, icon: CheckCircle };
      case 'declined':
        return { label: 'Declined', variant: 'error' as const, icon: XCircle };
      default:
        return { label: status, variant: 'default' as const, icon: Clock };
    }
  };

  // Stats
  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    accepted: requests?.filter(r => r.status === 'accepted').length || 0,
    declined: requests?.filter(r => r.status === 'declined').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600">Manage connection requests from potential clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-gray-500">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
            <p className="text-sm text-gray-500">Declined</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Yet</h3>
            <p className="text-gray-600 mb-4">
              When potential clients request to connect, they&apos;ll appear here.
            </p>
            <Link
              href="/dashboard/lawyer/profile"
              className="text-blue-600 hover:underline"
            >
              Complete your profile to attract leads
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const status = getStatusBadge(request.status);
            const StatusIcon = status.icon;

            return (
              <Card key={request.id} hover>
                <CardContent className="flex items-start gap-6">
                  {/* Lead Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.requester_name}
                      </h3>
                      <Badge variant={status.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">
                        {request.requester_type}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      
                        <a href={`mailto:${request.requester_email}`}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <Mail className="w-4 h-4" />
                        {request.requester_email}
                      </a>
                      {request.requester_phone && (
                        
                          <a href={`tel:${request.requester_phone}`}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Phone className="w-4 h-4" />
                          {request.requester_phone}
                        </a>
                      )}
                    </div>

                    {/* Message Preview */}
                    {request.message && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {request.message}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(request.created_at)}
                      </span>
                      {request.share_profile && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <FileText className="w-4 h-4" />
                          Profile Shared
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/lawyer/leads/${request.id}`}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}