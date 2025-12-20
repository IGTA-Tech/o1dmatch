import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail, documentVerified, documentRejected } from '@/lib/email';
import { O1_CRITERIA, O1Criterion } from '@/types/enums';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      document_id,
      action,
      score_impact,
      criterion,
      reviewer_notes,
    } = body;

    if (!document_id || !action) {
      return NextResponse.json(
        { error: 'document_id and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'needs_review'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be approve, reject, or needs_review' },
        { status: 400 }
      );
    }

    // Get document
    const { data: document } = await adminSupabase
      .from('talent_documents')
      .select('*, talent:talent_profiles(id, user_id)')
      .eq('id', document_id)
      .single();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const status = action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'needs_review';

    const updateData: Record<string, unknown> = {
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewer_notes || null,
    };

    // Update score impact and criterion if provided
    if (action === 'approve') {
      if (score_impact !== undefined) {
        updateData.score_impact = score_impact;
      }
      if (criterion) {
        updateData.criterion = criterion;
      }
    }

    // Update document
    const { error: updateError } = await adminSupabase
      .from('talent_documents')
      .update(updateData)
      .eq('id', document_id);

    if (updateError) {
      throw updateError;
    }

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: `document_${action}d`,
      entity_type: 'talent_document',
      entity_id: document_id,
      metadata: {
        talent_id: document.talent_id,
        status,
        score_impact,
        criterion,
      },
    });

    // Recalculate score if document was verified or rejected
    let newScore = 0;
    if (action === 'approve' || action === 'reject') {
      const scoreResponse = await fetch(`${request.nextUrl.origin}/api/calculate-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talent_id: document.talent_id }),
      });
      const scoreData = await scoreResponse.json();
      newScore = scoreData?.data?.o1_score || 0;
    }

    // Send email notification to talent
    try {
      // Get talent user details
      const { data: talentUser } = await adminSupabase
        .from('profiles')
        .select('email')
        .eq('id', document.talent?.user_id)
        .single();

      const { data: talentProfile } = await adminSupabase
        .from('talent_profiles')
        .select('first_name')
        .eq('id', document.talent_id)
        .single();

      if (talentUser?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const talentName = talentProfile?.first_name || 'there';

        if (action === 'approve') {
          const criterionName = criterion
            ? O1_CRITERIA[criterion as O1Criterion]?.name || criterion
            : 'O-1 Evidence';

          await sendEmail({
            to: talentUser.email,
            template: documentVerified({
              talentName,
              documentTitle: document.title,
              criterion: criterionName,
              scoreImpact: score_impact || 0,
              newScore,
              dashboardUrl: `${baseUrl}/dashboard/talent/evidence`,
            }),
          });
        } else if (action === 'reject') {
          await sendEmail({
            to: talentUser.email,
            template: documentRejected({
              talentName,
              documentTitle: document.title,
              reason: 'The document did not meet the criteria requirements.',
              reviewerNotes: reviewer_notes,
              dashboardUrl: `${baseUrl}/dashboard/talent/evidence`,
            }),
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send document verification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: { status },
    });
  } catch (error) {
    console.error('Document verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
}
