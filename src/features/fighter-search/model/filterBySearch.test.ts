import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { filterBySearch } from './filterBySearch';

function fighter(id: string): Fighter {
  return {
    id,
    name: id,
    description: '',
    types: [],
    stats: {},
    sprite: '',
    shinySprite: null,
    cryUrl: null,
    isLegendary: false,
    isMythical: false,
    isEdited: false,
  };
}

describe('filterBySearch', () => {
  it('keeps only fighters whose id is in the matched set', () => {
    const fighters = [fighter('1'), fighter('2'), fighter('3')];
    expect(filterBySearch(fighters, new Set(['1', '3'])).map((f) => f.id)).toEqual(['1', '3']);
  });

  it('returns nothing when the matched set is empty', () => {
    expect(filterBySearch([fighter('1')], new Set())).toEqual([]);
  });
});
