// src/app/(dashboard)/dashboard/admin/enterprise-tiers/page.tsx

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { TIERS } from '@/lib/tiers';
import AssignTierClient from './AssignTierClient';
import type { EnterpriseInquiry } from './AssignTierClient';

export type { UserRow } from './types';
import type { UserRow } from './types';

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EnterpriseTiersAdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: adminProfile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') redirect('/dashboard');

  const { data: usersRaw } = await adminSupabase
    .from('profiles')
    .select('id, email, full_name, role, company_name, law_firm, created_at')
    .in('role', ['employer', 'agency', 'lawyer'])
    .order('created_at', { ascending: false });

  const userIds = (usersRaw ?? []).map((u) => u.id);

  const [
    { data: tierAssignments },
    { data: lawyerPartners },
    { data: inquiriesRaw },
  ] = await Promise.all([
    adminSupabase.from('enterprise_tier_assignments').select('user_id, tier_key').in('user_id', userIds),
    adminSupabase.from('lawyer_profiles').select('user_id, is_partner').in('user_id', userIds),
    adminSupabase.from('enterprise_inquiries').select('*').order('created_at', { ascending: false }),
  ]);

  const tierMap = new Map<string, string[]>();
  for (const a of tierAssignments ?? []) {
    tierMap.set(a.user_id, [...(tierMap.get(a.user_id) ?? []), a.tier_key]);
  }

  const partnerMap = new Map(
    (lawyerPartners ?? []).map((l) => [l.user_id, l.is_partner ?? false])
  );

  const users: UserRow[] = (usersRaw ?? []).map((u) => {
    const tiers = tierMap.get(u.id) ?? [];
    return {
      ...u,
      assigned_tiers: tiers,
      assigned_tier:  tiers[0] ?? null,
      is_partner:     partnerMap.get(u.id) ?? false,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Tier Assignment</h1>
        <p className="text-gray-600 mt-1">
          Assign enterprise plans to employers, agencies, and attorney partners.
          Agency users can be assigned both Professional and Enterprise plans simultaneously.
        </p>
      </div>
      <AssignTierClient
        users={users}
        tiers={TIERS}
        inquiries={(inquiriesRaw ?? []) as EnterpriseInquiry[]}
      />
    </div>
  );
}