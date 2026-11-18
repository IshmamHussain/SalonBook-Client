'use client';

import { ChevronDown, LayoutDashboard, LogOut, Menu, Scissors, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dashboardHref = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer';

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success('Signed out of SalonBook.');
    router.push('/');
    router.refresh();
  }

  const navLinkClass = (active: boolean) =>
    `text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
      active ? 'text-[#E08A5E]' : 'text-[#D0DCE7] hover:text-[#F4F6F8]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/12 bg-[#0B0F14]/88 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-[#F4F6F8]"
        >
          <span className="flex h-8 w-8 items-center justify-center border border-[#E08A5E]/50 bg-[#E08A5E]/15 text-[#E08A5E]">
            <Scissors className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            Salon<span className="text-[#E08A5E]">Book</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          <Link href="/" className={navLinkClass(pathname === '/')}>
            Home
          </Link>
          <Link href="/services" className={navLinkClass(pathname.startsWith('/services'))}>
            Browse Services
          </Link>
          {user && (
            <Link href={dashboardHref} className={navLinkClass(pathname.startsWith('/dashboard'))}>
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Auth Area */}
        <div className="hidden items-center gap-4 md:flex">
          {loading ? (
            <div className="h-9 w-36 animate-pulse border border-white/10 bg-[#121922]" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className="flex cursor-pointer items-center gap-2.5 border border-white/18 bg-[#121922] px-3 py-1.5 text-sm text-[#F4F6F8] transition-colors hover:border-[#E08A5E]"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2A4359] text-xs font-bold text-[#F4F6F8]">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                <span className="max-w-[140px] truncate font-medium">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-[#B4C2CF]" aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 border border-white/18 bg-[#121922] p-2 shadow-2xl"
                >
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-[#F4F6F8]">{user.name}</p>
                    <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-[#E08A5E]">
                      {user.role}
                    </p>
                  </div>
                  <Link
                    href={dashboardHref}
                    role="menuitem"
                    className="mt-1 flex items-center gap-2.5 px-3 py-2 text-sm text-[#D0DCE7] transition-colors hover:bg-white/6 hover:text-[#F4F6F8]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#8DB4D4]" aria-hidden="true" />
                    Dashboard
                  </Link>
                  <Link
                    href={`${dashboardHref}/profile`}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#D0DCE7] transition-colors hover:bg-white/6 hover:text-[#F4F6F8]"
                  >
                    <User className="h-4 w-4 text-[#8DB4D4]" aria-hidden="true" />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="mt-1 flex w-full cursor-pointer items-center gap-2.5 border-t border-white/10 px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/12"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#D0DCE7] transition-colors hover:text-[#F4F6F8]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-[#E08A5E] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/15 text-[#F4F6F8] md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/12 bg-[#0E141C] px-4 py-5 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" className="py-2 text-sm font-semibold text-[#F4F6F8]">
              Home
            </Link>
            <Link href="/services" className="py-2 text-sm font-semibold text-[#F4F6F8]">
              Browse Services
            </Link>
            {user ? (
              <>
                <Link href={dashboardHref} className="py-2 text-sm font-semibold text-[#E08A5E]">
                  Dashboard ({user.name})
                </Link>
                <Link href={`${dashboardHref}/profile`} className="py-2 text-sm text-[#B4C2CF]">
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 cursor-pointer border border-rose-400/35 px-4 py-2.5 text-left text-sm font-semibold text-rose-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  href="/sign-in"
                  className="border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-[#F4F6F8]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-[#E08A5E] px-4 py-2.5 text-center text-sm font-bold text-[#0B0F14]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
