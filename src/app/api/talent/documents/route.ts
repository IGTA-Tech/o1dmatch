import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Auth — read bearer token from Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await req.formData();
    const file        = formData.get('file')        as File | null;
    const title       = formData.get('title')       as string | null;
    const description = formData.get('description') as string | null;
    const criterion   = formData.get('criterion')   as string | null;
    const confidence  = formData.get('confidence')  as string | null;
    const reasoning   = formData.get('reasoning')   as string | null;

    if (!file || !title || !criterion) {
      return NextResponse.json(
        { error: 'file, title, and criterion are required' },
        { status: 400 }
      );
    }

    // Get talent profile id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Talent profile not found' }, { status: 404 });
    }

    // Upload file to Supabase Storage
    const ext       = file.name.split('.').pop() || 'pdf';
    const fileName  = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes     = await file.arrayBuffer();
    const buffer    = Buffer.from(bytes);

    const { error: storageError } = await supabaseAdmin
      .storage
      .from('talent-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('talent-documents')
      .getPublicUrl(fileName);

    // Determine status based on confidence
    const confNum = confidence ? parseInt(confidence) : 0;
    const status  = confNum >= 85 ? 'verified' : confNum >= 60 ? 'needs_review' : 'pending';

    // Insert document record
    const { data: doc, error: insertError } = await supabaseAdmin
      .from('talent_documents')
      .insert({
        talent_id:                profile.id,
        title:                    title.trim(),
        description:              description?.trim() || null,
        criterion:                criterion,
        file_url:                 publicUrl,
        file_name:                file.name,
        file_size:                file.size,
        file_type:                file.type,
        status:                   status,
        extraction_method:        'ocr',
        classification_confidence: confidence ? parseInt(confidence) : null,
        ai_reasoning:             reasoning || null,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success:        true,
      message:        `Document uploaded and classified with ${status === 'verified' ? 'high' : status === 'needs_review' ? 'medium' : 'low'} confidence`,
      document:       doc,
      status:         status,
      criterion_name: criterion,
      extraction: {
        method:     'ocr',
        confidence: confNum,
      },
      classification: {
        confidence: confNum >= 85 ? 'high' : confNum >= 60 ? 'medium' : 'low',
      },
    });
  } catch (err) {
    console.error('documents route error:', err);
    return NextResponse.json(
      { error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}