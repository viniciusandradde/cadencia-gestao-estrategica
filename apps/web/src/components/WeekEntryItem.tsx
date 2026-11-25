import { setEntryStatus } from '../db/repo';
import { formatDateBR, weekNumber } from '../lib/dates';
import type { Action, Goal, WeekEntry, WeekStatus } from '../lib/types';
import { actionLabel, needsCarryDecision } from '../lib/week';
import { StatusPicker } from './StatusPicker';

interface Props {
  entry: WeekEntry;
  action: Action | undefined;
  goal: Goal | undefined;
  onRemove?: () => void;
  statusLabels?: Partial<Record<WeekStatus, string>>;
}

/** Uma ação da semana com o seletor feita / parcial / pendente. */
export function WeekEntryItem({ entry, action, goal, onRemove, statusLabels }: Props) {
  const label = action ? actionLabel(action) : 'Ação excluída';
  return (
    <li>
      <div className="item-title">{label}</div>
      <div className="meta">
        {goal && <span>Objetivo: {goal.text}</span>}
        {action && <span>· até {formatDateBR(action.dueDate)}</span>}
        {entry.carriedFromWeek && <span className="badge">veio da semana {weekNumber(entry.carriedFromWeek)}</span>}
        {entry.carriedToWeek && <span className="badge primary">transportada para a semana {weekNumber(entry.carriedToWeek)}</span>}
        {action && needsCarryDecision(action) && (
          <span className="badge warn">transportada {action.carriedCount}x: decida se quebra, delega ou descarta</span>
        )}
      </div>
      <div className="spread">
        <StatusPicker
          name={`status-${entry.id}`}
          value={entry.status}
          onChange={(status) => void setEntryStatus(entry.id, status)}
          legend={`Status de: ${label}`}
          labels={statusLabels}
        />
        {onRemove && (
          <button type="button" className="btn small ghost" onClick={onRemove} aria-label={`Tirar da semana: ${label}`}>
            Tirar da semana
          </button>
        )}
      </div>
    </li>
  );
}
