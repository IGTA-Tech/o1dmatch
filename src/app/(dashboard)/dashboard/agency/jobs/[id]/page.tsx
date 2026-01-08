import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditJobForm } from './EditJobForm';

export default async function EditJobPage({
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

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id, agency_name')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get job details
  const { data: job, error } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agencyProfile.id)
    .single();

  if (!job || error) {
    redirect('/dashboard/agency/jobs');
  }

  // Get agency clients for selection
  const { data: clients } = await supabase
    .from('agency_clients')
    .select('id, company_name, industry')
    .eq('agency_id', agencyProfile.id)
    .eq('is_active', true)
    .order('company_name');

  return (
    <EditJobForm 
      job={job}
      clients={clients || []} 
    />
  );
}