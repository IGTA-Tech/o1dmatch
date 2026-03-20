// src/app/(dashboard)/dashboard/agency/messages/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AgencyMessagesWrapper from './AgencyMessagesWrapper';

export default async function AgencyMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) redirect('/dashboard/agency');

  return (
    <div className="space-y-4">
      <AgencyMessagesWrapper />
    </div>
  );
}