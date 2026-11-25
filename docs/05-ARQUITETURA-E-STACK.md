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
| Aplicação web | Next.js (App Router) como PWA | mobile e desktop com uma base; instalável no celular |
| Banco | PostgreSQL | relacional, JSON onde precisa, **Row Level Security** |
| Acesso a dados | Drizzle ORM ou Prisma | migrações versionadas, tipos |
| Autenticação | Better Auth ou Auth.js, com e-mail, link mágico e 2FA | convites por papel |
| PDF das fichas | modelos HTML/CSS de impressão renderizados por navegador sem tela (Playwright) | o mesmo layout vale para tela, impressão e PDF |
| Arquivos | armazenamento de objetos compatível com S3 (Cloudflare R2 ou MinIO) | anexos e PDFs, links assinados com expiração |
| Tarefas e lembretes | fila simples (pg-boss sobre o próprio PostgreSQL) | evita outro serviço |
| Notificações | e-mail e web push (PWA) | ver limite abaixo |
| Observabilidade | logs estruturados e alerta de erros | operação mínima |
| Hospedagem | VPS com Docker Compose | já é domínio da VSA (curso de servidor e containers) |

**Limite conhecido:** alarme a cada 15 minutos por web push no celular pode falhar com o aparelho bloqueado ou no iPhone sem o app instalado. Alternativa para o MVP: o usuário usa um **alarme repetido do próprio celular**, e o app serve para **anotar** em segundos (botão e widget); notificação nativa fica para depois.

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
apps/web/    aplicação Next.js
packages/    modelos de ficha (HTML/CSS), esquema do banco, utilitários
infra/       Docker Compose, scripts de implantação e backup
```

## 5. Decisões abertas (ADR)
| # | Decisão | Opções | Recomendação |
|---|---|---|---|
| ADR-1 | Nome do produto e do repositório | ver `README.md` | Cadência |
| ADR-2 | Stack | TypeScript/Next.js ou outra | a da seção 2 |
| ADR-3 | Notificação de 15 min | web push, alarme do celular, app nativo | alarme do celular no MVP |
| ADR-4 | Hospedagem | VPS própria ou nuvem gerenciada | VPS com Docker, backup externo |
| ADR-5 | Dados de pessoas: base legal e política de transparência | a definir com advogado | política "parcial" por padrão |
| ADR-6 | Licença do código | proprietária ou aberta | proprietária até o jurídico concluir a questão do método |
| ADR-7 | Reconhecimento de fichas escaneadas (OCR) | manual, OCR | manual no MVP; OCR depois |
