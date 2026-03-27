// src/app/api/affiliate/track/route.ts
// ============================================================
// POST /api/affiliate/track
// Called on signup page load when ?ref= param is detected.
// Creates an affiliate_referrals record with status='clicked'.
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for insert
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { affiliate_code } = await req.json()

    if (!affiliate_code || typeof affiliate_code !== 'string') {
      return NextResponse.json({ error: 'affiliate_code required' }, { status: 400 })
    }

    const code = affiliate_code.toUpperCase().trim()

    // Validate: partner must be active
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .select('id, status')
      .eq('affiliate_code', code)
      .eq('status', 'active')
      .single()

    if (partnerError || !partner) {
      // Silently succeed — don't expose whether code is valid
      return NextResponse.json({ ok: true })
    }

    // Create click record
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const ua = req.headers.get('user-agent') ?? null

    const { data: referral } = await supabase
      .from('affiliate_referrals')
      .insert({
        partner_id:    partner.id,
        affiliate_code: code,
        status:        'clicked',
        click_at:      new Date().toISOString(),
        ip_address:    ip,
        user_agent:    ua,
      })
      .select('id')
      .single()

    // Update partner total_referrals click count (optional — only counts signups later)
    // We don't increment total_referrals here; we do it on signup attribution

    return NextResponse.json({ ok: true, referral_id: referral?.id })
  } catch (err) {
    console.error('[Affiliate Track]', err)
    return NextResponse.json({ ok: true }) // always return ok to not break signup UX
  }
}