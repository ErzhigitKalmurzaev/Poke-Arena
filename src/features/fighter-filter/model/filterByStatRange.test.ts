import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { filterByStatRange } from './filterByStatRange';

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

const fighters = [fighter('1', { speed: 30 }), fighter('2', { speed: 90 }), fighter('3', { speed: 150 })];

describe('filterByStatRange', () => {
  it('keeps fighters whose stat value falls within the inclusive range', () => {
    expect(filterByStatRange(fighters, 'speed', [30, 90]).map((f) => f.id)).toEqual(['1', '2']);
  });

  it('excludes fighters outside the range on either end', () => {
    expect(filterByStatRange(fighters, 'speed', [40, 100]).map((f) => f.id)).toEqual(['2']);
  });

  it('treats a missing stat as 0, excluding it unless 0 is in range', () => {
    const withoutStat = fighter('4', {});
    expect(filterByStatRange([withoutStat], 'speed', [0, 10]).map((f) => f.id)).toEqual(['4']);
    expect(filterByStatRange([withoutStat], 'speed', [1, 10])).toEqual([]);
  });
});
