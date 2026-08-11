import { BATTLE_STAT_KEYS, BATTLE_STAT_LABEL, type BattleStatKey } from './battleStats';

export interface FighterStrength {
  statKey: BattleStatKey;
  statLabel: string;
  value: number;
}

const ROLE_LABEL: Record<BattleStatKey, string> = {
  hp: 'ТАНК',
  attack: 'УДАРНЫЙ',
  defense: 'ЗАЩИТНЫЙ',
  'special-attack': 'МАГ',
  'special-defense': 'СТОЙКИЙ',
  speed: 'СКОРОСТНОЙ',
};

/**
 * Strongest battle stats first.
 *
 * Scoped to BATTLE_STAT_KEYS on purpose - NOT `Object.entries(stats)`. A merged
 * Fighter's `stats` also carries height/weight/captureRate/baseHappiness and any
 * custom stats, and weight alone reaches ~10000, so a plain max over every key
 * would report "weight" as every fighter's strength.
 */
export function fighterStrengths(stats: Record<string, number>): FighterStrength[] {
  return BATTLE_STAT_KEYS.map((statKey) => ({
    statKey,
    statLabel: BATTLE_STAT_LABEL[statKey],
    value: stats[statKey] ?? 0,
  })).sort((a, b) => b.value - a.value);
}

/** The fighter's role, derived from whichever battle stat is highest. */
export function fighterRole(stats: Record<string, number>): string {
  const top = fighterStrengths(stats)[0];
  return top ? ROLE_LABEL[top.statKey] : 'БАЛАНС';
}
