import type { Fighter } from '@/entities/fighter';
import { totalStatScore } from './totalStatScore';

/**
 * The "compare by everything at once" option, as a stat id. Not a real key on
 * `fighter.stats` - the double underscore keeps it from ever colliding with a
 * base stat or a user-created custom one (those are slugified from a label, so
 * they can never start with `__`).
 */
export const TOTAL_STAT_ID = '__total';

/**
 * The one number a duel compares for a fighter, under the chosen comparison
 * parameter.
 *
 * Base stats, folded-in fields (height/weight/...) and custom stats all live
 * side by side in `fighter.stats` by the time mergeFighter is done, so a
 * custom parameter is compared exactly like a base one - no branch on
 * source. A fighter with no value for the parameter (a custom stat never
 * assigned to him) scores 0 rather than being skipped: he still has to show
 * up in his slot, and losing it is the honest outcome of having no value.
 */
export function fighterStatScore(fighter: Fighter, statId: string): number {
  if (statId === TOTAL_STAT_ID) return totalStatScore(fighter);
  return fighter.stats[statId] ?? 0;
}
