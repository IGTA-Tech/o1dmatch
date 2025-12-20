import { createClient } from '@/lib/supabase/server';
import LawyerDirectoryClient from './LawyerDirectoryClient';

export default async function LawyerDirectoryPage() {
  const supabase = await createClient();

  // Get all public lawyer profiles
  const { data: lawyers } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('is_public', true)
    .eq('is_verified', true)
    .order('view_count', { ascending: false });

  return <LawyerDirectoryClient lawyers={lawyers || []} />;
}
