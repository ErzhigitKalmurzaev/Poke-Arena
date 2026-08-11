'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Switch } from '@/shared/ui/switch';
import type { Fighter } from '../model/types';

interface FighterMediaProps {
  fighter: Fighter;
}

/**
 * Sprite display for the fighter detail page: an optional shiny toggle
 * above the art, omitted entirely when there's no shiny sprite (not shown
 * disabled). Both images are already in the static dataset - no extra
 * network requests.
 */
export function FighterMedia({ fighter }: FighterMediaProps) {
  const [showShiny, setShowShiny] = useState(false);

  const activeSprite = showShiny && fighter.shinySprite ? fighter.shinySprite : fighter.sprite;

  return (
    <div className="flex flex-col items-center gap-4">
      {fighter.shinySprite && (
        <label className="flex items-center gap-2.5 self-end font-mono text-[11px] tracking-[0.1em] text-white/45">
          {showShiny ? 'ШАЙНИ' : 'ОБЫЧНЫЙ'}
          <Switch checked={showShiny} onCheckedChange={setShowShiny} />
        </label>
      )}

      {activeSprite && (
        <Image src={activeSprite} alt={fighter.name} width={280} height={280} className="object-contain" />
      )}
    </div>
  );
}
