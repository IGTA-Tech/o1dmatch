// src/app/pricing/page.tsx
// Server component wrapper — fetches user session so Navbar renders correctly,
// then renders the client pricing component inside Suspense.
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';
import { PricingPage as PricingPageClient } from './pricingclient';

export const metadata = {
  title: 'Pricing | O1DMatch',
  description: 'Choose the plan that fits your needs.',
};

export default async function PricingPageWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch role so the client already knows which tab to show
  let role: 'employer' | 'talent' | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role === 'employer') role = 'employer';
    else if (profile?.role === 'talent') role = 'talent';
  }

  return (
    <div className="o1d-page">
      {/* Navbar is rendered server-side so it always has the correct auth state */}
      <Navbar />

      <Suspense
        fallback={
          <div className="o1d-page" style={{ minHeight: '100vh' }}>
            <div className="o1d-loading-wrap"><div className="o1d-spinner" /></div>
          </div>
        }
      >
        <PricingPageClient
          initialUserId={user?.id ?? null}
          initialRole={role}
        />
      </Suspense>
    </div>
  );
}