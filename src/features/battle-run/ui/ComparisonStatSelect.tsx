'use client';

import { Sigma } from 'lucide-react';
import { TOTAL_STAT_ID } from '@/entities/battle';
import type { StatDefinition } from '@/entities/stat';

interface ComparisonStatSelectProps {
  /** Base registry plus every custom stat, in registry order. */
  stats: StatDefinition[];
  value: string;
  /** Set while a battle is playing - switching mid-fight would retire the result on screen. */
  disabled?: boolean;
  onChange: (statId: string) => void;
}

/**
 * Which parameter the battle compares. Custom stats sit in the same row as the
 * base ones and are picked the same way - the only thing marking them out is a
 * dot, so a user-invented parameter reads as first-class rather than as an
 * extra mode.
 *
 * A row of pills rather than a dropdown: the whole set of comparable
 * parameters is the interesting part of this screen, and a closed select would
 * hide the fact that a custom stat has joined it.
 */
export function ComparisonStatSelect({ stats, value, disabled, onChange }: ComparisonStatSelectProps) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2 disabled:opacity-45">
      <legend className="font-mono text-[9.5px] tracking-[0.12em] text-white/40">ПАРАМЕТР СРАВНЕНИЯ</legend>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatPill
          active={value === TOTAL_STAT_ID}
          onClick={() => onChange(TOTAL_STAT_ID)}
          title="Сумма всех характеристик бойца"
        >
          <Sigma className="size-3" />
          Все характеристики
        </StatPill>

        {stats.map((stat) => (
          <StatPill
            key={stat.id}
            active={value === stat.id}
            onClick={() => onChange(stat.id)}
            title={stat.unit ? `${stat.label}, ${stat.unit}` : stat.label}
          >
            {stat.source === 'custom' && (
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: value === stat.id ? 'currentColor' : 'var(--brand-mint)' }}
              />
            )}
            {stat.label}
          </StatPill>
        ))}
      </div>
    </fieldset>
  );
}

function StatPill({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap transition-colors ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/12 text-white/55 not-disabled:hover:border-white/30 not-disabled:hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
