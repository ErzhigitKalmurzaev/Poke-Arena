'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { BASE_STAT_REGISTRY } from '@/entities/stat';
import { FighterCard, getAllFighters, type Fighter } from '@/entities/fighter';
import { filterByLegendary, filterByStatRange, filterByTypes, statBounds, LegendaryFilterToggle, StatRangeFilter, TypeFilterChips } from '@/features/fighter-filter';
import { filterBySearch, useFighterSearch, SearchInput } from '@/features/fighter-search';
import { useCatalogFilters } from '../model/useCatalogFilters';

const COLUMNS = 4;
const ROW_HEIGHT = 296;

export function CatalogBrowser() {
  const [filters, setFilters] = useCatalogFilters();
  const { data: fighters, isLoading, isError, refetch } = useQuery({
    queryKey: ['fighters'],
    queryFn: getAllFighters,
    staleTime: Infinity,
  });

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

  const rows = useMemo(() => {
    const chunks: Fighter[][] = [];
    for (let i = 0; i < filtered.length; i += COLUMNS) {
      chunks.push(filtered.slice(i, i + COLUMNS));
    }
    return chunks;
  }, [filtered]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
  });

  const setStatRange = (statId: string, range: [number, number]) => {
    const bounds = statBounds(statId);
    const nextRanges = { ...filters.ranges };
    if (range[0] === bounds[0] && range[1] === bounds[1]) {
      delete nextRanges[statId];
    } else {
      nextRanges[statId] = range;
    }
    void setFilters({ ranges: nextRanges });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col gap-6 px-6 py-8 sm:px-11">
      <div className="flex items-end justify-between gap-6">
        <h1 className="font-heading text-5xl font-semibold" style={{ letterSpacing: '-.03em' }}>
          Покедекс
        </h1>
        <SearchInput value={filters.q} onChange={(q) => void setFilters({ q })} isPending={isPending} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-6">
          <TypeFilterChips
            selected={filters.types}
            onToggle={(type) =>
              void setFilters({
                types: filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type],
              })
            }
          />
          <LegendaryFilterToggle checked={filters.legendary} onCheckedChange={(legendary) => void setFilters({ legendary })} />
          <div className="flex flex-col gap-4 rounded-[24px] bg-card p-5">
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/45">ДИАПАЗОНЫ</span>
            {BASE_STAT_REGISTRY.map((stat) => {
              const [min, max] = statBounds(stat.id);
              const value = filters.ranges[stat.id] ?? [min, max];
              return (
                <StatRangeFilter
                  key={stat.id}
                  label={stat.label.toUpperCase()}
                  unit={stat.unit}
                  min={min}
                  max={max}
                  value={value}
                  onValueChange={(range) => setStatRange(stat.id, range)}
                />
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="font-mono text-xs text-white/45">
            {isLoading ? 'ЗАГРУЗКА…' : `НАЙДЕНО ${filtered.length} ИЗ ${fighters?.length ?? 0}`}
          </div>

          {/*
            Every branch below shares this exact box (h-[calc(100vh-220px)])
            so switching between loading/empty/error/loaded never shifts the
            page - only what's inside the box changes.
          */}
          {isError ? (
            <div className="flex h-[calc(100vh-220px)] flex-col items-start gap-3 rounded-[22px] bg-card p-6 text-[15px] text-white/70">
              <p>Не получилось загрузить данные. Проверь соединение и обнови страницу.</p>
              <button type="button" onClick={() => void refetch()} className="font-semibold text-brand-red underline">
                Повторить
              </button>
            </div>
          ) : isLoading ? (
            <CatalogSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex h-[calc(100vh-220px)] items-start rounded-[22px] bg-card p-6 text-[15px] text-white/70">
              Под эти фильтры бойцов нет — ослабь диапазон.
            </div>
          ) : (
            <div ref={scrollRef} className="h-[calc(100vh-220px)] overflow-y-auto">
              <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                {virtualizer.getVirtualItems().map((virtualRow) => (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 grid w-full grid-cols-4 gap-4 pb-4"
                    style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
                  >
                    {rows[virtualRow.index]?.map((fighter) => <FighterCard key={fighter.id} fighter={fighter} />)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid h-[calc(100vh-220px)] grid-cols-4 gap-4 overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="h-[280px] animate-pulse rounded-[24px] bg-card" />
      ))}
    </div>
  );
}
