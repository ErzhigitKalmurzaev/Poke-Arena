'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const getSnapshot = () => navigator.onLine;

/**
 * Whether the browser currently has a network connection.
 *
 * `useSyncExternalStore` rather than state + an effect: the value is read
 * during render straight from `navigator.onLine`, so the first paint is already
 * correct instead of flashing "online" for a frame. The server snapshot is
 * `true` - a server has no client connectivity to report, and assuming online
 * keeps the notice out of the SSR output rather than hydrating it away.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
