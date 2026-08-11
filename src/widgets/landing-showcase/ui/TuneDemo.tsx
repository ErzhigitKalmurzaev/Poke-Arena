'use client';

import { useState } from 'react';
import { ROSTER, STATS, toneRgba } from '../model/roster';

const HERO = ROSTER[0]!;
const MAX_POINTS = 7;
const POINT_STEP = 6;
const BAR_MAX = 220;

/**
 * The three accents are dark enough that as *text* on a dark surface they sit
 * near 3:1 (mint 3.6, blue 2.7 against the card). Mixed with white they keep
 * their identity and clear 4.5:1, so labels use these and the solid tokens stay
 * for fills, bars and glows.
 */
const MINT_TEXT = 'color-mix(in srgb, var(--brand-mint) 55%, #ffffff)';
const BLUE_TEXT = 'color-mix(in srgb, var(--brand-blue) 55%, #ffffff)';

const HISTORY_EXAMPLE = [
  { pair: 'Команда A — Команда B', stat: 'СКОРОСТЬ', score: '4:2', className: 'text-brand-red' },
  { pair: 'Команда A — Скамейка', stat: 'СП.АТАКА', score: '2:4', className: 'text-brand-blue' },
  { pair: 'Отряд 1 — Отряд 2', stat: 'ЗАЩИТА', score: '5:1', className: 'text-brand-mint' },
  { pair: 'Команда A — Команда B', stat: 'HP', score: '3:3', className: 'text-white' },
];

