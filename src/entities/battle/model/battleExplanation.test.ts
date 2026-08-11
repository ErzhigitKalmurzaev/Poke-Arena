import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { determineWinner } from './determineWinner';
import { explainBattle } from './battleExplanation';

function fighter(id: string, attack: number): Fighter {
  return {
    id,
    name: id,
    description: '',
    types: [],
    stats: { attack },
    sprite: '',
    shinySprite: null,
    cryUrl: null,
    isLegendary: false,
    isMythical: false,
    isEdited: false,
  };
}

/** Explains the battle these two teams actually fought, via the real outcome. */
function explain(teamA: Fighter[], teamB: Fighter[]) {
  return explainBattle(determineWinner(teamA, teamB, 'attack'), teamA, teamB);
}

describe('explainBattle', () => {
  it('lays out every round with both names, both scores and the margin', () => {
    const explanation = explain([fighter('pikachu', 55)], [fighter('onix', 45)]);

    expect(explanation.rounds).toEqual([
      { slot: 0, nameA: 'pikachu', nameB: 'onix', scoreA: 55, scoreB: 45, margin: 10, winner: 'a' },
    ]);
  });

  it('carries the compared parameter and the round tally through from the outcome', () => {
    const explanation = explain([fighter('a1', 50), fighter('a2', 10)], [fighter('b1', 20), fighter('b2', 90)]);

    expect(explanation).toMatchObject({ statId: 'attack', winsA: 1, winsB: 1, winner: 'draw' });
  });

  it('names the round the winner took by the widest margin as decisive', () => {
    const teamA = [fighter('a1', 51), fighter('a2', 200), fighter('a3', 1)];
    const teamB = [fighter('b1', 50), fighter('b2', 10), fighter('b3', 99)];

    // A wins slot 0 by 1 and slot 1 by 190; slot 2 goes to B.
    expect(explain(teamA, teamB)).toMatchObject({ winner: 'a', decisiveSlot: 1 });
  });

  it('never picks a round the winner lost as the decisive one', () => {
    // A takes slot 0 by 50 and slot 1 by 65; B takes slot 2 by 5000.
    const teamA = [fighter('a1', 60), fighter('a2', 70), fighter('a3', 0)];
    const teamB = [fighter('b1', 10), fighter('b2', 5), fighter('b3', 5000)];
    const explanation = explain(teamA, teamB);

    expect(explanation.winner).toBe('a');
    // Slot 2's margin is by far the widest, but B took it.
    expect(explanation.decisiveSlot).toBe(1);
  });

  it('breaks a margin tie on the earlier round, so the same battle always reads the same', () => {
    const teamA = [fighter('a1', 20), fighter('a2', 20)];
    const teamB = [fighter('b1', 10), fighter('b2', 10)];

    expect(explain(teamA, teamB).decisiveSlot).toBe(0);
  });

  /*
   * A drawn battle has no winner, and the naive "widest round this side won"
   * lookup would match 'draw' against the round winners and dress a tied
   * round up as decisive.
   */
  it('has no decisive round in a draw', () => {
    expect(explain([fighter('a', 10)], [fighter('b', 10)])).toMatchObject({ winner: 'draw', decisiveSlot: null });
  });

  it('has no decisive round when every round was itself a draw', () => {
    const explanation = explain([fighter('a1', 7), fighter('a2', 7)], [fighter('b1', 7), fighter('b2', 7)]);
    expect(explanation).toMatchObject({ winsA: 0, winsB: 0, winner: 'draw', decisiveSlot: null });
  });

  it('still names a decisive round when the winner forfeited others', () => {
    // Team A fielded nobody, so both slots are walkovers for B.
    const explanation = explain([], [fighter('b1', 5), fighter('b2', 40)]);
    expect(explanation).toMatchObject({ winner: 'b', winsB: 2, decisiveSlot: 1 });
  });

  it('marks an unfilled slot with a null name and a forfeited round', () => {
    const explanation = explain([fighter('a', 10)], [fighter('b1', 5), fighter('b2', 5)]);

    expect(explanation.rounds[1]).toMatchObject({ nameA: null, nameB: 'b2', scoreA: 0, scoreB: 5, winner: 'b' });
  });

  it('totals the parameter across each side', () => {
    const explanation = explain([fighter('a1', 30), fighter('a2', 12)], [fighter('b1', 1), fighter('b2', 2)]);

    expect(explanation).toMatchObject({ totalA: 42, totalB: 3 });
  });

  it('cannot contradict the outcome it explains', () => {
    const teamA = [fighter('a1', 5), fighter('a2', 5), fighter('a3', 100)];
    const teamB = [fighter('b1', 6), fighter('b2', 6), fighter('b3', 1)];
    const outcome = determineWinner(teamA, teamB, 'attack');
    const explanation = explainBattle(outcome, teamA, teamB);

    expect(explanation.rounds.filter((round) => round.winner === 'a')).toHaveLength(outcome.winsA);
    expect(explanation.rounds.filter((round) => round.winner === 'b')).toHaveLength(outcome.winsB);
    expect(explanation.winner).toBe(outcome.winner);
  });
});
