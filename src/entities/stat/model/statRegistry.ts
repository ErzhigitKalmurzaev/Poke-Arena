import type { StatDefinition } from './types';

/**
 * The canonical list of base (PokeAPI-sourced) stats available for team
 * comparison. Custom stats (source: 'custom') come from Dexie's
 * customStats table at runtime and are appended to this list wherever the
 * UI needs the full comparison set - the UI never treats base/custom
 * differently beyond that.
 */
export const BASE_STAT_REGISTRY: StatDefinition[] = [
  { id: 'hp', label: 'HP', source: 'base' },
  { id: 'attack', label: 'Атака', source: 'base' },
  { id: 'defense', label: 'Защита', source: 'base' },
  { id: 'special-attack', label: 'Спец. атака', source: 'base' },
  { id: 'special-defense', label: 'Спец. защита', source: 'base' },
  { id: 'speed', label: 'Скорость', source: 'base' },
  { id: 'height', label: 'Рост', source: 'base', unit: 'дм' },
  { id: 'weight', label: 'Вес', source: 'base', unit: 'гектограмм' },
  { id: 'captureRate', label: 'Сложность поимки', source: 'base' },
  { id: 'baseHappiness', label: 'Базовое счастье', source: 'base' },
];
