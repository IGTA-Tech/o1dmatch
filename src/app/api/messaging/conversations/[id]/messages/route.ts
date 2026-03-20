// src/app/api/messaging/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: { id: string } };

// GET /api/messaging/conversations/[id]/messages
// Returns all messages + marks them as read
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const convId = params.id;

  // Verify the user is a participant
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      subject,
      talent_unread,
      sender_unread,
      employer_id,
      agency_id,
      talent_id,
      talent:talent_profiles(id, candidate_id, professional_headline, bio, city, state),
      employer:employer_profiles(id, company_name, city, state),
      agency:agency_profiles(id, agency_name, city, state)
    `)
    .eq('id', convId)
    .single();

  if (convError || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Determine role
  const [{ data: talentProfile }, { data: employerProfile }, { data: agencyProfile }] =
    await Promise.all([
      supabase.from('talent_profiles').select('id').eq('user_id', user.id).single(),
      supabase.from('employer_profiles').select('id').eq('user_id', user.id).single(),
      supabase.from('agency_profiles').select('id').eq('user_id', user.id).single(),
    ]);

  const isTalent   = talentProfile   && conv.talent_id   === talentProfile.id;
  const isEmployer = employerProfile && conv.employer_id === employerProfile.id;
  const isAgency   = agencyProfile   && conv.agency_id   === agencyProfile.id;

  if (!isTalent && !isEmployer && !isAgency) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select(`
      id,
      body,
      sender_role,
      sender_user_id,
      is_read,
      created_at,
      sender:profiles!sender_user_id(id, full_name, avatar_url)
    `)
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  // Reset unread count for this user's side
  if (isTalent && conv.talent_unread > 0) {
    await supabase
      .from('conversations')
      .update({ talent_unread: 0 })
      .eq('id', convId);
  } else if ((isEmployer || isAgency) && conv.sender_unread > 0) {
    await supabase
      .from('conversations')
      .update({ sender_unread: 0 })
      .eq('id', convId);
  }

  return NextResponse.json({
    conversation: conv,
    messages: messages ?? [],
    my_role: isTalent ? 'talent' : isEmployer ? 'employer' : 'agency',
  });
}

// POST /api/messaging/conversations/[id]/messages
// Send a reply
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const convId = params.id;
  const body = await req.json();
  const { message } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  // Verify participation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, talent_id, employer_id, agency_id')
    .eq('id', convId)
    .single();

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  const [{ data: talentProfile }, { data: employerProfile }, { data: agencyProfile }] =
    await Promise.all([
      supabase.from('talent_profiles').select('id').eq('user_id', user.id).single(),
      supabase.from('employer_profiles').select('id').eq('user_id', user.id).single(),
      supabase.from('agency_profiles').select('id').eq('user_id', user.id).single(),
    ]);

  let senderRole: 'talent' | 'employer' | 'agency' | null = null;
  if (talentProfile   && conv.talent_id   === talentProfile.id)   senderRole = 'talent';
  if (employerProfile && conv.employer_id === employerProfile.id) senderRole = 'employer';
  if (agencyProfile   && conv.agency_id   === agencyProfile.id)   senderRole = 'agency';

  if (!senderRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: newMsg, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: convId,
      sender_role: senderRole,
      sender_user_id: user.id,
      body: message.trim(),
    })
    .select()
    .single();

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  return NextResponse.json({ message: newMsg }, { status: 201 });
}