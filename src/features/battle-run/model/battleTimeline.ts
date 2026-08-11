import type { BattleOutcome, DuelScript } from '@/entities/battle';

/**
 * One beat of the battle. Flattening every round into a single list means
 * playback is just an index walking forward, and "skip to the end" is a jump
 * to the last entry rather than a pile of nested counters.
 */
export type BattleStep =
  | { kind: 'intro'; duelIndex: number }
  | { kind: 'exchange'; duelIndex: number; exchangeIndex: number }
  | { kind: 'verdict'; duelIndex: number };

/** How long each beat holds. The stare-down is brief; the result gets time to land. */
export const STEP_MS: Record<BattleStep['kind'], number> = {
  intro: 520,
  exchange: 640,
  verdict: 820,
};

export function buildBattleTimeline(outcome: BattleOutcome, scripts: DuelScript[]): BattleStep[] {
  const steps: BattleStep[] = [];

  outcome.duels.forEach((_, duelIndex) => {
    steps.push({ kind: 'intro', duelIndex });
    scripts[duelIndex]?.exchanges.forEach((_, exchangeIndex) =>
      steps.push({ kind: 'exchange', duelIndex, exchangeIndex }),
    );
    steps.push({ kind: 'verdict', duelIndex });
  });

  return steps;
}

/** Total run time, so the UI can tell the user what they're skipping. */
export function timelineDurationMs(steps: BattleStep[]): number {
  return steps.reduce((total, step) => total + STEP_MS[step.kind], 0);
}
