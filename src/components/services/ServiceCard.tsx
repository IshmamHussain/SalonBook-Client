'use client';

import { ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import type { SalonService } from '@/types';

export function ServiceCard({ service }: { service: SalonService }) {
  return (
    <article className="maison-card maison-card-hover group flex h-full flex-col overflow-hidden p-3">
      <div className="relative h-60 w-full overflow-hidden border border-[#E2D9C8] bg-[#EAE2D3]">
        {service.image ? (
          <img
            src={service.image}
            alt={service.serviceName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#EAE2D3] font-mono text-xs uppercase tracking-[0.14em] text-[#495A52]">
            SalonBook Maison
          </div>
        )}
        <span className="absolute left-3 top-3 border border-[#B5893D]/60 bg-[#FBF9F5]/92 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#1E3A2F] backdrop-blur-xs">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-5">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug text-[#1E3A2F] transition-colors group-hover:text-[#986F2A]">
            {service.serviceName}
          </h3>
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#495A52]">
            {service.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#E2D9C8] pt-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-semibold tabular-nums text-[#1E3A2F]">
              ${Number(service.price).toFixed(0)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-[#495A52]">
              <Clock className="h-3.5 w-3.5 text-[#B5893D]" aria-hidden="true" />
              {service.duration} min
            </span>
          </div>

          <Link
            href={`/services/${service.id}`}
            className="btn-emerald inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
