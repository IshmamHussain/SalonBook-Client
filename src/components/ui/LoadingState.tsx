'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

export function LoadingSpinner({ label = 'Loading SalonBook...' }: { label?: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin text-[#E08A5E]" aria-hidden="true" />
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#B4C2CF]">{label}</p>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading salon services">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="atelier-surface animate-pulse overflow-hidden">
          <div className="h-56 w-full bg-[#18222E]" />
          <div className="space-y-4 p-6">
            <div className="h-3 w-28 bg-white/10" />
            <div className="h-6 w-3/4 bg-white/15" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-white/10" />
              <div className="h-3.5 w-5/6 bg-white/10" />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="h-5 w-20 bg-white/15" />
              <div className="h-9 w-28 bg-white/15" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
