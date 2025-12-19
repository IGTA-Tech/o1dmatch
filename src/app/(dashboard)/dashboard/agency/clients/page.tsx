import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Building2,
  Plus,
  ArrowRight,
  MapPin,
  Briefcase,
  Mail,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyClientsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get all clients with job counts
  const { data: clients } = await supabase
    .from('agency_clients')
    .select(`
      *,
      jobs:job_listings(count),
      letters:interest_letters(count)
    `)
    .eq('agency_id', agencyProfile.id)
    .order('created_at', { ascending: false });

  const stats = {
    total: clients?.length || 0,
    active: clients?.filter((c) => c.status === 'active').length || 0,
    pending: clients?.filter((c) => c.status === 'pending').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your employer clients</p>
        </div>
        <Link
          href="/dashboard/agency/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Clients</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending Setup</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first employer client to start posting jobs on their behalf.
            </p>
            <Link
              href="/dashboard/agency/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Your First Client
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const jobCount = client.jobs?.[0]?.count || 0;
            const letterCount = client.letters?.[0]?.count || 0;

            return (
              <Card key={client.id} hover>
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt={client.company_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.company_name}</h3>
                        {client.industry && (
                          <p className="text-sm text-gray-600">{client.industry}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={client.status === 'active' ? 'success' : 'warning'}
                    >
                      {client.status}
                    </Badge>
                  </div>

                  {(client.city || client.state) && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      {client.city && client.state
                        ? `${client.city}, ${client.state}`
                        : client.city || client.state}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {jobCount} jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {letterCount} letters
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Link
                      href={`/dashboard/agency/clients/${client.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
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
