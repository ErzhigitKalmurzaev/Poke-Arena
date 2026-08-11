import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
}

export function SearchInput({ value, onChange, isPending }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/40" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Найти бойца по имени или описанию"
        aria-label="Поиск бойцов"
        className="rounded-full bg-card pl-10"
      />
      {isPending && (
        <span className="absolute top-1/2 right-3.5 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full bg-brand-red" />
      )}
    </div>
  );
}
