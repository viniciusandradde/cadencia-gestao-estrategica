import { useEffect, useRef, type ReactNode } from 'react';
import { GoalsPage } from './pages/GoalsPage';
import { HomePage } from './pages/HomePage';
import { InsightsPage } from './pages/InsightsPage';
import { RealityPage } from './pages/RealityPage';
import { ReviewPage } from './pages/ReviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { WeekPage } from './pages/WeekPage';
import { href, useRoute, type Route } from './router';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

interface NavItem {
  route: Route;
  label: string;
  active: Route[];
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { route: 'inicio', label: 'Início', active: ['inicio'], icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  {
    route: 'semana',
    label: 'Metas',
    active: ['semana', 'objetivos'],
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  },
  {
    route: 'realidade',
    label: 'Realidade',
    active: ['realidade'],
    icon: (
      <>
        <path d="M4 18a8 8 0 1 1 16 0" />
        <path d="m12 18 4-5" />
      </>
    ),
  },
  {
    route: 'avaliacao',
    label: 'Avaliação',
    active: ['avaliacao'],
    icon: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4h6v3H9zM9 13l2 2 4-4" />
      </>
    ),
  },
  {
    route: 'insights',
    label: 'Insights',
    active: ['insights'],
    icon: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
      </>
    ),
  },
];

const TITLES: Record<Route, string> = {
  inicio: 'Início',
  semana: 'Caderno de Metas · Semana',
  objetivos: 'Caderno de Metas · Objetivos e ações',
  realidade: 'Teste de Realidade',
  avaliacao: 'Avaliação Semanal',
  insights: 'Registro de Insights',
  configuracoes: 'Configurações',
};

function Page({ route }: { route: Route }) {
  switch (route) {
    case 'semana':
      return <WeekPage />;
    case 'objetivos':
      return <GoalsPage />;
    case 'realidade':
      return <RealityPage />;
    case 'avaliacao':
      return <ReviewPage />;
    case 'insights':
      return <InsightsPage />;
    case 'configuracoes':
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
}

export function App() {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    document.title = `${TITLES[route]} · Cadência`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [route]);

  return (
    <>
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus()}>
        Pular para o conteúdo
      </button>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href={href('inicio')}>
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="28" height="28" />
            Cadência
          </a>
          <a
            className="icon-link"
            href={href('configuracoes')}
            aria-label="Configurações e backup"
            aria-current={route === 'configuracoes' ? 'page' : undefined}
          >
            <Icon>
              <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
              <circle cx="15" cy="6" r="2" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="17" cy="18" r="2" />
            </Icon>
          </a>
        </div>
      </header>
      <nav className="tabs" aria-label="Principal">
        <ul>
          {NAV.map((item) => (
            <li key={item.route}>
              <a href={href(item.route)} aria-current={item.active.includes(route) ? 'page' : undefined}>
                <Icon>{item.icon}</Icon>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main id="conteudo" ref={mainRef} tabIndex={-1}>
        <Page route={route} />
      </main>
    </>
  );
}
