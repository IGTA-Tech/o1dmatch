'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Users,
  Building2,
} from 'lucide-react';
import { usePathname } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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

  // Fetch user role
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return profile?.role || null;
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Get initial session
    const initAuth = async () => {
      try {
        // Try getSession first (faster, uses cached session)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        if (session?.user && mounted) {
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          if (mounted) {
            setUserRole(role);
          }
        } else if (mounted) {
          // Double-check with getUser if no session (handles edge cases)
          const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User error:', userError);
          }

          if (authUser && mounted) {
            setUser(authUser);
            const role = await fetchUserRole(authUser.id);
            if (mounted) {
              setUserRole(role);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
// Listen for auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event: AuthChangeEvent, session: Session | null) => {
    console.log('Auth state changed:', event);
    
    if (!mounted) return;

    if (event === 'SIGNED_OUT') {
      setUser(null);
      setUserRole(null);
    } else if (session?.user) {
      setUser(session.user);
      const role = await fetchUserRole(session.user.id);
      if (mounted) {
        setUserRole(role);
      }
    } else {
      setUser(null);
      setUserRole(null);
    }
  }
);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

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
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
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
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2 text-left w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
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