import { describe, expect, it } from 'vitest';
import { staticFighters } from '@/shared/api/static-dataset';
import { fighterRating } from './rating';

/** Six battle stats summing to `total`, so a fixture can target a known rating. */
function statsTotalling(total: number): Record<string, number> {
  return { hp: total, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
}

describe('fighterRating', () => {
  it('ranks fighters in the same order as their stats', () => {
    const weak = fighterRating(statsTotalling(200));
    const middling = fighterRating(statsTotalling(400));
    const strong = fighterRating(statsTotalling(600));

    expect(weak).toBeLessThan(middling);
    expect(middling).toBeLessThan(strong);
  });

  /*
   * The trap this function exists to avoid: a merged Fighter's `stats` also
   * holds height/weight/captureRate and any custom stats, and weight alone
   * dwarfs every battle stat. Averaging all of them would rate fighters by
   * body mass.
   */
  it('ignores height, weight and custom stats', () => {
    const battleOnly = fighterRating(statsTotalling(400));
    const withBaggage = fighterRating({
      ...statsTotalling(400),
      weight: 10_000,
      height: 200,
      captureRate: 45,
      'my-custom-stat': 5000,
    });

    expect(withBaggage).toBe(battleOnly);
  });

  it('caps an edited fighter who overshoots the scale instead of running past 99', () => {
    expect(fighterRating(statsTotalling(100_000))).toBe(99);
  });

  it('never shows a zero rating', () => {
    expect(fighterRating({})).toBe(1);
    expect(fighterRating(statsTotalling(0))).toBe(1);
  });
});

/*
 * The scale has to actually use its range. Anchoring it to the dataset's raw
 * maximum once squashed every card into 15-63 - a single freak form with a
 * 1125 stat total against a 780 top for everything else - which made the whole
 * roster read as mediocre. These pin the distribution down so that can't
 * silently come back.
 */
describe('rating distribution across the real roster', () => {
  const ratings = staticFighters.map((record) => fighterRating(record.stats)).sort((a, b) => a - b);
  const percentile = (p: number) => ratings[Math.floor(ratings.length * p)]!;

  it('centres the roster in a readable band rather than bunching it low', () => {
    expect(percentile(0.5)).toBeGreaterThanOrEqual(55);
    expect(percentile(0.5)).toBeLessThanOrEqual(80);
  });

  it('spreads weak and strong fighters far apart', () => {
    expect(percentile(0.1)).toBeLessThan(50);
    expect(percentile(0.9)).toBeGreaterThan(78);
  });

  it('reserves the ceiling for a genuine elite', () => {
    const maxed = ratings.filter((rating) => rating === 99).length;
    expect(maxed).toBeGreaterThan(0);
    expect(maxed).toBeLessThan(ratings.length * 0.03);
  });

  it('always fits two digits on the card', () => {
    expect(ratings[0]).toBeGreaterThanOrEqual(1);
    expect(ratings[ratings.length - 1]).toBeLessThanOrEqual(99);
  });
});
