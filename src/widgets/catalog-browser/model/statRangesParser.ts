import { createParser } from 'nuqs';

export type StatRanges = Record<string, [number, number]>;

/**
 * Compact URL encoding for "several stat range filters at once":
 * `speed:20:150,height:5:20`. A custom nuqs parser rather than one query
 * param per stat, since the comparable-stat registry can grow and we don't
 * want to hardcode a URL key per stat id.
 */
export const parseAsStatRanges = createParser<StatRanges>({
  parse(value) {
    if (!value) return {};
    const ranges: StatRanges = {};
    for (const entry of value.split(',')) {
      const [statId, minRaw, maxRaw] = entry.split(':');
      const min = Number(minRaw);
      const max = Number(maxRaw);
      if (statId && Number.isFinite(min) && Number.isFinite(max)) {
        ranges[statId] = [min, max];
      }
    }
    return ranges;
  },
  serialize(value) {
    return Object.entries(value)
      .map(([statId, [min, max]]) => `${statId}:${min}:${max}`)
      .join(',');
  },
  eq(a, b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => a[key]?.[0] === b[key]?.[0] && a[key]?.[1] === b[key]?.[1]);
  },
}).withDefault({});
