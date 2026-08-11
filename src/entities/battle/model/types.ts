export type BattleSide = 'a' | 'b';

export interface DuelOutcome {
  slot: number;
  fighterAId: string | null;
  fighterBId: string | null;
  scoreA: number;
  scoreB: number;
  winner: BattleSide | 'draw';
}

export interface BattleOutcome {
  /** Which comparison parameter this battle was decided on - see fighterStatScore. */
  statId: string;
  duels: DuelOutcome[];
  winsA: number;
  winsB: number;
  winner: BattleSide | 'draw';
}
