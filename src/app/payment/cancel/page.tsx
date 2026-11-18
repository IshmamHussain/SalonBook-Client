import { ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function PaymentCancelPage() {
  return (
    <section className="portal-grain flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="atelier-surface w-full max-w-lg p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-amber-400/40 bg-amber-400/12 text-amber-300">
          <XCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-[#F4F6F8]">
          Payment Cancelled
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#B4C2CF]">
          No charge was processed. Your confirmed appointment remains unpaid in your dashboard, and you can retry Stripe Checkout whenever you are ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/customer/appointments"
            className="inline-flex items-center gap-2 bg-[#E08A5E] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to My Appointments
          </Link>
          <Link
            href="/services"
            className="border border-white/20 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4F6F8] hover:border-[#E08A5E]"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  );
}
