import type { Fighter } from '@/entities/fighter';

export type StatRange = [min: number, max: number];

export function filterByStatRange(fighters: Fighter[], statId: string, range: StatRange): Fighter[] {
  const [min, max] = range;
  return fighters.filter((fighter) => {
    const value = fighter.stats[statId] ?? 0;
    return value >= min && value <= max;
  });
}
