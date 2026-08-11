import { Slider } from '@/shared/ui/slider';
import type { StatRange } from '../model/filterByStatRange';

interface StatRangeFilterProps {
  label: string;
  unit?: string;
  min: number;
  max: number;
  value: StatRange;
  onValueChange: (value: StatRange) => void;
}

export function StatRangeFilter({ label, unit, min, max, value, onValueChange }: StatRangeFilterProps) {
  const handleChange = (next: number | readonly number[]) => {
    if (!Array.isArray(next)) return;
    onValueChange([next[0] ?? min, next[1] ?? max]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between font-mono text-[11.5px]">
        <span className="text-white/55">{label}</span>
        <span className="text-white/85">
          {value[0]}
          {unit ? ` ${unit}` : ''} – {value[1]}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <Slider min={min} max={max} value={value} onValueChange={handleChange} />
    </div>
  );
}
