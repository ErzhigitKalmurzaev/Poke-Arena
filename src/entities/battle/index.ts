export type { BattleOutcome, BattleSide, DuelOutcome } from './model/types';
export { determineDuelWinner, determineWinner } from './model/determineWinner';
export { buildDuelScript, powersAfter, type DuelExchange, type DuelScript } from './model/duelScript';
export { totalStatScore } from './model/totalStatScore';
export { TOTAL_STAT_ID, fighterStatScore } from './model/statScore';
export { explainBattle, type BattleExplanation, type RoundExplanation } from './model/battleExplanation';
