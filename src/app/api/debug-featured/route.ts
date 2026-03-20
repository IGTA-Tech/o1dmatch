// TEMPORARY — src/app/api/debug-analytics/route.ts
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not authed' });

  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabase
    .from('employer_profiles').select('id, user_id').eq('user_id', user.id).single();

  const empId = profile?.id;

  // Query 1: regular client (what analytics uses)
  const { data: jobsRegular, error: jobsRegularErr } = await supabase
    .from('job_listings').select('id, title').eq('employer_id', empId);

  // Query 2: admin client (bypass RLS)
  const { data: jobsAdmin, error: jobsAdminErr } = await adminClient
    .from('job_listings').select('id, title').eq('employer_id', empId);

  return NextResponse.json({
    userId: user.id, empId,
    regularClient: { count: jobsRegular?.length ?? 0, error: jobsRegularErr?.message },
    adminClient: { count: jobsAdmin?.length ?? 0, error: jobsAdminErr?.message },
  });
}