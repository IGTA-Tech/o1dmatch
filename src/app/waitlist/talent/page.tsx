import { Card, CardContent } from '@/components/ui';
import { Star, Award, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import WaitlistForm from '../WaitlistForm';

export default function TalentWaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Benefits */}
          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
              For Talent
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Launch Your O-1 Visa Journey
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of exceptional professionals who are using our platform to 
              showcase their extraordinary abilities and connect with top U.S. employers.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get Your O-1 Score</h3>
                  <p className="text-gray-600 text-sm">
                    Instantly assess your eligibility across all 8 O-1 criteria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Build Your Evidence Portfolio</h3>
                  <p className="text-gray-600 text-sm">
                    Organize and strengthen your achievements with AI assistance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Connect with Employers</h3>
                  <p className="text-gray-600 text-sm">
                    Match with companies actively seeking O-1 eligible talent
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Expert Attorney Network</h3>
                  <p className="text-gray-600 text-sm">
                    Connect with top immigration attorneys specialized in O-1 visas
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Are you an employer?{' '}
              <Link href="/waitlist/employer" className="text-blue-600 hover:underline font-medium">
                Join the employer waitlist →
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
                  Be the first to know when we launch. Get early access and exclusive benefits.
                </p>
                <WaitlistForm defaultRole="talent" />
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                🚀 <span className="font-medium">2,500+</span> professionals already on the waitlist
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}