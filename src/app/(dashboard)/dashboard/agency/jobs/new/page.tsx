import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewJobForm } from './NewJobForm';

export default async function NewJobPage() {
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

  // Get agency clients for selection
  const { data: clients } = await supabase
    .from('agency_clients')
    .select('id, company_name, industry')
    .eq('agency_id', agencyProfile.id)
    .eq('is_active', true)
    .order('company_name');

  return (
    <NewJobForm 
      agencyId={agencyProfile.id} 
      agencyName={agencyProfile.agency_name}
      agencyContactName={agencyProfile.contact_name}
      agencyContactEmail={agencyProfile.contact_email}
      clients={clients || []} 
    />
  );
}