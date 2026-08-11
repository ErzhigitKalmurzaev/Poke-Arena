import Image from 'next/image';
import { MAX_BATTLE_STAT_TOTAL, battleStatTotal } from '../model/battleStats';
import { fighterRating } from '../model/rating';
import { TONE_HEX, toneOfTypes, typeLabel } from '../model/tone';
import type { Fighter } from '../model/types';

interface FighterCardProps {
  fighter: Fighter;
}

// Row-major over 3 columns: HP|АТК|ЗАЩ / СП.А|СП.З|СКР.
const STAT_CELLS: [string, string][] = [
  ['hp', 'HP'],
  ['attack', 'АТК'],
  ['defense', 'ЗАЩ'],
  ['special-attack', 'СП.А'],
  ['special-defense', 'СП.З'],
  ['speed', 'СКР'],
];

export function FighterCard({ fighter }: FighterCardProps) {
  const tone = toneOfTypes(fighter.types);
  const accent = TONE_HEX[tone];
  const total = battleStatTotal(fighter.stats);
  const totalPct = Math.round((total / MAX_BATTLE_STAT_TOTAL) * 100);
  const rating = fighterRating(fighter.stats);
  const legendaryLabel = fighter.isMythical ? 'МИФИЧЕСКИЙ' : fighter.isLegendary ? 'ЛЕГЕНДАРНЫЙ' : null;

  return (
    /*
     * Surface is a faint top-down gradient rather than a flat grey: on a black
     * page a single flat fill reads as an unstyled box. The sprite sits on a
     * *lighter* neutral wash than the card (a soft stage), which separates it
     * crisply without reintroducing a per-type colored plate - type identity
     * lives in the dots and the total's accent instead.
     */
    <article className="group flex h-full flex-col rounded-[26px] border border-white/7 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-white/16 hover:shadow-[0_20px_44px_-16px_rgba(0,0,0,0.95)]">
      <div className="relative grid h-38 place-items-center overflow-hidden rounded-[19px] bg-[radial-gradient(68%_62%_at_50%_44%,rgba(255,255,255,0.075),transparent_72%)]">
        {fighter.sprite && (
          <Image
            src={fighter.sprite}
            alt={fighter.name}
            width={132}
            height={132}
            className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-[1.07]"
          />
        )}
        {/* The overall, football-card style: the first thing read on the card,
            so it sits in the top-left corner at headline size. The shadow keeps
            it legible where a pale sprite runs underneath it. */}
        <span className="absolute top-0.5 left-2 font-heading text-[31px] leading-none font-semibold tabular-nums text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
          {rating}
        </span>
        <span className="absolute top-1.5 right-2 font-mono text-[10px] tabular-nums text-white/30">
          #{fighter.id}
        </span>
        {legendaryLabel && (
          <span className="absolute bottom-1.5 left-2 rounded-full border border-white/12 bg-black/55 px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-white/70">
            {legendaryLabel}
          </span>
        )}
        {/* Bumped from the top-left corner to make way for the rating. */}
        {fighter.isEdited && (
          <span className="absolute right-2 bottom-1.5 rounded-full bg-brand-red px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-black">
            ИЗМЕНЁН
          </span>
        )}
      </div>

      <h3 className="mt-3 truncate font-heading text-[19px] leading-tight font-semibold capitalize">{fighter.name}</h3>

      <div className="mt-2 flex flex-wrap gap-1">
        {fighter.types.map((type) => (
          <span
            key={type}
            className="flex items-center gap-1.5 rounded-full border border-white/8 py-[3px] pr-2 pl-1.5 text-[11px] text-white/60"
          >
            <span className="size-1.5 rounded-full" style={{ background: TONE_HEX[toneOfTypes([type])] }} />
            {typeLabel(type)}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-y-2 rounded-2xl bg-black/30 px-2 py-2.5">
        {STAT_CELLS.map(([key, label]) => (
          <div key={key} className="text-center">
            <div className="font-mono text-[8.5px] tracking-[0.1em] text-white/32">{label}</div>
            <div className="mt-0.5 font-mono text-[12.5px] leading-none font-medium tabular-nums text-white/90">
              {fighter.stats[key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9.5px] tracking-[0.12em] text-white/32">СУММА</span>
          <span className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: accent }}>
            {total}
          </span>
        </div>
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${totalPct}%`, background: accent }} />
        </div>
      </div>
    </article>
  );
}
