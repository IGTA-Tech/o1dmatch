'use client';
// src/app/(auth)/signup/page.tsx

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';   // ← correct Next.js way to read URL params
import { Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpFormData } from '@/types/forms';
import { createClient } from '@/lib/supabase/client';
import {
  Loader2, Mail, Lock, User, AlertCircle, Check,
  ArrowRight, Shield, X, Star, Briefcase, Users, Scale,
} from 'lucide-react';
import '@/app/theme.css';
import Footer from "@/components/Footer";

// ─── Affiliate constants — self-contained, no external import ─
// Keeping these inline so the page works even if @/lib/affiliate/types
// hasn't been copied to the project yet.
const AFF_KEY       = 'affiliate_ref';
const AFF_CLICK_KEY = 'affiliate_ref_click';
const AFF_MAX_AGE   = 30 * 24 * 60 * 60; // 30 days in seconds
const AFF_WINDOW    = 30;                 // 30 day attribution window

const ROLE_OPTIONS = [
  { value: 'talent',   label: 'O-1 Talent',           description: "I'm looking for opportunities", icon: Star },
  { value: 'employer', label: 'Employer',              description: "I'm hiring O-1 talent",         icon: Briefcase },
  { value: 'agency',   label: 'Staffing Agency',       description: 'I place O-1 talent for clients', icon: Users },
  { value: 'lawyer',   label: 'Immigration Attorney',  description: 'I help with O-1 visa cases',    icon: Scale },
] as const;

// ─── Affiliate storage helpers ────────────────────────────────

function storeAffiliateCode(code: string): void {
  const clickAt = new Date().toISOString();
  try {
    localStorage.setItem(AFF_KEY, code);
    localStorage.setItem(AFF_CLICK_KEY, clickAt);
    console.log('[Affiliate] Stored in localStorage:', AFF_KEY, '=', code);
  } catch (e) {
    console.warn('[Affiliate] localStorage write failed:', e);
  }
  try {
    const opts = `Max-Age=${AFF_MAX_AGE}; Path=/; SameSite=Lax`;
    document.cookie = `${AFF_KEY}=${encodeURIComponent(code)}; ${opts}`;
    document.cookie = `${AFF_CLICK_KEY}=${encodeURIComponent(clickAt)}; ${opts}`;
    console.log('[Affiliate] Stored in cookie:', AFF_KEY, '=', code);
  } catch (e) {
    console.warn('[Affiliate] Cookie write failed:', e);
  }
}

