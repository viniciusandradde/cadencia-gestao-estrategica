import { useState, type FormEvent } from 'react';
import { CadernoNav } from '../components/CadernoNav';
import { db } from '../db/db';
import { useActions, useCurrentWeek, useGoals, useSettings, useToday } from '../db/hooks';
import { addAction, addGoal, addToWeek, deleteAction, deleteGoal, updateGoal } from '../db/repo';
import { useLive } from '../db/useLive';
import { formatDateBR, isoWeekKey, weekEnd } from '../lib/dates';
import type { Action, Goal, Level } from '../lib/types';
import {
  EASE_LABEL,
  LEVEL_LABEL,
  actionLabel,
  needsCarryDecision,
  sortByPriority,
  validateActionInput,
  weekLimitStatus,
  type ActionInputErrors,
} from '../lib/week';

export function GoalsPage() {
  const goals = useGoals();
  const actions = useActions();
  const currentWeek = useCurrentWeek();
  const settings = useSettings();
  const weekActionIds = useLive(
    async () => new Set((await db.weekEntries.where('week').equals(currentWeek).toArray()).map((e) => e.actionId)),
    [currentWeek],
  );
  const [text, setText] = useState('');
  const [why, setWhy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAddGoal(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Escreva o objetivo.');
      return;
    }
    await addGoal({ text, why });
    setText('');
    setWhy('');
    setError(null);
    setMessage('Objetivo criado. Agora quebre em ações mensuráveis.');
  }

  async function handleAddToWeek(action: Action) {
    const count = await addToWeek(action.id, currentWeek);
    const status = weekLimitStatus(count, settings.weeklyActionLimit);
    setMessage(
      status.over
        ? `"${actionLabel(action)}" entrou na semana atual, mas agora são ${count} ações para um limite de ${status.limit}.`
        : `"${actionLabel(action)}" entrou na semana atual.`,
    );
  }

  const sortedGoals = [...(goals ?? [])].sort((a, b) => (a.status === b.status ? 0 : a.status === 'active' ? -1 : 1));

  return (
    <>
      <header className="page-header">
        <h1>Caderno de Metas</h1>
        <p>Objetivos com o porquê e ações mensuráveis: verbo, número e prazo.</p>
      </header>
      <CadernoNav current="objetivos" />

      {message && (
        <p className="notice ok" role="status">
          {message}
        </p>
      )}

      <section className="card" aria-labelledby="novo-objetivo">
        <h2 id="novo-objetivo">Novo objetivo</h2>
        <form onSubmit={(e) => void handleAddGoal(e)} noValidate>
          <div className="field">
            <label htmlFor="goal-text">Objetivo</label>
            <input
              id="goal-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'goal-text-error' : undefined}
              placeholder="Ex.: Dobrar a carteira de clientes até junho"
            />
            {error && (
              <span id="goal-text-error" className="error-text">
                {error}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="goal-why">
              Por quê
              <span className="hint">O motivo que vai te fazer continuar quando ficar difícil.</span>
            </label>
            <textarea id="goal-why" value={why} onChange={(e) => setWhy(e.target.value)} />
          </div>
          <button type="submit" className="btn">
            Criar objetivo
          </button>
        </form>
      </section>

      {goals === undefined || actions === undefined ? (
        <p className="muted">Carregando…</p>
      ) : sortedGoals.length === 0 ? (
        <p className="empty">Nenhum objetivo ainda. Comece pelo que mais importa agora.</p>
      ) : (
        sortedGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            actions={sortByPriority(actions.filter((a) => a.goalId === goal.id))}
            inWeek={weekActionIds ?? new Set()}
            onAddToWeek={(a) => void handleAddToWeek(a)}
          />
        ))
      )}
    </>
  );
}

