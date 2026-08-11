'use client';

import { useDeferredValue, useMemo } from 'react';
import { searchFighterIds } from '@/shared/lib/search-index';

interface FighterSearchResult {
  matchedIds: Set<string>;
  /** True while the index is still searching the previous, stale query - lets the UI show typing as instant while results lag a frame behind on the full dataset. */
  isPending: boolean;
}

export function useFighterSearch(query: string): FighterSearchResult {
  const deferredQuery = useDeferredValue(query);
  const matchedIds = useMemo(() => new Set(searchFighterIds(deferredQuery)), [deferredQuery]);

  return { matchedIds, isPending: query !== deferredQuery };
}
