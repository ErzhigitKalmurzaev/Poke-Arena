'use client';

import { AnimatePresence, motion } from 'motion/react';
import { FastForward, RotateCcw, Users } from 'lucide-react';
import Link from 'next/link';
import { TOTAL_STAT_ID, powersAfter, type BattleOutcome, type BattleSide } from '@/entities/battle';
import { ComparisonStatSelect, RunBattleButton, useBattlePlayback, useBattleRun } from '@/features/battle-run';
import { BattleArena, type ArenaStrike } from './BattleArena';
import { BattleBreakdown } from './BattleBreakdown';
import { BattleLineup } from './BattleLineup';

const EASE = [0.22, 1, 0.36, 1] as const;

const SIDE_COLOR: Record<BattleSide | 'draw', string> = {
  a: 'var(--brand-red)',
  b: 'var(--brand-blue)',
  draw: 'var(--brand-mint)',
};

const colorForSide = (side: BattleSide | 'draw') => SIDE_COLOR[side];

const TOTAL_STAT_LABEL = 'все характеристики';

function verdictText(outcome: BattleOutcome, nameA: string, nameB: string, statLabel: string) {
  if (outcome.winner === 'draw') {
    return `Ничья ${outcome.winsA}:${outcome.winsB} — обе команды взяли поровну раундов по «${statLabel}».`;
  }
  const winnerName = outcome.winner === 'a' ? nameA : nameB;
  const [winsFor, winsAgainst] = outcome.winner === 'a' ? [outcome.winsA, outcome.winsB] : [outcome.winsB, outcome.winsA];
  return `${winnerName} берёт бой ${winsFor}:${winsAgainst} по «${statLabel}».`;
}

