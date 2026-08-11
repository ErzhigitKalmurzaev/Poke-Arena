import type { Fighter } from '@/entities/fighter';
import type { BattleOutcome, BattleSide } from './types';

export interface RoundExplanation {
  slot: number;
  /** null when a side never filled this slot - it forfeited the round. */
  nameA: string | null;
  nameB: string | null;
  scoreA: number;
  scoreB: number;
  /** How far apart the two were, always >= 0. */
  margin: number;
  winner: BattleSide | 'draw';
}

export interface BattleExplanation {
  statId: string;
  winner: BattleSide | 'draw';
  winsA: number;
  winsB: number;
  rounds: RoundExplanation[];
  /**
   * The round the winner took by the widest margin - the single strongest piece
   * of evidence for why the battle went the way it did. null for a draw, which
   * has no winner whose rounds to weigh.
   */
  decisiveSlot: number | null;
  /** Sum of the parameter across each side's fielded fighters. */
  totalA: number;
  totalB: number;
}

/**
 * Turns a settled battle into the numbers behind it: round by round, who
 * scored what on the compared parameter, by how much, and which round carried
 * the result.
 *
 * Pure projection of an existing BattleOutcome - it never re-decides anything,
 * so the breakdown on screen cannot contradict the verdict. Deliberately
 * label-free: it deals in `statId` only, and the UI resolves the human name
 * through the stat registry.
 */
export function explainBattle(outcome: BattleOutcome, teamA: Fighter[], teamB: Fighter[]): BattleExplanation {
  const rounds: RoundExplanation[] = outcome.duels.map((duel) => ({
    slot: duel.slot,
    nameA: teamA[duel.slot]?.name ?? null,
    nameB: teamB[duel.slot]?.name ?? null,
    scoreA: duel.scoreA,
    scoreB: duel.scoreB,
    margin: Math.abs(duel.scoreA - duel.scoreB),
    winner: duel.winner,
  }));

  // Widest-won round, first one on a tie of margins - fixed, so the same
  // battle always names the same decisive round. A drawn battle is skipped
  // outright: matching 'draw' against the round winners would otherwise pick
  // out a drawn round and present it as decisive.
  const decisive =
    outcome.winner === 'draw'
      ? null
      : rounds
          .filter((round) => round.winner === outcome.winner)
          .reduce<RoundExplanation | null>((best, round) => (best && best.margin >= round.margin ? best : round), null);

  return {
    statId: outcome.statId,
    winner: outcome.winner,
    winsA: outcome.winsA,
    winsB: outcome.winsB,
    rounds,
    decisiveSlot: decisive?.slot ?? null,
    totalA: rounds.reduce((sum, round) => sum + round.scoreA, 0),
    totalB: rounds.reduce((sum, round) => sum + round.scoreB, 0),
  };
}
