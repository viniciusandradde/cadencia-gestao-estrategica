// Registro de Insights: ordenação e filtros.
import type { Insight, InsightKind } from './types';

export type KindFilter = 'all' | InsightKind;
export type AppliedFilter = 'all' | 'open' | 'applied';

/** Mais recentes primeiro (data e, no mesmo dia, ordem de registro). */
export function sortInsights(list: readonly Insight[]): Insight[] {
  return [...list].sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export function filterInsights(list: readonly Insight[], kind: KindFilter, applied: AppliedFilter): Insight[] {
  return sortInsights(
    list.filter(
      (i) => (kind === 'all' || i.kind === kind) && (applied === 'all' || (applied === 'applied' ? i.applied : !i.applied)),
    ),
  );
}
