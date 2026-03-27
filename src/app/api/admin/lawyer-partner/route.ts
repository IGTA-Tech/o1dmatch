// src/app/api/admin/lawyer-partner/route.ts
// ============================================================
// Admin-only endpoint to toggle affiliate partner status.
// Handles both lawyers (via lawyer_profiles.is_partner + DB trigger)
// and agencies (direct affiliate_partners insert/update).
// Uses service role key to bypass RLS.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 1. Verify caller is admin
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // 2. Parse body — role is optional, we auto-detect if missing
  const body = await req.json();
  const { userId, isPartner, role } = body as {
    userId:    string;
    isPartner: boolean;
    role?:     string;
  };

  if (!userId || typeof isPartner !== 'boolean') {
    return NextResponse.json(
      { error: 'userId (string) and isPartner (boolean) are required' },
      { status: 400 }
    );
  }

  // 3. Detect role if not passed
  let userRole = role;
  if (!userRole) {
    const { data: profileData } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    userRole = profileData?.role ?? 'lawyer';
  }

  console.log('[PartnerToggle] userId:', userId, '| role:', userRole, '| isPartner:', isPartner);

  // ── 4a. LAWYER ──────────────────────────────────────────────
  // Update lawyer_profiles.is_partner — DB trigger auto-creates/deactivates affiliate_partners
  if (userRole === 'lawyer') {
    const { error: updateError } = await adminClient
      .from('lawyer_profiles')
      .update({ is_partner: isPartner, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[PartnerToggle] lawyer_profiles update failed:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('[PartnerToggle] ✓ Lawyer is_partner updated');
  }

  // ── 4b. AGENCY ──────────────────────────────────────────────
  // No DB trigger for agencies — manage affiliate_partners directly
  else if (userRole === 'agency') {
    if (isPartner) {
      // Check if record already exists
      const { data: existing } = await adminClient
        .from('affiliate_partners')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Reactivate if suspended/inactive
        const { error } = await adminClient
          .from('affiliate_partners')
          .update({ status: 'active', is_active: true, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
        if (error) {
          console.error('[PartnerToggle] agency reactivate failed:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.log('[PartnerToggle] ✓ Agency partner reactivated');
      } else {
        // Generate affiliate code and create new record
        const { data: codeData, error: codeErr } = await adminClient
          .rpc('generate_affiliate_code', { p_user_id: userId });

        if (codeErr || !codeData) {
          console.error('[PartnerToggle] generate_affiliate_code failed:', codeErr);
          return NextResponse.json({ error: 'Failed to generate affiliate code' }, { status: 500 });
        }

        const { error: insertError } = await adminClient
          .from('affiliate_partners')
          .insert({
            user_id:        userId,
            partner_type:   'agency',
            affiliate_code: codeData,
            commission_rate: 0.15,
            status:         'active',
            is_active:      true,
          });

        if (insertError) {
          console.error('[PartnerToggle] agency insert failed:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        console.log('[PartnerToggle] ✓ Agency affiliate_partners record created:', codeData);
      }
    } else {
      // Deactivate — set status to inactive
      const { error } = await adminClient
        .from('affiliate_partners')
        .update({ status: 'inactive', is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('[PartnerToggle] agency deactivate failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('[PartnerToggle] ✓ Agency partner deactivated');
    }
  }

  // 5. Fetch resulting affiliate_partners record to return affiliate_code to UI
  const { data: affiliatePartner } = await adminClient
    .from('affiliate_partners')
    .select('id, affiliate_code, status')
    .eq('user_id', userId)
    .maybeSingle();

  return NextResponse.json({
    success:         true,
    isPartner,
    affiliateCode:   affiliatePartner?.affiliate_code ?? null,
    affiliateStatus: affiliatePartner?.status ?? null,
  });
}