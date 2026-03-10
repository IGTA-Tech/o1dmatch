import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS safely on the server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      lawyer_id,
      requester_id,
      requester_type,
      requester_name,
      requester_email,
      requester_phone,
      message,
      share_profile,
      talent_profile_id,
    } = body;

    // Basic validation
    if (!lawyer_id || !requester_name?.trim() || !requester_email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: lawyer_id, requester_name, requester_email, message' },
        { status: 400 }
      );
    }

    // Verify the lawyer exists and is active
    const { data: lawyer, error: lawyerError } = await supabaseAdmin
      .from('lawyer_profiles')
      .select('id')
      .eq('id', lawyer_id)
      .eq('is_active', true)
      .maybeSingle();

    if (lawyerError || !lawyer) {
      return NextResponse.json(
        { error: 'Lawyer not found or inactive' },
        { status: 404 }
      );
    }

    // Insert the connection request
    const { data, error } = await supabaseAdmin
      .from('lawyer_connection_requests')
      .insert({
        lawyer_id,
        requester_id: requester_id || null,
        requester_type: requester_type || 'talent',
        requester_name: requester_name.trim(),
        requester_email: requester_email.trim(),
        requester_phone: requester_phone?.trim() || null,
        message: message.trim(),
        share_profile: share_profile || false,
        talent_profile_id: share_profile && talent_profile_id ? talent_profile_id : null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Increment connection count — fire and forget, ignore failures
    supabaseAdmin
      .rpc('increment_lawyer_connections', { lawyer_id })
      .then(({ error: rpcError }) => {
        if (rpcError) console.warn('increment_lawyer_connections failed:', rpcError.message);
      });

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}