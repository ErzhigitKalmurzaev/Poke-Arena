export type FighterTone = 'amber' | 'blue' | 'mint';

// Only 3 accents exist in the design system - every PokeAPI type maps onto
// one of them (warm/aggressive, cool/defensive, or utility), never a 4th
// color. Shared by every UI that colors a fighter by its element.
const TYPE_TONE: Record<string, FighterTone> = {
  fire: 'amber',
  electric: 'amber',
  fighting: 'amber',
  dragon: 'amber',
  ground: 'amber',
  rock: 'amber',
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

export const TONE_BG: Record<FighterTone, string> = {
  amber: 'bg-brand-amber',
  blue: 'bg-brand-blue',
  mint: 'bg-brand-mint',
};

export const TONE_TEXT: Record<FighterTone, string> = {
  amber: 'text-brand-amber',
  blue: 'text-brand-blue',
  mint: 'text-brand-mint',
};

export const TONE_HEX: Record<FighterTone, string> = {
  amber: '#ffb444',
  blue: '#addaee',
  mint: '#b2ffe2',
};

export function toneRgba(tone: FighterTone, alpha: number): string {
  const hex = TONE_HEX[tone];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
