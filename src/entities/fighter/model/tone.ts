export type FighterTone = 'red' | 'blue' | 'mint';

// Only 3 accents exist in the design system - every PokeAPI type maps onto
// one of them (warm/aggressive, cool/defensive, or utility), never a 4th
// color. Shared by every UI that colors a fighter by its element.
const TYPE_TONE: Record<string, FighterTone> = {
  fire: 'red',
  electric: 'red',
  fighting: 'red',
  dragon: 'red',
  ground: 'red',
  rock: 'red',
  water: 'blue',
  ice: 'blue',
  flying: 'blue',
  psychic: 'blue',
  steel: 'blue',
  grass: 'mint',
  poison: 'mint',
  bug: 'mint',
  normal: 'mint',
  fairy: 'mint',
  ghost: 'mint',
  dark: 'mint',
};

export function toneOfTypes(types: string[]): FighterTone {
  return TYPE_TONE[types[0] ?? 'normal'] ?? 'mint';
}

// The canonical list of PokeAPI types, in the same order as above.
export const ALL_FIGHTER_TYPES: string[] = Object.keys(TYPE_TONE);

/**
 * Russian display names for PokeAPI's English type ids. The whole UI is in
 * Russian, so raw `fighting`/`special-attack`-style ids shouldn't leak into
 * filter chips or fighter cards; the id stays the value everywhere it's used
 * as a key or a query param.
 */
const TYPE_LABEL: Record<string, string> = {
  fire: 'Огонь',
  electric: 'Электро',
  fighting: 'Борьба',
  dragon: 'Дракон',
  ground: 'Земля',
  rock: 'Камень',
  water: 'Вода',
  ice: 'Лёд',
  flying: 'Полёт',
  psychic: 'Психика',
  steel: 'Сталь',
  grass: 'Трава',
  poison: 'Яд',
  bug: 'Жук',
  normal: 'Обычный',
  fairy: 'Фея',
  ghost: 'Призрак',
  dark: 'Тьма',
};

export function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type;
}

export const TONE_BG: Record<FighterTone, string> = {
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  mint: 'bg-brand-mint',
};

export const TONE_TEXT: Record<FighterTone, string> = {
  red: 'text-brand-red',
  blue: 'text-brand-blue',
  mint: 'text-brand-mint',
};

export const TONE_HEX: Record<FighterTone, string> = {
  red: '#d62828',
  blue: '#1565c0',
  mint: '#00897b',
};

export function toneRgba(tone: FighterTone, alpha: number): string {
  const hex = TONE_HEX[tone];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
