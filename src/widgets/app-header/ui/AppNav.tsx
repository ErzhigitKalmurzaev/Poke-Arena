'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAV, isNavItemActive } from '@/shared/config/navigation';

/**
 * Pill navigation from the design handoff: one dark container, the active
 * route as a white pill with black text.
 */
export function AppNav() {
  const pathname = usePathname();

  return (
    // `inline-flex`, not `flex`: the rail has to hug its three pills rather
    // than stretch across the free space left of the account button.
    <nav className="inline-flex items-center gap-0.5 rounded-full bg-card p-1">
      {APP_NAV.map((item) => {
        const isActive = isNavItemActive(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-full px-3.5 py-1.5 text-[13px] leading-5 whitespace-nowrap transition-colors duration-200 ${
              isActive ? 'bg-white font-semibold text-black' : 'text-white/60 hover:bg-white/6 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
