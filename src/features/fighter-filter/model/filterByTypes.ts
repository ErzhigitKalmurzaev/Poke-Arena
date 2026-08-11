import type { Fighter } from '@/entities/fighter';

export function filterByTypes(fighters: Fighter[], selectedTypes: string[]): Fighter[] {
  if (selectedTypes.length === 0) return fighters;
  return fighters.filter((fighter) => fighter.types.some((type) => selectedTypes.includes(type)));
}
