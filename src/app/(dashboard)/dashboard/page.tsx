import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardRedirect() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Redirect based on role
  switch (profile.role) {
    case 'talent':
      redirect('/dashboard/talent');
    case 'employer':
      redirect('/dashboard/employer');
    case 'agency':
      redirect('/dashboard/agency');
    case 'lawyer':
      redirect('/dashboard/lawyer');
    case 'admin':
      redirect('/admin');
    default:
      redirect('/');
  }
}
