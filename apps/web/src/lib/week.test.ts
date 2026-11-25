import { describe, expect, it } from 'vitest';
import type { Action, WeekEntry } from './types';
import {
  actionLabel,
  carryableEntries,
  needsCarryDecision,
  normalizeWeeklyLimit,
  planCarryOver,
  sortByPriority,
  formatWeekSummary,
  summarizeWeek,
  validateActionInput,
  weekLimitStatus,
} from './week';

function action(over: Partial<Action> & { id: string }): Action {
  return {
    goalId: 'g1',
    verb: 'Fazer',
    quantity: 1,
    object: 'coisa',
    dueDate: '2026-11-30',
    impact: 2,
    leaderRequest: false,
    ease: 2,
    status: 'open',
    carriedCount: 0,
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...over,
  };
}

function entry(over: Partial<WeekEntry> & { id: string; actionId: string }): WeekEntry {
  return {
    week: '2026-W48',
    status: 'pending',
    carriedFromWeek: null,
    carriedToWeek: null,
    createdAt: '2026-11-23T10:00:00.000Z',
    updatedAt: '2026-11-23T10:00:00.000Z',
    ...over,
  };
}

describe('limite de ações por semana', () => {
  it('avisa só quando passa do limite', () => {
    expect(weekLimitStatus(4, 5)).toMatchObject({ over: false, remaining: 1, excess: 0 });
    expect(weekLimitStatus(5, 5)).toMatchObject({ over: false, remaining: 0, excess: 0 });
    expect(weekLimitStatus(7, 5)).toMatchObject({ over: true, remaining: 0, excess: 2 });
  });

  it('normaliza o parâmetro entre 1 e 20 (padrão 5)', () => {
    expect(normalizeWeeklyLimit(0)).toBe(1);
    expect(normalizeWeeklyLimit(25)).toBe(20);
    expect(normalizeWeeklyLimit('abc')).toBe(5);
    expect(normalizeWeeklyLimit(3.6)).toBe(4);
    expect(normalizeWeeklyLimit('7')).toBe(7);
    expect(weekLimitStatus(3, Number.NaN).limit).toBe(5);
  });
});

