// src/app/(dashboard)/dashboard/agency/profile/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AgencyProfileClient } from './profile-client';

export default async function AgencyProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <AgencyProfileClient profile={agencyProfile} />
  );
}