export function BattleResultView() {
  const { teams, lineups, readiness, stats, statId, setStatId, outcome, scripts, explanation, run, reset } =
    useBattleRun();
  const { step, isPlaying, skip } = useBattlePlayback(outcome, scripts);

  // The registry hasn't loaded on the first paint, and a custom stat can be
  // deleted while its id still sits in the URL - falling back to the id keeps
  // the verdict readable either way instead of rendering "undefined".
  const selectedStat = stats.find((stat) => stat.id === statId);
  const statLabel = statId === TOTAL_STAT_ID ? TOTAL_STAT_LABEL : (selectedStat?.label ?? statId);

  // Teams live in Dexie, so the first paint (server render included) has none.
  if (!teams) return <BattleSkeleton />;

  const nameA = teams['team-a'].name;
  const nameB = teams['team-b'].name;

  /*
   * The scene the arena should draw, resolved from one timeline beat.
   * Everything below is a projection of `step` - there is no second source of
   * truth about how far along the battle is.
   */
  const duelIndex = outcome ? (step?.duelIndex ?? outcome.duels.length - 1) : 0;
  const duel = outcome?.duels[duelIndex];
  const script = scripts[duelIndex];

  const exchangeIndex =
    step?.kind === 'exchange' ? step.exchangeIndex : step?.kind === 'intro' ? -1 : (script?.exchanges.length ?? 0) - 1;

  const powers = script ? powersAfter(script, exchangeIndex) : { a: 100, b: 100 };

  const exchange = step?.kind === 'exchange' ? script?.exchanges[step.exchangeIndex] : undefined;
  // Unique per blow across the whole battle, so re-entry animations fire even
  // when consecutive rounds happen to use the same move.
  const strike: ArenaStrike | null = exchange ? { ...exchange, key: duelIndex * 100 + exchangeIndex } : null;

  // A round counts as settled at its verdict beat, which is what makes the
  // scoreboard tick over in step with the stage instead of ahead of it.
  const settledCount = outcome
    ? step
      ? step.kind === 'verdict'
        ? step.duelIndex + 1
        : step.duelIndex
      : outcome.duels.length
    : 0;
  const settledDuels = outcome ? outcome.duels.slice(0, settledCount) : [];
  const winsA = settledDuels.filter((d) => d.winner === 'a').length;
  const winsB = settledDuels.filter((d) => d.winner === 'b').length;

  const showRoundWinner = outcome !== null && (step === null || step.kind === 'verdict');
  const isFinished = outcome !== null && !isPlaying;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-7 sm:px-11">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-3 border-b border-white/8 pb-5">
        <h1 className="font-heading text-[42px] leading-none font-semibold" style={{ letterSpacing: '-.03em' }}>
          Бой команд
        </h1>
        <Link
          href="/team-builder"
          className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.1em] text-white/45 transition-colors hover:text-white"
        >
          <Users className="size-3.5" />
          ИЗМЕНИТЬ СОСТАВЫ
        </Link>
      </div>

      {/*
        The comparison parameter sits above the stage, full width: it decides
        what the whole screen below means, and it's the first thing to set
        before running anything. Locked while the battle plays out, since
        switching it retires the result being animated.
      */}
      <div className="mt-5">
        <ComparisonStatSelect stats={stats} value={statId} disabled={isPlaying} onChange={setStatId} />
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[214px_1fr_214px]">
        <div className="order-2 lg:order-none">
          <BattleLineup
            name={nameA}
            side="a"
            accent={SIDE_COLOR.a}
            fighters={lineups.a}
            duels={settledDuels}
            activeSlot={isPlaying ? duelIndex : null}
          />
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-none">
          {/* Series score: how the battle stands, above the round in progress. */}
          <div className="flex items-center justify-center gap-5">
            <span className="min-w-0 flex-1 truncate text-right font-heading text-[17px] font-semibold">{nameA}</span>
            <span className="flex shrink-0 items-baseline gap-2 font-mono text-[34px] leading-none font-semibold tabular-nums">
              <motion.span key={`a${winsA}`} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ color: SIDE_COLOR.a }}>
                {winsA}
              </motion.span>
              <span className="text-[18px] text-white/25">:</span>
              <motion.span key={`b${winsB}`} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ color: SIDE_COLOR.b }}>
                {winsB}
              </motion.span>
            </span>
            <span className="min-w-0 flex-1 truncate font-heading text-[17px] font-semibold">{nameB}</span>
          </div>

          {outcome && (
            <div className="flex gap-1.5">
              {outcome.duels.map((d, index) => {
                const settled = index < settledCount;
                const running = isPlaying && index === duelIndex && !settled;
                return (
                  <motion.span
                    key={index}
                    className="h-1.5 flex-1 rounded-full"
                    initial={false}
                    animate={{
                      backgroundColor: settled
                        ? SIDE_COLOR[d.winner]
                        : running
                          ? 'rgba(255,255,255,.55)'
                          : 'rgba(255,255,255,.1)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </div>
          )}

          <BattleArena
            fighterA={outcome ? lineups.a[duelIndex] : lineups.a[0]}
            fighterB={outcome ? lineups.b[duelIndex] : lineups.b[0]}
            nameA={nameA}
            nameB={nameB}
            roundLabel={outcome ? `РАУНД ${String(duelIndex + 1).padStart(2, '0')}` : 'ГОТОВЫ К БОЮ'}
            powerA={powers.a}
            powerB={powers.b}
            strike={strike}
            roundWinner={showRoundWinner && duel ? duel.winner : null}
          />

          <AnimatePresence mode="wait">
            {!outcome ? (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <RunBattleButton ready={readiness.ready} reason={readiness.reason} onRun={run} />
                {!readiness.ready && (
                  <Link href="/team-builder" className="text-[13px] font-semibold text-brand-red underline">
                    Собрать составы
                  </Link>
                )}
              </motion.div>
            ) : isPlaying ? (
              <motion.button
                key="skip"
                type="button"
                onClick={skip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 self-center rounded-full border border-white/12 px-4 py-2 font-mono text-[10.5px] tracking-[0.1em] text-white/50 transition-colors hover:bg-white hover:text-black"
              >
                <FastForward className="size-3.5" />
                ПРОПУСТИТЬ
              </motion.button>
            ) : (
              <motion.div
                key="verdict"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-full rounded-[22px] px-5.5 py-4.5 text-center text-[15px] font-semibold text-black"
                  style={{ background: SIDE_COLOR[outcome.winner] }}
                >
                  {verdictText(outcome, nameA, nameB, statLabel)}
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white hover:text-black"
                >
                  <RotateCcw className="size-3.5" />
                  Запустить снова
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="order-3 lg:order-none">
          <BattleLineup
            name={nameB}
            side="b"
            accent={SIDE_COLOR.b}
            fighters={lineups.b}
            duels={settledDuels}
            activeSlot={isPlaying ? duelIndex : null}
          />
        </div>
      </div>

      {isFinished && explanation && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-6"
        >
          <BattleBreakdown
            explanation={explanation}
            statLabel={statLabel}
            statUnit={selectedStat?.unit}
            nameA={nameA}
            nameB={nameB}
            colorFor={colorForSide}
          />
        </motion.div>
      )}

      {isFinished && <span className="sr-only">{verdictText(outcome, nameA, nameB, statLabel)}</span>}
    </div>
  );
}

function BattleSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-7 sm:px-11">
      <div className="flex items-baseline justify-between gap-5 border-b border-white/8 pb-5">
        <div className="h-[42px] w-64 animate-pulse rounded-xl bg-card" />
        <div className="h-3.5 w-40 animate-pulse rounded-full bg-card" />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <div className="h-2.5 w-40 animate-pulse rounded-full bg-card" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-6.5 w-24 animate-pulse rounded-full bg-card" />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[214px_1fr_214px]">
        <div className="order-2 hidden h-[404px] animate-pulse rounded-3xl bg-card/50 lg:order-none lg:block" />
        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-none">
          <div className="h-8 animate-pulse rounded-xl bg-card/50" />
          <div className="h-[268px] animate-pulse rounded-[32px] bg-card" />
          <div className="h-9 w-36 animate-pulse self-center rounded-full bg-card/50" />
        </div>
        <div className="order-3 hidden h-[404px] animate-pulse rounded-3xl bg-card/50 lg:order-none lg:block" />
      </div>
    </div>
  );
}
