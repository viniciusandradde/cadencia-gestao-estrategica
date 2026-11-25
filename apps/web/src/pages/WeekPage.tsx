import { useState } from 'react';
import { CadernoNav } from '../components/CadernoNav';
import { WeekEntryItem } from '../components/WeekEntryItem';
import { WeekNav } from '../components/WeekNav';
import { useActions, useCurrentWeek, useGoals, useSettings, useWeekEntries } from '../db/hooks';
import { addToWeek, carryOver, removeFromWeek } from '../db/repo';
import { formatDateBR, formatWeekRange, shiftWeek, weekNumber } from '../lib/dates';
import { LEVEL_LABEL, actionLabel, carryableEntries, formatWeekSummary, sortByPriority, summarizeWeek, weekLimitStatus } from '../lib/week';
import { href } from '../router';

export function WeekPage() {
  const currentWeek = useCurrentWeek();
  const [week, setWeek] = useState(currentWeek);
  const prevWeek = shiftWeek(week, -1);
  const nextWeek = shiftWeek(week, 1);
  const settings = useSettings();
  const entries = useWeekEntries(week);
  const prevEntries = useWeekEntries(prevWeek);
  const actions = useActions();
  const goals = useGoals();
  const [message, setMessage] = useState<string | null>(null);

  const changeWeek = (w: string) => {
    setWeek(w);
    setMessage(null);
  };

  const actionMap = new Map((actions ?? []).map((a) => [a.id, a]));
  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));
  const doneIds = (actions ?? []).filter((a) => a.status === 'done').map((a) => a.id);
  const list = entries ?? [];
  const inWeek = new Set(list.map((e) => e.actionId));
  const available = sortByPriority(
    (actions ?? []).filter((a) => a.status === 'open' && !inWeek.has(a.id) && goalMap.get(a.goalId)?.status !== 'done'),
  );
  const summary = summarizeWeek(list);
  const limit = weekLimitStatus(summary.total, settings.weeklyActionLimit);
  const fromPrev = carryableEntries(prevEntries ?? [], doneIds);
  const toNext = carryableEntries(list, doneIds);

  async function handleAdd(actionId: string) {
    const label = actionLabel(actionMap.get(actionId)!);
    const count = await addToWeek(actionId, week);
    const status = weekLimitStatus(count, settings.weeklyActionLimit);
    setMessage(
      status.over
        ? `"${label}" entrou na semana, mas agora são ${count} ações para um limite de ${status.limit}.`
        : `"${label}" entrou na semana.`,
    );
  }

  async function handleCarry(from: string) {
    const { carried, toWeek } = await carryOver(from);
    setMessage(
      carried === 0
        ? 'Nada novo para transportar.'
        : `${carried} ${carried === 1 ? 'ação transportada' : 'ações transportadas'} para a semana ${weekNumber(toWeek)} (${formatWeekRange(toWeek)}).`,
    );
  }

  async function handleRemove(entryId: string) {
    await removeFromWeek(entryId);
    setMessage('Ação tirada da semana. Ela continua no objetivo.');
  }

  return (
    <>
      <header className="page-header">
        <h1>Caderno de Metas</h1>
        <p>Escolha poucas ações por semana e marque o que foi feito.</p>
      </header>
      <CadernoNav current="semana" />
      <WeekNav week={week} currentWeek={currentWeek} onChange={changeWeek} />

      {message && (
        <p className="notice ok" role="status">
          {message}
        </p>
      )}

      {fromPrev.length > 0 && (
        <section className="notice info" aria-labelledby="transporte-anterior">
          <strong id="transporte-anterior">
            A semana {weekNumber(prevWeek)} tem {fromPrev.length} {fromPrev.length === 1 ? 'ação não concluída' : 'ações não concluídas'}.
          </strong>
          <p>Pendentes e parciais podem vir para esta semana.</p>
          <button type="button" className="btn" onClick={() => void handleCarry(prevWeek)}>
            Trazer para esta semana
          </button>
        </section>
      )}

      <section className="card" aria-labelledby="acoes-semana">
        <div className="card-title">
          <h2 id="acoes-semana">Ações da semana</h2>
          <span className={`badge${limit.over ? ' warn' : ''}`} data-testid="contador-limite">
            {limit.count} de {limit.limit}
          </span>
        </div>
        <p className="muted small">
          {formatWeekSummary(summary)}
        </p>
        {limit.over && (
          <div className="notice" role="alert">
            <strong>Passou do limite de {limit.limit} ações por semana.</strong>
            <p>
              Esta semana tem {limit.count} ações ({limit.excess} a mais). Priorize por impacto e pedido da liderança e tire
              o que não couber, ou ajuste o limite em <a href={href('configuracoes')}>Configurações</a>.
            </p>
          </div>
        )}
        {entries === undefined ? (
          <p className="muted">Carregando…</p>
        ) : list.length === 0 ? (
          <p className="empty">Nenhuma ação nesta semana ainda.</p>
        ) : (
          <ul className="list">
            {list.map((entry) => {
              const action = actionMap.get(entry.actionId);
              return (
                <WeekEntryItem
                  key={entry.id}
                  entry={entry}
                  action={action}
                  goal={action ? goalMap.get(action.goalId) : undefined}
                  onRemove={() => void handleRemove(entry.id)}
                />
              );
            })}
          </ul>
        )}
        {toNext.length > 0 && (
          <p style={{ marginTop: 16 }}>
            <button type="button" className="btn secondary block" onClick={() => void handleCarry(week)}>
              Transportar {toNext.length} não {toNext.length === 1 ? 'concluída' : 'concluídas'} para a semana {weekNumber(nextWeek)}
            </button>
          </p>
        )}
      </section>

      <section className="card" aria-labelledby="escolher-acoes">
        <h2 id="escolher-acoes">Escolher ações para esta semana</h2>
        <p className="muted small">
          Ordem sugerida: pedido da liderança e impacto primeiro, depois o prazo; a facilidade só desempata.
          {limit.remaining > 0 ? ` Cabem mais ${limit.remaining} dentro do limite.` : ' O limite já foi atingido.'}
        </p>
        {actions === undefined ? (
          <p className="muted">Carregando…</p>
        ) : available.length === 0 ? (
          <p className="empty">
            Nenhuma ação aberta fora desta semana. Crie ações em <a href={href('objetivos')}>Objetivos e ações</a>.
          </p>
        ) : (
          <ul className="list">
            {available.map((a) => {
              const label = actionLabel(a);
              return (
                <li key={a.id}>
                  <div className="item-title">{label}</div>
                  <div className="meta">
                    <span>Objetivo: {goalMap.get(a.goalId)?.text ?? '—'}</span>
                    <span>· até {formatDateBR(a.dueDate)}</span>
                    {a.leaderRequest && <span className="badge primary">pedido da liderança</span>}
                    <span className="badge">impacto {LEVEL_LABEL[a.impact]}</span>
                    {a.carriedCount > 0 && <span className="badge">transportada {a.carriedCount}x</span>}
                  </div>
                  <button type="button" className="btn small" onClick={() => void handleAdd(a.id)} aria-label={`Adicionar à semana: ${label}`}>
                    Adicionar à semana
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
