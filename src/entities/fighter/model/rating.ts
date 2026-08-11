import { staticFighters } from '@/shared/api/static-dataset';
import { battleStatTotal } from './battleStats';

/** Football-card scale: an elite fighter reads 99. */
const RATING_CEILING = 99;
/** Nothing shows a 0 - a card with no rating on it looks broken, not weak. */
const RATING_FLOOR = 1;

/**
 * Where "elite" is drawn. Deliberately NOT the dataset's maximum: one freak
 * form carries a stat total of 1125 against a 780 top for everything else, and
 * scaling against it drags the whole roster into the 15-60 band - every card
 * then reads as mediocre. Anchoring at the 99th percentile keeps the scale
 * spread across its full range; the handful above it simply cap out, the same
 * way a football card tops out at 99.
 */
const ELITE_PERCENTILE = 0.99;

const RATING_REFERENCE = (() => {
  const totals = staticFighters.map((record) => battleStatTotal(record.stats)).sort((a, b) => a - b);
  return totals[Math.floor(totals.length * ELITE_PERCENTILE)] || 1;
})();

/**
 * A fighter's overall, the way a football card carries one: his average battle
 * stat measured against an elite average. Dividing the totals is the same
 * ratio as dividing the averages, and it keeps the number two digits wide -
 * which is what makes it work as a headline figure.
 *
 * Scoped to the six battle stats (via battleStatTotal), NOT every key on
 * `stats`: a merged Fighter also carries height/weight/captureRate and any
 * custom stats, and weight alone reaches ~10000, so averaging the lot would
 * rate fighters by how heavy they are.
 *
 * The reference comes from the immutable snapshot, so editing one fighter
 * can't shift everyone else's rating - the same reason stat-filter bounds
 * don't move.
 */
export function fighterRating(stats: Record<string, number>): number {
  const rating = Math.round((battleStatTotal(stats) / RATING_REFERENCE) * RATING_CEILING);
  return Math.min(RATING_CEILING, Math.max(RATING_FLOOR, rating));
}
