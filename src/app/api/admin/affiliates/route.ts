// src/app/api/admin/affiliates/route.ts
// ============================================================
// Admin affiliate mutations — uses service role to bypass RLS.
// All actions verified: caller must have role='admin'.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Verify admin helper ───────────────────────────────────────
async function verifyAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return { userId: user.id };
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {

      // ── Update partner status (approve / suspend / reinstate) ──
      case 'update_partner_status': {
        const { partnerId, status } = body;
        const { error } = await adminClient
          .from('affiliate_partners')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', partnerId);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // ── Update commission rate ──
      case 'update_commission_rate': {
        const { partnerId, rate } = body;
        const { error } = await adminClient
          .from('affiliate_partners')
          .update({ commission_rate: rate, updated_at: new Date().toISOString() })
          .eq('id', partnerId);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // ── Bulk approve commissions past clawback ──
      case 'bulk_approve': {
        const { data, error } = await adminClient
          .rpc('bulk_approve_commissions', { p_admin_id: admin.userId });
        if (error) throw error;
        return NextResponse.json({ success: true, count: data ?? 0 });
      }

      // ── Approve single commission + auto-create pending payout ──
      case 'approve_commission': {
        const { commissionId } = body;

        // 1. Fetch commission details needed for the payout record
        const { data: commission, error: fetchErr } = await adminClient
          .from('affiliate_commissions')
          .select(`
            id, affiliate_id, commission_amount,
            affiliate:affiliate_partners(
              id, affiliate_code, payout_email, payout_method,
              profile:profiles!affiliate_partners_user_id_fkey(full_name, email)
            )
          `)
          .eq('id', commissionId)
          .single();

        if (fetchErr || !commission) {
          throw fetchErr ?? new Error('Commission not found');
        }

        // 2. Approve the commission
        const { error: approveErr } = await adminClient
          .from('affiliate_commissions')
          .update({
            status:      'approved',
            approved_at: new Date().toISOString(),
            approved_by: admin.userId,
            updated_at:  new Date().toISOString(),
          })
          .eq('id', commissionId);
        if (approveErr) throw approveErr;

        // 3. Auto-create a pending payout record for this commission
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        const end   = today.toISOString().slice(0, 10);

        const { data: payout, error: payoutErr } = await adminClient
          .from('affiliate_payouts')
          .insert({
            partner_id:   commission.affiliate_id,
            amount:       commission.commission_amount,
            period_start: start,
            period_end:   end,
            status:       'pending',
            tax_year:     today.getFullYear(),
            created_by:   admin.userId,
          })
          .select(`
            id, amount, period_start, period_end, status,
            partner:affiliate_partners(
              affiliate_code, payout_email, payout_method,
              profile:profiles!affiliate_partners_user_id_fkey(full_name, email)
            )
          `)
          .single();

        if (payoutErr || !payout) {
          // Payout creation failed — commission is still approved, just log the error
          console.error('[Admin Affiliates] auto payout create failed:', payoutErr);
          return NextResponse.json({ success: true, payout: null });
        }

        // 4. Link the commission to the payout
        await adminClient
          .from('affiliate_commissions')
          .update({ payout_id: payout.id, updated_at: new Date().toISOString() })
          .eq('id', commissionId);

        return NextResponse.json({ success: true, payout });
      }

      // ── Create payout record from approved commissions ──
      case 'create_payout': {
        const { partnerId, commissionIds, amount } = body;
        if (!partnerId || !commissionIds?.length || !amount) {
          return NextResponse.json({ error: 'partnerId, commissionIds, and amount are required' }, { status: 400 });
        }

        const today  = new Date();
        const start  = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        const end    = today.toISOString().slice(0, 10);

        // Create the payout record
        const { data: payout, error: payoutErr } = await adminClient
          .from('affiliate_payouts')
          .insert({
            partner_id:   partnerId,
            amount:       amount,
            period_start: start,
            period_end:   end,
            status:       'pending',
            tax_year:     today.getFullYear(),
            created_by:   admin.userId,
          })
          .select('id')
          .single();

        if (payoutErr || !payout) {
          console.error('[Admin Affiliates] create_payout insert error:', payoutErr);
          throw payoutErr ?? new Error('Failed to create payout');
        }

        // Link commissions to this payout
        const { error: linkErr } = await adminClient
          .from('affiliate_commissions')
          .update({ payout_id: payout.id, updated_at: new Date().toISOString() })
          .in('id', commissionIds);

        if (linkErr) console.error('[Admin Affiliates] commission link error:', linkErr);

        return NextResponse.json({ success: true, payoutId: payout.id });
      }

      // ── Mark payout as paid ──
      case 'mark_payout_paid': {
        const { payoutId, reference } = body;
        const { error } = await adminClient
          .rpc('mark_payout_paid', {
            p_payout_id:  payoutId,
            p_reference:  reference,
            p_admin_id:   admin.userId,
          });
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // ── List active partners (used by promo batch form dropdown) ──
      case 'list_partners': {
        const { data: partners, error } = await adminClient
          .from('affiliate_partners')
          .select(`id, affiliate_code, profile:profiles!affiliate_partners_user_id_fkey(full_name, email)`)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, partners: partners ?? [] });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[Admin Affiliates]', action, err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}