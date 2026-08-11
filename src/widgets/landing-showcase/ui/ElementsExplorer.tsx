'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toneOfTypes, typeLabel } from '@/entities/fighter';
import { ROSTER, ROSTER_TYPES, STATS, TONE_HEX, TYPE_MATCHUPS, TYPE_TEXT, toneRgba } from '../model/roster';

/**
 * Shared ceiling for the average-profile bars. Fixed rather than per-type, so
 * switching element to element compares like with like - a bar that shrinks
 * means the element really is weaker there, not that the scale moved.
 */
const PROFILE_SCALE = 150;

function fighterCountLabel(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} БОЙЦОВ`;
  if (last === 1) return `${count} БОЕЦ`;
  if (last >= 2 && last <= 4) return `${count} БОЙЦА`;
  return `${count} БОЙЦОВ`;
}

/**
 * Element browser. Every panel here used to be a flat slab of the element's
 * colour carrying black copy - at 15px, black on the blue and red accents sits
 * around 3.8:1 and 4.2:1, and the muted `text-black/60` variants roughly half
 * that, so the descriptions were effectively unreadable. Colour now behaves the
 * way it does in the duel block above: a dark surface, a tinted glow, and the
 * accent reserved for headlines, dots and bars, with copy in white.
 */
export function ElementsExplorer() {
  const [type, setType] = useState(ROSTER_TYPES[0]!);

  const tone = toneOfTypes([type]);
  const accent = TONE_HEX[tone];
  const matchup = TYPE_MATCHUPS[type] ?? { strong: [], weak: [] };
  const pool = ROSTER.filter((f) => f.types.includes(type));
  const fighters = pool.slice(0, 4);

  // Averaged over everyone in the roster carrying this element - the panel's
  // claim about the element is then made of the same numbers as the cards
  // beside it, rather than being prose on its own.
  const profile = STATS.map((stat) => ({
    ...stat,
    value: Math.round(pool.reduce((sum, f) => sum + (f.stats[stat.key] ?? 0), 0) / pool.length),
  }));

  return (
    <section id="elements" className="mx-auto w-full max-w-[1560px] px-6 pb-22 sm:px-11">
      <div className="rounded-[40px] border border-white/8 bg-card p-9 sm:p-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="font-heading text-2xl font-light text-white/60 italic">Кто такие</div>
            <h2 className="mt-1.5 font-heading text-5xl font-semibold" style={{ letterSpacing: '-.035em', lineHeight: 1 }}>
              бойцы арены
            </h2>
          </div>
          <p className="max-w-xl text-[15px] leading-relaxed text-white/70">
            Каждый боец принадлежит одной или двум стихиям из настоящего покедекса PokeAPI: шесть базовых
            параметров и явные сильные/слабые связи между типами. Нажми на стихию.
          </p>
        </div>

        {/*
          The selected chip is white on black rather than a block of the
          element's own colour: it is the one control that has to stay legible
          in all eighteen states, and the element still reads through the dot.
        */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          {ROSTER_TYPES.map((t) => {
            const isActive = t === type;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 rounded-full py-2.5 pr-4 pl-3 text-[13px] transition-colors duration-200 ${
                  isActive ? 'bg-white font-semibold text-black' : 'bg-white/8 text-white/70 hover:bg-white/14 hover:text-white'
                }`}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: TONE_HEX[toneOfTypes([t])], opacity: isActive ? 1 : 0.65 }}
                />
                {typeLabel(t)}
              </button>
            );
          })}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.35fr]">
          <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-black p-8.5">
            {/* The element's colour arrives as light behind the panel instead
                of as the panel itself. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-[background] duration-500"
              style={{ background: `radial-gradient(88% 74% at 10% 0%, ${toneRgba(tone, 0.36)}, transparent 68%)` }}
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] tracking-[0.16em] text-white/45">СТИХИЯ</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-white/55">
                  {fighterCountLabel(pool.length)}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3.5">
                <span
                  className="size-3.5 shrink-0 rounded-full transition-colors duration-300"
                  style={{ background: accent, boxShadow: `0 0 22px ${toneRgba(tone, 0.85)}` }}
                />
                <h3
                  className="font-heading text-[42px] font-semibold transition-colors duration-300"
                  style={{ letterSpacing: '-.03em', lineHeight: 1, color: accent }}
                >
                  {typeLabel(type)}
                </h3>
                {/* PokeAPI's own id, kept visible: the copy above promises real
                    покедекс data, and this is where it is checkable. */}
                <span className="self-end pb-1 font-mono text-[11px] text-white/30">{type}</span>
              </div>

              <p className="mt-3.5 text-[15px] leading-relaxed text-white/75">{TYPE_TEXT[type] ?? ''}</p>

              <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3.5">
                <div className="font-mono text-[10.5px] tracking-[0.12em] text-white/45">СРЕДНИЙ ПРОФИЛЬ</div>
                <div className="mt-3 flex flex-col gap-2">
                  {profile.map((stat) => (
                    <div key={stat.key} className="grid grid-cols-[74px_1fr_34px] items-center gap-3">
                      <span className="truncate font-mono text-[10.5px] text-white/50">{stat.label}</span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full transition-[width,background] duration-500"
                          style={{
                            width: `${Math.min(100, Math.round((stat.value / PROFILE_SCALE) * 100))}%`,
                            background: accent,
                          }}
                        />
                      </div>
                      <span className="text-right font-mono text-[11.5px] tabular-nums text-white/80">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid gap-2.5">
                <MatchupRow label="СИЛЬНА ПРОТИВ" items={matchup.strong} accent="var(--brand-mint)" />
                <MatchupRow label="СЛАБА ПРОТИВ" items={matchup.weak} accent="var(--brand-red)" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2">
            {fighters.map((fighter) => {
              const fighterTone = toneOfTypes(fighter.types);
              return (
                <div
                  key={fighter.id}
                  className="group flex flex-col overflow-hidden rounded-[26px] border border-white/7 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-3.5 transition-all duration-[240ms] hover:-translate-y-1.5 hover:border-white/16 hover:shadow-[0_22px_46px_-18px_rgba(0,0,0,0.95)]"
                >
                  <div
                    className="relative grid h-36 place-items-center overflow-hidden rounded-[19px]"
                    style={{
                      background: `radial-gradient(66% 60% at 50% 46%, ${toneRgba(fighterTone, 0.3)}, transparent 72%)`,
                    }}
                  >
                    {fighter.sprite && (
                      <Image
                        src={fighter.sprite}
                        alt={fighter.name}
                        width={116}
                        height={116}
                        className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-[1.07]"
                      />
                    )}
                    <span className="absolute top-1.5 right-2.5 font-mono text-[10px] tabular-nums text-white/35">
                      #{fighter.id}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="truncate font-heading text-[19px] font-semibold capitalize">{fighter.name}</span>
                    <span
                      className="font-mono text-[13px] font-semibold tabular-nums"
                      style={{ color: TONE_HEX[fighterTone] }}
                    >
                      {fighter.total}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-white/65">{fighter.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface MatchupRowProps {
  label: string;
  items: string[];
  accent: string;
}

/**
 * The related types as individual chips rather than one `·`-joined string:
 * five weaknesses ran off the edge as a single line, and a tinted chip carries
 * the strong/weak sense without tinting the text itself (the accents are too
 * dark to read at 11px).
 */
function MatchupRow({ label, items, accent }: MatchupRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <span className="font-mono text-[10.5px] tracking-[0.12em] text-white/45">{label}</span>
      <span className="flex flex-wrap items-center gap-1.5">
        {items.length === 0 ? (
          <span className="font-mono text-[12px] text-white/40">—</span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full px-2.5 py-1 text-[12px] leading-none text-white/90"
              style={{ background: `color-mix(in srgb, ${accent} 30%, transparent)` }}
            >
              {typeLabel(item)}
            </span>
          ))
        )}
      </span>
    </div>
  );
}
