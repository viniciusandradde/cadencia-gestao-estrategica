// Teste de Realidade: meta do mês, quanto falta, dias restantes e meta de hoje.
import { compareISO, countDays, isBusinessDay, monthEnd, monthStart } from './dates';
import type { DayCount, ISODate, MonthKey } from './types';

export interface RealityInput {
  month: MonthKey;
  target: number;
  done: number;
  dayCount: DayCount;
  today: ISODate;
}

export type RealityPhase = 'past' | 'current' | 'future';

export interface RealityResult {
  remaining: number;
  /** Dias que ainda contam, de hoje (inclusive) até o fim do mês. */
  remainingDays: number;
  /** Total de dias do mês no modo escolhido. */
  totalDays: number;
  /** Meta de hoje = falta ÷ dias restantes. null quando não sobra nenhum dia e ainda falta. */
  todayTarget: number | null;
  /** Hoje entra na contagem? (false em fim de semana no modo dias úteis.) */
  todayCounts: boolean;
  percentDone: number;
  achieved: boolean;
  phase: RealityPhase;
}

/** Dias restantes do mês a partir de hoje (inclusive). */
export function remainingDaysInMonth(month: MonthKey, today: ISODate, mode: DayCount): number {
  const start = monthStart(month);
  const end = monthEnd(month);
  if (compareISO(today, end) > 0) return 0;
  const from = compareISO(today, start) < 0 ? start : today;
  return countDays(from, end, mode);
}

export function realityTest(input: RealityInput): RealityResult {
  const target = Math.max(0, Number.isFinite(input.target) ? input.target : 0);
  const done = Math.max(0, Number.isFinite(input.done) ? input.done : 0);
  const start = monthStart(input.month);
  const end = monthEnd(input.month);

  const phase: RealityPhase =
    compareISO(input.today, start) < 0 ? 'future' : compareISO(input.today, end) > 0 ? 'past' : 'current';

  const remaining = Math.max(0, target - done);
  const remainingDays = remainingDaysInMonth(input.month, input.today, input.dayCount);
  const totalDays = countDays(start, end, input.dayCount);

  let todayTarget: number | null;
  if (remaining === 0) todayTarget = 0;
  else if (remainingDays > 0) todayTarget = remaining / remainingDays;
  else todayTarget = null;

  const todayCounts =
    phase === 'current' && (input.dayCount === 'calendar' || isBusinessDay(input.today));

  return {
    remaining,
    remainingDays,
    totalDays,
    todayTarget,
    todayCounts,
    percentDone: target > 0 ? Math.min(100, (done / target) * 100) : 0,
    achieved: target > 0 && done >= target,
    phase,
  };
}

/** Formata número em pt-BR com até `maxDecimals` casas. */
export function formatNumber(value: number, maxDecimals = 2): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: maxDecimals }).format(value);
}
