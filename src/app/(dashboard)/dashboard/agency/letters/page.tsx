import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Plus,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyLettersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get all interest letters for this agency
  const { data: letters } = await supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      department,
      commitment_level,
      engagement_type,
      work_arrangement,
      locations,
      salary_min,
      salary_max,
      status,
      created_at,
      client:agency_clients(
        company_name
      ),
      talent:talent_profiles(
        id,
        user_id,
        professional_headline
      )
    `)
    .eq('agency_id', agencyProfile.id)
    .order('created_at', { ascending: false });

  // Get talent user names
  const talentUserIds = letters?.map(l => {
    const talent = Array.isArray(l.talent) ? l.talent[0] : l.talent;
    return talent?.user_id;
  }).filter(Boolean) || [];
  console.log("talentUserIds===> ",talentUserIds);
  const userInfo: Record<string, string> = {};

  if (talentUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', talentUserIds);

    profiles?.forEach(p => {
      userInfo[p.id] = p.full_name;
    });
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', variant: 'default' as const };
      case 'sent':
        return { label: 'Sent', variant: 'info' as const };
      case 'read':
        return { label: 'Read', variant: 'success' as const };
      case 'responded':
        return { label: 'Responded', variant: 'success' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  };

  const getCommitmentBadge = (level: string) => {
    switch (level) {
      case 'offer_extended':
      case 'firm_commitment':
        return { label: level.replace(/_/g, ' '), variant: 'success' as const };
      case 'conditional_offer':
      case 'intent_to_engage':
        return { label: level.replace(/_/g, ' '), variant: 'info' as const };
      default:
        return { label: level.replace(/_/g, ' '), variant: 'default' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interest Letters</h1>
          <p className="text-gray-600">Letters sent to talent on behalf of clients</p>
        </div>
        <Link
          href="/dashboard/agency/letters/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Letter
        </Link>
      </div>

      {/* Letters List */}
      {!letters || letters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interest Letters</h3>
            <p className="text-gray-600 mb-6">
              Create your first interest letter to express client interest in talent.
            </p>
            <Link
              href="/dashboard/agency/letters/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Letter
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => {
            const status = getStatusBadge(letter.status || 'draft');
            const commitment = getCommitmentBadge(letter.commitment_level);
            const talentName = letter.talent?.user_id ? userInfo[letter.talent.user_id] : 'Unknown';
            const salary = formatSalary(letter.salary_min, letter.salary_max);

            return (
              <Card key={letter.id}>
                <CardContent className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {letter.job_title}
                      </h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant={commitment.variant} className="capitalize">
                        {commitment.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {talentName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {letter.client?.company_name || 'No client'}
                      </span>
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
                          {letter.locations.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <Calendar className="w-4 h-4" />
                      Created {formatDate(letter.created_at)}
                    </div>
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