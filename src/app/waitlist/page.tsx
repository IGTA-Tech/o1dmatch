import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Building2, Users, Scale, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Join the Waitlist | O1DMatch',
  description: 'Get early access to O1DMatch - the platform connecting O-1 visa talent with U.S. employers.',
};

const categories = [
  {
    id: 'talent',
    title: 'O-1 Talent',
    description: 'Extraordinary professionals seeking U.S. employers willing to sponsor O-1 visas',
    icon: Sparkles,
    offer: '50% off yearly',
    href: '/waitlist/talent',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'employer',
    title: 'Employers',
    description: 'Companies looking to hire and sponsor O-1 visa candidates',
    icon: Building2,
    offer: '3 months free',
    href: '/waitlist/employer',
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  {
    id: 'agency',
    title: 'Staffing Agencies',
    description: 'Recruitment agencies placing O-1 talent with their clients',
    icon: Users,
    offer: '3 months free',
    href: '/waitlist/agency',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    id: 'lawyer',
    title: 'Immigration Lawyers',
    description: 'Attorneys seeking qualified O-1 client referrals',
    icon: Scale,
    offer: '3 months free',
    href: '/waitlist/lawyer',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
  },
];

export default function WaitlistHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            O1DMatch
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Early Access
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join the O1DMatch Waitlist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to access the platform connecting extraordinary O-1 talent
            with U.S. employers ready to sponsor.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-gray-500 mb-8">Select your category to join the waitlist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className={`group relative bg-white rounded-2xl border ${category.borderColor} p-6 shadow-sm hover:shadow-lg transition-all duration-300`}
                >
                  {/* Offer Badge */}
                  <div className={`absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r ${category.gradient} text-white text-xs font-medium rounded-full`}>
                    {category.offer}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${category.bgLight} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${category.textColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        {category.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Join the Waitlist?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-semibold mb-2">Early Access</h3>
              <p className="text-sm text-gray-500">
                Be first to use the platform when we launch
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Exclusive Offers</h3>
              <p className="text-sm text-gray-500">
                Lock in special pricing only available to waitlist members
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">📧</div>
              <h3 className="font-semibold mb-2">Priority Updates</h3>
              <p className="text-sm text-gray-500">
                Get notified first about new features and launch dates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 O1DMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
