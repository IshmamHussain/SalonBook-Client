import { Clock, Mail, MapPin, Phone, Scissors } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { SALON_INFO } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-white/12 bg-[#090C10] text-[#B4C2CF]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-[#F4F6F8]"
            >
              <span className="flex h-8 w-8 items-center justify-center border border-[#E08A5E]/50 bg-[#E08A5E]/15 text-[#E08A5E]">
                <Scissors className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                Salon<span className="text-[#E08A5E]">Book</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#B4C2CF]">{SALON_INFO.tagline}</p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="SalonBook on Instagram"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#B4C2CF] transition-colors hover:border-[#E08A5E] hover:text-[#E08A5E]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="SalonBook on Facebook"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#B4C2CF] transition-colors hover:border-[#E08A5E] hover:text-[#E08A5E]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="SalonBook on Pinterest"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#B4C2CF] transition-colors hover:border-[#E08A5E] hover:text-[#E08A5E]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 19.5 11.2 13m0 0a3.5 3.5 0 1 1 4.6-2.4c-.5 1.8-2 2.8-3.4 2.4" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#F4F6F8]">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-[#E08A5E]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition-colors hover:text-[#E08A5E]">
                  Browse Salon Services
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="transition-colors hover:text-[#E08A5E]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="transition-colors hover:text-[#E08A5E]">
                  Create Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#F4F6F8]">
              Contact Salon
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#E08A5E]" aria-hidden="true" />
                <span className="font-mono text-xs">{SALON_INFO.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#E08A5E]" aria-hidden="true" />
                <span>{SALON_INFO.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E08A5E]" aria-hidden="true" />
                <span>{SALON_INFO.address}</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#F4F6F8]">
              Opening Hours
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SALON_INFO.hours.map((entry) => (
                <li key={entry.days} className="flex items-center justify-between gap-2 border-b border-white/8 pb-2">
                  <span className="inline-flex items-center gap-2 text-[#D0DCE7]">
                    <Clock className="h-3.5 w-3.5 text-[#8DB4D4]" aria-hidden="true" />
                    {entry.days}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[#B4C2CF]">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#7F92A4] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} SalonBook Studio. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.12em]">
            Stripe-Verified Payments · Conflict-Free Scheduling
          </p>
        </div>
      </div>
    </footer>
  );
}
