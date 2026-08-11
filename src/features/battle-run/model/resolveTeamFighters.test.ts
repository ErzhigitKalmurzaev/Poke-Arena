import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { resolveTeamFighters } from './resolveTeamFighters';

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

describe('resolveTeamFighters', () => {
  it('resolves ids to fighters in order', () => {
    const fightersById = new Map([fighter('a'), fighter('b')].map((f) => [f.id, f]));
    expect(resolveTeamFighters(['b', 'a'], fightersById).map((f) => f.id)).toEqual(['b', 'a']);
  });

  it('drops an id that no longer resolves instead of leaving a hole', () => {
    const fightersById = new Map([fighter('a')].map((f) => [f.id, f]));
    expect(resolveTeamFighters(['a', 'gone'], fightersById).map((f) => f.id)).toEqual(['a']);
  });
});
