import { describe, expect, it } from 'vitest';
import type { TeamsState } from '@/entities/team';
import { getBattleReadiness } from './battleReadiness';

function teams(aCount: number, bCount: number): TeamsState {
  return {
    'team-a': { id: 'team-a', name: 'Команда A', fighterIds: Array.from({ length: aCount }, (_, i) => `a${i}`) },
    'team-b': { id: 'team-b', name: 'Команда B', fighterIds: Array.from({ length: bCount }, (_, i) => `b${i}`) },
  };
}

describe('getBattleReadiness', () => {
  it('is ready once both teams have 5 fighters', () => {
    expect(getBattleReadiness(teams(5, 5))).toEqual({ ready: true });
  });

  it('names the short team in the reason', () => {
    const readiness = getBattleReadiness(teams(5, 3));
    expect(readiness.ready).toBe(false);
    expect(readiness.reason).toContain('Команда B');
    expect(readiness.reason).not.toContain('Команда A');
  });

  it('names both teams when both are short', () => {
    const readiness = getBattleReadiness(teams(2, 3));
    expect(readiness.reason).toContain('Команда A');
    expect(readiness.reason).toContain('Команда B');
  });
});
