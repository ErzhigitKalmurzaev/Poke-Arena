import { auth, signOut } from '@/auth';
import { Button } from '@/shared/ui/button';

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="font-semibold">Arena</span>
      {session?.user && (
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
          className="flex items-center gap-3"
        >
          <span className="text-sm text-muted-foreground">{session.user.name}</span>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      )}
    </header>
  );
}
