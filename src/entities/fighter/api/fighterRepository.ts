import { db } from '@/shared/lib/db';
import { staticFighters, type StaticFighterRecord } from '@/shared/api/static-dataset';
import { toComparableStats } from '../model/comparableStats';
import { mergeFighter, type BaseFighter } from '../model/merge';
import type { Fighter } from '../model/types';

function toBaseFighter(record: StaticFighterRecord): BaseFighter {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    types: record.types,
    sprite: record.sprite ?? '',
    shinySprite: record.shinySprite,
    cryUrl: record.cryUrl,
    isLegendary: record.isLegendary,
    isMythical: record.isMythical,
    stats: toComparableStats(record),
  };
}

const baseFightersById = new Map(staticFighters.map((record) => [record.id, toBaseFighter(record)]));

async function loadCustomStatsByFighter(): Promise<Map<string, Record<string, number>>> {
  const customValues = await db.customStatValues.toArray();
  const byFighter = new Map<string, Record<string, number>>();
  for (const value of customValues) {
    const bucket = byFighter.get(value.fighterId) ?? {};
    bucket[value.statId] = value.value;
    byFighter.set(value.fighterId, bucket);
  }
  return byFighter;
}

export async function getAllFighters(): Promise<Fighter[]> {
  const [overrides, customStatsByFighter] = await Promise.all([
    db.overrides.toArray(),
    loadCustomStatsByFighter(),
  ]);
  const overrideByFighter = new Map(overrides.map((override) => [override.fighterId, override]));

  return staticFighters.map((record) => {
    const base = toBaseFighter(record);
    return mergeFighter(base, overrideByFighter.get(base.id), customStatsByFighter.get(base.id) ?? {});
  });
}

async function loadCustomStatsFor(id: string): Promise<Record<string, number>> {
  const customValues = await db.customStatValues.where('fighterId').equals(id).toArray();
  return Object.fromEntries(customValues.map((value) => [value.statId, value.value]));
}

export async function getFighterById(id: string): Promise<Fighter | null> {
  const base = baseFightersById.get(id);
  if (!base) return null;

  const [override, customStats] = await Promise.all([db.overrides.get(id), loadCustomStatsFor(id)]);

  return mergeFighter(base, override, customStats);
}

/**
 * The fighter as it would be with no user override at all - custom stats
 * still apply (resetting an override doesn't touch those), but name/
 * description/stats fall back to the immutable PokeAPI snapshot. Used to
 * diff a submitted edit against the true baseline rather than against
 * whatever override already existed, so re-saving after a previous edit
 * doesn't silently drop fields the user isn't touching this time.
 */
export async function getBaseFighterById(id: string): Promise<Fighter | null> {
  const base = baseFightersById.get(id);
  if (!base) return null;

  const customStats = await loadCustomStatsFor(id);
  return mergeFighter(base, undefined, customStats);
}
