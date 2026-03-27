// src/app/api/affiliate/request-payout/route.ts
// Sends a payout request notification to admin.
// Partner clicks "Request Payout" → this records the request
// and notifies admin via email (or just logs if email not configured).
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { partnerId } = await req.json();

  const { data: partner } = await adminSupabase
    .from('affiliate_partners')
    .select('id, user_id, affiliate_code, total_pending, payout_email, payout_method')
    .eq('id', partnerId)
    .eq('user_id', user.id)   // ensure they own this record
    .single();

  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  if (partner.total_pending < 50) return NextResponse.json({ error: 'Minimum payout is $50' }, { status: 400 });

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  // Log the request — in production you'd send an email to admin here
  console.log('[PayoutRequest] Partner:', partner.affiliate_code,
    '| Amount: $' + partner.total_pending.toFixed(2),
    '| Email:', partner.payout_email ?? profile?.email,
    '| Method:', partner.payout_method ?? 'not set',
  );

  // Add a note to affiliate_partners so admin can see in dashboard
  await adminSupabase
    .from('affiliate_partners')
    .update({ notes: `Payout requested on ${new Date().toLocaleDateString()} — $${partner.total_pending.toFixed(2)} pending` })
    .eq('id', partnerId);

  return NextResponse.json({ success: true });
}