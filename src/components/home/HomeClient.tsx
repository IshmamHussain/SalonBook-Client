'use client';

import { ArrowRight, ArrowUpRight, CalendarCheck2, CheckCircle2, CreditCard, Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/services/ServiceCard';
import type { AtelierMood } from '@/components/three/SalonAtelier3D';
import { ServiceGridSkeleton } from '@/components/ui/LoadingState';
import { apiRequest } from '@/lib/api';
import { CATEGORY_DESCRIPTIONS, SERVICE_CATEGORIES } from '@/lib/constants';
import type { CategorySummary, SalonService } from '@/types';

const HeroPortalCanvas = dynamic(() => import('@/components/three/HeroPortalCanvas'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 62% 54% at 74% 38%, rgba(224,138,94,0.34) 0%, rgba(42,67,89,0.42) 44%, rgba(11,15,20,0.98) 100%), #0B0F14',
      }}
    />
  ),
});

const SalonAtelier3D = dynamic(() => import('@/components/three/SalonAtelier3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] w-full items-center justify-center border border-white/15 bg-[#0E141C] font-mono text-xs uppercase tracking-[0.16em] text-[#7F92A4] sm:h-[400px]">
      Initializing 3D Studio...
    </div>
  ),
});

const HERO_FALLBACK_SERVICES = [
  { id: '', serviceName: 'Precision Architectural Cut', duration: 60, price: 85 },
  { id: '', serviceName: 'Dimensional Balayage', duration: 150, price: 210 },
  { id: '', serviceName: 'Sculpting Lymphatic Facial', duration: 75, price: 145 },
  { id: '', serviceName: 'Warm Basalt Restoration Spa', duration: 90, price: 160 },
];

