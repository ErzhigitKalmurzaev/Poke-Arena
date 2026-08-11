import type { Fighter } from '@/entities/fighter';
import type { BattleOutcome, BattleSide, DuelOutcome } from './types';
import { totalStatScore } from './totalStatScore';

function decide(scoreA: number, scoreB: number): BattleSide | 'draw' {
  if (scoreA === scoreB) return 'draw';
  return scoreA > scoreB ? 'a' : 'b';
}

/**
 * One slot's duel: whoever's totalStatScore (every characteristic the
 * fighter has, not one hand-picked stat) is higher wins it. A missing
 * fighter - a team fielded fewer than the other - scores 0 rather than
 * throwing, so a short-handed team still gets a result instead of crashing
 * the battle.
 */
export function determineDuelWinner(slot: number, fighterA: Fighter | undefined, fighterB: Fighter | undefined): DuelOutcome {
  const scoreA = fighterA ? totalStatScore(fighterA) : 0;
  const scoreB = fighterB ? totalStatScore(fighterB) : 0;
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
 * Teams face off slot-by-slot (team A's Nth fighter vs team B's Nth
 * fighter, same pairing as the landing page's duel demo). Whichever side
 * wins more slots wins the battle overall; an equal split - including two
 * empty teams - is a draw. Team lengths don't need to match: the shorter
 * side just forfeits its missing slots.
 */
export function determineWinner(teamA: Fighter[], teamB: Fighter[]): BattleOutcome {
  const slotCount = Math.max(teamA.length, teamB.length);
  const duels = Array.from({ length: slotCount }, (_, slot) => determineDuelWinner(slot, teamA[slot], teamB[slot]));
  const winsA = duels.filter((duel) => duel.winner === 'a').length;
  const winsB = duels.filter((duel) => duel.winner === 'b').length;
  return { duels, winsA, winsB, winner: decide(winsA, winsB) };
}
