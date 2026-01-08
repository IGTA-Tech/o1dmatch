import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BrowseTalentClient from './BrowseTalentClient';

export default async function BrowseTalentPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) {
    redirect('/dashboard/employer');
  }

  // Get public talent profiles with score >= 40
  const { data: talents } = await supabase
    .from('talent_profiles')
    .select('*');

  // Check which talents already have letters from this employer
  const { data: existingLetters } = await supabase
    .from('interest_letters')
    .select('talent_id')
    .eq('employer_id', employerProfile.id);

  const lettersSentTo = new Set(existingLetters?.map((l) => l.talent_id) || []);

  return (
    <BrowseTalentClient
      talents={talents || []}
      lettersSentTo={lettersSentTo}
    />
  );
}
