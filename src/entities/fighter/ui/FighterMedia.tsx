'use client';

import { Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Switch } from '@/shared/ui/switch';
import type { Fighter } from '../model/types';

interface FighterMediaProps {
  fighter: Fighter;
}

/**
 * Sprite display for the fighter detail page: an optional shiny toggle
 * above the art and an optional cry play/pause button beside it - each
 * omitted entirely (not shown disabled) when the fighter has no shiny
 * sprite / no cry audio.
 *
 * Both URLs come from the static dataset, but the media itself is hosted on the
 * PokeAPI sprite repo - so this is one of the few places in the app that needs
 * the network at all (see the header's OfflineNotice).
 */
export function FighterMedia({ fighter }: FighterMediaProps) {
  const [showShiny, setShowShiny] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeSprite = showShiny && fighter.shinySprite ? fighter.shinySprite : fighter.sprite;

  const toggleCry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {fighter.shinySprite && (
        <label className="flex items-center gap-2.5 self-end font-mono text-[11px] tracking-[0.1em] text-white/45">
          {showShiny ? 'ШАЙНИ' : 'ОБЫЧНЫЙ'}
          <Switch checked={showShiny} onCheckedChange={setShowShiny} />
        </label>
      )}

      <div className="flex items-center gap-3">
        {activeSprite && (
          <Image src={activeSprite} alt={fighter.name} width={280} height={280} className="object-contain" />
        )}
        {fighter.cryUrl && (
          <>
            <button
              type="button"
              onClick={toggleCry}
              aria-label={isPlaying ? 'Остановить крик' : 'Прослушать крик'}
              className="grid h-10 w-10 place-items-center rounded-full bg-card text-white/75 hover:text-white"
            >
              {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <audio
              ref={audioRef}
              src={fighter.cryUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  );
}
