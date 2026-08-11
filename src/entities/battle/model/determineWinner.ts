import type { Fighter } from '@/entities/fighter';
import type { BattleOutcome, BattleSide, DuelOutcome } from './types';
import { fighterStatScore } from './statScore';

function decide(scoreA: number, scoreB: number): BattleSide | 'draw' {
  if (scoreA === scoreB) return 'draw';
  return scoreA > scoreB ? 'a' : 'b';
}

/**
 * One slot's duel: whoever scores higher on the chosen comparison parameter
 * (`statId` - a base stat, a custom one, or TOTAL_STAT_ID for the sum of
 * everything) wins it. A missing fighter - a team fielded fewer than the
 * other - scores 0 rather than throwing, so a short-handed team still gets a
 * result instead of crashing the battle.
 */
export function determineDuelWinner(
  slot: number,
  fighterA: Fighter | undefined,
  fighterB: Fighter | undefined,
  statId: string,
): DuelOutcome {
  const scoreA = fighterA ? fighterStatScore(fighterA, statId) : 0;
  const scoreB = fighterB ? fighterStatScore(fighterB, statId) : 0;
  return {
    slot,
    fighterAId: fighterA?.id ?? null,
    fighterBId: fighterB?.id ?? null,
    scoreA,
    scoreB,
    winner: decide(scoreA, scoreB),
  };
}

/**
 * Teams face off slot-by-slot (team A's Nth fighter vs team B's Nth fighter,
 * same pairing as the landing page's duel demo), each pair compared on the
 * chosen parameter. Whichever side wins more slots wins the battle overall; an
 * equal split - including two empty teams - is a draw. Team lengths don't need
 * to match: the shorter side just forfeits its missing slots.
 *
 * Pure and deterministic: same teams and same `statId` always give the same
 * outcome, with no clock, randomness or I/O anywhere in the path.
 */
export function determineWinner(teamA: Fighter[], teamB: Fighter[], statId: string): BattleOutcome {
  const slotCount = Math.max(teamA.length, teamB.length);
  const duels = Array.from({ length: slotCount }, (_, slot) =>
    determineDuelWinner(slot, teamA[slot], teamB[slot], statId),
  );
  const winsA = duels.filter((duel) => duel.winner === 'a').length;
  const winsB = duels.filter((duel) => duel.winner === 'b').length;
  return { statId, duels, winsA, winsB, winner: decide(winsA, winsB) };
}
