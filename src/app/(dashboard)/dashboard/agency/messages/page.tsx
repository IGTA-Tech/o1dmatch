// src/app/(dashboard)/dashboard/agency/messages/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MessagingClient from '@/components/messaging/MessagingClient';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 text-sm mt-1">
          Send and receive messages with talent you are working with.
        </p>
      </div>
      <MessagingClient viewerRole="agency" />
    </div>
  );
}