// Operações de leitura e escrita. A lógica de regra fica em src/lib (funções puras).
import { buildBackup, emptyBackupData, type BackupData, type BackupFile } from '../lib/backup';
import { shiftWeek } from '../lib/dates';
import { newId, nowStamp } from '../lib/ids';
import { planCarryOver, parseQuantity, type ActionInput } from '../lib/week';
import {
  DEFAULT_SETTINGS,
  type Action,
  type DayCount,
  type Goal,
  type Insight,
  type InsightKind,
  type ISODate,
  type Level,
  type MonthKey,
  type RealityTest,
  type ReviewItem,
  type Settings,
  type WeekEntry,
  type WeekKey,
  type WeekStatus,
  type WeeklyReview,
} from '../lib/types';
import { db } from './db';

// ---- Objetivos ----

export async function addGoal(input: { text: string; why: string }): Promise<string> {
  const now = nowStamp();
  const goal: Goal = { id: newId(), text: input.text.trim(), why: input.why.trim(), status: 'active', createdAt: now, updatedAt: now };
  await db.goals.add(goal);
  return goal.id;
}

export async function updateGoal(id: string, patch: Partial<Pick<Goal, 'text' | 'why' | 'status'>>): Promise<void> {
  await db.goals.update(id, { ...patch, updatedAt: nowStamp() });
}

/** Exclui o objetivo, suas ações e as entradas dessas ações nas semanas. */
export async function deleteGoal(id: string): Promise<void> {
  await db.transaction('rw', db.goals, db.actions, db.weekEntries, async () => {
    const actionIds = (await db.actions.where('goalId').equals(id).primaryKeys()) as string[];
    if (actionIds.length) {
      await db.weekEntries.where('actionId').anyOf(actionIds).delete();
      await db.actions.bulkDelete(actionIds);
    }
    await db.goals.delete(id);
  });
}

// ---- Ações ----

export interface NewActionInput extends ActionInput {
  impact: Level;
  leaderRequest: boolean;
  ease: Level;
}

