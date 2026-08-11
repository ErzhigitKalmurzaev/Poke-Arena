'use client';

import { useState } from 'react';
import { ROSTER, STATS } from '../model/roster';

const HERO = ROSTER[0]!;
const MAX_POINTS = 7;
const POINT_STEP = 6;
const BAR_MAX = 220;

const HISTORY_EXAMPLE = [
  { pair: 'Команда A — Команда B', stat: 'СКОРОСТЬ', score: '4:2', className: 'text-brand-amber' },
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
    <section id="tune" className="mx-auto max-w-[1560px] px-6 pb-22 sm:px-11">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.08fr_1fr]">
        <div className="rounded-[38px] bg-brand-mint p-9 text-black sm:p-11">
          <div className="font-mono text-[11px] tracking-[0.16em] text-black/55">ПРОКАЧКА · ПОПРОБУЙ</div>
          <h2 className="mt-3.5 font-heading text-[46px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1.02 }}>
            Раздай очки —
            <br />
            увидишь разницу
          </h2>
          <div className="mt-5.5 flex items-baseline gap-2.5">
            <span className="font-mono text-4xl font-semibold">{pointsLeft}</span>
            <span className="font-mono text-xs tracking-[0.12em] text-black/60">СВОБОДНЫХ ОЧКОВ</span>
            <button
              type="button"
              onClick={() => setPoints({})}
              className="ml-auto rounded-full border border-black/25 px-4.5 py-2.5 text-[13px] font-semibold"
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
                <div key={stat.key} className="grid grid-cols-[104px_1fr_108px_96px] items-center gap-3.5">
                  <span className="font-mono text-[11.5px] text-black/65">{stat.label}</span>
                  <div className="relative h-2.5 rounded-full bg-black/13">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-black/45" style={{ width: `${basePct}%` }} />
                    <div
                      className="absolute inset-y-0 rounded-full bg-black transition-[width] duration-[380ms]"
                      style={{ left: `${basePct}%`, width: `${addPct}%` }}
                    />
                  </div>
                  <span className="text-right font-mono text-[12.5px] font-semibold">
                    {base} → {final}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => bump(stat.key, -1)}
                      aria-label={`Убрать очко из ${stat.label}`}
                      className="grid h-7.5 w-7.5 place-items-center rounded-full bg-black/12 font-mono text-[15px]"
                    >
                      −
                    </button>
                    <span className="min-w-4.5 text-center font-mono text-[13px] font-semibold">{pts}</span>
                    <button
                      type="button"
                      onClick={() => bump(stat.key, 1)}
                      aria-label={`Добавить очко в ${stat.label}`}
                      className="grid h-7.5 w-7.5 place-items-center rounded-full bg-black font-mono text-[15px] text-brand-mint"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5.5 text-[13.5px] leading-relaxed text-black/62">
            База — снимок покедекса, правки лежат отдельным слоем. Сброс возвращает бойца в исходное состояние.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex-1 rounded-[38px] bg-card p-9">
            <div className="font-mono text-[11px] tracking-[0.16em] text-brand-blue">ПРЕВЬЮ · СКОРО</div>
            <h2 className="mt-3.5 font-heading text-[40px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1.05 }}>
              Каждый бой останется в базе
            </h2>
            <div className="mt-6.5 flex flex-col gap-px overflow-hidden rounded-2xl bg-white/8">
              {HISTORY_EXAMPLE.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-black px-4.5 py-3.5 font-mono text-xs">
                  <span className="text-white/72">{row.pair}</span>
                  <span className="text-white/42">{row.stat}</span>
                  <span className={`font-semibold ${row.className}`}>{row.score}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] text-white/32">
              ПРИМЕР ВЁРСТКИ — ИСТОРИЯ БОЁВ ПОЯВИТСЯ В ПРИЛОЖЕНИИ
            </p>
          </div>
          <a href="/login" className="block rounded-[38px] bg-brand-amber p-9 text-black">
            <div className="font-heading text-[42px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1 }}>
              Отряд ждёт капитана
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[15px] text-black/68">Собери состав и запусти первый бой</span>
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
