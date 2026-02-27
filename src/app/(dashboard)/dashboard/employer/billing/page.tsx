import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './billing-client';

export default async function EmployerBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; promo_applied?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get subscription data
  const { data: subscription } = await supabase
    .from('employer_subscriptions')
    .select('*')
    .eq('employer_id', user.id)
    .single();

  // Get URL params
  const params = await searchParams;
  const showSuccess = params.success === 'true';
  const showCanceled = params.canceled === 'true';
  const showPromoApplied = params.promo_applied === 'true';

  return (
    <BillingClient 
      subscription={subscription} 
      userId={user.id}
      showSuccess={showSuccess}
      showCanceled={showCanceled}
      showPromoApplied={showPromoApplied}
    />
  );
}