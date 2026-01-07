import { ReactNode } from 'react';
import Navbar from "@/components/Navbar";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 space-y-6 pt-20">
      <Navbar />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">O1DMatch</h1>
          <p className="text-slate-400 mt-2">Connect O-1 Talent with Opportunity</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} O1DMatch. All rights reserved.
        </p>
      </div>
    </div>
  );
}
