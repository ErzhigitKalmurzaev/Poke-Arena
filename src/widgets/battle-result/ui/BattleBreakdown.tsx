'use client';

import type { BattleExplanation, BattleSide } from '@/entities/battle';

interface BattleBreakdownProps {
  explanation: BattleExplanation;
  /** Human name of the compared parameter, resolved from the stat registry. */
  statLabel: string;
  statUnit?: string;
  nameA: string;
  nameB: string;
  colorFor: (side: BattleSide | 'draw') => string;
}

/**
 * Why the battle ended the way it did: every round's two numbers on the
 * compared parameter, the gap between them, and the round that carried the
 * result.
 *
 * Reads a settled BattleExplanation and renders it - no scoring, no
 * re-deciding, so this panel cannot disagree with the verdict above it.
 */
export function BattleBreakdown({
  explanation,
  statLabel,
  statUnit,
  nameA,
  nameB,
  colorFor,
}: BattleBreakdownProps) {
  const { rounds, decisiveSlot, totalA, totalB, winner, winsA, winsB } = explanation;
  const decisive = decisiveSlot === null ? null : rounds[decisiveSlot];

  return (
    <section className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-card/50 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <h2 className="font-heading text-[22px] font-semibold">Разбор боя</h2>
        <span className="font-mono text-[9.5px] tracking-[0.12em] text-white/40">
          СРАВНЕНИЕ ПО: {statLabel.toUpperCase()}
          {statUnit ? `, ${statUnit.toUpperCase()}` : ''}
        </span>
      </div>

      {/*
        A custom parameter nobody has been given a value for scores 0 across
        the board, so every round ties and the battle is a draw on a technicality.
        Saying so beats leaving the user to work it out from a table of zeroes.
      */}
      {totalA === 0 && totalB === 0 && (
        <p className="rounded-2xl bg-brand-red/12 px-4 py-2.5 text-[13px] leading-relaxed text-white/80">
          Ни у одного бойца из составов нет значения параметра «{statLabel}» — сравнивать нечего. Задай значения на
          странице бойца или выбери другой параметр.
        </p>
      )}

      {/* The one-sentence answer, before the table that backs it up. */}
      <p className="text-[14px] leading-relaxed text-white/75">
        {winner === 'draw' ? (
          <>
            Ничья: раунды разошлись <strong className="font-semibold text-white">{winsA}:{winsB}</strong>, ни одна
            сторона не взяла больше.
          </>
        ) : (
          <>
            <strong className="font-semibold text-white">{winner === 'a' ? nameA : nameB}</strong> выиграл{' '}
            <strong className="font-semibold text-white">{winner === 'a' ? winsA : winsB}</strong> из {rounds.length}{' '}
            раундов по параметру «{statLabel}»
            {decisive && (
              <>
                {' '}
                — решающим стал раунд {decisive.slot + 1}, где{' '}
                <span className="capitalize">{winner === 'a' ? decisive.nameA : decisive.nameB}</span> обошёл{' '}
                <span className="capitalize">{winner === 'a' ? (decisive.nameB ?? 'пустой слот') : (decisive.nameA ?? 'пустой слот')}</span> на{' '}
                {decisive.margin}
              </>
            )}
            .
          </>
        )}
      </p>

      {/*
        A table, not a list of cards: the point is comparing two columns of
        numbers down the rounds, which is exactly what a table is for. Fixed
        column widths on the numbers keep the two sides aligned however long
        the names run.
      */}
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[13px]">
          <caption className="sr-only">
            Разбор боя по раундам: значения параметра «{statLabel}» у каждой пары бойцов
          </caption>
          <thead>
            <tr className="font-mono text-[9.5px] tracking-[0.1em] text-white/35">
              <th scope="col" className="w-9 px-1 pb-2 text-left font-normal">
                #
              </th>
              <th scope="col" className="px-1 pb-2 text-right font-normal" style={{ color: colorFor('a') }}>
                {nameA.toUpperCase()}
              </th>
              <th scope="col" className="w-16 px-1 pb-2 text-center font-normal">
                РАЗРЫВ
              </th>
              <th scope="col" className="px-1 pb-2 text-left font-normal" style={{ color: colorFor('b') }}>
                {nameB.toUpperCase()}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {rounds.map((round) => {
              const isDecisive = round.slot === decisiveSlot;
              return (
                <tr key={round.slot} className={isDecisive ? 'bg-white/[0.04]' : undefined}>
                  <td className="px-1 py-2 font-mono text-[11px] text-white/35 tabular-nums">{round.slot + 1}</td>

                  <SideCell
                    align="right"
                    name={round.nameA}
                    score={round.scoreA}
                    won={round.winner === 'a'}
                    color={colorFor('a')}
                  />

                  <td className="px-1 py-2 text-center font-mono text-[11px] tabular-nums">
                    <span style={{ color: colorFor(round.winner) }}>
                      {round.winner === 'draw' ? '=' : `+${round.margin}`}
                    </span>
                  </td>

                  <SideCell
                    align="left"
                    name={round.nameB}
                    score={round.scoreB}
                    won={round.winner === 'b'}
                    color={colorFor('b')}
                  />
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-mono text-[11px] tabular-nums">
              <td className="px-1 pt-2.5 text-[9.5px] tracking-[0.1em] text-white/35">ИТОГ</td>
              <td className="px-1 pt-2.5 text-right" style={{ color: colorFor('a') }}>
                {totalA}
              </td>
              <td className="px-1 pt-2.5 text-center text-[9.5px] tracking-[0.1em] text-white/30">СУММА</td>
              <td className="px-1 pt-2.5 text-left" style={{ color: colorFor('b') }}>
                {totalB}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/*
        The sum of the parameter is deliberately *not* what decides the battle -
        rounds are. Saying so here heads off reading the footer as a
        contradiction when one side out-totals the other and still loses.
      */}
      {((winner === 'a' && totalA < totalB) || (winner === 'b' && totalB < totalA)) && (
        <p className="text-[12.5px] leading-relaxed text-white/45">
          Сумма параметра выше у проигравшей стороны: бой решается по числу выигранных раундов, а не по общей сумме —
          один очень сильный боец не перекрывает четыре проигранных пары.
        </p>
      )}
    </section>
  );
}

function SideCell({
  align,
  name,
  score,
  won,
  color,
}: {
  align: 'left' | 'right';
  name: string | null;
  score: number;
  won: boolean;
  color: string;
}) {
  const isRight = align === 'right';
  return (
    <td className={`px-1 py-2 ${isRight ? 'text-right' : 'text-left'}`}>
      <span className={`flex items-baseline gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
        <span
          className="font-mono text-[13px] font-semibold tabular-nums"
          style={{ color: won ? color : 'rgba(255,255,255,.45)' }}
        >
          {score}
        </span>
        <span className={`min-w-0 truncate capitalize ${won ? 'text-white/85' : 'text-white/40'}`}>
          {name ?? <span className="text-white/25 italic">пустой слот</span>}
        </span>
      </span>
    </td>
  );
}
