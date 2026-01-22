// src/app/api/admin/letters/forward-signature/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await (supabase as any).auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { letterId, adminNotes } = body;

    if (!letterId) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    // Get the letter to verify it exists and has a signature pending review
    const { data: letter, error: letterError } = await supabase
      .from('interest_letters')
      .select('id, signature_status, talent_signature_data')
      .eq('id', letterId)
      .single();

    if (letterError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    if (letter.signature_status !== 'admin_reviewing') {
      return NextResponse.json(
        { error: 'This letter is not pending signature review' },
        { status: 400 }
      );
    }

    if (!letter.talent_signature_data) {
      return NextResponse.json(
        { error: 'No signature found on this letter' },
        { status: 400 }
      );
    }

    // Update the letter
    const updateData: Record<string, unknown> = {
      signature_status: 'forwarded_to_employer',
      signature_reviewed_at: new Date().toISOString(),
      signature_reviewed_by: user.id,
      forwarded_to_employer_at: new Date().toISOString(),
      // ADDED: This field is checked by employer page to reveal contact info
      employer_received_signed_at: new Date().toISOString(),
    };

    // Append admin notes if provided
    if (adminNotes) {
      // Get existing admin notes and append
      const { data: existingLetter } = await supabase
        .from('interest_letters')
        .select('admin_notes')
        .eq('id', letterId)
        .single();

      if (existingLetter?.admin_notes) {
        updateData.admin_notes = `${existingLetter.admin_notes}\n\n[Signature Review] ${adminNotes}`;
      } else {
        updateData.admin_notes = `[Signature Review] ${adminNotes}`;
      }
    }

    const { error: updateError } = await supabase
      .from('interest_letters')
      .update(updateData)
      .eq('id', letterId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update letter' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error forwarding signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}