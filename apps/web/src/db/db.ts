// Banco local no IndexedDB (Dexie). Nada sai do aparelho.
import Dexie, { type EntityTable } from 'dexie';
import type { Action, Goal, Insight, RealityTest, Settings, WeekEntry, WeeklyReview } from '../lib/types';

export const DB_NAME = 'cadencia';

export class CadenciaDB extends Dexie {
  goals!: EntityTable<Goal, 'id'>;
  actions!: EntityTable<Action, 'id'>;
  weekEntries!: EntityTable<WeekEntry, 'id'>;
  realityTests!: EntityTable<RealityTest, 'id'>;
  weeklyReviews!: EntityTable<WeeklyReview, 'id'>;
  insights!: EntityTable<Insight, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({
      goals: 'id, status, createdAt',
      actions: 'id, goalId, status',
      weekEntries: 'id, week, actionId, &[week+actionId]',
      realityTests: 'id, &month',
      weeklyReviews: 'id, &week',
      insights: 'id, date, kind',
      settings: 'id',
    });
  }
}

export const db = new CadenciaDB();
