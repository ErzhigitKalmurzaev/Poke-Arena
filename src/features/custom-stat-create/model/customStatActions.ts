import { BASE_STAT_REGISTRY } from '@/entities/stat';
import { db, type CustomStatRow } from '@/shared/lib/db';
import { uniqueStatId } from './statId';

const RESERVED_IDS = new Set(BASE_STAT_REGISTRY.map((stat) => stat.id));

async function isStatIdTaken(id: string): Promise<boolean> {
  if (RESERVED_IDS.has(id)) return true;
  return (await db.customStats.get(id)) !== undefined;
}

/**
 * Never collides with a base stat id: a custom stat layers on top of
 * `stats` at merge time (see mergeFighter), so a same-named custom stat
 * would silently shadow the real one in every comparison.
 */
export async function createCustomStat(label: string, unit?: string): Promise<CustomStatRow> {
  const id = await uniqueStatId(label, isStatIdTaken);
  const row: CustomStatRow = { id, label: label.trim() };
  const trimmedUnit = unit?.trim();
  if (trimmedUnit) row.unit = trimmedUnit;

  await db.customStats.put(row);
  return row;
}

export async function setCustomStatValue(fighterId: string, statId: string, value: number): Promise<void> {
  await db.customStatValues.put({ fighterId, statId, value });
}

/**
 * Drops this fighter's value for a custom stat. The stat definition itself
 * survives - it may be assigned to other fighters, and it stays available to
 * assign again here.
 */
export async function removeCustomStatValue(fighterId: string, statId: string): Promise<void> {
  await db.customStatValues.delete([fighterId, statId]);
}

export async function getCustomStats(): Promise<CustomStatRow[]> {
  return db.customStats.toArray();
}

export async function getCustomStatValuesForFighter(fighterId: string) {
  return db.customStatValues.where('fighterId').equals(fighterId).toArray();
}
