'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Fighter } from '@/entities/fighter';
import { getBaseFighterById, getFighterById } from '@/entities/fighter';
import { BASE_STAT_REGISTRY } from '@/entities/stat';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { resetFighterOverride, saveFighterOverride, toEditValues } from '../model/editFighter';
import { validateFighterDescription, validateFighterName, validateStatValue } from '../model/schemas';

interface FighterEditFormProps {
  fighter: Fighter;
}

export function FighterEditForm({ fighter }: FighterEditFormProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: toEditValues(fighter),
    onSubmit: async ({ value }) => {
      const pristine = await getBaseFighterById(fighter.id);
      if (!pristine) return;
      await saveFighterOverride(fighter.id, value, toEditValues(pristine));
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
      className="flex flex-col gap-6 rounded-[32px] bg-card p-8"
    >
      <h2 className="font-heading text-2xl font-semibold">Изменить характеристики</h2>

      <form.Field name="name" validators={{ onChange: validateFighterName }}>
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="font-mono text-[11px] tracking-[0.14em] text-white/45">
              ИМЯ БОЙЦА
            </label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="description" validators={{ onChange: validateFighterDescription }}>
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="font-mono text-[11px] tracking-[0.14em] text-white/45">
              ОПИСАНИЕ
            </label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              rows={4}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        {BASE_STAT_REGISTRY.map((stat) => (
          <form.Field key={stat.id} name={`stats.${stat.id}`} validators={{ onChange: validateStatValue }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={field.name} className="font-mono text-[11px] tracking-[0.14em] text-white/45">
                  {stat.label.toUpperCase()}
                  {stat.unit ? `, ${stat.unit}` : ''}
                </label>
                <Input
                  id={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(Number(event.target.value))}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}>
          {([canSubmit, isSubmitting, isDirty]) => (
            <>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Сохраняем…' : 'Сохранить правки'}
              </Button>
              {!isDirty && !resetMutation.isPending && (
                <span className="font-mono text-xs text-white/40">СОХРАНЕНО</span>
              )}
            </>
          )}
        </form.Subscribe>
        <Button
          type="button"
          variant="outline"
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
        >
          {resetMutation.isPending ? 'Сбрасываем…' : 'Сбросить правки'}
        </Button>
        <span className="ml-auto font-mono text-[11px] text-white/38">СОХРАНЯЕТСЯ ЛОКАЛЬНО · INDEXEDDB</span>
      </div>
    </form>
  );
}
