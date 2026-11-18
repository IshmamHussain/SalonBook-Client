'use client';

import { CheckCircle2, Eye, X, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiRequest } from '@/lib/api';
import type { Appointment } from '@/types';

export default function AdminManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    appointment: Appointment;
    nextStatus: 'confirmed' | 'cancelled';
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await apiRequest<{ success: boolean; appointments: Appointment[] }>(
        `/api/admin/appointments${qs}`,
        { auth: true }
      );
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load appointment requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleConfirmStatusAction() {
    if (!actionTarget) return;
    const { appointment, nextStatus } = actionTarget;
    const previous = appointments;

    // Optimistic update with rollback on error
    setAppointments((curr) =>
      curr.map((a) => (a.id === appointment.id ? { ...a, status: nextStatus } : a))
    );
    setProcessing(true);

    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/admin/appointments/${appointment.id}/status`,
        {
          method: 'PATCH',
          auth: true,
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      toast.success(res.message || `Appointment marked as ${nextStatus}.`);
      setActionTarget(null);
    } catch (err) {
      setAppointments(previous);
      toast.error(err instanceof Error ? err.message : 'Could not update appointment status.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8]">
            Manage Appointments
          </h1>
          <p className="mt-1.5 text-sm text-[#B4C2CF]">
            Confirm pending requests to unlock customer Stripe checkout, or cancel pending and confirmed bookings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter appointments by status">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`cursor-pointer border px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                statusFilter === tab
                  ? 'border-[#E08A5E] bg-[#E08A5E] font-semibold text-[#0B0F14]'
                  : 'border-white/15 bg-[#121922] text-[#B4C2CF] hover:border-white/35 hover:text-[#F4F6F8]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading appointment requests..." />
      ) : error ? (
        <div className="atelier-surface p-8 text-center text-sm text-rose-300">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="atelier-surface p-12 text-center">
          <p className="font-display text-xl font-bold text-[#F4F6F8]">No appointments in this view</p>
          <p className="mt-2 text-sm text-[#B4C2CF]">Customer booking requests will appear here automatically.</p>
        </div>
      ) : (
        <div className="atelier-surface overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/12 bg-[#121922] font-mono text-[11px] uppercase tracking-[0.14em] text-[#8DB4D4]">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Schedule</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Requested</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {appointments.map((appt) => {
                const canConfirm = appt.status === 'pending';
                const canCancel = appt.status === 'pending' || appt.status === 'confirmed';

                return (
                  <tr key={appt.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#F4F6F8]">{appt.customerName}</p>
                      <p className="text-xs text-[#7F92A4]">{appt.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#F4F6F8]">{appt.serviceName}</p>
                      <p className="text-xs text-[#7F92A4]">{appt.serviceCategory}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs tabular-nums">
                      <div className="text-[#F4F6F8]">{appt.appointmentDate}</div>
                      <div className="text-[#8DB4D4]">{appt.timeSlot}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold tabular-nums text-[#E08A5E]">
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
                          onClick={() => setDetailsTarget(appt)}
                          className="inline-flex cursor-pointer items-center gap-1 border border-white/16 px-2.5 py-1.5 text-xs text-[#D0DCE7] hover:border-[#8DB4D4]"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Details
                        </button>

                        {canConfirm && (
                          <button
                            type="button"
                            onClick={() =>
                              setActionTarget({ appointment: appt, nextStatus: 'confirmed' })
                            }
                            className="inline-flex cursor-pointer items-center gap-1 bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Confirm
                          </button>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() =>
                              setActionTarget({ appointment: appt, nextStatus: 'cancelled' })
                            }
                            className="inline-flex cursor-pointer items-center gap-1 border border-rose-400/35 px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/15"
                          >
                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            Cancel
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

      {/* Appointment Details Modal */}
      {detailsTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Appointment full details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg border border-white/20 bg-[#121922] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#F4F6F8]">
                  {detailsTarget.serviceName}
                </h2>
                <p className="text-xs text-[#8DB4D4]">{detailsTarget.serviceCategory}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsTarget(null)}
                aria-label="Close modal"
                className="cursor-pointer p-1 text-[#B4C2CF] hover:text-[#F4F6F8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Customer</dt>
                <dd className="font-semibold text-[#F4F6F8]">{detailsTarget.customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Email</dt>
                <dd className="text-[#D0DCE7]">{detailsTarget.customerEmail}</dd>
              </div>
              {detailsTarget.customerPhone && (
                <div className="flex justify-between">
                  <dt className="text-[#7F92A4]">Phone</dt>
                  <dd className="font-mono text-xs">{detailsTarget.customerPhone}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Appointment Date &amp; Time</dt>
                <dd className="font-mono text-xs tabular-nums">
                  {detailsTarget.appointmentDate} · {detailsTarget.timeSlot}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Service Price</dt>
                <dd className="font-mono font-semibold text-[#E08A5E]">
                  ${Number(detailsTarget.servicePrice).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Appointment Status</dt>
                <dd>
                  <StatusBadge variant={detailsTarget.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Payment Status</dt>
                <dd>
                  <StatusBadge variant={detailsTarget.paymentStatus} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7F92A4]">Booking Request Date</dt>
                <dd className="font-mono text-xs">
                  {new Date(detailsTarget.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="border-t border-white/10 pt-3">
                <dt className="text-xs text-[#7F92A4]">Customer Message</dt>
                <dd className="mt-1 text-sm text-[#D0DCE7]">
                  {detailsTarget.message || 'No additional message provided.'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(actionTarget)}
        title={
          actionTarget?.nextStatus === 'confirmed'
            ? 'Confirm this appointment?'
            : 'Cancel this appointment?'
        }
        description={
          actionTarget
            ? actionTarget.nextStatus === 'confirmed'
              ? `Confirm ${actionTarget.appointment.customerName}'s request for ${actionTarget.appointment.serviceName} on ${actionTarget.appointment.appointmentDate} at ${actionTarget.appointment.timeSlot}? This unlocks Stripe payment for the customer.`
              : `Cancel ${actionTarget.appointment.customerName}'s appointment for ${actionTarget.appointment.serviceName} on ${actionTarget.appointment.appointmentDate}? The time slot will be released.`
            : ''
        }
        confirmLabel={actionTarget?.nextStatus === 'confirmed' ? 'Confirm Appointment' : 'Cancel Appointment'}
        cancelLabel="Go Back"
        tone={actionTarget?.nextStatus === 'cancelled' ? 'danger' : 'primary'}
        loading={processing}
        onConfirm={handleConfirmStatusAction}
        onCancel={() => setActionTarget(null)}
      />
    </div>
  );
}
