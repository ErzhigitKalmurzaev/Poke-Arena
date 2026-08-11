import { ROSTER, TONE_HEX, TOTAL_FIGHTER_COUNT, type BrandTone } from '../model/roster';

function top(statKey: string) {
  return ROSTER.reduce((best, fighter) => ((fighter.stats[statKey] ?? 0) > (best.stats[statKey] ?? 0) ? fighter : best));
}

const strongest = ROSTER.slice().sort((a, b) => b.total - a.total)[0]!;

const FACTS: { text: string; tone: BrandTone }[] = [
  { text: `${TOTAL_FIGHTER_COUNT} бойцов в базе — данные PokeAPI`, tone: 'mint' },
  { text: `Быстрее всех: ${top('speed').name} · СКОРОСТЬ ${top('speed').stats.speed}`, tone: 'red' },
  { text: `Лучшая атака: ${top('attack').name} · АТАКА ${top('attack').stats.attack}`, tone: 'red' },
  { text: `Лучшая защита: ${top('defense').name} · ЗАЩИТА ${top('defense').stats.defense}`, tone: 'blue' },
  { text: `Сильнее всех суммарно: ${strongest.name} · СУММА ${strongest.total}`, tone: 'mint' },
  { text: 'Двенадцать бойцов в драфте лендинга, остальные ждут в покедексе', tone: 'blue' },
];

export function BattleTicker() {
  const items = FACTS.concat(FACTS);
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-background py-4">
      <div className="flex w-max gap-11 [animation:ticker_34s_linear_infinite]">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2.5 font-mono text-xs whitespace-nowrap text-white/50">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_HEX[item.tone] }} />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
