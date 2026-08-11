'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { FighterCard, getAllFighters } from '@/entities/fighter';
import type { StatDefinition } from '@/entities/stat';
import { getStatRegistry } from '@/entities/stat';
import {
  filterByLegendary,
  filterByStatRange,
  filterByTypes,
  statBounds,
  statBoundsFromFighters,
  type StatRange,
} from '@/features/fighter-filter';
import { filterBySearch, useFighterSearch, SearchInput } from '@/features/fighter-search';
import { useAutoPagination } from '../model/useAutoPagination';
import { useCatalogFilters } from '../model/useCatalogFilters';
import { FilterSidebar } from './FilterSidebar';

// Capped at 4 columns: the container maxes out at 1560px, so a 5th column
// only shaves each card down to ~230px and crowds the stat block. 4 gives
// ~290px cards, which is what makes the grid read as composed rather than
// crammed.
const GRID_CLASS = 'grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 xl:grid-cols-4';

export function CatalogBrowser() {
  const [filters, setFilters] = useCatalogFilters();
  const { data: fighters, isLoading, isError, refetch } = useQuery({
    queryKey: ['fighters'],
    queryFn: getAllFighters,
    staleTime: Infinity,
  });
  // Base stats plus whatever custom stats users have created - a fresh
  // custom stat shows up as its own range filter without a code change.
  const { data: statRegistry = [] } = useQuery({ queryKey: ['statRegistry'], queryFn: getStatRegistry });

  const { matchedIds, isPending } = useFighterSearch(filters.q);

  const filtered = useMemo(() => {
    if (!fighters) return [];
    let result = filterBySearch(fighters, matchedIds);
    result = filterByTypes(result, filters.types);
    result = filterByLegendary(result, filters.legendary);
    for (const [statId, range] of Object.entries(filters.ranges)) {
      result = filterByStatRange(result, statId, range);
    }
    return result;
  }, [fighters, matchedIds, filters.types, filters.legendary, filters.ranges]);

  // Any change to the query/filters restarts paging from the first page.
  const resetKey = `${filters.q}|${filters.types.join(',')}|${filters.legendary}|${JSON.stringify(filters.ranges)}`;
  const { visibleCount, sentinelRef, hasMore } = useAutoPagination(filtered.length, resetKey);
  const visible = filtered.slice(0, visibleCount);

  /*
   * A custom stat has no place in the static dataset, so its slider bounds
   * have to be measured across the loaded roster (sparse values default to 0,
   * same as filterByStatRange). That's a full pass per custom stat, so all of
   * them are measured once here rather than on every sidebar render - base
   * stats need no such table, statBounds already memoizes them against the
   * immutable snapshot.
   */
  const customBounds = useMemo(() => {
    const bounds = new Map<string, StatRange>();
    for (const stat of statRegistry) {
      if (stat.source === 'custom') bounds.set(stat.id, statBoundsFromFighters(fighters ?? [], stat.id));
    }
    return bounds;
  }, [statRegistry, fighters]);

  const boundsFor = useCallback(
    (stat: StatDefinition): StatRange =>
      stat.source === 'base' ? statBounds(stat.id) : (customBounds.get(stat.id) ?? [0, 0]),
    [customBounds],
  );

  /*
   * Every handler below is stable for as long as the state it closes over is,
   * which is what lets FilterSidebar (a memo component holding ten range
   * sliders) sit out the re-renders auto-pagination fires while scrolling.
   */
  const setStatRange = useCallback(
    (statId: string, range: StatRange, bounds: StatRange) => {
      const nextRanges = { ...filters.ranges };
      // A range covering the full bounds isn't a filter - dropping the key
      // keeps it out of the URL and out of the active count.
      if (range[0] === bounds[0] && range[1] === bounds[1]) {
        delete nextRanges[statId];
      } else {
        nextRanges[statId] = range;
      }
      void setFilters({ ranges: nextRanges });
    },
    [filters.ranges, setFilters],
  );

  const toggleType = useCallback(
    (type: string) =>
      void setFilters({
        types: filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type],
      }),
    [filters.types, setFilters],
  );

  const setLegendary = useCallback((legendary: boolean) => void setFilters({ legendary }), [setFilters]);

  const setQuery = useCallback((q: string) => void setFilters({ q }), [setFilters]);

  const activeCount =
    filters.types.length + (filters.legendary ? 1 : 0) + Object.keys(filters.ranges).length + (filters.q ? 1 : 0);

  const resetFilters = useCallback(
    () => void setFilters({ q: '', types: [], legendary: false, ranges: {} }),
    [setFilters],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col px-6 py-7 sm:px-11">
      {/* Title, result count and search share one baseline over a hairline
          rule, so the page opens on a straight edge instead of three
          differently-aligned blocks. */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-white/8 pb-5">
        <div className="flex items-baseline gap-3">
          <h1 className="font-heading text-[42px] leading-none font-semibold" style={{ letterSpacing: '-.03em' }}>
            Покедекс
          </h1>
          <span className="rounded-full bg-white/6 px-2.5 py-1 font-mono text-[10.5px] tracking-[0.1em] text-white/45">
            {isLoading ? 'ЗАГРУЗКА…' : `${filtered.length} ИЗ ${fighters?.length ?? 0}`}
          </span>
        </div>
        <SearchInput value={filters.q} onChange={setQuery} isPending={isPending} />
      </div>

      {/*
        `items-start` so the filter panel is only as tall as its content
        (stretched, it rendered as a mostly-empty box down to the max-height).
        Sticky still has room to travel: a sticky grid item is positioned
        within its *grid area*, which spans the full row set by the tall
        fighter-grid column - not within its own height.
      */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[288px_1fr]">
        <FilterSidebar
          stats={statRegistry}
          boundsFor={boundsFor}
          selectedTypes={filters.types}
          legendaryOnly={filters.legendary}
          ranges={filters.ranges}
          activeCount={activeCount}
          onToggleType={toggleType}
          onLegendaryChange={setLegendary}
          onStatRange={setStatRange}
          onReset={resetFilters}
        />

        <div className="flex min-w-0 flex-col gap-5">
          {isError ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl border border-white/8 bg-card/60 p-6 text-[15px] text-white/70">
              <p>Не получилось загрузить данные. Проверь соединение и обнови страницу.</p>
              <button type="button" onClick={() => void refetch()} className="font-semibold text-brand-red underline">
                Повторить
              </button>
            </div>
          ) : isLoading ? (
            <CatalogSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl border border-white/8 bg-card/60 p-6 text-[15px] text-white/70">
              <p>Под эти фильтры бойцов нет — ослабь диапазон.</p>
              {activeCount > 0 && (
                <button type="button" onClick={resetFilters} className="font-semibold text-brand-red underline">
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={GRID_CLASS}>
                {visible.map((fighter) => (
                  <Link key={fighter.id} href={`/fighter/${fighter.id}`} className="h-full rounded-3xl">
                    <FighterCard fighter={fighter} />
                  </Link>
                ))}
              </div>

              {/*
                Sentinel + its own skeleton row: scrolling it into view loads
                the next page, and the skeletons make the growth read as
                loading rather than as a jump.
              */}
              {hasMore && (
                <div ref={sentinelRef} className={GRID_CLASS} aria-hidden>
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-[336px] animate-pulse rounded-3xl bg-card/50" />
                  ))}
                </div>
              )}

              <p className="pb-2 text-center font-mono text-[10.5px] tracking-[0.14em] text-white/35">
                {hasMore ? `ЗАГРУЖЕНО ${visible.length} ИЗ ${filtered.length}` : `ВСЕ ${filtered.length} ПОКАЗАНЫ`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="h-[336px] animate-pulse rounded-3xl bg-card/50" />
      ))}
    </div>
  );
}
