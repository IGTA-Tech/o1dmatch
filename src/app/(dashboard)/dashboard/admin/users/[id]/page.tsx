// src/app/(dashboard)/dashboard/admin/users/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditableUserForm } from './EditableUserForm';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    redirect('/dashboard/admin/users');
  }

  // Get additional profile data based on role
  let additionalData = null;

  if (profile.role === 'talent') {
    const { data } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;
  } else if (profile.role === 'employer') {
    const { data } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;
  } else if (profile.role === 'lawyer') {
    const { data } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;
  }

  return (
    <EditableUserForm
      profile={profile}
      additionalData={additionalData}
    />
  );
}