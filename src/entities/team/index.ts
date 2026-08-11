export type { AssignRejection, AssignResult, TeamsState } from './model/teamRules';
export { assignFighter, clearTeam, emptyTeams, renameTeam, unassignFighter } from './model/teamRules';
export { DEFAULT_TEAM_NAMES, SLOT_LETTER, TEAM_SIZE, TEAM_SLOTS, type TeamSlot } from './model/teamSlots';
export {
  assignFighterToTeam,
  clearTeamSlot,
  getTeams,
  renameTeamSlot,
  unassignFighterFromTeam,
} from './api/teamRepository';
