import { createClient } from '@/lib/supabase/server';
import LawyerDirectoryClient from './LawyerDirectoryClient';

export default async function LawyerDirectoryPage() {
  const supabase = await createClient();

  // Get all public lawyer profiles
  const { data: lawyers } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('is_active', true)
    // .eq('is_verified', true)
    .order('updated_at', { ascending: false });
console.log(lawyers);
  return <LawyerDirectoryClient lawyers={lawyers || []} />;
}
