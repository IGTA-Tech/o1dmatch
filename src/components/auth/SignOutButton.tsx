// src/components/auth/SignOutButton.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Different styles based on variant
  const variants = {
    sidebar: `flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 ${className}`,
    header: `flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors ${className}`,
    menu: `flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left ${className}`,
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={variants[variant]}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        showIcon && <LogOut className="w-5 h-5" />
      )}
      <span className="font-medium">Sign Out</span>
    </button>
  );
}