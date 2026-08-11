import MiniSearch from 'minisearch';
import { staticFighters } from '@/shared/api/static-dataset';

interface SearchDocument {
  id: string;
  name: string;
  description: string;
}

/**
 * Full-text index over the static dataset's name/description, built once
 * when this module first loads (1300 records, in memory - cheap enough
 * that a background worker would add complexity without a measurable
 * win). Search never touches user overrides: it's a substring/fuzzy
 * lookup into the immutable PokeAPI snapshot, not the merged Fighter.
 */
const fighterSearchIndex = new MiniSearch<SearchDocument>({
  idField: 'id',
  fields: ['name', 'description'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    boost: { name: 2 },
  },
});

fighterSearchIndex.addAll(staticFighters);

/**
 * Lowercased name + description per fighter, in dataset order.
 *
 * MiniSearch is a *token* index: it matches whole words, word prefixes and
 * near-misses, so "kachu" finds nothing while "pika" finds pikachu. The brief
 * asks for substring search, which needs a pass over the raw text - this array
 * is that pass's input, built once at module load so a query is a plain
 * `includes` per record (~1300 of them, well under a frame).
 */
const fighterHaystacks: { id: string; text: string }[] = staticFighters.map((fighter) => ({
  id: fighter.id,
  text: `${fighter.name} ${fighter.description}`.toLowerCase(),
}));

/**
 * Returns matching fighter ids for a query, ranked by relevance. An
 * empty/whitespace-only query returns every fighter id in dataset order,
 * so callers can treat "no query yet" and "searched, matched everything"
 * the same way.
 *
 * Two passes, unioned: MiniSearch first (it ranks, and handles typos and
 * multi-word queries), then a raw substring scan for the matches a token
 * index structurally cannot make - "kachu" inside "pikachu", "мыш" inside a
 * description. Ranked results keep their order and substring-only matches
 * follow in dataset order, so the relevant hits stay at the top.
 */
export function searchFighterIds(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return staticFighters.map((fighter) => fighter.id);

  const ranked = fighterSearchIndex.search(trimmed).map((result) => String(result.id));
  const seen = new Set(ranked);

  const needle = trimmed.toLowerCase();
  for (const haystack of fighterHaystacks) {
    if (!seen.has(haystack.id) && haystack.text.includes(needle)) {
      ranked.push(haystack.id);
      seen.add(haystack.id);
    }
  }

  return ranked;
}
