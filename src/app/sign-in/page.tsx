import React, { Suspense } from 'react';
import { SignInClient } from '@/components/auth/SignInClient';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Preparing Sign In..." />}>
      <SignInClient />
    </Suspense>
  );
}
