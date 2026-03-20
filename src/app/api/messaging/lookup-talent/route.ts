// src/app/api/messaging/lookup-talent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/messaging/lookup-talent?candidate_id=CAND-618279
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const candidateId = req.nextUrl.searchParams.get('candidate_id')?.trim().toUpperCase();
  if (!candidateId) {
    return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
  }

  // 1. Look up talent_profile by candidate_id
  const { data: talentProfile, error: talentError } = await supabase
    .from('talent_profiles')
    .select('id, user_id, candidate_id, professional_headline, city, state, o1_score')
    .eq('candidate_id', candidateId)
    .single();

  if (talentError || !talentProfile) {
    return NextResponse.json({ error: 'No talent found with that Talent ID' }, { status: 404 });
  }

  // 2. Get the associated profile for full_name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', talentProfile.user_id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Talent profile not found' }, { status: 404 });
  }

  if (profile.role !== 'talent') {
    return NextResponse.json({ error: 'This user is not a talent' }, { status: 400 });
  }

  return NextResponse.json({
    talent_id: talentProfile.id,
    full_name: profile.full_name,
    candidate_id: talentProfile.candidate_id,
    professional_headline: talentProfile.professional_headline,
    city: talentProfile.city,
    state: talentProfile.state,
    o1_score: talentProfile.o1_score,
  });
}