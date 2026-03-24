// src/app/api/promo/validate/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, userType, userId, tier } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Promo code is required' });
    }

    const supabase = await createClient();

    // Look up the promo code
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ valid: false, error: 'Invalid promo code' });
    }

    // Check if active
    if (!promo.is_active) {
      return NextResponse.json({ valid: false, error: 'This promo code is no longer active' });
    }

    // Check validity dates
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return NextResponse.json({ valid: false, error: 'This promo code is not yet valid' });
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json({ valid: false, error: 'This promo code has expired' });
    }

    // Check max total uses
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: 'This promo code has reached its usage limit' });
    }

    // Check user type
    if (
      promo.applicable_user_type &&
      promo.applicable_user_type !== 'both' &&
      promo.applicable_user_type !== userType
    ) {
      return NextResponse.json({
        valid: false,
        error: `This promo code is only valid for ${promo.applicable_user_type} accounts`,
      });
    }

    // Check per-user usage limit (defaults to 1 if not set)
    if (userId) {
      const perUserLimit = promo.max_uses_per_user ?? 1;
      const { count, error: usageError } = await supabase
        .from('promo_code_usage')
        .select('*', { count: 'exact', head: true })
        .eq('promo_code_id', promo.id)
        .eq('user_id', userId);

      if (!usageError && count !== null && count >= perUserLimit) {
        return NextResponse.json({
          valid: false,
          error: perUserLimit === 1
            ? 'You have already used this promo code'
            : `You have already used this promo code the maximum number of times (${perUserLimit})`,
        });
      }
    }

    // Parse applicable tiers — stored as comma-separated string e.g. "starter,active_match"
    // Empty / null means the code applies to ALL plans
    const applicableTiers: string[] = promo.applicable_tier
      ? promo.applicable_tier.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    // If a specific tier was requested (e.g. user clicked Upgrade on a plan card),
    // validate that this promo is allowed on that tier
    if (tier && applicableTiers.length > 0 && !applicableTiers.includes(tier)) {
      const tierLabels: Record<string, string> = {
        profile_only: 'Free Profile',
        starter: 'Starter',
        active_match: 'Active Match',
        free: 'Free',
        growth: 'Growth',
        business: 'Business',
        enterprise: 'Enterprise',
      };
      const planNames = applicableTiers.map((t) => tierLabels[t] || t).join(', ');
      return NextResponse.json({
        valid: false,
        error: `This promo code only applies to: ${planNames}`,
      });
    }

    // Build response
    const promoInfo: Record<string, unknown> = {
      type: promo.type,
      code: promo.code,
      // Always return which tiers this applies to so UI can show/hide per-card
      applicableTiers,
    };

    if (promo.type === 'trial' && promo.trial_days) {
      promoInfo.trialDays = promo.trial_days;
    }
    if (promo.type === 'discount' && promo.discount_percent) {
      promoInfo.discountPercent = promo.discount_percent;
    }
    if (promo.grants_igta_member) {
      promoInfo.grantsIGTAMember = true;
    }

    // NOTE: Usage is NOT recorded here — that happens in /api/promo/apply
    // when the user actually completes the action. Recording here would
    // consume uses for users who validate but never subscribe.

    return NextResponse.json({ valid: true, promo: promoInfo });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate promo code' });
  }
}