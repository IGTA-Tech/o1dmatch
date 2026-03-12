// src/app/api/lawyer/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { profileId, ...profileData } = body;

  // Always force user_id to the authenticated user — never trust the client
  profileData.user_id = session.user.id;

  let error;

  if (profileId) {
    // Update — verify ownership
    const { error: updateErr } = await supabase
      .from('lawyer_profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .eq('user_id', session.user.id);
    error = updateErr;
  } else {
    // Insert / upsert
    const { error: upsertErr } = await supabase
      .from('lawyer_profiles')
      .upsert(
        { ...profileData, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    error = upsertErr;
  }

  if (error) {
    console.error('[api/lawyer/profile] DB error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}