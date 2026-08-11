export type StatSource = 'base' | 'custom';

export interface StatDefinition {
  id: string;
  label: string;
  source: StatSource;
  unit?: string;
}
