import { describe, expect, it } from 'vitest';
import {
  addDays,
  countDays,
  formatWeekLabel,
  isValidISODate,
  isValidWeekKey,
  isoWeekKey,
  isoWeekday,
  monthEnd,
  shiftMonth,
  shiftWeek,
  todayISO,
  weekEnd,
  weekStart,
} from './dates';

describe('semana ISO (segunda a domingo)', () => {
  it('calcula a semana de uma data comum', () => {
    expect(isoWeekKey('2026-11-25')).toBe('2026-W48');
    expect(isoWeekKey('2026-11-23')).toBe('2026-W48'); // segunda
    expect(isoWeekKey('2026-11-29')).toBe('2026-W48'); // domingo
    expect(isoWeekKey('2026-11-30')).toBe('2026-W49');
  });

  it('trata a virada de ano conforme a ISO 8601', () => {
    expect(isoWeekKey('2024-12-30')).toBe('2025-W01');
    expect(isoWeekKey('2021-01-03')).toBe('2020-W53');
    expect(isoWeekKey('2026-01-01')).toBe('2026-W01');
    expect(isoWeekKey('2027-01-01')).toBe('2026-W53');
    expect(isoWeekKey('2027-01-04')).toBe('2027-W01');
  });

  it('devolve início (segunda) e fim (domingo) da semana', () => {
    expect(weekStart('2026-W48')).toBe('2026-11-23');
    expect(weekEnd('2026-W48')).toBe('2026-11-29');
    expect(weekStart('2025-W01')).toBe('2024-12-30');
    expect(weekStart('2026-W53')).toBe('2026-12-28');
    expect(isoWeekday(weekStart('2026-W10'))).toBe(1);
  });

  it('avança e volta semanas atravessando o ano', () => {
    expect(shiftWeek('2026-W48', 1)).toBe('2026-W49');
    expect(shiftWeek('2026-W53', 1)).toBe('2027-W01');
    expect(shiftWeek('2026-W01', -1)).toBe('2025-W52');
  });

  it('valida chaves de semana', () => {
    expect(isValidWeekKey('2026-W53')).toBe(true);
    expect(isValidWeekKey('2025-W53')).toBe(false); // 2025 tem 52 semanas
    expect(isValidWeekKey('2026-W00')).toBe(false);
    expect(isValidWeekKey('2026-48')).toBe(false);
    expect(isValidWeekKey(48)).toBe(false);
  });

  it('formata o rótulo da semana em pt-BR', () => {
    expect(formatWeekLabel('2026-W48')).toBe('Semana 48 · 23/11 a 29/11/2026');
  });
});

describe('datas civis', () => {
  it('soma dias atravessando mês e ano', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('rejeita datas impossíveis', () => {
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
    expect(isValidISODate('25/11/2026')).toBe(false);
    expect(isValidISODate('2026-11-25')).toBe(true);
    expect(() => addDays('2026-02-30', 1)).toThrow();
  });

  it('usa a data local do aparelho para "hoje"', () => {
    expect(todayISO(new Date(2026, 10, 25, 23, 59))).toBe('2026-11-25');
    expect(todayISO(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });

  it('calcula fim de mês e muda de mês', () => {
    expect(monthEnd('2024-02')).toBe('2024-02-29');
    expect(monthEnd('2026-02')).toBe('2026-02-28');
    expect(monthEnd('2026-11')).toBe('2026-11-30');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
});

describe('contagem de dias', () => {
  it('conta dias úteis (segunda a sexta) e corridos, inclusive nas pontas', () => {
    expect(countDays('2026-11-01', '2026-11-30', 'business')).toBe(21);
    expect(countDays('2026-11-01', '2026-11-30', 'calendar')).toBe(30);
    expect(countDays('2026-11-25', '2026-11-30', 'business')).toBe(4);
    expect(countDays('2026-11-25', '2026-11-30', 'calendar')).toBe(6);
    expect(countDays('2026-12-01', '2026-12-31', 'business')).toBe(23);
  });

  it('conta um único dia e devolve zero com intervalo invertido', () => {
    expect(countDays('2026-11-28', '2026-11-28', 'business')).toBe(0); // sábado
    expect(countDays('2026-11-27', '2026-11-27', 'business')).toBe(1); // sexta
    expect(countDays('2026-11-30', '2026-11-01', 'calendar')).toBe(0);
  });

  it('bate com a contagem dia a dia em intervalos longos', () => {
    let day = '2026-01-01';
    let expected = 0;
    while (day <= '2026-12-31') {
      if (isoWeekday(day) <= 5) expected++;
      day = addDays(day, 1);
    }
    expect(countDays('2026-01-01', '2026-12-31', 'business')).toBe(expected);
  });
});
