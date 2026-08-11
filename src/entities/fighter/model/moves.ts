import { BATTLE_STAT_LABEL, type BattleStatKey } from './battleStats';
import { fighterStrengths } from './role';

export interface FighterMove {
  name: string;
  /** The stat the move is built from - what the arena shows as its power. */
  statKey: BattleStatKey;
  statLabel: string;
  power: number;
}

/**
 * The dataset ships no move list, so a fighter's repertoire is derived from
 * what he actually is: his element picks the flavour, his strongest stats pick
 * the technique. Same fighter always yields the same moves - nothing random,
 * so a rerun of a battle narrates identically.
 *
 * All six nouns are masculine, which is what lets a single masculine adjective
 * per type combine with any of them and still read as Russian.
 */
const MOVE_NOUN: Record<BattleStatKey, string> = {
  attack: 'удар',
  'special-attack': 'всплеск',
  speed: 'рывок',
  defense: 'контрудар',
  'special-defense': 'барьер',
  hp: 'натиск',
};

const TYPE_ADJECTIVE: Record<string, string> = {
  normal: 'Обычный',
  fire: 'Огненный',
  water: 'Водяной',
  electric: 'Грозовой',
  grass: 'Травяной',
  ice: 'Ледяной',
  fighting: 'Боевой',
  poison: 'Ядовитый',
  ground: 'Земляной',
  flying: 'Воздушный',
  psychic: 'Ментальный',
  bug: 'Жалящий',
  rock: 'Каменный',
  ghost: 'Призрачный',
  dragon: 'Драконий',
  dark: 'Тёмный',
  steel: 'Стальной',
  fairy: 'Волшебный',
};

/** How many techniques a fighter brings - the arena cycles through them. */
const MOVE_COUNT = 3;

export function fighterMoves(types: string[], stats: Record<string, number>): FighterMove[] {
  const adjective = TYPE_ADJECTIVE[types[0] ?? 'normal'] ?? TYPE_ADJECTIVE.normal;

  return fighterStrengths(stats)
    .slice(0, MOVE_COUNT)
    .map((strength) => ({
      name: `${adjective} ${MOVE_NOUN[strength.statKey]}`,
      statKey: strength.statKey,
      statLabel: BATTLE_STAT_LABEL[strength.statKey],
      power: strength.value,
    }));
}
