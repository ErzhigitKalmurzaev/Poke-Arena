'use client';

import { Heart, Shield, ShieldHalf, Sparkles, Swords, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ROSTER, STATS } from '../model/roster';

const EASE = [0.22, 1, 0.36, 1] as const;

const TEAM_A = ROSTER.slice(0, 6);
const TEAM_B = ROSTER.slice(6, 12);

const STAT_ICONS: Record<string, typeof Heart> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  'special-attack': Sparkles,
  'special-defense': ShieldHalf,
  speed: Zap,
};

// Chips need short labels to stay compact - the full label (e.g. "СП.ЗАЩИТА")
// is still used everywhere else (verdict sentence, params panel).
const STAT_SHORT_LABEL: Record<string, string> = {
  hp: 'HP',
  attack: 'АТК',
  defense: 'ЗАЩ',
  'special-attack': 'СП.А',
  'special-defense': 'СП.З',
  speed: 'СКР',
};

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
  const totalWins = winsA + winsB;
  const aSharePct = ran && totalWins > 0 ? (winsA / totalWins) * 100 : 50;
  const bSharePct = 100 - aSharePct;

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
    verdict = { text: `Команда A берёт бой ${winsA}:${winsB} по параметру «${stat.label}».`, className: 'bg-brand-red text-black' };
  } else {
    verdict = { text: `Команда B берёт бой ${winsB}:${winsA} по параметру «${stat.label}».`, className: 'bg-brand-blue text-black' };
  }

  return (
    <section id="duel" className="mx-auto w-full max-w-[1560px] px-6 py-22 sm:px-11">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-11 lg:grid-cols-[360px_1fr]">
        <div className="lg:sticky lg:top-11">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-9 -left-8 -z-10 h-40 w-40 rounded-full bg-brand-red/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-1 left-24 -z-10 h-36 w-36 rounded-full bg-brand-blue/25 blur-3xl"
            />
            <div className="font-mono text-[11px] tracking-[0.16em] text-brand-red">ПОПРОБУЙ ПРЯМО ЗДЕСЬ</div>
            <h2 className="mt-3.5 font-heading text-5xl font-semibold" style={{ letterSpacing: '-.035em', lineHeight: 1 }}>
              Бой — это
              <br />
              честное сравнение
            </h2>
          </div>
          <p className="mt-4.5 text-[15.5px] leading-relaxed text-white/60">
            Выбирай параметр, жми «Запустить» и смотри, как шесть пар расходятся по раундам. Никаких скрытых
            коэффициентов — каждое число на экране.
          </p>
          <div className="mt-6.5 flex flex-wrap gap-1.5">
            {STATS.map((s) => {
              const Icon = STAT_ICONS[s.key];
              const active = s.key === statKey;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => selectStat(s.key)}
                  aria-pressed={active}
                  title={s.label}
                  className={`relative flex items-center gap-1.5 overflow-hidden rounded-full py-2 pr-3.5 pl-2.5 font-mono text-[11px] font-medium transition-colors duration-200 ${
                    active ? 'text-black' : 'bg-white/8 text-white/68 hover:text-white/90'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="duel-stat-pill"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                  {Icon && <Icon className="relative h-3.5 w-3.5" />}
                  <span className="relative">{STAT_SHORT_LABEL[s.key] ?? s.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setRan((r) => !r)}
            className={`mt-5.5 rounded-full px-8 py-4 text-[15px] font-semibold transition-colors duration-200 ${
              ran ? 'bg-white/10 text-white' : 'bg-brand-red text-black'
            }`}
          >
            {ran ? 'Сбросить бой' : 'Запустить бой'}
          </button>
          <div className="mt-7.5 flex gap-6.5">
            <div>
              <div className="font-mono text-3xl font-semibold text-brand-red">{ran ? winsA : 0}</div>
              <div className="mt-1 text-xs text-white/45">раундов за команду A</div>
            </div>
            <div>
              <div className="font-mono text-3xl font-semibold text-brand-blue">{ran ? winsB : 0}</div>
              <div className="mt-1 text-xs text-white/45">раундов за команду B</div>
            </div>
          </div>
          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full bg-brand-red"
              animate={{ width: `${aSharePct}%` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            <motion.div
              className="h-full bg-brand-blue"
              animate={{ width: `${bSharePct}%` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        </div>

        <div
          className="rounded-[34px] p-7.5"
          style={{
            background: 'linear-gradient(120deg, rgba(214,40,40,0.14), rgba(35,35,35,1) 35%, rgba(35,35,35,1) 65%, rgba(21,101,192,0.14))',
          }}
        >
          <div className="grid grid-cols-[1fr_112px_1fr] items-center gap-4 rounded-[20px] bg-black/50 px-4 py-3.5">
            <span className="flex w-40 shrink-0 items-center gap-2.5 font-heading text-[19px] font-semibold">
              <span className="h-6.5 w-6.5 shrink-0 rounded-[9px] bg-brand-red" />
              Команда A
            </span>
            <span className="min-w-0 truncate text-center font-mono text-[11px] tracking-[0.14em] text-white/42 uppercase">
              {stat.label}
            </span>
            <span className="flex w-40 shrink-0 items-center justify-end justify-self-end gap-2.5 text-right font-heading text-[19px] font-semibold">
              Команда B
              <span className="h-6.5 w-6.5 shrink-0 rounded-[9px] bg-brand-blue" />
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {duels.map((duel, i) => (
              <div key={i} className="grid grid-cols-[1fr_112px_1fr] items-center gap-4 rounded-[20px] bg-black px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="min-w-26 font-heading text-[15px] font-semibold text-white/85 capitalize">{duel.a.name}</span>
                  <span
                    className="min-w-8 text-right font-mono text-sm font-semibold"
                    style={{ color: duel.aWin ? 'var(--brand-red)' : 'rgba(255,255,255,.42)' }}
                  >
                    {duel.aVal}
                  </span>
                  <div className="h-3.5 flex-1 rounded-full bg-white/7">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${duel.aPct}%`,
                        background: duel.aWin ? 'var(--brand-red)' : 'rgba(214,40,40,.3)',
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
          <div
            className={`mt-5.5 rounded-[22px] px-5.5 py-4.5 text-center text-[15px] font-semibold transition-colors duration-300 ${verdict.className}`}
          >
            {verdict.text}
          </div>
        </div>
      </div>
    </section>
  );
}
