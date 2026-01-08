import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your app slow.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile with role if authenticated
  let userRole: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role || null
  }

  const pathname = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/lawyers', '/jobs', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/lawyers/') || pathname.startsWith('/jobs/')
  )

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Role-based route protection
  if (user && userRole) {
    // Talent routes
    if (pathname.startsWith('/dashboard/talent') && userRole !== 'talent') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Employer routes
    if (pathname.startsWith('/dashboard/employer') && userRole !== 'employer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Agency routes
    if (pathname.startsWith('/dashboard/agency') && userRole !== 'agency') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Lawyer routes
    if (pathname.startsWith('/dashboard/lawyer') && userRole !== 'lawyer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Admin routes
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
