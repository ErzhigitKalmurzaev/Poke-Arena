'use client';

import { useActionState } from 'react';
import { registerAction, type RegisterState } from '../model/actions';

const initialState: RegisterState = {};

const FIELD_CLASS =
  'h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-brand-red/60 focus:bg-white/[0.06]';

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="font-mono text-[11px] tracking-[0.14em] text-white/45">
          ИМЯ ПОЛЬЗОВАТЕЛЯ
        </label>
        <input id="username" name="username" autoComplete="username" required minLength={3} className={FIELD_CLASS} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="font-mono text-[11px] tracking-[0.14em] text-white/45">
          ПАРОЛЬ
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className={FIELD_CLASS}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="font-mono text-[11px] tracking-[0.14em] text-white/45">
          ПОВТОРИТЕ ПАРОЛЬ
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className={FIELD_CLASS}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-white py-3.5 text-[15px] font-semibold text-black transition-transform duration-150 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
