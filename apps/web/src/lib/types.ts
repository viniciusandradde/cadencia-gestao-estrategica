// Tipos de domínio. Nomes em inglês no código, rótulos em pt-BR na interface
// (mesma convenção de docs/04-MODELO-DE-DADOS.md).

/** Data civil no formato AAAA-MM-DD (sem hora nem fuso). */
export type ISODate = string;
/** Semana ISO no formato AAAA-Www (segunda a domingo), ex.: 2026-W48. */
export type WeekKey = string;
/** Mês no formato AAAA-MM. */
export type MonthKey = string;

export type GoalStatus = 'active' | 'done';

/** Objetivo do Caderno de Metas (tabela `goal`). */
export interface Goal {
  id: string;
  text: string;
  /** O porquê do objetivo. */
  why: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export type ActionStatus = 'open' | 'done';
/** 1 = baixo, 2 = médio, 3 = alto. */
export type Level = 1 | 2 | 3;

/** Ação mensurável ligada a um objetivo (tabela `action`): verbo, número, prazo. */
export interface Action {
  id: string;
  goalId: string;
  verb: string;
  quantity: number;
  /** O quê (complemento): "clientes novos", "páginas", "km". */
  object: string;
  dueDate: ISODate;
  /** Impacto da ação (critério principal de prioridade). */
  impact: Level;
  /** Pedido da liderança (critério principal de prioridade). */
  leaderRequest: boolean;
  /** Facilidade: só desempata. */
  ease: Level;
  status: ActionStatus;
  /** Quantas vezes a ação foi transportada para a semana seguinte. */
  carriedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Status de uma ação dentro de uma semana: feita, parcial, pendente. */
export type WeekStatus = 'done' | 'partial' | 'pending';

/** Ação escolhida para uma semana. Guarda o histórico de cada semana e do transporte. */
export interface WeekEntry {
  id: string;
  week: WeekKey;
  actionId: string;
  status: WeekStatus;
  /** Semana de onde a ação veio por transporte (ou null). */
  carriedFromWeek: WeekKey | null;
  /** Semana para onde a ação foi transportada (ou null). */
  carriedToWeek: WeekKey | null;
  createdAt: string;
  updatedAt: string;
}

export type DayCount = 'business' | 'calendar';

/** Teste de Realidade de um mês (meta do mês, feito, contagem de dias). */
export interface RealityTest {
  id: string;
  month: MonthKey;
  target: number;
  unit: string;
  done: number;
  dayCount: DayCount;
  updatedAt: string;
}

export interface ReviewItem {
  actionId: string;
  label: string;
  status: WeekStatus;
}

export type ReviewDecision = 'adjust' | 'accelerate';

/** Avaliação Semanal de 15 minutos. Uma por semana. */
export interface WeeklyReview {
  id: string;
  week: WeekKey;
  date: ISODate;
  items: ReviewItem[];
  learned: string;
  notDone: string;
  impactMonth: string;
  impactYear: string;
  decision: ReviewDecision | null;
  decisionNote: string;
  createdAt: string;
  updatedAt: string;
}

export type InsightKind = 'start' | 'keep' | 'stop' | 'accelerate';

/** Entrada do Registro de Insights. */
export interface Insight {
  id: string;
  date: ISODate;
  kind: InsightKind;
  text: string;
  applied: boolean;
  appliedAt: string | null;
  createdAt: string;
}

/** 1 = segunda ... 7 = domingo (ISO 8601). */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Settings {
  id: 'main';
  weeklyActionLimit: number;
  reviewWeekday: IsoWeekday;
  defaultDayCount: DayCount;
  lastBackupAt: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  weeklyActionLimit: 5,
  reviewWeekday: 5,
  defaultDayCount: 'business',
  lastBackupAt: null,
};
