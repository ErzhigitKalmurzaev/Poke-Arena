import { describe, expect, it } from 'vitest';
import { APP_NAV, isNavItemActive, type AppNavItem } from './navigation';

const catalog = APP_NAV[0] as AppNavItem;
const battle = APP_NAV[2] as AppNavItem;

describe('isNavItemActive', () => {
  it('matches the item’s own route exactly', () => {
    expect(isNavItemActive(catalog, '/catalog')).toBe(true);
    expect(isNavItemActive(battle, '/battle')).toBe(true);
  });

  it('keeps Покедекс active on a fighter detail page it owns', () => {
    expect(isNavItemActive(catalog, '/fighter/25')).toBe(true);
  });

  it('does not activate other items on an owned nested route', () => {
    expect(isNavItemActive(battle, '/fighter/25')).toBe(false);
    expect(isNavItemActive(battle, '/catalog')).toBe(false);
  });

  it('does not match a route that merely shares a name prefix', () => {
    expect(isNavItemActive(battle, '/battle-history')).toBe(false);
  });
});
