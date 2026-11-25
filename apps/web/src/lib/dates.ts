// Datas civis (AAAA-MM-DD) calculadas em UTC para não sofrer com fuso e horário de verão.
import type { ISODate, IsoWeekday, MonthKey, WeekKey } from './types';

const DAY_MS = 86_400_000;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEK_RE = /^(\d{4})-W(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;

const pad = (n: number, size = 2) => String(n).padStart(size, '0');

function toUTCms(iso: ISODate): number {
  const m = ISO_DATE_RE.exec(iso);
  if (!m) throw new Error(`Data inválida: ${iso}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    throw new Error(`Data inválida: ${iso}`);
  }
  return ms;
}

function fromUTCms(ms: number): ISODate {
  const d = new Date(ms);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function isValidISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string') return false;
  try {
    toUTCms(value);
    return true;
  } catch {
    return false;
  }
}

/** Data local do aparelho (não UTC) como AAAA-MM-DD. */
export function toLocalISODate(date: Date): ISODate {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(now: Date = new Date()): ISODate {
  return toLocalISODate(now);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return fromUTCms(toUTCms(iso) + days * DAY_MS);
}

export function compareISO(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Dia da semana ISO: 1 = segunda ... 7 = domingo. */
export function isoWeekday(iso: ISODate): IsoWeekday {
  const day = new Date(toUTCms(iso)).getUTCDay(); // 0 = domingo
  return (day === 0 ? 7 : day) as IsoWeekday;
}

export function isBusinessDay(iso: ISODate): boolean {
  return isoWeekday(iso) <= 5;
}

/** Semana ISO 8601 (segunda a domingo; a semana 1 contém a primeira quinta-feira do ano). */
export function isoWeekKey(iso: ISODate): WeekKey {
  const ms = toUTCms(iso);
  const thursday = ms + (4 - isoWeekday(iso)) * DAY_MS;
  const year = new Date(thursday).getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1);
  const week = Math.floor((thursday - jan1) / DAY_MS / 7) + 1;
  return `${pad(year, 4)}-W${pad(week)}`;
}

export function isValidWeekKey(value: unknown): value is WeekKey {
  if (typeof value !== 'string') return false;
  const m = WEEK_RE.exec(value);
  if (!m) return false;
  const week = Number(m[2]);
  if (week < 1 || week > 53) return false;
  return isoWeekKey(weekStartUnchecked(Number(m[1]), week)) === value;
}

function weekStartUnchecked(year: number, week: number): ISODate {
  // 4 de janeiro está sempre na semana 1.
  const jan4 = fromUTCms(Date.UTC(year, 0, 4));
  const mondayW1 = addDays(jan4, 1 - isoWeekday(jan4));
  return addDays(mondayW1, (week - 1) * 7);
}

/** Segunda-feira da semana. */
export function weekStart(key: WeekKey): ISODate {
  const m = WEEK_RE.exec(key);
  if (!m) throw new Error(`Semana inválida: ${key}`);
  return weekStartUnchecked(Number(m[1]), Number(m[2]));
}

/** Domingo da semana. */
export function weekEnd(key: WeekKey): ISODate {
  return addDays(weekStart(key), 6);
}

export function shiftWeek(key: WeekKey, weeks: number): WeekKey {
  return isoWeekKey(addDays(weekStart(key), weeks * 7));
}

export function weekNumber(key: WeekKey): number {
  return Number(key.slice(-2));
}

export function monthKey(iso: ISODate): MonthKey {
  return iso.slice(0, 7);
}

export function isValidMonthKey(value: unknown): value is MonthKey {
  if (typeof value !== 'string') return false;
  const m = MONTH_RE.exec(value);
  return !!m && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

export function monthStart(key: MonthKey): ISODate {
  if (!isValidMonthKey(key)) throw new Error(`Mês inválido: ${key}`);
  return `${key}-01`;
}

export function monthEnd(key: MonthKey): ISODate {
  const [y, m] = key.split('-').map(Number) as [number, number];
  return fromUTCms(Date.UTC(y, m, 0));
}

export function shiftMonth(key: MonthKey, months: number): MonthKey {
  const [y, m] = key.split('-').map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}`;
}

/** Conta dias de `from` até `to`, inclusive. Em "business" só conta segunda a sexta. */
export function countDays(from: ISODate, to: ISODate, mode: 'business' | 'calendar'): number {
  const start = toUTCms(from);
  const end = toUTCms(to);
  if (start > end) return 0;
  const total = Math.round((end - start) / DAY_MS) + 1;
  if (mode === 'calendar') return total;
  const fullWeeks = Math.floor(total / 7);
  let count = fullWeeks * 5;
  let day = addDays(from, fullWeeks * 7);
  for (let i = 0; i < total % 7; i++) {
    if (isBusinessDay(day)) count++;
    day = addDays(day, 1);
  }
  return count;
}

// ---- Formatação pt-BR (sem depender do Intl para manter testes estáveis) ----

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
export const WEEKDAYS: Record<IsoWeekday, string> = {
  1: 'segunda-feira',
  2: 'terça-feira',
  3: 'quarta-feira',
  4: 'quinta-feira',
  5: 'sexta-feira',
  6: 'sábado',
  7: 'domingo',
};

export function formatDateBR(iso: ISODate): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDayMonth(iso: ISODate): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** "23/11 a 29/11/2026" */
export function formatWeekRange(key: WeekKey): string {
  const start = weekStart(key);
  const end = weekEnd(key);
  return `${formatDayMonth(start)} a ${formatDateBR(end)}`;
}

/** "Semana 48 · 23/11 a 29/11/2026" */
export function formatWeekLabel(key: WeekKey): string {
  return `Semana ${weekNumber(key)} · ${formatWeekRange(key)}`;
}

/** "novembro de 2026" */
export function formatMonthLabel(key: MonthKey): string {
  const [y, m] = key.split('-').map(Number) as [number, number];
  return `${MONTHS[m - 1]} de ${y}`;
}

/** Data e hora local de um carimbo ISO completo: "25/11/2026 14:05". */
export function formatTimestampBR(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return timestamp;
  return `${formatDateBR(toLocalISODate(d))} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
