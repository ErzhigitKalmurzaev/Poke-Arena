import type { Fighter } from '@/entities/fighter';

export function filterByLegendary(fighters: Fighter[], onlyLegendary: boolean): Fighter[] {
  if (!onlyLegendary) return fighters;
  return fighters.filter((fighter) => fighter.isLegendary || fighter.isMythical);
}
