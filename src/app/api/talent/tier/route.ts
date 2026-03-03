// import { NextRequest, NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Use service role key — server-side only, bypasses RLS
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Extract access token from Supabase auth cookies
    let accessToken: string | null = null;
    const allCookies = cookieStore.getAll();

    // Log cookie names for debugging (no values for security)
    const cookieNames = allCookies.map(c => c.name).filter(n => n.includes('auth'));
    console.log('[TALENT TIER] Auth cookie names found:', cookieNames);

    for (const cookie of allCookies) {
      if (cookie.name.includes('auth-token')) {
        try {
          const decoded = JSON.parse(cookie.value);
          if (Array.isArray(decoded) && decoded[0]) {
            accessToken = decoded[0];
            break;
          } else if (decoded.access_token) {
            accessToken = decoded.access_token;
            break;
          }
        } catch {
          if (cookie.value.startsWith('ey')) {
            accessToken = cookie.value;
            break;
          }
        }
      }
    }

    // Fallback: combine chunked cookies (sb-xxx-auth-token.0, .1, etc.)
    if (!accessToken) {
      const chunkCookies = allCookies
        .filter(c => c.name.includes('auth-token'))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (chunkCookies.length > 0) {
        const combined = chunkCookies.map(c => c.value).join('');
        try {
          const decoded = JSON.parse(combined);
          if (Array.isArray(decoded) && decoded[0]) {
            accessToken = decoded[0];
          } else if (decoded.access_token) {
            accessToken = decoded.access_token;
          }
        } catch {
          if (combined.startsWith('ey')) {
            accessToken = combined;
          }
        }
      }
    }

    if (!accessToken) {
      console.log('[TALENT TIER] No access token found');
      return NextResponse.json({ tier: 'profile_only' });
    }

    // Decode user ID from JWT
    let userId: string | null = null;
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        userId = payload.sub;
      }
    } catch {
      console.log('[TALENT TIER] Failed to decode JWT');
      return NextResponse.json({ tier: 'profile_only' });
    }

    if (!userId) {
      console.log('[TALENT TIER] No userId in JWT');
      return NextResponse.json({ tier: 'profile_only' });
    }

    console.log('[TALENT TIER] userId:', userId);

    // Query using SERVICE ROLE KEY (bypasses RLS, no auth token issues)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `${supabaseUrl}/rest/v1/talent_subscriptions?talent_id=eq.${userId}&select=tier`;
    console.log('[TALENT TIER] Fetching:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const tier = data?.[0]?.tier || 'profile_only';
      console.log('[TALENT TIER] Result:', tier);
      return NextResponse.json({ tier });
    }

    // Log the actual error body for debugging
    const errorBody = await response.text();
    console.log('[TALENT TIER] Supabase REST failed:', response.status, errorBody);
    return NextResponse.json({ tier: 'profile_only' });
  } catch (error) {
    console.error('[TALENT TIER] Error:', error);
    return NextResponse.json({ tier: 'profile_only' });
  }
}