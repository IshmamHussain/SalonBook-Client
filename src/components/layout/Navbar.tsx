'use client';

import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
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
    `text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
      active ? 'text-[#B5893D]' : 'text-[#1E3A2F] hover:text-[#B5893D]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#D5C9B4] bg-[#F4EFE6]/95 backdrop-blur-md">
      <div className="mx-auto grid h-20 max-w-[1440px] grid-cols-2 items-center px-4 sm:px-6 md:grid-cols-3 lg:px-10">
        {/* Left Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          <Link href="/" className={navLinkClass(pathname === '/')}>
            Home
          </Link>
          <Link href="/services" className={navLinkClass(pathname.startsWith('/services'))}>
            Browse Services
          </Link>
        </nav>

        {/* Centered Engraved Maison Wordmark */}
        <div className="flex items-center md:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-2xl font-bold tracking-[0.06em] text-[#1E3A2F] sm:text-[1.75rem]"
          >
            <svg
              className="h-5 w-5 text-[#B5893D]"
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
        </div>

        {/* Right Auth / Profile Dropdown */}
        <div className="hidden items-center justify-end gap-5 md:flex">
          {loading ? (
            <div className="h-10 w-36 animate-pulse border border-[#D5C9B4] bg-[#EAE2D3]" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className="flex cursor-pointer items-center gap-2.5 border border-[#B5893D]/60 bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#16261F] transition-colors hover:border-[#1E3A2F]"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-7 w-7 rounded-full border border-[#B5893D]/50 object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E3A2F] font-display text-xs font-bold text-[#F4EFE6]">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                <span className="max-w-[140px] truncate font-medium">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-[#495A52]" aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="maison-card absolute right-0 mt-2 w-56 p-2 shadow-xl"
                >
                  <div className="border-b border-[#E2D9C8] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-[#16261F]">{user.name}</p>
                  </div>
                  <Link
                    href={dashboardHref}
                    role="menuitem"
                    className="mt-1 flex items-center gap-2.5 px-3 py-2 text-sm text-[#16261F] transition-colors hover:bg-[#F4EFE6]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#1E3A2F]" aria-hidden="true" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="mt-1 flex w-full cursor-pointer items-center gap-2.5 border-t border-[#E2D9C8] px-3 py-2 text-left text-sm text-rose-800 transition-colors hover:bg-rose-50"
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
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1E3A2F] transition-colors hover:text-[#B5893D]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="btn-emerald px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex justify-end md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-[#B5893D]/60 bg-[#FBF9F5] text-[#1E3A2F]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#D5C9B4] bg-[#FBF9F5] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" className="py-2 text-sm font-semibold text-[#1E3A2F]">
              Home
            </Link>
            <Link href="/services" className="py-2 text-sm font-semibold text-[#1E3A2F]">
              Browse Services
            </Link>
            {user ? (
              <>
                <p className="border-t border-[#E2D9C8] pt-3 text-sm font-semibold text-[#16261F]">
                  {user.name}
                </p>
                <Link href={dashboardHref} className="py-1.5 text-sm font-semibold text-[#B5893D]">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 cursor-pointer border border-rose-800/35 px-4 py-2.5 text-left text-sm font-semibold text-rose-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  href="/sign-in"
                  className="btn-limestone px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-emerald px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em]"
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
