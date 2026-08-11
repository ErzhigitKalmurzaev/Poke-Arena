'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { buildDuelScript, determineWinner, type BattleOutcome } from '@/entities/battle';
import { getAllFighters, type Fighter } from '@/entities/fighter';
import { getTeams } from '@/entities/team';
import { getBattleReadiness } from './battleReadiness';
import { resolveTeamFighters } from './resolveTeamFighters';

/**
 * Owns the whole "run a battle between the two saved teams" flow: loads
 * the teams and roster, decides whether they're battle-ready, and computes
 * the outcome on demand. The outcome lives in component state (not Dexie
 * or the query cache) - it's a one-off result of the current lineup, not
 * something that needs to survive a reload.
 */
export function useBattleRun() {
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: getTeams });
  const { data: fighters = [] } = useQuery({ queryKey: ['fighters'], queryFn: getAllFighters, staleTime: Infinity });
  const [outcome, setOutcome] = useState<BattleOutcome | null>(null);

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

  const run = () => {
    if (!teams || !readiness.ready) return;
    setOutcome(determineWinner(lineups.a, lineups.b));
  };

  const reset = () => setOutcome(null);

  return { teams, fightersById, lineups, readiness, outcome, scripts, run, reset };
}
