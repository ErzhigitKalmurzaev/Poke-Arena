'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { createCustomStat, getCustomStats, getCustomStatValuesForFighter, setCustomStatValue } from '../model/customStatActions';

const NEW_STAT_OPTION = '__new__';

interface CustomStatAssignFormProps {
  fighterId: string;
}

export function CustomStatAssignForm({ fighterId }: CustomStatAssignFormProps) {
  const queryClient = useQueryClient();
  const { data: customStats = [] } = useQuery({ queryKey: ['customStats'], queryFn: getCustomStats });
  const { data: fighterValues = [] } = useQuery({
    queryKey: ['customStatValues', fighterId],
    queryFn: () => getCustomStatValuesForFighter(fighterId),
  });

  const [selectedStatId, setSelectedStatId] = useState(NEW_STAT_OPTION);
  const [newLabel, setNewLabel] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [value, setValue] = useState('');

  const isCreatingNew = selectedStatId === NEW_STAT_OPTION;
  const numericValue = Number(value);
  const canSubmit = value.trim() !== '' && Number.isFinite(numericValue) && (!isCreatingNew || newLabel.trim().length > 0);

  const assignMutation = useMutation({
    mutationFn: async () => {
      const statId = isCreatingNew ? (await createCustomStat(newLabel, newUnit || undefined)).id : selectedStatId;
      await setCustomStatValue(fighterId, statId, numericValue);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customStats'] }),
        queryClient.invalidateQueries({ queryKey: ['customStatValues', fighterId] }),
        queryClient.invalidateQueries({ queryKey: ['fighter', fighterId] }),
        queryClient.invalidateQueries({ queryKey: ['fighters'] }),
        queryClient.invalidateQueries({ queryKey: ['statRegistry'] }),
      ]);
      setSelectedStatId(NEW_STAT_OPTION);
      setNewLabel('');
      setNewUnit('');
      setValue('');
    },
  });

  return (
    <div className="flex flex-col gap-4 rounded-[32px] bg-card p-8">
      <h2 className="font-heading text-2xl font-semibold">Кастомные параметры</h2>

      {fighterValues.length > 0 && (
        <ul className="flex flex-col gap-1.5 font-mono text-sm">
          {fighterValues.map((row) => {
            const stat = customStats.find((s) => s.id === row.statId);
            return (
              <li key={row.statId} className="flex justify-between text-white/70">
                <span>{stat?.label ?? row.statId}</span>
                <span className="text-white">
                  {row.value}
                  {stat?.unit ? ` ${stat.unit}` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) assignMutation.mutate();
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] tracking-[0.14em] text-white/45">ПАРАМЕТР</label>
          <Select value={selectedStatId} onValueChange={(next) => setSelectedStatId(next ?? NEW_STAT_OPTION)}>
            <SelectTrigger>
              <SelectValue placeholder="Выбери параметр" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NEW_STAT_OPTION}>+ Новый параметр</SelectItem>
              {customStats.map((stat) => (
                <SelectItem key={stat.id} value={stat.id}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCreatingNew && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="custom-stat-label" className="font-mono text-[11px] tracking-[0.14em] text-white/45">
                НАЗВАНИЕ
              </label>
              <Input
                id="custom-stat-label"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="Харизма"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="custom-stat-unit" className="font-mono text-[11px] tracking-[0.14em] text-white/45">
                ЕДИНИЦА (НЕОБЯЗАТЕЛЬНО)
              </label>
              <Input
                id="custom-stat-unit"
                value={newUnit}
                onChange={(event) => setNewUnit(event.target.value)}
                placeholder="баллов"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="custom-stat-value" className="font-mono text-[11px] tracking-[0.14em] text-white/45">
            ЗНАЧЕНИЕ
          </label>
          <Input
            id="custom-stat-value"
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        <Button type="submit" disabled={!canSubmit || assignMutation.isPending}>
          {assignMutation.isPending ? 'Добавляем…' : 'Добавить'}
        </Button>
      </form>
    </div>
  );
}
