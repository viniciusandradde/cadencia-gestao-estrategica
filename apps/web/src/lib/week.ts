// Regras do Caderno de Metas para a semana: limite de ações, prioridade, transporte e validação.
import { isValidISODate, shiftWeek } from './dates';
import type { Action, Level, WeekEntry, WeekKey, WeekStatus } from './types';

export const WEEK_STATUS_LABEL: Record<WeekStatus, string> = {
  done: 'Feita',
  partial: 'Parcial',
  pending: 'Pendente',
};

export const LEVEL_LABEL: Record<Level, string> = { 1: 'baixo', 2: 'médio', 3: 'alto' };
export const EASE_LABEL: Record<Level, string> = { 1: 'difícil', 2: 'média', 3: 'fácil' };

export const MIN_WEEKLY_LIMIT = 1;
export const MAX_WEEKLY_LIMIT = 20;
/** Ação transportada esta quantidade de vezes pede decisão (quebrar, delegar ou descartar). */
export const CARRY_DECISION_THRESHOLD = 3;

/** Garante um limite inteiro entre 1 e 20; valores inválidos voltam ao padrão 5. */
export function normalizeWeeklyLimit(value: unknown, fallback = 5): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_WEEKLY_LIMIT, Math.max(MIN_WEEKLY_LIMIT, Math.round(n)));
}

export interface WeekLimitStatus {
  count: number;
  limit: number;
  /** Passou do limite (count > limit). */
  over: boolean;
  /** Quantas ações acima do limite. */
  excess: number;
  /** Quantas ainda cabem dentro do limite. */
  remaining: number;
}

export function weekLimitStatus(count: number, limit: number): WeekLimitStatus {
  const safeLimit = normalizeWeeklyLimit(limit);
  return {
    count,
    limit: safeLimit,
    over: count > safeLimit,
    excess: Math.max(0, count - safeLimit),
    remaining: Math.max(0, safeLimit - count),
  };
}

/**
 * Ordem de prioridade do método (docs/09, conflito 1): pedido da liderança e impacto primeiro,
 * depois o prazo mais próximo; a facilidade só desempata.
 */
export function comparePriority(a: Action, b: Action): number {
  if (a.leaderRequest !== b.leaderRequest) return a.leaderRequest ? -1 : 1;
  if (a.impact !== b.impact) return b.impact - a.impact;
  if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
  if (a.ease !== b.ease) return b.ease - a.ease;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

export function sortByPriority(actions: readonly Action[]): Action[] {
  return [...actions].sort(comparePriority);
}

/** "Ligar para 20 clientes novos" */
export function actionLabel(action: Pick<Action, 'verb' | 'quantity' | 'object'>): string {
  const qty = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(action.quantity);
  return [action.verb.trim(), qty, action.object.trim()].filter(Boolean).join(' ');
}

export function needsCarryDecision(action: Pick<Action, 'carriedCount' | 'status'>): boolean {
  return action.status === 'open' && action.carriedCount >= CARRY_DECISION_THRESHOLD;
}

export interface ActionInput {
  verb: string;
  quantity: number | string;
  object: string;
  dueDate: string;
}

export type ActionInputErrors = Partial<Record<keyof ActionInput, string>>;

/** Ação mensurável: verbo, número e prazo obrigatórios. */
export function validateActionInput(input: ActionInput): ActionInputErrors {
  const errors: ActionInputErrors = {};
  if (!input.verb.trim()) errors.verb = 'Comece com um verbo (ex.: ligar para, ler, publicar).';
  const qty = typeof input.quantity === 'number' ? input.quantity : Number(String(input.quantity).replace(',', '.'));
  if (String(input.quantity).trim() === '' || !Number.isFinite(qty) || qty <= 0) {
    errors.quantity = 'Informe um número maior que zero.';
  }
  if (!input.object.trim()) errors.object = 'Diga o quê (ex.: clientes novos, páginas, km).';
  if (!isValidISODate(input.dueDate)) errors.dueDate = 'Escolha a data do prazo.';
  return errors;
}

export function parseQuantity(value: number | string): number {
  return typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
}

export interface CarryOverPlan {
  fromWeek: WeekKey;
  toWeek: WeekKey;
  /** Novas entradas a criar na semana seguinte (status pendente). */
  create: { actionId: string; carriedFromWeek: WeekKey }[];
  /** Entradas da semana de origem a marcar como transportadas (carriedToWeek = toWeek). */
  markCarried: string[];
  /** Ações cujo contador de transporte deve subir. */
  incrementActionIds: string[];
}

/**
 * Planeja o transporte das ações não concluídas (pendentes e parciais) para a semana seguinte.
 * Não duplica ações que já estão na semana seguinte e ignora ações já feitas em outra semana.
 */
export function planCarryOver(params: {
  fromWeek: WeekKey;
  entries: readonly WeekEntry[];
  actionIdsInTarget: Iterable<string>;
  doneActionIds?: Iterable<string>;
}): CarryOverPlan {
  const toWeek = shiftWeek(params.fromWeek, 1);
  const inTarget = new Set(params.actionIdsInTarget);
  const done = new Set(params.doneActionIds ?? []);
  const plan: CarryOverPlan = { fromWeek: params.fromWeek, toWeek, create: [], markCarried: [], incrementActionIds: [] };

  for (const entry of params.entries) {
    if (entry.week !== params.fromWeek) continue;
    if (entry.status === 'done' || entry.carriedToWeek !== null) continue;
    if (done.has(entry.actionId)) continue;
    plan.markCarried.push(entry.id);
    if (inTarget.has(entry.actionId)) continue; // já está na semana seguinte
    inTarget.add(entry.actionId);
    plan.create.push({ actionId: entry.actionId, carriedFromWeek: params.fromWeek });
    plan.incrementActionIds.push(entry.actionId);
  }
  return plan;
}

/** Entradas que ainda podem ser transportadas (não feitas e ainda não transportadas). */
export function carryableEntries(entries: readonly WeekEntry[], doneActionIds: Iterable<string> = []): WeekEntry[] {
  const done = new Set(doneActionIds);
  return entries.filter((e) => e.status !== 'done' && e.carriedToWeek === null && !done.has(e.actionId));
}

export interface WeekSummary {
  total: number;
  done: number;
  partial: number;
  pending: number;
}

export function summarizeWeek(entries: readonly Pick<WeekEntry, 'status'>[]): WeekSummary {
  const summary: WeekSummary = { total: entries.length, done: 0, partial: 0, pending: 0 };
  for (const e of entries) summary[e.status]++;
  return summary;
}

/** "1 feita · 2 parciais · 0 pendentes" */
export function formatWeekSummary(summary: WeekSummary): string {
  const part = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  return [
    part(summary.done, 'feita', 'feitas'),
    part(summary.partial, 'parcial', 'parciais'),
    part(summary.pending, 'pendente', 'pendentes'),
  ].join(' · ');
}
