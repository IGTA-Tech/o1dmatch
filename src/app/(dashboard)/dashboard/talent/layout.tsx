import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TalentSidebar from './TalentSidebar';

export default async function TalentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user is a talent
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'talent') {
    redirect('/dashboard');
  }

  const fullName = profile?.full_name || user.email?.split('@')[0] || 'Talent';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TalentSidebar talentName={fullName} talentInitials={initials}>
      {children}
    </TalentSidebar>
  );
}