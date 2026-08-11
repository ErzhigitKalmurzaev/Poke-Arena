import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { TOTAL_STAT_ID, fighterStatScore } from './statScore';

function fighter(stats: Record<string, number>): Fighter {
  return {
    id: 'f',
    name: 'f',
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

describe('fighterStatScore', () => {
  it('reads a single base stat', () => {
    expect(fighterStatScore(fighter({ hp: 10, attack: 55 }), 'attack')).toBe(55);
  });

  it('reads a custom stat the same way, since mergeFighter folded it into .stats', () => {
    expect(fighterStatScore(fighter({ hp: 10, харизма: 7 }), 'харизма')).toBe(7);
  });

  it('reads a folded-in field like weight', () => {
    expect(fighterStatScore(fighter({ hp: 10, weight: 690 }), 'weight')).toBe(690);
  });

  it('is 0 for a parameter this fighter has no value for', () => {
    expect(fighterStatScore(fighter({ hp: 10 }), 'харизма')).toBe(0);
  });

  it('sums every characteristic under TOTAL_STAT_ID', () => {
    expect(fighterStatScore(fighter({ hp: 10, attack: 5, харизма: 2 }), TOTAL_STAT_ID)).toBe(17);
  });

  it('does not treat the total pseudo-id as a lookup key', () => {
    // A fighter can't have a stat literally named __total, but if `stats`
    // somehow carried one it must not shadow the sum.
    expect(fighterStatScore(fighter({ hp: 10, [TOTAL_STAT_ID]: 999 }), TOTAL_STAT_ID)).toBe(1009);
  });
});
