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
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-rose-400/40 bg-rose-500/12 text-rose-300">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[#F4F6F8]">
        Something interrupted this view
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#B4C2CF]">
        {error?.message || 'An unexpected error occurred while loading this SalonBook screen.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex cursor-pointer items-center gap-2 bg-[#E08A5E] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try Again
      </button>
    </section>
  );
}
