'use client';

import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { Slider } from '@/shared/ui/slider';
import type { StatRange } from '../model/filterByStatRange';

// Long enough that a drag across the rail reads as one continuous gesture -
// the expensive part (refiltering ~1300 fighters, pushing the URL) only runs
// once the user actually stops, not on every pointer-move tick mid-drag.
const COMMIT_DEBOUNCE_MS = 350;

interface StatRangeFilterProps {
  label: string;
  unit?: string;
  min: number;
  max: number;
  value: StatRange;
  /** Narrowed from the full [min, max] - drives the accent colour and the reset affordance. */
  isActive?: boolean;
  onValueChange: (value: StatRange) => void;
}

type Edge = 'lo' | 'hi';

/**
 * Range filter with both a slider and two number inputs. Dragging alone is
 * hopeless on the wide stats (weight spans 0-10000, so one pixel is ~35
 * units): the inputs make an exact value reachable, while the slider stays
 * for coarse exploration.
 */
export function StatRangeFilter({ label, unit, min, max, value, isActive, onValueChange }: StatRangeFilterProps) {
  /*
   * Typing is buffered here and only committed on blur/Enter. Committing (and
   * therefore clamping) on every keystroke is broken for typed input: entering
   * "120" clamps the intermediate "1" up to the minimum, the controlled input
   * re-renders to that clamped value, and the remaining keystrokes append to
   * it - "120" actually landed as 200. While `draft` is null the inputs show
   * the committed value, so the slider and the fields can never disagree.
   */
  const [draft, setDraft] = useState<{ edge: Edge; text: string } | null>(null);

  /*
   * Dragging updates this instantly so the thumb (and the number fields)
   * track the pointer with no lag. The actual commit - filtering the catalog
   * and pushing the range into the URL - only fires once `live` has stopped
   * changing for COMMIT_DEBOUNCE_MS, via the effect below.
   */
  const [live, setLive] = useState<StatRange>(value);
  const debounced = useDebouncedValue(live, COMMIT_DEBOUNCE_MS);

  // Committed changes from outside (reset button, a typed-and-blurred value)
  // arrive through `value` - mirror them so the slider never fights it. Adjusting
  // state during render (rather than in an effect) skips the extra render that
  // committing-then-syncing would otherwise cause.
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue[0] !== value[0] || prevValue[1] !== value[1]) {
    setPrevValue(value);
    setLive(value);
  }

  useEffect(() => {
    if (debounced[0] !== value[0] || debounced[1] !== value[1]) {
      onValueChange(debounced);
    }
    // Re-running this when `value`/`onValueChange` change would refire it on
    // every parent render - it only needs to react to the debounced value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const handleSlider = (next: number | readonly number[]) => {
    if (!Array.isArray(next)) return;
    setDraft(null);
    setLive([next[0] ?? min, next[1] ?? max]);
  };

  // Typing a value and pressing Enter/blurring is already a deliberate,
  // one-shot commit - it applies immediately, no debounce needed.
  const commit = (edge: Edge, raw: string) => {
    setDraft(null);
    if (raw.trim() === '') return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(Math.max(Math.round(parsed), min), max);
    const next: StatRange =
      edge === 'lo' ? [Math.min(clamped, value[1]), value[1]] : [value[0], Math.max(clamped, value[0])];
    setLive(next);
    onValueChange(next);
  };

  const inputClass =
    'w-14 rounded-lg border border-white/8 bg-black/35 py-1 text-center font-mono text-[11px] tabular-nums text-white/85 outline-none transition-colors hover:border-white/16 focus:border-white/30 focus:text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

  const edgeInput = (edge: Edge) => (
    <input
      type="number"
      inputMode="numeric"
      value={draft?.edge === edge ? draft.text : String(edge === 'lo' ? live[0] : live[1])}
      min={min}
      max={max}
      onChange={(event) => setDraft({ edge, text: event.target.value })}
      onBlur={(event) => commit(edge, event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          setDraft(null);
        }
      }}
      aria-label={`${label}: ${edge === 'lo' ? 'минимум' : 'максимум'}`}
      className={inputClass}
    />
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        {/* Long stat names ("специальная защита") must give way to the number
            fields rather than push them out of the rail. */}
        <span
          className={`min-w-0 truncate font-mono text-[10px] tracking-[0.1em] ${isActive ? 'text-white/70' : 'text-white/40'}`}
        >
          {label}
          {unit ? <span className="text-white/30"> · {unit}</span> : null}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {edgeInput('lo')}
          <span className="text-[10px] text-white/25">–</span>
          {edgeInput('hi')}
        </div>
      </div>

      {/*
        Taller track and bigger thumbs than the shared default - a 12px thumb
        in a 288px rail is a poor pointer target, and there are ten of them.
        An untouched range spans the full bounds, so it stays grey; only a
        narrowed one earns the accent.
      */}
      <Slider
        min={min}
        max={max}
        value={live}
        onValueChange={handleSlider}
        aria-label={label}
        className={`py-1 [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-track]]:h-1.5 ${
          isActive ? '' : '[&_[data-slot=slider-range]]:bg-white/18'
        }`}
      />
    </div>
  );
}
