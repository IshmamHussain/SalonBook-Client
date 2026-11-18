'use client';

import { CreditCard, Eye, Loader2, X, XCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiRequest } from '@/lib/api';
import type { Appointment } from '@/types';

export default function CustomerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDetails, setSelectedDetails] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ success: boolean; appointments: Appointment[] }>(
        '/api/appointments/my',
        { auth: true }
      );
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    const previous = appointments;
    const targetId = cancelTarget.id;

    setAppointments((curr) =>
      curr.map((a) => (a.id === targetId ? { ...a, status: 'cancelled' } : a))
    );
    setCancelling(true);

    try {
      await apiRequest(`/api/appointments/${targetId}/cancel`, {
        method: 'PATCH',
        auth: true,
      });
      toast.success('Pending appointment cancelled.');
      setCancelTarget(null);
    } catch (err) {
      setAppointments(previous);
      toast.error(err instanceof Error ? err.message : 'Could not cancel appointment.');
    } finally {
      setCancelling(false);
    }
  }

  async function handlePayNow(appointment: Appointment) {
    setPayingId(appointment.id);
    try {
      const res = await apiRequest<{ success: boolean; url: string }>(
        '/api/payments/create-checkout-session',
        {
          method: 'POST',
          auth: true,
          body: JSON.stringify({ appointmentId: appointment.id }),
        }
      );
      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error('Stripe checkout URL was not returned.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to launch Stripe Checkout.');
      setPayingId(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading your appointments..." />;

  if (error) {
    return (
      <div className="maison-card p-8 text-center">
        <p className="text-sm text-rose-800">{error}</p>
        <button
          type="button"
          onClick={loadAppointments}
          className="btn-emerald mt-4 cursor-pointer px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
            My Appointments
          </h1>
          <p className="mt-1.5 text-sm text-[#495A52]">
            Cancel pending requests anytime, or click Pay Now once the salon administrator confirms your booking.
          </p>
        </div>
        <Link
          href="/services"
          className="btn-emerald inline-flex w-fit items-center px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Book Another Service
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="maison-card p-12 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1E3A2F]">No appointments yet</h2>
          <p className="mt-2 text-sm text-[#495A52]">
            Explore our active salon services and submit your first booking request.
          </p>
          <Link
            href="/services"
            className="btn-limestone mt-6 inline-block px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em]"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="maison-card overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#D5C9B4] bg-[#EBE4D6] font-mono text-[11px] uppercase tracking-[0.14em] text-[#1E3A2F]">
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Date &amp; Time</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Appointment</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Requested</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C8]">
              {appointments.map((appt) => {
                const canCancel = appt.status === 'pending';
                const canPay = appt.status === 'confirmed' && appt.paymentStatus === 'unpaid';

                return (
                  <tr key={appt.id} className="transition-colors hover:bg-[#F4EFE6]/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {appt.serviceImage ? (
                          <img
                            src={appt.serviceImage}
                            alt={appt.serviceName}
                            className="h-11 w-11 shrink-0 border border-[#D5C9B4] object-cover"
                          />
                        ) : (
                          <div className="h-11 w-11 shrink-0 bg-[#EAE2D3]" />
                        )}
                        <div>
                          <p className="font-semibold text-[#16261F]">{appt.serviceName}</p>
                          <p className="text-xs text-[#6D7B74]">{appt.serviceCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#16261F]">
                      <div>{appt.appointmentDate}</div>
                      <div className="text-[#495A52]">{appt.timeSlot}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm font-semibold tabular-nums text-[#1E3A2F]">
                      ${Number(appt.servicePrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge variant={appt.status} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge variant={appt.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#6D7B74]">
                      {new Date(appt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDetails(appt)}
                          className="inline-flex cursor-pointer items-center gap-1 border border-[#C9BFA9] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#16261F] transition-colors hover:border-[#1E3A2F]"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Details
                        </button>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(appt)}
                            className="inline-flex cursor-pointer items-center gap-1 border border-rose-800/35 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-900 transition-colors hover:bg-rose-100"
                          >
                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            Cancel
                          </button>
                        )}

                        {canPay && (
                          <button
                            type="button"
                            disabled={payingId === appt.id}
                            onClick={() => handlePayNow(appt)}
                            className="btn-emerald inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] disabled:opacity-60"
                          >
                            {payingId === appt.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Redirecting...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                                Pay Now
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedDetails && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Appointment details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16261F]/65 p-4 backdrop-blur-xs"
        >
          <div className="maison-card w-full max-w-lg p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2D9C8] pb-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#1E3A2F]">
                  {selectedDetails.serviceName}
                </h2>
                <p className="text-xs text-[#6D7B74]">{selectedDetails.serviceCategory}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetails(null)}
                aria-label="Close appointment details"
                className="cursor-pointer p-1 text-[#495A52] hover:text-[#16261F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Appointment Date</dt>
                <dd className="font-mono text-xs tabular-nums">{selectedDetails.appointmentDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Time Slot</dt>
                <dd className="font-mono text-xs tabular-nums">{selectedDetails.timeSlot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Service Price</dt>
                <dd className="font-mono font-semibold text-[#1E3A2F]">
                  ${Number(selectedDetails.servicePrice).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Appointment Status</dt>
                <dd>
                  <StatusBadge variant={selectedDetails.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Payment Status</dt>
                <dd>
                  <StatusBadge variant={selectedDetails.paymentStatus} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Request Submitted</dt>
                <dd className="font-mono text-xs tabular-nums">
                  {new Date(selectedDetails.createdAt).toLocaleString()}
                </dd>
              </div>
              {selectedDetails.message && (
                <div className="border-t border-[#E2D9C8] pt-3">
                  <dt className="text-xs text-[#6D7B74]">Your Message</dt>
                  <dd className="mt-1 text-sm text-[#16261F]">{selectedDetails.message}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel pending appointment?"
        description={
          cancelTarget
            ? `Are you sure you want to cancel your pending booking for ${cancelTarget.serviceName} on ${cancelTarget.appointmentDate} at ${cancelTarget.timeSlot}?`
            : ''
        }
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Request"
        tone="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
