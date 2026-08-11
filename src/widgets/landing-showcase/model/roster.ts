import { TONE_BG, TONE_HEX, TONE_TEXT, toneOfTypes, toneRgba, type FighterTone } from '@/entities/fighter';
import { staticFighters, type StaticFighterRecord } from '@/shared/api/static-dataset';

export type { FighterTone as BrandTone };
export { TONE_BG, TONE_HEX, TONE_TEXT, toneRgba };

export interface RosterFighter extends StaticFighterRecord {
  total: number;
  tone: FighterTone;
  role: string;
}

export const STATS: { key: string; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'АТАКА' },
  { key: 'defense', label: 'ЗАЩИТА' },
  { key: 'special-attack', label: 'СП.АТАКА' },
  { key: 'special-defense', label: 'СП.ЗАЩИТА' },
  { key: 'speed', label: 'СКОРОСТЬ' },
];

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

export const TYPE_TEXT: Record<string, string> = {
  fire: 'Давит уроном и темпом. Проседает против воды и земли, если бой затягивается.',
  electric: 'Строится на скорости и спец-атаке. Почти беззащитен против земли.',
  fighting: 'Чистая физическая атака. Уязвим к летающим и психическим соперникам.',
  dragon: 'Высокие статы почти во всём. Боится льда, феи и таких же драконов.',
  ground: 'Хорошая атака и защита разом. Проваливается против воды, травы и льда.',
  rock: 'Лучшая защита в системе типов. Слаб к воде, траве и борьбе.',
  water: 'Ровный защитный профиль, забирает долгие раунды. Не любит электричество.',
  ice: 'Контролирует драконов и летающих. Сам легко пробивается огнём и сталью.',
  flying: 'Скорость и подвижность. Уязвим к электричеству, льду и камню.',
  psychic: 'Максимальная спец-атака в системе. Боится тьмы, призраков и жуков.',
  steel: 'Атака и защита одновременно. Медленный — огонь и борьба решают быстро.',
  grass: 'Хорошо держит удар от воды и земли. Слаб почти против всего огненного и летающего.',
  poison: 'Изматывает соперника со временем. Уязвим к земле и психике.',
  bug: 'Неудобен психическим и тёмным типам. Разваливается от огня и камня.',
  normal: 'Без явных сильных сторон, но и без явных слабостей кроме борьбы.',
  fairy: 'Держит драконов и бойцов. Проигрывает яду и стали.',
  ghost: 'Работает по психическим типам. Боится других призраков и тьмы.',
  dark: 'Давит на психику и призраков. Слаб к борьбе, жукам и фее.',
};

function total(stats: Record<string, number>): number {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

function roleOf(stats: Record<string, number>): string {
  const entries = Object.entries(stats);
  const [topKey] = entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best), entries[0] ?? ['hp', 0]);
  switch (topKey) {
    case 'hp':
      return 'ТАНК';
    case 'attack':
      return 'УДАРНЫЙ';
    case 'defense':
      return 'ЗАЩИТНЫЙ';
    case 'special-attack':
      return 'МАГ';
    case 'special-defense':
      return 'СТОЙКИЙ';
    case 'speed':
      return 'СКОРОСТНОЙ';
    default:
      return 'БАЛАНС';
  }
}

// A fixed, type-diverse curated set for the landing demo - real species,
// real stats, real sprites. Not the full catalog (that's the /catalog stage).
const ROSTER_IDS = ['6', '9', '3', '25', '94', '143', '149', '68', '65', '131', '130', '248'];

const byId = new Map(staticFighters.map((fighter) => [fighter.id, fighter]));

export const ROSTER: RosterFighter[] = ROSTER_IDS.map((id) => {
  const fighter = byId.get(id);
  if (!fighter) throw new Error(`Landing roster references unknown fighter id ${id}`);
  return { ...fighter, total: total(fighter.stats), tone: toneOfTypes(fighter.types), role: roleOf(fighter.stats) };
});

export const ROSTER_TYPES = Array.from(new Set(ROSTER.flatMap((fighter) => fighter.types)));

export const TOTAL_FIGHTER_COUNT = staticFighters.length;
