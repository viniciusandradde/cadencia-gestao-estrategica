import { WEEK_STATUS_LABEL } from '../lib/week';
import type { WeekStatus } from '../lib/types';

const ORDER: WeekStatus[] = ['done', 'partial', 'pending'];

interface Props {
  name: string;
  value: WeekStatus;
  onChange: (status: WeekStatus) => void;
  legend: string;
  labels?: Partial<Record<WeekStatus, string>>;
}

/** Feita, parcial ou pendente, como grupo de rádios acessível. */
export function StatusPicker({ name, value, onChange, legend, labels }: Props) {
  return (
    <fieldset className="segmented status">
      <legend className="visually-hidden">{legend}</legend>
      {ORDER.map((status) => (
        <label key={status}>
          <input
            type="radio"
            name={name}
            value={status}
            checked={value === status}
            onChange={() => onChange(status)}
          />
          <span>{labels?.[status] ?? WEEK_STATUS_LABEL[status]}</span>
        </label>
      ))}
    </fieldset>
  );
}
