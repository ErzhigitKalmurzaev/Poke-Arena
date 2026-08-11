import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { statBounds, statBoundsFromFighters } from './statBounds';

describe('statBounds', () => {
  it('returns a sensible [min, max] for a base battle stat', () => {
    const [min, max] = statBounds('speed');
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeGreaterThan(min);
  });

  it('returns a sensible [min, max] for a folded-in field like height', () => {
    const [min, max] = statBounds('height');
    expect(min).toBeGreaterThan(0);
    expect(max).toBeGreaterThan(min);
  });

  it('returns [0, 0] for an unknown stat id rather than throwing', () => {
    expect(statBounds('does-not-exist')).toEqual([0, 0]);
  });
});

function fighter(id: string, stats: Record<string, number>): Fighter {
  return {
    id,
    name: id,
    description: '',
    types: [],
    stats,
    sprite: '',
    shinySprite: null,
    cryUrl: null,
    isLegendary: false,
    isMythical: false,
    isEdited: false,
  };
}

describe('statBoundsFromFighters', () => {
  it('returns [min, max] for a custom stat across the given fighters', () => {
    const fighters = [fighter('1', { charisma: 3 }), fighter('2', { charisma: 9 })];
    expect(statBoundsFromFighters(fighters, 'charisma')).toEqual([3, 9]);
  });

  it('treats a missing value as 0', () => {
    const fighters = [fighter('1', { charisma: 5 }), fighter('2', {})];
    expect(statBoundsFromFighters(fighters, 'charisma')).toEqual([0, 5]);
  });

  it('returns [0, 0] when there are no fighters', () => {
    expect(statBoundsFromFighters([], 'charisma')).toEqual([0, 0]);
  });
});
