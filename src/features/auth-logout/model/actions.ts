'use server';

import { signOut } from '@/auth';

/**
 * Server action so the header's user menu can stay a client component
 * (it needs a dropdown) without pulling `signOut` into the browser bundle.
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}
