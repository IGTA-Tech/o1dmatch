// src/app/(dashboard)/dashboard/admin/conversations/page.tsx
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import AdminConversationsClient from './AdminConversationsClient';

export default async function AdminConversationsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: fetch conversations with basic profile data (no nested user joins)
  const { data: conversations, error } = await admin
    .from('conversations')
    .select(`
      id,
      subject,
      last_message_at,
      last_message_text,
      talent_unread,
      sender_unread,
      created_at,
      talent:talent_profiles(
        id,
        candidate_id,
        professional_headline,
        city,
        state,
        o1_score,
        user_id
      ),
      employer:employer_profiles(
        id,
        company_name,
        city,
        state,
        user_id
      ),
      agency:agency_profiles(
        id,
        agency_name,
        city,
        state,
        user_id
      )
    `)
    .order('last_message_at', { ascending: false });

  if (error || !conversations) {
    console.error('[AdminConversations] fetch error:', error);
    return <div className="p-8 text-red-500">Failed to load conversations: {error?.message}</div>;
  }

  // Step 2: collect all user_ids from all sides
  const userIds = new Set<string>();
  for (const c of conversations) {
    const talent   = Array.isArray(c.talent)   ? c.talent[0]   : c.talent;
    const employer = Array.isArray(c.employer) ? c.employer[0] : c.employer;
    const agency   = Array.isArray(c.agency)   ? c.agency[0]   : c.agency;
    if (talent?.user_id)   userIds.add(talent.user_id);
    if (employer?.user_id) userIds.add(employer.user_id);
    if (agency?.user_id)   userIds.add(agency.user_id);
  }

  // Step 3: fetch profiles for all collected user_ids in one query
  const { data: profiles } = userIds.size > 0
    ? await admin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', Array.from(userIds))
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

  // Step 4: attach user info manually
  const enriched = conversations.map(c => {
    const talent   = Array.isArray(c.talent)   ? c.talent[0]   : c.talent;
    const employer = Array.isArray(c.employer) ? c.employer[0] : c.employer;
    const agency   = Array.isArray(c.agency)   ? c.agency[0]   : c.agency;

    return {
      ...c,
      talent:   talent   ? { ...talent,   user: profileMap[talent.user_id]   ?? null } : null,
      employer: employer ? { ...employer, user: profileMap[employer.user_id] ?? null } : null,
      agency:   agency   ? { ...agency,   user: profileMap[agency.user_id]   ?? null } : null,
    };
  });

  return <AdminConversationsClient conversations={enriched} />;
}