function GoalCard({
  goal,
  actions,
  inWeek,
  onAddToWeek,
}: {
  goal: Goal;
  actions: Action[];
  inWeek: Set<string>;
  onAddToWeek: (action: Action) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(goal.text);
  const [why, setWhy] = useState(goal.why);
  const open = actions.filter((a) => a.status === 'open');
  const headingId = `goal-${goal.id}`;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await updateGoal(goal.id, { text: text.trim(), why: why.trim() });
    setEditing(false);
  }

  async function remove() {
    if (window.confirm(`Excluir o objetivo "${goal.text}" e todas as suas ações? Isso não pode ser desfeito.`)) {
      await deleteGoal(goal.id);
    }
  }

  return (
    <section className="card" aria-labelledby={headingId} data-testid="goal-card">
      {editing ? (
        <form onSubmit={(e) => void save(e)}>
          <div className="field">
            <label htmlFor={`edit-text-${goal.id}`}>Objetivo</label>
            <input id={`edit-text-${goal.id}`} type="text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`edit-why-${goal.id}`}>Por quê</label>
            <textarea id={`edit-why-${goal.id}`} value={why} onChange={(e) => setWhy(e.target.value)} />
          </div>
          <div className="row">
            <button type="submit" className="btn small">
              Salvar
            </button>
            <button type="button" className="btn small ghost" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="card-title">
            <h2 id={headingId}>{goal.text}</h2>
            {goal.status === 'done' && <span className="badge ok">concluído</span>}
          </div>
          {goal.why && (
            <p>
              <b>Por quê:</b> {goal.why}
            </p>
          )}
          {goal.status === 'active' && open.length === 0 && (
            <p className="badge warn" style={{ marginBottom: 12 }}>
              Sem ações abertas: crie a próxima ação ou revise o objetivo.
            </p>
          )}
        </>
      )}

      <h3>Ações</h3>
      {actions.length === 0 ? (
        <p className="empty">Nenhuma ação ainda.</p>
      ) : (
        <ul className="list" style={{ marginBottom: 12 }}>
          {actions.map((a) => {
            const label = actionLabel(a);
            const isInWeek = inWeek.has(a.id);
            return (
              <li key={a.id}>
                <div className="item-title">{label}</div>
                <div className="meta">
                  <span>até {formatDateBR(a.dueDate)}</span>
                  {a.status === 'done' && <span className="badge ok">feita</span>}
                  {isInWeek && a.status === 'open' && <span className="badge primary">na semana atual</span>}
                  {a.leaderRequest && <span className="badge primary">pedido da liderança</span>}
                  <span className="badge">impacto {LEVEL_LABEL[a.impact]}</span>
                  <span className="badge">facilidade {EASE_LABEL[a.ease]}</span>
                  {needsCarryDecision(a) && (
                    <span className="badge warn">transportada {a.carriedCount}x: quebrar, delegar ou descartar?</span>
                  )}
                </div>
                <div className="row">
                  {a.status === 'open' && !isInWeek && (
                    <button type="button" className="btn small" onClick={() => onAddToWeek(a)} aria-label={`Adicionar à semana atual: ${label}`}>
                      Adicionar à semana
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn small ghost"
                    aria-label={`Excluir ação: ${label}`}
                    onClick={() => {
                      if (window.confirm(`Excluir a ação "${label}"?`)) void deleteAction(a.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {goal.status === 'active' && <NewActionForm goalId={goal.id} />}

      <div className="row" style={{ marginTop: 12 }}>
        {!editing && (
          <button type="button" className="btn small ghost" onClick={() => setEditing(true)}>
            Editar objetivo
          </button>
        )}
        <button
          type="button"
          className="btn small ghost"
          onClick={() => void updateGoal(goal.id, { status: goal.status === 'active' ? 'done' : 'active' })}
        >
          {goal.status === 'active' ? 'Marcar como concluído' : 'Reabrir objetivo'}
        </button>
        <button type="button" className="btn small ghost" onClick={() => void remove()}>
          Excluir objetivo
        </button>
      </div>
    </section>
  );
}

function NewActionForm({ goalId }: { goalId: string }) {
  const today = useToday();
  const [verb, setVerb] = useState('');
  const [quantity, setQuantity] = useState('');
  const [object, setObject] = useState('');
  const [dueDate, setDueDate] = useState(() => weekEnd(isoWeekKey(today)));
  const [impact, setImpact] = useState<Level>(2);
  const [ease, setEase] = useState<Level>(2);
  const [leaderRequest, setLeaderRequest] = useState(false);
  const [errors, setErrors] = useState<ActionInputErrors>({});
  const id = (name: string) => `${name}-${goalId}`;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateActionInput({ verb, quantity, object, dueDate });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await addAction(goalId, { verb, quantity, object, dueDate, impact, ease, leaderRequest });
    setVerb('');
    setQuantity('');
    setObject('');
    setLeaderRequest(false);
  }

  const err = (field: keyof ActionInputErrors) =>
    errors[field] ? (
      <span id={id(`${field}-error`)} className="error-text">
        {errors[field]}
      </span>
    ) : null;
  const invalid = (field: keyof ActionInputErrors) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? id(`${field}-error`) : undefined,
  });

  return (
    <details>
      <summary>Nova ação mensurável</summary>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <p className="hint" style={{ marginBottom: 12 }}>
          Verbo + número + prazo. Ex.: <i>Ligar para</i> · <i>20</i> · <i>clientes novos</i> · até sexta.
        </p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor={id('verb')}>Verbo</label>
            <input id={id('verb')} type="text" value={verb} onChange={(e) => setVerb(e.target.value)} placeholder="Ligar para" {...invalid('verb')} />
            {err('verb')}
          </div>
          <div className="field">
            <label htmlFor={id('quantity')}>Número</label>
            <input
              id={id('quantity')}
              type="text"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="20"
              {...invalid('quantity')}
            />
            {err('quantity')}
          </div>
          <div className="field">
            <label htmlFor={id('object')}>O quê</label>
            <input id={id('object')} type="text" value={object} onChange={(e) => setObject(e.target.value)} placeholder="clientes novos" {...invalid('object')} />
            {err('object')}
          </div>
          <div className="field">
            <label htmlFor={id('due')}>Prazo</label>
            <input id={id('due')} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} {...invalid('dueDate')} />
            {err('dueDate')}
          </div>
          <div className="field">
            <label htmlFor={id('impact')}>Impacto</label>
            <select id={id('impact')} value={impact} onChange={(e) => setImpact(Number(e.target.value) as Level)}>
              <option value={3}>Alto</option>
              <option value={2}>Médio</option>
              <option value={1}>Baixo</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor={id('ease')}>
              Facilidade <span className="hint">Só desempata.</span>
            </label>
            <select id={id('ease')} value={ease} onChange={(e) => setEase(Number(e.target.value) as Level)}>
              <option value={3}>Fácil</option>
              <option value={2}>Média</option>
              <option value={1}>Difícil</option>
            </select>
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={leaderRequest} onChange={(e) => setLeaderRequest(e.target.checked)} />
          Pedido da liderança
        </label>
        <button type="submit" className="btn">
          Adicionar ação
        </button>
      </form>
    </details>
  );
}
