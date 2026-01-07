import { Card, CardContent } from '@/components/ui';
import { Building2, Globe, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import WaitlistForm from '../WaitlistForm';

export default function EmployerWaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      
      <div className="max-w-6xl mx-auto px-4 py-12">
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
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Join the Waitlist
                </h2>
                <p className="text-gray-600 mb-6">
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
    </div>
  );
}