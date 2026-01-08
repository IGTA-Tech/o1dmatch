import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify agency access
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get client details
  const { data: client, error } = await supabase
    .from('agency_clients')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agencyProfile.id)
    .single();

  if (!client || error) {
    redirect('/dashboard/agency/clients');
  }

  // Get interest letters for this client
  const { data: letters } = await supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      status,
      created_at,
      talent:talent_profiles(
        id,
        professional_headline
      )
    `)
    .eq('agency_client_id', id)
    .order('created_at', { ascending: false })
    .limit(5);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/agency/clients"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{client.company_name}</h1>
              <Badge variant={client.is_active ? 'success' : 'default'}>
                {client.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {client.industry && (
              <p className="text-gray-600 capitalize">{client.industry.replace('_', ' ')}</p>
            )}
          </div>
        </div>
        <Link
          href={`/dashboard/agency/clients/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Client
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.legal_name && (
                <div>
                  <p className="text-sm text-gray-500">Legal Name</p>
                  <p className="font-medium text-gray-900">{client.legal_name}</p>
                </div>
              )}

              {client.company_description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{client.company_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {client.industry && (
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {client.industry.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {client.company_size && (
                  <div>
                    <p className="text-sm text-gray-500">Company Size</p>
                    <p className="font-medium text-gray-900">{client.company_size} employees</p>
                  </div>
                )}
              </div>

              {client.company_website && (
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  
                    <a href={client.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    {client.company_website}
                  </a>
                </div>
              )}

              {/* Visibility Setting */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {client.show_client_identity ? (
                  <>
                    <Eye className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Client Identity Visible</p>
                      <p className="text-sm text-gray-500">Company name is shown to talent</p>
                    </div>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Client Identity Hidden</p>
                      <p className="text-sm text-gray-500">Blind listing - identity hidden from talent</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          {(client.street_address || client.city || client.state) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {client.street_address && <>{client.street_address}<br /></>}
                  {[client.city, client.state, client.zip_code].filter(Boolean).join(', ')}
                  {client.country && <><br />{client.country}</>}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Interest Letters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Recent Interest Letters
              </CardTitle>
              <Link
                href={`/dashboard/agency/letters?client=${id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {!letters || letters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No interest letters yet</p>
                  <Link
                    href={`/dashboard/agency/letters/new?client=${id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Create first letter
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {letters.map((letter) => (
                    <Link
                      key={letter.id}
                      href={`/dashboard/agency/letters/${letter.id}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{letter.job_title}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(letter.created_at)}
                          </p>
                        </div>
                        <Badge variant={letter.status === 'sent' ? 'info' : 'default'}>
                          {letter.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Signatory Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Authorized Signatory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{client.signatory_name}</p>
              </div>

              {client.signatory_title && (
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium text-gray-900">{client.signatory_title}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Email</p>
                
                  <a href={`mailto:${client.signatory_email}`}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  {client.signatory_email}
                </a>
              </div>

              {client.signatory_phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  
                    <a href={`tel:${client.signatory_phone}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-4 h-4" />
                    {client.signatory_phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Added {formatDate(client.created_at)}</span>
              </div>
              {client.updated_at !== client.created_at && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(client.updated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3">
              <Link
                href={`/dashboard/agency/letters/new?client=${id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Interest Letter
              </Link>
              <Link
                href={`/dashboard/agency/clients/${id}/edit`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Client
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}