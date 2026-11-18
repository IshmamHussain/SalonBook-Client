'use client';

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  PlusCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { apiRequest } from '@/lib/api';
import type { AdminOverview } from '@/types';

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ success: boolean; overview: AdminOverview }>(
          '/api/dashboard/admin/overview',
          { auth: true }
        );
        if (!active) return;
        setOverview(res.overview);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load admin overview metrics.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading studio metrics..." />;

  if (error) {
    return (
      <div className="maison-card p-8 text-center text-sm text-rose-800">{error}</div>
    );
  }

  const metrics = [
    {
      label: 'Total Registered Customers',
      value: overview?.totalCustomers ?? 0,
      icon: Users,
      accent: 'text-[#1E3A2F]',
      href: '/dashboard/admin/users',
    },
    {
      label: 'Total Active Services',
      value: overview?.totalActiveServices ?? 0,
      icon: Sparkles,
      accent: 'text-[#B5893D]',
      href: '/dashboard/admin/services',
    },
    {
      label: 'Total Appointment Requests',
      value: overview?.totalAppointments ?? 0,
      icon: CalendarCheck,
      accent: 'text-[#1E3A2F]',
      href: '/dashboard/admin/appointments',
    },
    {
      label: 'Pending Appointments',
      value: overview?.pendingAppointments ?? 0,
      icon: Clock,
      accent: 'text-amber-700',
      href: '/dashboard/admin/appointments',
    },
    {
      label: 'Confirmed Appointments',
      value: overview?.confirmedAppointments ?? 0,
      icon: CheckCircle2,
      accent: 'text-emerald-800',
      href: '/dashboard/admin/appointments',
    },
    {
      label: 'Total Successful Payments',
      value: overview?.totalSuccessfulPayments ?? 0,
      icon: CreditCard,
      accent: 'text-teal-800',
      href: '/dashboard/admin/transactions',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
            Admin Studio Overview
          </h1>
          <p className="mt-1.5 text-sm text-[#495A52]">
            Monitor registered customers, active salon services, appointment confirmations, and Stripe-verified transactions.
          </p>
        </div>

        <Link
          href="/dashboard/admin/services/new"
          className="btn-emerald inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Add New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="maison-card maison-card-hover group flex flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#495A52]">{metric.label}</span>
                <Icon className={`h-4 w-4 ${metric.accent}`} aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <p className="font-mono text-4xl font-semibold tabular-nums text-[#1E3A2F]">
                  {metric.value}
                </p>
                <ArrowRight
                  className="h-4 w-4 text-[#B5893D] transition-transform group-hover:translate-x-1 group-hover:text-[#1E3A2F]"
                  aria-hidden="true"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
