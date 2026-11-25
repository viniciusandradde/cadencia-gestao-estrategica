// Avaliação Semanal: lembrete no dia configurado e rótulos.
import { isoWeekday } from './dates';
import type { ISODate, InsightKind, IsoWeekday, ReviewDecision } from './types';

export type ReviewReminder = 'today' | 'overdue' | null;

/**
 * Lembrete da Avaliação Semanal: "today" no dia configurado, "overdue" nos dias seguintes da
 * mesma semana enquanto a avaliação não for feita; null nos demais casos.
 */
export function reviewReminder(today: ISODate, reviewWeekday: IsoWeekday, hasReviewThisWeek: boolean): ReviewReminder {
  if (hasReviewThisWeek) return null;
  const weekday = isoWeekday(today);
  if (weekday === reviewWeekday) return 'today';
  if (weekday > reviewWeekday) return 'overdue';
  return null;
}

export const DECISION_LABEL: Record<ReviewDecision, string> = {
  adjust: 'Ajusto',
  accelerate: 'Acelero',
};

export const INSIGHT_KIND_LABEL: Record<InsightKind, string> = {
  start: 'Começar',
  keep: 'Manter',
  stop: 'Parar',
  accelerate: 'Acelerar',
};

export const INSIGHT_KINDS: InsightKind[] = ['start', 'keep', 'stop', 'accelerate'];

export const REVIEW_DURATION_SECONDS = 15 * 60;

/** "14:59" */
export function formatTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
