import { TONE_BG, toneOfTypes } from '../model/tone';
import type { Fighter } from '../model/types';

interface FighterHeaderProps {
  fighter: Fighter;
}

export function FighterHeader({ fighter }: FighterHeaderProps) {
  const tone = toneOfTypes(fighter.types);
  const legendaryLabel = fighter.isMythical ? 'МИФИЧЕСКИЙ' : fighter.isLegendary ? 'ЛЕГЕНДАРНЫЙ' : null;

  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-mono text-[11px] text-white/40">#{fighter.id}</span>
      <h1 className="mt-1 font-heading text-5xl font-semibold capitalize" style={{ letterSpacing: '-.03em' }}>
        {fighter.name}
      </h1>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {fighter.types.map((type) => (
          <span key={type} className={`rounded-full px-4 py-1.5 font-mono text-xs text-black uppercase ${TONE_BG[toneOfTypes([type])]}`}>
            {type}
          </span>
        ))}
        {legendaryLabel && (
          <span className={`rounded-full px-4 py-1.5 font-mono text-xs text-black uppercase ${TONE_BG[tone]}`}>{legendaryLabel}</span>
        )}
        {fighter.isEdited && (
          <span className="rounded-full bg-black px-4 py-1.5 font-mono text-xs tracking-[0.1em] text-brand-red uppercase">
            изменён
          </span>
        )}
      </div>
      <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/60">{fighter.description}</p>
    </div>
  );
}
