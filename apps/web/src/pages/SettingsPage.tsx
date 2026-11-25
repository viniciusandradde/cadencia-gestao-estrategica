import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { DataNotice } from '../components/DataNotice';
import { db } from '../db/db';
import { useSettings } from '../db/hooks';
import { exportAll, replaceAll, saveSettings } from '../db/repo';
import { useLive } from '../db/useLive';
import { TABLES, TABLE_LABEL, backupFileName, parseBackup, serializeBackup, type BackupCounts, type BackupFile } from '../lib/backup';
import { WEEKDAYS, formatTimestampBR } from '../lib/dates';
import type { DayCount, IsoWeekday } from '../lib/types';
import { MAX_WEEKLY_LIMIT, MIN_WEEKLY_LIMIT, normalizeWeeklyLimit } from '../lib/week';

const APP_VERSION = '0.1.0';

type Persistence = 'unknown' | 'granted' | 'not-granted' | 'unsupported';

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function CountsList({ counts }: { counts: BackupCounts }) {
  return (
    <ul className="small">
      {TABLES.filter((t) => t !== 'settings').map((t) => (
        <li key={t}>
          {TABLE_LABEL[t]}: {counts[t]}
        </li>
      ))}
    </ul>
  );
}

export function SettingsPage() {
  const settings = useSettings();
  const [limit, setLimit] = useState(String(settings.weeklyActionLimit));
  const [weekday, setWeekday] = useState<IsoWeekday>(settings.reviewWeekday);
  const [dayCount, setDayCount] = useState<DayCount>(settings.defaultDayCount);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [persistence, setPersistence] = useState<Persistence>('unknown');
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const [pending, setPending] = useState<{ fileName: string; backup: BackupFile; counts: BackupCounts } | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const currentCounts = useLive(
    async (): Promise<BackupCounts> => ({
      goals: await db.goals.count(),
      actions: await db.actions.count(),
      weekEntries: await db.weekEntries.count(),
      realityTests: await db.realityTests.count(),
      weeklyReviews: await db.weeklyReviews.count(),
      insights: await db.insights.count(),
      settings: await db.settings.count(),
    }),
    [],
  );

  // Atualiza o formulário quando as configurações salvas carregam ou mudam.
  useEffect(() => {
    setLimit(String(settings.weeklyActionLimit));
    setWeekday(settings.reviewWeekday);
    setDayCount(settings.defaultDayCount);
  }, [settings.weeklyActionLimit, settings.reviewWeekday, settings.defaultDayCount]);

  useEffect(() => {
    if (!navigator.storage?.persisted) {
      setPersistence('unsupported');
      return;
    }
    void navigator.storage.persisted().then((p) => setPersistence(p ? 'granted' : 'not-granted'));
  }, []);

  async function requestPersistence() {
    if (!navigator.storage?.persist) return;
    const granted = await navigator.storage.persist();
    setPersistence(granted ? 'granted' : 'not-granted');
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeWeeklyLimit(limit);
    await saveSettings({ weeklyActionLimit: normalized, reviewWeekday: weekday, defaultDayCount: dayCount });
    setLimit(String(normalized));
    setSettingsMsg('Configurações salvas.');
  }

  async function handleExport() {
    const now = new Date();
    const file = await exportAll(now);
    downloadText(backupFileName(now), serializeBackup(file));
    await saveSettings({ lastBackupAt: now.toISOString() });
    setBackupMsg(`Backup exportado (${backupFileName(now)}). Guarde o arquivo fora deste aparelho.`);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPending(null);
    setImportErrors(null);
    setBackupMsg(null);
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setImportErrors(result.errors);
      return;
    }
    setPending({ fileName: file.name, backup: result.backup, counts: result.counts });
  }

  async function confirmImport() {
    if (!pending) return;
    await replaceAll(pending.backup.data);
    setPending(null);
    setFileInputKey((k) => k + 1);
    setBackupMsg('Backup importado. Os dados deste aparelho foram substituídos pelos do arquivo.');
  }

  function cancelImport() {
    setPending(null);
    setImportErrors(null);
    setFileInputKey((k) => k + 1);
  }

  return (
    <>
      <header className="page-header">
        <h1>Configurações</h1>
        <p>Parâmetros do método e backup dos seus dados.</p>
      </header>

      <DataNotice lastBackupAt={settings.lastBackupAt} showLink={false} />

      <section className="card" aria-labelledby="backup">
        <h2 id="backup">Backup</h2>
        <p>
          O backup é um arquivo JSON com tudo o que está no app. Exporte com frequência e guarde em outro lugar (computador,
          nuvem ou e-mail para você mesmo).
        </p>
        <p className="muted small">
          Último backup exportado: {settings.lastBackupAt ? formatTimestampBR(settings.lastBackupAt) : 'nunca'}.
        </p>
        <button type="button" className="btn" onClick={() => void handleExport()}>
          Exportar backup (JSON)
        </button>
        {backupMsg && (
          <p className="notice ok" role="status" style={{ marginTop: 12 }}>
            {backupMsg}
          </p>
        )}

        <h3 style={{ marginTop: 20 }}>Importar backup</h3>
        <p className="small muted">
          Importar <b>substitui todos os dados</b> deste aparelho pelos do arquivo. O app confere o arquivo e pede
          confirmação antes.
        </p>
        <div className="field">
          <label htmlFor="import-file">Arquivo de backup (.json)</label>
          <input key={fileInputKey} id="import-file" type="file" accept="application/json,.json" onChange={(e) => void handleFile(e)} />
        </div>
        {importErrors && (
          <div className="notice error" role="alert">
            <strong>Este arquivo não pode ser importado.</strong>
            <ul className="small">
              {importErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {pending && (
          <div className="notice" role="alert">
            <strong>Confirme a substituição dos dados</strong>
            <p className="small">
              Arquivo: {pending.fileName}
              {pending.backup.exportedAt ? ` · exportado em ${formatTimestampBR(pending.backup.exportedAt)}` : ''}.
            </p>
            <div className="grid-2">
              <div>
                <p className="small">
                  <b>No arquivo:</b>
                </p>
                <CountsList counts={pending.counts} />
              </div>
              {currentCounts && (
                <div>
                  <p className="small">
                    <b>Neste aparelho agora (será apagado):</b>
                  </p>
                  <CountsList counts={currentCounts} />
                </div>
              )}
            </div>
            <div className="row">
              <button type="button" className="btn danger" onClick={() => void confirmImport()}>
                Substituir meus dados por este backup
              </button>
              <button type="button" className="btn ghost" onClick={cancelImport}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="parametros">
        <h2 id="parametros">Parâmetros</h2>
        <form onSubmit={(e) => void handleSaveSettings(e)}>
          <div className="field">
            <label htmlFor="cfg-limit">
              Limite de ações por semana
              <span className="hint">
                Comece baixo e ajuste pela Avaliação Semanal. Passar do limite gera um aviso, não um bloqueio. ({MIN_WEEKLY_LIMIT} a{' '}
                {MAX_WEEKLY_LIMIT}; padrão 5.)
              </span>
            </label>
            <input
              id="cfg-limit"
              type="number"
              min={MIN_WEEKLY_LIMIT}
              max={MAX_WEEKLY_LIMIT}
              step={1}
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                setSettingsMsg(null);
              }}
              style={{ maxWidth: 140 }}
            />
          </div>
          <div className="field">
            <label htmlFor="cfg-weekday">Dia da Avaliação Semanal</label>
            <select
              id="cfg-weekday"
              value={weekday}
              onChange={(e) => {
                setWeekday(Number(e.target.value) as IsoWeekday);
                setSettingsMsg(null);
              }}
            >
              {([1, 2, 3, 4, 5, 6, 7] as IsoWeekday[]).map((d) => (
                <option key={d} value={d}>
                  {WEEKDAYS[d]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cfg-daycount">Contagem padrão no Teste de Realidade</label>
            <select
              id="cfg-daycount"
              value={dayCount}
              onChange={(e) => {
                setDayCount(e.target.value as DayCount);
                setSettingsMsg(null);
              }}
            >
              <option value="business">Dias úteis (segunda a sexta)</option>
              <option value="calendar">Dias corridos</option>
            </select>
          </div>
          <button type="submit" className="btn">
            Salvar configurações
          </button>
          {settingsMsg && (
            <p className="notice ok" role="status" style={{ marginTop: 12 }}>
              {settingsMsg}
            </p>
          )}
        </form>
      </section>

      <section className="card" aria-labelledby="armazenamento">
        <h2 id="armazenamento">Armazenamento neste navegador</h2>
        {persistence === 'granted' && <p>O navegador marcou os dados do Cadência como persistentes (não apaga sozinho para liberar espaço).</p>}
        {persistence === 'not-granted' && (
          <>
            <p>
              O navegador ainda pode apagar os dados para liberar espaço. Instalar o app na tela inicial e pedir
              armazenamento persistente reduz esse risco. Mesmo assim, faça backup.
            </p>
            <button type="button" className="btn secondary" onClick={() => void requestPersistence()}>
              Pedir armazenamento persistente
            </button>
          </>
        )}
        {persistence === 'unsupported' && <p>Este navegador não informa se os dados são persistentes. Faça backup com frequência.</p>}
        {persistence === 'unknown' && <p className="muted">Verificando…</p>}
      </section>

      <section className="card" aria-labelledby="sobre">
        <h2 id="sobre">Sobre</h2>
        <p className="small">
          Cadência {APP_VERSION}. Funciona offline depois do primeiro acesso. Sem servidor, sem conta, sem analytics e sem
          chamadas de rede: tudo fica no IndexedDB deste navegador.
        </p>
      </section>
    </>
  );
}
