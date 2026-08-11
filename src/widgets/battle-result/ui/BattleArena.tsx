'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import type { BattleSide, DuelExchange } from '@/entities/battle';
import { TONE_HEX, toneOfTypes, toneRgba, type Fighter } from '@/entities/fighter';

const EASE = [0.22, 1, 0.36, 1] as const;

/** How far a fighter lunges into the centre when he throws a blow. */
const LUNGE_PX = 52;
/** …and how far the one on the receiving end is knocked back. */
const RECOIL_PX = 14;

export interface ArenaStrike extends DuelExchange {
  /**
   * Changes on every blow. Two consecutive hits can carry the same move name,
   * and without a distinct key AnimatePresence would treat the second as the
   * first still mounted - no re-entry, no second impact.
   */
  key: number;
}

interface BattleArenaProps {
  fighterA: Fighter | undefined;
  fighterB: Fighter | undefined;
  nameA: string;
  nameB: string;
  roundLabel: string;
  powerA: number;
  powerB: number;
  /** The blow landing right now, or null between rounds. */
  strike: ArenaStrike | null;
  /** Set once the round is settled: the winner flares, the loser dims. */
  roundWinner: BattleSide | 'draw' | null;
}

const SIDE_ACCENT: Record<BattleSide, string> = {
  a: 'var(--brand-red)',
  b: 'var(--brand-blue)',
};

/**
 * The two current picks, face to face. Everything here is driven by props from
 * the playback timeline - the arena itself decides nothing about the battle,
 * it only shows the beat it was handed.
 */
