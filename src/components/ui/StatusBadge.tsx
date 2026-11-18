'use client';

import React from 'react';

type BadgeVariant =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'paid'
  | 'unpaid'
  | 'failed'
  | 'active'
  | 'inactive'
  | 'blocked';

const STYLES: Record<BadgeVariant, string> = {
  pending: 'border-amber-700/35 bg-amber-100/80 text-amber-900',
  confirmed: 'border-emerald-800/35 bg-emerald-100/80 text-emerald-950',
  cancelled: 'border-rose-800/35 bg-rose-100/80 text-rose-900',
  paid: 'border-teal-800/35 bg-teal-100/85 text-teal-950',
  unpaid: 'border-[#B5A992] bg-[#EAE2D3] text-[#3F4E46]',
  failed: 'border-rose-800/35 bg-rose-100/80 text-rose-900',
  active: 'border-emerald-800/35 bg-emerald-100/80 text-emerald-950',
  inactive: 'border-[#B5A992] bg-[#EAE2D3] text-[#3F4E46]',
  blocked: 'border-rose-800/45 bg-rose-100 text-rose-900',
};

const LABELS: Record<BadgeVariant, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  paid: 'Paid',
  unpaid: 'Unpaid',
  failed: 'Failed',
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
};

export function StatusBadge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] ${STYLES[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {LABELS[variant]}
    </span>
  );
}
