import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewClientForm } from './NewClientForm';

export default async function NewClientPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id, agency_name, contact_name, contact_email')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  return (
    <NewClientForm
      agencyId={agencyProfile.id}
      agencyName={agencyProfile.agency_name}
      agencyContactName={agencyProfile.contact_name}
      agencyContactEmail={agencyProfile.contact_email}
    />
  );
}