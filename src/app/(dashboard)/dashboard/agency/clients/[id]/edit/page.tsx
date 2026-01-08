import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditClientForm } from './EditClientForm';

export default async function EditClientPage({
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
    .select('id, agency_name')
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

  return (
    <EditClientForm client={client} agencyName={agencyProfile.agency_name} />
  );
}