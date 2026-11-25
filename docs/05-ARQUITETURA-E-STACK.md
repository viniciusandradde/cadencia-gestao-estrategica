# 05 · Arquitetura e stack (proposta)

**Status:** IN_REVIEW · Decisões abertas para o responsável (marcadas **ADR**). A recomendação prioriza **poucos componentes**, **dados protegidos** e **impressão de qualidade**.

## 1. Requisitos que moldam a arquitetura
- **Multiespaço com isolamento forte** de dados de pessoas.
- **Mobile primeiro** (mapa de 15 minutos, feedback rápido, fotos de fichas) e **boa impressão em A4**.
- **PDF de fichas** em branco e preenchidas, com QR code e código.
- **Auditoria** completa e trilha de consentimento (LGPD).
- **Lembretes** (alarme de 15 min, prazos de acompanhamento e de feedback).
- Evoluir de uso próprio para produto, se o jurídico liberar.

## 2. Stack recomendada
| Camada | Escolha | Motivo |
|---|---|---|
| Linguagem | TypeScript | um só idioma no servidor e no cliente |
| Cliente (web e APK) | React + TypeScript com Vite, empacotado com **Capacitor** para Android | uma base de código gera o site e o APK, com **notificações locais nativas** |
| API | Hono (TypeScript) sobre PostgreSQL | API simples e tipada, atende web e APK |
| Banco | PostgreSQL | relacional, JSON onde precisa, **Row Level Security** |
| Acesso a dados | Drizzle ORM ou Prisma | migrações versionadas, tipos |
| Autenticação | Better Auth ou Auth.js, com e-mail, link mágico e 2FA | convites por papel |
| PDF das fichas | modelos HTML/CSS de impressão renderizados por navegador sem tela (Playwright) | o mesmo layout vale para tela, impressão e PDF |
| Arquivos | armazenamento de objetos compatível com S3 (Cloudflare R2 ou MinIO) | anexos e PDFs, links assinados com expiração |
| Tarefas e lembretes | fila simples (pg-boss sobre o próprio PostgreSQL) | evita outro serviço |
| Notificações | notificações locais do Android (Capacitor) e e-mail | alarme de 15 min confiável no APK |
| Observabilidade | logs estruturados e alerta de erros | operação mínima |
| Hospedagem | VPS com Docker Compose | já é domínio da VSA (curso de servidor e containers) |

**Plataformas (decisão de 25/11/2026):** web e **APK Android**. Como o uso é pessoal, o APK é **instalado direto** (sem loja), assinado com chave própria. O APK resolve o limite do alarme de 15 minutos: as **notificações locais nativas** do Android (com permissão de alarme exato) funcionam com o aparelho bloqueado. No iPhone não há APK; o site instalado como PWA seria a alternativa, com a limitação de notificações. **Offline:** o celular guarda uma fila local e sincroniza ao voltar a internet (um único usuário, sem conflitos complexos).

## 2.1 Primeira versão no GitHub Pages (decisão de 25/11/2026)
O usuário decidiu começar pelo **GitHub Pages**. Como o Pages só serve arquivos estáticos e o endereço é **público**, a primeira versão é um **PWA local primeiro**:
- **Cliente:** o mesmo React + TypeScript + Vite da seção 2, em `apps/web/`, instalável e offline.
- **Dados:** só no navegador do aparelho (IndexedDB). Nada vai para servidor; o site público não contém dado algum do usuário. Backup por **exportar e importar JSON**, responsabilidade do usuário.
- **Publicação:** GitHub Actions compila e publica **somente** `apps/web/dist` (nunca `docs/` nem `referencias/`), a partir de `main`.
- **Escopo:** núcleo de **gerir a si** (Caderno de Metas, Teste de Realidade, Avaliação Semanal, Registro de Insights e backup). Pessoas, equipe e fichas em PDF ficam para depois, porque dependem de sincronização, de dados de terceiros (LGPD) e de PDF no servidor.
- **Limites:** sem sincronização entre celular e computador; limpar os dados do navegador apaga tudo sem backup; o APK (Capacitor) pode reaproveitar o mesmo build depois.
- **Direitos:** o app publicado usa só nomes e textos próprios (ver `07`); mesmo assim, é um endereço público, o que vale lembrar no risco R1 de `01`.

## 3. Segurança e privacidade (desde o dia 1)
- Dados de pessoas **criptografados em repouso** e em trânsito; segredos fora do repositório.
- **RLS por `space_id`**, além do filtro na aplicação.
- **Papéis e permissões** da tabela em `02-PERFIS-E-ESPACOS.md` testados automaticamente.
- **Log de auditoria** de leitura e escrita nas tabelas sensíveis.
- **Consentimento e transparência** registrados por espaço; **exportação e exclusão** de dados do titular.
- **Backup** diário com restauração testada; retenção definida com o jurídico.
- PDF com dado de pessoa: link expira, geração registrada.

## 4. Estrutura do repositório (sugestão)
```
/            README, LICENSE (a definir), CONTRIBUTING
docs/        análise, perfis, módulos, dados, arquitetura, backlog, nomes e fontes, fichas
apps/web/    cliente React (site e base do APK)
apps/api/    API
apps/android/ projeto Capacitor e assinatura do APK
packages/    modelos de ficha (HTML/CSS), esquema do banco, utilitários
infra/       Docker Compose, scripts de implantação e backup
```

## 5. Decisões abertas (ADR)
| # | Decisão | Opções | Recomendação |
|---|---|---|---|
| ADR-1 | Nome do produto e do repositório | ver `README.md` | Cadência |
| ADR-2 | Stack | TypeScript com React/Vite + Capacitor e API Hono; ou Flutter/React Native | a da seção 2 |
| ADR-3 | Notificação de 15 min | notificação local do Android | **resolvida**: notificação local nativa via APK |
| ADR-4 | Hospedagem | VPS própria ou nuvem gerenciada; GitHub Pages | **decidida em 25/11/2026 para a 1ª versão:** **GitHub Pages**, servindo só o app compilado (`apps/web/dist`), sem servidor. A VPS com Docker volta à mesa quando houver sincronização entre aparelhos, PDF no servidor ou dados de outras pessoas |
| ADR-5 | Dados de pessoas: base legal e política de transparência | a definir com advogado | política "parcial" por padrão |
| ADR-6 | Licença do código | proprietária ou aberta | **proprietária, repositório privado** (uso pessoal) |
| ADR-7 | Reconhecimento de fichas escaneadas (OCR) | manual, OCR | manual no MVP; OCR depois |
| ADR-8 | Offline e sincronização | só online; fila local com sincronização; local primeiro | **decidida em 25/11/2026 para a 1ª versão:** **local primeiro**: dados só no aparelho (IndexedDB), app instalável e offline (PWA), backup por exportar e importar JSON. Sincronização fica para depois |
| ADR-9 | Distribuição do APK | loja, ou instalação direta | instalação direta, assinado com chave própria guardada fora do Git |
