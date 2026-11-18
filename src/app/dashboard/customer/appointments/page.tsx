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

    // Optimistic update with rollback on error
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
      <div className="atelier-surface p-8 text-center">
        <p className="text-sm text-rose-300">{error}</p>
        <button
          type="button"
          onClick={loadAppointments}
          className="mt-4 cursor-pointer bg-[#E08A5E] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#0B0F14]"
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
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8]">
            My Appointments
          </h1>
          <p className="mt-1.5 text-sm text-[#B4C2CF]">
            Cancel pending requests anytime, or click Pay Now once the salon administrator confirms your booking.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex w-fit items-center bg-[#E08A5E] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
        >
          Book Another Service
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="atelier-surface p-12 text-center">
          <h2 className="font-display text-xl font-bold text-[#F4F6F8]">No appointments yet</h2>
          <p className="mt-2 text-sm text-[#B4C2CF]">
            Explore our active salon services and submit your first booking request.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-block border border-[#E08A5E] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#E08A5E] hover:bg-[#E08A5E] hover:text-[#0B0F14]"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="atelier-surface overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/12 bg-[#121922] font-mono text-[11px] uppercase tracking-[0.14em] text-[#8DB4D4]">
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Date &amp; Time</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Appointment</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Requested</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {appointments.map((appt) => {
                const canCancel = appt.status === 'pending';
                const canPay = appt.status === 'confirmed' && appt.paymentStatus === 'unpaid';

                return (
                  <tr key={appt.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {appt.serviceImage ? (
                          <img
                            src={appt.serviceImage}
                            alt={appt.serviceName}
                            className="h-11 w-11 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="h-11 w-11 shrink-0 bg-[#18222E]" />
                        )}
                        <div>
                          <p className="font-semibold text-[#F4F6F8]">{appt.serviceName}</p>
                          <p className="text-xs text-[#7F92A4]">{appt.serviceCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#D0DCE7]">
                      <div>{appt.appointmentDate}</div>
                      <div className="text-[#8DB4D4]">{appt.timeSlot}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm font-semibold tabular-nums text-[#E08A5E]">
                      ${Number(appt.servicePrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge variant={appt.status} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge variant={appt.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#7F92A4]">
                      {new Date(appt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDetails(appt)}
                          className="inline-flex cursor-pointer items-center gap-1 border border-white/16 px-2.5 py-1.5 text-xs text-[#D0DCE7] transition-colors hover:border-[#8DB4D4] hover:text-[#F4F6F8]"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Details
                        </button>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(appt)}
                            className="inline-flex cursor-pointer items-center gap-1 border border-rose-400/35 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/15"
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
                            className="inline-flex cursor-pointer items-center gap-1.5 bg-[#E08A5E] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#0B0F14] transition-colors hover:bg-[#F0A076] disabled:opacity-60"
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

      {/* Details Modal */}
      {selectedDetails && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Appointment details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg border border-white/20 bg-[#121922] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#F4F6F8]">
                  {selectedDetails.serviceName}
                </h2>
                <p className="text-xs text-[#8DB4D4]">{selectedDetails.serviceCategory}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetails(null)}
                aria-label="Close appointment details"
                className="cursor-pointer p-1 text-[#B4C2CF] hover:text-[#F4F6F8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Appointment Date</dt>
                <dd className="font-mono text-xs tabular-nums">{selectedDetails.appointmentDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Time Slot</dt>
                <dd className="font-mono text-xs tabular-nums">{selectedDetails.timeSlot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Service Price</dt>
                <dd className="font-mono font-semibold text-[#E08A5E]">
                  ${Number(selectedDetails.servicePrice).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Appointment Status</dt>
                <dd>
                  <StatusBadge variant={selectedDetails.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Payment Status</dt>
                <dd>
                  <StatusBadge variant={selectedDetails.paymentStatus} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Request Submitted</dt>
                <dd className="font-mono text-xs tabular-nums">
                  {new Date(selectedDetails.createdAt).toLocaleString()}
                </dd>
              </div>
              {selectedDetails.message && (
                <div className="border-t border-white/10 pt-3">
                  <dt className="text-xs text-[#7F92A4]">Your Message</dt>
                  <dd className="mt-1 text-sm text-[#D0DCE7]">{selectedDetails.message}</dd>
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
