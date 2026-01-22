'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      // 1. Login with Supabase Auth
      const response = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error_description || data.msg || 'Login failed');
        setLoading(false);
        return;
      }

      // 2. Check if user is admin
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${data.user.id}&select=role`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const profiles = await profileResponse.json();

      if (!profiles || profiles.length === 0 || profiles[0].role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // 3. Store session in cookie (same format as Supabase SSR)
      const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
      const cookieName = `sb-${projectRef}-auth-token`;
      
      const sessionData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        expires_in: data.expires_in,
        token_type: data.token_type,
        user: data.user,
      };

      const base64Session = btoa(JSON.stringify(sessionData));
      document.cookie = `${cookieName}=base64-${base64Session}; path=/; max-age=${60 * 60 * 24 * 365}`;

      // 4. Redirect to admin dashboard
      window.location.href = '/dashboard/admin';

    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Back Link */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to main site
        </Link>
      </div>
    </>
  );
}