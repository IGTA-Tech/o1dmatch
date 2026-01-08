import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LawyerProfileForm from './LawyerProfileForm';

export default async function LawyerProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get lawyer profile with correct column names
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get user profile for default values
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <LawyerProfileForm
      lawyerProfile={lawyerProfile}
      userProfile={userProfile}
      userId={user.id}
      userEmail={user.email || ''}
    />
  );
}