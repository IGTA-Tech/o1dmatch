import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Dev: http://localhost:3001/api  |  Prod: https://visaclear.io/api
const VISACLEAR_BASE = process.env.VISACLEAR_API_BASE || 'http://localhost:3001/api';

// Map platform names to visaclear API paths
const PLATFORM_ENDPOINTS: Record<string, string> = {
  reddit: '/reddit/scan',
  twitter: '/twitter/scan',
  instagram: '/instagram/scan',
  youtube: '/youtube/scan',
  tiktok: '/tiktok/profile-scan',
  text: '/text/scan',
};

/**
 * POST /api/social-scanner
 *
 * Proxy to visaclear scan APIs.
 * Forwards all body fields to the appropriate platform endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, ...payload } = body;
    console.log(body);
    if (!platform || !PLATFORM_ENDPOINTS[platform]) {
      return NextResponse.json(
        { error: `Invalid platform. Supported: ${Object.keys(PLATFORM_ENDPOINTS).join(', ')}` },
        { status: 400 }
      );
    }

    const endpoint = `${VISACLEAR_BASE}${PLATFORM_ENDPOINTS[platform]}`;
    console.log(`[SOCIAL SCANNER] Proxying to: ${endpoint}`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Check if response is JSON (not HTML)
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error(`[SOCIAL SCANNER] Non-JSON response from ${endpoint}:`, text.slice(0, 200));
      return NextResponse.json(
        { error: `VisaClear API returned non-JSON response. Check that ${endpoint} is accessible.` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Scan failed', details: data },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, platform, ...data });
  } catch (error: unknown) {
    console.error('[SOCIAL SCANNER] Proxy error:', error);

    // Better error messages for common issues
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: `Cannot connect to VisaClear API at ${VISACLEAR_BASE}. Make sure visaclear is running.` },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/social-scanner
 */
export async function GET() {
  return NextResponse.json({
    message: 'Social Media Scanner - powered by VisaClear',
    api_base: VISACLEAR_BASE,
    supported_platforms: Object.keys(PLATFORM_ENDPOINTS),
  });
}