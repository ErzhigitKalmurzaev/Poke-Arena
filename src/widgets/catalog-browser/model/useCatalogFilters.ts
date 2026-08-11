'use client';

import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import { parseAsStatRanges } from './statRangesParser';

/**
 * Search + filter state lives in the URL (nuqs), not component state - a
 * reload or a shared link reproduces the exact same catalog view.
 */
export function useCatalogFilters() {
  return useQueryStates({
    q: parseAsString.withDefault(''),
    types: parseAsArrayOf(parseAsString).withDefault([]),
    legendary: parseAsBoolean.withDefault(false),
    ranges: parseAsStatRanges,
  });
}
