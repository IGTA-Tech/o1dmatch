import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewClientForm } from './NewClientForm';

export default async function NewClientPage() {
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

  return (
    <NewClientForm agencyId={agencyProfile.id} agencyName={agencyProfile.agency_name} />
  );
}