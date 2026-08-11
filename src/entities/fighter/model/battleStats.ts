// The six core PokeAPI battle stats, in display order. Kept local to the
// fighter entity (rather than pulled from entities/stat's registry) so
// presentational fighter UI doesn't need a cross-slice entities import.
export const BATTLE_STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const;

export function battleStatTotal(stats: Record<string, number>): number {
  return BATTLE_STAT_KEYS.reduce((sum, key) => sum + (stats[key] ?? 0), 0);
}
