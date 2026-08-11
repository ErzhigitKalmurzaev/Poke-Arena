import type { StaticFighterRecord } from '@/shared/api/static-dataset';

/**
 * height/weight/captureRate/baseHappiness live as their own typed fields on
 * the static record, not inside `stats` - folding them in here (rather than
 * in the static type) is what makes them comparable via mergeFighter/
 * statRegistry without the static dataset itself having to know "these are
 * stats". Shared by fighterRepository (building a Fighter) and anything
 * that needs stat bounds/values straight from the static snapshot (e.g. a
 * range filter's slider bounds) without going through Dexie.
 */
export function toComparableStats(record: StaticFighterRecord): Record<string, number> {
  return {
    ...record.stats,
    height: record.height,
    weight: record.weight,
    captureRate: record.captureRate,
    baseHappiness: record.baseHappiness,
  };
}
