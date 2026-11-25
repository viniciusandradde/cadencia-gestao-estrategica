// Navegação por hash (#/semana): o GitHub Pages não reescreve rotas.
import { useSyncExternalStore } from 'react';

export type Route = 'inicio' | 'semana' | 'objetivos' | 'realidade' | 'avaliacao' | 'insights' | 'configuracoes';

const PATHS: Record<Route, string> = {
  inicio: '#/',
  semana: '#/semana',
  objetivos: '#/objetivos',
  realidade: '#/realidade',
  avaliacao: '#/avaliacao',
  insights: '#/insights',
  configuracoes: '#/configuracoes',
};

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').split(/[/?]/)[0] ?? '';
  const match = (Object.keys(PATHS) as Route[]).find((r) => r !== 'inicio' && r === path);
  return match ?? 'inicio';
}

export function href(route: Route): string {
  return PATHS[route];
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function useRoute(): Route {
  return useSyncExternalStore(
    subscribe,
    () => parseHash(window.location.hash),
    () => 'inicio',
  );
}
