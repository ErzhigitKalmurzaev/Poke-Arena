'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState } from 'react';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * App-wide client providers, composed once here so app/layout.tsx stays a
 * thin Next.js routing file. One QueryClient per browser session (useState
 * so it survives re-renders but isn't shared across users on the server).
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
