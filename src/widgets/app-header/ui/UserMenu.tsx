'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import { logoutAction } from '@/features/auth-logout';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/shared/ui/menu';

interface UserMenuProps {
  name: string;
}

export function UserMenu({ name }: UserMenuProps) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Menu>
      <MenuTrigger
        aria-label="Меню пользователя"
        className="group flex items-center gap-2.5 rounded-full bg-card p-1 text-sm transition-colors duration-200 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-accent sm:pr-3"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-mint font-mono text-[11px] font-semibold text-black">
          {initials}
        </span>
        {/* On a phone the button collapses to the avatar alone - the name is
            already at the top of the menu once it opens. */}
        <span className="hidden max-w-32 truncate sm:block">{name}</span>
        <ChevronDown className="hidden size-4 text-white/40 transition-transform duration-200 group-data-popup-open:rotate-180 sm:block" />
      </MenuTrigger>

      <MenuContent className="min-w-60">
        {/* Identity card at the top: on mobile the trigger is just two
            initials, so this is where the account actually gets named. */}
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-mint font-mono text-[12px] font-semibold text-black">
            {initials}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">Аккаунт</span>
          </span>
        </div>

        <MenuSeparator />

        {/*
          A form (not onClick) so the server action runs as a real POST
          submission - `signOut` needs to set cookies and redirect, which it
          can only do from a server action, and this keeps it working even
          before hydration.
        */}
        <form action={logoutAction}>
          <MenuItem
            variant="destructive"
            render={<button type="submit" />}
            nativeButton
            // Base UI closes the menu on click before the form submits, which
            // would unmount the button mid-submit; closeOnClick={false} lets
            // the submission go through and the redirect close it instead.
            closeOnClick={false}
            className="w-full"
          >
            <LogOut />
            Выйти
          </MenuItem>
        </form>
      </MenuContent>
    </Menu>
  );
}
