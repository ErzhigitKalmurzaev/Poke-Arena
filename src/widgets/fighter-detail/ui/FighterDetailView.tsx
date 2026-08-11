'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getFighterById } from '@/entities/fighter';
import { CustomStatAssignForm } from '@/features/custom-stat-create';
import { FighterEditForm } from '@/features/fighter-edit';
import { FighterShowcase } from './FighterShowcase';

interface FighterDetailViewProps {
  id: string;
}

export function FighterDetailView({ id }: FighterDetailViewProps) {
  const {
    data: fighter,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['fighter', id],
    queryFn: () => getFighterById(id),
  });

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-7 sm:px-11">
      <Link
        href="/catalog"
        className="flex w-fit items-center gap-2 font-mono text-[10.5px] tracking-[0.1em] text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        НАЗАД В ПОКЕДЕКС
      </Link>

      {isLoading && (
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)]">
          <div className="h-[560px] animate-pulse rounded-[28px] bg-card/50" />
          <div className="h-[560px] animate-pulse rounded-[28px] bg-card/50" />
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-[22px] border border-white/8 bg-card/50 p-6 text-[15px] text-white/70">
          Не получилось загрузить данные. Проверь соединение и обнови страницу.
          <button type="button" onClick={() => void refetch()} className="ml-3 font-semibold text-brand-red underline">
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !isError && !fighter && (
        <div className="mt-6 rounded-[22px] border border-white/8 bg-card/50 p-6 text-[15px] text-white/70">
          Такого бойца нет в покедексе.
        </div>
      )}

      {fighter && (
        /*
         * Fighter on the left, the panels that change him on the right - the
         * same split the draft screen uses, so an edit and its effect stay in
         * one field of view instead of scrolling past each other.
         */
        <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)]">
          <div className="lg:sticky lg:top-[calc(var(--app-header-h)+1.25rem)]">
            <FighterShowcase fighter={fighter} />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <FighterEditForm fighter={fighter} />
            <CustomStatAssignForm fighterId={fighter.id} />
          </div>
        </div>
      )}
    </div>
  );
}
