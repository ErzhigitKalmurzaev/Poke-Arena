'use client';

import { Undo2 } from 'lucide-react';
import { Slider } from '@/shared/ui/slider';

/** PokeAPI's ceiling for a single battle stat - the same scale the cards draw against. */
const NATURAL_MAX = 255;

interface StatSliderFieldProps {
  id: string;
  label: string;
  value: number;
  /** The untouched dataset value, so an edit can show what it moved away from. */
  pristine: number | undefined;
  accent: string;
  error?: string;
  onChange: (value: number) => void;
  onBlur: () => void;
}

/**
 * One battle stat as a slider plus an exact number field.
 *
 * The slider is what makes editing feel direct - drag and the bar, the total
 * and the overall rating all move at once. The number field stays because a
 * slider alone can't hit an exact value, and because typing is how anyone sets
 * a specific figure they already have in mind.
 */
export function StatSliderField({
  id,
  label,
  value,
  pristine,
  accent,
  error,
  onChange,
  onBlur,
}: StatSliderFieldProps) {
  const isChanged = pristine !== undefined && value !== pristine;
  // A typed value can legitimately exceed the natural ceiling, and a slider
  // pinned at its max would drag it back down the moment it's touched.
  const sliderMax = Math.max(NATURAL_MAX, value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
          {label.toUpperCase()}
        </label>

        {isChanged && (
          <button
            type="button"
            onClick={() => onChange(pristine)}
            title={`Вернуть ${pristine}`}
            className="flex items-center gap-1 rounded-full bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/55 transition-colors hover:bg-white/16 hover:text-white"
          >
            <Undo2 className="size-2.5" />
            было {pristine}
          </button>
        )}

        <input
          id={id}
          type="number"
          value={value}
          onBlur={onBlur}
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange(Number.isFinite(next) ? next : 0);
          }}
          aria-label={label}
          className="ml-auto w-14 rounded-md border border-white/10 bg-black/40 px-1.5 py-1 text-right font-mono text-[12.5px] tabular-nums outline-none focus:border-white/30 [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <Slider
        value={[value]}
        min={0}
        max={sliderMax}
        onValueChange={(next) => {
          if (Array.isArray(next)) onChange(next[0] ?? 0);
        }}
        onValueCommitted={onBlur}
        aria-label={label}
      />

      {/* A second read of the same number: the bar makes the value comparable
          against the ceiling at a glance, which the field alone never is. */}
      <span className="h-1 overflow-hidden rounded-full bg-white/8">
        <span
          className="block h-full rounded-full transition-[width,background] duration-200"
          style={{
            width: `${Math.min(100, (value / NATURAL_MAX) * 100)}%`,
            background: isChanged ? accent : 'rgba(255,255,255,.35)',
          }}
        />
      </span>

      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
