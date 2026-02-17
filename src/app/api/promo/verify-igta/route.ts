/*\src\app\api\promo\verify-igta\route.ts*/
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body as { code: string };

    if (!code) {
      return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
    }

    // Look up IGTA verification code
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('type', 'igta_verification')
      .eq('grants_igta_member', true)
      .eq('is_active', true)
      .single();

    if (!promo) {
      return NextResponse.json({
        success: false,
        error: 'Invalid IGTA verification code',
      });
    }

    // Check if already verified
    const { data: existingSub } = await supabase
      .from('talent_subscriptions')
      .select('igta_member_verified')
      .eq('talent_id', user.id)
      .single();

    if (existingSub?.igta_member_verified) {
      return NextResponse.json({
        success: false,
        error: 'You are already verified as an IGTA member',
      });
    }

    // Check if code already used by this user
    const { data: existingRedemption } = await supabase
      .from('promo_code_redemptions')
      .select('id')
      .eq('promo_code_id', promo.id)
      .eq('user_id', user.id)
      .single();

    if (existingRedemption) {
      return NextResponse.json({
        success: false,
        error: 'You have already used this code',
      });
    }

    // Update or create talent subscription with IGTA member status
    const { error: upsertError } = await supabase
      .from('talent_subscriptions')
      .upsert({
        talent_id: user.id,
        tier: 'igta_member',
        status: 'active',
        igta_member_verified: true,
        igta_verification_code: code.toUpperCase().trim(),
        igta_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Failed to update subscription:', upsertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to activate IGTA membership',
      });
    }

    // Record redemption
    await supabase.from('promo_code_redemptions').insert({
      promo_code_id: promo.id,
      user_id: user.id,
      user_type: 'talent',
    });

    // Increment usage count
    await supabase
      .from('promo_codes')
      .update({ current_uses: (promo.current_uses || 0) + 1 })
      .eq('id', promo.id);

    return NextResponse.json({
      success: true,
      message: 'Welcome to O1DMatch! Your IGTA membership has been verified. You now have full access to all features.',
    });
  } catch (error) {
    console.error('IGTA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
