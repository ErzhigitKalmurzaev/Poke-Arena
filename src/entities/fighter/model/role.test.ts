import { describe, expect, it } from 'vitest';
import { fighterMatchups } from './matchups';
import { fighterRole, fighterStrengths } from './role';

describe('fighterRole', () => {
  it('names the role after the highest battle stat', () => {
    expect(fighterRole({ hp: 10, attack: 99, defense: 10, speed: 10 })).toBe('УДАРНЫЙ');
    expect(fighterRole({ hp: 10, attack: 10, defense: 10, speed: 99 })).toBe('СКОРОСТНОЙ');
    expect(fighterRole({ hp: 99, attack: 10 })).toBe('ТАНК');
  });

  it('ignores the folded-in fields, so weight never wins', () => {
    // A merged Fighter carries height/weight/captureRate too, and weight alone
    // reaches ~10000 - a naive max over every key would report it every time.
    const role = fighterRole({ hp: 20, attack: 80, speed: 30, weight: 10000, height: 900, captureRate: 255 });
    expect(role).toBe('УДАРНЫЙ');
  });

  it('ignores custom stats for the same reason', () => {
    expect(fighterRole({ hp: 20, speed: 80, харизма: 99999 })).toBe('СКОРОСТНОЙ');
  });

  it('falls back to a neutral label when no battle stats are present', () => {
    expect(fighterRole({ weight: 500 })).toBe('ТАНК'); // all battle stats tie at 0 -> first key
  });
});

describe('fighterStrengths', () => {
  it('returns all six battle stats, strongest first', () => {
    const strengths = fighterStrengths({ hp: 1, attack: 6, defense: 2, 'special-attack': 5, 'special-defense': 3, speed: 4 });
    expect(strengths).toHaveLength(6);
    expect(strengths.map((s) => s.statKey)).toEqual([
      'attack',
      'special-attack',
      'speed',
      'special-defense',
      'defense',
      'hp',
    ]);
    expect(strengths[0]).toMatchObject({ statLabel: 'АТАКА', value: 6 });
  });

  it('treats a missing battle stat as 0 rather than dropping it', () => {
    expect(fighterStrengths({ attack: 5 }).map((s) => s.value)).toEqual([5, 0, 0, 0, 0, 0]);
  });
});

describe('fighterMatchups', () => {
  it('reads the table for a single type', () => {
    expect(fighterMatchups(['electric'])).toEqual({ strong: ['water', 'flying'], weak: ['ground'] });
  });

  it('unions both types of a dual-type fighter without duplicates', () => {
    const { strong } = fighterMatchups(['fire', 'ground']);
    expect(strong).toContain('steel');
    expect(strong.filter((t) => t === 'steel')).toHaveLength(1);
  });

  it('cancels a type that lands on both lists', () => {
    // fire is strong vs grass; ground is weak to grass -> grass drops from both.
    const { strong, weak } = fighterMatchups(['fire', 'ground']);
    expect(strong).not.toContain('grass');
    expect(weak).not.toContain('grass');
  });

  it('ignores an unknown type instead of throwing', () => {
    expect(fighterMatchups(['not-a-type'])).toEqual({ strong: [], weak: [] });
  });
});
