'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { getAllFighters, type Fighter } from '@/entities/fighter';
import {
  TEAM_SIZE,
  TEAM_SLOTS,
  assignFighterToTeam,
  clearTeamSlot,
  getTeams,
  renameTeamSlot,
  unassignFighterFromTeam,
  type AssignRejection,
  type TeamSlot,
} from '@/entities/team';
import { filterBySearch, useFighterSearch } from '@/features/fighter-search';

const REJECTION_TEXT: Record<AssignRejection, string> = {
  'team-full': `В команде уже ${TEAM_SIZE} бойцов — убери кого-нибудь`,
  'already-assigned': 'Боец уже занят другой стороной',
};

type DraftAction =
  | { kind: 'assign'; slot: TeamSlot; fighterId: string }
  | { kind: 'unassign'; slot: TeamSlot; fighterId: string }
  | { kind: 'rename'; slot: TeamSlot; name: string }
  | { kind: 'clear'; slot: TeamSlot };

/**
 * The whole drafting screen's state: the searchable fighter pool, which one
 * the carousel currently holds in front, and the two saved rosters.
 *
 * Team writes go straight to Dexie and come back through the `teams` query
 * rather than being mirrored in local state - the battle screen reads the
 * same query, so a draft change is already visible there without any
 * cross-screen plumbing.
 */
export function useTeamDraft() {
  const queryClient = useQueryClient();

  const { data: fighters = [], isLoading } = useQuery({
    queryKey: ['fighters'],
    queryFn: getAllFighters,
    staleTime: Infinity,
  });
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: getTeams });

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const { matchedIds, isPending } = useFighterSearch(query);
  // An empty query matches every id, so this is the full roster until the
  // user actually types - no separate "no search yet" branch needed.
  const pool = useMemo(() => filterBySearch(fighters, matchedIds), [fighters, matchedIds]);

  /*
   * activeIndex is stored raw and wrapped only on read. That keeps the wheel
   * endless in both directions (stepping past either end rolls around) and
   * means a shrinking pool - the user narrowing the search - can never leave
   * the index pointing past the last fighter.
   */
  const wrappedIndex = pool.length > 0 ? ((activeIndex % pool.length) + pool.length) % pool.length : 0;
  const activeFighter = pool[wrappedIndex] ?? null;

  const fightersById = useMemo(
    () => new Map(fighters.map((fighter: Fighter) => [fighter.id, fighter])),
    [fighters],
  );

  /** Which side each drafted fighter stands on - one lookup for both columns and the spotlight. */
  const assignmentByFighterId = useMemo(() => {
    const assignments = new Map<string, TeamSlot>();
    if (!teams) return assignments;
    for (const slot of TEAM_SLOTS) {
      for (const fighterId of teams[slot].fighterIds) assignments.set(fighterId, slot);
    }
    return assignments;
  }, [teams]);

  const teamFull = useMemo(() => {
    const full = { 'team-a': false, 'team-b': false } as Record<TeamSlot, boolean>;
    if (!teams) return full;
    for (const slot of TEAM_SLOTS) full[slot] = teams[slot].fighterIds.length >= TEAM_SIZE;
    return full;
  }, [teams]);

  const draftMutation = useMutation({
    mutationFn: async (action: DraftAction): Promise<string | null> => {
      switch (action.kind) {
        case 'assign': {
          const result = await assignFighterToTeam(action.slot, action.fighterId);
          return result.ok ? null : REJECTION_TEXT[result.reason];
        }
        case 'unassign':
          await unassignFighterFromTeam(action.slot, action.fighterId);
          return null;
        case 'rename':
          await renameTeamSlot(action.slot, action.name);
          return null;
        case 'clear':
          await clearTeamSlot(action.slot);
          return null;
      }
    },
    // The rejection message doubles as the reset: a successful action returns
    // null and clears whatever warning the previous one left on screen.
    onSuccess: async (rejection) => {
      setNotice(rejection);
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const dispatch = draftMutation.mutate;

  const step = useCallback((delta: number) => setActiveIndex((index) => index + delta), []);

  const select = useCallback((index: number) => setActiveIndex(index), []);

  /**
   * Spins the wheel to a random fighter from whatever the current search left
   * in the pool - a shortcut past scrolling 1300 of them, and the way to draft
   * a lineup you didn't pick yourself. Never lands on the fighter already in
   * front, or the button would sometimes look broken.
   */
  const randomize = useCallback(() => {
    if (pool.length === 0) return;
    if (pool.length === 1) {
      setActiveIndex(0);
      return;
    }
    let next = wrappedIndex;
    while (next === wrappedIndex) next = Math.floor(Math.random() * pool.length);
    setActiveIndex(next);
  }, [pool.length, wrappedIndex]);

  const search = useCallback((next: string) => {
    setQuery(next);
    // A new query renumbers the pool, so the old index would land on an
    // unrelated fighter. Start the narrowed wheel at its first result.
    setActiveIndex(0);
  }, []);

  /**
   * Brings a fighter to the front of the wheel - how clicking a team slot
   * gets back to that fighter's stats. One already filtered out by the
   * current search needs the search dropped first, or it has no slot to
   * scroll to.
   */
  const focusFighter = useCallback(
    (fighterId: string) => {
      const inPool = pool.findIndex((fighter) => fighter.id === fighterId);
      if (inPool >= 0) {
        setActiveIndex(inPool);
        return;
      }
      const inRoster = fighters.findIndex((fighter: Fighter) => fighter.id === fighterId);
      if (inRoster < 0) return;
      setQuery('');
      setActiveIndex(inRoster);
    },
    [pool, fighters],
  );

  const assign = useCallback(
    (slot: TeamSlot) => {
      if (activeFighter) dispatch({ kind: 'assign', slot, fighterId: activeFighter.id });
    },
    [activeFighter, dispatch],
  );

  const unassign = useCallback(
    (slot: TeamSlot, fighterId: string) => dispatch({ kind: 'unassign', slot, fighterId }),
    [dispatch],
  );

  const rename = useCallback(
    (slot: TeamSlot, name: string) => dispatch({ kind: 'rename', slot, name }),
    [dispatch],
  );

  const clear = useCallback((slot: TeamSlot) => dispatch({ kind: 'clear', slot }), [dispatch]);

  return {
    teams,
    isLoading: isLoading || !teams,
    pool,
    poolTotal: fighters.length,
    fightersById,
    activeIndex: wrappedIndex,
    activeFighter,
    assignedSlot: activeFighter ? (assignmentByFighterId.get(activeFighter.id) ?? null) : null,
    assignmentByFighterId,
    teamFull,
    query,
    isSearchPending: isPending,
    notice,
    search,
    step,
    select,
    randomize,
    focusFighter,
    assign,
    unassign,
    rename,
    clear,
  };
}
