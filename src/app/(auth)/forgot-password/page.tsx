'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/types/forms';
import { createClient } from '@/lib/supabase/client';
import Footer from "@/components/Footer";
import {
  Loader2, Mail, AlertCircle, Check, ArrowLeft,
  ArrowRight, Shield, X, KeyRound,
} from 'lucide-react';
import '@/app/theme.css';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Navbar override
  useEffect(() => {
    document.body.classList.add('forgot-page');
    return () => document.body.classList.remove('forgot-page');
  }, []);

  const { register, handleSubmit, formState: { errors } } =
    useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (resetError) { setError(resetError.message); return; }
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
              We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the link to reset your password.
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
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
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

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, marginBottom: '1.75rem',
              background: 'rgba(212,168,75,0.12)', border: '1px solid rgba(212,168,75,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#D4A84B',
            }}>
              <KeyRound size={26} />
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(212,168,75,0.1)', border: '1px solid rgba(212,168,75,0.2)',
              borderRadius: 100, padding: '0.35rem 0.9rem',
              fontSize: '0.72rem', color: '#E8C97A', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              <Shield size={11} />
              Password Reset
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.15,
              color: '#FFFFFF', marginBottom: '1.25rem',
            }}>
              Recover your{' '}
              <em style={{ fontStyle: 'normal', color: '#D4A84B' }}>account</em>
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340, marginBottom: '2.5rem' }}>
              Enter your email address and we&apos;ll send you a secure link to reset your password and regain access.
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                ['1', 'Enter your email address'],
                ['2', 'Check your inbox for the reset link'],
                ['3', 'Set a new secure password'],
              ].map(([num, text]) => (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(212,168,75,0.15)', border: '1px solid rgba(212,168,75,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Playfair Display', serif", fontWeight: 700,
                    fontSize: '0.8rem', color: '#D4A84B',
                  }}>
                    {num}
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2.5rem 2rem', background: '#FFFFFF',
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Back link */}
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.82rem', color: '#64748B', textDecoration: 'none',
              marginBottom: '1.75rem', fontWeight: 500,
            }}>
              <ArrowLeft size={14} style={{ color: '#94A3B8' }} />
              Back to sign in
            </Link>

            {/* Heading */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.9rem', fontWeight: 700, color: '#0B1D35',
                marginBottom: '0.4rem',
              }}>
                Forgot password?
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                No worries — enter your email and we&apos;ll send you a reset link.
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

              {/* Email */}
              <div>
                <label htmlFor="email" style={{
                  display: 'block', fontSize: '0.82rem', fontWeight: 600,
                  color: '#0B1D35', marginBottom: '0.4rem', letterSpacing: '0.02em',
                }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute', left: '0.9rem', top: '50%',
                    transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none',
                  }} />
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
                {isLoading ? (
                  <><Loader2 size={17} className="animate-spin" /> Sending reset link…</>
                ) : (
                  <>Send reset link <ArrowRight size={16} /></>
                )}
              </button>

              {/* Sign up nudge */}
              <p style={{ textAlign: 'center', fontSize: '0.83rem', color: '#64748B', marginTop: '0.25rem' }}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" style={{ color: '#D4A84B', fontWeight: 600, textDecoration: 'none' }}>
                  Sign up free
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>{/* end panels row */}

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}