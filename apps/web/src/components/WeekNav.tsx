import { formatWeekRange, shiftWeek, weekNumber } from '../lib/dates';
import type { WeekKey } from '../lib/types';

interface Props {
  week: WeekKey;
  currentWeek: WeekKey;
  onChange: (week: WeekKey) => void;
}

/** Navegação entre semanas (segunda a domingo). */
export function WeekNav({ week, currentWeek, onChange }: Props) {
  const isCurrent = week === currentWeek;
  return (
    <div>
      <div className="week-nav">
        <button type="button" className="btn ghost" onClick={() => onChange(shiftWeek(week, -1))} aria-label="Semana anterior">
          ‹
        </button>
        <div className="label-center" aria-live="polite">
          Semana {weekNumber(week)}
          {isCurrent ? ' (atual)' : ''}
          <small>{formatWeekRange(week)}</small>
        </div>
        <button type="button" className="btn ghost" onClick={() => onChange(shiftWeek(week, 1))} aria-label="Próxima semana">
          ›
        </button>
      </div>
      {!isCurrent && (
        <p className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn small secondary" onClick={() => onChange(currentWeek)}>
            Voltar para a semana atual
          </button>
        </p>
      )}
    </div>
  );
}
