'use client';

import {
  AlertCircle,
  ArrowLeft,
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

function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function ServiceDetailsClient({ serviceId }: { serviceId: string }) {
  const { user, loading: authLoading, blockedMessage } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<SalonService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [message, setMessage] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect unauthenticated users to Sign In (protected route)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (blockedMessage) {
        toast.error(blockedMessage);
      }
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(`/services/${serviceId}`)}`);
    }
  }, [authLoading, user, blockedMessage, router, serviceId]);

  useEffect(() => {
    if (authLoading || !user) return;
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
    if (!showBookingForm || !user || !appointmentDate) return;
    let active = true;

    async function loadBookedSlots() {
      setLoadingSlots(true);
      try {
        const res = await apiRequest<{ success: boolean; bookedSlots: string[] }>(
          `/api/appointments/booked-slots?date=${encodeURIComponent(appointmentDate)}`,
          { auth: true }
        );
        if (!active) return;
        setBookedSlots(res.bookedSlots || []);
        if (res.bookedSlots?.includes(timeSlot)) {
          setTimeSlot('');
        }
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
  }, [showBookingForm, appointmentDate, user, timeSlot]);

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
        }),
      });
      toast.success(res.message || 'Appointment request submitted!');
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

  if (loading) {
    return <LoadingSpinner label="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="atelier-surface p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rose-400/40 bg-rose-500/12 text-rose-300">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold text-[#F4F6F8]">
            Service unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#B4C2CF]">
            {error || 'The requested salon service ID is invalid or no longer active.'}
          </p>
          <Link
            href="/services"
            className="mt-7 inline-flex items-center gap-2 bg-[#E08A5E] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
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
    <div className="portal-grain min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#B4C2CF] transition-colors hover:text-[#E08A5E]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Browse Services
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Visual Service Plate */}
          <div className="lg:col-span-6">
            <div className="atelier-surface overflow-hidden">
              <div className="relative aspect-[4/3] w-full bg-[#0E141C]">
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 border border-white/20 bg-[#0B0F14]/82 px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-[#F4F6F8] backdrop-blur-sm">
                  {service.category}
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/12 bg-[#121922]">
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7F92A4]">Price</p>
                  <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#E08A5E]">
                    ${Number(service.price).toFixed(2)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7F92A4]">Duration</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xl tabular-nums text-[#F4F6F8]">
                    <Clock className="h-4 w-4 text-[#8DB4D4]" aria-hidden="true" />
                    {service.duration}m
                  </p>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7F92A4]">Status</p>
                  <div className="mt-1.5">
                    <StatusBadge variant={service.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Appointment Booking Option */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-[#F4F6F8] sm:text-5xl">
                {service.serviceName}
              </h1>

              <p className="mt-5 text-base leading-relaxed text-[#D0DCE7]">{service.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-3 border-y border-white/12 py-5 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm text-[#B4C2CF]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>No upfront charge before confirmation</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#B4C2CF]">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#E08A5E]" aria-hidden="true" />
                  <span>Stripe Checkout unlocks once confirmed</span>
                </div>
              </div>

              {/* Booking Action / Role Rules */}
              <div className="mt-8">
                {isAdmin ? (
                  <div className="flex items-start gap-3 border border-amber-400/35 bg-amber-400/10 p-5 text-sm text-amber-100">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Administrator Account Active</p>
                      <p className="mt-1 text-amber-100/80">
                        Admins manage salon services and review bookings from the Admin Dashboard and cannot submit customer appointment requests.
                      </p>
                      <Link
                        href="/dashboard/admin/services"
                        className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.12em] text-[#E08A5E] hover:underline"
                      >
                        Manage Services in Admin Dashboard &rarr;
                      </Link>
                    </div>
                  </div>
                ) : !isActiveService ? (
                  <div className="border border-rose-400/35 bg-rose-500/10 p-5 text-sm text-rose-200">
                    This service is currently inactive and unavailable for appointment booking.
                  </div>
                ) : !showBookingForm ? (
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(true)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 bg-[#E08A5E] px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076] sm:w-auto"
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Book This Appointment
                  </button>
                ) : (
                  <form onSubmit={handleSubmitAppointment} className="atelier-surface space-y-6 p-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h2 className="font-display text-xl font-bold text-[#F4F6F8]">
                        Request Appointment Slot
                      </h2>
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#E08A5E]">
                        Pending Approval
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="appointment-date"
                        className="block font-mono text-xs uppercase tracking-[0.12em] text-[#B4C2CF]"
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
                        className="mt-2 w-full border border-white/18 bg-[#0B0F14] px-4 py-3 text-sm text-[#F4F6F8] focus:border-[#E08A5E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#B4C2CF]">
                          Available Time Slot
                        </span>
                        {loadingSlots && (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#8DB4D4]">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            Checking slots...
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {PREDEFINED_TIME_SLOTS.map((slot) => {
                          const isTaken = bookedSlots.includes(slot);
                          const isSelected = timeSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isTaken}
                              onClick={() => setTimeSlot(slot)}
                              aria-pressed={isSelected}
                              className={`border px-3 py-2.5 font-mono text-xs tabular-nums transition-colors ${
                                isTaken
                                  ? 'cursor-not-allowed border-white/8 bg-white/4 text-[#637485] line-through'
                                  : isSelected
                                  ? 'cursor-pointer border-[#E08A5E] bg-[#E08A5E] font-semibold text-[#0B0F14]'
                                  : 'cursor-pointer border-white/16 bg-[#0B0F14] text-[#F4F6F8] hover:border-[#E08A5E]'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-[#7F92A4]">
                        Crossed-out slots are already reserved for this date.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="appointment-message"
                        className="block font-mono text-xs uppercase tracking-[0.12em] text-[#B4C2CF]"
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
                        className="mt-2 w-full border border-white/18 bg-[#0B0F14] px-4 py-3 text-sm text-[#F4F6F8] placeholder:text-[#7F92A4] focus:border-[#E08A5E] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={submitting || !timeSlot}
                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 bg-[#E08A5E] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076] disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="cursor-pointer border border-white/18 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#B4C2CF] hover:border-white/35 hover:text-[#F4F6F8]"
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
