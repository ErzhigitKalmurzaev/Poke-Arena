import { ChevronDown } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  /** Shown as a badge next to the title so a collapsed section still says how many filters are on. */
  activeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible filter group built on native <details>/<summary> rather than a
 * JS disclosure component: it's keyboard- and screen-reader-correct for free,
 * and works before hydration. Ten stat sliders don't fit on screen at once,
 * so the ranges group ships collapsed.
 */
export function FilterSection({ title, activeCount = 0, defaultOpen = false, children }: FilterSectionProps) {
  return (
    <details open={defaultOpen} className="group px-3.5 py-1.5">
      {/* The row itself is the hit target, inset from the panel edge so the
          hover state reads as a rounded row rather than a full-bleed band. */}
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[10px] tracking-[0.14em] text-white/45 uppercase">{title}</span>
        <span className="flex items-center gap-2">
          {activeCount > 0 && (
            /* A pill rather than a fixed circle: the ranges group can carry a
               two-digit count, which `size-4` clipped. */
            <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand-red px-1 font-mono text-[9px] font-semibold tabular-nums text-black">
              {activeCount}
            </span>
          )}
          <ChevronDown className="size-3.5 text-white/30 transition-transform duration-200 group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-2 pt-2.5 pb-2">{children}</div>
    </details>
  );
}
