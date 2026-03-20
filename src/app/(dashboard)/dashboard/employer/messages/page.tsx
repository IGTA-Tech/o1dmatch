// src/app/(dashboard)/dashboard/employer/messages/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployerMessagesWrapper from './EmployerMessagesWrapper';

export default async function EmployerMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) redirect('/dashboard/employer');

  return (
    <div className="space-y-4">
      <EmployerMessagesWrapper />
    </div>
  );
}