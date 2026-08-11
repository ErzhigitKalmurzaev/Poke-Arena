import { describe, expect, it } from 'vitest';
import { statBounds } from './statBounds';

describe('statBounds', () => {
  it('returns a sensible [min, max] for a base battle stat', () => {
    const [min, max] = statBounds('speed');
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeGreaterThan(min);
  });

  it('returns a sensible [min, max] for a folded-in field like height', () => {
    const [min, max] = statBounds('height');
    expect(min).toBeGreaterThan(0);
    expect(max).toBeGreaterThan(min);
  });

  it('returns [0, 0] for an unknown stat id rather than throwing', () => {
    expect(statBounds('does-not-exist')).toEqual([0, 0]);
  });
});
