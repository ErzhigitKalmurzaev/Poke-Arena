export const TEAM_SIZE = 5;

export const TEAM_SLOTS = ['team-a', 'team-b'] as const;
export type TeamSlot = (typeof TEAM_SLOTS)[number];

export const DEFAULT_TEAM_NAMES: Record<TeamSlot, string> = {
  'team-a': 'Команда A',
  'team-b': 'Команда B',
};

/** Short label for a compact "add to this side" control - the picker has no room for a full team name. */
export const SLOT_LETTER: Record<TeamSlot, string> = {
  'team-a': 'A',
  'team-b': 'B',
};
