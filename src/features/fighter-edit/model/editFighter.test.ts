import { describe, expect, it } from 'vitest';
import { buildOverridePayload, type FighterEditValues } from './editFighter';

const pristine: FighterEditValues = {
  name: 'Bulbasaur',
  description: 'A strange seed was planted on its back at birth.',
  stats: { hp: 45, attack: 49 },
};

describe('buildOverridePayload', () => {
  it('returns null when the submitted values equal pristine (nothing to save)', () => {
    expect(buildOverridePayload('1', { ...pristine }, pristine)).toBeNull();
  });

  it('includes only the fields that actually changed', () => {
    const result = buildOverridePayload('1', { ...pristine, name: 'Bulbasaur Prime' }, pristine);
    expect(result).toEqual({ fighterId: '1', name: 'Bulbasaur Prime' });
  });

  it('includes only the stats that changed, not the whole stats object', () => {
    const result = buildOverridePayload('1', { ...pristine, stats: { hp: 45, attack: 99 } }, pristine);
    expect(result).toEqual({ fighterId: '1', stats: { attack: 99 } });
  });

  it('diffs against the true pristine baseline, not the values the form started from', () => {
    // Simulates re-saving after a previous edit: the form's "current" state
    // already has name overridden, but pristine is still the true base.
    // Only touching description this time must still re-include the
    // earlier name change, or a naive diff against "current" would drop it.
    const alreadyEditedStart: FighterEditValues = { ...pristine, name: 'Bulbasaur Prime' };
    const result = buildOverridePayload(
      '1',
      { ...alreadyEditedStart, description: 'New description.' },
      pristine,
    );
    expect(result).toEqual({ fighterId: '1', name: 'Bulbasaur Prime', description: 'New description.' });
  });

  it('returns a full payload when every field changed', () => {
    const result = buildOverridePayload(
      '1',
      { name: 'New', description: 'New desc', stats: { hp: 1, attack: 2 } },
      pristine,
    );
    expect(result).toEqual({ fighterId: '1', name: 'New', description: 'New desc', stats: { hp: 1, attack: 2 } });
  });
});
