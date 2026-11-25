import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Caminho do site no GitHub Pages (https://<usuário>.github.io/cadencia-gestao-estrategica/).
// O workflow pode sobrescrever com BASE_PATH (ex.: domínio próprio usa "/").
const DEFAULT_BASE = '/cadencia-gestao-estrategica/';

function normalizeBase(value: string | undefined): string {
  const raw = (value ?? '').trim();
  if (raw === '') return DEFAULT_BASE;
  const trimmed = raw.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

// Política de segurança só no build: o app não chama a rede nem carrega nada de fora.
// (No desenvolvimento o Vite precisa de script inline para o recarregamento rápido.)
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'cadencia-csp',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace(
        /(<meta charset="UTF-8" \/>)/i,
        `$1\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      ),
  };
}

export default defineConfig(({ command, isPreview }) => {
  // Desenvolvimento usa "/"; build e preview usam o caminho de produção.
  const base = command === 'build' || isPreview ? normalizeBase(process.env.BASE_PATH) : '/';

  return {
    base,
    plugins: [
      react(),
      contentSecurityPolicy(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        // Ícones e demais arquivos de public/ já entram pelo globPatterns abaixo.
        includeManifestIcons: false,
        manifest: {
          id: base,
          name: 'Cadência · gestão pessoal',
          short_name: 'Cadência',
          description:
            'Caderno de Metas, Teste de Realidade, Avaliação Semanal e Registro de Insights. Os dados ficam só neste aparelho.',
          lang: 'pt-BR',
          dir: 'ltr',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'any',
          background_color: '#f6f7f9',
          theme_color: '#1f4e5f',
          categories: ['productivity'],
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png}'],
          cleanupOutdatedCaches: true,
          navigateFallback: 'index.html',
        },
        devOptions: { enabled: false },
      }),
    ],
    build: {
      target: 'es2022',
      sourcemap: false,
    },
  };
});
