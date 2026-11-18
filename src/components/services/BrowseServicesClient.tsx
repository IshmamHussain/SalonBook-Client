'use client';

import { ArrowDownUp, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceGridSkeleton } from '@/components/ui/LoadingState';
import { apiRequest } from '@/lib/api';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import type { SalonService } from '@/types';

export function BrowseServicesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 260);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (category && category !== 'all') params.set('category', category);
      if (sort) params.set('sort', sort);

      const queryString = params.toString();
      const res = await apiRequest<{ success: boolean; services: SalonService[] }>(
        `/api/services${queryString ? `?${queryString}` : ''}`
      );
      setServices(res.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salon services.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category && category !== 'all') params.set('category', category);
    if (sort && sort !== 'newest') params.set('sort', sort);
    const qs = params.toString();
    router.replace(qs ? `/services?${qs}` : '/services', { scroll: false });
  }, [debouncedSearch, category, sort, router]);

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setCategory('all');
    setSort('newest');
  }

  return (
    <div className="portal-grain min-h-screen">
      <section className="border-b border-white/12 bg-[#0E141C]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#F4F6F8] sm:text-6xl">
            Browse Salon Services
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#B4C2CF]">
            Search treatments by name, filter across all seven salon disciplines, and sort by price. Every listed service is active and available for online booking.
          </p>

          {/* Search, Category Filter & Price Sort Bar */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <label htmlFor="browse-search" className="sr-only">
                Search services by name
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8DB4D4]"
                aria-hidden="true"
              />
              <input
                id="browse-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service name..."
                className="w-full border border-white/18 bg-[#0B0F14] py-3.5 pl-11 pr-4 text-sm text-[#F4F6F8] placeholder:text-[#7F92A4] focus:border-[#E08A5E] focus:outline-none"
              />
            </div>

            <div className="relative md:col-span-4">
              <label htmlFor="browse-category" className="sr-only">
                Filter by category
              </label>
              <SlidersHorizontal
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8DB4D4]"
                aria-hidden="true"
              />
              <select
                id="browse-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer appearance-none border border-white/18 bg-[#0B0F14] py-3.5 pl-11 pr-8 text-sm text-[#F4F6F8] focus:border-[#E08A5E] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative md:col-span-3">
              <label htmlFor="browse-sort" className="sr-only">
                Sort services by price
              </label>
              <ArrowDownUp
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E08A5E]"
                aria-hidden="true"
              />
              <select
                id="browse-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full cursor-pointer appearance-none border border-white/18 bg-[#0B0F14] py-3.5 pl-11 pr-8 text-sm text-[#F4F6F8] focus:border-[#E08A5E] focus:outline-none"
              >
                <option value="newest">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`cursor-pointer border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                category === 'all'
                  ? 'border-[#E08A5E] bg-[#E08A5E] font-semibold text-[#0B0F14]'
                  : 'border-white/14 bg-[#0B0F14]/60 text-[#B4C2CF] hover:border-white/35 hover:text-[#F4F6F8]'
              }`}
            >
              All
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`cursor-pointer border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                  category === cat
                    ? 'border-[#E08A5E] bg-[#E08A5E] font-semibold text-[#0B0F14]'
                    : 'border-white/14 bg-[#0B0F14]/60 text-[#B4C2CF] hover:border-white/35 hover:text-[#F4F6F8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#B4C2CF]">
            {loading ? 'Loading treatments...' : `${services.length} Active ${services.length === 1 ? 'Service' : 'Services'}`}
          </p>
          {(search || category !== 'all' || sort !== 'newest') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[#E08A5E] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <ServiceGridSkeleton count={6} />
        ) : error ? (
          <div className="atelier-surface p-10 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={fetchServices}
              className="mt-4 cursor-pointer bg-[#E08A5E] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#0B0F14]"
            >
              Retry
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="atelier-surface p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-[#F4F6F8]">No matching salon services</h2>
            <p className="mt-2 text-sm text-[#B4C2CF]">
              Try adjusting your search query or selecting a different salon category.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 cursor-pointer border border-[#E08A5E] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#E08A5E] transition-colors hover:bg-[#E08A5E] hover:text-[#0B0F14]"
            >
              Show All Active Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
