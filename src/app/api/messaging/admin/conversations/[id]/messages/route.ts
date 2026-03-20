// src/app/api/messaging/admin/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type Params = { params: Promise<{ id: string }> };

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/messaging/admin/conversations/[id]/messages
// Admin-only: fetch all messages for any conversation without participant check
export async function GET(_req: NextRequest, { params }: Params) {
  // 1. Verify the caller is an admin
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

  // 2. Await params (required in Next.js 14+)
  const { id: convId } = await params;

  if (!convId) {
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
  }

  // 3. Use service role client — bypasses RLS and participant checks entirely
  const admin = getAdminClient();

  const { data: messages, error: msgError } = await admin
    .from('messages')
    .select(`
      id,
      body,
      sender_role,
      sender_user_id,
      is_read,
      created_at
    `)
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error('[Admin Messages] fetch error:', msgError.message);
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ messages: [] });
  }

  // 4. Enrich with sender profile data (full_name, avatar_url)
  const senderIds = Array.from(new Set(messages.map(m => m.sender_user_id)));

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', senderIds);

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p: { id: string; full_name: string | null; avatar_url: string | null }) => [p.id, p])
  );

  const enriched = messages.map(m => ({
    ...m,
    sender: profileMap[m.sender_user_id] ?? {
      id: m.sender_user_id,
      full_name: null,
      avatar_url: null,
    },
  }));

  return NextResponse.json({ messages: enriched });
}

// DELETE /api/messaging/admin/conversations/[id]/messages
// Body: { message_id: string }
// Admin-only: permanently delete a single message from any conversation
export async function DELETE(req: NextRequest, { params }: Params) {
  // 1. Verify admin
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

  // 2. Parse body
  const body = await req.json().catch(() => ({}));
  const { message_id } = body;

  if (!message_id) {
    return NextResponse.json({ error: 'message_id is required' }, { status: 400 });
  }

  // 3. Await params
  const { id: convId } = await params;

  // 4. Delete via service role — bypasses RLS
  const admin = getAdminClient();

  const { error: deleteError } = await admin
    .from('messages')
    .delete()
    .eq('id', message_id)
    .eq('conversation_id', convId); // safety: only delete from the expected conversation

  if (deleteError) {
    console.error('[Admin Delete Message] error:', deleteError.message);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
