// src/app/(dashboard)/dashboard/agency/affiliate/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AffiliateDashboard from './_AffiliateDashboard';

export const dynamic = 'force-dynamic';

export default async function AgencyAffiliatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('agency_name')
    .eq('user_id', user.id)
    .single();

  const { data: partner } = await supabase
    .from('affiliate_partners')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!partner) redirect('/dashboard/agency');

  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select(`
      *,
      referred_user:profiles!affiliate_commissions_referred_user_id_fkey(full_name, email)
    `)
    .eq('affiliate_id', partner.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false });

  // Commission this month
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const commissionThisMonth = (commissions ?? [])
    .filter(c => new Date(c.created_at) >= monthStart)
    .reduce((s, c) => s + (c.commission_amount ?? 0), 0);

  // Active subscriptions = converted referrals
  const activeSubscriptions = (commissions ?? [])
    .filter(c => c.status === 'pending' || c.status === 'approved').length;

  return (
    <AffiliateDashboard
      partner={partner}
      commissions={commissions ?? []}
      payouts={payouts ?? []}
      userName={agencyProfile?.agency_name ?? 'Agency'}
      commissionThisMonth={commissionThisMonth}
      activeSubscriptions={activeSubscriptions}
      partnerType="agency"
    />
  );
}