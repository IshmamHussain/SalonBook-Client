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
  pending: 'border-amber-400/40 bg-amber-400/12 text-amber-200',
  confirmed: 'border-emerald-400/40 bg-emerald-400/12 text-emerald-200',
  cancelled: 'border-rose-400/40 bg-rose-400/12 text-rose-200',
  paid: 'border-teal-300/45 bg-teal-400/15 text-teal-200',
  unpaid: 'border-slate-400/35 bg-slate-400/10 text-[#B4C2CF]',
  failed: 'border-rose-400/40 bg-rose-400/12 text-rose-200',
  active: 'border-emerald-400/40 bg-emerald-400/12 text-emerald-200',
  inactive: 'border-slate-400/35 bg-slate-400/10 text-[#B4C2CF]',
  blocked: 'border-rose-400/45 bg-rose-500/15 text-rose-200',
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
