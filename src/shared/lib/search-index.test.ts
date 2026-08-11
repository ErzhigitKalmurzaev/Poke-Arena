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

  /*
   * The brief asks for substring search. A token index alone can't do this:
   * MiniSearch matches whole words and word *prefixes*, so a fragment from the
   * middle or end of a name would come back empty.
   */
  it('finds a fighter by a substring in the middle of its name', () => {
    expect(searchFighterIds('kachu')).toContain('25'); // pikachu
  });

  it('finds a fighter by a substring at the end of its name', () => {
    expect(searchFighterIds('saur')).toContain('1'); // bulbasaur
    expect(searchFighterIds('saur')).toContain('3'); // venusaur
  });

  it('finds a fighter by a substring inside a word in its description', () => {
    // …"melt boulders" - "oulder" sits inside a word, so only a raw scan hits it.
    expect(searchFighterIds('oulder')).toContain('6');
  });

  it('is case-insensitive on substring matches', () => {
    expect(searchFighterIds('KACHU')).toContain('25');
  });

  it('matches a substring spanning a space', () => {
    expect(searchFighterIds('melt bould')).toContain('6');
  });

  it('lets the ranked hits lead, ahead of substring-only ones', () => {
    const ids = searchFighterIds('pikachu');
    // The exact-name match must be first, not buried among the many fighters
    // whose descriptions merely mention pikachu.
    expect(ids[0]).toBe('25');
  });

  it('never returns the same fighter twice when both passes match him', () => {
    const ids = searchFighterIds('pikachu');
    expect(new Set(ids).size).toBe(ids.length);
  });
});
