'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ROSTER, STATS, TONE_BG, TONE_HEX, TOTAL_FIGHTER_COUNT, toneRgba, type RosterFighter } from '../model/roster';

function barTone(value: number, toneHex: string): string {
  if (value >= 140) return toneHex;
  if (value >= 100) return '#ffffff';
  return 'rgba(255,255,255,.55)';
}

function neighbor(index: number, offset: number): RosterFighter {
  return ROSTER[(index + offset + ROSTER.length) % ROSTER.length]!;
}

export function HeroDraft() {
  const [index, setIndex] = useState(0);
  const [roster, setRoster] = useState<string[]>([]);

  const step = (delta: number) => setIndex((i) => (i + delta + ROSTER.length) % ROSTER.length);
  const current = ROSTER[index]!;
  const inRoster = roster.includes(current.id);
  const full = roster.length >= 6;

  const pick = () => {
    setRoster((prev) => {
      if (prev.includes(current.id) || prev.length >= 6) return prev;
      return [...prev, current.id];
    });
  };
  const clearSlot = (id: string) => setRoster((prev) => prev.filter((x) => x !== id));
  const toggleCurrent = () => (inRoster ? clearSlot(current.id) : pick());

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // Without this, Enter/arrows typed while an arrow button still has
      // focus (from a previous click) also re-triggers that button's own
      // native activation - double-firing the action.
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        toggleCurrent();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, roster]);

  const toneHex = TONE_HEX[current.tone];
  const pickBtn = inRoster
    ? { label: 'Уже в отряде — убрать', className: 'bg-white/10 text-white' }
    : full
      ? { label: 'Отряд собран — в арену', className: 'bg-brand-mint text-black' }
      : { label: 'Добавить в отряд', className: 'bg-white text-black' };

  const ctaState = full
    ? { className: 'bg-brand-mint text-black', label: 'Отряд готов — в арену' }
    : roster.length
      ? { className: 'bg-white text-black', label: 'Продолжить в арене' }
      : { className: 'bg-white/10 text-white/80', label: 'Открыть арену' };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="absolute inset-0 transition-[background] duration-500"
        style={{ background: `radial-gradient(58% 62% at 50% 34%, ${toneRgba(current.tone, 0.24)}, transparent 72%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[26%] right-0 left-0 hidden text-center font-heading text-[230px] font-bold leading-none whitespace-nowrap text-transparent lg:block"
        style={{ letterSpacing: '-.05em', WebkitTextStroke: '1px rgba(255,255,255,.11)' }}
      >
        {current.name.toUpperCase()}
      </div>

      <header className="relative flex items-center gap-9 px-6 py-5 sm:px-11">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8.5 w-8.5 place-items-center rounded-xl font-mono text-[13px] font-semibold text-black transition-colors duration-300"
            style={{ background: toneHex }}
          >
            A
          </span>
          <span className="font-heading text-xl font-semibold">Arena</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
          {TOTAL_FIGHTER_COUNT} БОЙЦОВ В БАЗЕ
        </div>
        <nav className="ml-auto flex items-center gap-6 text-sm text-white/60">
          <a href="#duel">Дуэль</a>
          <a href="#elements">Стихии</a>
          <a href="#tune">Прокачка</a>
          <a href="/login" className="rounded-full bg-white px-5.5 py-2.5 font-semibold text-black">
            Войти
          </a>
        </nav>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="grid w-full max-w-[1180px] grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Предыдущий боец"
            className="grid h-[62px] w-[62px] place-items-center rounded-full border border-white/15 bg-[#232323]/70 text-xl transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black"
          >
            ←
          </button>

          <div className="grid grid-cols-1 gap-8 px-2 md:grid-cols-[220px_1fr_300px] md:gap-8">
            <div className="hidden flex-col gap-3 md:flex">
              <div className="font-mono text-[11px] tracking-[0.16em] text-white/40">ДРАФТ · ВЫБЕРИ ШЕСТЕРЫХ</div>
              {[neighbor(index, -1), neighbor(index, 1)].map((sideFighter, position) => (
                <button
                  key={`${sideFighter.id}-${position}`}
                  type="button"
                  onClick={() => setIndex(ROSTER.indexOf(sideFighter))}
                  className="overflow-hidden rounded-[22px] text-left transition-all duration-200 hover:translate-x-1.5"
                  style={{ background: TONE_HEX[sideFighter.tone], opacity: position === 0 ? 0.62 : 0.5 }}
                >
                  <div className="relative grid h-26 place-items-center overflow-hidden">
                    {sideFighter.sprite && (
                      <Image src={sideFighter.sprite} alt="" width={80} height={80} className="object-contain opacity-80" />
                    )}
                  </div>
                  <div className="flex items-baseline justify-between px-3.5 py-3">
                    <span className="font-heading text-[17px] font-semibold text-black capitalize">{sideFighter.name}</span>
                    <span className="font-mono text-[11px] text-black/55">#{sideFighter.id}</span>
                  </div>
                </button>
              ))}
            </div>

            <div
              className="relative overflow-hidden rounded-[34px] shadow-[0_50px_110px_rgba(0,0,0,0.66)] transition-[background] duration-500"
              style={{ background: toneHex }}
            >
              <div className="relative grid h-[280px] place-items-center sm:h-[392px]">
                <span className="absolute top-4.5 left-5 rounded-full bg-black/[0.14] px-3.5 py-1.5 font-mono text-[11px] text-black">
                  #{current.id}
                </span>
                <span className="absolute top-4.5 right-5 rounded-full bg-black/[0.14] px-3.5 py-1.5 font-mono text-[11px] text-black">
                  {current.role}
                </span>
                {current.sprite && (
                  <Image src={current.sprite} alt={current.name} width={260} height={260} priority className="object-contain" />
                )}
              </div>
              <div className="flex items-end justify-between gap-5 px-6 pb-6 text-black">
                <div>
                  <div className="font-heading text-4xl font-semibold sm:text-[44px] capitalize" style={{ letterSpacing: '-.03em' }}>
                    {current.name}
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {current.types.map((type) => (
                      <span key={type} className="rounded-full bg-black/[0.14] px-3 py-1.5 font-mono text-[11px] uppercase">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] tracking-[0.12em] text-black/55">СУММА СТАТОВ</div>
                  <div className="font-mono text-3xl font-semibold leading-tight sm:text-[34px]">{current.total}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4.5">
              <div className="rounded-[26px] bg-card p-5.5">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-white/45">ПАРАМЕТРЫ</span>
                  <span className="font-mono text-[11px] transition-colors duration-300" style={{ color: toneHex }}>
                    {current.role}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  {STATS.map((stat) => {
                    const value = current.stats[stat.key] ?? 0;
                    return (
                      <div key={stat.key}>
                        <div className="flex justify-between font-mono text-[11.5px]">
                          <span className="text-white/55">{stat.label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full transition-[width,background] duration-500"
                            style={{ width: `${Math.min(100, Math.round((value / 200) * 100))}%`, background: barTone(value, toneHex) }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleCurrent}
                className={`rounded-full py-4 text-[15px] font-semibold transition-transform duration-150 hover:-translate-y-0.5 ${pickBtn.className}`}
              >
                {pickBtn.label}
              </button>
              <div className="text-center font-mono text-[10.5px] tracking-[0.1em] text-white/32">
                ← → ПЕРЕКЛЮЧАЮТ БОЙЦА · ENTER ДОБАВЛЯЕТ
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Следующий боец"
            className="grid h-[62px] w-[62px] place-items-center rounded-full border border-white/15 bg-[#232323]/70 text-xl transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1560px] items-center gap-5 px-6 pb-7 sm:px-11">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-white/42">ТВОЙ ОТРЯД</div>
          <div className="font-mono text-2xl font-semibold leading-tight">
            {roster.length}
            <span className="text-white/35">/6</span>
          </div>
        </div>
        <div className="flex flex-1 gap-2.5">
          {Array.from({ length: 6 }, (_, slot) => {
            const fighter = roster[slot] ? ROSTER.find((f) => f.id === roster[slot]) : undefined;
            if (!fighter) {
              return (
                <div
                  key={slot}
                  className="flex flex-1 items-center gap-3 rounded-[20px] border border-dashed border-white/16 px-3.5 py-3"
                >
                  <span className="grid h-9.5 w-9.5 place-items-center rounded-xl bg-white/[0.06] font-mono text-[11px] text-white/40">
                    0{slot + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-[15px] font-semibold text-white/40">Пусто</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-white/28">ВЫБЕРИ БОЙЦА</span>
                  </span>
                </div>
              );
            }
            return (
              <button
                key={slot}
                type="button"
                onClick={() => clearSlot(fighter.id)}
                className="flex flex-1 items-center gap-3 rounded-[20px] border bg-[#232323] px-3.5 py-3 text-left [animation:pop_320ms_cubic-bezier(.2,.8,.2,1)_both]"
                style={{ borderColor: TONE_HEX[fighter.tone] }}
              >
                <span
                  className={`grid h-9.5 w-9.5 place-items-center rounded-xl font-mono text-[11px] text-black ${TONE_BG[fighter.tone]}`}
                >
                  0{slot + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-heading text-[15px] font-semibold capitalize">{fighter.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-white/42 uppercase">
                    убрать · {fighter.types[0]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <a
          href="/login"
          className={`flex items-center gap-2.5 rounded-full px-7.5 py-4 text-[15px] font-semibold whitespace-nowrap transition-colors duration-300 ${ctaState.className}`}
        >
          {ctaState.label}
          <span className="[animation:nudge_1.6s_ease-in-out_infinite]">→</span>
        </a>
      </div>
    </section>
  );
}
