'use client';

import {
  BATTLE_STAT_KEYS,
  BATTLE_STAT_LABEL,
  FighterMedia,
  TONE_HEX,
  battleStatTotal,
  fighterMatchups,
  fighterRating,
  fighterRole,
  toneOfTypes,
  toneRgba,
  typeLabel,
  type Fighter,
} from '@/entities/fighter';

/** PokeAPI's ceiling for a single battle stat, so bars share one honest scale. */
const MAX_SINGLE_STAT = 255;

/**
 * The fighter as he currently stands, beside the panels that edit him. Always
 * shows the saved state - the live preview of an in-progress edit belongs next
 * to the sliders making it, not here, or the two would disagree on screen.
 */
export function FighterShowcase({ fighter }: { fighter: Fighter }) {
  const tone = toneOfTypes(fighter.types);
  const accent = TONE_HEX[tone];
  const rating = fighterRating(fighter.stats);
  const { strong, weak } = fighterMatchups(fighter.types);
  const legendaryLabel = fighter.isMythical ? 'МИФИЧЕСКИЙ' : fighter.isLegendary ? 'ЛЕГЕНДАРНЫЙ' : null;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative rounded-[28px] px-5 pt-4 pb-5"
        style={{ background: `radial-gradient(64% 52% at 50% 32%, ${toneRgba(tone, 0.16)}, transparent 72%)` }}
      >
        {/* The overall, same headline treatment as the catalog card. */}
        <div className="flex items-start justify-between">
          <span className="font-heading text-[44px] leading-none font-semibold tabular-nums text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            {rating}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-white/35">#{fighter.id}</span>
        </div>

        <div className="-mt-6">
          <FighterMedia fighter={fighter} />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <h1 className="font-heading text-[34px] leading-none font-semibold capitalize" style={{ letterSpacing: '-.03em' }}>
            {fighter.name}
          </h1>
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-black"
            style={{ background: accent }}
          >
            {fighterRole(fighter.stats)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {fighter.types.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-white/70"
            >
              <span className="size-1.5 rounded-full" style={{ background: TONE_HEX[toneOfTypes([type])] }} />
              {typeLabel(type)}
            </span>
          ))}
          {legendaryLabel && (
            <span className="rounded-full border border-white/12 bg-black/45 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.1em] text-white/70">
              {legendaryLabel}
            </span>
          )}
          {fighter.isEdited && (
            <span className="rounded-full bg-brand-red px-2.5 py-1 font-mono text-[9.5px] tracking-[0.1em] text-black">
              ИЗМЕНЁН
            </span>
          )}
        </div>

        <p className="mt-3.5 text-center text-[13.5px] leading-relaxed text-white/55">{fighter.description}</p>
      </div>

      <div className="flex flex-col gap-1.5 rounded-[28px] border border-white/8 bg-card/50 p-5">
        {BATTLE_STAT_KEYS.map((key) => {
          const value = fighter.stats[key] ?? 0;
          const pct = Math.min(100, Math.round((value / MAX_SINGLE_STAT) * 100));
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
              <span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-white/85">{value}</span>
            </div>
          );
        })}

        <div className="mt-1.5 flex items-baseline justify-between border-t border-white/8 pt-2.5">
          <span className="font-mono text-[9.5px] tracking-[0.14em] text-white/35">СУММА</span>
          <span className="font-mono text-[15px] font-semibold tabular-nums text-white/85">
            {battleStatTotal(fighter.stats)}
          </span>
        </div>

        <div className="mt-1 flex flex-col gap-1.5 border-t border-white/8 pt-2.5 text-[11px]">
          <MatchupLine label="СИЛЬНЕЕ ПРОТИВ" types={strong} fallback="без явных преимуществ" />
          <MatchupLine label="УЯЗВИМ К" types={weak} fallback="без явных слабостей" />
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
        types.slice(0, 6).map((type) => (
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
