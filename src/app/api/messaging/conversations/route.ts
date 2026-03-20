// src/app/api/messaging/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// ── Helper: extract token from cookies (avoids getSession() hanging) ──────────
function getTokenFromCookies(): string | null {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.includes('access_token') || cookie.name.includes('auth-token')) {
      return cookie.value;
    }
  }
  // Try sb- cookie pattern
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        return parsed.access_token ?? null;
      } catch {
        return cookie.value;
      }
    }
  }
  return null;
}

// GET /api/messaging/conversations
// Returns all conversations for the authenticated user (any role)
export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Detect role and fetch conversations accordingly
  const [{ data: talentProfile }, { data: employerProfile }, { data: agencyProfile }] =
    await Promise.all([
      supabase.from('talent_profiles').select('id').eq('user_id', user.id).single(),
      supabase.from('employer_profiles').select('id').eq('user_id', user.id).single(),
      supabase.from('agency_profiles').select('id').eq('user_id', user.id).single(),
    ]);

  let query = supabase
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
        bio,
        city,
        state,
        o1_score
      ),
      employer:employer_profiles(
        id,
        company_name,
        city,
        state
      ),
      agency:agency_profiles(
        id,
        agency_name,
        city,
        state
      )
    `)
    .order('last_message_at', { ascending: false });

  if (talentProfile) {
    query = query.eq('talent_id', talentProfile.id);
  } else if (employerProfile) {
    query = query.eq('employer_id', employerProfile.id);
  } else if (agencyProfile) {
    query = query.eq('agency_id', agencyProfile.id);
  } else {
    return NextResponse.json({ error: 'No profile found' }, { status: 403 });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ conversations: data ?? [], role: talentProfile ? 'talent' : employerProfile ? 'employer' : 'agency' });
}

// POST /api/messaging/conversations
// Create a new conversation (Employer or Agency only)
// Body: { talent_id: string, subject?: string, first_message: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { talent_id, subject, first_message } = body;

  if (!talent_id || !first_message?.trim()) {
    return NextResponse.json({ error: 'talent_id and first_message are required' }, { status: 400 });
  }

  // Identify sender role
  const [{ data: employerProfile }, { data: agencyProfile }] = await Promise.all([
    supabase.from('employer_profiles').select('id').eq('user_id', user.id).single(),
    supabase.from('agency_profiles').select('id').eq('user_id', user.id).single(),
  ]);

  if (!employerProfile && !agencyProfile) {
    return NextResponse.json({ error: 'Only employers or agencies can start conversations' }, { status: 403 });
  }

  const senderRole: 'employer' | 'agency' = employerProfile ? 'employer' : 'agency';

  // Check if conversation already exists for this pair
  const existingQuery = supabase
    .from('conversations')
    .select('id')
    .eq('talent_id', talent_id);

  if (senderRole === 'employer') {
    existingQuery.eq('employer_id', employerProfile!.id);
  } else {
    existingQuery.eq('agency_id', agencyProfile!.id);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  let conversationId: string;

  if (existing) {
    conversationId = existing.id;
  } else {
    // Create conversation
    const convData: Record<string, unknown> = {
      talent_id,
      subject: subject?.trim() || null,
      last_message_text: first_message.trim().slice(0, 120),
      last_message_at: new Date().toISOString(),
      talent_unread: 1,
      sender_unread: 0,
    };
    if (senderRole === 'employer') convData.employer_id = employerProfile!.id;
    else convData.agency_id = agencyProfile!.id;

    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert(convData)
      .select('id')
      .single();

    if (convError) return NextResponse.json({ error: convError.message }, { status: 500 });
    conversationId = newConv.id;
  }

  // Insert the first message
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_role: senderRole,
    sender_user_id: user.id,
    body: first_message.trim(),
  });

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  return NextResponse.json({ conversation_id: conversationId }, { status: 201 });
}