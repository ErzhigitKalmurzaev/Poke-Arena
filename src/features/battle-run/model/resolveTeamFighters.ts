import type { Fighter } from '@/entities/fighter';

/**
 * Turns a team's stored fighter ids into actual Fighter objects. An id that
 * no longer resolves (a fighter dropped from the dataset since the team
 * was saved) is skipped rather than left as a hole in the lineup.
 */
export function resolveTeamFighters(fighterIds: string[], fightersById: Map<string, Fighter>): Fighter[] {
  return fighterIds.map((id) => fightersById.get(id)).filter((fighter): fighter is Fighter => fighter !== undefined);
}
