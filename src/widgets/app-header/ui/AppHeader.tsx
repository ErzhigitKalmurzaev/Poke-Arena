import Link from 'next/link';
import { auth } from '@/auth';
import { Logo } from '@/shared/ui/logo';
import { AppNav } from './AppNav';
import { UserMenu } from './UserMenu';

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex h-(--app-header-h) w-full max-w-[1560px] items-center gap-3 px-4 sm:gap-5 sm:px-11">
        {/* The lockup is the way home - the separate back arrow that used to
            sit beside it was a second control for the same destination. */}
        <Link
          href="/"
          aria-label="Arena — на главную"
          className="flex shrink-0 items-center rounded-full transition-opacity duration-200 outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo wordmarkClassName="hidden sm:inline" />
        </Link>

        {/* Sits right next to the lockup, reading as one left-hand cluster.
            Below ~340px the three pills stop fitting, so this track scrolls
            instead of clipping the last one. */}
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AppNav />
        </div>

        <div className="flex shrink-0 items-center">
          {session?.user?.name && <UserMenu name={session.user.name} />}
        </div>
      </div>
    </header>
  );
}