function getStoredAffiliate(): { code: string; clickAt: string; referralId?: string } | null {
  try {
    const code    = localStorage.getItem(AFF_KEY);
    const clickAt = localStorage.getItem(AFF_CLICK_KEY);
    const refId   = localStorage.getItem('affiliate_ref_id') ?? undefined;
    if (!code || !clickAt) return null;
    // Check 30-day window
    const diffDays = (Date.now() - new Date(clickAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > AFF_WINDOW) {
      localStorage.removeItem(AFF_KEY);
      localStorage.removeItem(AFF_CLICK_KEY);
      return null;
    }
    return { code, clickAt, referralId: refId };
  } catch {
    return null;
  }
}

// ─── Inner component (needs Suspense because of useSearchParams) ─
function SignupForm() {
  const searchParams = useSearchParams();   // ← correct Next.js App Router way
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [applyAsPartner, setApplyAsPartner] = useState(false);

  // ── useForm declared first so setValue is available in useEffects ──
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
      defaultValues: { role: 'talent', agree_terms: false, agree_accuracy: false },
    });

  const selectedRole = watch('role');

  // Navbar override
  useEffect(() => {
    document.body.classList.add('signup-page');
    return () => document.body.classList.remove('signup-page');
  }, []);

  // ── AFFILIATE: capture ref + pre-select role from URL ──────
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const refParam  = searchParams.get('ref');

    console.log('[Signup] searchParams — role:', roleParam ?? 'none', '| ref:', refParam ?? 'none');

    // Pre-select role if valid
    const validRoles = ['talent', 'employer', 'agency', 'lawyer'] as const;
    if (roleParam && validRoles.includes(roleParam as typeof validRoles[number])) {
      console.log('[Signup] Pre-selecting role:', roleParam);
      setValue('role', roleParam as typeof validRoles[number]);
    }

    // Store affiliate code
    if (!refParam) {
      console.log('[Signup] No ref param in URL — skipping affiliate capture');
      return;
    }

    const code = refParam.toUpperCase().trim();
    console.log('[Signup] Storing affiliate code:', code);
    storeAffiliateCode(code);

    // Verify it was stored
    const verify = localStorage.getItem(AFF_KEY);
    console.log('[Signup] Verification — localStorage[affiliate_ref]:', verify ?? 'MISSING — localStorage may be blocked');

    // Fire-and-forget click tracking
    console.log('[Signup] Calling /api/affiliate/track');
    fetch('/api/affiliate/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ affiliate_code: code }),
    })
      .then(r => r.json())
      .then(data => {
        console.log('[Signup] Track response:', data);
        if (data?.referral_id) {
          try { localStorage.setItem('affiliate_ref_id', data.referral_id); } catch {}
        }
      })
      .catch(err => console.error('[Signup] Track failed:', err));

  }, [searchParams, setValue]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    console.log('[Signup] ── START ──────────────────────────────');
    console.log('[Signup] Submitting with:', { email: data.email, role: data.role, full_name: data.full_name, applyAsPartner });

    try {
      const supabase = createClient();
      // const signUpPayload = {
      //   email:    data.email,
      //   password: data.password,
      //   options: {
      //     data: {
      //       full_name:    data.full_name,
      //       role:         data.role,
      //       want_partner: (data.role === 'lawyer' || data.role === 'agency') && applyAsPartner,
      //     },
      //     emailRedirectTo: `${window.location.origin}/auth/callback`,
      //   },
      // };

      const stored = getStoredAffiliate();

      const signUpPayload = {
        email:    data.email,
        password: data.password,
        options: {
          data: {
            full_name:      data.full_name,
            role:           data.role,
            want_partner:   (data.role === 'lawyer' || data.role === 'agency') && applyAsPartner,
            // ── Store affiliate data in user metadata ──────────
            // This is the most reliable method — metadata travels
            // with the user object permanently and is readable in
            // the auth callback regardless of email confirmation
            // being ON or OFF, and regardless of SMTP working.
            affiliate_code: stored?.code     ?? null,
            affiliate_click_at: stored?.clickAt ?? null,
            affiliate_ref_id:   stored?.referralId ?? null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      };

      console.log('[Signup] signUp metadata:', signUpPayload.options.data);
      console.log('[Signup] emailRedirectTo:', signUpPayload.options.emailRedirectTo);
      console.log('[Signup] Stored affiliate being embedded in metadata:', stored ?? 'none');

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(signUpPayload);

      console.log('[Signup] signUp error:', signUpError ?? 'none');
      console.log('[Signup] signUp session:', signUpData?.session ? 'present (no email confirmation)' : 'null (email confirmation required)');

      if (signUpError) { setError(signUpError.message); return; }

      // ── If email confirmation is OFF, session is returned immediately ──
      // In this case the auth callback never fires, so we attribute here
      // directly. The user IS authenticated at this point.
      if (signUpData?.session && stored) {
        console.log('[Signup] Email confirmation OFF — attributing immediately');
        try {
          const attrRes = await fetch('/api/affiliate/attribute', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              affiliate_code: stored.code,
              click_at:       stored.clickAt,
              referral_id:    stored.referralId,
            }),
          });
          const attrData = await attrRes.json();
          console.log('[Signup] Immediate attribution response:', attrData);
        } catch (attrErr) {
          console.error('[Signup] Immediate attribution failed:', attrErr);
        }
      }

      // ── AFFILIATE: attribution is now handled in auth/callback ──
      // The affiliate_code is embedded in the emailRedirectTo URL above.
      // When the user clicks their confirmation email, the callback reads
      // it from query params and saves attribution — no auth required.
      // We keep localStorage in case user signs in again before verifying.
      console.log('[Signup] Attribution will be processed in auth callback via URL params');

      console.log('[Signup] ✓ Signup complete — showing success screen');
      setSuccess(true);
    } catch (err) {
      console.error('[Signup] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('[Signup] ── END ────────────────────────────────────');
    }
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className="o1d-page" style={{
        position: 'fixed', top: 65, left: 0, right: 0, bottom: 0,
        zIndex: 49, display: 'flex', flexDirection: 'column',
        background: '#0B1D35', overflowY: 'auto',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.5rem',
              background: 'rgba(212,168,75,0.15)', border: '2px solid rgba(212,168,75,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={32} style={{ color: '#D4A84B' }} />
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem',
            }}>
              Check your email
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>
              We&apos;ve sent you a confirmation link. Please check your email to verify your account before signing in.
            </p>
            <Link href="/login" className="o1d-btn-primary" style={{ display: 'inline-flex', fontSize: '0.9rem' }}>
              Back to sign in <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <footer className="o1d-footer">
          <div className="o1d-footer-inner">
            <div className="o1d-footer-grid">
              <div>
                <span className="o1d-footer-logo">O1DMatch</span>
                <p className="o1d-footer-tagline">Connecting exceptional talent with opportunities for O-1 visa sponsorship.</p>
              </div>
              <div className="o1d-footer-col">
                <h4>Platform</h4>
                <Link href="/how-it-works/candidates">For Candidates</Link>
                <Link href="/how-it-works/employers">For Employers</Link>
                <Link href="/pricing">Pricing</Link>
              </div>
              <div className="o1d-footer-col">
                <h4>Company</h4>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
              </div>
              <div className="o1d-footer-col">
                <h4>Legal</h4>
                <Link href="/terms">Terms of Service</Link>
                <Link href="/privacy">Privacy Policy</Link>
              </div>
            </div>
            <div className="o1d-footer-bottom">
              <span>© 2026 O1DMatch. All rights reserved.</span>
              <span>Built by a licensed immigration attorney.</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  /* ── Main page — form UI UNCHANGED from original ── */
  return (
    <div className="o1d-page" style={{
      position: 'fixed', top: 65, left: 0, right: 0, bottom: 0,
      zIndex: 49, display: 'flex', flexDirection: 'column',
      background: '#FBF8F1', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Left panel */}
        <div className="login-left-panel" style={{
          width: '45%', flexShrink: 0, background: '#0B1D35',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '3rem 3.5rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),' +
              'linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,75,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: '#D4A84B', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#0B1D35',
                }}>O1</div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                  O1DMatch
                </span>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25, marginBottom: '1rem' }}>
                Join the O-1<br />Talent Network
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Connect with extraordinary opportunities for O-1 visa talent, employers, and immigration professionals.
              </p>
            </div>

            {[
              { icon: Shield, text: 'Verified O-1 talent profiles' },
              { icon: Star,   text: 'Premium employer partnerships' },
              { icon: Check,  text: 'Expert immigration attorneys' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(212,168,75,0.15)', border: '1px solid rgba(212,168,75,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={14} style={{ color: '#D4A84B' }} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>{text}</span>
              </div>
            ))}
          </div>

          <p style={{ position: 'relative', zIndex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#D4A84B', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        {/* Right panel — form */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          padding: '3rem 2.5rem', overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', fontWeight: 700, color: '#0B1D35', marginBottom: '0.4rem' }}>
                Create your account
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#D4A84B', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 1rem', background: '#FEF2F2',
                border: '1.5px solid #FECACA', borderRadius: 10, marginBottom: '1.25rem',
              }}>
                <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#DC2626' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Role selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  I am a…
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                    const isSelected = selectedRole === value;
                    return (
                      <label key={value} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                        padding: '0.75rem', border: isSelected ? '1.5px solid #D4A84B' : '1.5px solid #E2D9CC',
                        borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(212,168,75,0.04)' : '#FFFFFF',
                        transition: 'all 0.15s',
                      }}>
                        <input {...register('role')} type="radio" value={value} style={{ display: 'none' }} />
                        <div style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0, marginTop: 1,
                          background: isSelected ? 'rgba(212,168,75,0.15)' : '#F1F5F9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={14} style={{ color: isSelected ? '#D4A84B' : '#94A3B8' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', margin: 0 }}>{label}</p>
                          <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Full name */}
              <div>
                <label htmlFor="full_name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                  Full name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    {...register('full_name')}
                    id="full_name" placeholder="Your full name"
                    style={{
                      width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                      paddingTop: '0.7rem', paddingBottom: '0.7rem',
                      border: errors.full_name ? '1.5px solid #EF4444' : '1.5px solid #E2D9CC',
                      borderRadius: 10, fontSize: '0.9rem', color: '#0B1D35',
                      background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#D4A84B'; e.target.style.boxShadow = '0 0 0 3px rgba(212,168,75,0.12)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = errors.full_name ? '#EF4444' : '#E2D9CC'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.full_name && <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    {...register('email')}
                    type="email" id="email" placeholder="you@example.com"
                    style={{
                      width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                      paddingTop: '0.7rem', paddingBottom: '0.7rem',
                      border: errors.email ? '1.5px solid #EF4444' : '1.5px solid #E2D9CC',
                      borderRadius: 10, fontSize: '0.9rem', color: '#0B1D35',
                      background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#D4A84B'; e.target.style.boxShadow = '0 0 0 3px rgba(212,168,75,0.12)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = errors.email ? '#EF4444' : '#E2D9CC'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.email && <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    {...register('password')}
                    type="password" id="password" placeholder="••••••••"
                    style={{
                      width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                      paddingTop: '0.7rem', paddingBottom: '0.7rem',
                      border: errors.password ? '1.5px solid #EF4444' : '1.5px solid #E2D9CC',
                      borderRadius: 10, fontSize: '0.9rem', color: '#0B1D35',
                      background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#D4A84B'; e.target.style.boxShadow = '0 0 0 3px rgba(212,168,75,0.12)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = errors.password ? '#EF4444' : '#E2D9CC'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.password && <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                  Confirm password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    {...register('confirmPassword')}
                    type="password" id="confirmPassword" placeholder="••••••••"
                    style={{
                      width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                      paddingTop: '0.7rem', paddingBottom: '0.7rem',
                      border: errors.confirmPassword ? '1.5px solid #EF4444' : '1.5px solid #E2D9CC',
                      borderRadius: 10, fontSize: '0.9rem', color: '#0B1D35',
                      background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#D4A84B'; e.target.style.boxShadow = '0 0 0 3px rgba(212,168,75,0.12)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : '#E2D9CC'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.confirmPassword && <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Accuracy Certification Box — UNCHANGED */}
              <div style={{
                background: 'rgba(212,168,75,0.04)', border: '1.5px solid rgba(212,168,75,0.25)',
                borderRadius: 10, padding: '1rem 1.1rem',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B1D35', marginBottom: '0.6rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Accuracy Certification
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {[
                    'All information I provide on this platform is true, accurate, and complete to the best of my knowledge.',
                    'I understand that providing false or misleading information may result in account suspension and could have legal consequences under U.S. immigration law.',
                    'I will promptly update my information if any details change.',
                    selectedRole === 'talent'
                      ? 'My credentials, achievements, and qualifications are accurately represented.'
                      : selectedRole === 'employer'
                      ? 'My company information, job details, and sponsorship intentions are genuine and accurate.'
                      : selectedRole === 'agency'
                      ? 'My agency credentials and client representations are accurate and authorized.'
                      : 'My bar admission status and legal credentials are current and accurately represented.',
                  ].map((point, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        background: 'rgba(212,168,75,0.15)', border: '1px solid rgba(212,168,75,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={9} style={{ color: '#D4A84B' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{point}</span>
                    </li>
                  ))}
                </ul>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    {...register('agree_accuracy')} type="checkbox"
                    style={{ width: 16, height: 16, marginTop: 2, accentColor: '#D4A84B', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.82rem', color: '#0B1D35', fontWeight: 600, lineHeight: 1.5 }}>
                    I certify that all information I submit is true, accurate, and complete.
                  </span>
                </label>
                {errors.agree_accuracy && (
                  <p style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.agree_accuracy.message}</p>
                )}
              </div>

              {/* ── AFFILIATE: Apply as partner (lawyer/agency only) ── */}
              {(selectedRole === 'lawyer' || selectedRole === 'agency') && (
                <div style={{
                  background: 'rgba(212,168,75,0.04)',
                  border: '1.5px solid rgba(212,168,75,0.25)',
                  borderRadius: 10,
                  padding: '1rem 1.1rem',
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={applyAsPartner}
                      onChange={e => setApplyAsPartner(e.target.checked)}
                      style={{ width: 16, height: 16, marginTop: 3, accentColor: '#D4A84B', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0B1D35', marginBottom: '0.2rem' }}>
                        ★ Apply as an Affiliate Partner
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.55 }}>
                        Earn <strong style={{ color: '#92620A' }}>15% commission</strong> on the first payment from every client you refer.
                        You'll receive a unique referral link once your application is approved.
                      </p>
                    </div>
                  </label>
                </div>
              )}
              {/* ── END AFFILIATE ── */}

              {/* Terms */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  {...register('agree_terms')} type="checkbox"
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: '#D4A84B', cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link target="_blank" href="/terms" style={{ color: '#D4A84B', fontWeight: 500, textDecoration: 'none' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link target="_blank" href="/privacy" style={{ color: '#D4A84B', fontWeight: 500, textDecoration: 'none' }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.agree_terms && <p style={{ marginTop: '-0.5rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.agree_terms.message}</p>}

              {/* Submit */}
              <button
                type="submit" disabled={isLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.8rem 1.5rem',
                  background: isLoading ? 'rgba(212,168,75,0.6)' : '#D4A84B',
                  color: '#0B1D35', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', borderRadius: 10, cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#E8C97A'; }}
                onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#D4A84B'; }}
              >
                {isLoading ? <><Loader2 size={17} className="animate-spin" /> Creating account…</> : <>Create account <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Page export — wraps SignupForm in Suspense (required for useSearchParams) ──
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F1' }}>
        <Loader2 size={32} style={{ color: '#D4A84B', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}