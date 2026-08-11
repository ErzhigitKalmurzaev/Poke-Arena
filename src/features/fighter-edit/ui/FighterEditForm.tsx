'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import {
  BATTLE_STAT_KEYS,
  TONE_HEX,
  battleStatTotal,
  fighterRating,
  getBaseFighterById,
  getFighterById,
  toneOfTypes,
  type Fighter,
} from '@/entities/fighter';
import { BASE_STAT_REGISTRY } from '@/entities/stat';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { resetFighterOverride, saveFighterOverride, toEditValues } from '../model/editFighter';
import { validateFighterDescription, validateFighterName, validateStatValue } from '../model/schemas';
import { StatSliderField } from './StatSliderField';

const BATTLE_STAT_IDS = new Set<string>(BATTLE_STAT_KEYS);

/**
 * The six that decide fights get sliders; height/weight/capture-rate/happiness
 * are descriptive trivia on wildly different scales (weight runs to ~10000),
 * where a slider would be unusable and a plain field is simply better.
 */
const BATTLE_STATS = BASE_STAT_REGISTRY.filter((stat) => BATTLE_STAT_IDS.has(stat.id));
const DETAIL_STATS = BASE_STAT_REGISTRY.filter((stat) => !BATTLE_STAT_IDS.has(stat.id));

interface FighterEditFormProps {
  fighter: Fighter;
}

export function FighterEditForm({ fighter }: FighterEditFormProps) {
  const queryClient = useQueryClient();
  const accent = TONE_HEX[toneOfTypes(fighter.types)];

  /*
   * The untouched dataset values, so every field can show what it was moved
   * away from and offer a one-click way back. Same source the save path diffs
   * against, so "было" always names the value a reset would restore.
   */
  const { data: pristineFighter } = useQuery({
    queryKey: ['fighterBase', fighter.id],
    queryFn: () => getBaseFighterById(fighter.id),
  });
  const pristine = pristineFighter ? toEditValues(pristineFighter) : null;

  const savedRating = fighterRating(fighter.stats);

  const form = useForm({
    defaultValues: toEditValues(fighter),
    onSubmit: async ({ value }) => {
      const baseline = await getBaseFighterById(fighter.id);
      if (!baseline) return;
      await saveFighterOverride(fighter.id, value, toEditValues(baseline));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['fighter', fighter.id] }),
        queryClient.invalidateQueries({ queryKey: ['fighters'] }),
      ]);
      form.reset(value);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await resetFighterOverride(fighter.id);
      return getFighterById(fighter.id);
    },
    onSuccess: async (fresh) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['fighter', fighter.id] }),
        queryClient.invalidateQueries({ queryKey: ['fighters'] }),
      ]);
      if (fresh) form.reset(toEditValues(fresh));
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-5 rounded-[28px] border border-white/8 bg-card/50 p-6"
    >
      {/*
       * The overall recomputes as you drag, next to the value it started from.
       * That's the point of the whole panel: an edit is only meaningful once
       * you can see what it does to the fighter's rating.
       */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-[22px] font-semibold">Изменить характеристики</h2>

        <form.Subscribe selector={(state) => state.values.stats}>
          {(stats) => {
            const rating = fighterRating(stats);
            const delta = rating - savedRating;
            return (
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9.5px] tracking-[0.12em] text-white/35">СУММА</span>
                <span className="font-mono text-[13px] tabular-nums text-white/75">{battleStatTotal(stats)}</span>
                <span className="font-mono text-[9.5px] tracking-[0.12em] text-white/35">РЕЙТИНГ</span>
                <span
                  className="font-heading text-[26px] leading-none font-semibold tabular-nums"
                  style={{ color: delta === 0 ? '#ffffff' : accent }}
                >
                  {rating}
                </span>
                {delta !== 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-black"
                    style={{ background: accent }}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                )}
              </div>
            );
          }}
        </form.Subscribe>
      </div>

      <form.Field name="name" validators={{ onChange: validateFighterName }}>
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
              ИМЯ БОЙЦА
            </label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-[12px] text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="description" validators={{ onChange: validateFighterDescription }}>
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
              ОПИСАНИЕ
            </label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              rows={3}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-[12px] text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="flex flex-col gap-3.5 border-t border-white/8 pt-4">
        {BATTLE_STATS.map((stat) => (
          <form.Field key={stat.id} name={`stats.${stat.id}`} validators={{ onChange: validateStatValue }}>
            {(field) => (
              <StatSliderField
                id={field.name}
                label={stat.label}
                value={field.state.value}
                pristine={pristine?.stats[stat.id]}
                accent={accent}
                error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-white/8 pt-4">
        <span className="font-mono text-[9.5px] tracking-[0.12em] text-white/35">ПРОЧИЕ ПАРАМЕТРЫ</span>
        <div className="grid grid-cols-2 gap-3">
          {DETAIL_STATS.map((stat) => (
            <form.Field key={stat.id} name={`stats.${stat.id}`} validators={{ onChange: validateStatValue }}>
              {(field) => (
                <div className="flex flex-col gap-1">
                  <label htmlFor={field.name} className="font-mono text-[9.5px] tracking-[0.12em] text-white/45">
                    {stat.label.toUpperCase()}
                    {stat.unit ? `, ${stat.unit}` : ''}
                  </label>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      field.handleChange(Number.isFinite(next) ? next : 0);
                    }}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[12px] text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-white/8 pt-4">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty] as const}>
          {([canSubmit, isSubmitting, isDirty]) => (
            <>
              <Button type="submit" disabled={!canSubmit || isSubmitting || !isDirty}>
                {isSubmitting ? 'Сохраняем…' : 'Сохранить правки'}
              </Button>
              {isDirty ? (
                <button
                  type="button"
                  onClick={() => form.reset()}
                  className="font-mono text-[10px] tracking-[0.1em] text-white/45 transition-colors hover:text-white"
                >
                  ОТМЕНИТЬ
                </button>
              ) : (
                !resetMutation.isPending && <span className="font-mono text-[10px] text-white/40">СОХРАНЕНО</span>
              )}
            </>
          )}
        </form.Subscribe>

        {fighter.isEdited && (
          <Button
            type="button"
            variant="outline"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="size-3.5" />
            {resetMutation.isPending ? 'Сбрасываем…' : 'К оригиналу'}
          </Button>
        )}

        <span className="ml-auto font-mono text-[9.5px] text-white/35">СОХРАНЯЕТСЯ ЛОКАЛЬНО · INDEXEDDB</span>
      </div>
    </form>
  );
}
