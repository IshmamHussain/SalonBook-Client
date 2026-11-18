'use client';

import {
  CalendarCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard/customer', icon: LayoutDashboard },
  { label: 'My Appointments', href: '/dashboard/customer/appointments', icon: CalendarCheck },
  { label: 'My Profile', href: '/dashboard/customer/profile', icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Manage Services', href: '/dashboard/admin/services', icon: Sparkles },
  { label: 'Add Service', href: '/dashboard/admin/services/new', icon: PlusCircle },
  { label: 'Manage Appointments', href: '/dashboard/admin/appointments', icon: CalendarCheck },
  { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Transactions', href: '/dashboard/admin/transactions', icon: CreditCard },
  { label: 'My Profile', href: '/dashboard/admin/profile', icon: User },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, blockedMessage, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (blockedMessage) toast.error(blockedMessage);
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.isBlocked) {
      toast.error('Your account has been blocked by the administrator.');
      router.replace('/sign-in');
      return;
    }

    if (pathname === '/dashboard') {
      router.replace(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer');
      return;
    }

    if (pathname.startsWith('/dashboard/admin') && user.role !== 'admin') {
      toast.error('Unauthorized: Admin dashboard is restricted to administrators.');
      router.replace('/dashboard/customer');
      return;
    }

    if (pathname.startsWith('/dashboard/customer') && user.role !== 'customer') {
      toast.error('Redirected to Admin Dashboard.');
      router.replace('/dashboard/admin');
    }
  }, [loading, user, blockedMessage, pathname, router]);

  async function handleLogout() {
    await logout();
    toast.success('Signed out successfully.');
    router.push('/');
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6]">
        <LoadingSpinner label="Verifying dashboard access..." />
      </div>
    );
  }

  if (
    (pathname.startsWith('/dashboard/admin') && user.role !== 'admin') ||
    (pathname.startsWith('/dashboard/customer') && user.role !== 'customer')
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6]">
        <LoadingSpinner label="Redirecting to your dashboard..." />
      </div>
    );
  }

  const navItems = user.role === 'admin' ? ADMIN_NAV : CUSTOMER_NAV;

  const isNavActive = (href: string) => {
    if (href === '/dashboard/admin' || href === '/dashboard/customer') {
      return pathname === href;
    }
    if (href === '/dashboard/admin/services') {
      return (
        pathname === '/dashboard/admin/services' ||
        (pathname.startsWith('/dashboard/admin/services/') && !pathname.endsWith('/new'))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen bg-[#F4EFE6] text-[#16261F]">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#16261F]/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Clipped-Hedge Emerald Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-[#B5893D] bg-[#1E3A2F] text-[#F4EFE6] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#B5893D]/35 px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-[0.06em] text-[#FBF9F5]"
          >
            <svg
              className="h-4 w-4 text-[#D6BC88]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <span>SALONBOOK</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="cursor-pointer p-1 text-[#D6BC88] hover:text-[#FBF9F5] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Badge */}
        <div className="border-b border-[#B5893D]/25 p-5">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-10 w-10 rounded-full border border-[#D6BC88]/60 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B5893D] bg-[#142820] font-display text-sm font-bold text-[#E8CF9C]">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#FBF9F5]">{user.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#E8CF9C]">
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </p>
            </div>
          </div>
        </div>

        {/* Role Navigation */}
        <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border border-[#B5893D] bg-[#142820] text-[#FBF9F5]'
                    : 'border border-transparent text-[#DFD8CA] hover:bg-white/8 hover:text-[#FBF9F5]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#E8CF9C]' : 'text-[#D6BC88]/80'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="space-y-1 border-t border-[#B5893D]/25 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-[#DFD8CA] transition-colors hover:bg-white/8 hover:text-[#FBF9F5]"
          >
            <Home className="h-4 w-4 text-[#D6BC88]" aria-hidden="true" />
            Back to Storefront
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left text-sm text-rose-200 transition-colors hover:bg-rose-900/40"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D5C9B4] bg-[#FBF9F5]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-[#B5893D]/60 bg-[#F4EFE6] text-[#1E3A2F] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#495A52]">
              {user.role === 'admin' ? 'SalonBook Admin Console' : 'SalonBook Customer Portal'}
            </span>
          </div>

          <Link
            href="/services"
            className="btn-limestone px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em]"
          >
            Browse Services
          </Link>
        </header>

        <main className="terrace-ground flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
