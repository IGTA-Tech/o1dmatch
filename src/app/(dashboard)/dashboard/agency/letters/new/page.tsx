import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewLetterForm from './NewLetterForm';

export default async function NewLetterPage({
  searchParams,
}: {
  searchParams: Promise<{ talent?: string; job?: string; client?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id, agency_name')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get agency clients
  const { data: clients } = await supabase
    .from('agency_clients')
    .select('id, company_name, signatory_name, signatory_title, signatory_email')
    .eq('agency_id', agencyProfile.id)
    .eq('is_active', true)
    .order('company_name');

  // Get agency jobs
  const { data: jobs } = await supabase
    .from('job_listings')
    .select(`
      id, 
      title, 
      department,
      agency_client_id,
      client:agency_clients(company_name)
    `)
    .eq('agency_id', agencyProfile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get talent profile if specified
  let talentProfile = null;
  let talentUser = null;

  if (params.talent) {
    const { data: talent } = await supabase
      .from('talent_profiles')
      .select('id, user_id, professional_headline, o1_score')
      .eq('id', params.talent)
      .single();

    if (talent) {
      talentProfile = talent;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', talent.user_id)
        .single();

      talentUser = profile;
    }
  }

  // Get all talents for dropdown
  const { data: allTalents } = await supabase
    .from('talent_profiles')
    .select('id, user_id, professional_headline')
    .order('created_at', { ascending: false });

  // Get user info for talents
  const talentUserIds = allTalents?.map(t => t.user_id).filter(Boolean) || [];
  const userInfo: Record<string, { full_name: string; email: string }> = {};

  if (talentUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', talentUserIds);

    profiles?.forEach(p => {
      userInfo[p.id] = { full_name: p.full_name, email: p.email };
    });
  }

  const talentsWithNames = allTalents?.map(t => ({
    ...t,
    full_name: t.user_id ? userInfo[t.user_id]?.full_name : null,
    email: t.user_id ? userInfo[t.user_id]?.email : null,
  })) || [];

  return (
    <NewLetterForm
      agencyId={agencyProfile.id}
      agencyName={agencyProfile.agency_name}
      clients={clients || []}
      jobs={jobs || []}
      talents={talentsWithNames}
      preselectedTalentId={params.talent}
      preselectedTalent={talentProfile}
      preselectedTalentUser={talentUser}
      preselectedJobId={params.job}
      preselectedClientId={params.client}
    />
  );
}