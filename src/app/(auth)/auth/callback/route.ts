import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user profile to determine role-based redirect
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Redirect based on role
        let redirectPath = '/dashboard';
        if (profile?.role) {
          switch (profile.role) {
            case 'talent':
              redirectPath = '/dashboard/talent';
              break;
            case 'employer':
              redirectPath = '/dashboard/employer';
              break;
            case 'agency':
              redirectPath = '/dashboard/agency';
              break;
            case 'lawyer':
              redirectPath = '/dashboard/lawyer';
              break;
            case 'admin':
              redirectPath = '/admin';
              break;
          }
        }

        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
      }
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin));
}
