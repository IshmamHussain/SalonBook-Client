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
    <div className="terrace-ground min-h-screen">
      <section className="border-b border-[#D5C9B4] bg-[#EBE4D6]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[#1E3A2F] sm:text-5xl">
            Browse Salon Services
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#495A52]">
            Search treatments by name, filter across seven salon disciplines, and sort by price. Every listed treatment is active and open for booking.
          </p>

          {/* Search, Category & Price Sort Controls */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <label htmlFor="browse-search" className="sr-only">
                Search services by name
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]"
                aria-hidden="true"
              />
              <input
                id="browse-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service name..."
                className="w-full border border-[#C9BFA9] bg-[#FBF9F5] py-3.5 pl-11 pr-4 text-sm text-[#16261F] placeholder:text-[#6D7B74] focus:border-[#1E3A2F] focus:outline-none"
              />
            </div>

            <div className="relative md:col-span-4">
              <label htmlFor="browse-category" className="sr-only">
                Filter by category
              </label>
              <SlidersHorizontal
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]"
                aria-hidden="true"
              />
              <select
                id="browse-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer appearance-none border border-[#C9BFA9] bg-[#FBF9F5] py-3.5 pl-11 pr-8 text-sm text-[#16261F] focus:border-[#1E3A2F] focus:outline-none"
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
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A2F]"
                aria-hidden="true"
              />
              <select
                id="browse-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full cursor-pointer appearance-none border border-[#C9BFA9] bg-[#FBF9F5] py-3.5 pl-11 pr-8 text-sm text-[#16261F] focus:border-[#1E3A2F] focus:outline-none"
              >
                <option value="newest">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Category Rail */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`cursor-pointer border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                category === 'all'
                  ? 'border-[#B5893D] bg-[#1E3A2F] font-semibold text-[#FBF9F5]'
                  : 'border-[#C9BFA9] bg-[#FBF9F5] text-[#495A52] hover:border-[#1E3A2F] hover:text-[#1E3A2F]'
              }`}
            >
              All
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`cursor-pointer border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                  category === cat
                    ? 'border-[#B5893D] bg-[#1E3A2F] font-semibold text-[#FBF9F5]'
                    : 'border-[#C9BFA9] bg-[#FBF9F5] text-[#495A52] hover:border-[#1E3A2F] hover:text-[#1E3A2F]'
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
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#495A52]">
            {loading
              ? 'Loading treatments...'
              : `${services.length} Active ${services.length === 1 ? 'Service' : 'Services'}`}
          </p>
          {(search || category !== 'all' || sort !== 'newest') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[#1E3A2F] hover:text-[#B5893D]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <ServiceGridSkeleton count={6} />
        ) : error ? (
          <div className="maison-card p-10 text-center">
            <p className="text-sm font-medium text-rose-800">{error}</p>
            <button
              type="button"
              onClick={fetchServices}
              className="btn-emerald mt-4 cursor-pointer px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Retry
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="maison-card p-12 text-center">
            <h2 className="font-display text-2xl font-semibold text-[#1E3A2F]">
              No matching salon services
            </h2>
            <p className="mt-2 text-sm text-[#495A52]">
              Try adjusting your search query or choosing another category.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-limestone mt-6 cursor-pointer px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Show All Active Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
