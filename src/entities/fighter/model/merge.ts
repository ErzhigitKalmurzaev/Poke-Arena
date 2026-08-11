import type { Fighter } from './types';

export interface BaseFighter {
  id: string;
  name: string;
  description: string;
  types: string[];
  sprite: string;
  shinySprite: string | null;
  cryUrl: string | null;
  isLegendary: boolean;
  isMythical: boolean;
  // Comparable numeric fields, e.g. the six battle stats plus
  // height/weight/captureRate/baseHappiness - the repository layer folds
  // all of these into one object before it reaches mergeFighter, so this
  // function stays generic and doesn't need to know which keys exist.
  stats: Record<string, number>;
}

export interface FighterOverride {
  name?: string;
  description?: string;
  stats?: Record<string, number>;
}

/**
 * Layering order: base (immutable PokeAPI snapshot) <- override (user edits,
 * undefined fields fall back to base) <- customStats (always added on top,
 * never present on base). The UI only ever sees the result of this function.
 */
export function mergeFighter(
  base: BaseFighter,
  override: FighterOverride | undefined,
  customStats: Record<string, number>,
): Fighter {
  return {
    id: base.id,
    name: override?.name ?? base.name,
    description: override?.description ?? base.description,
    types: base.types,
    sprite: base.sprite,
    shinySprite: base.shinySprite,
    cryUrl: base.cryUrl,
    isLegendary: base.isLegendary,
    isMythical: base.isMythical,
    stats: { ...base.stats, ...override?.stats, ...customStats },
    isEdited: Boolean(override && Object.keys(override).length > 0),
  };
}
