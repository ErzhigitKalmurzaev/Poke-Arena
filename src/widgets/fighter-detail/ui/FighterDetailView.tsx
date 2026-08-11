'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FighterHeader, FighterMedia, getFighterById } from '@/entities/fighter';
import { CustomStatAssignForm } from '@/features/custom-stat-create';
import { FighterEditForm } from '@/features/fighter-edit';

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <Link href="/catalog" className="font-mono text-xs text-white/45 hover:text-white">
        ← Назад в покедекс
      </Link>

      {isLoading && <div className="h-[500px] animate-pulse rounded-[32px] bg-card" />}

      {isError && (
        <div className="rounded-[22px] bg-card p-6 text-[15px] text-white/70">
          Не получилось загрузить данные. Проверь соединение и обнови страницу.
          <button type="button" onClick={() => void refetch()} className="ml-3 font-semibold text-brand-red underline">
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !isError && !fighter && (
        <div className="rounded-[22px] bg-card p-6 text-[15px] text-white/70">Такого бойца нет в покедексе.</div>
      )}

      {fighter && (
        <>
          <FighterMedia fighter={fighter} />
          <FighterHeader fighter={fighter} />
          <FighterEditForm fighter={fighter} />
          <CustomStatAssignForm fighterId={fighter.id} />
        </>
      )}
    </div>
  );
}
