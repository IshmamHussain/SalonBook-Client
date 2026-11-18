'use client';

import { ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import type { SalonService } from '@/types';

export function ServiceCard({ service }: { service: SalonService }) {
  return (
    <article className="atelier-surface atelier-surface-hover group flex h-full flex-col overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden bg-[#0E141C]">
        {service.image ? (
          <img
            src={service.image}
            alt={service.serviceName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#18222E] font-mono text-xs text-[#7F92A4]">
            SALONBOOK STUDIO
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(11,15,20,0.06) 0%, rgba(11,15,20,0.68) 100%)',
          }}
        />
        <span className="absolute left-4 top-4 border border-white/20 bg-[#0B0F14]/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#F4F6F8] backdrop-blur-sm">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="font-display text-xl font-bold leading-snug text-[#F4F6F8] transition-colors group-hover:text-[#F0A076]">
            {service.serviceName}
          </h3>
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#B4C2CF]">
            {service.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-medium tabular-nums text-[#E08A5E]">
              ${Number(service.price).toFixed(0)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-[#B4C2CF]">
              <Clock className="h-3.5 w-3.5 text-[#8DB4D4]" aria-hidden="true" />
              {service.duration} min
            </span>
          </div>

          <Link
            href={`/services/${service.id}`}
            className="inline-flex cursor-pointer items-center gap-1.5 border border-white/18 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#F4F6F8] transition-colors hover:border-[#E08A5E] hover:bg-[#E08A5E] hover:text-[#0B0F14]"
          >
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
