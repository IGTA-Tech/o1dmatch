'use client';

import { useState, useEffect } from 'react';
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

const ROLE_OPTIONS = [
  { value: 'talent',   label: 'O-1 Talent',           description: "I'm looking for opportunities", icon: Star },
  { value: 'employer', label: 'Employer',              description: "I'm hiring O-1 talent",         icon: Briefcase },
  { value: 'agency',   label: 'Staffing Agency',       description: 'I place O-1 talent for clients', icon: Users },
  { value: 'lawyer',   label: 'Immigration Attorney',  description: 'I help with O-1 visa cases',    icon: Scale },
] as const;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Navbar override — add body class
  useEffect(() => {
    document.body.classList.add('signup-page');
    return () => document.body.classList.remove('signup-page');
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
      defaultValues: { role: 'talent', agree_terms: false },
    });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name, role: data.role },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) { setError(signUpError.message); return; }
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Success screen ── */
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

  /* ── Main page ── */
  return (
    <div className="o1d-page" style={{
      position: 'fixed', top: 65, left: 0, right: 0, bottom: 0,
      zIndex: 49, display: 'flex', flexDirection: 'column',
      background: '#FBF8F1', overflowY: 'auto',
    }}>

      {/* ── Panels row ── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── Left panel ── */}
        <div className="login-left-panel" style={{
          width: '45%', flexShrink: 0, background: '#0B1D35',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '3rem 3.5rem', position: 'relative', overflow: 'hidden',
        }}>
          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),' +
              'linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          {/* Gold glow */}
          <div style={{
            position: 'absolute', bottom: '-20%', left: '-20%',
            width: 600, height: 600, pointerEvents: 'none',
            background: 'radial-gradient(circle,rgba(212,168,75,0.12) 0%,transparent 65%)',
          }} />

          {/* Logo spacer */}
          <div style={{ position: 'relative', zIndex: 2 }} />

          {/* Centre copy */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(212,168,75,0.1)', border: '1px solid rgba(212,168,75,0.2)',
              borderRadius: 100, padding: '0.35rem 0.9rem',
              fontSize: '0.72rem', color: '#E8C97A', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              <Shield size={11} />
              Join O1DMatch
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.15,
              color: '#FFFFFF', marginBottom: '1.25rem',
            }}>
              Start your{' '}
              <em style={{ fontStyle: 'normal', color: '#D4A84B' }}>O-1 journey</em>{' '}
              today
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340 }}>
              Create your free account and connect with top employers ready to sponsor
              extraordinary talent for O-1 visas.
            </p>

            {/* Benefit list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
              {[
                'AI-powered petition scoring',
                'Match with 500+ active employers',
                'Attorney-reviewed resources',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(212,168,75,0.2)', border: '1px solid rgba(212,168,75,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={11} style={{ color: '#D4A84B' }} />
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '2rem' }}>
            {[['500+', 'Employers'], ['92%', 'Score accuracy'], ['Free', 'To start']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#D4A84B' }}>{num}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '2.5rem 2rem', background: '#FFFFFF', overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 440 }}>

            {/* Heading */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.9rem', fontWeight: 700, color: '#0B1D35',
                marginBottom: '0.4rem',
              }}>
                Create account
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#D4A84B', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                padding: '0.85rem 1rem', borderRadius: 10, marginBottom: '1.25rem',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#991B1B',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '0.85rem', flex: 1, lineHeight: 1.5 }}>{error}</p>
                <button
                  type="button" onClick={() => setError(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 0, flexShrink: 0 }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Role selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  I am a…
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedRole === option.value;
                    return (
                      <label key={option.value} style={{
                        display: 'flex', flexDirection: 'column', gap: '0.2rem',
                        padding: '0.75rem 0.9rem', borderRadius: 10, cursor: 'pointer',
                        border: isSelected ? '1.5px solid #D4A84B' : '1.5px solid #E2D9CC',
                        background: isSelected ? 'rgba(212,168,75,0.06)' : '#FFFFFF',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}>
                        <input {...register('role')} type="radio" value={option.value} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Icon size={13} style={{ color: isSelected ? '#D4A84B' : '#94A3B8', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B1D35' }}>{option.label}</span>
                        </div>
                        <span style={{ fontSize: '0.73rem', color: '#64748B', lineHeight: 1.4 }}>{option.description}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.role && <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.role.message}</p>}
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
                    type="text" id="full_name" placeholder="John Doe"
                    style={{
                      width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                      paddingTop: '0.7rem', paddingBottom: '0.7rem',
                      border: errors.full_name ? '1.5px solid #EF4444' : '1.5px solid #E2D9CC',
                      borderRadius: 10, fontSize: '0.9rem', color: '#0B1D35',
                      background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
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
                      transition: 'border-color 0.2s, box-shadow 0.2s',
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
                      transition: 'border-color 0.2s, box-shadow 0.2s',
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
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#D4A84B'; e.target.style.boxShadow = '0 0 0 3px rgba(212,168,75,0.12)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : '#E2D9CC'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.confirmPassword && <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#EF4444' }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  {...register('agree_terms')}
                  type="checkbox"
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: '#D4A84B', cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link target="_blank" href="/terms" style={{ color: '#D4A84B', fontWeight: 500, textDecoration: 'none' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link target="_blank" href="/privacy" style={{ color: '#D4A84B', fontWeight: 500, textDecoration: 'none' }}>
                    Privacy Policy
                  </Link>
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
                  transition: 'background 0.2s',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#E8C97A'; }}
                onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#D4A84B'; }}
              >
                {isLoading ? (
                  <><Loader2 size={17} className="animate-spin" /> Creating account…</>
                ) : (
                  <>Create account <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>{/* end panels row */}

      {/* ── Footer ── */}
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