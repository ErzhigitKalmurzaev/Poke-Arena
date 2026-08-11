'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { battleStatTotal, type Fighter } from '@/entities/fighter';
import type { TeamRow } from '@/shared/lib/db';
import { TEAM_SIZE } from '@/entities/team';

interface TeamColumnProps {
  team: TeamRow;
  accent: string;
  fightersById: Map<string, Fighter>;
  /** Highlights the slot holding the fighter currently in the spotlight. */
  spotlightId: string | null;
  onRename: (name: string) => void;
  onRemove: (fighterId: string) => void;
  onFocusFighter: (fighterId: string) => void;
  onClear: () => void;
}

/**
 * A team as a narrow vertical strip: sprite + name per slot and nothing else -
 * the full stat readout belongs to the spotlight, so the columns stay scannable
 * at a glance while drafting.
 */
export function TeamColumn({
  team,
  accent,
  fightersById,
  spotlightId,
  onRename,
  onRemove,
  onFocusFighter,
  onClear,
}: TeamColumnProps) {
  const members = team.fighterIds.map((id) => fightersById.get(id)).filter((f): f is Fighter => f !== undefined);
  const total = members.reduce((sum, fighter) => sum + battleStatTotal(fighter.stats), 0);
  const isFull = team.fighterIds.length >= TEAM_SIZE;

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl border border-white/8 bg-card/50 p-3.5">
      <div className="flex items-center gap-2 px-0.5">
        <span className="size-2.5 shrink-0 rounded-full" style={{ background: accent }} />
        {/* Uncontrolled + keyed on the saved name: typing never touches the
            stored team, and an external change (rename elsewhere, clear)
            remounts the field with fresh text instead of going stale. */}
        <input
          key={team.name}
          defaultValue={team.name}
          onBlur={(event) => {
            if (event.target.value.trim() !== team.name) onRename(event.target.value);
          }}
          aria-label="Название команды"
          className="min-w-0 flex-1 truncate border-none bg-transparent p-0 font-heading text-[14px] font-semibold outline-none"
        />
        <span
          className="shrink-0 font-mono text-[10px] tabular-nums"
          style={{ color: isFull ? accent : 'rgba(255,255,255,.35)' }}
        >
          {team.fighterIds.length}/{TEAM_SIZE}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {Array.from({ length: TEAM_SIZE }, (_, index) => {
          const fighter = members[index];
          if (!fighter) {
            return (
              <li
                key={`empty-${index}`}
                className="flex h-13 items-center justify-center rounded-2xl border border-dashed border-white/12"
              >
                <span className="font-mono text-[9.5px] tracking-[0.1em] text-white/22">СЛОТ {index + 1}</span>
              </li>
            );
          }
          const isSpotlit = fighter.id === spotlightId;
          return (
            <li key={fighter.id} className="group relative">
              <button
                type="button"
                onClick={() => onFocusFighter(fighter.id)}
                className="flex h-13 w-full items-center gap-2 rounded-2xl border bg-black/30 pr-7 pl-1.5 text-left transition-colors"
                style={{
                  borderColor: isSpotlit ? accent : 'rgba(255,255,255,.07)',
                  background: isSpotlit ? 'rgba(255,255,255,.07)' : undefined,
                }}
              >
                <span className="grid size-10 shrink-0 place-items-center">
                  {fighter.sprite && (
                    <Image src={fighter.sprite} alt="" width={38} height={38} className="object-contain" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] capitalize">{fighter.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(fighter.id)}
                aria-label={`Убрать ${fighter.name}`}
                className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-2 border-t border-white/8 px-0.5 pt-2">
        <span className="font-mono text-[9.5px] tracking-[0.1em] text-white/35">
          СУММА <span className="text-white/75 tabular-nums">{total}</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          disabled={team.fighterIds.length === 0}
          className="font-mono text-[9.5px] tracking-[0.08em] text-white/35 uppercase transition-colors not-disabled:hover:text-brand-red disabled:opacity-30"
        >
          Очистить
        </button>
      </div>
    </div>
  );
}
