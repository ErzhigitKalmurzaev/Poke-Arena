/**
 * Turns a user-typed label into a stable id: lowercased, runs of anything
 * that isn't a letter/digit collapsed to one hyphen, leading/trailing
 * hyphens trimmed. Keeps Cyrillic as-is rather than transliterating - it's
 * only ever used as a Dexie key/object property, never displayed.
 */
export function slugifyStatId(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'stat';
}

/** Appends -2, -3, ... until `taken` reports the id is free. */
export async function uniqueStatId(label: string, taken: (id: string) => Promise<boolean>): Promise<string> {
  const base = slugifyStatId(label);
  let id = base;
  let suffix = 2;
  while (await taken(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}
