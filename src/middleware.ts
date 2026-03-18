// src/middleware.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ── Visitor tracking config ───────────────────────────────────────────────
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Paths to skip for page-view tracking
const TRACKING_SKIP = ['/_next', '/api/', '/favicon', '/robots', '/sitemap', '/static', '/__'];
const PRODUCTION_HOST = 'app.o1dmatch.com';

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ============================================
  // PROTECTED ROUTES - Only these require authentication
  // ============================================
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/account',
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // ============================================
  // AUTH ROUTES - Redirect to dashboard if already logged in
  // ============================================
  const authRoutes = ['/login', '/signup', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ============================================
  // PROTECTED ROUTE HANDLING
  // ============================================
  
  // Only check authentication for protected routes
  if (isProtectedRoute) {
    // If not logged in, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // ============================================
    // ADMIN ROUTES - Require admin role
    // ============================================
    if (pathname.startsWith('/dashboard/admin')) {
      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        // Not an admin, redirect to their appropriate dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // All other routes (public pages, unknown URLs) - let them through
  // Next.js will show 404 for pages that don't exist

  // ── Fire-and-forget page view tracking ───────────────────────────────────
  // Only tracks requests from the production domain (app.o1dmatch.com).
  // Local dev (localhost:3000) is excluded so reports show real usage only.
  const host = request.headers.get('host') || '';
  const isProduction = host === PRODUCTION_HOST;
  const shouldTrack = isProduction && !TRACKING_SKIP.some(prefix => pathname.startsWith(prefix));
  if (shouldTrack) {
    fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        path:       pathname,
        ip_address: getIp(request),
        user_agent: request.headers.get('user-agent') || null,
        referrer:   request.headers.get('referer')    || null,
      }),
    }).catch(() => {
      // Swallow silently — never crash the page over analytics
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};