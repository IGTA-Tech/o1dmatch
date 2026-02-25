'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, SignInFormData } from '@/types/forms';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

// Map OAuth/auth error codes to user-friendly messages
function getFriendlyAuthError(
  errorCode: string | null,
  errorDescription: string | null
): string {
  const code = (errorCode || '').toLowerCase();
  const desc = (errorDescription || '').toLowerCase();

  // Access denied / user cancelled
  if (code === 'access_denied' || desc.includes('access_denied') || desc.includes('user denied')) {
    return 'Sign-in was cancelled. Please try again when you\'re ready.';
  }

  // OAuth misconfiguration
  if (desc.includes('redirect_uri') || desc.includes('redirect uri') || desc.includes('callback')) {
    return 'Something went wrong with sign-in. Please try again. If this continues, contact support.';
  }

  // Expired or invalid state (e.g. back button, stale tab)
  if (code === 'invalid_request' || desc.includes('state') || desc.includes('expired')) {
    return 'Your sign-in session expired. Please try again.';
  }

  // Server error from provider
  if (code === 'server_error' || desc.includes('server')) {
    return 'The sign-in service is temporarily unavailable. Please try again in a few minutes.';
  }

  // Email not confirmed
  if (desc.includes('email not confirmed') || desc.includes('not confirmed')) {
    return 'Please check your email and confirm your account before signing in.';
  }

  // Rate limited
  if (desc.includes('rate limit') || desc.includes('too many')) {
    return 'Too many sign-in attempts. Please wait a moment and try again.';
  }

  // Generic fallback
  return 'Something went wrong with sign-in. Please try again.';
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback errors from URL params
  useEffect(() => {
    const authError = searchParams.get('auth_callback_error')
      || searchParams.get('error')
      || searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description')
      || searchParams.get('message');

    if (authError || errorDescription) {
      // Log technical details for debugging
      console.error('[Auth Callback Error]', {
        error: authError,
        description: errorDescription,
        code: searchParams.get('error_code'),
        fullParams: Object.fromEntries(searchParams.entries()),
        timestamp: new Date().toISOString(),
      });

      // Map known error codes to user-friendly messages
      const friendlyMessage = getFriendlyAuthError(authError, errorDescription);
      setError(friendlyMessage);

      // Clean the URL so raw error params aren't visible
      const cleanUrl = window.location.pathname;
      const redirect = searchParams.get('redirect');
      const cleanParams = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
      window.history.replaceState({}, '', `${cleanUrl}${cleanParams}`);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      // Use direct fetch instead of Supabase client
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error_description || result.msg || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Success - store tokens in cookies
      const { access_token, refresh_token, expires_in } = result;
      
      // Get project ref from URL
      const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
      
      // Create the auth token cookie (same format Supabase uses)
      const authData = {
        access_token,
        refresh_token,
        expires_in,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
        token_type: 'bearer',
        user: result.user,
      };

      // Set cookie
      const cookieName = `sb-${projectRef}-auth-token`;
      const cookieValue = encodeURIComponent(JSON.stringify(authData));
      const maxAge = expires_in || 3600;
      
      document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax`;

      console.log('Login successful, redirecting...');
      
      // Redirect
      window.location.href = redirectTo;
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder:text-gray-500"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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