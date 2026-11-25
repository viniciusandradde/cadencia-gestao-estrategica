import { DataNotice } from '../components/DataNotice';
import { WeekEntryItem } from '../components/WeekEntryItem';
import { db } from '../db/db';
import { useActions, useGoals, useSettings, useToday, useWeekEntries } from '../db/hooks';
import { useLive } from '../db/useLive';
import { WEEKDAYS, formatDateBR, formatWeekLabel, isoWeekKey, isoWeekday, monthKey } from '../lib/dates';
import { formatNumber, realityTest } from '../lib/reality';
import { reviewReminder } from '../lib/review';
import { summarizeWeek, weekLimitStatus } from '../lib/week';
import { href } from '../router';

const BACKUP_STALE_DAYS = 7;

export function HomePage() {
  const today = useToday();
  const week = isoWeekKey(today);
  const month = monthKey(today);
  const settings = useSettings();
  const entries = useWeekEntries(week);
  const actions = useActions();
  const goals = useGoals();
  const reality = useLive(async () => ({ value: await db.realityTests.where('month').equals(month).first() }), [month]);
  const review = useLive(async () => ({ value: await db.weeklyReviews.where('week').equals(week).first() }), [week]);

  const actionMap = new Map((actions ?? []).map((a) => [a.id, a]));
  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));
  const summary = summarizeWeek(entries ?? []);
  const limit = weekLimitStatus(summary.total, settings.weeklyActionLimit);
  const reminder = review ? reviewReminder(today, settings.reviewWeekday, !!review.value) : null;

  const backupAgeDays = settings.lastBackupAt
    ? (Date.now() - new Date(settings.lastBackupAt).getTime()) / 86_400_000
    : Number.POSITIVE_INFINITY;
  const backupStale = backupAgeDays > BACKUP_STALE_DAYS;

  const r = reality?.value;
  const result = r && r.target > 0 ? realityTest({ month, target: r.target, done: r.done, dayCount: r.dayCount, today }) : null;

  return (
    <>
      <header className="page-header">
        <h1>Início</h1>
        <p>
          Hoje é {WEEKDAYS[isoWeekday(today)]}, {formatDateBR(today)}.
        </p>
      </header>

      {backupStale && <DataNotice lastBackupAt={settings.lastBackupAt} />}

      {reminder && (
        <section className="notice info" aria-labelledby="lembrete-avaliacao">
          <strong id="lembrete-avaliacao">
            {reminder === 'today' ? 'Hoje é dia da Avaliação Semanal.' : 'A Avaliação Semanal desta semana ainda não foi feita.'}
          </strong>
          <p>São 15 minutos: o que fiz, o que aprendi, o impacto no mês e no ano, e a decisão de ajustar ou acelerar.</p>
          <p>
            <a className="btn" href={href('avaliacao')}>
              Fazer a avaliação
            </a>
          </p>
        </section>
      )}

      <section className="card" aria-labelledby="meta-hoje">
        <div className="card-title">
          <h2 id="meta-hoje">Meta de hoje</h2>
          <a href={href('realidade')} className="small">
            Teste de Realidade
          </a>
        </div>
        {!reality ? (
          <p className="muted">Carregando…</p>
        ) : !result || !r ? (
          <p>
            Defina a meta do mês no <a href={href('realidade')}>Teste de Realidade</a> para ver quanto fazer hoje.
          </p>
        ) : result.achieved ? (
          <p>
            <strong>Meta do mês atingida!</strong> {formatNumber(r.done)} de {formatNumber(r.target)} {r.unit}.
          </p>
        ) : result.todayTarget === null ? (
          <p>Não há mais dias no mês para esta meta. Faltaram {formatNumber(result.remaining)} {r.unit}.</p>
        ) : (
          <>
            <div className="big-number" data-testid="meta-hoje-valor">
              {formatNumber(result.todayTarget)}
              <span className="unit">{r.unit}</span>
            </div>
            <p className="muted small">
              Faltam {formatNumber(result.remaining)} {r.unit} em {result.remainingDays}{' '}
              {r.dayCount === 'business' ? 'dias úteis' : 'dias'}
              {result.todayCounts ? ', contando hoje.' : '. Hoje não entra na conta.'}
            </p>
          </>
        )}
      </section>

      <section className="card" aria-labelledby="semana-atual">
        <div className="card-title">
          <h2 id="semana-atual">Semana atual</h2>
          <a href={href('semana')} className="small">
            Abrir o Caderno de Metas
          </a>
        </div>
        <p className="muted small">
          {formatWeekLabel(week)} · {summary.done} de {summary.total} {summary.done === 1 ? 'feita' : 'feitas'} · limite {limit.limit}
        </p>
        {limit.over && (
          <p className="notice" role="status">
            Esta semana tem {limit.count} ações, acima do limite de {limit.limit}. Poucas ações, escolhidas por impacto,
            rendem mais.
          </p>
        )}
        {entries === undefined ? (
          <p className="muted">Carregando…</p>
        ) : entries.length === 0 ? (
          <p>
            Nenhuma ação escolhida para esta semana. <a href={href('semana')}>Escolher ações</a>
          </p>
        ) : (
          <ul className="list">
            {entries.map((entry) => {
              const action = actionMap.get(entry.actionId);
              return <WeekEntryItem key={entry.id} entry={entry} action={action} goal={action ? goalMap.get(action.goalId) : undefined} />;
            })}
          </ul>
        )}
      </section>

      {!backupStale && <DataNotice lastBackupAt={settings.lastBackupAt} />}
    </>
  );
}
