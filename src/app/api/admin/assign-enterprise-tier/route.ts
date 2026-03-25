// src/app/api/admin/assign-enterprise-tier/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TIERS, TierKey } from '@/lib/tiers';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth — admin only
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, tierKeys, role } = body as {
      userId:   string;
      tierKeys: TierKey[];   // array — empty means remove all
      role:     string;
    };

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    // Validate all provided tier keys
    const invalid = tierKeys.filter((k) => !TIERS[k]);
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Unknown tier(s): ${invalid.join(', ')}` }, { status: 400 });
    }

    // ── 1. Sync enterprise_tier_assignments ─────────────────
    // Delete all current rows for this user, then insert the new set
    await supabase
      .from('enterprise_tier_assignments')
      .delete()
      .eq('user_id', userId);

    if (tierKeys.length > 0) {
      const rows = tierKeys.map((tierKey) => ({
        user_id:     userId,
        tier_key:    tierKey,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('enterprise_tier_assignments')
        .insert(rows);

      if (insertError) {
        console.error('[assign-enterprise-tier] insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // ── 2. Attorney partner — sync lawyer_profiles + affiliate_partners ──
    if (role === 'lawyer') {
      const isPartner = tierKeys.includes('attorney_partner' as TierKey);

      const { error: lpError } = await supabase
        .from('lawyer_profiles')
        .update({ is_partner: isPartner })
        .eq('user_id', userId);

      if (lpError) {
        console.error('[assign-enterprise-tier] lawyer_profiles update error:', lpError);
      }

      if (isPartner) {
        const { error: apError } = await supabase
          .from('affiliate_partners')
          .upsert(
            {
              user_id:        userId,
              commission_rate: 0.20,
              is_active:      true,
              updated_at:     new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (apError) {
          console.error('[assign-enterprise-tier] affiliate_partners upsert error:', apError);
        }
      } else {
        await supabase
          .from('affiliate_partners')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
    }

    console.log(
      `[assign-enterprise-tier] Admin ${user.id} assigned tiers [${tierKeys.join(', ') || 'none'}] to user ${userId}`
    );

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('[assign-enterprise-tier] ERROR:', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal server error', detail }, { status: 500 });
  }
}