import { useEffect, useState, type FormEvent } from 'react';
import { db } from '../db/db';
import { useSettings, useToday } from '../db/hooks';
import { saveRealityTest } from '../db/repo';
import { useLive } from '../db/useLive';
import { formatMonthLabel, monthKey, shiftMonth } from '../lib/dates';
import { formatNumber, realityTest } from '../lib/reality';
import type { DayCount } from '../lib/types';

const toNumber = (value: string) => {
  const n = Number(value.replace(',', '.'));
  return value.trim() === '' || !Number.isFinite(n) ? null : n;
};

export function RealityPage() {
  const today = useToday();
  const currentMonth = monthKey(today);
  const [month, setMonth] = useState(currentMonth);
  const settings = useSettings();
  const stored = useLive(async () => ({ value: await db.realityTests.where('month').equals(month).first() }), [month]);

  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [done, setDone] = useState('');
  const [dayCount, setDayCount] = useState<DayCount>(settings.defaultDayCount);
  const [increment, setIncrement] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carrega o formulário uma vez por mês exibido.
  useEffect(() => {
    if (!stored || loadedFor === month) return;
    const r = stored.value;
    setTarget(r && r.target > 0 ? String(r.target) : '');
    setUnit(r?.unit ?? '');
    setDone(r ? String(r.done) : '');
    setDayCount(r?.dayCount ?? settings.defaultDayCount);
    setLoadedFor(month);
    setDirty(false);
  }, [stored, month, loadedFor, settings.defaultDayCount]);

  const changeMonth = (m: string) => {
    setMonth(m);
    setLoadedFor(null);
    setMessage(null);
    setError(null);
  };

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
    setMessage(null);
  };

  async function persist(nextDone: number) {
    const t = toNumber(target) ?? 0;
    await saveRealityTest(month, { target: t, unit, done: nextDone, dayCount });
    setDone(String(nextDone));
    setDirty(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const t = toNumber(target);
    const d = toNumber(done) ?? 0;
    if (t === null || t <= 0) {
      setError('Informe a meta do mês (um número maior que zero).');
      return;
    }
    if (d < 0) {
      setError('O "já feito" não pode ser negativo.');
      return;
    }
    setError(null);
    await persist(d);
    setMessage('Teste de Realidade salvo.');
  }

  async function handleIncrement(e: FormEvent) {
    e.preventDefault();
    const amount = toNumber(increment);
    if (amount === null || amount === 0) {
      setError('Informe quanto somar ao feito.');
      return;
    }
    setError(null);
    const next = Math.max(0, (toNumber(done) ?? 0) + amount);
    await persist(next);
    setIncrement('');
    setMessage(`Somado: ${formatNumber(amount)}. Já feito agora: ${formatNumber(next)}.`);
  }

  const t = toNumber(target) ?? 0;
  const d = toNumber(done) ?? 0;
  const result = t > 0 ? realityTest({ month, target: t, done: d, dayCount, today }) : null;
  const dayWord = dayCount === 'business' ? 'dias úteis' : 'dias corridos';

  return (
    <>
      <header className="page-header">
        <h1>Teste de Realidade</h1>
        <p>Quanto falta para a meta do mês e quanto fazer hoje.</p>
      </header>

      <div className="week-nav">
        <button type="button" className="btn ghost" onClick={() => changeMonth(shiftMonth(month, -1))} aria-label="Mês anterior">
          ‹
        </button>
        <div className="label-center" aria-live="polite">
          {formatMonthLabel(month)}
          {month === currentMonth ? ' (atual)' : ''}
        </div>
        <button type="button" className="btn ghost" onClick={() => changeMonth(shiftMonth(month, 1))} aria-label="Próximo mês">
          ›
        </button>
      </div>

      <section className="card" aria-labelledby="resultado">
        <h2 id="resultado">Meta de hoje</h2>
        {!result ? (
          <p className="muted">Preencha a meta do mês abaixo para ver o cálculo.</p>
        ) : (
          <>
            {result.achieved ? (
              <p className="big-number">Meta atingida!</p>
            ) : result.todayTarget === null ? (
              <p>Não há mais {dayWord} neste mês. Faltaram {formatNumber(result.remaining)} {unit}.</p>
            ) : (
              <>
                <div className="big-number" data-testid="meta-hoje">
                  {formatNumber(result.todayTarget)}
                  <span className="unit">{unit}</span>
                </div>
                {!Number.isInteger(result.todayTarget) && (
                  <p className="muted small">Arredondando para cima: {Math.ceil(result.todayTarget)} {unit}.</p>
                )}
                <p className="muted small">
                  Falta ÷ dias restantes = {formatNumber(result.remaining)} ÷ {result.remainingDays}.
                  {result.phase === 'current' && !result.todayCounts && ' Hoje não é dia útil: este é o ritmo para cada dia útil que resta.'}
                  {result.phase === 'future' && ' Mês futuro: ritmo por dia a partir do início do mês.'}
                </p>
              </>
            )}
            <dl className="stats">
              <div className="stat">
                <dt>Meta do mês</dt>
                <dd>
                  {formatNumber(t)} {unit}
                </dd>
              </div>
              <div className="stat">
                <dt>Já feito</dt>
                <dd>
                  {formatNumber(d)} ({formatNumber(result.percentDone, 0)}%)
                </dd>
              </div>
              <div className="stat">
                <dt>Falta</dt>
                <dd data-testid="falta">{formatNumber(result.remaining)}</dd>
              </div>
              <div className="stat">
                <dt>Dias restantes</dt>
                <dd data-testid="dias-restantes">
                  {result.remainingDays} <span className="small muted">{dayWord}</span>
                </dd>
              </div>
            </dl>
            <div
              className="progress"
              role="progressbar"
              aria-label="Progresso da meta do mês"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(result.percentDone)}
            >
              <div style={{ width: `${result.percentDone}%` }} />
            </div>
            <p className="hint" style={{ marginTop: 8 }}>
              Os dias restantes contam a partir de hoje, inclusive. Feriados não são descontados.
            </p>
          </>
        )}
      </section>

      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice ok" role="status">
          {message}
        </p>
      )}

      <section className="card" aria-labelledby="meta-mes">
        <h2 id="meta-mes">Meta do mês</h2>
        <form onSubmit={(e) => void handleSave(e)} noValidate>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="rt-target">Meta do mês (número)</label>
              <input id="rt-target" type="text" inputMode="decimal" value={target} onChange={(e) => edit(setTarget)(e.target.value)} placeholder="100" />
            </div>
            <div className="field">
              <label htmlFor="rt-unit">Unidade</label>
              <input id="rt-unit" type="text" value={unit} onChange={(e) => edit(setUnit)(e.target.value)} placeholder="vendas, R$, páginas…" />
            </div>
            <div className="field">
              <label htmlFor="rt-done">Quanto já foi feito</label>
              <input id="rt-done" type="text" inputMode="decimal" value={done} onChange={(e) => edit(setDone)(e.target.value)} placeholder="0" />
            </div>
          </div>
          <fieldset>
            <legend>Contar os dias restantes em</legend>
            <div className="segmented">
              <label>
                <input type="radio" name="rt-days" value="business" checked={dayCount === 'business'} onChange={() => edit(setDayCount)('business')} />
                <span>Dias úteis (seg. a sex.)</span>
              </label>
              <label>
                <input type="radio" name="rt-days" value="calendar" checked={dayCount === 'calendar'} onChange={() => edit(setDayCount)('calendar')} />
                <span>Dias corridos</span>
              </label>
            </div>
          </fieldset>
          <div className="row">
            <button type="submit" className="btn">
              Salvar
            </button>
            {dirty && <span className="small muted">Alterações não salvas.</span>}
          </div>
        </form>
      </section>

      <section className="card" aria-labelledby="lancar">
        <h2 id="lancar">Lançar o que fiz</h2>
        <form onSubmit={(e) => void handleIncrement(e)} className="row" noValidate>
          <div style={{ flex: '1 1 160px' }}>
            <label htmlFor="rt-increment">Somar ao feito</label>
            <input id="rt-increment" type="text" inputMode="decimal" value={increment} onChange={(e) => setIncrement(e.target.value)} placeholder="Ex.: 3" />
          </div>
          <button type="submit" className="btn secondary" style={{ alignSelf: 'flex-end' }}>
            Somar
          </button>
        </form>
      </section>
    </>
  );
}
