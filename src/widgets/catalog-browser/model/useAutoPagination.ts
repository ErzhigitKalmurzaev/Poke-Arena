'use client';

import { useEffect, useRef, useState } from 'react';

export const CATALOG_PAGE_SIZE = 48;

interface AutoPagination {
  /** How many items the grid should render right now. */
  visibleCount: number;
  /** Attach to an element after the grid; scrolling it into view loads the next page. */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
}

/**
 * Infinite-scroll paging over an already-filtered list. Replaces the previous
 * row virtualizer: the grid is now a plain CSS grid (real gap-x/gap-y, page
 * scroll instead of a nested scroll box), and the DOM stays small because
 * only loaded pages exist - not because rows are recycled.
 *
 * `resetKey` should change whenever the underlying list changes (a new
 * search/filter), so paging restarts from the top instead of keeping the
 * previous scroll depth against a different result set.
 */
export function useAutoPagination(totalCount: number, resetKey: string): AutoPagination {
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);

  // React's sanctioned "adjust state when a prop changes" pattern - comparing
  // against state (not a ref) so it stays legal during render.
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setVisibleCount(CATALOG_PAGE_SIZE);
  }

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) => Math.min(current + CATALOG_PAGE_SIZE, totalCount));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // visibleCount is a dependency on purpose: an IntersectionObserver only
    // fires on a *change* in intersection, so if the sentinel is still in
    // view after a page loads it would never fire again. Re-creating the
    // observer re-reports the current state, continuing until the sentinel is
    // pushed out of the root margin.
  }, [hasMore, visibleCount, totalCount]);

  return { visibleCount, sentinelRef, hasMore };
}
