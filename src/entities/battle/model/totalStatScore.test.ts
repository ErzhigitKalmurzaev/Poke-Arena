import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { totalStatScore } from './totalStatScore';

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

describe('totalStatScore', () => {
  it('sums the six core battle stats', () => {
    expect(totalStatScore(fighter({ hp: 10, attack: 5, defense: 5, 'special-attack': 5, 'special-defense': 5, speed: 5 }))).toBe(35);
  });

  it('also counts folded-in fields like height/weight, not just the six battle stats', () => {
    expect(totalStatScore(fighter({ hp: 10, height: 7, weight: 690 }))).toBe(707);
  });

  it('also counts custom stats, since mergeFighter already folds them into .stats', () => {
    expect(totalStatScore(fighter({ hp: 10, charisma: 9000 }))).toBe(9010);
  });

  it('is 0 for a fighter with no stats', () => {
    expect(totalStatScore(fighter({}))).toBe(0);
  });
});
