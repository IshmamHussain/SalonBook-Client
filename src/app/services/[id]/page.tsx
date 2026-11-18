import React from 'react';
import { ServiceDetailsClient } from '@/components/services/ServiceDetailsClient';

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetailsClient serviceId={id} />;
}
