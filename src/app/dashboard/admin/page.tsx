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
      <div className="atelier-surface p-8 text-center text-sm text-rose-300">{error}</div>
    );
  }

  const metrics = [
    {
      label: 'Total Registered Customers',
      value: overview?.totalCustomers ?? 0,
      icon: Users,
      accent: 'text-[#8DB4D4]',
      href: '/dashboard/admin/users',
    },
    {
      label: 'Total Active Services',
      value: overview?.totalActiveServices ?? 0,
      icon: Sparkles,
      accent: 'text-[#E08A5E]',
      href: '/dashboard/admin/services',
    },
    {
      label: 'Total Appointment Requests',
      value: overview?.totalAppointments ?? 0,
      icon: CalendarCheck,
      accent: 'text-[#F4F6F8]',
      href: '/dashboard/admin/appointments',
    },
    {
      label: 'Pending Appointments',
      value: overview?.pendingAppointments ?? 0,
      icon: Clock,
      accent: 'text-amber-300',
      href: '/dashboard/admin/appointments',
    },
    {
      label: 'Confirmed Appointments',
      value: overview?.confirmedAppointments ?? 0,
      icon: CheckCircle2,
      accent: 'text-emerald-300',
      href: '/dashboard/admin/appointments',
    },
    {
      label: 'Total Successful Payments',
      value: overview?.totalSuccessfulPayments ?? 0,
      sub: `$${Number(overview?.totalRevenue ?? 0).toFixed(2)} verified revenue`,
      icon: CreditCard,
      accent: 'text-teal-300',
      href: '/dashboard/admin/transactions',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8]">
            Admin Studio Overview
          </h1>
          <p className="mt-1.5 text-sm text-[#B4C2CF]">
            Monitor registered customers, active salon services, appointment confirmations, and Stripe-verified transactions.
          </p>
        </div>

        <Link
          href="/dashboard/admin/services/new"
          className="inline-flex w-fit items-center gap-2 bg-[#E08A5E] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
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
              className="atelier-surface atelier-surface-hover group flex flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#B4C2CF]">{metric.label}</span>
                <Icon className={`h-4 w-4 ${metric.accent}`} aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="font-mono text-4xl font-semibold tabular-nums text-[#F4F6F8]">
                    {metric.value}
                  </p>
                  {metric.sub && (
                    <p className="mt-1 font-mono text-xs text-teal-300">{metric.sub}</p>
                  )}
                </div>
                <ArrowRight
                  className="h-4 w-4 text-[#7F92A4] transition-transform group-hover:translate-x-1 group-hover:text-[#E08A5E]"
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
