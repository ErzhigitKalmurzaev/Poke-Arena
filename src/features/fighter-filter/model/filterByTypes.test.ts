import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { filterByTypes } from './filterByTypes';

function fighter(id: string, types: string[]): Fighter {
  return {
    id,
    name: id,
    description: '',
    types,
    stats: {},
    sprite: '',
    shinySprite: null,
    cryUrl: null,
    isLegendary: false,
    isMythical: false,
    isEdited: false,
  };
}

const fighters = [fighter('1', ['fire']), fighter('2', ['water', 'ice']), fighter('3', ['grass'])];

describe('filterByTypes', () => {
  it('returns every fighter when no type is selected', () => {
    expect(filterByTypes(fighters, [])).toEqual(fighters);
  });

  it('keeps fighters matching a selected type', () => {
    expect(filterByTypes(fighters, ['fire']).map((f) => f.id)).toEqual(['1']);
  });

  it('matches fighters with any of several selected types, including dual-typed ones', () => {
    expect(filterByTypes(fighters, ['fire', 'ice']).map((f) => f.id)).toEqual(['1', '2']);
  });

  it('returns nothing when no fighter has the selected type', () => {
    expect(filterByTypes(fighters, ['dragon'])).toEqual([]);
  });
});
