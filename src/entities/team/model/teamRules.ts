import type { TeamRow } from '@/shared/lib/db';
import { DEFAULT_TEAM_NAMES, TEAM_SIZE, TEAM_SLOTS, type TeamSlot } from './teamSlots';

export type TeamsState = Record<TeamSlot, TeamRow>;

export type AssignRejection = 'team-full' | 'already-assigned';
export type AssignResult = { ok: true; teams: TeamsState } | { ok: false; reason: AssignRejection };

/** Both teams as if nothing had ever been saved - the fallback whenever a slot has no row in Dexie yet. */
export function emptyTeams(): TeamsState {
  return {
    'team-a': { id: 'team-a', name: DEFAULT_TEAM_NAMES['team-a'], fighterIds: [] },
    'team-b': { id: 'team-b', name: DEFAULT_TEAM_NAMES['team-b'], fighterIds: [] },
  };
}

/**
 * A fighter can only stand on one side of the matchup at a time, so this
 * checks both teams for a collision, not just the target one. Rejects
 * instead of silently dropping the oldest member once a team is full.
 */
export function assignFighter(teams: TeamsState, slot: TeamSlot, fighterId: string): AssignResult {
  if (TEAM_SLOTS.some((s) => teams[s].fighterIds.includes(fighterId))) {
    return { ok: false, reason: 'already-assigned' };
  }
  if (teams[slot].fighterIds.length >= TEAM_SIZE) {
    return { ok: false, reason: 'team-full' };
  }
  return {
    ok: true,
    teams: { ...teams, [slot]: { ...teams[slot], fighterIds: [...teams[slot].fighterIds, fighterId] } },
  };
}

export function unassignFighter(teams: TeamsState, slot: TeamSlot, fighterId: string): TeamsState {
  return {
    ...teams,
    [slot]: { ...teams[slot], fighterIds: teams[slot].fighterIds.filter((id) => id !== fighterId) },
  };
}

export function renameTeam(teams: TeamsState, slot: TeamSlot, name: string): TeamsState {
  const trimmed = name.trim();
  return { ...teams, [slot]: { ...teams[slot], name: trimmed || DEFAULT_TEAM_NAMES[slot] } };
}

export function clearTeam(teams: TeamsState, slot: TeamSlot): TeamsState {
  return { ...teams, [slot]: emptyTeams()[slot] };
}
