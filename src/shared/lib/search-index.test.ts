import { describe, expect, it } from 'vitest';
import { searchFighterIds } from './search-index';

describe('searchFighterIds', () => {
  it('finds a fighter by an exact name match', () => {
    expect(searchFighterIds('charizard')).toContain('6');
  });

  it('finds a fighter by a prefix', () => {
    expect(searchFighterIds('chariz')).toContain('6');
  });

  it('finds a fighter by a word inside its description', () => {
    // Charizard's flavor text: "Spits fire that is hot enough to melt boulders."
    expect(searchFighterIds('boulders')).toContain('6');
  });

  it('returns every fighter id for an empty query', () => {
    expect(searchFighterIds('   ').length).toBeGreaterThan(1000);
  });

  it('returns nothing for a query that matches no fighter', () => {
    expect(searchFighterIds('zzzznotarealquery')).toEqual([]);
  });
});
