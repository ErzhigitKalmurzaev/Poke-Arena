import type { Fighter } from '@/entities/fighter';

export function filterBySearch(fighters: Fighter[], matchedIds: Set<string>): Fighter[] {
  return fighters.filter((fighter) => matchedIds.has(fighter.id));
}
