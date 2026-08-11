'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import {
  TOTAL_STAT_ID,
  buildDuelScript,
  determineWinner,
  explainBattle,
  type BattleOutcome,
} from '@/entities/battle';
import { getAllFighters, type Fighter } from '@/entities/fighter';
import { getStatRegistry } from '@/entities/stat';
import { getTeams } from '@/entities/team';
import { getBattleReadiness } from './battleReadiness';
import { resolveTeamFighters } from './resolveTeamFighters';

/**
 * Owns the whole "run a battle between the two saved teams" flow: loads the
 * teams and roster, tracks which parameter is being compared, decides whether
 * the teams are battle-ready, and computes the outcome on demand.
 *
 * The outcome lives in component state (not Dexie or the query cache) - it's a
 * one-off result of the current lineup, not something that needs to survive a
 * reload. The chosen parameter does live in the URL, so a reload or a shared
 * link comes back to the same comparison.
 */
export function useBattleRun() {
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: getTeams });
  const { data: fighters = [] } = useQuery({ queryKey: ['fighters'], queryFn: getAllFighters, staleTime: Infinity });
  // Base stats plus every custom one, so a user-created parameter becomes
  // selectable here without this screen having to know it exists.
  const { data: stats = [] } = useQuery({ queryKey: ['statRegistry'], queryFn: getStatRegistry });

  const [statId, setStatId] = useQueryState('stat', parseAsString.withDefault(TOTAL_STAT_ID));
  const [result, setResult] = useState<BattleOutcome | null>(null);

  /*
   * A result is only meaningful for the parameter it was fought on. Reading it
   * through this check (rather than clearing it in an effect when `statId`
   * changes) means switching the comparison can never leave a verdict on
   * screen that the selector no longer matches.
   */
  const outcome = result && result.statId === statId ? result : null;

  const fightersById = useMemo(() => new Map(fighters.map((fighter: Fighter) => [fighter.id, fighter])), [fighters]);
  const readiness = teams ? getBattleReadiness(teams) : { ready: false };

  /**
   * Both rosters as actual fighters. Resolved here rather than inside `run`
   * because the screen draws the two lineups before the battle starts - and
   * once it does, the duels read from the very same arrays.
   */
  const lineups = useMemo(
    () => ({
      a: teams ? resolveTeamFighters(teams['team-a'].fighterIds, fightersById) : [],
      b: teams ? resolveTeamFighters(teams['team-b'].fighterIds, fightersById) : [],
    }),
    [teams, fightersById],
  );

  /**
   * The blow-by-blow for every round, built once the outcome exists. Derived
   * from the settled result, so the arena can only ever narrate the battle
   * that was actually computed.
   */
  const scripts = useMemo(
    () => (outcome ? outcome.duels.map((duel, slot) => buildDuelScript(duel, lineups.a[slot], lineups.b[slot])) : []),
    [outcome, lineups],
  );

  /** The numbers behind the verdict - what the breakdown panel renders. */
  const explanation = useMemo(
    () => (outcome ? explainBattle(outcome, lineups.a, lineups.b) : null),
    [outcome, lineups],
  );

  const run = () => {
    if (!teams || !readiness.ready) return;
    setResult(determineWinner(lineups.a, lineups.b, statId));
  };

  const reset = () => setResult(null);

  return {
    teams,
    fightersById,
    lineups,
    readiness,
    stats,
    statId,
    setStatId: (next: string) => void setStatId(next),
    outcome,
    scripts,
    explanation,
    run,
    reset,
  };
}
