'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Building2, Briefcase, Scale, Shield, ArrowRight, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/enums';
import { DemoAuth } from '@/lib/demo/demo-auth';

interface DemoAccount {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  email: string;
  dashboardPath: string;
  features: string[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'talent' as UserRole,
    label: 'Talent / Candidate',
    description: 'Experience the platform as an O-1 visa candidate',
    icon: <Users className="w-6 h-6" />,
    email: 'sarah.chen@demo.com',
    dashboardPath: '/dashboard/talent',
    features: [
      'View your O-1 score and criteria breakdown',
      'Upload and manage evidence documents',
      'Browse matching job opportunities',
      'Receive and respond to interest letters',
    ],
  },
  {
    role: 'employer' as UserRole,
    label: 'Employer',
    description: 'Experience the platform as a hiring company',
    icon: <Building2 className="w-6 h-6" />,
    email: 'john.martinez@techcorp.demo',
    dashboardPath: '/dashboard/employer',
    features: [
      'Post job listings with O-1 requirements',
      'Browse anonymized talent profiles',
      'Send interest letters to candidates',
      'Manage applications and hiring pipeline',
    ],
  },
  {
    role: 'agency' as UserRole,
    label: 'Talent Agency',
    description: 'Experience the platform as a recruiting agency',
    icon: <Briefcase className="w-6 h-6" />,
    email: 'elite@agency.demo',
    dashboardPath: '/dashboard/agency',
    features: [
      'Manage multiple client companies',
      'Send letters on behalf of clients',
      'Track talent placements',
      'View agency analytics',
    ],
  },
  {
    role: 'lawyer' as UserRole,
    label: 'Immigration Lawyer',
    description: 'Experience the lawyer directory and connections',
    icon: <Scale className="w-6 h-6" />,
    email: 'michael.thompson@lawfirm.demo',
    dashboardPath: '/dashboard/lawyer',
    features: [
      'Manage your directory profile',
      'Receive connection requests',
      'View potential client profiles',
      'Track consultation requests',
    ],
  },
  {
    role: 'admin' as UserRole,
    label: 'Platform Admin',
    description: 'Experience the admin dashboard',
    icon: <Shield className="w-6 h-6" />,
    email: 'admin@o1dmatch.demo',
    dashboardPath: '/admin',
    features: [
      'Review pending document verifications',
      'Manage user accounts',
      'View platform analytics',
      'Configure system settings',
    ],
  },
];

export function DemoLoginPrompt() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleLogin = async (account: DemoAccount) => {
    setLoadingRole(account.role);
    try {
      const result = await DemoAuth.signIn(account.email, 'demo123');
      if (result.success) {
        router.push(account.dashboardPath);
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Demo Mode
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Explore O1DMatch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a demo account to experience the platform from different perspectives.
            All data is simulated - no real transactions or emails.
          </p>
        </div>

        {/* Account Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <div
              key={account.role}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    {account.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {account.label}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {account.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {account.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleLogin(account)}
                  disabled={loadingRole !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingRole === account.role ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Enter as {account.label}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Password for all accounts: <code className="bg-gray-100 px-2 py-1 rounded">demo123</code>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can switch between accounts anytime using the role switcher in the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
