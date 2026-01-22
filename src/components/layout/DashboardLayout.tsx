// src/components/layout/DashboardLayout.tsx
// 
// Updated DashboardLayout with Sign Out button in the sidebar

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Mail,
  Send,
  Users,
  Settings,
  Building2,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'talent' | 'employer' | 'admin' | 'agency' | 'lawyer';
}

// Define navigation items for each role
const navigationItems = {
  talent: [
    { href: '/dashboard/talent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/talent/profile', label: 'Profile', icon: User },
    { href: '/dashboard/talent/evidence', label: 'Evidence', icon: FileText },
    { href: '/dashboard/talent/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/talent/applications', label: 'Applications', icon: Send },
    { href: '/dashboard/talent/letters', label: 'Letters', icon: Mail },
  ],
  employer: [
    { href: '/dashboard/employer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/employer/profile', label: 'Company Profile', icon: Building2 },
    { href: '/dashboard/employer/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/employer/browse', label: 'Browse Talent', icon: Users },
    { href: '/dashboard/employer/letters', label: 'Letters', icon: Mail },
    { href: '/dashboard/employer/applications', label: 'Applications', icon: Send },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/letters', label: 'Letters', icon: Mail },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
  agency: [
    { href: '/dashboard/agency', label: 'Dashboard', icon: LayoutDashboard },
  ],
  lawyer: [
    { href: '/dashboard/lawyer', label: 'Dashboard', icon: LayoutDashboard },
  ],
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const navItems = navigationItems[role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O1</span>
            </div>
            <span className="font-semibold text-gray-900">O1DMatch</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Show NotificationBell only for talent users */}
            {role === 'talent' && <NotificationBell />}
            
            {/* Settings Link */}
            <Link
              href={`/dashboard/${role}/settings`}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Sign Out Button in Header (optional - you can remove if only using sidebar) */}
            <SignOutButton variant="header" />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        {/* Navigation Links */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button at Bottom of Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <SignOutButton variant="sidebar" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}