export async function addAction(goalId: string, input: NewActionInput): Promise<string> {
  const now = nowStamp();
  const action: Action = {
    id: newId(),
    goalId,
    verb: input.verb.trim(),
    quantity: parseQuantity(input.quantity),
    object: input.object.trim(),
    dueDate: input.dueDate,
    impact: input.impact,
    leaderRequest: input.leaderRequest,
    ease: input.ease,
    status: 'open',
    carriedCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.actions.add(action);
  return action.id;
}

export async function deleteAction(id: string): Promise<void> {
  await db.transaction('rw', db.actions, db.weekEntries, async () => {
    await db.weekEntries.where('actionId').equals(id).delete();
    await db.actions.delete(id);
  });
}

// ---- Semana ----

/** Coloca a ação na semana (sem duplicar). Devolve quantas ações a semana passou a ter. */
export async function addToWeek(actionId: string, week: WeekKey): Promise<number> {
  return db.transaction('rw', db.weekEntries, async () => {
    const existing = await db.weekEntries.where('[week+actionId]').equals([week, actionId]).first();
    if (!existing) {
      const now = nowStamp();
      await db.weekEntries.add({
        id: newId(),
        week,
        actionId,
        status: 'pending',
        carriedFromWeek: null,
        carriedToWeek: null,
        createdAt: now,
        updatedAt: now,
      });
    }
    return db.weekEntries.where('week').equals(week).count();
  });
}

export async function removeFromWeek(entryId: string): Promise<void> {
  await db.transaction('rw', db.weekEntries, db.actions, async () => {
    const entry = await db.weekEntries.get(entryId);
    if (!entry) return;
    await db.weekEntries.delete(entryId);
    await syncActionStatus(entry.actionId);
  });
}

/** A ação fica "feita" quando foi marcada como feita em alguma semana. */
async function syncActionStatus(actionId: string): Promise<void> {
  const entries = await db.weekEntries.where('actionId').equals(actionId).toArray();
  const status = entries.some((e) => e.status === 'done') ? 'done' : 'open';
  const action = await db.actions.get(actionId);
  if (action && action.status !== status) await db.actions.update(actionId, { status, updatedAt: nowStamp() });
}

export async function setEntryStatus(entryId: string, status: WeekStatus): Promise<void> {
  await db.transaction('rw', db.weekEntries, db.actions, async () => {
    const entry = await db.weekEntries.get(entryId);
    if (!entry) return;
    await db.weekEntries.update(entryId, { status, updatedAt: nowStamp() });
    await syncActionStatus(entry.actionId);
  });
}

/** Transporta pendentes e parciais da semana `fromWeek` para a seguinte. */
export async function carryOver(fromWeek: WeekKey): Promise<{ toWeek: WeekKey; carried: number }> {
  return db.transaction('rw', db.weekEntries, db.actions, async () => {
    const entries = await db.weekEntries.where('week').equals(fromWeek).toArray();
    const target = await db.weekEntries.where('week').equals(shiftWeek(fromWeek, 1)).toArray();
    const doneIds = (await db.actions.where('status').equals('done').primaryKeys()) as string[];
    const finalPlan = planCarryOver({
      fromWeek,
      entries,
      actionIdsInTarget: target.map((e) => e.actionId),
      doneActionIds: doneIds,
    });
    const now = nowStamp();
    if (finalPlan.create.length) {
      await db.weekEntries.bulkAdd(
        finalPlan.create.map<WeekEntry>((c) => ({
          id: newId(),
          week: finalPlan.toWeek,
          actionId: c.actionId,
          status: 'pending',
          carriedFromWeek: c.carriedFromWeek,
          carriedToWeek: null,
          createdAt: now,
          updatedAt: now,
        })),
      );
    }
    for (const id of finalPlan.markCarried) {
      await db.weekEntries.update(id, { carriedToWeek: finalPlan.toWeek, updatedAt: now });
    }
    for (const actionId of finalPlan.incrementActionIds) {
      const action = await db.actions.get(actionId);
      if (action) await db.actions.update(actionId, { carriedCount: action.carriedCount + 1, updatedAt: now });
    }
    return { toWeek: finalPlan.toWeek, carried: finalPlan.create.length };
  });
}

// ---- Teste de Realidade ----

export async function saveRealityTest(
  month: MonthKey,
  input: { target: number; unit: string; done: number; dayCount: DayCount },
): Promise<void> {
  await db.transaction('rw', db.realityTests, async () => {
    const existing = await db.realityTests.where('month').equals(month).first();
    const record: RealityTest = {
      id: existing?.id ?? newId(),
      month,
      target: input.target,
      unit: input.unit.trim(),
      done: input.done,
      dayCount: input.dayCount,
      updatedAt: nowStamp(),
    };
    await db.realityTests.put(record);
  });
}

/** Soma um lançamento ao "já feito" do mês (cria o registro se não houver). */
export async function addToRealityDone(month: MonthKey, amount: number, defaults: { dayCount: DayCount }): Promise<void> {
  await db.transaction('rw', db.realityTests, async () => {
    const existing = await db.realityTests.where('month').equals(month).first();
    if (existing) {
      await db.realityTests.update(existing.id, { done: Math.max(0, existing.done + amount), updatedAt: nowStamp() });
    } else {
      await db.realityTests.add({
        id: newId(),
        month,
        target: 0,
        unit: '',
        done: Math.max(0, amount),
        dayCount: defaults.dayCount,
        updatedAt: nowStamp(),
      });
    }
  });
}

// ---- Avaliação Semanal ----

export interface ReviewInput {
  learned: string;
  notDone: string;
  impactMonth: string;
  impactYear: string;
  decision: WeeklyReview['decision'];
  decisionNote: string;
}

export async function saveReview(week: WeekKey, date: ISODate, input: ReviewInput, items: ReviewItem[]): Promise<void> {
  await db.transaction('rw', db.weeklyReviews, async () => {
    const existing = await db.weeklyReviews.where('week').equals(week).first();
    const now = nowStamp();
    await db.weeklyReviews.put({
      id: existing?.id ?? newId(),
      week,
      date,
      items,
      learned: input.learned.trim(),
      notDone: input.notDone.trim(),
      impactMonth: input.impactMonth.trim(),
      impactYear: input.impactYear.trim(),
      decision: input.decision,
      decisionNote: input.decisionNote.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  });
}

// ---- Insights ----

export async function addInsight(input: { kind: InsightKind; text: string; date: ISODate }): Promise<string> {
  const insight: Insight = {
    id: newId(),
    date: input.date,
    kind: input.kind,
    text: input.text.trim(),
    applied: false,
    appliedAt: null,
    createdAt: nowStamp(),
  };
  await db.insights.add(insight);
  return insight.id;
}

export async function setInsightApplied(id: string, applied: boolean): Promise<void> {
  await db.insights.update(id, { applied, appliedAt: applied ? nowStamp() : null });
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id);
}

// ---- Configurações ----

export async function getSettings(): Promise<Settings> {
  const stored = await db.settings.get('main');
  return { ...DEFAULT_SETTINGS, ...stored, id: 'main' };
}

export async function saveSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const current = await getSettings();
    await db.settings.put({ ...current, ...patch, id: 'main' });
  });
}

// ---- Backup ----

export async function exportAll(now: Date = new Date()): Promise<BackupFile> {
  const data = await db.transaction(
    'r',
    [db.goals, db.actions, db.weekEntries, db.realityTests, db.weeklyReviews, db.insights, db.settings],
    async (): Promise<BackupData> => ({
      goals: await db.goals.toArray(),
      actions: await db.actions.toArray(),
      weekEntries: await db.weekEntries.toArray(),
      realityTests: await db.realityTests.toArray(),
      weeklyReviews: await db.weeklyReviews.toArray(),
      insights: await db.insights.toArray(),
      settings: await db.settings.toArray(),
    }),
  );
  return buildBackup(data, now);
}

/** Substitui TODOS os dados locais pelos do backup (já validado), numa única transação. */
export async function replaceAll(data: BackupData): Promise<void> {
  const tables = [db.goals, db.actions, db.weekEntries, db.realityTests, db.weeklyReviews, db.insights, db.settings];
  await db.transaction('rw', tables, async () => {
    await Promise.all(tables.map((t) => t.clear()));
    await db.goals.bulkAdd(data.goals);
    await db.actions.bulkAdd(data.actions);
    await db.weekEntries.bulkAdd(data.weekEntries);
    await db.realityTests.bulkAdd(data.realityTests);
    await db.weeklyReviews.bulkAdd(data.weeklyReviews);
    await db.insights.bulkAdd(data.insights);
    await db.settings.bulkAdd(data.settings);
  });
}

export async function clearAll(): Promise<void> {
  await replaceAll(emptyBackupData());
}
