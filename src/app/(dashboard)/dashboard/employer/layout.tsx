import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployerSidebar from './EmployerSidebar';

export default async function EmployerDashboardLayout({
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'employer') {
    redirect('/dashboard');
  }

  // Fetch employer profile for sidebar display
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('company_name')
    .eq('user_id', user.id)
    .single();

  const companyName = employerProfile?.company_name || 'My Company';
  const companyInitials = companyName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <EmployerSidebar
        companyName={companyName}
        companyInitials={companyInitials}
      >
        {children}
      </EmployerSidebar>
    </>
  );
}