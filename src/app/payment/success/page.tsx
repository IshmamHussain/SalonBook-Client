'use client';

import { ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

interface VerifiedTransaction {
  id: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
}

function PaymentSuccessContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [transaction, setTransaction] = useState<VerifiedTransaction | null>(null);

  useEffect(() => {
    if (authLoading || !user || !sessionId) {
      if (!authLoading && !sessionId) setChecking(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function checkWebhookStatus() {
      try {
        const res = await apiRequest<{
          success: boolean;
          verified: boolean;
          transaction?: VerifiedTransaction;
        }>(`/api/payments/session/${encodeURIComponent(sessionId!)}`, { auth: true });

        if (cancelled) return;
        if (res.verified && res.transaction) {
          setVerified(true);
          setTransaction(res.transaction);
          setChecking(false);
          return;
        }
      } catch {
        // Keep polling briefly while Stripe webhook finalizes
      }

      attempts += 1;
      if (attempts < 6 && !cancelled) {
        setTimeout(checkWebhookStatus, 1800);
      } else if (!cancelled) {
        setChecking(false);
      }
    }

    checkWebhookStatus();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, sessionId]);

  return (
    <section className="portal-grain flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="atelier-surface w-full max-w-lg p-8 text-center sm:p-10">
        {checking ? (
          <div className="py-6">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#E08A5E]" aria-hidden="true" />
            <h1 className="mt-5 font-display text-3xl font-extrabold text-[#F4F6F8]">
              Confirming your payment
            </h1>
            <p className="mt-3 text-sm text-[#B4C2CF]">
              Waiting for verified Stripe webhook confirmation to finalize your transaction record...
            </p>
          </div>
        ) : verified && transaction ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-emerald-400/40 bg-emerald-400/15 text-emerald-300">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-[#F4F6F8]">
              Payment Confirmed
            </h1>
            <p className="mt-2 text-sm text-[#B4C2CF]">
              Your appointment payment has been verified via Stripe webhook and recorded cleanly.
            </p>

            <dl className="mt-6 space-y-3 border-y border-white/12 py-5 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#7F92A4]">Service</dt>
                <dd className="font-semibold text-[#F4F6F8]">{transaction.serviceName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#7F92A4]">Appointment</dt>
                <dd className="font-mono text-xs tabular-nums text-[#F4F6F8]">
                  {transaction.appointmentDate} · {transaction.timeSlot}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#7F92A4]">Amount Paid</dt>
                <dd className="font-mono text-base font-semibold tabular-nums text-[#E08A5E]">
                  ${Number(transaction.amount).toFixed(2)} {transaction.currency}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#7F92A4]">Stripe Reference</dt>
                <dd className="max-w-[200px] truncate font-mono text-xs text-[#8DB4D4]">
                  {transaction.stripeSessionId}
                </dd>
              </div>
            </dl>

            <Link
              href="/dashboard/customer/appointments"
              className="mt-7 inline-flex items-center gap-2 bg-[#E08A5E] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
            >
              View My Appointments
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#8DB4D4]/40 bg-[#8DB4D4]/15 text-[#8DB4D4]">
              <Clock className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-[#F4F6F8]">
              Stripe Checkout Completed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#B4C2CF]">
              Your payment was submitted to Stripe. Your appointment status will update to Paid automatically the moment the verified Stripe webhook arrives.
            </p>
            <Link
              href="/dashboard/customer/appointments"
              className="mt-7 inline-flex items-center gap-2 bg-[#E08A5E] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
            >
              Go to My Appointments
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Verifying payment..." />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