describe('prioridade da semana (impacto e liderança; facilidade só desempata)', () => {
  it('pedido da liderança vem antes, depois impacto', () => {
    const list = sortByPriority([
      action({ id: 'facil-baixo', impact: 1, ease: 3 }),
      action({ id: 'alto', impact: 3, ease: 1 }),
      action({ id: 'lider', impact: 1, leaderRequest: true }),
    ]);
    expect(list.map((a) => a.id)).toEqual(['lider', 'alto', 'facil-baixo']);
  });

  it('com mesmo impacto, prazo mais próximo primeiro; a facilidade só desempata', () => {
    const list = sortByPriority([
      action({ id: 'dificil', ease: 1 }),
      action({ id: 'facil', ease: 3 }),
      action({ id: 'urgente', ease: 1, dueDate: '2026-11-26' }),
    ]);
    expect(list.map((a) => a.id)).toEqual(['urgente', 'facil', 'dificil']);
  });

  it('não altera a lista original', () => {
    const original = [action({ id: 'a', impact: 1 }), action({ id: 'b', impact: 3 })];
    sortByPriority(original);
    expect(original.map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('transporte das pendentes para a semana seguinte', () => {
  it('leva pendentes e parciais, ignora feitas e já transportadas', () => {
    const plan = planCarryOver({
      fromWeek: '2026-W48',
      entries: [
        entry({ id: 'e1', actionId: 'a1', status: 'done' }),
        entry({ id: 'e2', actionId: 'a2', status: 'pending' }),
        entry({ id: 'e3', actionId: 'a3', status: 'partial' }),
        entry({ id: 'e4', actionId: 'a4', status: 'pending', carriedToWeek: '2026-W49' }),
        entry({ id: 'e5', actionId: 'a5', status: 'pending', week: '2026-W47' }),
      ],
      actionIdsInTarget: [],
    });
    expect(plan.toWeek).toBe('2026-W49');
    expect(plan.create).toEqual([
      { actionId: 'a2', carriedFromWeek: '2026-W48' },
      { actionId: 'a3', carriedFromWeek: '2026-W48' },
    ]);
    expect(plan.markCarried).toEqual(['e2', 'e3']);
    expect(plan.incrementActionIds).toEqual(['a2', 'a3']);
  });

  it('não duplica ação que já está na semana seguinte e pula ação feita em outra semana', () => {
    const plan = planCarryOver({
      fromWeek: '2026-W48',
      entries: [
        entry({ id: 'e1', actionId: 'a1' }),
        entry({ id: 'e2', actionId: 'a2' }),
      ],
      actionIdsInTarget: ['a1'],
      doneActionIds: ['a2'],
    });
    expect(plan.create).toEqual([]);
    expect(plan.markCarried).toEqual(['e1']);
    expect(plan.incrementActionIds).toEqual([]);
  });

  it('atravessa a virada do ano', () => {
    const plan = planCarryOver({
      fromWeek: '2026-W53',
      entries: [entry({ id: 'e1', actionId: 'a1', week: '2026-W53' })],
      actionIdsInTarget: [],
    });
    expect(plan.toWeek).toBe('2027-W01');
    expect(plan.create).toHaveLength(1);
  });

  it('lista o que ainda pode ser transportado', () => {
    const list = carryableEntries(
      [
        entry({ id: 'e1', actionId: 'a1', status: 'done' }),
        entry({ id: 'e2', actionId: 'a2', status: 'partial' }),
        entry({ id: 'e3', actionId: 'a3', carriedToWeek: '2026-W49' }),
      ],
      [],
    );
    expect(list.map((e) => e.id)).toEqual(['e2']);
  });

  it('ação transportada 3 vezes pede decisão', () => {
    expect(needsCarryDecision({ carriedCount: 3, status: 'open' })).toBe(true);
    expect(needsCarryDecision({ carriedCount: 2, status: 'open' })).toBe(false);
    expect(needsCarryDecision({ carriedCount: 5, status: 'done' })).toBe(false);
  });
});

describe('ação mensurável (verbo, número, prazo)', () => {
  it('exige verbo, número positivo, o quê e prazo', () => {
    const errors = validateActionInput({ verb: ' ', quantity: '', object: '', dueDate: '' });
    expect(Object.keys(errors).sort()).toEqual(['dueDate', 'object', 'quantity', 'verb']);
    expect(validateActionInput({ verb: 'Ler', quantity: '0', object: 'páginas', dueDate: '2026-11-30' }).quantity).toBeDefined();
    expect(validateActionInput({ verb: 'Ler', quantity: 'dez', object: 'páginas', dueDate: '2026-11-30' }).quantity).toBeDefined();
    expect(validateActionInput({ verb: 'Ler', quantity: 10, object: 'páginas', dueDate: '2026-02-30' }).dueDate).toBeDefined();
  });

  it('aceita vírgula decimal', () => {
    expect(validateActionInput({ verb: 'Correr', quantity: '2,5', object: 'km', dueDate: '2026-11-30' })).toEqual({});
  });

  it('monta o texto da ação', () => {
    expect(actionLabel({ verb: 'Ligar para', quantity: 20, object: 'clientes novos' })).toBe('Ligar para 20 clientes novos');
    expect(actionLabel({ verb: 'Correr', quantity: 2.5, object: 'km' })).toBe('Correr 2,5 km');
  });
});

describe('resumo da semana', () => {
  it('conta feitas, parciais e pendentes', () => {
    expect(summarizeWeek([{ status: 'done' }, { status: 'partial' }, { status: 'pending' }, { status: 'done' }])).toEqual({
      total: 4,
      done: 2,
      partial: 1,
      pending: 1,
    });
  });

  it('escreve o resumo com singular e plural', () => {
    expect(formatWeekSummary({ total: 3, done: 1, partial: 2, pending: 0 })).toBe('1 feita · 2 parciais · 0 pendentes');
  });
});
