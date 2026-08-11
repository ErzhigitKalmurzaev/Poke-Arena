import raw from '../../../public/data/pokemon.json';

export interface StaticFighterRecord {
  id: string;
  name: string;
  description: string;
  types: string[];
  stats: Record<string, number>;
  sprite: string | null;
}

/**
 * public/data/pokemon.json is a build-time artifact produced by
 * scripts/fetch-pokemon.ts. The app never talks to PokeAPI at runtime.
 */
export const staticFighters: StaticFighterRecord[] = raw as StaticFighterRecord[];
