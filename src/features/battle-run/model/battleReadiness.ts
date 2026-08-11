import { TEAM_SIZE, TEAM_SLOTS, type TeamsState } from '@/entities/team';

export interface BattleReadiness {
  ready: boolean;
  /** Present only when ready is false - what to show next to the disabled "Начать бой" button. */
  reason?: string;
}

/**
 * A battle only makes sense between two full 5-fighter rosters. Anything
 * short of that names which side(s) still need filling out, rather than
 * a generic "not ready" - that's what points the user back to team-builder.
 */
export function getBattleReadiness(teams: TeamsState): BattleReadiness {
  const short = TEAM_SLOTS.filter((slot) => teams[slot].fighterIds.length < TEAM_SIZE);
  if (short.length === 0) return { ready: true };

  const names = short.map((slot) => teams[slot].name).join(' и ');
  return { ready: false, reason: `Заполни состав до ${TEAM_SIZE}/${TEAM_SIZE}: ${names}` };
}
