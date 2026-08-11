'use client';

import { Shuffle, Swords } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { TEAM_SLOTS } from '@/entities/team';
import { getBattleReadiness } from '@/features/battle-run';
import { SearchInput } from '@/features/fighter-search';
import { DraftCarousel, DraftSpotlight, TeamColumn } from '@/features/team-builder';
import { useTeamDraft } from '../model/useTeamDraft';

const SLOT_ACCENT: Record<(typeof TEAM_SLOTS)[number], string> = {
  'team-a': 'var(--brand-red)',
  'team-b': 'var(--brand-blue)',
};

export function TeamBuilder() {
  const draft = useTeamDraft();
  const { step } = draft;

  /*
   * Arrow keys drive the wheel, so drafting is playable without ever moving
   * the pointer to the chevrons. Skipped while a text field has focus - the
   * search box needs its own caret movement.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  if (draft.isLoading || !draft.teams) return <TeamBuilderSkeleton />;

  const readiness = getBattleReadiness(draft.teams);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-7 sm:px-11">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-white/8 pb-5">
        <div className="flex items-baseline gap-3">
          <h1 className="font-heading text-[42px] leading-none font-semibold" style={{ letterSpacing: '-.03em' }}>
            Составы
          </h1>
          <span className="rounded-full bg-white/6 px-2.5 py-1 font-mono text-[10.5px] tracking-[0.1em] text-white/45">
            {draft.pool.length} ИЗ {draft.poolTotal}
          </span>
        </div>
        <SearchInput value={draft.query} onChange={draft.search} isPending={draft.isSearchPending} />
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[214px_1fr_214px]">
        {/* The picker leads on narrow screens - the columns are a summary of
            what you drafted there, so they read better underneath it. */}
        <div className="order-2 lg:order-none">
          <TeamColumn
            team={draft.teams['team-a']}
            accent={SLOT_ACCENT['team-a']}
            fightersById={draft.fightersById}
            spotlightId={draft.activeFighter?.id ?? null}
            onRename={(name) => draft.rename('team-a', name)}
            onRemove={(fighterId) => draft.unassign('team-a', fighterId)}
            onFocusFighter={draft.focusFighter}
            onClear={() => draft.clear('team-a')}
          />
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-5 lg:order-none">
          {draft.activeFighter ? (
            <DraftSpotlight
              fighter={draft.activeFighter}
              assignedTo={draft.assignedSlot}
              teamFull={draft.teamFull}
              onAssign={draft.assign}
              onUnassign={(slot) => draft.activeFighter && draft.unassign(slot, draft.activeFighter.id)}
            />
          ) : (
            <div className="grid h-58 place-items-center text-[15px] text-white/45">
              Под этот поиск бойцов нет — ослабь запрос
            </div>
          )}

          {draft.notice && (
            <p role="status" className="rounded-2xl bg-brand-red/12 px-4 py-2.5 text-[13px] text-white/80">
              {draft.notice}
            </p>
          )}

          {/* No panel around the wheel: it spins directly under the art, as one
              continuous object rather than a picker boxed off below it. */}
          <div className="flex flex-col">
            <DraftCarousel
              pool={draft.pool}
              activeIndex={draft.activeIndex}
              onSelect={draft.select}
              onStep={draft.step}
            />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={draft.randomize}
                disabled={draft.pool.length === 0}
                className="flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-white/60 transition-colors not-disabled:hover:bg-white not-disabled:hover:text-black disabled:opacity-30"
              >
                <Shuffle className="size-3.5" />
                СЛУЧАЙНЫЙ
              </button>
              <span className="font-mono text-[9.5px] tracking-[0.14em] text-white/28">← → ПЕРЕКЛЮЧАЮТ БОЙЦА</span>
            </div>
          </div>

          {/* Once both sides are full the draft is done, so the screen hands
              off to the battle instead of leaving the user to find the nav. */}
          {readiness.ready ? (
            <Link
              href="/battle"
              className="flex items-center justify-center gap-2 rounded-full bg-brand-mint px-5 py-3.5 text-[15px] font-semibold text-black transition-opacity hover:opacity-90"
            >
              <Swords className="size-4.5" />
              Оба состава готовы — в бой
            </Link>
          ) : (
            <p className="text-center font-mono text-[10.5px] tracking-[0.1em] text-white/35">{readiness.reason}</p>
          )}
        </div>

        <div className="order-3 lg:order-none">
          <TeamColumn
            team={draft.teams['team-b']}
            accent={SLOT_ACCENT['team-b']}
            fightersById={draft.fightersById}
            spotlightId={draft.activeFighter?.id ?? null}
            onRename={(name) => draft.rename('team-b', name)}
            onRemove={(fighterId) => draft.unassign('team-b', fighterId)}
            onFocusFighter={draft.focusFighter}
            onClear={() => draft.clear('team-b')}
          />
        </div>
      </div>
    </div>
  );
}

function TeamBuilderSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 items-start gap-5 px-6 py-7 sm:px-11 lg:grid-cols-[214px_1fr_214px]">
      <div className="hidden h-[430px] animate-pulse rounded-3xl bg-card/50 lg:block" />
      <div className="flex flex-col gap-5">
        <div className="h-76 animate-pulse rounded-3xl bg-card/50" />
        <div className="h-72 animate-pulse rounded-3xl bg-card/50" />
      </div>
      <div className="hidden h-[430px] animate-pulse rounded-3xl bg-card/50 lg:block" />
    </div>
  );
}
