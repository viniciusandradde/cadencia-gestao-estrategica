import { useEffect, useRef, useState } from 'react';
import { formatTimer, REVIEW_DURATION_SECONDS } from '../lib/review';

/** Cronômetro opcional de 15 minutos para a Avaliação Semanal. */
export function Timer({ seconds = REVIEW_DURATION_SECONDS }: { seconds?: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, Math.round(((endAt.current ?? Date.now()) - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        endAt.current = null;
        if ('vibrate' in navigator) navigator.vibrate?.(300);
      }
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [running]);

  const start = () => {
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
    endAt.current = null;
  };
  const reset = () => {
    pause();
    setRemaining(seconds);
  };
  const finished = remaining === 0;

  return (
    <div className="card" role="group" aria-labelledby="cronometro-titulo">
      <div className="spread">
        <div>
          <h2 id="cronometro-titulo">Cronômetro (opcional)</h2>
          <div className={`timer${finished ? ' finished' : ''}`} aria-hidden="true">
            {formatTimer(remaining)}
          </div>
          <p className="visually-hidden" aria-live="polite">
            {finished ? 'Tempo esgotado: 15 minutos.' : running ? 'Cronômetro rodando.' : ''}
          </p>
          {finished && <p className="small">Tempo esgotado. Feche a avaliação com a decisão da semana.</p>}
        </div>
        <div className="row">
          {running ? (
            <button type="button" className="btn secondary" onClick={pause}>
              Pausar
            </button>
          ) : (
            <button type="button" className="btn secondary" onClick={start} disabled={finished}>
              {remaining === seconds ? 'Iniciar 15 min' : 'Continuar'}
            </button>
          )}
          <button type="button" className="btn ghost" onClick={reset}>
            Zerar
          </button>
        </div>
      </div>
    </div>
  );
}
