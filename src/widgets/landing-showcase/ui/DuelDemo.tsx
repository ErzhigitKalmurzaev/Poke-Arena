'use client';

import { useState } from 'react';
import { ROSTER, STATS } from '../model/roster';

const TEAM_A = ROSTER.slice(0, 6);
const TEAM_B = ROSTER.slice(6, 12);

export function DuelDemo() {
  const [statKey, setStatKey] = useState('speed');
  const [ran, setRan] = useState(true);

  const stat = STATS.find((s) => s.key === statKey) ?? STATS[5]!;
  const maxValue = Math.max(...TEAM_A.concat(TEAM_B).map((f) => f.stats[stat.key] ?? 0));

  const duels = TEAM_A.map((a, i) => {
    const b = TEAM_B[i]!;
    const aVal = a.stats[stat.key] ?? 0;
    const bVal = b.stats[stat.key] ?? 0;
    const aWin = aVal >= bVal;
    return {
      a,
      b,
      aVal,
      bVal,
      aPct: ran ? Math.round((aVal / maxValue) * 100) : 0,
      bPct: ran ? Math.round((bVal / maxValue) * 100) : 0,
      aWin,
      delay: 70 * i,
    };
  });

  const winsA = duels.filter((d) => d.aWin).length;
  const winsB = duels.length - winsA;

  const selectStat = (key: string) => {
    setRan(false);
    setStatKey(key);
    window.setTimeout(() => setRan(true), 60);
  };

  let verdict: { text: string; className: string };
  if (!ran) {
    verdict = { text: 'Жми «Запустить бой» — полосы поедут от края к центру.', className: 'bg-white/6 text-white/70' };
  } else if (winsA === winsB) {
    verdict = { text: `Ничья ${winsA}:${winsB} по параметру «${stat.label}». Смени параметр — исход изменится.`, className: 'bg-brand-mint text-black' };
  } else if (winsA > winsB) {
    verdict = { text: `Команда A берёт бой ${winsA}:${winsB} по параметру «${stat.label}».`, className: 'bg-brand-amber text-black' };
  } else {
    verdict = { text: `Команда B берёт бой ${winsB}:${winsA} по параметру «${stat.label}».`, className: 'bg-brand-blue text-black' };
  }

  return (
    <section id="duel" className="mx-auto max-w-[1560px] px-6 py-22 sm:px-11">
      <div className="grid grid-cols-1 items-start gap-11 lg:grid-cols-[390px_1fr]">
        <div className="lg:sticky lg:top-11">
          <div className="font-mono text-[11px] tracking-[0.16em] text-brand-amber">ПОПРОБУЙ ПРЯМО ЗДЕСЬ</div>
          <h2 className="mt-3.5 font-heading text-5xl font-semibold" style={{ letterSpacing: '-.035em', lineHeight: 1 }}>
            Бой — это
            <br />
            честное сравнение
          </h2>
          <p className="mt-4.5 text-[15.5px] leading-relaxed text-white/60">
            Выбирай параметр, жми «Запустить» и смотри, как шесть пар расходятся по раундам. Никаких скрытых
            коэффициентов — каждое число на экране.
          </p>
          <div className="mt-6.5 flex flex-wrap gap-2">
            {STATS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => selectStat(s.key)}
                className={`rounded-full px-4.5 py-2.5 font-mono text-[11.5px] font-medium transition-colors duration-200 ${
                  s.key === statKey ? 'bg-white text-black' : 'bg-white/8 text-white/72'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRan((r) => !r)}
            className={`mt-5.5 rounded-full px-8 py-4 text-[15px] font-semibold ${
              ran ? 'bg-white/10 text-white' : 'bg-brand-amber text-black'
            }`}
          >
            {ran ? 'Сбросить бой' : 'Запустить бой'}
          </button>
          <div className="mt-7.5 flex gap-6.5">
            <div>
              <div className="font-mono text-3xl font-semibold text-brand-amber">{ran ? winsA : 0}</div>
              <div className="mt-1 text-xs text-white/45">раундов за команду A</div>
            </div>
            <div>
              <div className="font-mono text-3xl font-semibold text-brand-blue">{ran ? winsB : 0}</div>
              <div className="mt-1 text-xs text-white/45">раундов за команду B</div>
            </div>
          </div>
        </div>

        <div className="rounded-[34px] bg-card p-7.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 font-heading text-[19px] font-semibold">
              <span className="h-6.5 w-6.5 rounded-[9px] bg-brand-amber" />
              Команда A
            </span>
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/42 uppercase">{stat.label}</span>
            <span className="flex items-center gap-2.5 font-heading text-[19px] font-semibold">
              Команда B
              <span className="h-6.5 w-6.5 rounded-[9px] bg-brand-blue" />
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            {duels.map((duel, i) => (
              <div key={i} className="grid grid-cols-[1fr_112px_1fr] items-center gap-4 rounded-[20px] bg-black px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="min-w-26 font-heading text-[15px] font-semibold text-white/85 capitalize">{duel.a.name}</span>
                  <span
                    className="min-w-8 text-right font-mono text-sm font-semibold"
                    style={{ color: duel.aWin ? 'var(--brand-amber)' : 'rgba(255,255,255,.42)' }}
                  >
                    {duel.aVal}
                  </span>
                  <div className="h-3.5 flex-1 rounded-full bg-white/7">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${duel.aPct}%`,
                        background: duel.aWin ? 'var(--brand-amber)' : 'rgba(255,180,68,.3)',
                        transitionDelay: `${duel.delay}ms`,
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-full bg-white/6 px-1.5 py-1.5 text-center font-mono text-[10.5px] tracking-[0.08em] text-white/60">
                  РАУНД 0{i + 1}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-3.5 flex-1 justify-end rounded-full bg-white/7">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${duel.bPct}%`,
                        background: duel.aWin ? 'rgba(173,218,238,.3)' : 'var(--brand-blue)',
                        transitionDelay: `${duel.delay}ms`,
                      }}
                    />
                  </div>
                  <span
                    className="min-w-8 font-mono text-sm font-semibold"
                    style={{ color: duel.aWin ? 'rgba(255,255,255,.42)' : 'var(--brand-blue)' }}
                  >
                    {duel.bVal}
                  </span>
                  <span className="min-w-26 text-right font-heading text-[15px] font-semibold text-white/85 capitalize">{duel.b.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-5.5 rounded-[22px] px-5.5 py-4.5 text-[15px] font-semibold transition-colors duration-300 ${verdict.className}`}>
            {verdict.text}
          </div>
        </div>
      </div>
    </section>
  );
}
