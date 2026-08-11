export interface AppNavItem {
  href: string;
  label: string;
  /**
   * Extra route prefixes this item owns. `/fighter/25` is reached from the
   * catalog and has no pill of its own, so Покедекс stays highlighted there
   * instead of the header going blank on a detail page.
   */
  ownsPrefixes?: string[];
}

/**
 * Every screen a signed-in user can reach, in header order. Single source of
 * truth for the app nav - adding a protected route means adding it here, not
 * hand-editing the header markup.
 */
export const APP_NAV: AppNavItem[] = [
  { href: '/catalog', label: 'Покедекс', ownsPrefixes: ['/fighter'] },
  { href: '/team-builder', label: 'Составы' },
  { href: '/battle', label: 'Бой' },
];

export function isNavItemActive(item: AppNavItem, pathname: string): boolean {
  const owned = [item.href, ...(item.ownsPrefixes ?? [])];
  return owned.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
