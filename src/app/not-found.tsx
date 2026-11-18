import { ArrowLeft, Compass } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <section className="terrace-ground flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="maison-card max-w-xl p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#B5893D] bg-[#1E3A2F] text-[#E8CF9C]">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-[#1E3A2F]">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#495A52]">
          The SalonBook path you requested does not exist or may have moved. Return to the main terrace or browse active salon services.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="btn-emerald inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return Home
          </Link>
          <Link
            href="/services"
            className="btn-limestone px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  );
}
