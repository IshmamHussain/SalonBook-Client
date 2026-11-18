'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="terrace-ground flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="maison-card max-w-xl p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-rose-800/40 bg-rose-100 text-rose-900">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-[#16261F]">
          Something Interrupted This View
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#495A52]">
          {error?.message || 'An unexpected error occurred while loading this SalonBook screen.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-emerald mt-8 inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    </section>
  );
}
