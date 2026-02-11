import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function getUserId() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[visa-eval API] getUser error:', error.message);
      return { supabase, userId: null };
    }
    console.log('[visa-eval API] Authenticated user:', user?.id);
    return { supabase, userId: user?.id ?? null };
  } catch (err) {
    console.error('[visa-eval API] Auth failed:', err);
    const supabase = await createClient();
    return { supabase, userId: null };
  }
}

export async function GET() {
  try {
    const { supabase, userId } = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('visa_evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[visa-eval API] Select error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[visa-eval API] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[visa-eval API] POST body received:', {
      full_name: body.full_name,
      email: body.email,
      visa_type: body.visa_type,
      job_id: body.job_id,
    });

    const { supabase, userId } = await getUserId();
    console.log('[visa-eval API] userId for insert:', userId);

    const insertPayload = {
      user_id: userId,
      full_name: body.full_name,
      email: body.email,
      visa_type: body.visa_type,
      industry: body.industry || null,
      linkedin_url: body.linkedin_url || null,
      story: body.story || null,
      links: body.links || [],
      job_id: body.job_id || null,
      status: body.status || 'pending',
      status_url: body.status_url || null,
      api_message: body.api_message || null,
      api_response: body.api_response || null,
    };

    console.log('[visa-eval API] Inserting...');

    const { data, error } = await supabase
      .from('visa_evaluations')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[visa-eval API] Insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }

    console.log('[visa-eval API] Insert success, id:', data?.id);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[visa-eval API] POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}