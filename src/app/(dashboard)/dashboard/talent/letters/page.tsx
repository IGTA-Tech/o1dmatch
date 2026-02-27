import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default async function TalentLettersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  // Check subscription tier
  const { data: subscription } = await supabase
    .from('talent_subscriptions')
    .select('tier')
    .eq('talent_id', user.id)
    .single();

  const isFreeTier = !subscription || subscription.tier === 'profile_only';

  const { data: letters } = await supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      department,
      commitment_level,
      salary_min,
      salary_max,
      locations,
      status,
      created_at,
      employer:employer_profiles(company_name),
      agency:agency_profiles(agency_name),
      agency_client:agency_clients(company_name)
    `)
    .eq('talent_id', talentProfile.id)
    .eq('admin_status', 'approved') // Only show letters approved by admin
    .in('status', ['sent', 'viewed', 'accepted', 'declined'])
    .order('created_at', { ascending: false });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatSalary(min?: number | null, max?: number | null) {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'sent':
      case 'viewed':
        return { label: 'New', variant: 'info' as const };
      case 'accepted':
        return { label: 'Accepted', variant: 'success' as const };
      case 'declined':
        return { label: 'Declined', variant: 'error' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interest Letters</h1>
        <p className="text-gray-600">Letters from employers interested in your profile</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Interest letters are formal expressions of an employer&apos;s intent to sponsor or hire O-1 talent. When you accept and sign a letter, our admin will review and forward the signed document to the employer. Contact information will be revealed once the signed letter is delivered.
        </p>
      </div>

      {isFreeTier ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade to View Interest Letters
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Interest letters from employers are available on paid plans. Upgrade your subscription to view, accept, and sign letters from companies interested in sponsoring your O-1 visa.
            </p>
            <Link
              href="/dashboard/talent/billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Plans &amp; Upgrade
            </Link>
          </CardContent>
        </Card>
      ) : !letters || letters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Letters Yet</h3>
            <p className="text-gray-600">
              When employers express interest in your profile, their letters will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => {
            const employer = Array.isArray(letter.employer) ? letter.employer[0] : letter.employer;
            const agency = Array.isArray(letter.agency) ? letter.agency[0] : letter.agency;
            const agencyClient = Array.isArray(letter.agency_client) ? letter.agency_client[0] : letter.agency_client;
            
            const companyName = employer?.company_name || agencyClient?.company_name || 'Unknown Company';
            const status = getStatusBadge(letter.status || 'sent');
            const salary = formatSalary(letter.salary_min, letter.salary_max);
            const isNew = ['sent', 'viewed'].includes(letter.status || '');

            return (
              <Card key={letter.id} className={isNew ? 'border-blue-200 bg-blue-50/30' : ''}>
                <CardContent className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/talent/letters/${letter.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {letter.job_title}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {companyName}
                      </span>
                      {agency && (
                        <span className="text-gray-500">via {agency.agency_name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {salary}
                        </span>
                      )}
                      {letter.locations && letter.locations.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {letter.locations.slice(0, 2).join(', ')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(letter.created_at)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/talent/letters/${letter.id}`}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isNew
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isNew ? 'Review' : 'View'}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}