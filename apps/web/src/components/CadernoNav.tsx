import { href, type Route } from '../router';

/** Abas do Caderno de Metas: a semana e os objetivos com ações. */
export function CadernoNav({ current }: { current: Route }) {
  return (
    <nav className="subnav" aria-label="Caderno de Metas">
      <a href={href('semana')} aria-current={current === 'semana' ? 'page' : undefined}>
        Semana
      </a>
      <a href={href('objetivos')} aria-current={current === 'objetivos' ? 'page' : undefined}>
        Objetivos e ações
      </a>
    </nav>
  );
}
