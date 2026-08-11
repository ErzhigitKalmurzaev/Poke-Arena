import { db } from '@/shared/lib/db';
import { BASE_STAT_REGISTRY } from '../model/statRegistry';
import type { StatDefinition } from '../model/types';

/**
 * The base registry plus every custom stat a user has created, as one flat
 * list - team comparison and any other "list every stat" UI reads this
 * instead of BASE_STAT_REGISTRY directly, so it doesn't need its own
 * branch for source: 'custom'.
 */
export async function getStatRegistry(): Promise<StatDefinition[]> {
  const customStats = await db.customStats.toArray();
  const custom: StatDefinition[] = customStats.map((row) => ({
    id: row.id,
    label: row.label,
    source: 'custom',
    unit: row.unit,
  }));
  return [...BASE_STAT_REGISTRY, ...custom];
}
