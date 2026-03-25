// src/app/(dashboard)/dashboard/lawyer/layout.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LawyerSidebar from './LawyerSidebar';

export default async function LawyerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'lawyer') redirect('/dashboard');

  // Fetch lawyer profile for sidebar (is_partner badge + display name)
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('name, is_partner')
    .eq('user_id', user.id)
    .single();

  const lawyerName = lawyerProfile?.name || profile?.full_name || 'Attorney';
  const isPartner  = lawyerProfile?.is_partner ?? false;

  const lawyerInitials = lawyerName
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
      <LawyerSidebar
        lawyerName={lawyerName}
        lawyerInitials={lawyerInitials}
        isPartner={isPartner}
      >
        {children}
      </LawyerSidebar>
    </>
  );
}