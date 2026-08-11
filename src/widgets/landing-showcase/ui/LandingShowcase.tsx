import { BattleTicker } from './BattleTicker';
import { DuelDemo } from './DuelDemo';
import { ElementsExplorer } from './ElementsExplorer';
import { HeroDraft } from './HeroDraft';
import { TuneDemo } from './TuneDemo';

export function LandingShowcase() {
  return (
    <div className="flex flex-1 flex-col">
      <HeroDraft />
      <BattleTicker />
      <DuelDemo />
      <ElementsExplorer />
      <TuneDemo />
      <footer className="mx-auto flex w-full max-w-[1560px] items-center gap-8 border-t border-white/8 px-6 py-9 text-[13px] text-white/45 sm:px-11">
        <span className="font-heading text-[17px] font-semibold text-white">Arena</span>
        <span>Данные бойцов — локальный снимок покедекса</span>
        <span className="ml-auto font-mono">2026 · ТЕСТОВОЕ ЗАДАНИЕ</span>
      </footer>
    </div>
  );
}
