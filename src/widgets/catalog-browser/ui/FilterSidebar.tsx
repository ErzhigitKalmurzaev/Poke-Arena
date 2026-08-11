'use client';

import { RotateCcw } from 'lucide-react';
import { memo } from 'react';
import type { StatDefinition } from '@/entities/stat';
import { LegendaryFilterToggle, StatRangeFilter, TypeFilterChips, type StatRange } from '@/features/fighter-filter';
import type { StatRanges } from '../model/statRangesParser';
import { FilterSection } from './FilterSection';

interface FilterSidebarProps {
  stats: StatDefinition[];
  boundsFor: (stat: StatDefinition) => StatRange;
  selectedTypes: string[];
  legendaryOnly: boolean;
  ranges: StatRanges;
  activeCount: number;
  onToggleType: (type: string) => void;
  onLegendaryChange: (value: boolean) => void;
  onStatRange: (statId: string, range: StatRange, bounds: StatRange) => void;
  onReset: () => void;
}

/**
 * Memoized: none of this depends on how far the fighter grid has been paged,
 * yet it holds ten range sliders that would otherwise re-render (and re-measure
 * their bounds) on every scroll-triggered page load. Every callback prop the
 * catalog passes in is stabilized with useCallback for this reason.
 */
export const FilterSidebar = memo(function FilterSidebar({
  stats,
  boundsFor,
  selectedTypes,
  legendaryOnly,
  ranges,
  activeCount,
  onToggleType,
  onLegendaryChange,
  onStatRange,
  onReset,
}: FilterSidebarProps) {
  const activeRangeCount = Object.keys(ranges).length;

  return (
    /*
     * The rail is a scroll container in its own right, pinned under the
     * header. Previously it was only `sticky`, so with the ranges expanded it
     * was taller than the viewport and the only way to reach the bottom
     * filters was to scroll the whole page - which dragged the fighter grid
     * along with it. Now the panel scrolls internally and `overscroll-contain`
     * stops that scroll from chaining to the page once it bottoms out.
     */
    <aside
      className="flex flex-col rounded-3xl border border-white/8 bg-card/50 lg:sticky lg:max-h-[calc(100vh-var(--app-header-h)-3.5rem)] lg:top-[calc(var(--app-header-h)+1.5rem)]"
    >
      <div className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-white/8 px-5">
        <span className="font-heading text-[15px] font-semibold">Фильтры</span>
        {activeCount > 0 ? (
          /* Red, like every other "this is on" mark in the panel - the reset
             is the one control that only exists while something is active. */
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-full bg-brand-red/14 py-1 pr-2.5 pl-2 font-mono text-[10px] tracking-[0.08em] text-brand-red uppercase transition-colors hover:bg-brand-red/24"
          >
            <RotateCcw className="size-3" />
            Сбросить {activeCount}
          </button>
        ) : (
          <span className="font-mono text-[10px] tracking-[0.08em] text-white/25 uppercase">Не заданы</span>
        )}
      </div>

      {/* Hairlines between the groups run edge to edge and are owned here, so
          a section never has to know whether it is the first one. */}
      <div className="scrollbar-slim flex min-h-0 flex-col divide-y divide-white/6 overflow-y-auto overscroll-contain py-1.5">
        <FilterSection title="Стихии" activeCount={selectedTypes.length} defaultOpen>
          <TypeFilterChips selected={selectedTypes} onToggle={onToggleType} />
        </FilterSection>

        <FilterSection title="Особые" activeCount={legendaryOnly ? 1 : 0} defaultOpen>
          <LegendaryFilterToggle checked={legendaryOnly} onCheckedChange={onLegendaryChange} />
        </FilterSection>

        <FilterSection title="Диапазоны" activeCount={activeRangeCount}>
          <div className="flex flex-col gap-5">
            {stats.map((stat) => {
              const bounds = boundsFor(stat);
              const value = ranges[stat.id] ?? bounds;
              return (
                <StatRangeFilter
                  key={stat.id}
                  label={stat.label.toUpperCase()}
                  unit={stat.unit}
                  min={bounds[0]}
                  max={bounds[1]}
                  value={value}
                  isActive={ranges[stat.id] !== undefined}
                  onValueChange={(range) => onStatRange(stat.id, range, bounds)}
                />
              );
            })}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
});
