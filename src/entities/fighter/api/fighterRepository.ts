import { db } from '@/shared/lib/db';
import { staticFighters, type StaticFighterRecord } from '@/shared/api/static-dataset';
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
    // height/weight/captureRate/baseHappiness live as their own typed
    // fields on the static record, not inside `stats` - folding them in
    // here (rather than in the static type) is what makes them
    // comparable via mergeFighter/statRegistry without the static
    // dataset itself having to know "these are stats".
    stats: {
      ...record.stats,
      height: record.height,
      weight: record.weight,
      captureRate: record.captureRate,
      baseHappiness: record.baseHappiness,
    },
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

export async function getFighterById(id: string): Promise<Fighter | null> {
  const base = baseFightersById.get(id);
  if (!base) return null;

  const [override, customValues] = await Promise.all([
    db.overrides.get(id),
    db.customStatValues.where('fighterId').equals(id).toArray(),
  ]);
  const customStats = Object.fromEntries(customValues.map((value) => [value.statId, value.value]));

  return mergeFighter(base, override, customStats);
}
