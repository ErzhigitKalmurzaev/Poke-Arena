'use client';

import { Check, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import {
  BATTLE_STAT_LABEL,
  BATTLE_STAT_KEYS,
  TONE_HEX,
  battleStatTotal,
  fighterMatchups,
  fighterRole,
  fighterStrengths,
  toneOfTypes,
  toneRgba,
  typeLabel,
  type Fighter,
} from '@/entities/fighter';
import { SLOT_LETTER, TEAM_SLOTS, type TeamSlot } from '@/entities/team';

/** PokeAPI's ceiling for a single base stat, so bars share one honest scale. */
const MAX_SINGLE_STAT = 255;

interface DraftSpotlightProps {
  fighter: Fighter;
  /** Which team this fighter already stands on, if any. */
  assignedTo: TeamSlot | null;
  teamFull: Record<TeamSlot, boolean>;
  onAssign: (slot: TeamSlot) => void;
  onUnassign: (slot: TeamSlot) => void;
}

/**
 * The fighter currently at the top of the wheel, in three columns: who he is
 * on the left, the art and the draft decision in the middle, what he can do on
 * the right. No panel behind it - the art is the focal point, and a card edge
 * around all three columns would cut it off from the carousel spinning
 * directly underneath.
 */
export function DraftSpotlight({ fighter, assignedTo, teamFull, onAssign, onUnassign }: DraftSpotlightProps) {
  const tone = toneOfTypes(fighter.types);
  const accent = TONE_HEX[tone];
  const strengths = fighterStrengths(fighter.stats);
  const { strong, weak } = fighterMatchups(fighter.types);
  const total = battleStatTotal(fighter.stats);

  return (
    /* The centre track is sized by the two draft buttons sitting side by side,
       not by the art - they carry the widest text that must not wrap. */
    <div className="grid grid-cols-1 items-center gap-x-7 gap-y-6 md:grid-cols-[minmax(0,1fr)_268px_minmax(0,1fr)]">
      {/* IDENTITY. Second on a narrow screen: the art should lead there too. */}
      <div className="order-2 flex min-w-0 flex-col md:order-none">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <h2
            className="font-heading text-[32px] leading-none font-semibold capitalize"
            style={{ letterSpacing: '-.03em' }}
          >
            {fighter.name}
          </h2>
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-black"
            style={{ background: accent }}
          >
            {fighterRole(fighter.stats)}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {fighter.types.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-white/70"
            >
              <span className="size-1.5 rounded-full" style={{ background: TONE_HEX[toneOfTypes([type])] }} />
              {typeLabel(type)}
            </span>
          ))}
        </div>

        <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-white/55">{fighter.description}</p>

        {/* "В чём хорош": the two strongest battle stats, named. */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9.5px] tracking-[0.14em] text-white/35">СИЛЁН В</span>
          {strengths.slice(0, 2).map((strength) => (
            <span
              key={strength.statKey}
              className="rounded-md bg-white/8 px-2 py-1 font-mono text-[10.5px] text-white/80"
            >
              {strength.statLabel} {strength.value}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1.5 text-[11px]">
          <MatchupLine label="СИЛЬНЕЕ ПРОТИВ" types={strong} fallback="без явных преимуществ" />
          <MatchupLine label="УЯЗВИМ К" types={weak} fallback="без явных слабостей" />
        </div>
      </div>

      {/* ART + DRAFT ACTION */}
      <div className="order-1 flex flex-col items-center gap-4 md:order-none">
        <div className="relative grid h-60 w-full place-items-center">
          {/* Element-coloured light pooled behind the sprite, plus a drop-shadow
              in the same hue so the shadow follows his silhouette rather than
              sitting under a rectangle. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-4 bottom-2"
            style={{ background: `radial-gradient(54% 52% at 50% 50%, ${toneRgba(tone, 0.3)}, transparent 72%)` }}
          />
          {fighter.sprite && (
            <Image
              key={fighter.sprite}
              src={fighter.sprite}
              alt={fighter.name}
              width={236}
              height={236}
              priority
              className="relative animate-[pop_320ms_cubic-bezier(.2,.8,.2,1)] object-contain"
              style={{ filter: `drop-shadow(0 18px 24px ${toneRgba(tone, 0.55)})` }}
            />
          )}
          <span className="absolute top-0 right-0 font-mono text-[11px] tabular-nums text-white/30">#{fighter.id}</span>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          {TEAM_SLOTS.map((slot) => {
            const isHere = assignedTo === slot;
            const blocked = assignedTo !== null || teamFull[slot];

            if (isHere) {
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onUnassign(slot)}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-white/12 px-2.5 py-2.5 text-[12.5px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-white/20"
                >
                  <Minus className="size-3.5" />
                  Убрать из {SLOT_LETTER[slot]}
                </button>
              );
            }
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onAssign(slot)}
                disabled={blocked}
                title={teamFull[slot] ? 'Команда уже заполнена' : undefined}
                className="flex items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-[12.5px] font-semibold whitespace-nowrap text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-25"
                style={{ background: slot === 'team-a' ? 'var(--brand-red)' : 'var(--brand-blue)' }}
              >
                {assignedTo !== null ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                В команду {SLOT_LETTER[slot]}
              </button>
            );
          })}
        </div>
      </div>

      {/* STATS */}
      <div className="order-3 flex min-w-0 flex-col gap-1.5 md:order-none">
        {BATTLE_STAT_KEYS.map((key) => {
          const value = fighter.stats[key] ?? 0;
          const pct = Math.min(100, Math.round((value / MAX_SINGLE_STAT) * 100));
          // Thresholds from the design handoff: a standout stat takes the
          // element colour, a solid one white, the rest stay muted.
          const barColor = value >= 140 ? accent : value >= 100 ? '#ffffff' : 'rgba(255,255,255,.42)';
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-19 shrink-0 font-mono text-[9.5px] tracking-[0.08em] text-white/40">
                {BATTLE_STAT_LABEL[key]}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                <span
                  className="block h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(.15,.85,.2,1)]"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </span>
              <span className="w-7 shrink-0 text-right font-mono text-[11px] tabular-nums text-white/85">{value}</span>
            </div>
          );
        })}

        <div className="mt-1.5 flex items-baseline justify-between border-t border-white/8 pt-2.5">
          <span className="font-mono text-[9.5px] tracking-[0.14em] text-white/35">СУММА</span>
          <span className="font-mono text-[15px] font-semibold tabular-nums text-white/85">{total}</span>
        </div>
      </div>
    </div>
  );
}

function MatchupLine({ label, types, fallback }: { label: string; types: string[]; fallback: string }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="font-mono text-[9.5px] tracking-[0.14em] text-white/30">{label}</span>
      {types.length > 0 ? (
        types.slice(0, 5).map((type) => (
          <span key={type} className="text-white/60">
            {typeLabel(type)}
          </span>
        ))
      ) : (
        <span className="text-white/35">{fallback}</span>
      )}
    </span>
  );
}
