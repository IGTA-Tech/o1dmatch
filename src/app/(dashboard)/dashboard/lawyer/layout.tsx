import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from "@/components/Navbar";

export default async function LawyerDashboardLayout({
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

  if (profile?.role !== 'lawyer') {
    redirect('/dashboard');
  }

  return (
    <>
      <div className="space-y-6 pt-20"><Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {children}
        </main>
      </div>
    </>
  );
}
