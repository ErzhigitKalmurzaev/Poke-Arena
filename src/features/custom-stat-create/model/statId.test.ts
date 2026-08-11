import { describe, expect, it } from 'vitest';
import { slugifyStatId, uniqueStatId } from './statId';

describe('slugifyStatId', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugifyStatId('Time on 100m')).toBe('time-on-100m');
  });

  it('keeps Cyrillic letters as-is', () => {
    expect(slugifyStatId('Харизма')).toBe('харизма');
  });

  it('collapses punctuation and trims leading/trailing hyphens', () => {
    expect(slugifyStatId('  --Стоимость обеда!! ')).toBe('стоимость-обеда');
  });

  it('falls back to "stat" for a label with no letters or digits', () => {
    expect(slugifyStatId('!!!')).toBe('stat');
  });
});

describe('uniqueStatId', () => {
  it('returns the plain slug when it is free', async () => {
    const id = await uniqueStatId('Charisma', async () => false);
    expect(id).toBe('charisma');
  });

  it('appends -2, -3... until it finds a free id', async () => {
    const taken = new Set(['charisma', 'charisma-2', 'charisma-3']);
    const id = await uniqueStatId('Charisma', async (candidate) => taken.has(candidate));
    expect(id).toBe('charisma-4');
  });
});
