import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { determineDuelWinner, determineWinner } from './determineWinner';
import { TOTAL_STAT_ID } from './statScore';

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

// With TOTAL_STAT_ID the score is the sum of every stat on the fighter - a
// single-key `stats` object keeps these fixtures' totals exactly 10 and 20.
const weak = (id: string) => fighter(id, { hp: 10 });
const strong = (id: string) => fighter(id, { hp: 20 });

describe('determineDuelWinner', () => {
  it('picks the fighter with the higher total stat score', () => {
    expect(determineDuelWinner(0, strong('a'), weak('b'), TOTAL_STAT_ID).winner).toBe('a');
    expect(determineDuelWinner(0, weak('a'), strong('b'), TOTAL_STAT_ID).winner).toBe('b');
  });

  it('draws when totals are equal', () => {
    expect(determineDuelWinner(0, weak('a'), weak('b'), TOTAL_STAT_ID).winner).toBe('draw');
  });

  it('scores a missing fighter as 0 rather than throwing', () => {
    const outcome = determineDuelWinner(0, weak('a'), undefined, TOTAL_STAT_ID);
    expect(outcome).toMatchObject({ scoreA: 10, scoreB: 0, winner: 'a', fighterBId: null });
  });

  it('draws when both fighters are missing', () => {
    expect(determineDuelWinner(0, undefined, undefined, TOTAL_STAT_ID).winner).toBe('draw');
  });

  /*
   * The comparison parameter is the user's choice, so the same pair has to be
   * able to go either way depending on what is being compared - that's the
   * whole point of picking a stat rather than always summing.
   */
  it('compares only the chosen stat, not the whole fighter', () => {
    const a = fighter('a', { attack: 50, speed: 10 });
    const b = fighter('b', { attack: 20, speed: 90 });

    expect(determineDuelWinner(0, a, b, 'attack')).toMatchObject({ scoreA: 50, scoreB: 20, winner: 'a' });
    expect(determineDuelWinner(0, a, b, 'speed')).toMatchObject({ scoreA: 10, scoreB: 90, winner: 'b' });
    // …and by the sum, B is ahead 110:60.
    expect(determineDuelWinner(0, a, b, TOTAL_STAT_ID).winner).toBe('b');
  });

  it('compares a custom parameter exactly like a base one', () => {
    const a = fighter('a', { attack: 200, харизма: 3 });
    const b = fighter('b', { attack: 10, харизма: 99 });
    expect(determineDuelWinner(0, a, b, 'харизма')).toMatchObject({ scoreA: 3, scoreB: 99, winner: 'b' });
  });

  it('scores a fighter with no value for the parameter as 0, and lets him lose the slot', () => {
    const withValue = fighter('a', { харизма: 1 });
    const without = fighter('b', { attack: 999 });
    expect(determineDuelWinner(0, withValue, without, 'харизма')).toMatchObject({
      scoreA: 1,
      scoreB: 0,
      winner: 'a',
    });
  });

  it('draws a slot where neither fighter carries the parameter', () => {
    expect(determineDuelWinner(0, fighter('a', { hp: 1 }), fighter('b', { hp: 2 }), 'харизма')).toMatchObject({
      scoreA: 0,
      scoreB: 0,
      winner: 'draw',
    });
  });
});

describe('determineWinner', () => {
  it('gives the battle to the side that wins more slots', () => {
    const outcome = determineWinner(
      [strong('a1'), strong('a2'), weak('a3')],
      [weak('b1'), weak('b2'), strong('b3')],
      TOTAL_STAT_ID,
    );
    expect(outcome).toMatchObject({ winsA: 2, winsB: 1, winner: 'a' });
    expect(outcome.duels).toHaveLength(3);
  });

  it('draws when both sides win the same number of slots', () => {
    const outcome = determineWinner([strong('a1'), weak('a2')], [weak('b1'), strong('b2')], TOTAL_STAT_ID);
    expect(outcome).toMatchObject({ winsA: 1, winsB: 1, winner: 'draw' });
  });

  it('draws for two empty teams instead of throwing', () => {
    expect(determineWinner([], [], TOTAL_STAT_ID)).toMatchObject({ winsA: 0, winsB: 0, winner: 'draw', duels: [] });
  });

  it('lets the shorter team forfeit its missing slots', () => {
    const outcome = determineWinner([strong('a1')], [weak('b1'), strong('b2'), strong('b3')], TOTAL_STAT_ID);
    // slot 0: a1 (20) beats b1 (10) -> a; slots 1-2: team A has nobody -> b
    expect(outcome).toMatchObject({ winsA: 1, winsB: 2, winner: 'b' });
    expect(outcome.duels[1]).toMatchObject({ fighterAId: null, scoreA: 0, winner: 'b' });
  });

  it('reports which parameter the battle was decided on', () => {
    expect(determineWinner([weak('a')], [weak('b')], 'speed').statId).toBe('speed');
  });

  /*
   * A team can be behind on the sum of everything and still win on the
   * parameter that was actually chosen - the case that would be impossible to
   * express before the comparison stat existed.
   */
  it('can hand the battle to the side that would lose on the sum', () => {
    const teamA = [fighter('a1', { attack: 90, weight: 1 }), fighter('a2', { attack: 90, weight: 1 })];
    const teamB = [fighter('b1', { attack: 10, weight: 9000 }), fighter('b2', { attack: 10, weight: 9000 })];

    expect(determineWinner(teamA, teamB, 'attack').winner).toBe('a');
    expect(determineWinner(teamA, teamB, TOTAL_STAT_ID).winner).toBe('b');
  });

  it('is deterministic - the same teams and parameter always give the same outcome', () => {
    const teamA = [strong('a1'), weak('a2'), strong('a3')];
    const teamB = [weak('b1'), strong('b2'), weak('b3')];
    expect(determineWinner(teamA, teamB, TOTAL_STAT_ID)).toEqual(determineWinner(teamA, teamB, TOTAL_STAT_ID));
  });

  it('does not depend on the order the two teams are passed in', () => {
    const teamA = [strong('a1'), weak('a2')];
    const teamB = [weak('b1'), weak('b2')];
    const forward = determineWinner(teamA, teamB, TOTAL_STAT_ID);
    const mirrored = determineWinner(teamB, teamA, TOTAL_STAT_ID);

    expect(forward.winner).toBe('a');
    expect(mirrored.winner).toBe('b');
    expect(forward.winsA).toBe(mirrored.winsB);
  });
});
