import { toComparableStats } from '@/entities/fighter';
import { staticFighters } from '@/shared/api/static-dataset';
import type { StatRange } from './filterByStatRange';

/**
 * The real [min, max] for a stat across the whole static dataset, used to
 * bound a range-filter slider. Computed from the immutable snapshot (not
 * per-user Dexie overrides) so slider bounds stay stable regardless of any
 * one user's edits.
 */
export function statBounds(statId: string): StatRange {
  let min = Infinity;
  let max = -Infinity;
  for (const record of staticFighters) {
    const value = toComparableStats(record)[statId] ?? 0;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
}
