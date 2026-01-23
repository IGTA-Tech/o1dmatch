// src/components/auth/SignOutButton.tsx

'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

interface SignOutButtonProps {
  variant?: 'sidebar' | 'header' | 'menu';
  showIcon?: boolean;
  className?: string;
}

export function SignOutButton({ 
  variant = 'sidebar', 
  showIcon = true,
  className = ''
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    setLoading(true);

    // Get project ref for cookie names
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
      ?.replace('https://', '')
      ?.split('.')[0];

    // Clear all Supabase cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('sb-') || (projectRef && cookieName.includes(projectRef))) {
        // Try multiple path/domain combinations to ensure deletion
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${cookieName}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${cookieName}=; path=/; max-age=0`;
      }
    }

    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || (projectRef && key.includes(projectRef))) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-') || (projectRef && key.includes(projectRef))) {
        sessionStorage.removeItem(key);
      }
    });

    // Hard redirect to login page
    window.location.href = '/login';
  };

  // Different styles based on variant
  const variants = {
    sidebar: `flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 ${className}`,
    header: `flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors ${className}`,
    menu: `flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left ${className}`,
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={variants[variant]}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        showIcon && <LogOut className="w-5 h-5" />
      )}
      <span className="font-medium">{loading ? 'Signing Out...' : 'Sign Out'}</span>
    </button>
  );
}