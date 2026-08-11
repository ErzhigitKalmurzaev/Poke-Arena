import { staticFighters } from '@/shared/api/static-dataset';

// The six core PokeAPI battle stats, in display order. Kept local to the
// fighter entity (rather than pulled from entities/stat's registry) so
// presentational fighter UI doesn't need a cross-slice entities import.
export const BATTLE_STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const;

export type BattleStatKey = (typeof BATTLE_STAT_KEYS)[number];

/** Full Russian labels. Short forms for cramped card grids live at the point of use. */
export const BATTLE_STAT_LABEL: Record<BattleStatKey, string> = {
  hp: 'HP',
  attack: 'АТАКА',
  defense: 'ЗАЩИТА',
  'special-attack': 'СП.АТАКА',
  'special-defense': 'СП.ЗАЩИТА',
  speed: 'СКОРОСТЬ',
};

export function battleStatTotal(stats: Record<string, number>): number {
  return BATTLE_STAT_KEYS.reduce((sum, key) => sum + (stats[key] ?? 0), 0);
}

/**
 * The strongest battle-stat total in the dataset, so a card can show a
 * fighter's total as a share of the real ceiling instead of against an
 * invented round number. One pass over the immutable snapshot at module load;
 * user edits deliberately don't move it, for the same reason stat-filter
 * bounds don't - the scale would otherwise shift for everyone who edits.
 */
export const MAX_BATTLE_STAT_TOTAL = staticFighters.reduce(
  (max, record) => Math.max(max, battleStatTotal(record.stats)),
  0,
);
