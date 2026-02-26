// src/app/api/promo/validate/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, userType, userId } = await req.json();

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

    // Build response
    const promoInfo: Record<string, unknown> = {
      type: promo.type,
      code: promo.code,
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
    if (promo.applicable_tier) {
      promoInfo.applicableTier = promo.applicable_tier;
    }

    // Record usage so the same user can't redeem again beyond limit
    if (userId) {
      await supabase.from('promo_code_usage').insert({
        promo_code_id: promo.id,
        user_id: userId,
        context: 'billing',
      });

      // Increment global current_uses counter
      await supabase
        .from('promo_codes')
        .update({ current_uses: (promo.current_uses || 0) + 1 })
        .eq('id', promo.id);
    }

    return NextResponse.json({ valid: true, promo: promoInfo });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate promo code' });
  }
}