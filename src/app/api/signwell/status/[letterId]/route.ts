import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getDocument } from '@/lib/signwell';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ letterId: string }> }
) {
  try {
    const { letterId } = await params;
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the letter
    const { data: letter } = await adminSupabase
      .from('interest_letters')
      .select(`
        id,
        employer_id,
        talent_id,
        signwell_document_id,
        signwell_status,
        signed_pdf_url,
        signature_requested_at,
        signature_completed_at
      `)
      .eq('id', letterId)
      .single();

    if (!letter) {
      return NextResponse.json(
        { error: 'Letter not found' },
        { status: 404 }
      );
    }

    // Check if user is the employer or talent
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isEmployer = employerProfile && letter.employer_id === employerProfile.id;
    const isTalent = talentProfile && letter.talent_id === talentProfile.id;

    if (!isEmployer && !isTalent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If there's a SignWell document, get the latest status from SignWell
    let signwellStatus = null;
    let signers = null;

    if (letter.signwell_document_id) {
      try {
        const doc = await getDocument(letter.signwell_document_id);
        signwellStatus = doc.status;
        signers = doc.signers.map((s) => ({
          email: s.email,
          name: s.name,
          id: s.id,
        }));

        // Update local status if different
        if (doc.status !== letter.signwell_status) {
          await adminSupabase
            .from('interest_letters')
            .update({
              signwell_status: doc.status === 'completed' ? 'signed' : doc.status,
            })
            .eq('id', letterId);
        }
      } catch (swError) {
        console.error('Failed to get SignWell status:', swError);
        // Use cached status if SignWell API fails
        signwellStatus = letter.signwell_status;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        letter_id: letter.id,
        signwell_document_id: letter.signwell_document_id,
        signwell_status: signwellStatus || letter.signwell_status,
        signed_pdf_url: letter.signed_pdf_url,
        signature_requested_at: letter.signature_requested_at,
        signature_completed_at: letter.signature_completed_at,
        signers,
        can_request_signature: !letter.signwell_document_id && isEmployer,
        can_download_signed: !!letter.signed_pdf_url,
      },
    });
  } catch (error) {
    console.error('SignWell status error:', error);
    return NextResponse.json(
      { error: 'Failed to get signature status' },
      { status: 500 }
    );
  }
}
