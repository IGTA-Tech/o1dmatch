import { Card, CardContent } from '@/components/ui';
import { Building2, Globe, Shield, Zap, Gift, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import WaitlistForm from '../WaitlistForm';
import Navbar from "@/components/Navbar";

export default function EmployerWaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />
      
      {/* Spacer for fixed navbar */}
      <div className="pt-20" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* FREE During Beta Banner */}
        <div className="mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-2xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxMS4wNDYgMCAyMC03Ljg4IDIwLTE5LjUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative px-6 py-8 md:px-12 md:py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">
                      Limited Time Offer
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    FREE During Beta
                  </h2>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-white">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">$0</p>
                    <p className="text-sm text-white/80">per month</p>
                  </div>
                  <div className="hidden sm:block h-12 w-px bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl font-bold">∞</p>
                    <p className="text-sm text-white/80">unlimited access</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Full platform access</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Early adopter perks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Benefits */}
          <div>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
              For Employers
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hire Extraordinary Global Talent
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Access a curated pool of exceptional professionals who are pre-qualified 
              for O-1 visa sponsorship. Hire the world&apos;s best without the guesswork.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pre-Qualified Candidates</h3>
                  <p className="text-gray-600 text-sm">
                    Every candidate is scored and verified for O-1 eligibility
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Streamlined Process</h3>
                  <p className="text-gray-600 text-sm">
                    Generate interest letters and support documentation instantly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Global Talent Pool</h3>
                  <p className="text-gray-600 text-sm">
                    Access exceptional talent from around the world
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Attorney Connections</h3>
                  <p className="text-gray-600 text-sm">
                    Partner with experienced O-1 immigration attorneys
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Are you a professional seeking opportunities?{' '}
              <Link href="/waitlist/talent" className="text-blue-600 hover:underline font-medium">
                Join the talent waitlist →
              </Link>
            </p>
          </div>

          {/* Right - Form */}
          <div>
            <Card className="shadow-xl border-2 border-green-100">
              <CardContent className="p-8">
                {/* Beta Badge */}
                <div className="flex items-center justify-center mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Free Beta Access
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Join the Waitlist
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  Get early access to hire extraordinary global talent for your team.
                </p>
                <WaitlistForm defaultRole="employer" />
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                🏢 <span className="font-medium">500+</span> companies already on the waitlist
              </p>
            </div>
          </div>
        </div>

        {/* Logos Section */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-6">Trusted by innovative companies</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            {/* Placeholder for company logos */}
            <div className="w-24 h-8 bg-gray-200 rounded" />
            <div className="w-24 h-8 bg-gray-200 rounded" />
            <div className="w-24 h-8 bg-gray-200 rounded" />
            <div className="w-24 h-8 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
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