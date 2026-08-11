import { Check } from 'lucide-react';
import { ALL_FIGHTER_TYPES, TONE_HEX, toneOfTypes, typeLabel } from '@/entities/fighter';

interface TypeFilterChipsProps {
  selected: string[];
  onToggle: (type: string) => void;
}

/**
 * A fixed two-column grid, not wrapped pills. 18 types of varying name length
 * wrap into a ragged block whose right edge never lines up; equal-width cells
 * read as a deliberate list. Type identity moves to a small tone dot so the
 * chips stay quiet until selected, instead of 18 saturated blocks competing
 * with the fighter grid next to them.
 */
export function TypeFilterChips({ selected, onToggle }: TypeFilterChipsProps) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {ALL_FIGHTER_TYPES.map((type) => {
        const isActive = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors duration-150 ${
              isActive ? 'bg-white/12 font-medium text-white' : 'text-white/55 hover:bg-white/6 hover:text-white/85'
            }`}
          >
            <span
              className="size-1.5 shrink-0 rounded-full transition-opacity"
              style={{ background: TONE_HEX[toneOfTypes([type])], opacity: isActive ? 1 : 0.45 }}
            />
            <span className="truncate">{typeLabel(type)}</span>
            {isActive && <Check className="ml-auto size-3 shrink-0 text-white/70" />}
          </button>
        );
      })}
    </div>
  );
}
