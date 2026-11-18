import React, { Suspense } from 'react';
import { BrowseServicesClient } from '@/components/services/BrowseServicesClient';
import { ServiceGridSkeleton } from '@/components/ui/LoadingState';

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <ServiceGridSkeleton count={6} />
        </div>
      }
    >
      <BrowseServicesClient />
    </Suspense>
  );
}
