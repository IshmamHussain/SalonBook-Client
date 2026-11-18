'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

export function LoadingSpinner({ label = 'Preparing your salon view...' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[260px] flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-7 w-7 animate-spin text-[#B5893D]" aria-hidden="true" />
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#495A52]">{label}</p>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading salon services">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="maison-card animate-pulse overflow-hidden p-3">
          <div className="h-56 w-full bg-[#E8DFCE]" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-28 bg-[#DFD4C0]" />
            <div className="h-6 w-3/4 bg-[#D8CBB4]" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-[#E8DFCE]" />
              <div className="h-3.5 w-5/6 bg-[#E8DFCE]" />
            </div>
            <div className="flex items-center justify-between border-t border-[#E2D9C8] pt-4">
              <div className="h-5 w-20 bg-[#D8CBB4]" />
              <div className="h-9 w-28 bg-[#D8CBB4]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
