// src/app/api/messaging/conversations/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

type Params = { params: { id: string } };

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Extract user_id from cookie token — bypasses hanging getUser() SDK call
async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        const token = parsed.access_token ?? parsed;
        if (!token) continue;
        // Decode JWT payload (no verify — server-side only, just need user id)
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64url').toString('utf8')
        );
        return payload.sub ?? null;
      }
    }
  } catch {
    // fallback below
  }
  return null;
}

// PATCH /api/messaging/conversations/[id]/read
// Marks the conversation as read for the current user's role
export async function PATCH(_req: NextRequest, { params }: Params) {
  const convId = params.id;

  // Try cookie-based auth first (avoids hanging SDK)
  let userId = await getUserIdFromCookies();

  // Fallback to SDK if cookie parse failed
  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getAdminClient();

  // Fetch conversation
  const { data: conv, error: convError } = await admin
    .from('conversations')
    .select('id, talent_id, employer_id, agency_id')
    .eq('id', convId)
    .single();

  if (convError || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Identify which side to reset
  const [{ data: talentProfile }, { data: employerProfile }, { data: agencyProfile }] =
    await Promise.all([
      admin.from('talent_profiles').select('id').eq('user_id', userId).single(),
      admin.from('employer_profiles').select('id').eq('user_id', userId).single(),
      admin.from('agency_profiles').select('id').eq('user_id', userId).single(),
    ]);

  const isTalent   = talentProfile   && conv.talent_id   === talentProfile.id;
  const isEmployer = employerProfile && conv.employer_id === employerProfile.id;
  const isAgency   = agencyProfile   && conv.agency_id   === agencyProfile.id;

  if (!isTalent && !isEmployer && !isAgency) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updateField = isTalent ? { talent_unread: 0 } : { sender_unread: 0 };

  const { error: updateError } = await admin
    .from('conversations')
    .update(updateField)
    .eq('id', convId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}