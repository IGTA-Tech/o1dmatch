import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createInterestLetterDocument } from '@/lib/signwell';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { letter_id } = body;

    if (!letter_id) {
      return NextResponse.json(
        { error: 'letter_id is required' },
        { status: 400 }
      );
    }

    // Get employer profile
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('id, company_name, signatory_name, signatory_email')
      .eq('user_id', user.id)
      .single();

    if (!employerProfile) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    // Get interest letter
    const { data: letter } = await adminSupabase
      .from('interest_letters')
      .select(`
        *,
        talent:talent_profiles(
          id,
          user_id,
          first_name,
          last_name
        ),
        job:job_listings(
          id,
          title
        )
      `)
      .eq('id', letter_id)
      .single();

    if (!letter) {
      return NextResponse.json(
        { error: 'Interest letter not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (letter.employer_id !== employerProfile.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if already signed or pending
    if (letter.signwell_document_id) {
      return NextResponse.json(
        { error: 'Signature already requested for this letter' },
        { status: 400 }
      );
    }

    // Get talent user email
    const { data: talentUser } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', letter.talent?.user_id)
      .single();

    if (!talentUser?.email) {
      return NextResponse.json(
        { error: 'Talent email not found' },
        { status: 400 }
      );
    }

    const talentName = `${letter.talent?.first_name || ''} ${letter.talent?.last_name || ''}`.trim() || 'Talent';
    const employerName = employerProfile.signatory_name || employerProfile.company_name;
    const employerEmail = employerProfile.signatory_email;

    if (!employerEmail) {
      return NextResponse.json(
        { error: 'Employer signatory email not configured' },
        { status: 400 }
      );
    }

    // Create SignWell document
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://o1dmatch.vercel.app';

    const signwellDoc = await createInterestLetterDocument({
      letterTitle: `Interest Letter - ${letter.job?.title || 'Position'}`,
      letterContent: letter.content || '',
      talentName,
      talentEmail: talentUser.email,
      employerName,
      employerEmail,
      letterId: letter_id,
      redirectUrl: `${baseUrl}/dashboard/talent/letters`,
    });

    // Update letter with SignWell document ID
    const { error: updateError } = await adminSupabase
      .from('interest_letters')
      .update({
        signwell_document_id: signwellDoc.id,
        signwell_status: 'pending',
        signature_requested_at: new Date().toISOString(),
      })
      .eq('id', letter_id);

    if (updateError) {
      console.error('Failed to update letter:', updateError);
      throw updateError;
    }

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: 'signature_requested',
      entity_type: 'interest_letter',
      entity_id: letter_id,
      metadata: {
        signwell_document_id: signwellDoc.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        document_id: signwellDoc.id,
        status: 'pending',
        signers: signwellDoc.signers,
      },
    });
  } catch (error) {
    console.error('SignWell send error:', error);
    return NextResponse.json(
      { error: 'Failed to request signature' },
      { status: 500 }
    );
  }
}
