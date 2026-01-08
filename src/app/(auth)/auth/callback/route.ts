import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail, welcomeEmail } from '@/lib/email';

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
          .select('role, full_name, welcome_email_sent')
          .eq('id', user.id)
          .single();

        // Send welcome email on first login (if not already sent)
        if (profile && !profile.welcome_email_sent) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
          const dashboardPath = profile.role ? `/dashboard/${profile.role}` : '/dashboard';

          try {
            await sendEmail({
              to: user.email!,
              template: welcomeEmail({
                name: profile.full_name || user.email?.split('@')[0] || 'there',
                role: profile.role || 'talent',
                dashboardUrl: `${baseUrl}${dashboardPath}`,
              }),
            });

            // Mark welcome email as sent
            await supabase
              .from('profiles')
              .update({ welcome_email_sent: true })
              .eq('id', user.id);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the callback if email fails
          }
        }

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
