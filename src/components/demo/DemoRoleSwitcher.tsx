'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ChevronDown, Check, Building2, Briefcase, Scale, Shield } from 'lucide-react';
import { UserRole } from '@/types/enums';
import { DemoAuth } from '@/lib/demo/demo-auth';
import { DEMO_MODE } from '@/lib/demo/config';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  dashboardPath: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: UserRole.TALENT,
    label: 'Talent',
    description: 'Sarah Chen - AI Researcher',
    icon: <Users className="w-4 h-4" />,
    dashboardPath: '/dashboard/talent',
  },
  {
    role: UserRole.EMPLOYER,
    label: 'Employer',
    description: 'TechCorp AI',
    icon: <Building2 className="w-4 h-4" />,
    dashboardPath: '/dashboard/employer',
  },
  {
    role: UserRole.AGENCY,
    label: 'Agency',
    description: 'Elite Talent Agency',
    icon: <Briefcase className="w-4 h-4" />,
    dashboardPath: '/dashboard/agency',
  },
  {
    role: UserRole.LAWYER,
    label: 'Lawyer',
    description: 'Michael Thompson',
    icon: <Scale className="w-4 h-4" />,
    dashboardPath: '/dashboard/lawyer',
  },
  {
    role: UserRole.ADMIN,
    label: 'Admin',
    description: 'Platform Admin',
    icon: <Shield className="w-4 h-4" />,
    dashboardPath: '/admin',
  },
];

export function DemoRoleSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      const session = DemoAuth.getSession();
      if (session) {
        setCurrentRole(session.user.role);
      }
    }
  }, []);

  if (!DEMO_MODE) return null;

  const currentOption = ROLE_OPTIONS.find(opt => opt.role === currentRole);

  const handleRoleSwitch = async (option: RoleOption) => {
    if (option.role === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await DemoAuth.switchRole(option.role);
      setCurrentRole(option.role);
      setIsOpen(false);
      router.push(option.dashboardPath);
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
      >
        {currentOption?.icon || <Users className="w-4 h-4" />}
        <span>Switch Role</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Switch Demo Account
              </p>
            </div>
            <div className="p-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.role}
                  onClick={() => handleRoleSwitch(option)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    currentRole === option.role
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentRole === option.role
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500 truncate">{option.description}</p>
                  </div>
                  {currentRole === option.role && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Switch between demo accounts to explore different user experiences.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
