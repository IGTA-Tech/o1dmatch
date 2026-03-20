// src/app/api/messaging/admin/conversations/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
        id, candidate_id, professional_headline, city, state, o1_score, user_id
      ),
      employer:employer_profiles(
        id, company_name, city, state, user_id
      ),
      agency:agency_profiles(
        id, agency_name, city, state, user_id
      )
    `)
    .order('last_message_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Collect user_ids and fetch profiles
  const userIds = new Set<string>();
  for (const c of conversations ?? []) {
    const talent   = Array.isArray(c.talent)   ? c.talent[0]   : c.talent;
    const employer = Array.isArray(c.employer) ? c.employer[0] : c.employer;
    const agency   = Array.isArray(c.agency)   ? c.agency[0]   : c.agency;
    if (talent?.user_id)   userIds.add(talent.user_id);
    if (employer?.user_id) userIds.add(employer.user_id);
    if (agency?.user_id)   userIds.add(agency.user_id);
  }

  const { data: profiles } = userIds.size > 0
    ? await admin.from('profiles').select('id, full_name, email').in('id', Array.from(userIds))
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => [p.id, p]));

  const enriched = (conversations ?? []).map(c => {
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

  return NextResponse.json({ conversations: enriched });
}