import { describe, expect, it } from 'vitest';
import { formatTimer, reviewReminder } from './review';

// 27/11/2026 é sexta-feira.
describe('lembrete da Avaliação Semanal', () => {
  it('lembra no dia configurado (padrão sexta)', () => {
    expect(reviewReminder('2026-11-27', 5, false)).toBe('today');
  });

  it('continua lembrando depois do dia, na mesma semana, se não foi feita', () => {
    expect(reviewReminder('2026-11-28', 5, false)).toBe('overdue');
    expect(reviewReminder('2026-11-29', 5, false)).toBe('overdue');
  });

  it('não lembra antes do dia nem quando já foi feita', () => {
    expect(reviewReminder('2026-11-26', 5, false)).toBeNull();
    expect(reviewReminder('2026-11-27', 5, true)).toBeNull();
    expect(reviewReminder('2026-11-30', 5, false)).toBeNull(); // nova semana começou
  });

  it('funciona com outros dias configurados', () => {
    expect(reviewReminder('2026-11-29', 7, false)).toBe('today');
    expect(reviewReminder('2026-11-23', 1, false)).toBe('today');
    expect(reviewReminder('2026-11-24', 1, false)).toBe('overdue');
  });
});

describe('cronômetro', () => {
  it('formata minutos e segundos', () => {
    expect(formatTimer(900)).toBe('15:00');
    expect(formatTimer(59)).toBe('00:59');
    expect(formatTimer(-3)).toBe('00:00');
  });
});
