import { Switch } from '@/shared/ui/switch';

interface LegendaryFilterToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function LegendaryFilterToggle({ checked, onCheckedChange }: LegendaryFilterToggleProps) {
  return (
    /* Negative margin lines the hover band up with the section header's, so
       the whole rail hovers on one column. */
    <label className="-mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-[13.5px] text-white/75 transition-colors select-none hover:bg-white/5 hover:text-white">
      Только легендарные и мифические
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
