// src/app/auth/callback/route.ts
// ── CHANGES FROM ORIGINAL ─────────────────────────────────
// After session exchange, reads affiliate cookie as BACKUP attribution.
// If profile has no referred_by_partner yet, attributes it here.
// All other logic (welcome email, role-based redirect) UNCHANGED.
// ──────────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail, welcomeEmail } from '@/lib/email';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isWithinAttributionWindow, AFFILIATE_STORAGE_KEY, AFFILIATE_CLICK_STORAGE_KEY } from '@/lib/affiliate/types';

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Helper: read cookie from request ────────────────────────
function readCookie(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split('; ').find(c => c.startsWith(`${key}=`));
  if (!match) return null;
  return decodeURIComponent(match.split('=').slice(1).join('='));
}

// ─── Create role-specific profile records ────────────────────
// Called when a profile row is created for the first time.
// Ensures lawyer_profiles, agency_profiles etc. all exist.
async function createRoleProfile(
  userId: string,
  role: string,
  fullName: string,
  email: string
): Promise<void> {
  console.log('[createRoleProfile] Creating role profile:', { userId, role, fullName, email });
  try {
    if (role === 'lawyer') {
      const { data, error } = await adminSupabase
        .from('lawyer_profiles')
        .insert({
          user_id:       userId,
          attorney_name: fullName || 'Attorney',
          firm_name:     '',
          contact_email: email,
          is_active:     false,
          is_partner:    false,
        })
        .select('id')
        .single();
      console.log('[createRoleProfile] lawyer_profiles insert:', data ? `id=${data.id}` : 'failed', 'error:', error?.code === '23505' ? 'duplicate (ok)' : error ?? 'none');
      if (error && error.code !== '23505') {
        console.error('[createRoleProfile] lawyer_profiles insert failed:', error);
      }

    } else if (role === 'agency') {
      const { data, error } = await adminSupabase
        .from('agency_profiles')
        .insert({
          user_id:      userId,
          agency_name:  fullName || 'My Agency',
          contact_name:  fullName || '',
          contact_email: email,
        })
        .select('id')
        .single();
      console.log('[createRoleProfile] agency_profiles insert:', data ? `id=${data.id}` : 'failed', 'error:', error?.code === '23505' ? 'duplicate (ok)' : error ?? 'none');
      if (error && error.code !== '23505') {
        console.error('[createRoleProfile] agency_profiles insert failed:', error);
      }

    } else if (role === 'talent') {
      const { data, error } = await adminSupabase
        .from('talent_subscriptions')
        .insert({
          talent_id: userId,
          tier:      'profile_only',
          status:    'active',
        })
        .select('id')
        .single();
      console.log('[createRoleProfile] talent_subscriptions insert:', data ? `id=${data.id}` : 'failed', 'error:', error?.code === '23505' ? 'duplicate (ok)' : error ?? 'none');
      if (error && error.code !== '23505') {
        console.error('[createRoleProfile] talent_subscriptions insert failed:', error);
      }

    } else if (role === 'employer') {
      const { data, error } = await adminSupabase
        .from('employer_subscriptions')
        .insert({
          employer_id: userId,
          tier:        'free',
          status:      'active',
          letters_sent_this_month: 0,
        })
        .select('id')
        .single();
      console.log('[createRoleProfile] employer_subscriptions insert:', data ? `id=${data.id}` : 'failed', 'error:', error?.code === '23505' ? 'duplicate (ok)' : error ?? 'none');
      if (error && error.code !== '23505') {
        console.error('[createRoleProfile] employer_subscriptions insert failed:', error);
      }
    }

    console.log('[createRoleProfile] ✓ Done for role:', role);
  } catch (err) {
    console.error('[createRoleProfile] Unexpected error:', err);
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code       = requestUrl.searchParams.get('code');

  console.log('[Callback] ── START ──────────────────────────────');
  console.log('[Callback] URL:', requestUrl.toString());
  console.log('[Callback] Code present:', !!code);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[Callback] exchangeCodeForSession error:', error ?? 'none');

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      console.log('[Callback] User:', user ? { id: user.id, email: user.email } : null);
      console.log('[Callback] User metadata:', user?.user_metadata ?? null);

      if (user) {
        // ── Ensure profile row exists ─────────────────────────
        console.log('[Callback] Fetching profile for user:', user.id);

        let { data: profile } = await adminSupabase
          .from('profiles')
          .select('role, full_name, welcome_email_sent, referred_by_partner')
          .eq('id', user.id)
          .single();

        console.log('[Callback] Existing profile:', profile ?? 'NOT FOUND');

        if (!profile) {
          const role     = user.user_metadata?.role     ?? 'talent';
          const fullName = user.user_metadata?.full_name ?? '';

          console.log('[Callback] No profile found — creating new profile');
          console.log('[Callback] Creating profile with:', { id: user.id, email: user.email, full_name: fullName, role });

          const { data: newProfile, error: insertError } = await adminSupabase
            .from('profiles')
            .insert({
              id:        user.id,
              email:     user.email!,
              full_name: fullName,
              role,
            })
            .select('role, full_name, welcome_email_sent, referred_by_partner')
            .single();

          console.log('[Callback] Profile insert error:', insertError ?? 'none');
          console.log('[Callback] New profile created:', newProfile ?? null);

          if (insertError) {
            console.error('[Callback] Failed to create profile:', insertError);
          } else {
            profile = newProfile;
            console.log('[Callback] Profile created for user:', user.id, 'role:', role);
            console.log('[Callback] Creating role-specific profile for role:', role);
            await createRoleProfile(user.id, role, fullName, user.email!);
          }
        }

        // ── AFFILIATE: attribution ────────────────────────────
        // SOURCE PRIORITY (most → least reliable):
        //   1. user.user_metadata  — set during signUp(), always present
        //   2. URL query params    — set in emailRedirectTo, present when email clicked
        //   3. Cookie              — fallback for edge cases

        const metaAffCode = user.user_metadata?.affiliate_code     ?? null;
        const metaClickAt = user.user_metadata?.affiliate_click_at ?? null;
        const metaRefId   = user.user_metadata?.affiliate_ref_id   ?? null;

        const urlAffCode    = requestUrl.searchParams.get('affiliate_code');
        const urlClickAt    = requestUrl.searchParams.get('click_at');
        const urlReferralId = requestUrl.searchParams.get('referral_id');

        const cookieHeader  = request.headers.get('cookie');
        const cookieAffCode = readCookie(cookieHeader, AFFILIATE_STORAGE_KEY);
        const cookieClickAt = readCookie(cookieHeader, AFFILIATE_CLICK_STORAGE_KEY);

        const affCode  = metaAffCode  ?? urlAffCode  ?? cookieAffCode  ?? null;
        const clickAt  = metaClickAt  ?? urlClickAt  ?? cookieClickAt  ?? null;
        const refId    = metaRefId    ?? urlReferralId ?? null;

        console.log('[Callback] Affiliate sources — metadata:', metaAffCode ?? 'none', '| URL:', urlAffCode ?? 'none', '| cookie:', cookieAffCode ?? 'none');
        console.log('[Callback] Resolved affiliate code:', affCode ?? 'none');
        console.log('[Callback] Resolved click_at:', clickAt ?? 'none');
        console.log('[Callback] Source used:', metaAffCode ? 'user_metadata' : urlAffCode ? 'URL params' : cookieAffCode ? 'cookie' : 'none');

        if (!profile?.referred_by_partner && affCode && clickAt && isWithinAttributionWindow(clickAt)) {
          console.log('[Callback] Attribution window valid — processing attribution');
          try {
            const { data: partner, error: partnerErr } = await adminSupabase
              .from('affiliate_partners')
              .select('id, total_referrals')
              .eq('affiliate_code', affCode.toUpperCase().trim())
              .eq('status', 'active')
              .single();

            console.log('[Callback] Partner lookup:', partner ? `found id=${partner.id}` : 'NOT FOUND', 'error:', partnerErr ?? 'none');

            if (partner) {
              // 1. Update profile with attribution
              const { error: attrError } = await adminSupabase
                .from('profiles')
                .update({
                  referred_by_partner: partner.id,
                  affiliate_code_used: affCode.toUpperCase().trim(),
                  affiliate_click_at:  clickAt,
                })
                .eq('id', user.id)
                .is('referred_by_partner', null);

              console.log('[Callback] profiles attribution update error:', attrError ?? 'none ✓');

              // 2. Update or create affiliate_referrals record
              if (refId) {
                // Update the existing clicked record from track API
                const { error: refUpdateErr } = await adminSupabase
                  .from('affiliate_referrals')
                  .update({
                    referred_user_id: user.id,
                    signed_up_at:     new Date().toISOString(),
                    status:           'signed_up',
                  })
                  .eq('id', refId);
                console.log('[Callback] affiliate_referrals update (by id) error:', refUpdateErr ?? 'none ✓');
              } else {
                // Try to find unmatched clicked record for this code
                const { data: existingRef } = await adminSupabase
                  .from('affiliate_referrals')
                  .select('id')
                  .eq('affiliate_code', affCode.toUpperCase().trim())
                  .is('referred_user_id', null)
                  .eq('status', 'clicked')
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();

                if (existingRef) {
                  const { error: refUpdateErr } = await adminSupabase
                    .from('affiliate_referrals')
                    .update({
                      referred_user_id: user.id,
                      signed_up_at:     new Date().toISOString(),
                      status:           'signed_up',
                    })
                    .eq('id', existingRef.id);
                  console.log('[Callback] affiliate_referrals update (by code) error:', refUpdateErr ?? 'none ✓');
                } else {
                  // No existing record — create a new signed_up record
                  const { error: refInsertErr } = await adminSupabase
                    .from('affiliate_referrals')
                    .insert({
                      partner_id:       partner.id,
                      affiliate_code:   affCode.toUpperCase().trim(),
                      referred_user_id: user.id,
                      click_at:         clickAt,
                      signed_up_at:     new Date().toISOString(),
                      status:           'signed_up',
                    });
                  console.log('[Callback] affiliate_referrals insert error:', refInsertErr ?? 'none ✓');
                }
              }

              // 3. Increment partner total_referrals
              const { error: incrErr } = await adminSupabase
                .from('affiliate_partners')
                .update({
                  total_referrals: (partner.total_referrals ?? 0) + 1,
                  updated_at:      new Date().toISOString(),
                })
                .eq('id', partner.id);
              console.log('[Callback] affiliate_partners total_referrals increment error:', incrErr ?? 'none ✓');

              console.log('[Callback] ✓ ATTRIBUTION COMPLETE for user:', user.id, '→ partner:', partner.id);
            }
          } catch (affErr) {
            console.error('[Callback] Attribution failed:', affErr);
          }
        } else {
          console.log('[Callback] Skipping attribution —',
            profile?.referred_by_partner ? 'already attributed' :
            !affCode ? 'no affiliate code' :
            !clickAt ? 'no click timestamp' :
            'attribution window expired'
          );
        }

        // ── AFFILIATE: apply as partner from signup checkbox ──
        const wantPartner = user.user_metadata?.want_partner === true;
        const userRole    = profile?.role ?? user.user_metadata?.role;

        console.log('[Callback] want_partner:', wantPartner, '| userRole:', userRole);

        if (wantPartner && (userRole === 'lawyer' || userRole === 'agency')) {
          console.log('[Callback] Applying affiliate partner status for role:', userRole);
          try {
            if (userRole === 'lawyer') {
              const { error: partnerErr } = await adminSupabase
                .from('lawyer_profiles')
                .update({ is_partner: true })
                .eq('user_id', user.id);
              console.log('[Callback] lawyer is_partner update error:', partnerErr ?? 'none');
            } else if (userRole === 'agency') {
              const { data: existing } = await adminSupabase
                .from('affiliate_partners')
                .select('id')
                .eq('user_id', user.id)
                .single();

              console.log('[Callback] Existing agency affiliate partner:', existing ?? 'none');

              if (!existing) {
                const { data: codeData, error: codeErr } = await adminSupabase
                  .rpc('generate_affiliate_code', { p_user_id: user.id });
                console.log('[Callback] Generated affiliate code:', codeData ?? null, 'error:', codeErr ?? 'none');

                if (codeData) {
                  const { error: insertErr } = await adminSupabase.from('affiliate_partners').insert({
                    user_id:        user.id,
                    partner_type:   'agency',
                    affiliate_code: codeData,
                    commission_rate: 0.15,
                    status:         'pending',
                  });
                  console.log('[Callback] Agency affiliate_partners insert error:', insertErr ?? 'none');
                }
              }
            }
            console.log('[Callback] ✓ Partner application created for user:', user.id);
          } catch (partnerErr) {
            console.error('[Callback] Partner creation failed:', partnerErr);
          }
        }

        // ── END AFFILIATE ──────────────────────────────────────

        // Send welcome email on first login
        console.log('[Callback] welcome_email_sent:', profile?.welcome_email_sent ?? false);

        if (profile && !profile.welcome_email_sent) {
          const baseUrl      = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
          const dashboardPath = profile.role ? `/dashboard/${profile.role}` : '/dashboard';

          console.log('[Callback] Sending welcome email to:', user.email, 'dashboardUrl:', `${baseUrl}${dashboardPath}`);

          try {
            await sendEmail({
              to: user.email!,
              template: welcomeEmail({
                name:         profile.full_name || user.email?.split('@')[0] || 'there',
                role:         profile.role || 'talent',
                dashboardUrl: `${baseUrl}${dashboardPath}`,
              }),
            });
            await supabase
              .from('profiles')
              .update({ welcome_email_sent: true })
              .eq('id', user.id);
            console.log('[Callback] ✓ Welcome email sent');
          } catch (emailError) {
            console.error('[Callback] Failed to send welcome email:', emailError);
          }
        }

        // Role-based redirect
        let redirectPath = '/dashboard';
        if (profile?.role) {
          switch (profile.role) {
            case 'talent':   redirectPath = '/dashboard/talent';   break;
            case 'employer': redirectPath = '/dashboard/employer'; break;
            case 'agency':   redirectPath = '/dashboard/agency';   break;
            case 'lawyer':   redirectPath = '/dashboard/lawyer';   break;
            case 'admin':    redirectPath = '/admin';              break;
          }
        }

        console.log('[Callback] Redirecting to:', redirectPath);
        console.log('[Callback] ── END ────────────────────────────────────');

        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
      }
    }
  }

  console.log('[Callback] ERROR: No code or session exchange failed — redirecting to login error');
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin));
}