'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { TONE_HEX, toneOfTypes, type Fighter } from '@/entities/fighter';

/*
 * Arc geometry. A big radius with a narrow angular span gives a shallow dome -
 * a wide wheel seen almost edge-on - rather than a tight fan that would push the
 * outer fighters far off the bottom of the panel. Numbers chosen together:
 *   apex-to-edge drop  = RADIUS * (1 - cos(ANGLE_STEP * SIDE))  ≈ 167px
 *   neighbour spacing  = RADIUS * sin(ANGLE_STEP)               ≈ 131px  (> tile width)
 * so the tiles fan out without ever overlapping.
 */
const RADIUS = 1250;
const ANGLE_STEP = 6;
/** The outermost pair is the staging area: rendered, but faded to 0 so tiles ease in and out. */
const RENDER_EACH_SIDE = 5;
/**
 * The apex tile sits at y=0, so without this its highlight ring would land
 * exactly on the clipping edge and lose its top border. Pushing the whole arc
 * down gives the active tile's outline room to be drawn.
 */
const ARC_TOP_INSET = 10;

interface DraftCarouselProps {
  pool: Fighter[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onStep: (delta: number) => void;
}

interface ArcSlot {
  fighter: Fighter;
  index: number;
  offset: number;
}

function buildSlots(pool: Fighter[], activeIndex: number): ArcSlot[] {
  const slots: ArcSlot[] = [];
  const seen = new Set<number>();
  for (let offset = -RENDER_EACH_SIDE; offset <= RENDER_EACH_SIDE; offset += 1) {
    // Wrap so the wheel is endless, but never place the same fighter twice -
    // with a pool smaller than the window (a narrow search) the modulo would
    // otherwise repeat entries and collide on React keys.
    const index = (((activeIndex + offset) % pool.length) + pool.length) % pool.length;
    if (seen.has(index)) continue;
    const fighter = pool[index];
    if (!fighter) continue;
    seen.add(index);
    slots.push({ fighter, index, offset });
  }
  return slots;
}

export function DraftCarousel({ pool, activeIndex, onSelect, onStep }: DraftCarouselProps) {
  if (pool.length === 0) {
    return (
      <div className="grid h-72 w-full place-items-center text-sm text-white/45">
        Никого не найдено — измени поиск
      </div>
    );
  }

  const slots = buildSlots(pool, activeIndex);

  return (
    /*
     * `w-full` is load-bearing: every tile is absolutely positioned, so the
     * wheel has no intrinsic width of its own and would collapse to a sliver
     * in any shrink-to-fit parent (a flex column, a grid cell). It measures
     * itself from the container, never from its contents.
     */
    <div className="relative w-full">
      {/* Clipped only so the faded staging tiles - the outermost pair sits
          ~625px off-centre - can't widen the page. */}
      <div className="relative h-72 overflow-hidden">
        {slots.map(({ fighter, index, offset }) => {
          const distance = Math.abs(offset);
          const radians = (offset * ANGLE_STEP * Math.PI) / 180;
          const x = RADIUS * Math.sin(radians);
          const y = RADIUS * (1 - Math.cos(radians));
          const scale = Math.max(0, 1 - 0.115 * distance);
          const opacity = distance >= RENDER_EACH_SIDE ? 0 : Math.max(0, 1 - 0.19 * distance);
          const isActive = offset === 0;
          const accent = TONE_HEX[toneOfTypes(fighter.types)];

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={fighter.name}
              aria-current={isActive ? 'true' : undefined}
              tabIndex={distance > 2 ? -1 : 0}
              className="absolute top-0 flex w-26 flex-col items-center gap-1.5 rounded-2xl p-2 outline-none transition-[transform,opacity,left,top] duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)]"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `${ARC_TOP_INSET + y}px`,
                transform: `translateX(-50%) rotate(${offset * ANGLE_STEP}deg) scale(${scale})`,
                opacity,
                zIndex: 20 - distance,
                pointerEvents: distance >= RENDER_EACH_SIDE ? 'none' : 'auto',
                background: isActive ? 'rgba(255,255,255,.07)' : 'transparent',
                boxShadow: isActive ? `0 0 0 1px ${accent}` : 'none',
              }}
            >
              <span className="grid h-19 w-19 place-items-center">
                {fighter.sprite && (
                  <Image
                    src={fighter.sprite}
                    alt=""
                    width={76}
                    height={76}
                    className="object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                  />
                )}
              </span>
              <span
                className={`max-w-full truncate text-[10.5px] capitalize ${isActive ? 'font-semibold text-white' : 'text-white/50'}`}
              >
                {fighter.name}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label="Предыдущий боец"
        className="absolute top-12 left-0 grid size-11 place-items-center rounded-full border border-white/12 bg-card/80 text-white/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label="Следующий боец"
        className="absolute top-12 right-0 grid size-11 place-items-center rounded-full border border-white/12 bg-card/80 text-white/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
