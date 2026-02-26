'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  // Send,
  Mail,
  FolderOpen,
  Building2,
  CreditCard,
  // LogOut,
  Menu,
  // X,
  Plus,
  Bell,
  HelpCircle,
  BarChart3,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface EmployerSidebarProps {
  companyName: string;
  companyInitials: string;
  children: ReactNode;
}

const navSections = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard/employer', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/employer/jobs', label: 'My Jobs', icon: Briefcase },
      { href: '/dashboard/employer/browse', label: 'Browse Talent', icon: Users },
    //   { href: '/dashboard/employer/applications', label: 'Applications', icon: Send },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { href: '/dashboard/employer/letters', label: 'Interest Letters', icon: Mail },
      { href: '/dashboard/employer/exhibits', label: 'Exhibits', icon: FolderOpen },
      { href: '/dashboard/employer/scoring', label: 'O-1 Scoring', icon: BarChart3 },
      { href: '/dashboard/employer/xtraordinarypetitions', label: 'Xtraordinary Petitions', icon: FileText },
      { href: '/dashboard/employer/visa-evaluations', label: 'Visa Evaluations', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/dashboard/employer/profile', label: 'Company Profile', icon: Building2 },
      { href: '/dashboard/employer/billing', label: 'Billing', icon: CreditCard },
    ],
  },
];

export default function EmployerSidebar({
  companyName,
  companyInitials,
  children,
}: EmployerSidebarProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard/employer') return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center font-extrabold text-sm"
            style={{ background: '#D4A84B', color: '#0B1D35' }}
          >
            O1
          </div>
          <span
            className="text-white text-lg font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            O1DMatch
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="px-4 mb-2">
            <div className="px-2 mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] mx-1 mb-0.5 text-sm font-medium transition-all ${
                    active
                      ? 'text-[#E8C97A]'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                  }`}
                  style={active ? { background: 'rgba(212,168,75,0.12)' } : {}}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="px-5 pb-2">
        <SignOutButton variant="sidebar" />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #D4A84B, #E8C97A)',
              color: '#0B1D35',
            }}
          >
            {companyInitials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {companyName}
            </div>
            <div className="text-[0.7rem] text-white/40">Employer Account</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[260px] flex-col z-50"
        style={{ background: '#0B1D35' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-50 transform transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0B1D35' }}
      >
        {sidebarContent}
      </aside>

      {/* Main Area */}
      <div className="flex-1 lg:ml-[260px] min-h-screen" style={{ background: '#FAFAF7' }}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-[#E8ECF1] px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-[#64748B]">
              Employer / <strong className="text-[#1E293B]">Dashboard</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-[10px] border border-[#E8ECF1] bg-white flex items-center justify-center hover:border-[#D4A84B] transition-colors relative">
              <Bell className="w-4 h-4 text-gray-500" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ background: '#D4A84B' }} />
            </button>
            <button className="w-9 h-9 rounded-[10px] border border-[#E8ECF1] bg-white flex items-center justify-center hover:border-[#D4A84B] transition-colors">
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </button>
            <Link
              href="/dashboard/employer/jobs/new"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-[10px] font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{
                background: '#D4A84B',
                color: '#0B1D35',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8 max-w-[1200px]">
          {children}
        </div>
      </div>
    </div>
  );
}