export function HomeClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>(
    SERVICE_CATEGORIES.map((name) => ({ name, count: 0, minPrice: null }))
  );
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [atelierMood, setAtelierMood] = useState<AtelierMood>('copper');

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      setLoadingServices(true);
      setServicesError(null);
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          apiRequest<{ success: boolean; services: SalonService[] }>('/api/services?limit=6'),
          apiRequest<{ success: boolean; categories: CategorySummary[] }>('/api/services/categories'),
        ]);
        if (!active) return;
        setFeaturedServices(servicesRes.services || []);
        if (categoriesRes.categories?.length) {
          setCategories(categoriesRes.categories);
        }
      } catch (err) {
        if (!active) return;
        setServicesError(
          err instanceof Error
            ? err.message
            : 'Unable to load salon services right now. Check server connectivity.'
        );
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

  const heroStripItems =
    featuredServices.length >= 4 ? featuredServices.slice(0, 4) : HERO_FALLBACK_SERVICES;

  return (
    <div className="portal-grain">
      {/* Banner / Full-Bleed WebGL Living Light Portal */}
      <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-col justify-between overflow-hidden border-b border-white/12">
        {/* Salon-themed ambient studio image blended into obsidian void */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <HeroPortalCanvas />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <h1 className="font-display text-5xl font-extrabold leading-[0.94] tracking-[-0.04em] text-[#F4F6F8] sm:text-7xl lg:text-[5.5rem]">
              Light, hair &amp; stillness.
            </h1>

            <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
              <p className="text-base leading-relaxed text-[#D0DCE7] sm:text-lg lg:col-span-6">
                Explore curated hair, skincare, and restorative spa services with clear timing and transparent pricing. Request a conflict-free appointment online and pay via Stripe once confirmed.
              </p>

              <form
                onSubmit={handleHeroSearch}
                className="flex flex-col border border-white/22 bg-[#0B0F14]/78 backdrop-blur-md sm:flex-row lg:col-span-6"
                role="search"
                aria-label="Search salon services"
              >
                <label htmlFor="hero-service-search" className="sr-only">
                  Search salon services by name
                </label>
                <div className="relative flex flex-1 items-center">
                  <Search className="pointer-events-none ml-4 h-4 w-4 text-[#8DB4D4]" aria-hidden="true" />
                  <input
                    id="hero-service-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search haircuts, balayage, facials..."
                    className="w-full bg-transparent px-3 py-4 text-sm text-[#F4F6F8] placeholder:text-[#8E9FAD] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 bg-[#E08A5E] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#0B0F14] transition-colors hover:bg-[#F0A076]"
                >
                  Explore Salon Services
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Opening Viewport Flagship Strip */}
          <div className="mt-14 grid grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {heroStripItems.map((item, idx) => {
              const target = item.id ? `/services/${item.id}` : '/services';
              return (
                <Link
                  key={`${item.serviceName}-${idx}`}
                  href={target}
                  className="group flex flex-col justify-between border border-white/14 bg-[#0B0F14]/65 p-4 backdrop-blur-md transition-colors hover:border-[#E08A5E]/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-base font-semibold leading-snug text-[#F4F6F8] group-hover:text-[#F0A076]">
                      {item.serviceName}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8DB4D4] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#E08A5E]" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-mono text-xs tabular-nums text-[#E08A5E]">
                    {item.duration} MIN · ${Number(item.price).toFixed(0)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Section 1: Featured Salon Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-white/12 pb-8 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8] sm:text-5xl">
              Featured Salon Services
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#B4C2CF] sm:text-base">
              Active studio treatments ready for online booking—each with clear duration, pricing, and dedicated specialist care.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex w-fit items-center gap-2 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#F4F6F8] transition-colors hover:border-[#E08A5E] hover:text-[#E08A5E]"
          >
            View All Services
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10">
          {loadingServices ? (
            <ServiceGridSkeleton count={6} />
          ) : servicesError ? (
            <div className="atelier-surface p-8 text-center">
              <p className="text-sm text-rose-300">{servicesError}</p>
              <p className="mt-2 text-xs text-[#B4C2CF]">
                Make sure the SalonBook Express server is running and seeded with active services.
              </p>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="atelier-surface p-10 text-center">
              <p className="font-display text-xl font-bold text-[#F4F6F8]">No active services published yet</p>
              <p className="mt-2 text-sm text-[#B4C2CF]">
                Sign in as an administrator or run <code className="font-mono text-[#E08A5E]">npm run seed</code> on the server to populate services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Section 2: Salon Service Categories */}
      <section className="border-y border-white/12 bg-[#0E141C]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8] sm:text-5xl">
                Salon Service Categories
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#B4C2CF] sm:text-base">
                Explore seven focused salon disciplines and filter active treatments immediately by category.
              </p>
            </div>
            <Link
              href="/services"
              className="font-mono text-xs uppercase tracking-[0.14em] text-[#E08A5E] hover:underline"
            >
              Browse Full Catalog &rarr;
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name}
                href={`/services?category=${encodeURIComponent(cat.name)}`}
                className={`atelier-surface atelier-surface-hover group flex flex-col justify-between p-6 ${
                  idx === 0 ? 'sm:col-span-2 bg-[#14202D]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-[#F4F6F8] group-hover:text-[#F0A076]">
                    {cat.name}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8DB4D4] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#E08A5E]" aria-hidden="true" />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#B4C2CF]">
                  {CATEGORY_DESCRIPTIONS[cat.name] || 'Curated studio treatments tailored to your schedule.'}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs tabular-nums">
                  <span className="text-[#8DB4D4]">
                    {cat.count} {cat.count === 1 ? 'Active Service' : 'Active Services'}
                  </span>
                  {cat.minPrice !== null && (
                    <span className="text-[#E08A5E]">From ${Number(cat.minPrice).toFixed(0)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Custom Section: Interactive 3D Salon Atelier & The 3-Step Booking Ritual */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-[#F4F6F8] sm:text-5xl">
              How Booking &amp; Payment Work at SalonBook
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#B4C2CF]">
              No surprise charges before your chair is reserved. Every booking follows a clear three-stage salon ritual verified end-to-end on the server.
            </p>

            <ol className="mt-8 space-y-5">
              <li className="atelier-surface flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#E08A5E]/40 bg-[#E08A5E]/12 text-[#E08A5E]">
                  <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#F4F6F8]">
                    Request Your Open Time Slot
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#B4C2CF]">
                    Pick any active service, choose your preferred date and available slot, and add styling notes. Duplicate active slots are blocked automatically.
                  </p>
                </div>
              </li>

              <li className="atelier-surface flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#8DB4D4]/40 bg-[#8DB4D4]/12 text-[#8DB4D4]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#F4F6F8]">
                    Studio Review &amp; Confirmation
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#B4C2CF]">
                    The salon administrator reviews your request and confirms chair availability. Cancel pending requests anytime directly from your dashboard.
                  </p>
                </div>
              </li>

              <li className="atelier-surface flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-teal-400/40 bg-teal-400/12 text-teal-300">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#F4F6F8]">
                    Pay Securely via Verified Stripe Checkout
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#B4C2CF]">
                    Once confirmed, unlock Pay Now in your dashboard. Payment status transitions to Paid strictly upon cryptographic Stripe webhook confirmation.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="space-y-4 lg:col-span-6">
            <SalonAtelier3D mood={atelierMood} />

            <div className="atelier-surface flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5 text-sm text-[#D0DCE7]">
                <Sparkles className="h-4 w-4 text-[#E08A5E]" aria-hidden="true" />
                <span>Studio Lighting Atmosphere</span>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select 3D studio lighting atmosphere">
                {(
                  [
                    { id: 'copper', label: 'Copper Hour' },
                    { id: 'mist', label: 'Daylight Mist' },
                    { id: 'evening', label: 'Evening Calm' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAtelierMood(option.id)}
                    aria-pressed={atelierMood === option.id}
                    className={`cursor-pointer border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                      atelierMood === option.id
                        ? 'border-[#E08A5E] bg-[#E08A5E] font-semibold text-[#0B0F14]'
                        : 'border-white/15 bg-transparent text-[#B4C2CF] hover:border-white/35 hover:text-[#F4F6F8]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
