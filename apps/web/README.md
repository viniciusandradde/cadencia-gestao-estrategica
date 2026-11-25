# Cadência · app web (PWA)

Primeira versão do núcleo "gerir a si": **Caderno de Metas** (objetivos, ações mensuráveis, semana e transporte), **Teste de Realidade**, **Avaliação Semanal**, **Registro de Insights**, **Backup** e **Início**.

O app é **local primeiro**: não tem servidor, conta, analytics nem chamadas de rede. Tudo fica no **IndexedDB** do navegador do aparelho. Funciona offline depois do primeiro acesso e pode ser instalado na tela inicial.

## Como rodar

Requer Node.js 20.19 ou mais novo.

```bash
cd apps/web
npm install        # instala as dependências (use npm ci para seguir o package-lock.json à risca)
npm run dev        # servidor de desenvolvimento em http://localhost:5173/
npm test           # testes (Vitest) da lógica em src/lib e do banco em src/db
npm run build      # checagem de tipos + build de produção em dist/
npm run preview    # serve o dist/ em http://localhost:4173/cadencia-gestao-estrategica/
```

O build usa o caminho `/cadencia-gestao-estrategica/` (o do GitHub Pages). Para outro caminho, defina `BASE_PATH`, por exemplo `BASE_PATH=/ npm run build` para um domínio próprio. No desenvolvimento o caminho é `/`.

## Onde os dados ficam

- No **IndexedDB deste navegador, neste aparelho** (banco `cadencia`). Outro navegador ou outro aparelho começa vazio.
- Limpar os dados do site, desinstalar o navegador ou perder o aparelho **apaga tudo**. No iPhone e no iPad, o Safari pode apagar os dados de sites não instalados que ficam sem uso por alguns dias: instale o app na tela inicial.
- Em Configurações, o app pode pedir ao navegador **armazenamento persistente** (diminui o risco de limpeza automática, mas não substitui o backup).

## Backup (responsabilidade do usuário)

- **Exportar:** Configurações → Backup → *Exportar backup (JSON)*. Baixa `cadencia-backup-AAAA-MM-DD.json` com todos os dados. Guarde o arquivo fora do aparelho.
- **Importar:** Configurações → Backup → escolha o arquivo. O app valida o formato, a versão, os campos e as referências, mostra o que tem no arquivo e o que existe hoje no aparelho, e **só substitui depois da confirmação**. A importação troca todos os dados de uma vez (não mescla).
- O Início mostra a data do último backup exportado e destaca o aviso quando passa de 7 dias.

## Estrutura

```
src/lib/     regras puras e testadas: semana ISO, Teste de Realidade, limite e transporte, backup
src/db/      banco Dexie (IndexedDB), operações e consultas reativas
src/pages/   telas: Início, Semana, Objetivos e ações, Teste de Realidade, Avaliação, Insights, Configurações
public/      ícone (SVG e PNGs gerados a partir dele)
```

Parâmetros do método ficam em Configurações, não no código: limite de ações por semana (padrão 5, com aviso ao passar), dia da Avaliação Semanal (padrão sexta) e contagem de dias do Teste de Realidade (padrão dias úteis).

## Deploy (GitHub Pages)

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions** (uma vez só).
2. Todo push na **main** que altere `apps/web/**` (ou o próprio workflow) roda `.github/workflows/pages.yml`: `npm ci`, `npm test`, `npm run build` e publica **somente** `apps/web/dist`. Também dá para rodar manualmente em Actions → *Publicar no GitHub Pages* → *Run workflow*.
3. Pushes em outras branches rodam `.github/workflows/verificar.yml` (testes e build, sem publicar), para conferir antes do merge.

O endereço fica em `https://<usuário>.github.io/cadencia-gestao-estrategica/`. As telas usam navegação por hash (`#/semana`), porque o Pages não reescreve rotas.
