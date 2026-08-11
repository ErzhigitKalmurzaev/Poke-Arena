import { fighterMoves, type Fighter, type FighterMove } from '@/entities/fighter';
import type { BattleSide, DuelOutcome } from './types';

/** Most blows a fighter throws in a duel, before the knockout trims the rest. */
const HITS_PER_SIDE = 2;

/**
 * How far a score margin is stretched into the winner's surviving health. Two
 * fighters usually land within a few percent of each other, which on a raw
 * scale would leave every winner on a hair of health; this opens that margin
 * into something readable.
 */
const MARGIN_SCALE = 800;

/** The winner is always left standing on something visible, however narrow the win. */
const WINNER_MIN_REMAINING = 14;
/** …and never on a full bar, so even a blowout looks like it cost him something. */
const WINNER_MAX_REMAINING = 96;
/**
 * Neither fighter can finish the other, so both walk away battered but alive -
 * a stalemate is the one result that legitimately ends with health to spare.
 */
const DRAW_REMAINING = 20;

export interface DuelExchange {
  /** Who throws the blow. */
  side: BattleSide;
  move: FighterMove;
  /** Where the *defender's* power bar lands once this blow connects, 0-100. */
  defenderPower: number;
}

export interface DuelScript {
  exchanges: DuelExchange[];
  finalPowerA: number;
  finalPowerB: number;
}

const other = (side: BattleSide): BattleSide => (side === 'a' ? 'b' : 'a');

/**
 * Where the two health bars come to rest.
 *
 * A duel is decided by a knockout: the loser's bar empties, which is what ends
 * the round. How much the winner has left is his margin - a duel won by a
 * hair leaves him barely standing, a rout barely scratches him. Derived from
 * the same scores `determineDuelWinner` compared, so the bars can't disagree
 * with the result.
 */
function finalPowers(scoreA: number, scoreB: number, winner: BattleSide | 'draw'): [number, number] {
  if (winner === 'draw') return [DRAW_REMAINING, DRAW_REMAINING];

  const total = scoreA + scoreB;
  const winnerScore = winner === 'a' ? scoreA : scoreB;
  const share = total === 0 ? 0.5 : winnerScore / total;

  const remaining = Math.min(WINNER_MAX_REMAINING, Math.max(WINNER_MIN_REMAINING, (share - 0.5) * MARGIN_SCALE));

  return winner === 'a' ? [remaining, 0] : [0, remaining];
}

/**
 * Turns a decided duel into a blow-by-blow the arena can play.
 *
 * Presentation only: `determineDuelWinner` has already settled who wins, and
 * this just narrates the way there. Fully deterministic - no randomness - so
 * rerunning a battle replays the same exchanges in the same order.
 */
export function buildDuelScript(
  duel: DuelOutcome,
  fighterA: Fighter | undefined,
  fighterB: Fighter | undefined,
): DuelScript {
  const [finalPowerA, finalPowerB] = finalPowers(duel.scoreA, duel.scoreB, duel.winner);

  const movesA = fighterA ? fighterMoves(fighterA.types, fighterA.stats) : [];
  const movesB = fighterB ? fighterMoves(fighterB.types, fighterB.stats) : [];
  // A slot one side never filled is a walkover: there's no exchange to show,
  // only the final standing.
  if (movesA.length === 0 || movesB.length === 0) return { exchanges: [], finalPowerA, finalPowerB };

  // The quicker fighter opens. Ties go to A - arbitrary, but fixed, so the
  // same matchup always plays out in the same order.
  const first: BattleSide = (fighterB?.stats.speed ?? 0) > (fighterA?.stats.speed ?? 0) ? 'b' : 'a';

  const order: BattleSide[] = Array.from({ length: HITS_PER_SIDE * 2 }, (_, turn) =>
    turn % 2 === 0 ? first : other(first),
  );

  /*
   * The duel ends on the knockout, so everything after the winner's last blow
   * is cut. Without this the loser could be dropped to an empty bar and then
   * carry on trading hits, because the two sides don't necessarily land their
   * final blows on the same turn.
   */
  const trimmed = duel.winner === 'draw' ? order : order.slice(0, order.lastIndexOf(duel.winner) + 1);

  // Counted over the trimmed duel, not HITS_PER_SIDE: a fighter knocked out
  // early lands fewer blows, and his opponent's bar still has to reach its
  // final value on the last one that actually connects.
  const hitsToTake: Record<BattleSide, number> = { a: 0, b: 0 };
  trimmed.forEach((attacker) => {
    hitsToTake[other(attacker)] += 1;
  });

  const hitsTaken: Record<BattleSide, number> = { a: 0, b: 0 };

  const exchanges = trimmed.map((side, turn) => {
    const defender = other(side);
    hitsTaken[defender] += 1;

    const finalPower = defender === 'a' ? finalPowerA : finalPowerB;
    // The defender's bar walks from full down to its final value, one step per
    // blow taken, so the duel's last hit lands exactly on the result.
    const defenderPower = 100 + (finalPower - 100) * (hitsTaken[defender] / hitsToTake[defender]);

    const moves = side === 'a' ? movesA : movesB;
    return { side, move: moves[Math.floor(turn / 2) % moves.length]!, defenderPower };
  });

  return { exchanges, finalPowerA, finalPowerB };
}

/**
 * Both power bars as of a given blow. `-1` is the stare-down before the first
 * one, when neither fighter has taken anything yet.
 */
export function powersAfter(script: DuelScript, exchangeIndex: number): { a: number; b: number } {
  let a = 100;
  let b = 100;
  for (let i = 0; i <= exchangeIndex && i < script.exchanges.length; i += 1) {
    const exchange = script.exchanges[i]!;
    if (exchange.side === 'a') b = exchange.defenderPower;
    else a = exchange.defenderPower;
  }
  return { a, b };
}
