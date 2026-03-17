import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InterestLetterForm } from './InterestLetterForm';

const LETTER_LIMITS: Record<string, number> = {
  free:       5,
  starter:    15,
  growth:     40,
  business:   100,
  enterprise: Infinity,
};

export default async function InterestLetterPage({
  searchParams,
}: {
  searchParams: Promise<{ talent?: string; job?: string }>;
}) {
  const params = await searchParams;
  const talentId = params.talent;
  const jobId = params.job;

  if (!talentId) {
    redirect('/dashboard/employer/browse');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get employer profile
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) {
    redirect('/dashboard/employer');
  }

  // Get talent info
  const { data: talent } = await supabase
    .from('talent_profiles')
    .select('id, first_name, last_name, professional_headline, email, user_id, current_job_title, current_employer, skills')
    .eq('id', talentId)
    .single();

  if (!talent) {
    redirect('/dashboard/employer/browse');
  }

  // Get talent's user email
  const { data: talentUser } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', talent.user_id)
    .single();

  // Get employer's jobs for selection
  const { data: jobs } = await supabase
    .from('job_listings')
    .select('id, title')
    .eq('employer_id', employerProfile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get subscription tier
  const { data: subscription } = await supabase
    .from('employer_subscriptions')
    .select('tier')
    .eq('employer_id', employerProfile.id)
    .single();

  // Count sent letters this month directly from interest_letters
  // (letters_sent_this_month on employer_subscriptions is never auto-incremented)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: sentThisMonth } = await supabase
    .from('interest_letters')
    .select('id')
    .eq('employer_id', employerProfile.id)
    .eq('status', 'sent')
    .gte('created_at', monthStart.toISOString());

  const subscriptionTier = subscription?.tier ?? 'free';
  const letterLimit = LETTER_LIMITS[subscriptionTier] ?? 5;
  const lettersThisMonth = sentThisMonth?.length ?? 0;

  return (
    <InterestLetterForm
      employerProfile={{
        id: employerProfile.id,
        company_name: employerProfile.company_name || 'Your Company',
      }}
      talent={{
        id: talent.id,
        name: talentUser?.full_name || `${talent.first_name} ${talent.last_name}`,
        email: talentUser?.email || talent.email,
        headline: talent.professional_headline,
        designation: talent.current_job_title,
        employer: talent.current_employer,
        skills: talent.skills || [],
      }}
      jobs={jobs || []}
      preselectedJobId={jobId}
      letterUsage={{
        canSend: lettersThisMonth < letterLimit,
        used: lettersThisMonth,
        limit: letterLimit,
        tier: subscriptionTier,
      }}
    />
  );
}