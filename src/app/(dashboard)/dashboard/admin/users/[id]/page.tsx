// src/app/(dashboard)/dashboard/admin/users/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { EditableUserForm } from './EditableUserForm';

// Service role client — bypasses RLS for all admin data reads
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Use regular client only for auth + admin verification
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') redirect('/dashboard');

  // ── All data fetches below use service role (bypasses RLS) ──

  // Get target user's profile
  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) redirect('/dashboard/admin/users');

  // Get role-specific profile data
  let additionalData = null;

  if (profile.role === 'talent') {
    const { data } = await adminSupabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;

  } else if (profile.role === 'employer') {
    const { data } = await adminSupabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;

  } else if (profile.role === 'lawyer') {
    const { data } = await adminSupabase
      .from('lawyer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (data) {
      additionalData = data;
    } else {
      // Auto-create missing lawyer_profiles row
      const { data: newRecord } = await adminSupabase
        .from('lawyer_profiles')
        .insert({
          user_id:       id,
          attorney_name: profile.full_name || 'Attorney',
          firm_name:     '',
          contact_email: profile.email || '',
          is_active:     false,
          is_partner:    false,
        })
        .select('*')
        .single();
      additionalData = newRecord;
    }

  } else if (profile.role === 'agency') {
    // Fetch agency_profiles and affiliate_partners in parallel
    const [{ data: agencyData }, { data: affiliatePartner }] = await Promise.all([
      adminSupabase
        .from('agency_profiles')
        .select('*')
        .eq('user_id', id)
        .single(),
      adminSupabase
        .from('affiliate_partners')
        .select('id, affiliate_code, status')
        .eq('user_id', id)
        .maybeSingle(),
    ]);

    const isActivePartner = affiliatePartner?.status === 'active';

    if (agencyData) {
      additionalData = { ...agencyData, is_partner: isActivePartner };
    } else {
      // Auto-create missing agency_profiles row
      const { data: newRecord } = await adminSupabase
        .from('agency_profiles')
        .insert({
          user_id:       id,
          agency_name:   profile.full_name || 'My Agency',
          contact_name:  profile.full_name || '',
          contact_email: profile.email     || '',
        })
        .select('*')
        .single();
      additionalData = newRecord
        ? { ...newRecord, is_partner: isActivePartner }
        : { is_partner: isActivePartner };
    }
  }

  // Get subscription data
  let subscriptionData = null;

  if (profile.role === 'talent') {
    const { data } = await adminSupabase
      .from('talent_subscriptions')
      .select('*')
      .eq('talent_id', id)
      .single();
    subscriptionData = data;

  } else if (profile.role === 'employer') {
    const { data } = await adminSupabase
      .from('employer_subscriptions')
      .select('*')
      .eq('employer_id', id)
      .single();
    subscriptionData = data;
  }

  return (
    <EditableUserForm
      profile={profile}
      additionalData={additionalData}
      subscriptionData={subscriptionData}
    />
  );
}