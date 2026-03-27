// src/app/api/affiliate/attribute/route.ts
// ============================================================
// POST /api/affiliate/attribute
// Called after successful signup.
// Links the new user to the affiliate partner.
// Updates referral record: status='signed_up'
// Updates profiles: referred_by_partner, affiliate_code_used
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { isWithinAttributionWindow, ATTRIBUTION_WINDOW_DAYS } from '@/lib/affiliate/types'

// Service role for writes that bypass RLS
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { affiliate_code, click_at, referral_id } = await req.json()

    if (!affiliate_code) {
      return NextResponse.json({ error: 'affiliate_code required' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const code = affiliate_code.toUpperCase().trim()

    // Validate attribution window
    if (click_at && !isWithinAttributionWindow(click_at)) {
      console.log('[Affiliate] Attribution window expired for code:', code)
      return NextResponse.json({ ok: true, attributed: false, reason: 'window_expired' })
    }

    // Check user not already attributed
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('referred_by_partner')
      .eq('id', user.id)
      .single()

    if (existingProfile?.referred_by_partner) {
      return NextResponse.json({ ok: true, attributed: false, reason: 'already_attributed' })
    }

    // Get active partner
    const { data: partner } = await adminSupabase
      .from('affiliate_partners')
      .select('id, status, total_referrals')
      .eq('affiliate_code', code)
      .eq('status', 'active')
      .single()

    if (!partner) {
      return NextResponse.json({ ok: true, attributed: false, reason: 'invalid_code' })
    }

    // Cannot refer yourself
    if (partner.id === user.id) {
      return NextResponse.json({ ok: true, attributed: false, reason: 'self_referral' })
    }

    const clickTimestamp = click_at ?? new Date().toISOString()

    // Update user's profile with attribution
    await adminSupabase
      .from('profiles')
      .update({
        referred_by_partner: partner.id,
        affiliate_code_used: code,
        affiliate_click_at:  clickTimestamp,
      })
      .eq('id', user.id)

    // Update or create referral record
    if (referral_id) {
      await adminSupabase
        .from('affiliate_referrals')
        .update({
          referred_user_id: user.id,
          signed_up_at:     new Date().toISOString(),
          status:           'signed_up',
        })
        .eq('id', referral_id)
    } else {
      await adminSupabase
        .from('affiliate_referrals')
        .insert({
          partner_id:       partner.id,
          affiliate_code:   code,
          referred_user_id: user.id,
          click_at:         clickTimestamp,
          signed_up_at:     new Date().toISOString(),
          status:           'signed_up',
        })
    }

    // Increment partner total_referrals
    await adminSupabase
      .from('affiliate_partners')
      .update({
        total_referrals: (partner.total_referrals ?? 0) + 1,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', partner.id)

    return NextResponse.json({ ok: true, attributed: true })
  } catch (err) {
    console.error('[Affiliate Attribute]', err)
    return NextResponse.json({ ok: true, attributed: false })
  }
}