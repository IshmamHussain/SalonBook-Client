'use client';

import { ArrowRight, CalendarCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import type { Appointment, CustomerOverview } from '@/types';

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [ovRes, apRes] = await Promise.all([
          apiRequest<{ success: boolean; overview: CustomerOverview }>(
            '/api/dashboard/customer/overview',
            { auth: true }
          ),
          apiRequest<{ success: boolean; appointments: Appointment[] }>('/api/appointments/my', {
            auth: true,
          }),
        ]);
        if (!active) return;
        setOverview(ovRes.overview);
        setRecentAppointments((apRes.appointments || []).slice(0, 4));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load dashboard overview.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading customer overview..." />;

  if (error) {
    return (
      <div className="atelier-surface p-8 text-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Appointment Requests',
      value: overview?.totalAppointments ?? 0,
      icon: CalendarCheck,
      tone: 'text-[#8DB4D4]',
    },
    {
      label: 'Pending Appointments',
      value: overview?.pendingAppointments ?? 0,
      icon: Clock,
      tone: 'text-amber-300',
    },
    {
      label: 'Confirmed Appointments',
      value: overview?.confirmedAppointments ?? 0,
      icon: CheckCircle2,
      tone: 'text-emerald-300',
    },
    {
      label: 'Cancelled Appointments',
      value: overview?.cancelledAppointments ?? 0,
      icon: XCircle,
      tone: 'text-rose-300',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8]">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1.5 text-sm text-[#B4C2CF]">
            Track your salon booking requests, confirm upcoming dates, and complete Stripe payments once approved.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex w-fit items-center gap-2 bg-[#E08A5E] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
        >
          Book New Service
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="atelier-surface p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#B4C2CF]">{stat.label}</span>
                <Icon className={`h-4 w-4 ${stat.tone}`} aria-hidden="true" />
              </div>
              <p className="mt-4 font-mono text-4xl font-semibold tabular-nums text-[#F4F6F8]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Appointments Preview */}
      <div className="atelier-surface">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-[#F4F6F8]">Recent Appointments</h2>
          <Link
            href="/dashboard/customer/appointments"
            className="font-mono text-xs uppercase tracking-[0.12em] text-[#E08A5E] hover:underline"
          >
            View All &rarr;
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#B4C2CF]">You haven&apos;t submitted any appointment requests yet.</p>
            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-2 border border-[#E08A5E] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#E08A5E]"
            >
              Explore Salon Services
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {recentAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  {appt.serviceImage ? (
                    <img
                      src={appt.serviceImage}
                      alt={appt.serviceName}
                      className="h-12 w-12 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 bg-[#18222E]" />
                  )}
                  <div>
                    <p className="font-semibold text-[#F4F6F8]">{appt.serviceName}</p>
                    <p className="font-mono text-xs tabular-nums text-[#B4C2CF]">
                      {appt.appointmentDate} · {appt.timeSlot} · ${Number(appt.servicePrice).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge variant={appt.status} />
                  <StatusBadge variant={appt.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
