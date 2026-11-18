'use client';

import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { ApiError, apiRequest } from '@/lib/api';
import { PREDEFINED_TIME_SLOTS } from '@/lib/constants';
import type { SalonService } from '@/types';

function formatLocalDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getTodayDateString() {
  return formatLocalDate(new Date());
}

function parseSlotMinutes(slot: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot.trim());
  if (!match) return 0;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function isSlotInPast(dateStr: string, slot: string): boolean {
  const now = new Date();
  const todayStr = formatLocalDate(now);
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return parseSlotMinutes(slot) <= nowMinutes;
}

function getDefaultAppointmentDate(): string {
  const todayStr = getTodayDateString();
  const hasUpcomingToday = PREDEFINED_TIME_SLOTS.some((slot) => !isSlotInPast(todayStr, slot));
  if (hasUpcomingToday) return todayStr;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatLocalDate(tomorrow);
}

export function ServiceDetailsClient({ serviceId }: { serviceId: string }) {
  const { user, loading: authLoading, blockedMessage } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<SalonService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(getDefaultAppointmentDate);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [message, setMessage] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(`/services/${serviceId}`)}`);
    }
  }, [authLoading, user, router, serviceId]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.isBlocked) {
      setLoading(false);
      return;
    }
    let active = true;

    async function loadService() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ success: boolean; service: SalonService }>(
          `/api/services/${encodeURIComponent(serviceId)}`,
          { auth: true }
        );
        if (!active) return;
        setService(res.service);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace(`/sign-in?callbackUrl=${encodeURIComponent(`/services/${serviceId}`)}`);
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load salon service details.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadService();
    return () => {
      active = false;
    };
  }, [authLoading, user, serviceId, router]);

  useEffect(() => {
    if (!user || user.isBlocked || user.role === 'admin' || !service || service.status !== 'active' || !appointmentDate) {
      return;
    }
    let active = true;

    async function loadBookedSlots() {
      setLoadingSlots(true);
      try {
        const res = await apiRequest<{ success: boolean; bookedSlots: string[] }>(
          `/api/appointments/booked-slots?date=${encodeURIComponent(appointmentDate)}`,
          { auth: true }
        );
        if (!active) return;
        const taken = res.bookedSlots || [];
        setBookedSlots(taken);
        setTimeSlot((prev) =>
          !prev || taken.includes(prev) || isSlotInPast(appointmentDate, prev) ? '' : prev
        );
      } catch {
        if (active) setBookedSlots([]);
      } finally {
        if (active) setLoadingSlots(false);
      }
    }

    loadBookedSlots();
    return () => {
      active = false;
    };
  }, [appointmentDate, user, service]);

  async function handleSubmitAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!service) return;
    if (!appointmentDate) {
      toast.error('Please choose an appointment date.');
      return;
    }
    if (!timeSlot) {
      toast.error('Please select an available time slot.');
      return;
    }
    if (isSlotInPast(appointmentDate, timeSlot)) {
      toast.error('That time slot has already passed. Please choose an upcoming slot.');
      setTimeSlot('');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/api/appointments', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          serviceId: service.id,
          appointmentDate,
          timeSlot,
          message: message.trim(),
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        }),
      });
      toast.success(res.message || 'Appointment request submitted! Awaiting salon confirmation.');
      router.push('/dashboard/customer/appointments');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create appointment request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || (!user && !error)) {
    return <LoadingSpinner label="Verifying salon session..." />;
  }

  if (user?.isBlocked) {
    return (
      <section className="terrace-ground mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="maison-card p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rose-800/35 bg-rose-100 text-rose-900">
            <Ban className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-[#1E3A2F]">
            Account Blocked
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#495A52]">
            {blockedMessage ||
              'Your account has been blocked by the salon administrator. You cannot view protected service details or submit appointment requests.'}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/services"
              className="btn-emerald inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Browse Services
            </Link>
            <Link
              href="/"
              className="btn-limestone inline-flex items-center px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return <LoadingSpinner label="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <section className="terrace-ground mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="maison-card p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rose-800/35 bg-rose-100 text-rose-900">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-[#1E3A2F]">
            Service Unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#495A52]">
            {error || 'The requested salon service ID is invalid or no longer active.'}
          </p>
          <Link
            href="/services"
            className="btn-emerald mt-7 inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Browse Services
          </Link>
        </div>
      </section>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isActiveService = service.status === 'active';

  return (
    <div className="terrace-ground min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#495A52] transition-colors hover:text-[#1E3A2F]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Browse Services
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Framed Visual Plate */}
          <div className="lg:col-span-6">
            <div className="maison-card overflow-hidden p-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#E2D9C8] bg-[#EAE2D3]">
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 border border-[#B5893D]/60 bg-[#FBF9F5]/92 px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#1E3A2F]">
                  {service.category}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 divide-x divide-[#E2D9C8] border border-[#E2D9C8] bg-[#F4EFE6]">
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6D7B74]">Price</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1E3A2F]">
                    ${Number(service.price).toFixed(2)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6D7B74]">Duration</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xl tabular-nums text-[#16261F]">
                    <Clock className="h-4 w-4 text-[#B5893D]" aria-hidden="true" />
                    {service.duration}m
                  </p>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6D7B74]">Status</p>
                  <div className="mt-1.5">
                    <StatusBadge variant={service.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Info & Booking Form */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#1E3A2F] sm:text-5xl">
                {service.serviceName}
              </h1>

              <p className="mt-5 text-base leading-relaxed text-[#495A52]">{service.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-3 border-y border-[#D5C9B4] py-5 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm text-[#16261F]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1E3A2F]" aria-hidden="true" />
                  <span>No upfront charge before confirmation</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#16261F]">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#B5893D]" aria-hidden="true" />
                  <span>Stripe Checkout unlocks once confirmed</span>
                </div>
              </div>

              <div className="mt-8">
                {isAdmin ? (
                  <div className="flex items-start gap-3 border border-amber-700/35 bg-amber-50 p-5 text-sm text-amber-950">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Administrator Account Active</p>
                      <p className="mt-1 text-amber-900">
                        Admins manage salon services and review bookings from the Admin Dashboard and cannot submit customer appointment requests.
                      </p>
                      <Link
                        href="/dashboard/admin/services"
                        className="mt-3 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#1E3A2F] underline"
                      >
                        Manage Services in Admin Dashboard &rarr;
                      </Link>
                    </div>
                  </div>
                ) : !isActiveService ? (
                  <div className="border border-rose-800/35 bg-rose-50 p-5 text-sm text-rose-900">
                    This service is currently inactive and unavailable for appointment booking.
                  </div>
                ) : !showBookingForm ? (
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(true)}
                    className="btn-emerald inline-flex w-full cursor-pointer items-center justify-center gap-2.5 px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] sm:w-auto"
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Request Appointment
                  </button>
                ) : (
                  <form onSubmit={handleSubmitAppointment} className="maison-card space-y-6 p-6">
                    <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-4">
                      <h2 className="font-display text-xl font-semibold text-[#1E3A2F]">
                        Request Appointment Slot
                      </h2>
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#B5893D]">
                        Pending Approval
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="appointment-date"
                        className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]"
                      >
                        Appointment Date
                      </label>
                      <input
                        id="appointment-date"
                        type="date"
                        required
                        min={getTodayDateString()}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] focus:border-[#1E3A2F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
                          Available Time Slot
                        </span>
                        {loadingSlots && (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1E3A2F]">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            Checking slots...
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {PREDEFINED_TIME_SLOTS.map((slot) => {
                          const isTaken = bookedSlots.includes(slot);
                          const isPast = isSlotInPast(appointmentDate, slot);
                          const isUnavailable = isTaken || isPast;
                          const isSelected = timeSlot === slot && !isUnavailable;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isUnavailable}
                              title={
                                isTaken
                                  ? 'Already booked'
                                  : isPast
                                  ? 'Time slot has already passed'
                                  : `Select ${slot}`
                              }
                              onClick={() => setTimeSlot(slot)}
                              aria-pressed={isSelected}
                              className={`border px-3 py-2.5 font-mono text-xs tabular-nums transition-colors ${
                                isUnavailable
                                  ? 'cursor-not-allowed border-[#DCD3C2] bg-[#EAE2D3] text-[#8B948E] line-through'
                                  : isSelected
                                  ? 'cursor-pointer border-[#B5893D] bg-[#1E3A2F] font-semibold text-[#FBF9F5]'
                                  : 'cursor-pointer border-[#C9BFA9] bg-[#FFFFFF] text-[#16261F] hover:border-[#1E3A2F]'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-[#6D7B74]">
                        Crossed-out time slots are already reserved or have already passed for this date.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="appointment-message"
                        className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]"
                      >
                        Additional Message (Optional)
                      </label>
                      <textarea
                        id="appointment-message"
                        rows={3}
                        maxLength={500}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share hair history, allergies, styling references, or arrival preferences..."
                        className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] placeholder:text-[#6D7B74] focus:border-[#1E3A2F] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={submitting || !timeSlot}
                        className="btn-emerald inline-flex flex-1 cursor-pointer items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Submitting Request...
                          </>
                        ) : (
                          'Submit Appointment Request'
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setShowBookingForm(false)}
                        className="btn-limestone cursor-pointer px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
