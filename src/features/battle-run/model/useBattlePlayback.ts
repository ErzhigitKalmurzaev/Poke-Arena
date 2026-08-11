'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BattleOutcome, DuelScript } from '@/entities/battle';
import { buildBattleTimeline, STEP_MS, type BattleStep } from './battleTimeline';

export interface BattlePlayback {
  /** The beat on screen, or null once the battle has finished playing. */
  step: BattleStep | null;
  isPlaying: boolean;
  skip: () => void;
}

/**
 * Walks the battle timeline in real time.
 *
 * Pure presentation: `determineWinner` decided everything before this hook
 * ever runs, so skipping ahead only changes how fast the user sees it. A
 * chained timeout (not an interval) means `skip` just parks the cursor at the
 * end and the chain stops on its own.
 */
export function useBattlePlayback(outcome: BattleOutcome | null, scripts: DuelScript[]): BattlePlayback {
  const timeline = useMemo(() => (outcome ? buildBattleTimeline(outcome, scripts) : []), [outcome, scripts]);

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState<BattleOutcome | null>(null);

  // Rewind during render rather than in an effect: a rerun hands over a fresh
  // outcome, and this way round one is never painted for a frame with the
  // previous battle's cursor still on it.
  const isNewBattle = playing !== outcome;
  if (isNewBattle) {
    setPlaying(outcome);
    setCursor(0);
  }
  const position = isNewBattle ? 0 : cursor;
  const step = timeline[position] ?? null;

  useEffect(() => {
    if (!step) return;
    const timer = setTimeout(() => setCursor((current) => current + 1), STEP_MS[step.kind]);
    return () => clearTimeout(timer);
  }, [step]);

  return {
    step,
    isPlaying: step !== null,
    skip: () => setCursor(timeline.length),
  };
}
