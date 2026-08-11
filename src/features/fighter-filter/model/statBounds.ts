import { toComparableStats, type Fighter } from '@/entities/fighter';
import { staticFighters } from '@/shared/api/static-dataset';
import type { StatRange } from './filterByStatRange';

/**
 * Memoized because the answer can never change: it's derived purely from the
 * immutable build-time snapshot. Without this, rendering the filter sidebar
 * cost one full pass over all ~1300 records *per stat* (10+ passes, each
 * allocating a comparable-stats object per record) on every re-render -
 * including the ones auto-pagination fires while scrolling.
 */
const boundsCache = new Map<string, StatRange>();

/**
 * The real [min, max] for a stat across the whole static dataset, used to
 * bound a range-filter slider. Computed from the immutable snapshot (not
 * per-user Dexie overrides) so slider bounds stay stable regardless of any
 * one user's edits.
 */
export function statBounds(statId: string): StatRange {
  const cached = boundsCache.get(statId);
  if (cached) return cached;

  let min = Infinity;
  let max = -Infinity;
  for (const record of staticFighters) {
    const value = toComparableStats(record)[statId] ?? 0;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const bounds: StatRange = [min, max];
  boundsCache.set(statId, bounds);
  return bounds;
}

/**
 * Same idea as statBounds, but for a stat that has no place in the static
 * dataset - a custom stat only exists as sparse per-fighter values in Dexie,
 * so its slider bounds have to come from whatever fighters are already
 * loaded rather than the immutable snapshot. Missing values default to 0,
 * matching filterByStatRange's own fallback.
 */
export function statBoundsFromFighters(fighters: Fighter[], statId: string): StatRange {
  let min = Infinity;
  let max = -Infinity;
  for (const fighter of fighters) {
    const value = fighter.stats[statId] ?? 0;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return fighters.length > 0 ? [min, max] : [0, 0];
}
