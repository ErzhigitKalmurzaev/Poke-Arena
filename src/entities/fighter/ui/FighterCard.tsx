import Image from 'next/image';
import { battleStatTotal } from '../model/battleStats';
import { TONE_BG, TONE_TEXT, toneOfTypes } from '../model/tone';
import type { Fighter } from '../model/types';

interface FighterCardProps {
  fighter: Fighter;
}

// Flat, in grid-auto-flow order: with grid-cols-2 this lays out as
// HP|СП.А / АТК|СП.З / ЗАЩ|СКР, matching the design's stat grid.
const STAT_CELLS: [string, string][] = [
  ['hp', 'HP'],
  ['special-attack', 'СП.А'],
  ['attack', 'АТК'],
  ['special-defense', 'СП.З'],
  ['defense', 'ЗАЩ'],
  ['speed', 'СКР'],
];

export function FighterCard({ fighter }: FighterCardProps) {
  const tone = toneOfTypes(fighter.types);
  const legendaryLabel = fighter.isMythical ? 'МИФИЧЕСКИЙ' : fighter.isLegendary ? 'ЛЕГЕНДАРНЫЙ' : null;

  return (
    <div className="rounded-[24px] bg-card p-3.5">
      <div className={`relative grid h-33 place-items-center rounded-[18px] ${TONE_BG[tone]}`}>
        {fighter.sprite && (
          <Image src={fighter.sprite} alt={fighter.name} width={96} height={96} className="object-contain" />
        )}
        {fighter.isEdited && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-black px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] text-brand-amber">
            ИЗМЕНЁН
          </span>
        )}
        {legendaryLabel && (
          <span className="absolute top-2.5 right-2.5 rounded-full border border-brand-amber bg-black px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] text-brand-amber">
            {legendaryLabel}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-heading text-[19px] font-semibold capitalize">{fighter.name}</span>
        <span className="font-mono text-[11px] text-white/40">#{fighter.id}</span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11.5px]">
        {STAT_CELLS.map(([key, label]) => (
          <div key={key} className="flex justify-between">
            <span className="text-white/42">{label}</span>
            <span>{fighter.stats[key] ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between border-t border-white/8 pt-2.5 font-mono text-[11.5px]">
        <span className="text-white/42">СУММА</span>
        <span className={`font-semibold ${TONE_TEXT[tone]}`}>{battleStatTotal(fighter.stats)}</span>
      </div>
    </div>
  );
}
