'use client';

import Image from 'next/image';
import type { BattleSide, DuelOutcome } from '@/entities/battle';
import type { Fighter } from '@/entities/fighter';
import { TEAM_SIZE } from '@/entities/team';

interface BattleLineupProps {
  name: string;
  side: BattleSide;
  accent: string;
  fighters: Fighter[];
  /** Rounds already on screen - a slot past this is still face-down. */
  duels: DuelOutcome[];
  /** The round mid-reveal, or null before the battle starts / after it ends. */
  activeSlot: number | null;
}

/**
 * One side's roster as a narrow vertical strip - the same sprite-and-name
 * shape the draft screen uses for its team columns, so a lineup looks the
 * same wherever you meet it. Here the slots also carry the running result:
 * the round being fought is ringed, and settled rounds mark won or lost.
 */
export function BattleLineup({ name, side, accent, fighters, duels, activeSlot }: BattleLineupProps) {
  const wins = duels.filter((duel) => duel.winner === side).length;

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl border border-white/8 bg-card/50 p-3.5">
      <div className="flex items-center gap-2 px-0.5">
        <span className="size-2.5 shrink-0 rounded-full" style={{ background: accent }} />
        <span className="min-w-0 flex-1 truncate font-heading text-[14px] font-semibold">{name}</span>
        <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums" style={{ color: accent }}>
          {wins}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {Array.from({ length: TEAM_SIZE }, (_, slot) => {
          const fighter = fighters[slot];
          // A side that hasn't finished drafting still shows its shape, so the
          // gap that's blocking the battle is visible right here.
          if (!fighter) {
            return (
              <li
                key={`empty-${slot}`}
                className="flex h-13 items-center justify-center rounded-2xl border border-dashed border-white/12"
              >
                <span className="font-mono text-[9.5px] tracking-[0.1em] text-white/22">СЛОТ {slot + 1}</span>
              </li>
            );
          }
          const duel = duels[slot];
          const isActive = slot === activeSlot;
          const won = duel?.winner === side;
          const lost = duel !== undefined && duel.winner !== side && duel.winner !== 'draw';
          const score = duel ? (side === 'a' ? duel.scoreA : duel.scoreB) : null;

          return (
            <li
              key={fighter.id}
              className="flex h-13 items-center gap-2 rounded-2xl border bg-black/30 px-1.5 transition-[border-color,opacity,background] duration-300"
              style={{
                borderColor: isActive || won ? accent : 'rgba(255,255,255,.07)',
                background: isActive ? 'rgba(255,255,255,.07)' : undefined,
                // A settled loss fades back so the surviving picks read first.
                opacity: lost ? 0.4 : 1,
              }}
            >
              <span className="grid size-10 shrink-0 place-items-center">
                {fighter.sprite && (
                  <Image src={fighter.sprite} alt="" width={38} height={38} className="object-contain" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] capitalize">{fighter.name}</span>
              {score !== null && (
                <span
                  className="shrink-0 pr-1 font-mono text-[11px] tabular-nums"
                  style={{ color: won ? accent : 'rgba(255,255,255,.4)' }}
                >
                  {score}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
