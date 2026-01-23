'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  Users,
  Building2,
} from 'lucide-react';
import { usePathname } from "next/navigation";
import { getSupabaseAuthData } from '@/lib/supabase/getToken';
import { SignOutButton } from '@/components/auth/SignOutButton';

// Define User interface locally
interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const waitlistRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (waitlistRef.current && !waitlistRef.current.contains(event.target as Node)) {
        setIsWaitlistOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user role using direct fetch
  const fetchUserRole = useCallback(async (userId: string, accessToken: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const profiles = await response.json();
        if (profiles && profiles[0]) {
          setUserRole(profiles[0].role);
        }
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get auth data directly from cookie
        const authData = getSupabaseAuthData();

        if (authData?.user) {
          setUser(authData.user as AuthUser);
          await fetchUserRole(authData.user.id, authData.access_token);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.log('Auth check error:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchUserRole]);

  const getDashboardLink = () => {
    switch (userRole) {
      case 'talent':
        return '/dashboard/talent';
      case 'employer':
        return '/dashboard/employer';
      case 'agency':
        return '/dashboard/agency';
      case 'lawyer':
        return '/dashboard/lawyer';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  const loginHref = isDemoMode ? '/demo' : '/login';
  const signupHref = isDemoMode ? '/demo' : '/signup';

  const isWaitlistActive = pathname.startsWith('/waitlist');

  // Show logged-in state if we have a user, even if role is still loading
  const isLoggedIn = !!user;

  return (
    <header className={`fixed ${isDemoMode ? 'top-10' : 'top-0'} left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O1</span>
            </div>
            <span className="font-semibold text-gray-900">O1DMatch</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/how-it-works/candidates"
              className={`py-2 hover:text-gray-900 ${pathname === "/how-it-works/candidates" ? "text-blue-600" : "text-gray-600"}`}
            >
              For Candidates
            </Link>
            <Link
              href="/how-it-works/employers"
              className={`py-2 hover:text-gray-900 ${pathname === "/how-it-works/employers" ? "text-blue-600" : "text-gray-600"}`}
            >
              For Employers
            </Link>
            <Link
              href="/pricing"
              className={`py-2 hover:text-gray-900 ${pathname === "/pricing" ? "text-blue-600" : "text-gray-600"}`}
            >
              Pricing
            </Link>

            {/* Waitlist Dropdown */}
            <div className="relative" ref={waitlistRef}>
              <button
                onClick={() => setIsWaitlistOpen(!isWaitlistOpen)}
                className={`flex items-center gap-1 py-2 hover:text-gray-900 ${isWaitlistActive ? "text-blue-600" : "text-gray-600"}`}
              >
                Waitlist
                <ChevronDown className={`w-4 h-4 transition-transform ${isWaitlistOpen ? 'rotate-180' : ''}`} />
              </button>

              {isWaitlistOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/waitlist/talent"
                    onClick={() => setIsWaitlistOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/waitlist/talent" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                  >
                    <Users className="w-4 h-4" />
                    For Talent
                  </Link>
                  <Link
                    href="/waitlist/employer"
                    onClick={() => setIsWaitlistOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/waitlist/employer" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                  >
                    <Building2 className="w-4 h-4" />
                    For Employers
                  </Link>
                </div>
              )}
            </div>

            {/* Auth Links - Show based on user state, not loading */}
            {loading ? (
              // Show skeleton while loading
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : isLoggedIn ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className={`flex items-center gap-1 py-2 hover:text-gray-900 ${pathname.startsWith("/dashboard") ? "text-blue-600" : "text-gray-600"}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {/* Use SignOutButton component */}
                <SignOutButton variant="header" />
              </>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className={`py-2 hover:text-gray-900 ${pathname === "/login" ? "text-blue-600" : "text-gray-600"}`}
                >
                  Log In
                </Link>
                <Link
                  href={signupHref}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              <Link
                href="/how-it-works/candidates"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Candidates
              </Link>
              <Link
                href="/how-it-works/employers"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Employers
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/lawyers"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lawyer Directory
              </Link>

              {/* Mobile Waitlist Links */}
              <div className="py-2 border-t border-gray-100 mt-2">
                <p className="text-sm font-medium text-gray-500 mb-2">Waitlist</p>
                <Link
                  href="/waitlist/talent"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  For Talent
                </Link>
                <Link
                  href="/waitlist/employer"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  For Employers
                </Link>
              </div>

              {/* Mobile Auth Links */}
              {loading ? (
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : isLoggedIn ? (
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {/* Use SignOutButton component for mobile */}
                  <SignOutButton variant="menu" />
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
                  <Link
                    href={loginHref}
                    className="text-gray-600 hover:text-gray-900 py-2 block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href={signupHref}
                    className="px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}