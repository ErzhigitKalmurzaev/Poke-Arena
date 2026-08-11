'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/lib/useOnlineStatus';

/**
 * What losing the network actually costs, said out loud.
 *
 * Arena keeps working offline by design: the roster is a build-time snapshot
 * bundled into the app, and every user change lives in IndexedDB, so browsing,
 * editing, drafting and fighting need no round trips. The one thing that does
 * come over the wire is the sprite/cry media hosted on the PokeAPI sprite repo
 * - so a dropped connection shows up as fighters without art and nothing else.
 * Without this line that reads as a broken app rather than a missing network.
 */
export function OfflineNotice() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div role="status" className="border-t border-brand-red/25 bg-brand-red/12">
      <p className="mx-auto flex w-full max-w-[1560px] items-center gap-2 px-4 py-1.5 font-mono text-[10px] tracking-[0.08em] text-white/70 sm:px-11">
        <WifiOff className="size-3 shrink-0 text-brand-red" />
        НЕТ СЕТИ — КАРТИНКИ БОЙЦОВ МОГУТ НЕ ЗАГРУЗИТЬСЯ. ДАННЫЕ И ПРАВКИ ХРАНЯТСЯ ЛОКАЛЬНО, ОСТАЛЬНОЕ РАБОТАЕТ.
      </p>
    </div>
  );
}
