import { describe, expect, it } from 'vitest';
import { assignFighter, clearTeam, emptyTeams, renameTeam, unassignFighter } from './teamRules';
import { TEAM_SIZE } from './teamSlots';

describe('assignFighter', () => {
  it('adds the fighter to the target team', () => {
    const result = assignFighter(emptyTeams(), 'team-a', 'pikachu');
    expect(result).toEqual({ ok: true, teams: expect.anything() });
    if (result.ok) expect(result.teams['team-a'].fighterIds).toEqual(['pikachu']);
  });

  it('rejects once the target team already has 5 fighters', () => {
    let teams = emptyTeams();
    for (let i = 0; i < TEAM_SIZE; i += 1) {
      const result = assignFighter(teams, 'team-a', `fighter-${i}`);
      if (!result.ok) throw new Error('expected ok');
      teams = result.teams;
    }
    expect(assignFighter(teams, 'team-a', 'one-too-many')).toEqual({ ok: false, reason: 'team-full' });
  });

  it('rejects a fighter already on the same team', () => {
    const result = assignFighter(emptyTeams(), 'team-a', 'pikachu');
    if (!result.ok) throw new Error('expected ok');
    expect(assignFighter(result.teams, 'team-a', 'pikachu')).toEqual({ ok: false, reason: 'already-assigned' });
  });

  it('rejects a fighter already on the other team', () => {
    const result = assignFighter(emptyTeams(), 'team-a', 'pikachu');
    if (!result.ok) throw new Error('expected ok');
    expect(assignFighter(result.teams, 'team-b', 'pikachu')).toEqual({ ok: false, reason: 'already-assigned' });
  });
});

describe('unassignFighter', () => {
  it('removes the fighter from that team only', () => {
    let teams = emptyTeams();
    teams = (assignFighter(teams, 'team-a', 'pikachu') as { ok: true; teams: typeof teams }).teams;
    teams = (assignFighter(teams, 'team-b', 'bulbasaur') as { ok: true; teams: typeof teams }).teams;

    const next = unassignFighter(teams, 'team-a', 'pikachu');
    expect(next['team-a'].fighterIds).toEqual([]);
    expect(next['team-b'].fighterIds).toEqual(['bulbasaur']);
  });
});

describe('renameTeam', () => {
  it('trims the new name', () => {
    expect(renameTeam(emptyTeams(), 'team-a', '  Гром  ')['team-a'].name).toBe('Гром');
  });

  it('falls back to the default name when the trimmed input is empty', () => {
    expect(renameTeam(emptyTeams(), 'team-a', '   ')['team-a'].name).toBe('Команда A');
  });
});

describe('clearTeam', () => {
  it('empties one team without touching the other', () => {
    let teams = emptyTeams();
    teams = (assignFighter(teams, 'team-a', 'pikachu') as { ok: true; teams: typeof teams }).teams;
    teams = (assignFighter(teams, 'team-b', 'bulbasaur') as { ok: true; teams: typeof teams }).teams;

    const next = clearTeam(teams, 'team-a');
    expect(next['team-a'].fighterIds).toEqual([]);
    expect(next['team-b'].fighterIds).toEqual(['bulbasaur']);
  });
});
