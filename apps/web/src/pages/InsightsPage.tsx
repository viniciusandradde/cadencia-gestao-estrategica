import { useState, type FormEvent } from 'react';
import { db } from '../db/db';
import { useToday } from '../db/hooks';
import { addInsight, deleteInsight, setInsightApplied } from '../db/repo';
import { useLive } from '../db/useLive';
import { formatDateBR, isValidISODate } from '../lib/dates';
import { filterInsights, type AppliedFilter, type KindFilter } from '../lib/insights';
import { INSIGHT_KINDS, INSIGHT_KIND_LABEL } from '../lib/review';
import type { InsightKind } from '../lib/types';

const KIND_HINT: Record<InsightKind, string> = {
  start: 'algo novo para fazer',
  keep: 'o que está funcionando',
  stop: 'o que atrapalha',
  accelerate: 'o que merece mais energia',
};

export function InsightsPage() {
  const today = useToday();
  const insights = useLive(() => db.insights.toArray(), []);
  const [kind, setKind] = useState<InsightKind>('start');
  const [text, setText] = useState('');
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter>('all');

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Escreva o insight.');
      return;
    }
    if (!isValidISODate(date)) {
      setError('Escolha uma data válida.');
      return;
    }
    await addInsight({ kind, text, date });
    setText('');
    setError(null);
  }

  const visible = filterInsights(insights ?? [], kindFilter, appliedFilter);

  return (
    <>
      <header className="page-header">
        <h1>Registro de Insights</h1>
        <p>Anote na hora: começar, manter, parar ou acelerar.</p>
      </header>

      <section className="card" aria-labelledby="novo-insight">
        <h2 id="novo-insight">Novo insight</h2>
        <form onSubmit={(e) => void handleAdd(e)} noValidate>
          <fieldset>
            <legend>Tipo</legend>
            <div className="segmented">
              {INSIGHT_KINDS.map((k) => (
                <label key={k} title={KIND_HINT[k]}>
                  <input type="radio" name="insight-kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
                  <span>{INSIGHT_KIND_LABEL[k]}</span>
                </label>
              ))}
            </div>
            <span className="hint">
              {INSIGHT_KIND_LABEL[kind]}: {KIND_HINT[kind]}.
            </span>
          </fieldset>
          <div className="field">
            <label htmlFor="insight-text">Insight</label>
            <textarea
              id="insight-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'insight-error' : undefined}
            />
            {error && (
              <span id="insight-error" className="error-text">
                {error}
              </span>
            )}
          </div>
          <div className="field" style={{ maxWidth: 220 }}>
            <label htmlFor="insight-date">Data</label>
            <input id="insight-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button type="submit" className="btn">
            Registrar insight
          </button>
        </form>
      </section>

      <section className="card" aria-labelledby="lista-insights">
        <h2 id="lista-insights">Insights registrados</h2>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="filter-kind">Filtrar por tipo</label>
            <select id="filter-kind" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as KindFilter)}>
              <option value="all">Todos</option>
              {INSIGHT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {INSIGHT_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-applied">Situação</label>
            <select id="filter-applied" value={appliedFilter} onChange={(e) => setAppliedFilter(e.target.value as AppliedFilter)}>
              <option value="all">Todos</option>
              <option value="open">Ainda não aplicados</option>
              <option value="applied">Aplicados</option>
            </select>
          </div>
        </div>
        <p className="muted small" aria-live="polite">
          {visible.length} de {insights?.length ?? 0} insights
        </p>
        {insights === undefined ? (
          <p className="muted">Carregando…</p>
        ) : visible.length === 0 ? (
          <p className="empty">Nenhum insight com esses filtros.</p>
        ) : (
          <ul className="list">
            {visible.map((i) => (
              <li key={i.id}>
                <div className="meta">
                  <span className="badge primary">{INSIGHT_KIND_LABEL[i.kind]}</span>
                  <span>{formatDateBR(i.date)}</span>
                  {i.applied && <span className="badge ok">aplicado</span>}
                </div>
                <p className="item-title" style={{ whiteSpace: 'pre-wrap' }}>
                  {i.text}
                </p>
                <div className="spread">
                  <label className="check">
                    <input type="checkbox" checked={i.applied} onChange={(e) => void setInsightApplied(i.id, e.target.checked)} />
                    Aplicado
                  </label>
                  <button
                    type="button"
                    className="btn small ghost"
                    onClick={() => {
                      if (window.confirm('Excluir este insight?')) void deleteInsight(i.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
