'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Send,
  Mail,
  Building2,
  Users,
  Search,
  Settings,
  Shield,
  Scale,
  BarChart3,
  FolderOpen,
  X,
} from 'lucide-react';
import { UserRole } from '@/types/enums';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  talent: [
    { label: 'Dashboard', href: '/dashboard/talent', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Profile', href: '/dashboard/talent/profile', icon: <User className="w-5 h-5" /> },
    { label: 'Evidence', href: '/dashboard/talent/evidence', icon: <FileText className="w-5 h-5" /> },
    { label: 'Jobs', href: '/dashboard/talent/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Applications', href: '/dashboard/talent/applications', icon: <Send className="w-5 h-5" /> },
    { label: 'Letters', href: '/dashboard/talent/letters', icon: <Mail className="w-5 h-5" /> },
  ],
  employer: [
    { label: 'Dashboard', href: '/dashboard/employer', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Company Profile', href: '/dashboard/employer/profile', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Browse Talent', href: '/dashboard/employer/browse', icon: <Search className="w-5 h-5" /> },
    { label: 'My Jobs', href: '/dashboard/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Sent Letters', href: '/dashboard/employer/letters', icon: <Mail className="w-5 h-5" /> },
  ],
  agency: [
    { label: 'Dashboard', href: '/dashboard/agency', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Agency Profile', href: '/dashboard/agency/profile', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Clients', href: '/dashboard/agency/clients', icon: <Users className="w-5 h-5" /> },
    { label: 'Jobs', href: '/dashboard/agency/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Applicants', href: '/dashboard/agency/applicants', icon: <FolderOpen className="w-5 h-5" /> },
    { label: 'Letters', href: '/dashboard/agency/letters', icon: <Mail className="w-5 h-5" /> },
  ],
  lawyer: [
    { label: 'Dashboard', href: '/dashboard/lawyer', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Profile', href: '/dashboard/lawyer/profile', icon: <User className="w-5 h-5" /> },
    { label: 'Leads', href: '/dashboard/lawyer/leads', icon: <Users className="w-5 h-5" /> },
    { label: 'Analytics', href: '/dashboard/lawyer/stats', icon: <BarChart3 className="w-5 h-5" /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Documents', href: '/admin/documents', icon: <FileText className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Jobs', href: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Lawyers', href: '/admin/lawyers', icon: <Scale className="w-5 h-5" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ],
};

export function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.talent;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-medium text-gray-900">Menu</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                item.href !== '/admin' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 capitalize">{role}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
