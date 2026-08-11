export type StatSource = 'base' | 'custom';

export interface StatDefinition {
  id: string;
  label: string;
  source: StatSource;
  unit?: string;
}

export interface Fighter {
  id: string;
  name: string;
  description: string;
  types: string[];
  stats: Record<string, number>;
  sprite: string;
  isEdited: boolean;
}
