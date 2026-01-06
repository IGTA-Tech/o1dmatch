import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile - use maybeSingle() instead of single()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  console.log('User ID:', user.id);
  console.log('Profile:', profile);
  console.log('Error:', error);

  // If no profile exists, create one
  if (!profile) {
    // Get role from user metadata
    const role = user.user_metadata?.role || 'talent';
    
    // Insert profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role: role,
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
    }

    // Also create role-specific profile
    if (role === 'talent') {
      await supabase.from('talent_profiles').insert({ user_id: user.id });
    } else if (role === 'employer') {
      await supabase.from('employer_profiles').insert({ 
        user_id: user.id, 
        company_name: user.user_metadata?.company_name || 'My Company' 
      });
    } else if (role === 'agency') {
      await supabase.from('agency_profiles').insert({ 
        user_id: user.id, 
        agency_name: user.user_metadata?.agency_name || 'My Agency',
        contact_name: user.user_metadata?.full_name || '',
        contact_email: user.email || '',
      });
    }

    // Redirect based on role
    redirect(`/dashboard/${role}`);
  }

  // Redirect based on role
  const role = profile.role || 'talent';
  redirect(`/dashboard/${role}`);
}