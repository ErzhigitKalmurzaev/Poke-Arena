import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta';
const BATCH_SIZE = 200;
const BATCH_DELAY_MS = Number(process.env.FETCH_DELAY_MS ?? 300);
const OUT_PATH = new URL('../public/data/pokemon.json', import.meta.url);

const QUERY = /* GraphQL */ `
  query GetPokemon($limit: Int!, $offset: Int!) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset, order_by: { id: asc }) {
      id
      name
      height
      weight
      pokemon_v2_pokemonstats {
        base_stat
        pokemon_v2_stat {
          name
        }
      }
      pokemon_v2_pokemontypes(order_by: { slot: asc }) {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
      pokemon_v2_pokemonspecy {
        pokemon_v2_pokemonspeciesflavortexts(where: { language_id: { _eq: 9 } }, limit: 1) {
          flavor_text
        }
      }
    }
    pokemon_v2_pokemon_aggregate {
      aggregate {
        count
      }
    }
  }
`;

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  pokemon_v2_pokemonstats: { base_stat: number; pokemon_v2_stat: { name: string } }[];
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
  pokemon_v2_pokemonsprites: { sprites: Record<string, unknown> }[];
  pokemon_v2_pokemonspecy: {
    pokemon_v2_pokemonspeciesflavortexts: { flavor_text: string }[];
  } | null;
}

interface GraphQLResponse {
  data?: {
    pokemon_v2_pokemon: RawPokemon[];
    pokemon_v2_pokemon_aggregate: { aggregate: { count: number } };
  };
  errors?: unknown;
}

interface NormalizedFighter {
  id: string;
  name: string;
  description: string;
  height: number;
  weight: number;
  types: string[];
  stats: Record<string, number>;
  sprite: string | null;
}

async function fetchBatch(limit: number, offset: number) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { limit, offset } }),
  });

  if (res.status === 429) {
    throw new Error(
      `Rate limited by PokeAPI (429) at offset ${offset}. Rerun with a bigger delay, ` +
        `e.g. FETCH_DELAY_MS=1000 bun run scripts/fetch-pokemon.ts`,
    );
  }
  if (!res.ok) {
    throw new Error(`GraphQL request failed with ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse;
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  if (!json.data) {
    throw new Error('GraphQL response had no data');
  }
  return json.data;
}

function cleanFlavorText(text: string): string {
  return text
    .replace(/[\n\f\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSprite(sprites: Record<string, unknown> | undefined): string | null {
  // The GraphQL endpoint's jsonb `sprites` column comes back as a plain
  // object over HTTP, but treat a JSON-encoded string defensively too.
  const parsed = typeof sprites === 'string' ? (JSON.parse(sprites) as Record<string, unknown>) : sprites;
  if (!parsed) return null;

  const other = parsed.other as Record<string, unknown> | undefined;
  const officialArtwork = other?.['official-artwork'] as Record<string, unknown> | undefined;
  const officialArtworkFront = officialArtwork?.front_default as string | undefined;
  const frontDefault = parsed.front_default as string | undefined;
  return officialArtworkFront ?? frontDefault ?? null;
}

function normalize(raw: RawPokemon): NormalizedFighter {
  const flavorText = raw.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesflavortexts[0]?.flavor_text;

  return {
    id: String(raw.id),
    name: raw.name,
    description: flavorText ? cleanFlavorText(flavorText) : '',
    height: raw.height,
    weight: raw.weight,
    types: raw.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
    stats: Object.fromEntries(raw.pokemon_v2_pokemonstats.map((s) => [s.pokemon_v2_stat.name, s.base_stat])),
    sprite: extractSprite(raw.pokemon_v2_pokemonsprites[0]?.sprites),
  };
}

async function main() {
  const first = await fetchBatch(BATCH_SIZE, 0);
  const total = first.pokemon_v2_pokemon_aggregate.aggregate.count;
  const all = [...first.pokemon_v2_pokemon];
  console.log(`fetched ${all.length}/${total}`);

  for (let offset = BATCH_SIZE; offset < total; offset += BATCH_SIZE) {
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    const batch = await fetchBatch(BATCH_SIZE, offset);
    all.push(...batch.pokemon_v2_pokemon);
    console.log(`fetched ${all.length}/${total}`);
  }

  const normalized = all.map(normalize);
  await writeFile(OUT_PATH, JSON.stringify(normalized));
  console.log(`saved ${normalized.length} records -> ${fileURLToPath(OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
