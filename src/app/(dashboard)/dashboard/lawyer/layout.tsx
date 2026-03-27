// src/app/(dashboard)/dashboard/lawyer/layout.tsx
// ============================================================
// Wraps every page under /dashboard/lawyer/
// Fetches is_partner from lawyer_profiles and passes it to
// LawyerSidebar so the Affiliate Program nav link shows up
// for partner attorneys.
// ============================================================
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import LawyerSidebar from './LawyerSidebar';

export default async function LawyerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch lawyer profile — need attorney_name and is_partner
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('attorney_name, is_partner')
    .eq('user_id', user.id)
    .single();

  // Build display name + initials
  const name     = lawyerProfile?.attorney_name || user.email?.split('@')[0] || 'Attorney';
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isPartner = lawyerProfile?.is_partner ?? false;

  return (
    <LawyerSidebar
      lawyerName={name}
      lawyerInitials={initials}
      isPartner={isPartner}
    >
      {children}
    </LawyerSidebar>
  );
}