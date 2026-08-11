/**
 * Type effectiveness, simplified to "clearly strong against" / "clearly weak
 * to" per type. Domain knowledge about fighters, so it lives in the entity -
 * the landing demo and the draft screen both read it from here rather than
 * keeping separate copies of an 18-type table.
 */
export const TYPE_MATCHUPS: Record<string, { strong: string[]; weak: string[] }> = {
  normal: { strong: [], weak: ['fighting'] },
  fire: { strong: ['grass', 'ice', 'bug', 'steel'], weak: ['water', 'ground', 'rock'] },
  water: { strong: ['fire', 'ground', 'rock'], weak: ['electric', 'grass'] },
  electric: { strong: ['water', 'flying'], weak: ['ground'] },
  grass: { strong: ['water', 'ground', 'rock'], weak: ['fire', 'ice', 'poison', 'flying', 'bug'] },
  ice: { strong: ['grass', 'ground', 'flying', 'dragon'], weak: ['fire', 'fighting', 'rock', 'steel'] },
  fighting: { strong: ['normal', 'ice', 'rock', 'dark', 'steel'], weak: ['flying', 'psychic', 'fairy'] },
  poison: { strong: ['grass', 'fairy'], weak: ['ground', 'psychic'] },
  ground: { strong: ['fire', 'electric', 'poison', 'rock', 'steel'], weak: ['water', 'grass', 'ice'] },
  flying: { strong: ['grass', 'fighting', 'bug'], weak: ['electric', 'ice', 'rock'] },
  psychic: { strong: ['fighting', 'poison'], weak: ['bug', 'ghost', 'dark'] },
  bug: { strong: ['grass', 'psychic', 'dark'], weak: ['fire', 'flying', 'rock'] },
  rock: { strong: ['fire', 'ice', 'flying', 'bug'], weak: ['water', 'grass', 'fighting', 'ground', 'steel'] },
  ghost: { strong: ['psychic', 'ghost'], weak: ['ghost', 'dark'] },
  dragon: { strong: ['dragon'], weak: ['ice', 'dragon', 'fairy'] },
  dark: { strong: ['psychic', 'ghost'], weak: ['fighting', 'bug', 'fairy'] },
  steel: { strong: ['ice', 'rock', 'fairy'], weak: ['fire', 'fighting', 'ground'] },
  fairy: { strong: ['fighting', 'dragon', 'dark'], weak: ['poison', 'steel'] },
};

/**
 * Combined matchups for a (possibly dual-type) fighter. A type that both of the
 * fighter's types cover appears once, and anything that lands on both lists is
 * dropped from each - with two types those cancel out rather than reading as
 * both a strength and a weakness.
 */
export function fighterMatchups(types: string[]): { strong: string[]; weak: string[] } {
  const strong = new Set<string>();
  const weak = new Set<string>();
  for (const type of types) {
    const entry = TYPE_MATCHUPS[type];
    if (!entry) continue;
    entry.strong.forEach((t) => strong.add(t));
    entry.weak.forEach((t) => weak.add(t));
  }
  const contested = [...strong].filter((t) => weak.has(t));
  contested.forEach((t) => {
    strong.delete(t);
    weak.delete(t);
  });
  return { strong: [...strong], weak: [...weak] };
}
