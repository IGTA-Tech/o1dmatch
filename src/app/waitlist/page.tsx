import Link from 'next/link';
import { Users, Building2, Briefcase, Scale } from 'lucide-react';

const WAITLIST_OPTIONS = [
  {
    href: '/waitlist/talent',
    icon: Users,
    title: 'O-1 Talent',
    description: 'Join the waitlist as an O-1 visa candidate looking for opportunities with US employers.',
    color: 'blue',
  },
  {
    href: '/waitlist/employer',
    icon: Building2,
    title: 'Employer',
    description: 'Join as a US company looking to hire extraordinary talent through O-1 visas.',
    color: 'green',
  },
  {
    href: '/waitlist/agency',
    icon: Briefcase,
    title: 'Staffing Agency',
    description: 'Partner with O1DMatch to place O-1 talent with your clients.',
    color: 'purple',
  },
  {
    href: '/waitlist/lawyer',
    icon: Scale,
    title: 'Immigration Attorney',
    description: 'Join our lawyer directory and connect with O-1 candidates seeking legal representation.',
    color: 'orange',
  },
];

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    icon: 'bg-blue-100 text-blue-600',
    border: 'border-blue-200 hover:border-blue-300',
  },
  green: {
    bg: 'bg-green-50 hover:bg-green-100',
    icon: 'bg-green-100 text-green-600',
    border: 'border-green-200 hover:border-green-300',
  },
  purple: {
    bg: 'bg-purple-50 hover:bg-purple-100',
    icon: 'bg-purple-100 text-purple-600',
    border: 'border-purple-200 hover:border-purple-300',
  },
  orange: {
    bg: 'bg-orange-50 hover:bg-orange-100',
    icon: 'bg-orange-100 text-orange-600',
    border: 'border-orange-200 hover:border-orange-300',
  },
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Join the <span className="text-blue-600">O1DMatch</span> Waitlist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to access the premier platform connecting O-1 visa talent with US employers.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {WAITLIST_OPTIONS.map((option) => {
            const styles = colorStyles[option.color as keyof typeof colorStyles];
            const Icon = option.icon;

            return (
              <Link
                key={option.href}
                href={option.href}
                className={`block p-6 rounded-xl border-2 transition-all ${styles.bg} ${styles.border}`}
              >
                <div className={`w-12 h-12 rounded-lg ${styles.icon} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h2>
                <p className="text-gray-600">{option.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Why Join Early?</h3>
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Priority Access</h4>
              <p className="text-gray-600 text-sm">Be first in line when we launch</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Exclusive Offers</h4>
              <p className="text-gray-600 text-sm">Special pricing for early adopters</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Shape the Product</h4>
              <p className="text-gray-600 text-sm">Give feedback on features you want</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
