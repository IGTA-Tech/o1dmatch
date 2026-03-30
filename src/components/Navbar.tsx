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
  // BookOpen,
  User,
  CreditCard,
  FileText,
  ClipboardCheck,
  Star,
  FolderOpen,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { usePathname } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  // const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [talentTier, setTalentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const onboardingRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  // const legalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (onboardingRef.current && !onboardingRef.current.contains(event.target as Node)) {
        setIsOnboardingOpen(false);
      }
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
      // if (legalRef.current && !legalRef.current.contains(event.target as Node)) {
      //   setIsLegalOpen(false);
      // }
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
          const role = profiles[0].role;
          setUserRole(role);

          // If talent, fetch subscription tier
          if (role === 'talent') {
            try {
              const subResponse = await fetch(
                `${supabaseUrl}/rest/v1/talent_subscriptions?talent_id=eq.${userId}&select=tier`,
                {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': anonKey,
                    'Content-Type': 'application/json',
                  },
                }
              );
              if (subResponse.ok) {
                const subs = await subResponse.json();
                if (subs && subs[0]) {
                  setTalentTier(subs[0].tier);
                } else {
                  setTalentTier('profile_only');
                }
              }
            } catch {
              setTalentTier('profile_only');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Failsafe: always resolve loading after 3s max
    const failsafe = setTimeout(() => setLoading(false), 3000);

    // getUser() is more reliable than getSession() in Next.js App Router
    supabase.auth.getUser().then(({ data }: { data: { user: import('@supabase/supabase-js').User | null } }) => { const authUser = data.user;
      if (authUser) {
        setUser(authUser as AuthUser);
        // Get session for access token needed by fetchUserRole
        supabase.auth.getSession().then(({ data: sessionData }: { data: { session: import('@supabase/supabase-js').Session | null } }) => { const session = sessionData.session;
          if (session?.access_token) {
            fetchUserRole(authUser.id, session.access_token);
          } else {
            setLoading(false);
          }
        });
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    }).catch(() => {
      setUser(null);
      setUserRole(null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
        clearTimeout(failsafe);
        if (session?.user) {
          setUser(session.user as AuthUser);
          fetchUserRole(session.user.id, session.access_token);
        } else {
          setUser(null);
          setUserRole(null);
          setTalentTier(null);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
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

  const getProfileLink = () => {
    switch (userRole) {
      case 'talent':
        return '/dashboard/talent/profile';
      case 'employer':
        return '/dashboard/employer/profile';
      case 'agency':
        return '/dashboard/agency/profile';
      case 'lawyer':
        return '/dashboard/lawyer/profile';
      case 'admin':
        return '/dashboard/admin/settings';
      default:
        return null;
    }
  };

  const loginHref = isDemoMode ? '/demo' : '/login';
  const signupHref = isDemoMode ? '/demo' : '/signup';

  const isOnboardingActive = pathname.startsWith('/onboarding');

  // Show logged-in state if we have a user, even if role is still loading
  const isLoggedIn = !!user;

  // Talent tools require a paid plan
  // Only show when we KNOW the user has a paid tier - hide for free and unknown/loading
  const isFreeTalent = userRole === 'talent' && (talentTier === null || talentTier === 'profile_only');

  const profileLink = getProfileLink();

  return (
    <header className={`fixed ${isDemoMode ? 'top-10' : 'top-0'} left-0 right-0 backdrop-blur-sm border-b border-[#1a3050] z-50`} style={{ background: 'rgba(11,29,53,0.95)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center font-extrabold text-sm"
              style={{ background: '#D4A84B', color: '#0B1D35' }}
            >
              O1
            </div>
            <span
              className="font-bold text-lg text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              O1DMatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/how-it-works/candidates"
              className={`py-2 hover:text-white ${pathname === "/how-it-works/candidates" ? "text-blue-600" : "text-white/70"}`}
            >
              For Candidates
            </Link>
            <Link
              href="/how-it-works/employers"
              className={`py-2 hover:text-white ${pathname === "/how-it-works/employers" ? "text-blue-600" : "text-white/70"}`}
            >
              For Employers
            </Link>
            <Link
              href="/pricing"
              className={`py-2 hover:text-white ${pathname === "/pricing" ? "text-blue-600" : "text-white/70"}`}
            >
              Pricing
            </Link>
            <Link
              href="/enterprise"
              className={`py-2 hover:text-white ${pathname === "/enterprise" ? "text-blue-600" : "text-white/70"}`}
            >
              Enterprise
            </Link>
            <Link
              href="/about"
              className={`py-2 hover:text-white ${pathname === "/about" ? "text-blue-600" : "text-white/70"}`}
            >
              About
            </Link>

            {/* Blog Link */}
            {/* <Link
              href="/blog"
              className={`flex items-center gap-1 py-2 hover:text-white ${pathname.startsWith("/blog") ? "text-blue-600" : "text-white/70"}`}
            >
              <BookOpen className="w-4 h-4" />
              Blog
            </Link> */}

            {/* Legal Dropdown */}
            {/* <div className="relative" ref={legalRef}>
              <button
                onClick={() => setIsLegalOpen(!isLegalOpen)}
                className={`flex items-center gap-1 py-2 hover:text-white ${
                  pathname === "/privacy" || pathname === "/terms" ? "text-blue-600" : "text-white/70"
                }`}
              >
                <Shield className="w-4 h-4" />
                Legal
                <ChevronDown className={`w-4 h-4 transition-transform ${isLegalOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLegalOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/privacy"
                    onClick={() => setIsLegalOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/privacy" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                  >
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setIsLegalOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/terms" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                  >
                    <FileText className="w-4 h-4" />
                    Terms of Service
                  </Link>
                </div>
              )}
            </div> */}

            {/* Onboarding Dropdown */}
            <div className="relative" ref={onboardingRef}>
              <button
                onClick={() => setIsOnboardingOpen(!isOnboardingOpen)}
                className={`flex items-center gap-1 py-2 hover:text-white ${isOnboardingActive ? "text-blue-600" : "text-white/70"}`}
              >
                Onboarding
                <ChevronDown className={`w-4 h-4 transition-transform ${isOnboardingOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOnboardingOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="https://app.o1dmatch.com/onboarding/talent"
                    onClick={() => setIsOnboardingOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/onboarding/talent" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                  >
                    <Users className="w-4 h-4" />
                    For Talent
                  </Link>
                  <Link
                    href="https://app.o1dmatch.com/onboarding/employer"
                    onClick={() => setIsOnboardingOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/onboarding/employer" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                  >
                    <Building2 className="w-4 h-4" />
                    For Employers
                  </Link>
                </div>
              )}
            </div>

            {/* Auth Links - Show based on user state, not loading */}
            {(!user && loading) ? (
              // Show skeleton only when user existence is unknown
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : isLoggedIn ? (
              <>
                {/* Dashboard Dropdown */}
                <div className="relative" ref={dashboardRef}>
                  <button
                    onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                    className={`flex items-center gap-1 py-2 hover:text-white ${pathname.startsWith("/dashboard") ? "text-blue-600" : "text-white/70"}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDashboardOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsDashboardOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === getDashboardLink() ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      {profileLink && (
                        <Link
                          href={profileLink}
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === profileLink ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      )}
                      {userRole === 'employer' && (
                        <Link
                          href="/dashboard/employer/billing"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/employer/billing" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <CreditCard className="w-4 h-4" />
                          Billing
                        </Link>
                      )}
                      {userRole === 'employer' && (
                        <Link
                          href="/dashboard/employer/xtraordinarypetitions"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/employer/xtraordinarypetitions" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <FileText className="w-4 h-4" />
                          Xtraordinary Petitions
                        </Link>
                      )}
                      {userRole === 'employer' && (
                        <Link
                          href="/dashboard/employer/visa-evaluations"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/employer/visa-evaluations" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Visa Evaluations
                        </Link>
                      )}
                      {userRole === 'employer' && (
                        <Link
                          href="/dashboard/employer/scoring"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/employer/scoring" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <Star className="w-4 h-4" />
                          Scoring
                        </Link>
                      )}
                      {userRole === 'employer' && (
                        <Link
                          href="/dashboard/employer/exhibits"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/employer/exhibits" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <FolderOpen className="w-4 h-4" />
                          Exhibits
                        </Link>
                      )}
                      {userRole === 'agency' && (
                        <Link
                          href="/dashboard/agency/messages"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/agency/messages" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Messages
                        </Link>
                      )}
                      {userRole === 'talent' && (
                        <Link
                          href="/dashboard/talent/billing"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/talent/billing" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <CreditCard className="w-4 h-4" />
                          Billing
                        </Link>
                      )}
                      {/* {userRole === 'talent' && !isFreeTalent && (
                        <Link
                          href="/dashboard/talent/scoring"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/talent/scoring" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Scoring
                        </Link>
                      )}
                      {userRole === 'talent' && !isFreeTalent && (
                        <Link
                          href="/dashboard/talent/visa-evaluations"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/talent/visa-evaluations" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Visa Evaluations
                        </Link>
                      )} */}
                      {userRole === 'talent' && !isFreeTalent && (
                        <Link
                          href="/dashboard/talent/social-media-scanner"
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${pathname === "/dashboard/talent/social-media-scanner" ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                        >
                          <Shield className="w-4 h-4" />
                          Social Media Scanner
                        </Link>
                      )}
                      <div className="border-t border-[#1a3050] my-1" />
                      <div className="px-4 py-2">
                        <SignOutButton variant="menu" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className={`py-2 hover:text-white ${pathname === "/login" ? "text-blue-600" : "text-white/70"}`}
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
              <X className="w-6 h-6 text-white/70" />
            ) : (
              <Menu className="w-6 h-6 text-white/70" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1a3050]">
            <nav className="flex flex-col gap-2">
              <Link
                href="/how-it-works/candidates"
                className="text-white/70 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Candidates
              </Link>
              <Link
                href="/how-it-works/employers"
                className="text-white/70 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Employers
              </Link>
              <Link
                href="/pricing"
                className="text-white/70 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/enterprise"
                className={`text-white/70 hover:text-white py-2 ${pathname === "/enterprise" ? "text-blue-600 font-medium" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Enterprise
              </Link>
              <Link
                href="/about"
                className="text-white/70 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
             {/* <Link
                href="/blog"
                className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                Blog
              </Link>
               <Link
                href="/lawyers"
                className="text-white/70 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lawyer Directory
              </Link> */}

              {/* Mobile Legal Links */}
              {/* <div className="py-2 border-t border-[#1a3050] mt-2">
                <p className="text-sm font-medium text-gray-500 mb-2">Legal</p>
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 text-white/70 hover:text-white py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center gap-2 text-white/70 hover:text-white py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </Link>
              </div> */}

              {/* Mobile Onboarding Links */}
              <div className="py-2 border-t border-[#1a3050] mt-2">
                <p className="text-sm font-medium text-gray-500 mb-2">Onboarding</p>
                <Link
                  href="https://app.o1dmatch.com/onboarding/talent"
                  className="flex items-center gap-2 text-white/70 hover:text-white py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  For Talent
                </Link>
                <Link
                  href="https://app.o1dmatch.com/onboarding/employer"
                  className="flex items-center gap-2 text-white/70 hover:text-white py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  For Employers
                </Link>
              </div>

              {/* Mobile Auth Links */}
              {(!user && loading) ? (
                <div className="border-t border-[#1a3050] pt-2 mt-2">
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : isLoggedIn ? (
                <div className="border-t border-[#1a3050] pt-2 mt-2">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {profileLink && (
                    <Link
                      href={profileLink}
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  )}
                  {userRole === 'employer' && (
                    <Link
                      href="/dashboard/employer/billing"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing
                    </Link>
                  )}
                  {userRole === 'employer' && (
                    <Link
                      href="/dashboard/employer/xtraordinarypetitions"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      Xtraordinary Petitions
                    </Link>
                  )}
                  {userRole === 'employer' && (
                    <Link
                      href="/dashboard/employer/visa-evaluations"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Visa Evaluations
                    </Link>
                  )}
                  {userRole === 'employer' && (
                    <Link
                      href="/dashboard/employer/scoring"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Star className="w-4 h-4" />
                      Scoring
                    </Link>
                  )}
                  {userRole === 'employer' && (
                    <Link
                      href="/dashboard/employer/exhibits"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FolderOpen className="w-4 h-4" />
                      Exhibits
                    </Link>
                  )}
                  {userRole === 'agency' && (
                    <Link
                      href="/dashboard/agency/messages"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Messages
                    </Link>
                  )}
                  {userRole === 'talent' && (
                    <Link
                      href="/dashboard/talent/billing"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing
                    </Link>
                  )}
                  {/* {userRole === 'talent' && !isFreeTalent && (
                    <Link
                      href="/dashboard/talent/scoring"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Scoring
                    </Link>
                  )}
                  {userRole === 'talent' && !isFreeTalent && (
                    <Link
                      href="/dashboard/talent/visa-evaluations"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Visa Evaluations
                    </Link>
                  )} */}
                  {userRole === 'talent' && !isFreeTalent && (
                    <Link
                      href="/dashboard/talent/social-media-scanner"
                      className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Social Media Scanner
                    </Link>
                  )}
                  {/* Use SignOutButton component for mobile */}
                  <SignOutButton variant="menu" />
                </div>
              ) : (
                <div className="border-t border-[#1a3050] pt-2 mt-2 space-y-2">
                  <Link
                    href={loginHref}
                    className="text-white/70 hover:text-white py-2 block"
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