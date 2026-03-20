// src/app/(dashboard)/dashboard/talent/messages/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MessagingClient from '@/components/messaging/MessagingClient';
import MessagesUpgradeGate from '@/components/messaging/MessagesUpgradeGate';

export default async function TalentMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) redirect('/dashboard/talent');

  // Fetch subscription tier
  const { data: subscription } = await supabase
    .from('talent_subscriptions')
    .select('tier')
    .eq('talent_id', user.id)
    .single();

  const isFreePlan = !subscription || subscription.tier === 'profile_only';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 text-sm mt-1">
          Respond to messages from employers and agencies.
        </p>
      </div>

      {isFreePlan ? (
        <MessagesUpgradeGate />
      ) : (
        <MessagingClient viewerRole="talent" />
      )}
    </div>
  );
}