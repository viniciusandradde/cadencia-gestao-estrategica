import { useEffect, useState, type FormEvent } from 'react';
import { Timer } from '../components/Timer';
import { WeekEntryItem } from '../components/WeekEntryItem';
import { WeekNav } from '../components/WeekNav';
import { db } from '../db/db';
import { useActions, useCurrentWeek, useGoals, useSettings, useToday, useWeekEntries } from '../db/hooks';
import { carryOver, saveReview } from '../db/repo';
import { useLive } from '../db/useLive';
import { WEEKDAYS, formatDateBR, formatWeekLabel, formatWeekRange, shiftWeek, weekNumber } from '../lib/dates';
import { DECISION_LABEL } from '../lib/review';
import type { ReviewDecision, ReviewItem, WeekStatus } from '../lib/types';
import { WEEK_STATUS_LABEL, actionLabel, carryableEntries, formatWeekSummary, summarizeWeek } from '../lib/week';

const REVIEW_STATUS_LABELS: Record<WeekStatus, string> = { done: 'Fiz', partial: 'Fiz em parte', pending: 'Não fiz' };

export function ReviewPage() {
  const today = useToday();
  const currentWeek = useCurrentWeek();
  const [week, setWeek] = useState(currentWeek);
  const settings = useSettings();
  const entries = useWeekEntries(week);
  const actions = useActions();
  const goals = useGoals();
  const stored = useLive(async () => ({ value: await db.weeklyReviews.where('week').equals(week).first() }), [week]);
  const history = useLive(() => db.weeklyReviews.orderBy('week').reverse().toArray(), []);

  const [learned, setLearned] = useState('');
  const [notDone, setNotDone] = useState('');
  const [impactMonth, setImpactMonth] = useState('');
  const [impactYear, setImpactYear] = useState('');
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stored || loadedFor === week) return;
    const r = stored.value;
    setLearned(r?.learned ?? '');
    setNotDone(r?.notDone ?? '');
    setImpactMonth(r?.impactMonth ?? '');
    setImpactYear(r?.impactYear ?? '');
    setDecision(r?.decision ?? null);
    setDecisionNote(r?.decisionNote ?? '');
    setLoadedFor(week);
  }, [stored, week, loadedFor]);

  const changeWeek = (w: string) => {
    setWeek(w);
    setLoadedFor(null);
    setMessage(null);
  };

  const actionMap = new Map((actions ?? []).map((a) => [a.id, a]));
  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));
  const list = entries ?? [];
  const summary = summarizeWeek(list);
  const doneIds = (actions ?? []).filter((a) => a.status === 'done').map((a) => a.id);
  const toCarry = carryableEntries(list, doneIds);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const items: ReviewItem[] = list.map((entry) => {
      const action = actionMap.get(entry.actionId);
      return { actionId: entry.actionId, label: action ? actionLabel(action) : 'Ação excluída', status: entry.status };
    });
    await saveReview(week, today, { learned, notDone, impactMonth, impactYear, decision, decisionNote }, items);
    setMessage(`Avaliação da semana ${weekNumber(week)} salva.`);
  }

  async function handleCarry() {
    const { carried, toWeek } = await carryOver(week);
    setMessage(`${carried} ${carried === 1 ? 'ação transportada' : 'ações transportadas'} para a semana ${weekNumber(toWeek)}.`);
  }

  return (
    <>
      <header className="page-header">
        <h1>Avaliação Semanal</h1>
        <p>
          15 minutos, de preferência na {WEEKDAYS[settings.reviewWeekday]}: o que fiz, o que aprendi, o impacto e a decisão.
        </p>
      </header>
      <WeekNav week={week} currentWeek={currentWeek} onChange={changeWeek} />
      <Timer />

      {stored?.value && (
        <p className="notice info">
          Esta semana já tem avaliação (salva em {formatDateBR(stored.value.date)}). Você pode revisar e salvar de novo.
        </p>
      )}

      <form onSubmit={(e) => void handleSave(e)}>
        <section className="card" aria-labelledby="fez">
          <h2 id="fez">1. Para cada ação da semana: fiz?</h2>
          {entries === undefined ? (
            <p className="muted">Carregando…</p>
          ) : list.length === 0 ? (
            <p className="empty">Nenhuma ação nesta semana.</p>
          ) : (
            <>
              <p className="muted small">
                {formatWeekSummary(summary)}. A resposta atualiza o Caderno de Metas.
              </p>
              <ul className="list">
                {list.map((entry) => {
                  const action = actionMap.get(entry.actionId);
                  return (
                    <WeekEntryItem
                      key={entry.id}
                      entry={entry}
                      action={action}
                      goal={action ? goalMap.get(action.goalId) : undefined}
                      statusLabels={REVIEW_STATUS_LABELS}
                    />
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <section className="card" aria-labelledby="reflexao">
          <h2 id="reflexao">2. Reflexão</h2>
          <div className="field">
            <label htmlFor="rv-learned">O que aprendi?</label>
            <textarea id="rv-learned" value={learned} onChange={(e) => setLearned(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="rv-notdone">O que não fiz e por quê?</label>
            <textarea id="rv-notdone" value={notDone} onChange={(e) => setNotDone(e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="rv-month">Impacto no mês</label>
              <textarea id="rv-month" value={impactMonth} onChange={(e) => setImpactMonth(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="rv-year">Impacto no ano</label>
              <textarea id="rv-year" value={impactYear} onChange={(e) => setImpactYear(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card" aria-labelledby="decisao">
          <h2 id="decisao">3. Decisão</h2>
          <fieldset>
            <legend>Na próxima semana, eu…</legend>
            <div className="segmented">
              {(Object.keys(DECISION_LABEL) as ReviewDecision[]).map((d) => (
                <label key={d}>
                  <input type="radio" name="rv-decision" value={d} checked={decision === d} onChange={() => setDecision(d)} />
                  <span>{DECISION_LABEL[d]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="rv-note">O que muda?</label>
            <textarea id="rv-note" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
          </div>
          <button type="submit" className="btn block">
            Salvar avaliação
          </button>
        </section>
      </form>

      {message && (
        <p className="notice ok" role="status">
          {message}
        </p>
      )}

      {toCarry.length > 0 && (
        <section className="card" aria-labelledby="transportar">
          <h2 id="transportar">Transportar o que não fechou</h2>
          <p className="muted small">
            {toCarry.length} {toCarry.length === 1 ? 'ação pendente ou parcial pode' : 'ações pendentes ou parciais podem'} ir para a semana{' '}
            {weekNumber(shiftWeek(week, 1))}.
          </p>
          <button type="button" className="btn secondary" onClick={() => void handleCarry()}>
            Transportar para a próxima semana
          </button>
        </section>
      )}

      <section className="card" aria-labelledby="historico">
        <h2 id="historico">Histórico das avaliações</h2>
        {history === undefined ? (
          <p className="muted">Carregando…</p>
        ) : history.length === 0 ? (
          <p className="empty">Nenhuma avaliação salva ainda.</p>
        ) : (
          <ul className="list">
            {history.map((r) => {
              const s = summarizeWeek(r.items);
              return (
                <li key={r.id}>
                  <details>
                    <summary>
                      {formatWeekLabel(r.week)} · {s.done}/{s.total} feitas
                      {r.decision ? ` · ${DECISION_LABEL[r.decision]}` : ''}
                    </summary>
                    <div className="small">
                      <p className="muted">
                        Feita em {formatDateBR(r.date)} · semana de {formatWeekRange(r.week)}
                      </p>
                      {r.items.length > 0 && (
                        <ul>
                          {r.items.map((item) => (
                            <li key={item.actionId}>
                              {item.label}: {WEEK_STATUS_LABEL[item.status].toLowerCase()}
                            </li>
                          ))}
                        </ul>
                      )}
                      <HistoryField label="O que aprendi" value={r.learned} />
                      <HistoryField label="O que não fiz e por quê" value={r.notDone} />
                      <HistoryField label="Impacto no mês" value={r.impactMonth} />
                      <HistoryField label="Impacto no ano" value={r.impactYear} />
                      <HistoryField label="O que muda" value={r.decisionNote} />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function HistoryField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p style={{ whiteSpace: 'pre-wrap' }}>
      <b>{label}:</b> {value}
    </p>
  );
}
