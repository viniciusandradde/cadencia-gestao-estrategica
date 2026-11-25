import { describe, expect, it } from 'vitest';
import { filterInsights, sortInsights } from './insights';
import type { Insight } from './types';

const make = (id: string, over: Partial<Insight>): Insight => ({
  id,
  date: '2026-11-25',
  kind: 'start',
  text: id,
  applied: false,
  appliedAt: null,
  createdAt: '2026-11-25T10:00:00.000Z',
  ...over,
});

const list = [
  make('a', { date: '2026-11-20', kind: 'stop' }),
  make('b', { date: '2026-11-25', kind: 'start', applied: true }),
  make('c', { date: '2026-11-25', kind: 'keep', createdAt: '2026-11-25T11:00:00.000Z' }),
  make('d', { date: '2026-11-22', kind: 'accelerate' }),
];

describe('Registro de Insights', () => {
  it('ordena do mais recente para o mais antigo', () => {
    expect(sortInsights(list).map((i) => i.id)).toEqual(['c', 'b', 'd', 'a']);
  });

  it('filtra por tipo e por aplicado', () => {
    expect(filterInsights(list, 'stop', 'all').map((i) => i.id)).toEqual(['a']);
    expect(filterInsights(list, 'all', 'applied').map((i) => i.id)).toEqual(['b']);
    expect(filterInsights(list, 'all', 'open').map((i) => i.id)).toEqual(['c', 'd', 'a']);
    expect(filterInsights(list, 'start', 'open')).toEqual([]);
  });
});
