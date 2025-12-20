import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { code, userType } = body as {
      code: string;
      userType: 'employer' | 'talent';
    };

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Look up promo code
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (!promo) {
      return NextResponse.json({ valid: false, error: 'Invalid promo code' });
    }

    // Check if applicable to user type
    if (promo.applicable_user_type && promo.applicable_user_type !== 'both') {
      if (promo.applicable_user_type !== userType) {
        return NextResponse.json({
          valid: false,
          error: `This code is only valid for ${promo.applicable_user_type}s`,
        });
      }
    }

    // Check usage limits
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' });
    }

    // Check validity period
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return NextResponse.json({ valid: false, error: 'This code is not yet active' });
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json({ valid: false, error: 'This code has expired' });
    }

    // Return promo details
    return NextResponse.json({
      valid: true,
      promo: {
        type: promo.type,
        description: promo.description,
        trialDays: promo.trial_days,
        discountPercent: promo.discount_percent,
        grantsIGTAMember: promo.grants_igta_member,
        applicableTier: promo.applicable_tier,
      },
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
