import Dexie, { type Table } from 'dexie';

export interface OverrideRow {
  fighterId: string;
  name?: string;
  description?: string;
  stats?: Record<string, number>;
}

export interface CustomStatRow {
  id: string;
  label: string;
  unit?: string;
}

export interface CustomStatValueRow {
  fighterId: string;
  statId: string;
  value: number;
}

export interface TeamRow {
  id: string;
  name: string;
  fighterIds: string[];
}

class ArenaDatabase extends Dexie {
  overrides!: Table<OverrideRow, string>;
  customStats!: Table<CustomStatRow, string>;
  customStatValues!: Table<CustomStatValueRow, [string, string]>;
  teams!: Table<TeamRow, string>;

  constructor() {
    super('arena');
    this.version(1).stores({
      overrides: 'fighterId',
      customStats: 'id',
      customStatValues: '[fighterId+statId], fighterId, statId',
      teams: 'id',
    });
  }
}

export const db = new ArenaDatabase();
