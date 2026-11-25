import { describe, expect, it } from 'vitest';
import { realityTest, remainingDaysInMonth } from './reality';

// Novembro de 2026: dia 1 é domingo; 21 dias úteis. 25/11 é quarta-feira.
const base = { month: '2026-11', target: 100, done: 40, dayCount: 'business' as const, today: '2026-11-25' };

describe('Teste de Realidade', () => {
  it('meta de hoje = falta ÷ dias úteis restantes (contando hoje)', () => {
    const r = realityTest(base);
    expect(r.remaining).toBe(60);
    expect(r.remainingDays).toBe(4); // qua, qui, sex, seg
    expect(r.todayTarget).toBe(15);
    expect(r.todayCounts).toBe(true);
    expect(r.percentDone).toBe(40);
    expect(r.totalDays).toBe(21);
    expect(r.phase).toBe('current');
  });

  it('em dias corridos conta sábado e domingo', () => {
    const r = realityTest({ ...base, dayCount: 'calendar' });
    expect(r.remainingDays).toBe(6);
    expect(r.todayTarget).toBe(10);
    expect(r.totalDays).toBe(30);
  });

  it('no fim de semana, em dias úteis, hoje não conta', () => {
    const r = realityTest({ ...base, today: '2026-11-28' });
    expect(r.remainingDays).toBe(1); // só segunda, 30/11
    expect(r.todayCounts).toBe(false);
    expect(r.todayTarget).toBe(60);
  });

  it('no último dia útil, a meta de hoje é tudo o que falta', () => {
    const r = realityTest({ ...base, today: '2026-11-30' });
    expect(r.remainingDays).toBe(1);
    expect(r.todayTarget).toBe(60);
  });

  it('meta atingida: falta zero, meta de hoje zero e 100%', () => {
    const r = realityTest({ ...base, done: 120 });
    expect(r.remaining).toBe(0);
    expect(r.todayTarget).toBe(0);
    expect(r.achieved).toBe(true);
    expect(r.percentDone).toBe(100);
  });

  it('mês encerrado sem atingir: sem dias restantes e meta de hoje indefinida', () => {
    const r = realityTest({ ...base, today: '2026-12-02' });
    expect(r.phase).toBe('past');
    expect(r.remainingDays).toBe(0);
    expect(r.todayTarget).toBeNull();
  });

  it('mês futuro: conta todos os dias do mês', () => {
    const r = realityTest({ ...base, month: '2026-12' });
    expect(r.phase).toBe('future');
    expect(r.remainingDays).toBe(23);
    expect(r.todayCounts).toBe(false);
  });

  it('aceita metas fracionadas', () => {
    const r = realityTest({ ...base, target: 10, done: 0, dayCount: 'calendar', today: '2026-11-28' });
    expect(r.remainingDays).toBe(3);
    expect(r.todayTarget).toBeCloseTo(3.333, 3);
  });

  it('sem meta definida não divide por zero', () => {
    const r = realityTest({ ...base, target: 0, done: 0 });
    expect(r.percentDone).toBe(0);
    expect(r.achieved).toBe(false);
    expect(r.todayTarget).toBe(0);
  });

  it('remainingDaysInMonth respeita o modo', () => {
    expect(remainingDaysInMonth('2026-11', '2026-11-01', 'business')).toBe(21);
    expect(remainingDaysInMonth('2026-11', '2026-10-15', 'calendar')).toBe(30);
    expect(remainingDaysInMonth('2026-11', '2026-12-01', 'calendar')).toBe(0);
  });
});