export function BattleArena({
  fighterA,
  fighterB,
  nameA,
  nameB,
  roundLabel,
  powerA,
  powerB,
  strike,
  roundWinner,
}: BattleArenaProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[32px] px-5 py-5"
      style={{
        background:
          'linear-gradient(118deg, rgba(214,40,40,.20), rgba(35,35,35,1) 36%, rgba(35,35,35,1) 64%, rgba(21,101,192,.20))',
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PowerBar name={nameA} power={powerA} accent={SIDE_ACCENT.a} align="left" />
        <span className="rounded-full bg-black/45 px-3 py-1.5 text-center font-mono text-[10.5px] tracking-[0.1em] whitespace-nowrap text-white/60">
          {roundLabel}
        </span>
        <PowerBar name={nameB} power={powerB} accent={SIDE_ACCENT.b} align="right" />
      </div>

      <div className="relative mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <Combatant
          fighter={fighterA}
          side="a"
          strike={strike}
          beaten={roundWinner === 'b'}
          victorious={roundWinner === 'a'}
        />

        {/* Centre line: a clash spark on every blow, so the eye has something
            to lock onto between the two fighters. */}
        <div className="relative grid h-40 w-14 place-items-center">
          <AnimatePresence mode="wait">
            {strike ? (
              <motion.span
                key={strike.key}
                initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.24, ease: EASE }}
                className="font-heading text-[26px] leading-none font-semibold"
                style={{ color: SIDE_ACCENT[strike.side] }}
              >
                ✦
              </motion.span>
            ) : (
              <motion.span
                key="vs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[12px] tracking-[0.14em] text-white/30"
              >
                VS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Combatant
          fighter={fighterB}
          side="b"
          strike={strike}
          beaten={roundWinner === 'a'}
          victorious={roundWinner === 'b'}
        />
      </div>

      {/* Round verdict, over the stage so it can't push the fighters around. */}
      <AnimatePresence>
        {roundWinner && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
          >
            <span
              className="rounded-full px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.1em] text-black"
              style={{
                background: roundWinner === 'draw' ? 'var(--brand-mint)' : SIDE_ACCENT[roundWinner],
              }}
            >
              {roundWinner === 'draw' ? 'РАУНД ВНИЧЬЮ' : `РАУНД ЗА ${roundWinner === 'a' ? nameA : nameB}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PowerBar({
  name,
  power,
  accent,
  align,
}: {
  name: string;
  power: number;
  accent: string;
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${isRight ? 'items-end' : ''}`}>
      <span className="max-w-full truncate font-heading text-[14px] font-semibold">{name}</span>
      <span className={`flex h-2.5 w-full overflow-hidden rounded-full bg-white/8 ${isRight ? 'justify-end' : ''}`}>
        <motion.span
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={false}
          animate={{ width: `${power}%` }}
          transition={{ duration: 0.42, ease: EASE }}
        />
      </span>
    </div>
  );
}

interface CombatantProps {
  fighter: Fighter | undefined;
  side: BattleSide;
  strike: ArenaStrike | null;
  beaten: boolean;
  victorious: boolean;
}

function Combatant({ fighter, side, strike, beaten, victorious }: CombatantProps) {
  const tone = fighter ? toneOfTypes(fighter.types) : 'mint';
  const accent = TONE_HEX[tone];
  const isAttacking = strike?.side === side;
  const isHit = strike !== null && strike.side !== side;

  const toCentre = side === 'a' ? LUNGE_PX : -LUNGE_PX;
  const awayFromCentre = side === 'a' ? -RECOIL_PX : RECOIL_PX;

  return (
    <div className="relative flex flex-col items-center">
      {/* The move being thrown, named, with the stat it's built from. */}
      <div className="relative h-8 w-full">
        <AnimatePresence>
          {isAttacking && strike && (
            <motion.span
              key={strike.key}
              // The horizontal centring lives in the animated transform, not in
              // a `-translate-x-1/2` class - motion writes `transform` wholesale
              // and would drop a class-based translate on the first frame.
              initial={{ opacity: 0, y: 14, x: '-50%', scale: 0.86 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: -14, x: '-50%' }}
              transition={{ duration: 0.26, ease: EASE }}
              className="absolute bottom-0 left-1/2 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10.5px] font-semibold whitespace-nowrap text-black"
              style={{ background: accent }}
            >
              {strike.move.name}
              <span className="rounded-full bg-black/25 px-1.5 py-0.5 tabular-nums">{strike.move.power}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="relative grid h-36 w-36 place-items-center"
        initial={false}
        animate={{
          x: isAttacking ? toCentre : isHit ? awayFromCentre : 0,
          scale: isAttacking ? 1.09 : 1,
          opacity: beaten ? 0.42 : 1,
        }}
        transition={{ type: 'spring', stiffness: 440, damping: 17 }}
      >
        {/* Standing glow in his element; it swells when he wins the round. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          initial={false}
          animate={{ opacity: victorious ? 1 : 0.45, scale: victorious ? 1.15 : 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ background: `radial-gradient(50% 50% at 50% 55%, ${toneRgba(tone, 0.34)}, transparent 72%)` }}
        />

        {/* Impact burst, on whoever is taking the blow. */}
        <AnimatePresence>
          {isHit && strike && (
            <motion.span
              key={strike.key}
              aria-hidden
              initial={{ opacity: 0.85, scale: 0.35 }}
              animate={{ opacity: 0, scale: 1.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-2 z-10 rounded-full"
              style={{
                background: `radial-gradient(circle, ${SIDE_ACCENT[strike.side]}, transparent 62%)`,
              }}
            />
          )}
        </AnimatePresence>

        {fighter?.sprite ? (
          <Image
            src={fighter.sprite}
            alt={fighter.name}
            width={132}
            height={132}
            className="relative object-contain"
            style={{
              // Front sprites all face the viewer, so B is mirrored to turn the
              // pair into an actual face-off rather than two fighters staring out.
              transform: side === 'b' ? 'scaleX(-1)' : undefined,
              filter: `drop-shadow(0 14px 18px ${toneRgba(tone, 0.5)})`,
            }}
          />
        ) : (
          <span className="font-mono text-[10px] tracking-[0.1em] text-white/25">НЕТ БОЙЦА</span>
        )}
      </motion.div>

      <span
        aria-hidden
        className="h-2 w-24 rounded-[50%] blur-[3px]"
        style={{ background: 'rgba(0,0,0,.55)' }}
      />

      <span className="mt-1.5 max-w-full truncate text-[13px] font-semibold capitalize">{fighter?.name ?? '—'}</span>
    </div>
  );
}
