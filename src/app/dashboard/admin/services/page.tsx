'use client';

import { ArrowDownUp, Pencil, PlusCircle, Power, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiRequest } from '@/lib/api';
import type { SalonService } from '@/types';

export default function AdminManageServicesPage() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState<SalonService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);
      const res = await apiRequest<{ success: boolean; services: SalonService[] }>(
        `/api/admin/services?${params.toString()}`,
        { auth: true }
      );
      setServices(res.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load salon services.');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    const t = setTimeout(loadServices, 220);
    return () => clearTimeout(t);
  }, [loadServices]);

  async function handleToggleStatus(service: SalonService) {
    const nextStatus = service.status === 'active' ? 'inactive' : 'active';
    const previous = services;

    // Optimistic UI toggle with rollback on error
    setServices((curr) =>
      curr.map((s) => (s.id === service.id ? { ...s, status: nextStatus } : s))
    );

    try {
      await apiRequest(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(
        nextStatus === 'active'
          ? `${service.serviceName} is now Active and visible to customers.`
          : `${service.serviceName} deactivated and hidden from public booking.`
      );
    } catch (err) {
      setServices(previous);
      toast.error(err instanceof Error ? err.message : 'Could not update service status.');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const previous = services;
    const targetId = deleteTarget.id;

    setDeleting(true);
    setServices((curr) => curr.filter((s) => s.id !== targetId));

    try {
      await apiRequest(`/api/admin/services/${targetId}`, {
        method: 'DELETE',
        auth: true,
      });
      toast.success('Service deleted permanently.');
      setDeleteTarget(null);
    } catch (err) {
      setServices(previous);
      toast.error(err instanceof Error ? err.message : 'Could not delete service.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8]">
            Manage Salon Services
          </h1>
          <p className="mt-1.5 text-sm text-[#B4C2CF]">
            Add, edit, activate/deactivate, or remove services. Only active services appear on the public storefront.
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

      {/* Search & Price Sort */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="relative sm:col-span-8">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8DB4D4]" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services by name..."
            aria-label="Search admin services by name"
            className="w-full border border-white/18 bg-[#121922] py-3 pl-10 pr-4 text-sm text-[#F4F6F8] placeholder:text-[#7F92A4] focus:border-[#E08A5E] focus:outline-none"
          />
        </div>
        <div className="relative sm:col-span-4">
          <ArrowDownUp className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E08A5E]" aria-hidden="true" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort services by price"
            className="w-full cursor-pointer appearance-none border border-white/18 bg-[#121922] py-3 pl-10 pr-8 text-sm text-[#F4F6F8] focus:border-[#E08A5E] focus:outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading studio services..." />
      ) : error ? (
        <div className="atelier-surface p-8 text-center text-sm text-rose-300">{error}</div>
      ) : services.length === 0 ? (
        <div className="atelier-surface p-12 text-center">
          <p className="font-display text-xl font-bold text-[#F4F6F8]">No services found</p>
          <p className="mt-2 text-sm text-[#B4C2CF]">Add your first salon service or adjust the search query.</p>
        </div>
      ) : (
        <div className="atelier-surface overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/12 bg-[#121922] font-mono text-[11px] uppercase tracking-[0.14em] text-[#8DB4D4]">
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {services.map((service) => (
                <tr key={service.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="h-12 w-12 shrink-0 object-cover"
                      />
                      <span className="font-semibold text-[#F4F6F8]">{service.serviceName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#B4C2CF]">{service.category}</td>
                  <td className="px-5 py-4 font-mono font-semibold tabular-nums text-[#E08A5E]">
                    ${Number(service.price).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#D0DCE7]">
                    {service.duration} min
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge variant={service.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service)}
                        className="inline-flex cursor-pointer items-center gap-1 border border-white/16 px-2.5 py-1.5 text-xs text-[#D0DCE7] transition-colors hover:border-[#E08A5E] hover:text-[#E08A5E]"
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                        {service.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <Link
                        href={`/dashboard/admin/services/${service.id}/edit`}
                        className="inline-flex items-center gap-1 border border-white/16 px-2.5 py-1.5 text-xs text-[#8DB4D4] transition-colors hover:border-[#8DB4D4] hover:text-[#F4F6F8]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(service)}
                        className="inline-flex cursor-pointer items-center gap-1 border border-rose-400/35 px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/15"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete salon service?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.serviceName}"? Consider deactivating instead if you want to preserve historical records.`
            : ''
        }
        confirmLabel="Delete Service"
        cancelLabel="Keep Service"
        tone="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
