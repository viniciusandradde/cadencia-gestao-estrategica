import { useEffect, useState } from 'react';
import { isoWeekKey, todayISO } from '../lib/dates';
import { DEFAULT_SETTINGS, type Action, type Goal, type Settings, type WeekEntry, type WeekKey } from '../lib/types';
import { db } from './db';
import { getSettings } from './repo';
import { useLive } from './useLive';

/** Data de hoje (local), atualizada se o app ficar aberto na virada do dia. */
export function useToday(): string {
  const [today, setToday] = useState(() => todayISO());
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = todayISO();
      setToday((prev) => (prev === now ? prev : now));
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return today;
}

export function useCurrentWeek(): WeekKey {
  return isoWeekKey(useToday());
}

export function useSettings(): Settings {
  return useLive(() => getSettings(), []) ?? DEFAULT_SETTINGS;
}

export function useGoals(): Goal[] | undefined {
  return useLive(() => db.goals.orderBy('createdAt').toArray(), []);
}

export function useActions(): Action[] | undefined {
  return useLive(() => db.actions.toArray(), []);
}

export function useWeekEntries(week: WeekKey): WeekEntry[] | undefined {
  return useLive(() => db.weekEntries.where('week').equals(week).sortBy('createdAt'), [week]);
}
