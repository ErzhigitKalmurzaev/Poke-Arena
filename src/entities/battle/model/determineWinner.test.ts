import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { determineDuelWinner, determineWinner } from './determineWinner';

function fighter(id: string, stats: Record<string, number>): Fighter {
  return {
    id,
    name: id,
    description: '',
    types: [],
    stats,
    sprite: '',
    shinySprite: null,
    cryUrl: null,
    isLegendary: false,
    isMythical: false,
    isEdited: false,
  };
}

// totalStatScore sums every stat on the fighter - a single-key `stats`
// object keeps these fixtures' totals exactly 10 and 20.
const weak = (id: string) => fighter(id, { hp: 10 });
const strong = (id: string) => fighter(id, { hp: 20 });

describe('determineDuelWinner', () => {
  it('picks the fighter with the higher total stat score', () => {
    expect(determineDuelWinner(0, strong('a'), weak('b')).winner).toBe('a');
    expect(determineDuelWinner(0, weak('a'), strong('b')).winner).toBe('b');
  });

  it('draws when totals are equal', () => {
    expect(determineDuelWinner(0, weak('a'), weak('b')).winner).toBe('draw');
  });

  it('scores a missing fighter as 0 rather than throwing', () => {
    const outcome = determineDuelWinner(0, weak('a'), undefined);
    expect(outcome).toMatchObject({ scoreA: 10, scoreB: 0, winner: 'a', fighterBId: null });
  });

  it('draws when both fighters are missing', () => {
    expect(determineDuelWinner(0, undefined, undefined).winner).toBe('draw');
  });
});

describe('determineWinner', () => {
  it('gives the battle to the side that wins more slots', () => {
    const outcome = determineWinner([strong('a1'), strong('a2'), weak('a3')], [weak('b1'), weak('b2'), strong('b3')]);
    expect(outcome).toMatchObject({ winsA: 2, winsB: 1, winner: 'a' });
    expect(outcome.duels).toHaveLength(3);
  });

  it('draws when both sides win the same number of slots', () => {
    const outcome = determineWinner([strong('a1'), weak('a2')], [weak('b1'), strong('b2')]);
    expect(outcome).toMatchObject({ winsA: 1, winsB: 1, winner: 'draw' });
  });

  it('draws for two empty teams instead of throwing', () => {
    expect(determineWinner([], [])).toMatchObject({ winsA: 0, winsB: 0, winner: 'draw', duels: [] });
  });

  it('lets the shorter team forfeit its missing slots', () => {
    const outcome = determineWinner([strong('a1')], [weak('b1'), strong('b2'), strong('b3')]);
    // slot 0: a1 (20) beats b1 (10) -> a; slots 1-2: team A has nobody -> b
    expect(outcome).toMatchObject({ winsA: 1, winsB: 2, winner: 'b' });
    expect(outcome.duels[1]).toMatchObject({ fighterAId: null, scoreA: 0, winner: 'b' });
  });
});
