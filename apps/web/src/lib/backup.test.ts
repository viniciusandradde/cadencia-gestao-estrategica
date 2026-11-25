import { describe, expect, it } from 'vitest';
import { backupFileName, buildBackup, parseBackup, serializeBackup, type BackupData } from './backup';

const T = '2026-11-25T12:00:00.000Z';

function sampleData(): BackupData {
  return {
    goals: [{ id: 'g1', text: 'Dobrar a carteira de clientes', why: 'Ter renda estável', status: 'active', createdAt: T, updatedAt: T }],
    actions: [
      {
        id: 'a1',
        goalId: 'g1',
        verb: 'Ligar para',
        quantity: 20,
        object: 'clientes novos',
        dueDate: '2026-11-30',
        impact: 3,
        leaderRequest: false,
        ease: 2,
        status: 'done',
        carriedCount: 1,
        createdAt: T,
        updatedAt: T,
      },
    ],
    weekEntries: [
      {
        id: 'w1',
        week: '2026-W48',
        actionId: 'a1',
        status: 'done',
        carriedFromWeek: '2026-W47',
        carriedToWeek: null,
        createdAt: T,
        updatedAt: T,
      },
    ],
    realityTests: [{ id: 'r1', month: '2026-11', target: 100, unit: 'vendas', done: 40, dayCount: 'business', updatedAt: T }],
    weeklyReviews: [
      {
        id: 'v1',
        week: '2026-W48',
        date: '2026-11-27',
        items: [{ actionId: 'a1', label: 'Ligar para 20 clientes novos', status: 'done' }],
        learned: 'Ligar cedo funciona',
        notDone: '',
        impactMonth: 'Mais 4 reuniões',
        impactYear: 'Base para a meta anual',
        decision: 'accelerate',
        decisionNote: 'Subir para 30 ligações',
        createdAt: T,
        updatedAt: T,
      },
    ],
    insights: [
      { id: 'i1', date: '2026-11-25', kind: 'start', text: 'Bloquear 1 h para ligações', applied: true, appliedAt: T, createdAt: T },
    ],
    settings: [{ id: 'main', weeklyActionLimit: 5, reviewWeekday: 5, defaultDayCount: 'business', lastBackupAt: null }],
  };
}

describe('exportação e importação (ida e volta)', () => {
  it('o JSON exportado volta idêntico', () => {
    const data = sampleData();
    const text = serializeBackup(buildBackup(data, new Date(T)));
    const result = parseBackup(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.backup.data).toEqual(data);
    expect(result.backup.exportedAt).toBe(T);
    expect(result.counts).toEqual({
      goals: 1,
      actions: 1,
      weekEntries: 1,
      realityTests: 1,
      weeklyReviews: 1,
      insights: 1,
      settings: 1,
    });
  });

  it('remove campos desconhecidos e aceita tabelas ausentes como vazias', () => {
    const file = buildBackup(sampleData(), new Date(T)) as unknown as { data: Record<string, unknown[]> };
    (file.data.goals![0] as Record<string, unknown>).extra = 'lixo';
    delete file.data.insights;
    const result = parseBackup(JSON.stringify(file));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.backup.data.goals[0]).not.toHaveProperty('extra');
    expect(result.backup.data.insights).toEqual([]);
  });

  it('nome do arquivo leva a data', () => {
    expect(backupFileName(new Date(2026, 10, 25, 9))).toBe('cadencia-backup-2026-11-25.json');
  });
});

describe('validação do backup', () => {
  const withData = (mutate: (d: BackupData) => void) => {
    const data = sampleData();
    mutate(data);
    return parseBackup(serializeBackup(buildBackup(data, new Date(T))));
  };

  it('rejeita arquivo que não é JSON', () => {
    const r = parseBackup('{ isso não é json');
    expect(r).toEqual({ ok: false, errors: ['O arquivo não é um JSON válido.'] });
  });

  it('rejeita JSON de outro formato', () => {
    const r = parseBackup(JSON.stringify({ hello: 'world' }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/não é um backup do Cadência/);
  });

  it('rejeita backup de versão mais nova', () => {
    const file = { ...buildBackup(sampleData()), version: 99 };
    const r = parseBackup(JSON.stringify(file));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/versão mais nova/);
  });

  it('aponta campo inválido', () => {
    const r = withData((d) => {
      (d.actions[0] as unknown as Record<string, unknown>).quantity = -1;
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/Ações, item 1: campo "quantity"/);
  });

  it('aponta referência quebrada', () => {
    const r = withData((d) => {
      d.actions[0]!.goalId = 'nao-existe';
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/objetivo que não existe/);
  });

  it('aponta id repetido e ação duplicada na mesma semana', () => {
    const dupId = withData((d) => {
      d.goals.push({ ...d.goals[0]! });
    });
    expect(dupId.ok).toBe(false);
    if (!dupId.ok) expect(dupId.errors.join(' ')).toMatch(/id repetido/);

    const dupWeek = withData((d) => {
      d.weekEntries.push({ ...d.weekEntries[0]!, id: 'w2' });
    });
    expect(dupWeek.ok).toBe(false);
    if (!dupWeek.ok) expect(dupWeek.errors.join(' ')).toMatch(/duas vezes na semana/);
  });

  it('rejeita semana e data inválidas', () => {
    const r = withData((d) => {
      d.weekEntries[0]!.week = '2025-W53';
      d.insights[0]!.date = '2026-02-30';
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.join(' ')).toMatch(/campo "week"/);
      expect(r.errors.join(' ')).toMatch(/campo "date"/);
    }
  });
});
