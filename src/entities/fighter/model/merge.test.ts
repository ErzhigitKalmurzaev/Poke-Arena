import { describe, expect, it } from 'vitest';
import { mergeFighter, type BaseFighter } from './merge';

const base: BaseFighter = {
  id: '1',
  name: 'Bulbasaur',
  description: 'A strange seed was planted on its back at birth.',
  types: ['grass', 'poison'],
  sprite: '/bulbasaur.png',
  shinySprite: '/bulbasaur-shiny.png',
  cryUrl: '/bulbasaur.ogg',
  isLegendary: false,
  isMythical: false,
  stats: { hp: 45, attack: 49, height: 7, weight: 69, captureRate: 45, baseHappiness: 70 },
};

describe('mergeFighter', () => {
  it('returns the base fighter untouched when there is no override or custom stat', () => {
    const result = mergeFighter(base, undefined, {});

    expect(result).toEqual({
      id: '1',
      name: 'Bulbasaur',
      description: base.description,
      types: ['grass', 'poison'],
      sprite: '/bulbasaur.png',
      shinySprite: '/bulbasaur-shiny.png',
      cryUrl: '/bulbasaur.ogg',
      isLegendary: false,
      isMythical: false,
      stats: { hp: 45, attack: 49, height: 7, weight: 69, captureRate: 45, baseHappiness: 70 },
      isEdited: false,
    });
  });

  it('lets override fields win, falling back to base for anything left undefined', () => {
    const result = mergeFighter(base, { name: 'Bulbasaur Prime' }, {});

    expect(result.name).toBe('Bulbasaur Prime');
    expect(result.description).toBe(base.description);
    expect(result.isEdited).toBe(true);
  });

  it('merges override stats on top of base stats, keeping untouched base stats', () => {
    const result = mergeFighter(base, { stats: { attack: 99 } }, {});

    expect(result.stats).toEqual({ hp: 45, attack: 99, height: 7, weight: 69, captureRate: 45, baseHappiness: 70 });
  });

  it('folds height/weight/captureRate/baseHappiness into stats and lets them be overridden like any other stat', () => {
    const result = mergeFighter(base, { stats: { height: 99 } }, {});

    expect(result.stats.height).toBe(99);
    expect(result.stats.weight).toBe(69);
  });

  it('passes non-comparable fields (sprites, cry, legendary flags) straight through from base, ignoring override', () => {
    const result = mergeFighter(base, { name: 'Bulbasaur Prime' }, {});

    expect(result.shinySprite).toBe('/bulbasaur-shiny.png');
    expect(result.cryUrl).toBe('/bulbasaur.ogg');
    expect(result.isLegendary).toBe(false);
    expect(result.isMythical).toBe(false);
  });

  it('always layers custom stats on top, even without an override', () => {
    const result = mergeFighter(base, undefined, { charisma: 10 });

    expect(result.stats).toEqual({
      hp: 45,
      attack: 49,
      height: 7,
      weight: 69,
      captureRate: 45,
      baseHappiness: 70,
      charisma: 10,
    });
    expect(result.isEdited).toBe(false);
  });

  it('lets a custom stat value win over a same-named override stat, since it is applied last', () => {
    const result = mergeFighter(base, { stats: { attack: 60 } }, { attack: 100 });

    expect(result.stats.attack).toBe(100);
  });

  it('treats an override with only empty edits as not edited when the object itself is absent', () => {
    const result = mergeFighter(base, undefined, {});

    expect(result.isEdited).toBe(false);
  });
});
