import type { Fighter } from '@/entities/fighter';

/**
 * A fighter's overall power for battle purposes: the sum of every
 * characteristic currently on it - the six core battle stats, the folded-in
 * fields (height/weight/captureRate/baseHappiness), and any custom stats a
 * user assigned - not just the six battle stats `entities/fighter`'s
 * battleStatTotal uses for the catalog card's "СУММА" display. Deliberate
 * product choice: the design brief has the battle compare one user-chosen
 * stat per pair, but this app auto-picks a winner from all characteristics
 * at once instead (see README "Принятые решения").
 */
export function totalStatScore(fighter: Fighter): number {
  return Object.values(fighter.stats).reduce((sum, value) => sum + value, 0);
}
