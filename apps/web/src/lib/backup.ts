// Backup: exportar tudo para JSON e validar o arquivo antes de importar.
import { isValidISODate, isValidMonthKey, isValidWeekKey, toLocalISODate } from './dates';
import type { Action, Goal, Insight, RealityTest, Settings, WeekEntry, WeeklyReview } from './types';

export const BACKUP_FORMAT = 'cadencia-backup';
export const BACKUP_VERSION = 1;

export const TABLES = ['goals', 'actions', 'weekEntries', 'realityTests', 'weeklyReviews', 'insights', 'settings'] as const;
export type TableName = (typeof TABLES)[number];

export const TABLE_LABEL: Record<TableName, string> = {
  goals: 'Objetivos',
  actions: 'Ações',
  weekEntries: 'Ações nas semanas',
  realityTests: 'Testes de Realidade',
  weeklyReviews: 'Avaliações semanais',
  insights: 'Insights',
  settings: 'Configurações',
};

export interface BackupData {
  goals: Goal[];
  actions: Action[];
  weekEntries: WeekEntry[];
  realityTests: RealityTest[];
  weeklyReviews: WeeklyReview[];
  insights: Insight[];
  settings: Settings[];
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  app: string;
  exportedAt: string;
  data: BackupData;
}

export type BackupCounts = Record<TableName, number>;

export type ParseResult =
  | { ok: true; backup: BackupFile; counts: BackupCounts }
  | { ok: false; errors: string[] };

export function emptyBackupData(): BackupData {
  return { goals: [], actions: [], weekEntries: [], realityTests: [], weeklyReviews: [], insights: [], settings: [] };
}

export function buildBackup(data: BackupData, now: Date = new Date()): BackupFile {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, app: 'Cadência', exportedAt: now.toISOString(), data };
}

export function serializeBackup(file: BackupFile): string {
  return JSON.stringify(file, null, 2);
}

export function backupFileName(now: Date = new Date()): string {
  return `cadencia-backup-${toLocalISODate(now)}.json`;
}

export function countRecords(data: BackupData): BackupCounts {
  return Object.fromEntries(TABLES.map((t) => [t, data[t].length])) as BackupCounts;
}

// ---- Validação ----

type Check = (v: unknown) => boolean;

const isString: Check = (v) => typeof v === 'string';
const nonEmpty: Check = (v) => typeof v === 'string' && v.trim() !== '';
const isNumber: Check = (v) => typeof v === 'number' && Number.isFinite(v);
const nonNegative: Check = (v) => isNumber(v) && (v as number) >= 0;
const positive: Check = (v) => isNumber(v) && (v as number) > 0;
const isBool: Check = (v) => typeof v === 'boolean';
const isTimestamp: Check = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const oneOf =
  (...values: unknown[]): Check =>
  (v) =>
    values.includes(v);
const nullable =
  (check: Check): Check =>
  (v) =>
    v === null || check(v);
const intBetween =
  (min: number, max: number): Check =>
  (v) =>
    Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

const weekStatus = oneOf('done', 'partial', 'pending');
const isItems: Check = (v) =>
  Array.isArray(v) &&
  v.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      nonEmpty((item as Record<string, unknown>).actionId) &&
      isString((item as Record<string, unknown>).label) &&
      weekStatus((item as Record<string, unknown>).status),
  );

const SCHEMAS: Record<TableName, Record<string, Check>> = {
  goals: {
    id: nonEmpty,
    text: nonEmpty,
    why: isString,
    status: oneOf('active', 'done'),
    createdAt: isTimestamp,
    updatedAt: isTimestamp,
  },
  actions: {
    id: nonEmpty,
    goalId: nonEmpty,
    verb: nonEmpty,
    quantity: positive,
    object: isString,
    dueDate: isValidISODate,
    impact: oneOf(1, 2, 3),
    leaderRequest: isBool,
    ease: oneOf(1, 2, 3),
    status: oneOf('open', 'done'),
    carriedCount: intBetween(0, 10_000),
    createdAt: isTimestamp,
    updatedAt: isTimestamp,
  },
  weekEntries: {
    id: nonEmpty,
    week: isValidWeekKey,
    actionId: nonEmpty,
    status: weekStatus,
    carriedFromWeek: nullable(isValidWeekKey),
    carriedToWeek: nullable(isValidWeekKey),
    createdAt: isTimestamp,
    updatedAt: isTimestamp,
  },
  realityTests: {
    id: nonEmpty,
    month: isValidMonthKey,
    target: nonNegative,
    unit: isString,
    done: nonNegative,
    dayCount: oneOf('business', 'calendar'),
    updatedAt: isTimestamp,
  },
  weeklyReviews: {
    id: nonEmpty,
    week: isValidWeekKey,
    date: isValidISODate,
    items: isItems,
    learned: isString,
    notDone: isString,
    impactMonth: isString,
    impactYear: isString,
    decision: nullable(oneOf('adjust', 'accelerate')),
    decisionNote: isString,
    createdAt: isTimestamp,
    updatedAt: isTimestamp,
  },
  insights: {
    id: nonEmpty,
    date: isValidISODate,
    kind: oneOf('start', 'keep', 'stop', 'accelerate'),
    text: nonEmpty,
    applied: isBool,
    appliedAt: nullable(isTimestamp),
    createdAt: isTimestamp,
  },
  settings: {
    id: oneOf('main'),
    weeklyActionLimit: intBetween(1, 20),
    reviewWeekday: intBetween(1, 7),
    defaultDayCount: oneOf('business', 'calendar'),
    lastBackupAt: nullable(isTimestamp),
  },
};

