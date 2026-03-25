'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, SignInFormData } from '@/types/forms';
import { Loader2, Mail, Lock, AlertCircle, X, ArrowRight, Shield } from 'lucide-react';
import '@/app/theme.css';
import Footer from "@/components/Footer";

/* ─── OAuth error → friendly message ─────────────────────── */
function getFriendlyAuthError(
  errorCode: string | null,
  errorDescription: string | null
): string {
  const code = (errorCode || '').toLowerCase();
  const desc = (errorDescription || '').toLowerCase();
  if (code === 'access_denied' || desc.includes('access_denied') || desc.includes('user denied'))
    return "Sign-in was cancelled. Please try again when you're ready.";
  if (desc.includes('redirect_uri') || desc.includes('redirect uri') || desc.includes('callback'))
    return 'Something went wrong with sign-in. Please try again. If this continues, contact support.';
  if (code === 'invalid_request' || desc.includes('state') || desc.includes('expired'))
    return 'Your sign-in session expired. Please try again.';
  if (code === 'server_error' || desc.includes('server'))
    return 'The sign-in service is temporarily unavailable. Please try again in a few minutes.';
  if (desc.includes('email not confirmed') || desc.includes('not confirmed'))
    return 'Please check your email and confirm your account before signing in.';
  if (desc.includes('rate limit') || desc.includes('too many'))
    return 'Too many sign-in attempts. Please wait a moment and try again.';
  return 'Something went wrong with sign-in. Please try again.';
}

/* ─── Main form ───────────────────────────────────────────── */
function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authError =
      searchParams.get('auth_callback_error') ||
      searchParams.get('error') ||
      searchParams.get('error_code');
    const errorDescription =
      searchParams.get('error_description') || searchParams.get('message');
    if (authError || errorDescription) {
      console.error('[Auth Callback Error]', {
        error: authError, description: errorDescription,
        code: searchParams.get('error_code'),
        fullParams: Object.fromEntries(searchParams.entries()),
        timestamp: new Date().toISOString(),
      });
      setError(getFriendlyAuthError(authError, errorDescription));
      const cleanUrl = window.location.pathname;
      const redirect = searchParams.get('redirect');
      const cleanParams = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
      window.history.replaceState({}, '', `${cleanUrl}${cleanParams}`);
    }
  }, [searchParams]);

  // Add body class for navbar override CSS
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const { register, handleSubmit, formState: { errors } } =
    useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': supabaseAnonKey },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error_description || result.msg || 'Invalid email or password');
        setIsLoading(false);
        return;
      }
      const { access_token, refresh_token, expires_in } = result;
      const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
      const authData = {
        access_token, refresh_token, expires_in,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
        token_type: 'bearer', user: result.user,
      };
      const cookieName = `sb-${projectRef}-auth-token`;
      const cookieValue = encodeURIComponent(JSON.stringify(authData));
      document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=${expires_in || 3600}; SameSite=Lax`;
      window.location.href = redirectTo;
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="o1d-page" style={{ position: 'fixed', top: 65, left: 0, right: 0, bottom: 0, zIndex: 49, display: 'flex', flexDirection: 'column', background: '#FBF8F1', overflowY: 'auto' }}>

      {/* ── Panels row ── */}
      <div style={{ display: 'flex', flex: 1 }}>

      {/* ── Left panel — navy brand column ── */}
      <div style={{
        width: '45%', flexShrink: 0, background: '#0B1D35',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem 3.5rem', position: 'relative', overflow: 'hidden',
      }} className="login-left-panel">

        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-20%',
          width: 600, height: 600, pointerEvents: 'none',
          background: 'radial-gradient(circle,rgba(212,168,75,0.12) 0%,transparent 65%)',
        }} />

        {/* Logo space intentionally empty — logo lives in the shared Navbar */}
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
            Secure Sign In
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.15,
            color: '#FFFFFF', marginBottom: '1.25rem',
          }}>
            Welcome to your{' '}
            <em style={{ fontStyle: 'normal', color: '#D4A84B' }}>O-1 journey</em>
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340 }}>
            Access your profile, track your petition score, and connect with
            employers ready to sponsor exceptional talent.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
            {[['500+', 'Active employers'], ['92%', 'Score accuracy'], ['3×', 'Faster matching']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#D4A84B' }}>{num}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>{label}</div>
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
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.9rem', fontWeight: 700, color: '#0B1D35',
              marginBottom: '0.4rem',
            }}>
              Sign in
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#D4A84B', fontWeight: 600, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </div>

          {/* Error banner */}
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
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  {...register('email')}
                  type="email" id="email"
                  placeholder="you@example.com"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="password" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0B1D35', letterSpacing: '0.02em' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: '#D4A84B', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  {...register('password')}
                  type="password" id="password"
                  placeholder="••••••••"
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

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: '#D4A84B', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.83rem', color: '#64748B' }}>Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                width: '100%', padding: '0.8rem 1.5rem',
                background: isLoading ? 'rgba(212,168,75,0.6)' : '#D4A84B',
                color: '#0B1D35', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', borderRadius: 10, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#E8C97A'; }}
              onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#D4A84B'; }}
            >
              {isLoading ? (
                <><Loader2 size={17} style={{ animation: 'o1d-login-spin 0.7s linear infinite' }} /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E8E0D4' }} />
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>secure & encrypted</span>
            <div style={{ flex: 1, height: 1, background: '#E8E0D4' }} />
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            {[
              { icon: '🔒', label: 'SSL encrypted' },
              { icon: '🛡️', label: 'SOC 2 compliant' },
              { icon: '⚖️', label: 'Attorney-built' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      </div>{/* end panels row */}

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F1' }}>
      <Loader2 size={32} style={{ animation: 'o1d-login-spin 0.7s linear infinite', color: '#D4A84B' }} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}