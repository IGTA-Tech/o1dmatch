import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AgencyBrowseTalentClient from './AgencyBrowseTalentClient';

export default async function AgencyBrowsePage() {
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

  // Get all talent profiles
  const { data: talents } = await supabase
    .from('talent_profiles')
    .select(`
      id,
      candidate_id,
      industry,
      professional_headline,
      bio,
      city,
      state,
      country,
      o1_score,
      skills,
      criteria_met,
      years_experience,
      education
    `)
    .order('o1_score', { ascending: false, nullsFirst: false });

  return (
    <AgencyBrowseTalentClient talents={talents || []} />
  );
}