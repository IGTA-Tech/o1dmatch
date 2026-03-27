// src/app/(dashboard)/dashboard/agency/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AgencySidebar from './AgencySidebar';

export default async function AgencyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'agency') {
    redirect('/dashboard');
  }

  // Fetch agency profile for sidebar display
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('agency_name')
    .eq('user_id', user.id)
    .single();

  const agencyName = agencyProfile?.agency_name || 'My Agency';
  const agencyInitials = agencyName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // ── AFFILIATE: check if this agency is an active partner ──
  const { data: affiliatePartner } = await supabase
    .from('affiliate_partners')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPartner = affiliatePartner?.status === 'active';
  // ── END AFFILIATE ─────────────────────────────────────────

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <AgencySidebar
        agencyName={agencyName}
        agencyInitials={agencyInitials}
        isPartner={isPartner}
      >
        {children}
      </AgencySidebar>
    </>
  );
}