import { Switch } from '@/shared/ui/switch';

interface LegendaryFilterToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function LegendaryFilterToggle({ checked, onCheckedChange }: LegendaryFilterToggleProps) {
  return (
    <label className="flex items-center gap-2.5 rounded-full bg-card px-4 py-2 text-sm text-white/75">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      Только легендарные и мифические
    </label>
  );
}
