import { ALL_FIGHTER_TYPES, TONE_HEX, toneOfTypes } from '@/entities/fighter';

interface TypeFilterChipsProps {
  selected: string[];
  onToggle: (type: string) => void;
}

export function TypeFilterChips({ selected, onToggle }: TypeFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_FIGHTER_TYPES.map((type) => {
        const isActive = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(type)}
            className="rounded-full px-4 py-2 font-mono text-[11.5px] uppercase transition-colors duration-200"
            style={{
              background: isActive ? TONE_HEX[toneOfTypes([type])] : 'rgba(255,255,255,.08)',
              color: isActive ? '#000' : 'rgba(255,255,255,.72)',
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
