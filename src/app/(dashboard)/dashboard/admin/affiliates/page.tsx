// src/app/(dashboard)/dashboard/admin/affiliates/page.tsx
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import AdminAffiliatesClient from './_AdminAffiliatesClient';

export const dynamic = 'force-dynamic';

// Service role client — bypasses RLS for admin queries
// This is correct for admin pages since the user is already
// verified as admin before any data is fetched.
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// export const dynamic = 'force-dynamic';

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const params  = await searchParams;
  const tab     = params.tab ?? 'partners';

  // ── Partners — use service role to bypass RLS ──
  const { data: partners } = await adminSupabase
    .from('affiliate_partners')
    .select(`*, profile:profiles!affiliate_partners_user_id_fkey(full_name, email)`)
    .order('created_at', { ascending: false });

  // ── Commissions ──
  const { data: commissions } = await adminSupabase
    .from('affiliate_commissions')
    .select(`
      *,
      affiliate:affiliate_partners(affiliate_code, profile:profiles!affiliate_partners_user_id_fkey(full_name, email)),
      referred_user:profiles!affiliate_commissions_referred_user_id_fkey(full_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // ── Payouts ──
  const { data: payouts } = await adminSupabase
    .from('affiliate_payouts')
    .select(`*, partner:affiliate_partners(affiliate_code, payout_email, payout_method, profile:profiles!affiliate_partners_user_id_fkey(full_name, email))`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // ── Summary stats ──
  const [
    { count: pendingPartnersCount },
    { count: pendingCommissionsCount },
    { count: readyToApproveCount },
  ] = await Promise.all([
    adminSupabase.from('affiliate_partners').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminSupabase.from('affiliate_commissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminSupabase.from('affiliate_commissions').select('id', { count: 'exact', head: true }).eq('status', 'pending').lt('clawback_until', new Date().toISOString()),
  ]);

  const totalEarned  = partners?.reduce((s, p) => s + (p.total_earned ?? 0), 0) ?? 0;
  const totalPending = partners?.reduce((s, p) => s + (p.total_pending ?? 0), 0) ?? 0;

  return (
    <AdminAffiliatesClient
      partners={partners ?? []}
      commissions={commissions ?? []}
      payouts={payouts ?? []}
      activeTab={tab}
      stats={{
        totalPartners:          partners?.length ?? 0,
        activePartners:         partners?.filter(p => p.status === 'active').length ?? 0,
        pendingApplications:    pendingPartnersCount ?? 0,
        pendingCommissions:     pendingCommissionsCount ?? 0,
        readyToApprove:         readyToApproveCount ?? 0,
        totalEarned,
        totalPending,
      }}
    />
  );
}