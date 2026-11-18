import { ArrowLeft, Compass } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-[#E08A5E]/40 bg-[#E08A5E]/12 text-[#E08A5E]">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-[#F4F6F8]">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[#B4C2CF]">
        The SalonBook route you requested does not exist or may have moved. Browse active salon services or return to the studio portal.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#E08A5E] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return Home
        </Link>
        <Link
          href="/services"
          className="border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#F4F6F8] transition-colors hover:border-[#E08A5E]"
        >
          Browse Services
        </Link>
      </div>
    </section>
  );
}
