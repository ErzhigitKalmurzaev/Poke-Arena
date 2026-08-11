'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  createCustomStat,
  getCustomStats,
  getCustomStatValuesForFighter,
  removeCustomStatValue,
  setCustomStatValue,
} from '../model/customStatActions';

interface CustomStatAssignFormProps {
  fighterId: string;
}

type AddMode = 'existing' | 'new';

export function CustomStatAssignForm({ fighterId }: CustomStatAssignFormProps) {
  const queryClient = useQueryClient();

  const { data: customStats = [] } = useQuery({ queryKey: ['customStats'], queryFn: getCustomStats });
  const { data: fighterValues = [] } = useQuery({
    queryKey: ['customStatValues', fighterId],
    queryFn: () => getCustomStatValuesForFighter(fighterId),
  });

  const [mode, setMode] = useState<AddMode>('new');
  const [pickedStatId, setPickedStatId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [value, setValue] = useState('');

  const assignedIds = new Set(fighterValues.map((row) => row.statId));
  // A stat this fighter already carries isn't offerable again - editing its
  // value is what the row above is for.
  const available = customStats.filter((stat) => !assignedIds.has(stat.id));

  const numericValue = Number(value);
  const hasValue = value.trim() !== '' && Number.isFinite(numericValue);
  const canSubmit = hasValue && (mode === 'new' ? newLabel.trim().length > 0 : pickedStatId !== '');

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['customStats'] }),
      queryClient.invalidateQueries({ queryKey: ['customStatValues', fighterId] }),
      queryClient.invalidateQueries({ queryKey: ['fighter', fighterId] }),
      queryClient.invalidateQueries({ queryKey: ['fighters'] }),
      queryClient.invalidateQueries({ queryKey: ['statRegistry'] }),
    ]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      const statId = mode === 'new' ? (await createCustomStat(newLabel, newUnit || undefined)).id : pickedStatId;
      await setCustomStatValue(fighterId, statId, numericValue);
    },
    onSuccess: async () => {
      await refresh();
      setPickedStatId('');
      setNewLabel('');
      setNewUnit('');
      setValue('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ statId, next }: { statId: string; next: number }) => setCustomStatValue(fighterId, statId, next),
    onSuccess: refresh,
  });

  const removeMutation = useMutation({
    mutationFn: (statId: string) => removeCustomStatValue(fighterId, statId),
    onSuccess: refresh,
  });

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-card/50 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-[22px] font-semibold">Кастомные параметры</h2>
        <span className="font-mono text-[9.5px] tracking-[0.12em] text-white/35">
          {fighterValues.length > 0 ? `${fighterValues.length} НА ЭТОМ БОЙЦЕ` : 'ПОКА НИ ОДНОГО'}
        </span>
      </div>

      {fighterValues.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {fighterValues.map((row) => {
            const stat = customStats.find((s) => s.id === row.statId);
            return (
              <li
                key={row.statId}
                className="flex items-center gap-2 rounded-2xl border border-white/8 bg-black/30 py-1.5 pr-1.5 pl-3"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">{stat?.label ?? row.statId}</span>
                {stat?.unit && (
                  <span className="shrink-0 font-mono text-[9.5px] tracking-[0.1em] text-white/30">
                    {stat.unit.toUpperCase()}
                  </span>
                )}
                {/*
                 * Uncontrolled and keyed on the stored value: typing never
                 * round-trips through Dexie, and an external change remounts
                 * the field with fresh text instead of going stale.
                 */}
                <input
                  key={row.value}
                  type="number"
                  defaultValue={row.value}
                  aria-label={`Значение «${stat?.label ?? row.statId}»`}
                  onBlur={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next) && next !== row.value) {
                      updateMutation.mutate({ statId: row.statId, next });
                    }
                  }}
                  className="w-16 shrink-0 rounded-md border border-white/10 bg-black/40 px-1.5 py-1 text-right font-mono text-[12.5px] tabular-nums outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(row.statId)}
                  aria-label={`Убрать «${stat?.label ?? row.statId}»`}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-brand-red"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[13px] text-white/45">
          Здесь можно завести свой параметр — например «Харизма» — и он появится в фильтрах покедекса.
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) assignMutation.mutate();
        }}
        className="flex flex-col gap-3 border-t border-white/8 pt-4"
      >
        {/* Two explicit modes instead of hiding "new" inside the dropdown as a
            magic option - which of the two you're doing is the first decision,
            so it shouldn't be buried one level down. */}
        <div className="flex gap-1.5">
          <ModeTab active={mode === 'new'} onClick={() => setMode('new')}>
            Новый параметр
          </ModeTab>
          <ModeTab active={mode === 'existing'} onClick={() => setMode('existing')} disabled={available.length === 0}>
            Из существующих{available.length > 0 ? ` (${available.length})` : ''}
          </ModeTab>
        </div>

        {mode === 'new' ? (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="custom-stat-label" className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
                НАЗВАНИЕ
              </label>
              <Input
                id="custom-stat-label"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="Харизма"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="custom-stat-unit" className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
                ЕДИНИЦА · НЕОБЯЗАТЕЛЬНО
              </label>
              <Input
                id="custom-stat-unit"
                value={newUnit}
                onChange={(event) => setNewUnit(event.target.value)}
                placeholder="баллов"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {available.map((stat) => {
              const picked = stat.id === pickedStatId;
              return (
                <button
                  key={stat.id}
                  type="button"
                  onClick={() => setPickedStatId(stat.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                    picked ? 'border-white bg-white text-black' : 'border-white/12 text-white/65 hover:text-white'
                  }`}
                >
                  {picked && <Check className="size-3" />}
                  {stat.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-end gap-2.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="custom-stat-value" className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
              ЗНАЧЕНИЕ
            </label>
            <Input
              id="custom-stat-value"
              type="number"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-28"
            />
          </div>
          <Button type="submit" disabled={!canSubmit || assignMutation.isPending}>
            <Plus className="size-3.5" />
            {assignMutation.isPending ? 'Добавляем…' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ModeTab({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors disabled:opacity-30 ${
        active ? 'bg-white text-black' : 'bg-white/8 text-white/60 not-disabled:hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
