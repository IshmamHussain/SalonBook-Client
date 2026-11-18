'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ServiceForm } from '@/components/dashboard/ServiceForm';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { apiRequest } from '@/lib/api';
import type { SalonService } from '@/types';

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const serviceId = params?.id;

  const [service, setService] = useState<SalonService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let active = true;
    async function load() {
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
        setError(err instanceof Error ? err.message : 'Unable to load service for editing.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [serviceId]);

  if (loading) return <LoadingSpinner label="Loading service details..." />;

  if (error || !service) {
    return (
      <div className="maison-card p-8 text-center text-sm text-rose-800">
        {error || 'Salon service not found.'}
      </div>
    );
  }

  return <ServiceForm mode="edit" initialService={service} />;
}
