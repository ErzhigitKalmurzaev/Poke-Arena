'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { USERS } from '@/shared/config/users';

export interface RegisterState {
  error?: string;
}

export async function registerAction(_previous: RegisterState, formData: FormData): Promise<RegisterState> {
  const username = formData.get('username');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (typeof username !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return { error: 'Заполните все поля' };
  }
  if (username.trim().length < 3) {
    return { error: 'Имя пользователя — минимум 3 символа' };
  }
  if (password.length < 6) {
    return { error: 'Пароль — минимум 6 символов' };
  }
  if (password !== confirmPassword) {
    return { error: 'Пароли не совпадают' };
  }
  if (USERS.some((u) => u.username === username)) {
    return { error: 'Это имя уже занято' };
  }

  // There's no real user store - USERS is the in-memory mock the Credentials
  // provider reads from, so new accounts only live until the server restarts.
  USERS.push({ id: crypto.randomUUID(), username, password });

  try {
    await signIn('credentials', { username, password, redirectTo: '/catalog' });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Не удалось войти после регистрации' };
    }
    // NEXT_REDIRECT and any other framework-internal errors must propagate.
    throw error;
  }
}
