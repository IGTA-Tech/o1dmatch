import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role for webhook (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook secret for authentication
const WEBHOOK_SECRET = process.env.CONTENT_MAKER_WEBHOOK_SECRET;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.error('Webhook authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const { title, content, visaType, contentType } = body;
    if (!title || !content || !visaType || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, visaType, contentType' },
        { status: 400 }
      );
    }

    // Generate unique slug with timestamp
    let slug = generateSlug(title);
    const timestamp = Date.now().toString(36);
    slug = `${slug}-${timestamp}`;

    // Prepare article data
    const articleData = {
      title: body.title,
      slug: slug,
      meta_description: body.metaDescription || null,
      content: body.content,
      excerpt: body.excerpt || body.metaDescription || null,
      visa_type: body.visaType,
      content_type: body.contentType,
      target_audience: body.targetAudience || 'Both',
      topic: body.topic || null,
      tags: body.tags || [],
      featured_image_url: body.imageUrl || null,
      reading_time: body.readingTime || '5 min read',
      google_doc_url: body.docUrl || null,
      source_system: 'content-maker-v2',
      news_integration: body.newsIntegration || null,
      rag_integration: body.ragIntegration || null,
      backlink_report: body.backlinkReport || null,
      status: body.autoPublish ? 'published' : 'draft',
      published_at: body.autoPublish ? new Date().toISOString() : null,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Article created: ${data.slug}`);

    return NextResponse.json({
      success: true,
      article: {
        id: data.id,
        slug: data.slug,
        status: data.status,
        url: `https://www.o1dmatch.com/blog/${data.slug}`,
      },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'content-maker-webhook',
    timestamp: new Date().toISOString()
  });
}
