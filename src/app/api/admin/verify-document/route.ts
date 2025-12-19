import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

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
    if (action === 'approve' || action === 'reject') {
      await fetch(`${request.nextUrl.origin}/api/calculate-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talent_id: document.talent_id }),
      });
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
