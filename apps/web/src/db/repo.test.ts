// Integração com o IndexedDB simulado (fake-indexeddb) para conferir as operações do app.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseBackup, serializeBackup } from '../lib/backup';
import { db } from './db';
import {
  addAction,
  addGoal,
  addInsight,
  addToRealityDone,
  addToWeek,
  carryOver,
  clearAll,
  deleteGoal,
  exportAll,
  getSettings,
  replaceAll,
  saveRealityTest,
  saveReview,
  saveSettings,
  setEntryStatus,
  setInsightApplied,
} from './repo';

const actionInput = {
  verb: 'Ligar para',
  quantity: '20',
  object: 'clientes novos',
  dueDate: '2026-11-30',
  impact: 3 as const,
  leaderRequest: false,
  ease: 2 as const,
};

beforeEach(async () => {
  await clearAll();
});

describe('Caderno de Metas no banco local', () => {
  it('cria objetivo e ação, coloca na semana sem duplicar e marca como feita', async () => {
    const goalId = await addGoal({ text: ' Dobrar clientes ', why: 'Renda estável' });
    const actionId = await addAction(goalId, actionInput);
    expect(await addToWeek(actionId, '2026-W48')).toBe(1);
    expect(await addToWeek(actionId, '2026-W48')).toBe(1);

    const [entry] = await db.weekEntries.toArray();
    await setEntryStatus(entry!.id, 'done');
    expect((await db.actions.get(actionId))?.status).toBe('done');
    expect((await db.goals.get(goalId))?.text).toBe('Dobrar clientes');
    expect((await db.actions.get(actionId))?.quantity).toBe(20);

    await setEntryStatus(entry!.id, 'partial');
    expect((await db.actions.get(actionId))?.status).toBe('open');
  });

  it('transporta pendentes e parciais para a semana seguinte uma única vez', async () => {
    const goalId = await addGoal({ text: 'Objetivo', why: '' });
    const a1 = await addAction(goalId, actionInput);
    const a2 = await addAction(goalId, { ...actionInput, verb: 'Ler' });
    const a3 = await addAction(goalId, { ...actionInput, verb: 'Escrever' });
    for (const id of [a1, a2, a3]) await addToWeek(id, '2026-W48');
    const entries = await db.weekEntries.where('week').equals('2026-W48').toArray();
    await setEntryStatus(entries.find((e) => e.actionId === a1)!.id, 'done');
    await setEntryStatus(entries.find((e) => e.actionId === a2)!.id, 'partial');

    const first = await carryOver('2026-W48');
    expect(first).toEqual({ toWeek: '2026-W49', carried: 2 });
    const next = await db.weekEntries.where('week').equals('2026-W49').toArray();
    expect(next.map((e) => e.actionId).sort()).toEqual([a2, a3].sort());
    expect(next.every((e) => e.status === 'pending' && e.carriedFromWeek === '2026-W48')).toBe(true);
    expect((await db.actions.get(a2))?.carriedCount).toBe(1);
    expect((await db.actions.get(a1))?.carriedCount).toBe(0);

    const second = await carryOver('2026-W48');
    expect(second.carried).toBe(0);
    expect(await db.weekEntries.where('week').equals('2026-W49').count()).toBe(2);
  });

  it('excluir objetivo apaga ações e entradas da semana', async () => {
    const goalId = await addGoal({ text: 'Objetivo', why: '' });
    const actionId = await addAction(goalId, actionInput);
    await addToWeek(actionId, '2026-W48');
    await deleteGoal(goalId);
    expect(await db.goals.count()).toBe(0);
    expect(await db.actions.count()).toBe(0);
    expect(await db.weekEntries.count()).toBe(0);
  });
});

describe('Teste de Realidade, Avaliação, Insights e Configurações', () => {
  it('guarda um Teste de Realidade por mês e soma lançamentos', async () => {
    await saveRealityTest('2026-11', { target: 100, unit: 'vendas', done: 10, dayCount: 'business' });
    await saveRealityTest('2026-11', { target: 120, unit: 'vendas', done: 10, dayCount: 'calendar' });
    await addToRealityDone('2026-11', 5, { dayCount: 'business' });
    const all = await db.realityTests.toArray();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ target: 120, done: 15, dayCount: 'calendar' });
  });

  it('guarda uma Avaliação Semanal por semana (atualiza se já existir)', async () => {
    const input = { learned: 'a', notDone: 'b', impactMonth: 'c', impactYear: 'd', decision: 'adjust' as const, decisionNote: '' };
    await saveReview('2026-W48', '2026-11-27', input, []);
    await saveReview('2026-W48', '2026-11-28', { ...input, decision: 'accelerate' }, []);
    const all = await db.weeklyReviews.toArray();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ decision: 'accelerate', date: '2026-11-28' });
  });

  it('marca insight como aplicado', async () => {
    const id = await addInsight({ kind: 'stop', text: 'Parar de checar e-mail toda hora', date: '2026-11-25' });
    await setInsightApplied(id, true);
    expect((await db.insights.get(id))?.applied).toBe(true);
    expect((await db.insights.get(id))?.appliedAt).not.toBeNull();
  });

  it('usa os padrões de configuração e salva alterações', async () => {
    expect(await getSettings()).toMatchObject({ weeklyActionLimit: 5, reviewWeekday: 5, defaultDayCount: 'business' });
    await saveSettings({ weeklyActionLimit: 3 });
    expect((await getSettings()).weeklyActionLimit).toBe(3);
  });
});

describe('backup completo pelo banco', () => {
  it('exporta, apaga, importa e volta igual', async () => {
    const goalId = await addGoal({ text: 'Objetivo', why: 'Porque sim' });
    const actionId = await addAction(goalId, actionInput);
    await addToWeek(actionId, '2026-W48');
    await saveRealityTest('2026-11', { target: 100, unit: 'vendas', done: 40, dayCount: 'business' });
    await addInsight({ kind: 'keep', text: 'Manter a revisão de sexta', date: '2026-11-25' });
    await saveSettings({ weeklyActionLimit: 4 });

    const exported = await exportAll(new Date('2026-11-25T12:00:00Z'));
    const parsed = parseBackup(serializeBackup(exported));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    await clearAll();
    expect(await db.goals.count()).toBe(0);

    await replaceAll(parsed.backup.data);
    const again = await exportAll(new Date('2026-11-25T12:00:00Z'));
    expect(again).toEqual(exported);
  });
});
