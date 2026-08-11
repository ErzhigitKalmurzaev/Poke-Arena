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
 * Returns matching fighter ids for a query, ranked by relevance. An
 * empty/whitespace-only query returns every fighter id in dataset order,
 * so callers can treat "no query yet" and "searched, matched everything"
 * the same way.
 */
export function searchFighterIds(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return staticFighters.map((fighter) => fighter.id);
  return fighterSearchIndex.search(trimmed).map((result) => String(result.id));
}
