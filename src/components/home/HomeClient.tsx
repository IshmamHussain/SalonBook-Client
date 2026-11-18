'use client';

import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Search,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceGridSkeleton } from '@/components/ui/LoadingState';
import { apiRequest, getCachedResponse } from '@/lib/api';
import { CATEGORY_DESCRIPTIONS, SALON_INFO, SERVICE_CATEGORIES } from '@/lib/constants';
import type { CategorySummary, SalonService } from '@/types';

const HOME_SERVICES_PATH = '/api/services?limit=6';
const HOME_CATEGORIES_PATH = '/api/services/categories';

export function HomeClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const initialServices =
    getCachedResponse<{ success: boolean; services: SalonService[] }>(HOME_SERVICES_PATH)
      ?.services ?? null;
  const initialCategories =
    getCachedResponse<{ success: boolean; categories: CategorySummary[] }>(HOME_CATEGORIES_PATH)
      ?.categories ?? null;

  const [featuredServices, setFeaturedServices] = useState<SalonService[]>(
    () => initialServices ?? []
  );
  const [categories, setCategories] = useState<CategorySummary[]>(
    () =>
      initialCategories ??
      SERVICE_CATEGORIES.map((name) => ({ name, count: 0, minPrice: null }))
  );
  const [loadingServices, setLoadingServices] = useState(() => initialServices === null);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      const hasCached = getCachedResponse(HOME_SERVICES_PATH) !== null;
      if (!hasCached) {
        setLoadingServices(true);
      }
      setServicesError(null);
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          apiRequest<{ success: boolean; services: SalonService[] }>(HOME_SERVICES_PATH, {
            cacheTtlMs: 30_000,
          }),
          apiRequest<{ success: boolean; categories: CategorySummary[] }>(HOME_CATEGORIES_PATH, {
            cacheTtlMs: 30_000,
          }),
        ]);
        if (!active) return;
        setFeaturedServices(servicesRes.services || []);
        if (categoriesRes.categories?.length) {
          setCategories(categoriesRes.categories);
        }
      } catch (err) {
        if (!active) return;
        if (!hasCached) {
          setServicesError(
            err instanceof Error
              ? err.message
              : 'Unable to load salon services right now. Check server connectivity.'
          );
        }
      } finally {
        if (active) setLoadingServices(false);
      }
    }
    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/services?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/services');
    }
  }

  const hairWingItems = featuredServices.filter((s) => s.category.startsWith('Hair')).slice(0, 3);
  const spaWingItems = featuredServices.filter((s) => !s.category.startsWith('Hair')).slice(0, 3);

  return (
    <div className="terrace-ground">
      {/* Banner Section: Versailles 3-Column Axial Terrace & Arched Vista */}
      <section className="mx-auto max-w-[1440px] border-b border-[#D5C9B4]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Clipped-Hedge Emerald Wing: Hair & Color */}
          <aside className="order-2 flex flex-col justify-between border-t border-[#B5893D]/40 bg-[#1E3A2F] p-8 text-[#F4EFE6] lg:order-1 lg:col-span-3 lg:border-r lg:border-t-0 lg:p-9">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-wide text-[#E8CF9C]">
                Hair &amp; Color
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#D7CFC0]">
                Architectural cuts, custom lived-in balayage, and molecular keratin care.
              </p>
            </div>

            <div className="mt-8 space-y-1">
              {loadingServices && hairWingItems.length === 0
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse border-t border-[#B5893D]/35 py-4">
                      <div className="h-4 w-3/4 bg-white/15" />
                      <div className="mt-2 h-3 w-24 bg-[#D6BC88]/25" />
                    </div>
                  ))
                : hairWingItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/services/${item.id}`}
                      className="group block border-t border-[#B5893D]/35 py-4 transition-colors hover:border-[#E8CF9C]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm font-semibold text-[#FBF9F5] group-hover:text-[#E8CF9C]">
                          {item.serviceName}
                        </strong>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#D6BC88]" aria-hidden="true" />
                      </div>
                      <span className="mt-1 block font-mono text-xs tabular-nums text-[#D6BC88]">
                        {item.duration} MIN · ${Number(item.price).toFixed(0)}
                      </span>
                    </Link>
                  ))}
            </div>
          </aside>

          {/* Center Sunlit Limestone Terrace & Arched Salon Photography Vista */}
          <motion.div
            initial={{ opacity: 0.94, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 flex flex-col items-center justify-between bg-[#F4EFE6] px-5 py-10 text-center sm:px-10 lg:order-2 lg:col-span-6 lg:py-12"
          >
            <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-[0.01em] text-[#1E3A2F] sm:text-5xl xl:text-[3.75rem]">
              Maison of Calm &amp; Craft.
            </h1>

            {/* Gilt-Framed Arched Salon Vista */}
            <div className="my-7 w-full max-w-[420px] rounded-t-[210px] border-2 border-[#B5893D] bg-[#FBF9F5] p-2.5 shadow-[0_24px_50px_-24px_rgba(22,38,31,0.35)]">
              <div className="relative h-[320px] w-full overflow-hidden rounded-t-[200px] sm:h-[380px]">
                <img
                  src="/hero-salon.jpg"
                  alt="Master hair stylist finishing glossy sculpted waves in the sunlit SalonBook salon"
                  className="h-full w-full object-cover object-top"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(30,58,47,0.04) 55%, rgba(22,38,31,0.45) 100%)',
                  }}
                />
              </div>
            </div>

            <p className="max-w-lg text-sm leading-relaxed text-[#495A52] sm:text-base">
              Curated salon appointments across seven focused disciplines. Reserve your preferred slot online and complete Stripe payment only once confirmed.
            </p>

            {/* Instant Search + Primary CTA */}
            <form
              onSubmit={handleHeroSearch}
              role="search"
              aria-label="Search salon services"
              className="mt-6 flex w-full max-w-xl flex-col gap-2.5 sm:flex-row"
            >
              <label htmlFor="hero-service-search" className="sr-only">
                Search salon services by name
              </label>
              <div className="relative flex flex-1 items-center border border-[#C9BFA9] bg-[#FBF9F5] transition-colors focus-within:border-[#1E3A2F] focus-within:ring-2 focus-within:ring-[#B5893D]/45">
                <Search className="pointer-events-none ml-3.5 h-4 w-4 shrink-0 text-[#B5893D]" aria-hidden="true" />
                <input
                  id="hero-service-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cuts, balayage, facials..."
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-[#16261F] placeholder:text-[#6D7B74] outline-none focus:outline-none focus-visible:outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-emerald inline-flex cursor-pointer items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                Explore Salon Services
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </motion.div>

          {/* Right Clipped-Hedge Emerald Wing: Skin & Spa */}
          <aside className="order-3 flex flex-col justify-between border-t border-[#B5893D]/40 bg-[#1E3A2F] p-8 text-[#F4EFE6] lg:col-span-3 lg:border-l lg:border-t-0 lg:p-9">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-wide text-[#E8CF9C]">
                Skin &amp; Spa
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#D7CFC0]">
                Lymphatic facials, editorial makeup, gel manicure artistry, and basalt rituals.
              </p>
            </div>

            <div className="mt-8 space-y-1">
              {loadingServices && spaWingItems.length === 0
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse border-t border-[#B5893D]/35 py-4">
                      <div className="h-4 w-3/4 bg-white/15" />
                      <div className="mt-2 h-3 w-24 bg-[#D6BC88]/25" />
                    </div>
                  ))
                : spaWingItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/services/${item.id}`}
                      className="group block border-t border-[#B5893D]/35 py-4 transition-colors hover:border-[#E8CF9C]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm font-semibold text-[#FBF9F5] group-hover:text-[#E8CF9C]">
                          {item.serviceName}
                        </strong>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#D6BC88]" aria-hidden="true" />
                      </div>
                      <span className="mt-1 block font-mono text-xs tabular-nums text-[#D6BC88]">
                        {item.duration} MIN · ${Number(item.price).toFixed(0)}
                      </span>
                    </Link>
                  ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Dynamic Section 1: Featured Salon Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-[#D5C9B4] pb-8 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F] sm:text-4xl">
              Featured Salon Services
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#495A52] sm:text-base">
              Active studio treatments published directly from our salon ledger, each with transparent duration and pricing.
            </p>
          </div>
          <Link
            href="/services"
            className="btn-limestone inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em]"
          >
            View Full Menu
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10">
          {loadingServices ? (
            <ServiceGridSkeleton count={6} />
          ) : servicesError ? (
            <div className="maison-card p-8 text-center">
              <p className="text-sm font-medium text-rose-800">{servicesError}</p>
              <p className="mt-2 text-xs text-[#495A52]">
                Start the SalonBook Express server with your MongoDB URI and run{' '}
                <code className="font-mono text-[#1E3A2F]">npm run seed</code> to display live services.
              </p>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="maison-card p-10 text-center">
              <p className="font-display text-xl font-semibold text-[#1E3A2F]">
                No active services published yet
              </p>
              <p className="mt-2 text-sm text-[#495A52]">
                Run <code className="font-mono text-[#1E3A2F]">npm run seed</code> on the server or add a service from the Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Section 2: Salon Service Categories (Parterre Index) */}
      <section className="border-y border-[#D5C9B4] bg-[#EBE4D6]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F] sm:text-4xl">
                Salon Service Categories
              </h2>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#495A52] sm:text-base">
                Step into any of our seven salon disciplines to explore active services tailored to your visit.
              </p>
            </div>
            <Link
              href="/services"
              className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-[#1E3A2F] hover:text-[#B5893D]"
            >
              Browse All Disciplines &rarr;
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name}
                href={`/services?category=${encodeURIComponent(cat.name)}`}
                className={`group flex flex-col justify-between p-6 transition-all ${
                  idx === 0
                    ? 'border border-[#B5893D] bg-[#1E3A2F] text-[#FBF9F5] shadow-md hover:bg-[#142820] sm:col-span-2'
                    : 'maison-card maison-card-hover text-[#16261F]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={`font-display text-xl font-semibold ${
                      idx === 0
                        ? 'text-[#E8CF9C]'
                        : 'text-[#1E3A2F] group-hover:text-[#986F2A]'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <ArrowUpRight
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      idx === 0 ? 'text-[#D6BC88]' : 'text-[#B5893D]'
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    idx === 0 ? 'text-[#DFD8CA]' : 'text-[#495A52]'
                  }`}
                >
                  {CATEGORY_DESCRIPTIONS[cat.name] || 'Curated studio treatments tailored to your schedule.'}
                </p>

                <div
                  className={`mt-6 flex items-center justify-between border-t pt-3 font-mono text-xs tabular-nums ${
                    idx === 0 ? 'border-[#B5893D]/35 text-[#E8CF9C]' : 'border-[#E2D9C8] text-[#495A52]'
                  }`}
                >
                  <span>
                    {cat.count} {cat.count === 1 ? 'Active Service' : 'Active Services'}
                  </span>
                  {cat.minPrice !== null && (
                    <span className={idx === 0 ? 'text-[#FBF9F5]' : 'font-semibold text-[#1E3A2F]'}>
                      From ${Number(cat.minPrice).toFixed(0)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Custom Section: The 3-Step Salon Booking Ritual & Studio Concierge */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#1E3A2F] sm:text-4xl">
              The Booking Ritual, Step by Step
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#495A52]">
              Every appointment follows a calm, transparent three-stage sequence enforced end-to-end on the server—so your chair is confirmed before you ever pay.
            </p>

            <ol className="mt-8 space-y-4">
              <li className="maison-card flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#B5893D] bg-[#1E3A2F] text-[#E8CF9C]">
                  <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#1E3A2F]">
                    Request Your Open Time Slot
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#495A52]">
                    Choose an active service, pick a date and open time slot, and include any styling notes. Duplicate active bookings are prevented automatically.
                  </p>
                </div>
              </li>

              <li className="maison-card flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#B5893D] bg-[#F4EFE6] text-[#1E3A2F]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#1E3A2F]">
                    Salon Confirmation
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#495A52]">
                    Our salon administrator reviews and confirms your chair. Need to adjust plans? Cancel any pending request directly from your dashboard.
                  </p>
                </div>
              </li>

              <li className="maison-card flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#B5893D] bg-[#1E3A2F] text-[#E8CF9C]">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#1E3A2F]">
                    Verified Stripe Checkout
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#495A52]">
                    Once confirmed, Pay Now unlocks in My Appointments. Your payment status updates to Paid strictly after a verified Stripe webhook event.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="space-y-4 lg:col-span-6">
            <div className="maison-card overflow-hidden p-3">
              <div className="relative h-[320px] w-full overflow-hidden border border-[#E2D9C8] bg-[#EAE2D3] sm:h-[360px]">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85"
                  alt="SalonBook daylight studio interior and styling chairs"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 border border-[#E2D9C8] bg-[#F4EFE6] p-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B5893D]" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6D7B74]">
                      Visit the Salon
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#16261F]">{SALON_INFO.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#B5893D]" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6D7B74]">
                      Studio Hours
                    </p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-[#16261F]">
                      Mon–Fri · 09:00 AM – 08:00 PM
                    </p>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-[#495A52]">
                      Sat–Sun · 09:30 AM – 07:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
