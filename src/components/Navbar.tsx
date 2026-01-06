'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
} from 'lucide-react';
import { usePathname } from "next/navigation";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const loginHref = isDemoMode ? '/demo' : '/login';
    const signupHref = isDemoMode ? '/demo' : '/signup';
    // const talentSignupHref = isDemoMode ? '/demo' : '/signup?role=talent';
    // const employerSignupHref = isDemoMode ? '/demo' : '/signup?role=employer';
    return (
    <header className={`fixed ${isDemoMode ? 'top-10' : 'top-0'} left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-gray-900">O1DMatch</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/how-it-works/candidates" className={`py-2 hover:text-gray-900 ${pathname === "/how-it-works/candidates"? "text-blue-600": "text-gray-600"}`}>
                For Candidates
              </Link>
              <Link href="/how-it-works/employers" className={`py-2 hover:text-gray-900 ${pathname === "/how-it-works/employers"? "text-blue-600": "text-gray-600"}`}>
                For Employers
              </Link>
              <Link href="/lawyers" className={`py-2 hover:text-gray-900 ${pathname === "/lawyers"? "text-blue-600": "text-gray-600"}`}>
                Lawyer Directory
              </Link>
              <Link href="/pricing" className={`py-2 hover:text-gray-900 ${pathname === "/pricing"? "text-blue-600": "text-gray-600"}`}>
                Pricing
              </Link>
              <Link href={loginHref} className={`py-2 hover:text-gray-900 ${pathname === "{loginHref}"? "text-blue-600": "text-gray-600"}`}>
                Log In
              </Link>
              <Link
                href={signupHref}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
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
              <nav className="flex flex-col gap-4">
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
                  href="/lawyers"
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Lawyer Directory
                </Link>
                <Link
                  href={loginHref}
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href={signupHref}
                  className="px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    )
  }
  