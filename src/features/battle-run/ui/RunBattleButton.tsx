'use client';

import { Button } from '@/shared/ui/button';

interface RunBattleButtonProps {
  ready: boolean;
  reason?: string;
  onRun: () => void;
}

export function RunBattleButton({ ready, reason, onRun }: RunBattleButtonProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" onClick={onRun} disabled={!ready}>
        Начать бой
      </Button>
      {!ready && reason && <p className="font-mono text-[11px] text-white/45">{reason}</p>}
    </div>
  );
}
