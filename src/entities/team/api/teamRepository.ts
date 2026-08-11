import { db } from '@/shared/lib/db';
import {
  assignFighter as assignFighterInState,
  clearTeam as clearTeamInState,
  emptyTeams,
  renameTeam as renameTeamInState,
  unassignFighter as unassignFighterInState,
  type AssignResult,
  type TeamsState,
} from '../model/teamRules';
import { TEAM_SLOTS, type TeamSlot } from '../model/teamSlots';

/** Both team rows, defaulting whichever side has never been saved to Dexie yet. */
export async function getTeams(): Promise<TeamsState> {
  const rows = await db.teams.bulkGet([...TEAM_SLOTS]);
  const defaults = emptyTeams();
  const teams = {} as TeamsState;
  TEAM_SLOTS.forEach((slot, i) => {
    teams[slot] = rows[i] ?? defaults[slot];
  });
  return teams;
}

export async function assignFighterToTeam(slot: TeamSlot, fighterId: string): Promise<AssignResult> {
  const teams = await getTeams();
  const result = assignFighterInState(teams, slot, fighterId);
  if (result.ok) await db.teams.put(result.teams[slot]);
  return result;
}

export async function unassignFighterFromTeam(slot: TeamSlot, fighterId: string): Promise<void> {
  const teams = await getTeams();
  await db.teams.put(unassignFighterInState(teams, slot, fighterId)[slot]);
}

export async function renameTeamSlot(slot: TeamSlot, name: string): Promise<void> {
  const teams = await getTeams();
  await db.teams.put(renameTeamInState(teams, slot, name)[slot]);
}

export async function clearTeamSlot(slot: TeamSlot): Promise<void> {
  const teams = await getTeams();
  await db.teams.put(clearTeamInState(teams, slot)[slot]);
}
