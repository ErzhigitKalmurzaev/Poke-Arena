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
 *
 * The defaults below all follow from the same fact: every `queryFn` in this
 * app reads IndexedDB or the bundled dataset, never the network.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /*
             * Without this, Query's default `networkMode: 'online'` parks every
             * query in `fetchStatus: 'paused'` the moment the browser reports
             * itself offline - and since a paused query is pending but not
             * fetching, the catalog would sit on an empty state instead of the
             * roster it already has on disk. Nothing here needs the network, so
             * connectivity must not gate it.
             */
            networkMode: 'always',
            /*
             * A local read either works or is genuinely broken (Dexie blocked,
             * private-mode storage denied). Three backed-off retries would only
             * delay the error state by seconds; one covers a transient
             * transaction abort.
             */
            retry: 1,
            // Refetching a local snapshot on every tab focus buys nothing and
            // re-renders every subscriber; mutations invalidate explicitly.
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
