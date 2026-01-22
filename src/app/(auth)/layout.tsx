'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminLogin = pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      <Navbar />
      
      {/* Spacer for fixed navbar */}
      <div className="pt-20" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo - Conditional based on route */}
          <div className="text-center mb-8">
            {isAdminLogin ? (
              <>
                {/* Admin Login Branding */}
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
                <p className="text-gray-600 mt-2">Access the admin dashboard</p>
              </>
            ) : (
              <>
                {/* Default O1DMatch Branding */}
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">O1</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">O1DMatch</h1>
                <p className="text-gray-600 mt-2">Connect O-1 Talent with Opportunity</p>
              </>
            )}
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left - Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-white">O1DMatch</span>
            </div>

            {/* Center - Tagline */}
            <p className="text-gray-400 text-sm text-center">
              Connecting exceptional talent with opportunities for O-1 visa sponsorship.
            </p>

            {/* Right - Copyright */}
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} O1DMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}