const MAX_ERRORS = 20;

/** Lê o texto do arquivo, valida e devolve os dados limpos (só os campos conhecidos). */
export function parseBackup(text: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['O arquivo não é um JSON válido.'] };
  }
  return validateBackup(value);
}

export function validateBackup(value: unknown): ParseResult {
  const errors: string[] = [];
  const add = (msg: string) => {
    errors.push(msg);
  };

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ok: false, errors: ['O arquivo não tem o formato de backup do Cadência.'] };
  }
  const root = value as Record<string, unknown>;
  if (root.format !== BACKUP_FORMAT) {
    return { ok: false, errors: ['O arquivo não é um backup do Cadência (campo "format" ausente ou diferente).'] };
  }
  if (!Number.isInteger(root.version) || (root.version as number) < 1) {
    return { ok: false, errors: ['Versão do backup inválida.'] };
  }
  if ((root.version as number) > BACKUP_VERSION) {
    return {
      ok: false,
      errors: [`Este backup é de uma versão mais nova do app (versão ${String(root.version)}). Atualize o app e tente de novo.`],
    };
  }
  if (typeof root.data !== 'object' || root.data === null || Array.isArray(root.data)) {
    return { ok: false, errors: ['O backup não tem a seção "data".'] };
  }
  const rawData = root.data as Record<string, unknown>;
  const data = emptyBackupData();

  for (const table of TABLES) {
    const rows = rawData[table];
    if (rows === undefined) continue; // tabela ausente = vazia
    if (!Array.isArray(rows)) {
      add(`${TABLE_LABEL[table]}: deveria ser uma lista.`);
      continue;
    }
    const schema = SCHEMAS[table];
    const ids = new Set<string>();
    rows.forEach((row, index) => {
      const where = `${TABLE_LABEL[table]}, item ${index + 1}`;
      if (typeof row !== 'object' || row === null || Array.isArray(row)) {
        add(`${where}: não é um registro.`);
        return;
      }
      const record = row as Record<string, unknown>;
      const clean: Record<string, unknown> = {};
      let valid = true;
      for (const [field, check] of Object.entries(schema)) {
        if (!check(record[field])) {
          add(`${where}: campo "${field}" ausente ou inválido.`);
          valid = false;
        } else {
          clean[field] = record[field];
        }
      }
      if (!valid) return;
      const id = clean.id as string;
      if (ids.has(id)) {
        add(`${where}: id repetido (${id}).`);
        return;
      }
      ids.add(id);
      (data[table] as unknown[]).push(clean);
    });
  }

  // Referências e unicidade entre tabelas.
  const goalIds = new Set(data.goals.map((g) => g.id));
  for (const a of data.actions) {
    if (!goalIds.has(a.goalId)) add(`Ação "${a.verb} ${a.quantity} ${a.object}" aponta para um objetivo que não existe no backup.`);
  }
  const actionIds = new Set(data.actions.map((a) => a.id));
  const weekPairs = new Set<string>();
  for (const e of data.weekEntries) {
    if (!actionIds.has(e.actionId)) add(`Ação na semana ${e.week} aponta para uma ação que não existe no backup.`);
    const pair = `${e.week}|${e.actionId}`;
    if (weekPairs.has(pair)) add(`A mesma ação aparece duas vezes na semana ${e.week}.`);
    weekPairs.add(pair);
  }
  const months = new Set<string>();
  for (const r of data.realityTests) {
    if (months.has(r.month)) add(`Mais de um Teste de Realidade para o mês ${r.month}.`);
    months.add(r.month);
  }
  const reviewWeeks = new Set<string>();
  for (const r of data.weeklyReviews) {
    if (reviewWeeks.has(r.week)) add(`Mais de uma Avaliação Semanal para a semana ${r.week}.`);
    reviewWeeks.add(r.week);
  }

  if (errors.length > 0) {
    const shown = errors.slice(0, MAX_ERRORS);
    if (errors.length > MAX_ERRORS) shown.push(`… e mais ${errors.length - MAX_ERRORS} problema(s).`);
    return { ok: false, errors: shown };
  }

  const backup: BackupFile = {
    format: BACKUP_FORMAT,
    version: root.version as number,
    app: typeof root.app === 'string' ? root.app : 'Cadência',
    exportedAt: isTimestamp(root.exportedAt) ? (root.exportedAt as string) : '',
    data,
  };
  return { ok: true, backup, counts: countRecords(data) };
}
