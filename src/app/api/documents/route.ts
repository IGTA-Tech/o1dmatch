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

    // Get talent profile
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      file_url,
      file_name,
      file_type,
      file_size,
      content,
      criterion,
      score_impact,
      confidence,
      reasoning,
    } = body;

    if (!title || !file_url) {
      return NextResponse.json(
        { error: 'Title and file_url are required' },
        { status: 400 }
      );
    }

    // Create document record
    const { data: document, error: docError } = await adminSupabase
      .from('talent_documents')
      .insert({
        talent_id: talentProfile.id,
        title,
        description: description || null,
        file_url,
        file_name: file_name || null,
        file_type: file_type || null,
        file_size: file_size || null,
        extracted_content: content || null,
        criterion: criterion || null,
        score_impact: score_impact || 0,
        confidence: confidence || null,
        ai_reasoning: reasoning || null,
        status: 'pending',
      })
      .select()
      .single();

    if (docError) {
      throw docError;
    }

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: 'document_uploaded',
      entity_type: 'talent_document',
      entity_id: document.id,
      metadata: {
        title,
        criterion,
        score_impact,
      },
    });

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get talent profile
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    // Get documents
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const criterion = searchParams.get('criterion');

    let query = supabase
      .from('talent_documents')
      .select('*')
      .eq('talent_id', talentProfile.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (criterion) {
      query = query.eq('criterion', criterion);
    }

    const { data: documents, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get talent profile
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify document belongs to talent
    const { data: document } = await supabase
      .from('talent_documents')
      .select('id, file_url')
      .eq('id', documentId)
      .eq('talent_id', talentProfile.id)
      .single();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from storage if applicable
    if (document.file_url && document.file_url.includes('supabase')) {
      const path = document.file_url.split('/').slice(-2).join('/');
      await adminSupabase.storage.from('documents').remove([path]);
    }

    // Delete document record
    const { error } = await adminSupabase
      .from('talent_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw error;
    }

    // Recalculate score
    await fetch(`${request.nextUrl.origin}/api/calculate-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ talent_id: talentProfile.id }),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
