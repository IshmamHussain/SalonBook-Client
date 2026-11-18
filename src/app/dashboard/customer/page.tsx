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
      <div className="maison-card p-8 text-center text-sm text-rose-800">{error}</div>
    );
  }

  const stats = [
    {
      label: 'Total Appointment Requests',
      value: overview?.totalAppointments ?? 0,
      icon: CalendarCheck,
      tone: 'text-[#1E3A2F]',
    },
    {
      label: 'Pending Appointments',
      value: overview?.pendingAppointments ?? 0,
      icon: Clock,
      tone: 'text-amber-700',
    },
    {
      label: 'Confirmed Appointments',
      value: overview?.confirmedAppointments ?? 0,
      icon: CheckCircle2,
      tone: 'text-emerald-800',
    },
    {
      label: 'Cancelled Appointments',
      value: overview?.cancelledAppointments ?? 0,
      icon: XCircle,
      tone: 'text-rose-800',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
            Welcome Back, {user?.name}
          </h1>
          <p className="mt-1.5 text-sm text-[#495A52]">
            Track your salon booking requests, confirm upcoming dates, and complete Stripe payments once approved.
          </p>
        </div>
        <Link
          href="/services"
          className="btn-emerald inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Book New Service
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="maison-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#495A52]">{stat.label}</span>
                <Icon className={`h-4 w-4 ${stat.tone}`} aria-hidden="true" />
              </div>
              <p className="mt-4 font-mono text-4xl font-semibold tabular-nums text-[#1E3A2F]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="maison-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E2D9C8] bg-[#F4EFE6] px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-[#1E3A2F]">Recent Appointments</h2>
          <Link
            href="/dashboard/customer/appointments"
            className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#1E3A2F] hover:text-[#B5893D]"
          >
            View All &rarr;
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#495A52]">You haven&apos;t submitted any appointment requests yet.</p>
            <Link
              href="/services"
              className="btn-limestone mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Explore Salon Services
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E2D9C8]">
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
                      className="h-12 w-12 shrink-0 border border-[#D5C9B4] object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 bg-[#EAE2D3]" />
                  )}
                  <div>
                    <p className="font-semibold text-[#16261F]">{appt.serviceName}</p>
                    <p className="font-mono text-xs tabular-nums text-[#495A52]">
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
