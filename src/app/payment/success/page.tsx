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
    if (authLoading) return;
    if (!user || !sessionId) {
      setChecking(false);
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
        // Retry briefly while Stripe webhook finalizes
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
    <section className="terrace-ground flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="maison-card w-full max-w-lg p-8 text-center sm:p-10">
        {checking ? (
          <div className="py-6">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#B5893D]" aria-hidden="true" />
            <h1 className="mt-5 font-display text-3xl font-semibold text-[#1E3A2F]">
              Confirming Your Payment
            </h1>
            <p className="mt-3 text-sm text-[#495A52]">
              Waiting for verified Stripe webhook confirmation to finalize your transaction record...
            </p>
          </div>
        ) : verified && transaction ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#B5893D] bg-[#1E3A2F] text-[#E8CF9C]">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold text-[#1E3A2F]">
              Payment Confirmed
            </h1>
            <p className="mt-2 text-sm text-[#495A52]">
              Your appointment payment has been verified via Stripe webhook and recorded.
            </p>

            <dl className="mt-6 space-y-3 border-y border-[#E2D9C8] py-5 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#6D7B74]">Service</dt>
                <dd className="font-semibold text-[#16261F]">{transaction.serviceName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6D7B74]">Appointment</dt>
                <dd className="font-mono text-xs tabular-nums text-[#16261F]">
                  {transaction.appointmentDate} · {transaction.timeSlot}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6D7B74]">Amount Paid</dt>
                <dd className="font-mono text-base font-semibold tabular-nums text-[#1E3A2F]">
                  ${Number(transaction.amount).toFixed(2)} {transaction.currency}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6D7B74]">Stripe Reference</dt>
                <dd className="max-w-[200px] truncate font-mono text-xs text-[#495A52]">
                  {transaction.stripeSessionId}
                </dd>
              </div>
            </dl>

            <Link
              href="/dashboard/customer/appointments"
              className="btn-emerald mt-7 inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              View My Appointments
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#B5893D] bg-[#F4EFE6] text-[#1E3A2F]">
              <Clock className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold text-[#1E3A2F]">
              Stripe Checkout Completed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#495A52]">
              Your payment was submitted to Stripe. Your appointment status will update to Paid automatically once the verified Stripe webhook arrives.
            </p>
            <Link
              href="/dashboard/customer/appointments"
              className="btn-emerald mt-7 inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]"
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
