'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toneOfTypes } from '@/entities/fighter';
import { ROSTER, ROSTER_TYPES, TONE_HEX, TYPE_MATCHUPS, TYPE_TEXT } from '../model/roster';

export function ElementsExplorer() {
  const [type, setType] = useState(ROSTER_TYPES[0]!);

  const tone = toneOfTypes([type]);
  const matchup = TYPE_MATCHUPS[type] ?? { strong: [], weak: [] };
  const fighters = ROSTER.filter((f) => f.types.includes(type)).slice(0, 4);

  return (
    <section id="elements" className="mx-auto w-full max-w-[1560px] px-6 pb-22 sm:px-11">
      <div className="rounded-[40px] bg-card p-9 sm:p-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="font-heading text-2xl font-light text-white/55 italic">Кто такие</div>
            <h2 className="mt-1.5 font-heading text-5xl font-semibold" style={{ letterSpacing: '-.035em', lineHeight: 1 }}>
              бойцы арены
            </h2>
          </div>
          <p className="max-w-xl text-[15px] leading-relaxed text-white/55">
            Каждый боец принадлежит одной или двум стихиям из настоящего покедекса PokeAPI: шесть базовых
            параметров и явные сильные/слабые связи между типами. Нажми на стихию.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {ROSTER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="rounded-full px-4.5 py-2.5 font-mono text-[11.5px] uppercase transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: t === type ? TONE_HEX[toneOfTypes([t])] : 'rgba(255,255,255,.08)',
                color: t === type ? '#000' : 'rgba(255,255,255,.72)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.35fr]">
          <div className="rounded-[30px] p-8.5 text-black transition-colors duration-300" style={{ background: TONE_HEX[tone] }}>
            <div className="font-mono text-[11px] tracking-[0.16em] text-black/55">СТИХИЯ</div>
            <div className="mt-2.5 font-heading text-[56px] font-semibold uppercase" style={{ letterSpacing: '-.03em', lineHeight: 1 }}>
              {type}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-black/70">{TYPE_TEXT[type] ?? ''}</p>
            <div className="mt-6.5 grid gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl bg-black/12 px-4 py-3">
                <span className="font-mono text-[11px] tracking-[0.1em] text-black/60">СИЛЬНА ПРОТИВ</span>
                <span className="font-mono text-xs font-semibold uppercase">
                  {matchup.strong.length ? matchup.strong.join(' · ') : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-black/12 px-4 py-3">
                <span className="font-mono text-[11px] tracking-[0.1em] text-black/60">СЛАБА ПРОТИВ</span>
                <span className="font-mono text-xs font-semibold uppercase">
                  {matchup.weak.length ? matchup.weak.join(' · ') : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 content-start sm:grid-cols-2">
            {fighters.map((fighter) => {
              const fighterTone = toneOfTypes(fighter.types);
              return (
                <div
                  key={fighter.id}
                  className="overflow-hidden rounded-[26px] transition-transform duration-[240ms] hover:-translate-y-1.5"
                  style={{ background: TONE_HEX[fighterTone] }}
                >
                  <div className="relative grid h-40 place-items-center">
                    {fighter.sprite && <Image src={fighter.sprite} alt={fighter.name} width={110} height={110} className="object-contain" />}
                    <span className="absolute top-3.5 right-4 font-mono text-[11px] text-black/45">#{fighter.id}</span>
                  </div>
                  <div className="px-4.5 py-4.5 text-black">
                    <div className="flex items-baseline justify-between">
                      <span className="font-heading text-[21px] font-semibold capitalize">{fighter.name}</span>
                      <span className="font-mono text-xs font-semibold text-black/60">{fighter.total}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-black/66">{fighter.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
