import type { Fighter } from '@/entities/fighter';
import { BASE_STAT_REGISTRY } from '@/entities/stat';
import { db, type OverrideRow } from '@/shared/lib/db';

export interface FighterEditValues {
  name: string;
  description: string;
  stats: Record<string, number>;
}

export function toEditValues(fighter: Fighter): FighterEditValues {
  const stats: Record<string, number> = {};
  for (const stat of BASE_STAT_REGISTRY) {
    stats[stat.id] = fighter.stats[stat.id] ?? 0;
  }
  return { name: fighter.name, description: fighter.description, stats };
}

/**
 * Diffs against `pristine` (the no-override baseline, see
 * entities/fighter's getBaseFighterById) rather than whatever the form
 * started with. Diffing against the current (possibly already-overridden)
 * state instead would risk the resulting `.put()` silently dropping a
 * previously-saved field that this save didn't touch. Returns null when
 * nothing actually differs from pristine, i.e. the override should be
 * deleted rather than written.
 */
export function buildOverridePayload(
  fighterId: string,
  values: FighterEditValues,
  pristine: FighterEditValues,
): OverrideRow | null {
  const override: OverrideRow = { fighterId };

  if (values.name !== pristine.name) override.name = values.name;
  if (values.description !== pristine.description) override.description = values.description;

  const changedStats: Record<string, number> = {};
  for (const [statId, value] of Object.entries(values.stats)) {
    if (value !== pristine.stats[statId]) changedStats[statId] = value;
  }
  if (Object.keys(changedStats).length > 0) override.stats = changedStats;

  const hasChanges = override.name !== undefined || override.description !== undefined || override.stats !== undefined;
  return hasChanges ? override : null;
}

export async function saveFighterOverride(
  fighterId: string,
  values: FighterEditValues,
  pristine: FighterEditValues,
): Promise<void> {
  const payload = buildOverridePayload(fighterId, values, pristine);
  if (payload) {
    await db.overrides.put(payload);
  } else {
    await db.overrides.delete(fighterId);
  }
}

/** Reset = delete the override row. The original PokeAPI snapshot was
 * never touched, so there's nothing to "restore" - just stop shadowing it. */
export async function resetFighterOverride(fighterId: string): Promise<void> {
  await db.overrides.delete(fighterId);
}