export function TuneDemo() {
  const [points, setPoints] = useState<Record<string, number>>({});

  const used = Object.values(points).reduce((sum, value) => sum + value, 0);
  const pointsLeft = MAX_POINTS - used;

  const bump = (key: string, delta: number) => {
    setPoints((prev) => {
      const current = prev[key] ?? 0;
      if (delta > 0 && used >= MAX_POINTS) return prev;
      if (delta < 0 && current === 0) return prev;
      return { ...prev, [key]: current + delta };
    });
  };

  return (
    <section id="tune" className="mx-auto w-full max-w-[1560px] px-6 pb-22 sm:px-11">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.08fr_1fr]">
        {/*
          Was a solid mint slab with black copy - the muted variants of that
          (`text-black/60`) landed near 2.5:1 and the stat rows were unreadable.
          Same panel, inverted: dark surface, mint kept for the glow, the bars
          and the "+" key, everything you actually read in white.
        */}
        <div className="relative overflow-hidden rounded-[38px] border border-white/8 bg-card p-9 sm:p-11">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(72% 58% at 8% 0%, ${toneRgba('mint', 0.3)}, transparent 66%)` }}
          />

          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.16em]" style={{ color: MINT_TEXT }}>
              ПРОКАЧКА · ПОПРОБУЙ
            </div>
            <h2 className="mt-3.5 font-heading text-[46px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1.02 }}>
              Раздай очки —
              <br />
              увидишь разницу
            </h2>

            <div className="mt-5.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-3">
              <span
                className="font-mono text-4xl font-semibold tabular-nums transition-colors duration-300"
                style={{ color: pointsLeft === 0 ? MINT_TEXT : '#ffffff' }}
              >
                {pointsLeft}
              </span>
              <span className="font-mono text-xs tracking-[0.12em] text-white/55">
                {pointsLeft === 0 ? 'ОЧКИ РАЗДАНЫ' : 'СВОБОДНЫХ ОЧКОВ'}
              </span>
              <button
                type="button"
                onClick={() => setPoints({})}
                disabled={used === 0}
                className="ml-auto rounded-full border border-white/15 px-4.5 py-2.5 text-[13px] font-semibold text-white/85 transition-colors duration-200 hover:border-white/30 hover:bg-white/8 hover:text-white disabled:pointer-events-none disabled:opacity-35"
              >
                Сбросить правки
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {STATS.map((stat) => {
                const base = HERO.stats[stat.key] ?? 0;
                const pts = points[stat.key] ?? 0;
                const final = base + pts * POINT_STEP;
                const basePct = Math.min(100, Math.round((base / BAR_MAX) * 100));
                const addPct = Math.min(100 - basePct, Math.round(((pts * POINT_STEP) / BAR_MAX) * 100));
                return (
                  /* Tighter tracks below `sm` - at the old fixed widths the
                     four columns overflowed the card on a phone. */
                  <div
                    key={stat.key}
                    className="grid grid-cols-[62px_1fr_78px_80px] items-center gap-2 sm:grid-cols-[104px_1fr_108px_96px] sm:gap-3.5"
                  >
                    <span className="truncate font-mono text-[11px] text-white/55 sm:text-[11.5px]">{stat.label}</span>
                    <div className="relative h-2.5 rounded-full bg-white/8">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${basePct}%` }} />
                      <div
                        className="absolute inset-y-0 rounded-full bg-brand-mint transition-[width] duration-[380ms]"
                        style={{
                          left: `${basePct}%`,
                          width: `${addPct}%`,
                          boxShadow: pts > 0 ? `0 0 14px ${toneRgba('mint', 0.85)}` : undefined,
                        }}
                      />
                    </div>
                    <span className="text-right font-mono text-[12px] tabular-nums sm:text-[12.5px]">
                      <span className="text-white/45">{base}</span>
                      <span className="text-white/30"> → </span>
                      <span className="font-semibold transition-colors duration-300" style={{ color: pts > 0 ? MINT_TEXT : '#ffffff' }}>
                        {final}
                      </span>
                    </span>
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => bump(stat.key, -1)}
                        disabled={pts === 0}
                        aria-label={`Убрать очко из ${stat.label}`}
                        className="grid size-7.5 place-items-center rounded-full bg-white/8 font-mono text-[15px] text-white transition-colors duration-200 hover:bg-white/16 disabled:pointer-events-none disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-4.5 text-center font-mono text-[13px] font-semibold tabular-nums text-white/85">
                        {pts}
                      </span>
                      <button
                        type="button"
                        onClick={() => bump(stat.key, 1)}
                        disabled={pointsLeft === 0}
                        aria-label={`Добавить очко в ${stat.label}`}
                        className="grid size-7.5 place-items-center rounded-full bg-brand-mint font-mono text-[15px] font-semibold text-black transition-[filter,opacity] duration-200 hover:brightness-115 disabled:pointer-events-none disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5.5 text-[13.5px] leading-relaxed text-white/60">
              База — снимок покедекса, правки лежат отдельным слоем. Сброс возвращает бойца в исходное состояние.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="relative flex-1 overflow-hidden rounded-[38px] border border-white/8 bg-card p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(74% 56% at 88% 0%, ${toneRgba('blue', 0.28)}, transparent 66%)` }}
            />
            <div className="relative">
              <div className="font-mono text-[11px] tracking-[0.16em]" style={{ color: BLUE_TEXT }}>
                ПРЕВЬЮ · СКОРО
              </div>
              <h2 className="mt-3.5 font-heading text-[40px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1.05 }}>
                Каждый бой останется в базе
              </h2>
              <div className="mt-6.5 flex flex-col gap-px overflow-hidden rounded-2xl bg-white/8">
                {HISTORY_EXAMPLE.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-black px-4.5 py-3.5 font-mono text-xs">
                    <span className="truncate text-white/85">{row.pair}</span>
                    <span className="text-white/50">{row.stat}</span>
                    <span className={`font-semibold ${row.className}`}>{row.score}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-[11px] tracking-[0.06em] text-white/45">
                ПРИМЕР ВЁРСТКИ — ИСТОРИЯ БОЁВ ПОЯВИТСЯ В ПРИЛОЖЕНИИ
              </p>
            </div>
          </div>

          {/* The one saturated panel left on the page, and it earns it as the
              closing call to action - white copy on the red, not black. */}
          <a
            href="/login"
            className="group block rounded-[38px] bg-brand-red p-9 text-white transition-shadow duration-300 hover:shadow-[0_26px_60px_-24px_rgba(214,40,40,0.9)]"
          >
            <div className="font-heading text-[42px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1 }}>
              Отряд ждёт капитана
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-[15px] text-white/85">Собери состав и запусти первый бой</span>
              <span className="flex items-center gap-2.5 rounded-full bg-black px-6.5 py-3.5 text-[15px] font-semibold text-white">
                Открыть арену
                <span className="[animation:nudge_1.6s_ease-in-out_infinite]">→</span>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
